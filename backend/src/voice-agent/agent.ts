import dotenv from "dotenv";
import { z } from "zod";
import * as google from "@livekit/agents-plugin-google";
import {
  type JobContext,
  ServerOptions,
  cli,
  defineAgent,
  tool,
  voice,
  ToolFlag,
  AgentSessionEventTypes,
  logMetrics,
} from "@livekit/agents";
import {
  Behavior,
  FunctionResponseScheduling,
  ActivityHandling,
  TurnCoverage,
  StartSensitivity,
  EndSensitivity,
} from "@google/genai";
import { NAVIGABLE_ROUTES_DESCRIPTION, isNavigableRoute } from "../ai/tools";
import { sectionsForRoute, stripLocale } from "../ai/pageSections";
import { buildVoiceInstructions } from "../ai/prompt";
import { CONSULTATION_FIELD_KEYS, REQUIRED_CONSULTATION_FIELDS, type ConsultationField } from "../ai/consultationFields";

dotenv.config();

/** RCM facts + behavior rules live in one shared file — see ../ai/prompt.ts. */
const INSTRUCTIONS = buildVoiceInstructions(NAVIGABLE_ROUTES_DESCRIPTION);

/** Spoken immediately via session.say() — expansive greeting with Dr. Dylan persona. */
const WELCOME_MESSAGE =
  "Hi! I'm Dr. Dylan, your senior Revenue Cycle consultant at NIVREN. NIVREN is an advanced, technology-driven Healthcare Revenue Cycle Management and Medical Billing partner. We help physician practices, clinics, and hospital networks eliminate claim denials, streamline certified medical coding, accelerate AR recovery, and maximize overall practice revenue. What specific area of your revenue cycle can I help you with today?";

interface ConsultationState {
  name?: string;
  phone?: string;
  email?: string;
  service?: string;
  message?: string;
  confirmed: boolean;
}

import { ConversationController, type ConversationState } from "../ai/conversationController";

export interface AgentAction {
  id: string;
  generationId: number;
  type:
    | "navigate"
    | "scroll"
    | "scroll_page"
    | "start_smooth_scroll"
    | "stop_scroll"
    | "set_theme"
    | "set_language"
    | "end_session"
    | "update_form"
    | "consultation_started"
    | "consultation_confirmed"
    | "consultation_cancelled"
    | "agent_speaking"
    | "consultation_requested"
    | "cancel_action"
    | "interrupt"
    | "conversation_state";
  priority?: number;
  timestamp: number;
  interruptible?: boolean;
  path?: string;
  sectionId?: string;
  amount?: number;
  direction?: "down" | "up";
  speed?: "slow" | "normal" | "fast";
  theme?: "dark" | "light";
  locale?: "en" | "hi" | "ar";
  field?: ConsultationField;
  value?: string;
  isSpeaking?: boolean;
  text?: string;
  targetActionId?: string;
  conversationState?: ConversationState;
  data?: { name: string; phone: string; email?: string; serviceOrSpecialty?: string; message?: string };
}

