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
import { sectionsForRoute } from "../ai/pageSections";
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

type AgentAction =
  | { type: "navigate"; path: string }
  | { type: "scroll"; sectionId: string }
  | { type: "set_theme"; theme: "dark" | "light" }
  | { type: "set_language"; locale: "en" | "hi" | "ar" }
  | { type: "end_session" }
  | { type: "update_form"; field: ConsultationField; value: string }
  | { type: "consultation_started" }
  | { type: "consultation_confirmed" }
  | {
      type: "consultation_requested";
      data: { name: string; phone: string; email?: string; serviceOrSpecialty?: string; message?: string };
    };

function publishAction(ctx: JobContext, action: AgentAction) {
  const payload = new TextEncoder().encode(JSON.stringify(action));
  return ctx.room.localParticipant?.publishData(payload, { reliable: true, topic: "agent-action" });
}

function getCurrentRoute(ctx: JobContext): string | undefined {
  const participant = [...ctx.room.remoteParticipants.values()][0];
  return participant?.attributes?.route;
}

export default defineAgent({
  entry: async (ctx: JobContext) => {
    // Per-call consultation state — scoped to this closure, so it lives only
    // for this one room/job and never leaks across calls.
    let consultation: ConsultationState | null = null;

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
          await publishAction(ctx, { type: "navigate", path });
          return `Navigating to ${path} now.`;
        },
      }),

      tool({
        name: "start_consultation",
        description:
          "Start collecting details for a free RCM consultation/assessment request. Call this once, right when the user wants to book a consultation, get a demo, or fill out the contact form.",
        parameters: z.object({}),
        execute: async () => {
          consultation = { confirmed: false };
          await publishAction(ctx, { type: "consultation_started" });
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
          consultation.confirmed = false; // any change invalidates a prior confirmation
          await publishAction(ctx, { type: "update_form", field, value });
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
          await publishAction(ctx, { type: "consultation_confirmed" });
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
          await publishAction(ctx, {
            type: "consultation_requested",
            data: { name: name!, phone: phone!, email, serviceOrSpecialty: service, message },
          });
          consultation = null;
          return `Submitted. Let ${name} know NIVREN's team will reach out shortly.`;
        },
      }),

      tool({
        name: "list_sections",
        description: "List the section IDs on the current page for in-page navigation.",
        parameters: z.object({}),
        execute: async () => {
          const route = getCurrentRoute(ctx);
          if (!route) return "Current page unknown.";
          const sections = sectionsForRoute(route);
          if (sections.length === 0) return "No named sections on this page.";
          return sections.map((s) => `${s.id}: ${s.label}`).join("\n");
        },
      }),

      tool({
        name: "scroll_to_section",
        description: "Scroll to a specific section on the current page.",
        parameters: z.object({
          sectionId: z.string().describe("The exact section ID on the current page."),
        }),
        flags: ToolFlag.CANCELLABLE,
        execute: async ({ sectionId }) => {
          await publishAction(ctx, { type: "scroll", sectionId });
          return "Scrolling there now.";
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
          await publishAction(ctx, { type: "set_theme", theme });
          return `Switched to ${theme} mode.`;
        },
      }),

      tool({
        name: "set_language",
        description: "Switch the website's language. Valid: 'en' (English), 'hi' (Hindi), 'ar' (Arabic).",
        parameters: z.object({
          locale: z.enum(["en", "hi", "ar"]).describe("The language code to switch to."),
        }),
        flags: ToolFlag.CANCELLABLE,
        execute: async ({ locale }) => {
          await publishAction(ctx, { type: "set_language", locale });
          return `Switched the site language to ${locale}.`;
        },
      }),

      tool({
        name: "end_session",
        description:
          "End the voice conversation and close the voice assistant window immediately when the user says bye, goodbye, end the session, disconnect, band karo, close this, or confirms they want to exit.",
        parameters: z.object({}),
        flags: ToolFlag.CANCELLABLE,
        execute: async () => {
          await publishAction(ctx, { type: "end_session" });
          return "Voice session ending. Goodbye message spoken and closing signal sent.";
        },
      }),
    ];

    const agent = voice.Agent.create({ instructions: INSTRUCTIONS, tools });

    const session = new voice.AgentSession({
      llm: new google.realtime.RealtimeModel({
        model: "gemini-2.5-flash-native-audio-preview-12-2025",
        voice: "Puck", // 100% Professional Male Voice
        temperature: 0.6,
        thinkingConfig: { thinkingBudget: 0 },
        toolBehavior: Behavior.NON_BLOCKING,
        toolResponseScheduling: FunctionResponseScheduling.WHEN_IDLE,
        realtimeInputConfig: {
          automaticActivityDetection: {
            startOfSpeechSensitivity: StartSensitivity.START_SENSITIVITY_LOW,
            endOfSpeechSensitivity: EndSensitivity.END_SENSITIVITY_LOW,
            silenceDurationMs: 400,
          },
          activityHandling: ActivityHandling.START_OF_ACTIVITY_INTERRUPTS,
          turnCoverage: TurnCoverage.TURN_INCLUDES_ONLY_ACTIVITY,
        },
      }),
    });

    session.on(AgentSessionEventTypes.MetricsCollected, (ev) => logMetrics(ev.metrics));

    // LiveKit billing safeguard timers
    const INACTIVITY_TIMEOUT_MS = 60 * 1000; // 1 minute of silence / no user speech
    const MAX_SESSION_DURATION_MS = 10 * 60 * 1000; // 10 minutes hard cap

    let inactivityTimer: NodeJS.Timeout | null = null;
    let maxSessionTimer: NodeJS.Timeout | null = null;
    let isTerminating = false;

    const terminateSession = async (farewellMessage: string) => {
      if (isTerminating) return;
      isTerminating = true;
      if (inactivityTimer) clearTimeout(inactivityTimer);
      if (maxSessionTimer) clearTimeout(maxSessionTimer);

      try {
        await publishAction(ctx, { type: "end_session" });
        session.generateReply({
          instructions: `Say this final message politely: "${farewellMessage}" and immediately call the end_session tool.`,
        });
      } catch (err) {
        console.warn("Error during session termination:", err);
      }

      setTimeout(() => {
        try {
          ctx.room.disconnect();
        } catch {
          // ignore
        }
      }, 3500);
    };

    const resetInactivityTimer = () => {
      if (isTerminating) return;
      if (inactivityTimer) clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        terminateSession(
          "It looks like you have stepped away. I am disconnecting the session to save resources. Feel free to reconnect anytime. Have a great day!"
        );
      }, INACTIVITY_TIMEOUT_MS);
    };

    session.on(AgentSessionEventTypes.UserInputTranscribed, () => resetInactivityTimer());
    session.on(AgentSessionEventTypes.UserStateChanged, () => resetInactivityTimer());
    session.on(AgentSessionEventTypes.ConversationItemAdded, () => resetInactivityTimer());

    ctx.room.on("disconnected", () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      if (maxSessionTimer) clearTimeout(maxSessionTimer);
    });

    await session.start({ agent, room: ctx.room });
    await ctx.connect();
    
    // Start session timers right after connect
    resetInactivityTimer();
    maxSessionTimer = setTimeout(() => {
      terminateSession(
        "Our 10-minute consultation limit for this session has been reached. Thank you for connecting with NIVREN! Please feel free to book a free assessment on our website or start a new call anytime. Goodbye!"
      );
    }, MAX_SESSION_DURATION_MS);

    try {
      session.generateReply({
        instructions: `Greet the user immediately with this exact greeting in the conversation: "${WELCOME_MESSAGE}"`,
      });
    } catch (greetingErr) {
      console.warn("Initial greeting could not be spoken:", greetingErr);
    }
  },
});

cli.runApp(new ServerOptions({ agent: __filename }));