export default defineAgent({
  entry: async (ctx: JobContext) => {
    // Per-call consultation state
    let consultation: ConsultationState | null = null;

    // Central Conversation Controller
    const controller = new ConversationController((state) => {
      const payload = new TextEncoder().encode(
        JSON.stringify({
          id: `state_${Date.now()}`,
          generationId: state.generationId,
          type: "conversation_state",
          timestamp: Date.now(),
          conversationState: state,
        } as AgentAction)
      );
      ctx.room.localParticipant?.publishData(payload, { reliable: false, topic: "agent-action" });
    });

    function publishAction(
      actionData: Omit<AgentAction, "id" | "generationId" | "timestamp"> & {
        id?: string;
        generationId?: number;
        timestamp?: number;
      }
    ) {
      const action: AgentAction = {
        id: actionData.id || `act_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        generationId: actionData.generationId ?? controller.getGenerationId(),
        timestamp: actionData.timestamp ?? Date.now(),
        ...actionData,
      };
      const payload = new TextEncoder().encode(JSON.stringify(action));
      return ctx.room.localParticipant?.publishData(payload, { reliable: true, topic: "agent-action" });
    }

    function getCurrentRoute(): string | undefined {
      const participant = [...ctx.room.remoteParticipants.values()][0];
      return participant?.attributes?.route;
    }

    function getCurrentLocale(): "en" | "hi" | "ar" {
      const route = getCurrentRoute();
      if (route?.startsWith("/hi")) return "hi";
      if (route?.startsWith("/ar")) return "ar";
      return "en";
    }

    const tools = [
      tool({
        name: "navigate",
        description: `Navigate the website to a specific page immediately. Valid routes: ${NAVIGABLE_ROUTES_DESCRIPTION}`,
        parameters: z.object({
          path: z.string().describe("The exact path to navigate to, e.g. '/rcm', '/contact', '/case-studies', '/who-we-serve'."),
        }),
        flags: ToolFlag.CANCELLABLE,
        execute: async ({ path }) => {
          if (!isNavigableRoute(path)) {
            return `Cannot navigate to ${path}. Valid pages: ${NAVIGABLE_ROUTES_DESCRIPTION}.`;
          }

          const current = getCurrentRoute();
          const currentClean = current ? stripLocale(current) : "";
          const targetClean = stripLocale(path);
          const pageTitle = path.replace(/^\//, "").replace(/-/g, " ") || "home";

          if (currentClean && currentClean === targetClean) {
            return "User is already on this page.";
          }

          controller.onToolStart("navigate");
          await publishAction({ type: "navigate", path, priority: 95, interruptible: false });
          controller.onToolEnd(`Navigated to ${path}`);
          return "Navigation completed.";
        },
      }),

      tool({
        name: "start_consultation",
        description:
          "Start collecting details for a free RCM consultation/assessment request. Call this once, right when the user wants to book a consultation, get a demo, or fill out the contact form.",
        parameters: z.object({}),
        execute: async () => {
          consultation = { confirmed: false };
          controller.onToolStart("start_consultation");
          await publishAction({ type: "consultation_started", priority: 70 });
          controller.onToolEnd("Consultation form opened");
          return "Consultation form started. Ask for the first missing field only — required: name, phone, service. Optional: email, message.";
        },
      }),

      tool({
        name: "update_consultation_field",
        description:
          "Save or correct one field of the in-progress consultation request. Call this every time the user gives a piece of information — once per field, even if several are given in one sentence.",
        parameters: z.object({
          field: z.enum(CONSULTATION_FIELD_KEYS).describe("Which field this value belongs to."),
          value: z.string().describe("The value exactly as the user said it — never invent or guess it."),
        }),
        flags: ToolFlag.CANCELLABLE,
        execute: async ({ field, value }) => {
          if (!consultation) consultation = { confirmed: false };
          consultation[field] = value;
          consultation.confirmed = false;
          controller.onToolStart("update_consultation_field");
          await publishAction({ type: "update_form", field, value, priority: 70 });
          controller.onToolEnd(`Updated ${field}`);
          const missing = REQUIRED_CONSULTATION_FIELDS.filter((f) => !consultation![f]);
          return missing.length > 0
            ? `Saved. Still needed: ${missing.join(", ")}.`
            : "Saved. All required fields are filled — read the full summary back and ask the user to confirm before submitting.";
        },
      }),

      tool({
        name: "get_consultation_state",
        description:
          "Check which consultation fields are already collected. Use this if you're unsure what's already been said — e.g. after a topic change or an interruption — instead of guessing or re-asking everything.",
        parameters: z.object({}),
        execute: async () => {
          if (!consultation) return "No consultation in progress.";
          const filled = CONSULTATION_FIELD_KEYS
            .filter((f) => consultation![f])
            .map((f) => `${f}: ${consultation![f]}`);
          if (filled.length === 0) return "No fields collected yet.";
          return filled.join(", ") + (consultation.confirmed ? " (already confirmed)" : " (not yet confirmed)");
        },
      }),

      tool({
        name: "confirm_consultation",
        description:
          "Record that the user explicitly confirmed the full summary is correct. Only call this after reading back every collected field and the user clearly agreed — a vague 'okay' mid-sentence is not enough.",
        parameters: z.object({}),
        flags: ToolFlag.CANCELLABLE,
        execute: async () => {
          if (!consultation) return "No consultation in progress.";
          const missing = REQUIRED_CONSULTATION_FIELDS.filter((f) => !consultation![f]);
          if (missing.length > 0) return `Cannot confirm yet — still missing: ${missing.join(", ")}.`;
          consultation.confirmed = true;
          controller.onToolStart("confirm_consultation");
          await publishAction({ type: "consultation_confirmed", priority: 80 });
          controller.onToolEnd("Consultation confirmed");
          return "Confirmed. You may now call submit_consultation.";
        },
      }),

      tool({
        name: "submit_consultation",
        description:
          "Actually submit the consultation request. Only call this after confirm_consultation succeeded — never submit without the user's explicit confirmation.",
        parameters: z.object({}),
        flags: ToolFlag.CANCELLABLE,
        execute: async () => {
          if (!consultation?.confirmed) {
            return "Not confirmed yet — read back the details and get explicit confirmation before calling this.";
          }
          const { name, phone, email, service, message } = consultation;
          controller.onToolStart("submit_consultation");
          await publishAction({
            type: "consultation_requested",
            priority: 95,
            data: { name: name!, phone: phone!, email, serviceOrSpecialty: service, message },
          });
          consultation = null;
          controller.onToolEnd("Consultation submitted");
          return `Submitted. Let ${name} know NIVREN's team will reach out shortly.`;
        },
      }),

      tool({
        name: "cancel_consultation",
        description:
          "Abandon an in-progress consultation request without submitting anything — call this the moment the user backs out mid-flow (e.g. 'actually skip this', 'never mind', 'cancel that', 'I don't want to do this right now'). Clears every field collected so far. Never call submit_consultation after this without the user explicitly starting over.",
        parameters: z.object({}),
        flags: ToolFlag.CANCELLABLE,
        execute: async () => {
          if (!consultation) return "No consultation was in progress.";
          consultation = null;
          controller.onToolStart("cancel_consultation");
          await publishAction({ type: "consultation_cancelled", priority: 90 });
          controller.onToolEnd("Consultation cancelled");
          return "Consultation request cancelled — nothing was submitted. Back to normal conversation.";
        },
      }),

      tool({
        name: "list_sections",
        description: "List the section IDs on the current page for in-page navigation.",
        parameters: z.object({}),
        execute: async () => {
          const route = getCurrentRoute();
          if (!route) return "Current page unknown.";
          const sections = sectionsForRoute(route);
          if (sections.length === 0) return "No named sections on this page.";
          return sections.map((s) => `${s.id}: ${s.label}`).join("\n");
        },
      }),

      tool({
        name: "scroll_to_section",
        description:
          "Smoothly scroll directly to a specific section on the current page when user asks to view/open a section (e.g. 'doctors dikhao', 'testimonials pe jao', 'appointment form kholo', 'rcm services dikhao', 'mission section dikhao', 'go to emergency', 'show contact').",
        parameters: z.object({
          sectionId: z.string().describe("The exact section ID on the current page (e.g. 'rcm-services', 'testimonials', 'appointment', 'mission-glance', 'emergency', 'contact-form', 'service-cards')."),
        }),
        flags: ToolFlag.CANCELLABLE,
        execute: async ({ sectionId }) => {
          controller.onToolStart("scroll_to_section");
          await publishAction({ type: "scroll", sectionId, priority: 80 });
          controller.onToolEnd(`Scrolled to section ${sectionId}`);
          return `Smoothly navigated to section ${sectionId}.`;
        },
      }),

      tool({
        name: "start_smooth_scroll",
        description:
          "Continuously and smoothly auto-scroll the webpage with natural acceleration. Use speed 'slow' when user says 'dhire dhire scroll karo', 'slow scroll', 'aram se scroll karo', 'thoda dheere'. Use 'normal' for regular 'scroll down', 'scroll karo', 'aur neeche', 'page neeche karo'. Use 'fast' for 'tez scroll karo', 'fast scroll'. Direction 'up' for 'upar scroll karo', 'scroll up', 'page upar le jao'.",
        parameters: z.object({
          direction: z.enum(["down", "up"]).default("down").describe("Scroll direction: 'down' or 'up'."),
          speed: z.enum(["slow", "normal", "fast"]).default("normal").describe("Scroll speed: 'slow' (gentle reading pace ~110px/s), 'normal' (~260px/s), or 'fast' (~580px/s)."),
        }),
        flags: ToolFlag.CANCELLABLE,
        execute: async ({ direction, speed }) => {
          controller.onToolStart("start_smooth_scroll");
          await publishAction({ type: "start_smooth_scroll", direction, speed, priority: 60, interruptible: true });
          controller.onToolEnd(`Smooth scroll ${direction} ${speed}`);
          return `Smooth scrolling started ${direction} at ${speed} pace. Ready to explain or stop whenever requested.`;
        },
      }),

      tool({
        name: "stop_scroll",
        description:
          "Highest priority tool to immediately and smoothly stop any active page scrolling when user says 'ruk jao', 'stop', 'bas', 'bas karo', 'thahar jao', 'page roko', 'stop scrolling', 'wait', 'ruko', or 'hold on'.",
        parameters: z.object({}),
        flags: ToolFlag.CANCELLABLE,
        execute: async () => {
          controller.onToolStart("stop_scroll");
          await publishAction({ type: "stop_scroll", priority: 100, interruptible: false });
          controller.onToolEnd("Stopped scroll");
          return "Scrolling stopped smoothly.";
        },
      }),

      tool({
        name: "scroll_page",
        description:
          "Smoothly scroll the webpage down or up by a small or fixed distance when user asks for a single step scroll (e.g. 'thoda neeche', 'a bit down', 'thoda upar', 'scroll slightly', 'one page down').",
        parameters: z.object({
          direction: z.enum(["down", "up"]).default("down").describe("Direction to scroll ('down' or 'up')."),
          amount: z.number().optional().describe("Amount of pixels to scroll (default 350px for small step, 600px for full step)."),
        }),
        flags: ToolFlag.CANCELLABLE,
        execute: async ({ direction, amount }) => {
          const defaultStep = 350;
          const px = direction === "down" ? (amount ?? defaultStep) : -(amount ?? defaultStep);
          controller.onToolStart("scroll_page");
          await publishAction({ type: "scroll_page", amount: px, direction, priority: 60 });
          controller.onToolEnd(`Scrolled ${direction}`);
          return `Scrolled the page ${direction} by ${Math.abs(px)}px.`;
        },
      }),

      tool({
        name: "set_theme",
        description: "Switch the website's appearance between dark mode and light mode.",
        parameters: z.object({
          theme: z.enum(["dark", "light"]).describe("The theme to switch to."),
        }),
        flags: ToolFlag.CANCELLABLE,
        execute: async ({ theme }) => {
          controller.onToolStart("set_theme");
          await publishAction({ type: "set_theme", theme, priority: 80 });
          controller.onToolEnd(`Theme set to ${theme}`);
          return `Switched to ${theme} mode.`;
        },
      }),

      tool({
        name: "set_language",
        description:
          "Instantly switch the entire website language and conversational speech language across all 6 combinations between English ('en'), Hindi ('hi'), and Arabic ('ar'). Trigger on: 'Hindi me baat karo', 'change to hindi', 'Hindi karo', 'English me bolo', 'change to English', 'Arabic karo', 'bhasha badlo', 'Arbi me bolo', 'Tahweel ila al-arabiya', 'Speak in English', 'Arbi me baat karo', 'Hindi to Arabic', 'English to Arabic', 'Arabic to Hindi', etc. Priority 100.",
        parameters: z.object({
          locale: z.enum(["en", "hi", "ar"]).describe("The language code to switch to: 'en' (English), 'hi' (Hindi), or 'ar' (Arabic)."),
        }),
        flags: ToolFlag.CANCELLABLE,
        execute: async ({ locale }) => {
          controller.onToolStart("set_language");
          await publishAction({ type: "set_language", locale, priority: 100, interruptible: false });
          controller.onToolEnd(`Language set to ${locale}`);
          if (locale === "hi") {
            return "Website switched to Hindi. YOU MUST NOW SPEAK EXCLUSIVELY IN HINDI.";
          } else if (locale === "ar") {
            return "Website switched to Arabic. YOU MUST NOW SPEAK EXCLUSIVELY IN ARABIC.";
          } else {
            return "Website switched to English. YOU MUST NOW SPEAK EXCLUSIVELY IN ENGLISH.";
          }
        },
      }),

      tool({
        name: "end_session",
        description:
          "End the voice conversation and close the voice assistant window immediately when the user says bye, goodbye, end the session, disconnect, band karo, close this, or confirms they want to exit.",
        parameters: z.object({}),
        flags: ToolFlag.CANCELLABLE,
        execute: async () => {
          controller.onToolStart("end_session");
          await publishAction({ type: "end_session", priority: 100 });
          controller.onToolEnd("Session ended");
          return "Voice session ending. Goodbye message spoken and closing signal sent.";
        },
      }),
    ];

    const agent = voice.Agent.create({ instructions: INSTRUCTIONS, tools });

    const session = new voice.AgentSession({
      llm: new google.realtime.RealtimeModel({
        model: "gemini-3.1-flash-live-preview",
        voice: "Puck", // 100% Professional Male Voice
        temperature: 0.5,
        thinkingConfig: { thinkingBudget: 0 },
        toolBehavior: Behavior.NON_BLOCKING,
        toolResponseScheduling: FunctionResponseScheduling.INTERRUPT, // Immediately interrupt speech to execute tool call
        realtimeInputConfig: {
          automaticActivityDetection: {
            startOfSpeechSensitivity: StartSensitivity.START_SENSITIVITY_HIGH,
            endOfSpeechSensitivity: EndSensitivity.END_SENSITIVITY_HIGH,
            silenceDurationMs: 450, // Human conversational cadence — fast without jumpy mid-thought cutoffs
          },
          activityHandling: ActivityHandling.START_OF_ACTIVITY_INTERRUPTS,
          turnCoverage: TurnCoverage.TURN_INCLUDES_ONLY_ACTIVITY,
        },
      }),
    });

    session.on(AgentSessionEventTypes.MetricsCollected, (ev) => logMetrics(ev.metrics));

    // LiveKit billing safeguard timers
    const INACTIVITY_TIMEOUT_MS = 30 * 1000; // 30 seconds of user silence
    const DISCONNECT_GRACE_PERIOD_MS = 10 * 1000; // 10 seconds farewell grace period (upgraded from 5s)
    const MAX_SESSION_DURATION_MS = 10 * 60 * 1000; // 10 minutes hard cap

    let inactivityTimer: NodeJS.Timeout | null = null;
    let maxSessionTimer: NodeJS.Timeout | null = null;
    let isTerminating = false;

    const terminateSession = async () => {
      if (isTerminating) return;
      isTerminating = true;
      if (inactivityTimer) clearTimeout(inactivityTimer);
      if (maxSessionTimer) clearTimeout(maxSessionTimer);

      try {
        await publishAction({ type: "end_session", priority: 100 });
        session.generateReply({
          instructions:
            "Say this complete farewell message clearly: 'Thank you for connecting with NIVREN Healthcare! I am disconnecting our session now to save resources. Have a wonderful and productive day!' and call the end_session tool.",
        });
      } catch (err) {
        console.warn("Error publishing end_session action:", err);
      }

      setTimeout(() => {
        try {
          ctx.room.disconnect();
        } catch {
          // ignore
        }
      }, DISCONNECT_GRACE_PERIOD_MS);
    };

    const resetInactivityTimer = () => {
      if (isTerminating) return;
      if (inactivityTimer) clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        terminateSession();
      }, INACTIVITY_TIMEOUT_MS);
    };

    session.on(AgentSessionEventTypes.UserInputTranscribed, (ev: any) => {
      resetInactivityTimer();
      const text = ev?.text || "";
      if (text) {
        controller.onUserTranscript(text);
      }
    });

    session.on(AgentSessionEventTypes.UserStateChanged, (ev: any) => {
      resetInactivityTimer();
      // True barge-in / Interruption: User spoke -> increment generation ID and signal client
      if (ev?.state === "speaking" || ev?.newState === "speaking") {
        const { isInterruption } = controller.onUserSpeechStart();
        if (isInterruption) {
          publishAction({
            type: "interrupt",
            priority: 100,
            interruptible: false,
          });
        }
      }
    });

    session.on(AgentSessionEventTypes.ConversationItemAdded, (ev: any) => {
      resetInactivityTimer();
      try {
        if (ev?.item?.role === "assistant" || ev?.item?.type === "message") {
          const content = ev.item.content;
          const text = typeof content === "string" ? content : Array.isArray(content) ? content.map((c: any) => c?.text || "").join(" ") : "";
          if (text) {
            controller.onAgentSpeaking(true, text);
            publishAction({ type: "agent_speaking", isSpeaking: true, text, priority: 10 });
          }
        }
      } catch (_) {}
    });

    session.on(AgentSessionEventTypes.AgentStateChanged, (ev: any) => {
      try {
        const isSpeaking = ev?.newState === "speaking";
        controller.onAgentSpeaking(isSpeaking);
        publishAction({ type: "agent_speaking", isSpeaking, priority: 10 });
      } catch (_) {}
    });

    ctx.room.on("disconnected", () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      if (maxSessionTimer) clearTimeout(maxSessionTimer);
    });

    await session.start({ agent, room: ctx.room });
    await ctx.connect();
    
    // Start session timers right after connect
    resetInactivityTimer();
    maxSessionTimer = setTimeout(() => {
      terminateSession();
    }, MAX_SESSION_DURATION_MS);

    // Dr. Dylan speaks welcome message automatically on connection in active website language
    try {
      const activeLocale = getCurrentLocale();
      let greetingInstruction = `Greet the user immediately with this exact greeting in the conversation: "${WELCOME_MESSAGE}"`;
      if (activeLocale === "hi") {
        greetingInstruction = `Greet the user immediately in Hindi: "Namaste! Main Dr. Dylan hoon, NIVREN Healthcare ka senior Revenue Cycle Management consultant. Main aaj aapki kaise madad kar sakta hoon?"`;
      } else if (activeLocale === "ar") {
        greetingInstruction = `Greet the user immediately in Arabic: "مرحباً! أنا د. ديلان، مستشار إدارة دورة الإيرادات في نيفيرين. كيف يمكنني مساعدتك اليوم؟"`;
      }
      session.generateReply({
        instructions: greetingInstruction,
      });
    } catch (greetingErr) {
      console.warn("Initial greeting could not be spoken:", greetingErr);
    }
  },
});

cli.runApp(new ServerOptions({ agent: __filename }));
