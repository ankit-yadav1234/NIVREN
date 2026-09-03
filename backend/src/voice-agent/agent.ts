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
import { buildVoiceInstructions, getWelcomeMessage, getFarewellMessage } from "../ai/prompt";
import { CONSULTATION_FIELD_KEYS, REQUIRED_CONSULTATION_FIELDS, type ConsultationField } from "../ai/consultationFields";

dotenv.config();

/** RCM facts + behavior rules live in one shared file — see ../ai/prompt.ts. */
const INSTRUCTIONS = buildVoiceInstructions(NAVIGABLE_ROUTES_DESCRIPTION);

interface ConsultationState {
  name?: string;
  phone?: string;
  email?: string;
  service?: string;
  message?: string;
  confirmed: boolean;
}

import {
  calculateRcmRoi,
  checkEhrCompatibility,
  getSpecialtyBenchmarks,
  lookupDenialCode,
  assessPracticeHealth,
  type RoiCalculationResult,
  type EhrCompatibilityResult,
  type SpecialtyBenchmarkResult,
  type DenialCodeResult,
  type PracticeHealthResult,
} from "../ai/mcpTools";
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
    | "conversation_state"
    | "highlight_element"
    | "show_roi_card"
    | "show_ehr_badge"
    | "show_benchmark"
    | "show_denial_card"
    | "show_health_score"
    | "dismiss_interactive_card";
  priority?: number;
  timestamp: number;
  interruptible?: boolean;
  path?: string;
  sectionId?: string;
  selector?: string;
  label?: string;
  durationMs?: number;
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
  roiData?: RoiCalculationResult;
  ehrData?: EhrCompatibilityResult;
  benchmarkData?: SpecialtyBenchmarkResult;
  denialData?: DenialCodeResult;
  healthData?: PracticeHealthResult;
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

    function cleanPhoneNumber(raw: string): string {
      let str = raw.toLowerCase()
        .replace(/double\s*(\w)/g, "$1$1")
        .replace(/triple\s*(\w)/g, "$1$1$1")
        .replace(/\bzero\b/g, "0")
        .replace(/\bone\b/g, "1")
        .replace(/\btwo\b/g, "2")
        .replace(/\bthree\b/g, "3")
        .replace(/\bfour\b/g, "4")
        .replace(/\bfive\b/g, "5")
        .replace(/\bsix\b/g, "6")
        .replace(/\bseven\b/g, "7")
        .replace(/\beight\b/g, "8")
        .replace(/\bnine\b/g, "9")
        .replace(/\bshunya\b/g, "0")
        .replace(/\bek\b/g, "1")
        .replace(/\bdo\b/g, "2")
        .replace(/\bteen\b/g, "3")
        .replace(/\bchaar\b/g, "4")
        .replace(/\bpaanch\b/g, "5")
        .replace(/\bchhah\b|\bche\b/g, "6")
        .replace(/\bsaat\b/g, "7")
        .replace(/\baath\b/g, "8")
        .replace(/\bnau\b/g, "9");

      const digits = str.replace(/[^\d+]/g, "");
      return digits.length >= 7 ? digits : raw.trim();
    }

    function cleanEmail(raw: string): string {
      return raw.toLowerCase()
        .replace(/\s*(at the rate|at rate|at)\s*/g, "@")
        .replace(/\s*(dot|point)\s*/g, ".")
        .replace(/\s+/g, "");
    }

    const tools = [
      tool({
        name: "navigate",
        description: `Navigate the website to a specific page immediately. Valid routes: ${NAVIGABLE_ROUTES_DESCRIPTION}`,
        parameters: z.object({
          path: z.string().describe("The exact path to navigate to, e.g. '/rcm', '/contact', '/case-studies', '/who-we-serve', '/privacy', '/terms', '/disclaimer', '/accessibility'."),
        }),
        flags: ToolFlag.CANCELLABLE,
        execute: async ({ path }) => {
          if (!isNavigableRoute(path)) {
            return `Cannot navigate to ${path}. Valid pages: ${NAVIGABLE_ROUTES_DESCRIPTION}.`;
          }

          const current = getCurrentRoute();
          const currentClean = current ? stripLocale(current) : "";
          const targetClean = stripLocale(path);

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
          return "Consultation form started. Required fields: name, phone, email, service. If user has already stated any details, call update_consultation_fields immediately.";
        },
      }),

      tool({
        name: "update_consultation_fields",
        description:
          "Save or update multiple consultation fields simultaneously in a single turn. Call this whenever the user gives one or more pieces of info (e.g. name, phone, email, and service in one sentence) for ultra-fast booking.",
        parameters: z.object({
          name: z.string().optional().describe("User's full name"),
          phone: z.string().optional().describe("User's phone number"),
          email: z.string().optional().describe("User's email address (mandatory)"),
          service: z.string().optional().describe("Service needed: Medical Billing, Medical Coding, Denial Management, AR Recovery, Eligibility Verification, Prior Authorization, or Practice Assessment"),
          message: z.string().optional().describe("Optional notes"),
        }),
        flags: ToolFlag.CANCELLABLE,
        execute: async ({ name, phone, email, service, message }) => {
          if (!consultation) consultation = { confirmed: false };
          controller.onToolStart("update_consultation_fields");

          if (name) {
            consultation.name = name.trim();
            await publishAction({ type: "update_form", field: "name", value: consultation.name, priority: 70 });
          }
          if (phone) {
            consultation.phone = cleanPhoneNumber(phone);
            await publishAction({ type: "update_form", field: "phone", value: consultation.phone, priority: 70 });
          }
          if (email) {
            consultation.email = cleanEmail(email);
            await publishAction({ type: "update_form", field: "email", value: consultation.email, priority: 70 });
          }
          if (service) {
            consultation.service = service.trim();
            await publishAction({ type: "update_form", field: "service", value: consultation.service, priority: 70 });
          }
          if (message) {
            consultation.message = message.trim();
            await publishAction({ type: "update_form", field: "message", value: consultation.message, priority: 70 });
          }

          consultation.confirmed = false;
          controller.onToolEnd("Updated consultation fields");

          const missing = REQUIRED_CONSULTATION_FIELDS.filter((f) => !consultation![f]);
          if (missing.length > 0) {
            const nextField = missing[0];
            if (nextField === "service") {
              return "Saved. Now ask for service: list Medical Billing, Medical Coding, Denial Management, AR Recovery, Eligibility Verification, or Practice Assessment.";
            }
            return `Saved. Still needed: ${missing.join(", ")}. Ask for ${nextField} next.`;
          }
          return `All required fields collected: Name: ${consultation.name}, Phone: ${consultation.phone}, Email: ${consultation.email}, Service: ${consultation.service}. Read this 1-sentence summary back to the user and ask for instant confirmation.`;
        },
      }),

      tool({
        name: "update_consultation_field",
        description:
          "Save or correct one single field of the consultation request. Call update_consultation_fields instead if multiple fields were provided in one turn.",
        parameters: z.object({
          field: z.enum(CONSULTATION_FIELD_KEYS).describe("Which field this value belongs to."),
          value: z.string().describe("The value exactly as the user said it."),
        }),
        flags: ToolFlag.CANCELLABLE,
        execute: async ({ field, value }) => {
          if (!consultation) consultation = { confirmed: false };
          let finalVal = value.trim();
          if (field === "phone") finalVal = cleanPhoneNumber(value);
          if (field === "email") finalVal = cleanEmail(value);

          consultation[field] = finalVal;
          consultation.confirmed = false;
          controller.onToolStart("update_consultation_field");
          await publishAction({ type: "update_form", field, value: finalVal, priority: 70 });
          controller.onToolEnd(`Updated ${field}`);
          const missing = REQUIRED_CONSULTATION_FIELDS.filter((f) => !consultation![f]);
          return missing.length > 0
            ? `Saved. Still needed: ${missing.join(", ")}.`
            : `Saved. All required fields are filled (Name: ${consultation.name}, Phone: ${consultation.phone}, Email: ${consultation.email}, Service: ${consultation.service}) — read the 1-sentence summary back and ask to confirm.`;
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
        name: "submit_consultation",
        description:
          "Submit the consultation request immediately when the user confirms with 'yes', 'haan', 'submit', 'kardo', 'correct', 'theek hai'.",
        parameters: z.object({}),
        flags: ToolFlag.CANCELLABLE,
        execute: async () => {
          if (!consultation) {
            return "No consultation in progress to submit.";
          }
          const { name, phone, email, service, message } = consultation;
          const missing = REQUIRED_CONSULTATION_FIELDS.filter((f) => !consultation![f]);
          if (missing.length > 0) {
            return `Cannot submit yet — still missing required fields: ${missing.join(", ")}.`;
          }

          controller.onToolStart("submit_consultation");
          await publishAction({
            type: "consultation_requested",
            priority: 95,
            data: { name: name!, phone: phone!, email, serviceOrSpecialty: service, message },
          });
          consultation = null;
          controller.onToolEnd("Consultation submitted");
          return `SUCCESS: Consultation request submitted for ${name}! Speak this exact warm closing line now: 'Aapki consultation request successfully submit ho gayi hai! Hamari senior revenue cycle team aapse jald hi contact karegi.'`;
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
          return "Navigated to section.";
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
          return "Smooth scrolling active.";
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
          return "Scrolling stopped.";
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
          return "Page scrolled.";
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
          "Immediately close the voice assistant and end the session when user says: 'close', 'band karo', 'exit', 'bye', 'goodbye', 'stop', 'disconnect', 'khatam karo', 'alvida', 'chalo bye', 'band kar do', 'band ho jao', 'close agent', 'close window', 'close panel', 'end call', 'bas band karo', 'wada'an', 'iqlaq'. Priority 100.",
        parameters: z.object({}),
        flags: ToolFlag.CANCELLABLE,
        execute: async () => {
          controller.onToolStart("end_session");
          await publishAction({ type: "end_session", priority: 100, interruptible: false });
          controller.onToolEnd("Session ended");
          return "Voice session ending. Speak exactly ONE short farewell sentence in the active language.";
        },
      }),

      tool({
        name: "skip_item",
        description:
          "Skip the current question, field, or topic immediately when user says: 'skip', 'skip karo', 'aage badho', 'chhod do', 'next', 'agla sawal', 'agli cheez', 'leave this', 'move on', 'next question', 'takhaddi'. Priority 90.",
        parameters: z.object({}),
        flags: ToolFlag.CANCELLABLE,
        execute: async () => {
          controller.onToolStart("skip_item");
          controller.onToolEnd("Skipped item");
          return "Skipped. Move immediately to the next question or next topic.";
        },
      }),

      tool({
        name: "calculate_rcm_roi",
        description:
          "Calculate practice financial ROI, monthly revenue leakage from claim denials, and projected annual profit recovery. Trigger this autonomously when user mentions their billing volume, monthly collections, practice size, or asks how much money NIVREN can save/recover for them.",
        parameters: z.object({
          monthlyBilling: z.number().describe("Monthly billing/collections amount (e.g. 5000000 for 50 Lakh, 250000 for $250k)."),
          currentDenialRatePercent: z.number().optional().default(10).describe("Current estimated claim denial percentage (default 10%)."),
          currency: z.enum(["INR", "USD"]).optional().default("INR").describe("Currency: 'INR' (Rupees / Lakhs) or 'USD' ($)."),
        }),
        flags: ToolFlag.CANCELLABLE,
        execute: async ({ monthlyBilling, currentDenialRatePercent, currency }) => {
          controller.onToolStart("calculate_rcm_roi");
          const roiResult = calculateRcmRoi(monthlyBilling, currentDenialRatePercent, currency);
          await publishAction({
            type: "show_roi_card",
            priority: 85,
            roiData: roiResult,
          });
          controller.onToolEnd("Calculated RCM ROI and displayed interactive card");
          const formattedLoss = currency === "INR" ? `₹${(roiResult.monthlyLoss / 100000).toFixed(1)} Lakh` : `$${roiResult.monthlyLoss.toLocaleString()}`;
          const formattedRecovery = currency === "INR" ? `₹${(roiResult.annualAdditionalRevenue / 100000).toFixed(1)} Lakh` : `$${roiResult.annualAdditionalRevenue.toLocaleString()}`;
          return `Calculated: Monthly denial loss is ${formattedLoss}/month. NIVREN's 98% clean claim rate will recover ${formattedRecovery} annually for the practice. Explain this to the user in 1-2 punchy sentences.`;
        },
      }),

      tool({
        name: "check_ehr_compatibility",
        description:
          "Check and display live integration compatibility when the user mentions their practice management software or EHR system (e.g. Epic, Cerner, AthenaHealth, eClinicalWorks, Kareo, NextGen, Allscripts, Practice Fusion).",
        parameters: z.object({
          ehrName: z.string().describe("The name of the EHR or Practice Management system."),
        }),
        flags: ToolFlag.CANCELLABLE,
        execute: async ({ ehrName }) => {
          controller.onToolStart("check_ehr_compatibility");
          const ehrResult = checkEhrCompatibility(ehrName);
          await publishAction({
            type: "show_ehr_badge",
            priority: 85,
            ehrData: ehrResult,
          });
          controller.onToolEnd(`Checked EHR compatibility for ${ehrName}`);
          return `Compatible: ${ehrResult.ehrName} has a 100% direct API integration with NIVREN (${ehrResult.setupTimeDays}-day setup, zero downtime). Tell the user with confidence.`;
        },
      }),

      tool({
        name: "show_specialty_benchmark",
        description:
          "Show comparative industry benchmarks vs NIVREN clean claim rates for a medical specialty (Cardiology, Neurology, Orthopedics, Pediatrics, Oncology, General).",
        parameters: z.object({
          specialty: z.string().describe("The medical specialty to pull benchmarks for."),
        }),
        flags: ToolFlag.CANCELLABLE,
        execute: async ({ specialty }) => {
          controller.onToolStart("show_specialty_benchmark");
          const benchmark = getSpecialtyBenchmarks(specialty);
          await publishAction({
            type: "show_benchmark",
            priority: 80,
            benchmarkData: benchmark,
          });
          controller.onToolEnd(`Displayed benchmark for ${specialty}`);
          return `Benchmark loaded: ${benchmark.specialty} national denial avg is ${benchmark.industryDenialRate}, while NIVREN achieves ${benchmark.nivrenCleanRate} clean rate and ${benchmark.averageArDays} AR days. Explain this advantage.`;
        },
      }),

      tool({
        name: "highlight_element",
        description:
          "Autonomously draw a bright glowing spotlight on a specific card, stat, or section on the webpage to visually guide the user's attention while you talk about it.",
        parameters: z.object({
          selector: z.string().describe("CSS selector or element ID (e.g. '#rcm-billing', '#clean-claims-stat', '#testimonials', '#contact-form', '.service-card')."),
          label: z.string().optional().describe("Brief label to display above the spotlight (e.g. '98% Clean Claims', 'Denial Management')."),
          durationMs: z.number().optional().default(5000).describe("How long to keep the spotlight active in milliseconds (default 5000ms)."),
        }),
        flags: ToolFlag.CANCELLABLE,
        execute: async ({ selector, label, durationMs }) => {
          controller.onToolStart("highlight_element");
          await publishAction({
            type: "highlight_element",
            selector,
            label,
            durationMs,
            priority: 75,
          });
          controller.onToolEnd(`Highlighted ${selector}`);
          return "Element spotlighted on user's screen.";
        },
      }),

      tool({
        name: "dismiss_interactive_card",
        description: "Close any open floating interactive card (ROI calculator, EHR badge, benchmark, denial code card, health score) on the screen.",
        parameters: z.object({}),
        flags: ToolFlag.CANCELLABLE,
        execute: async () => {
          controller.onToolStart("dismiss_interactive_card");
          await publishAction({
            type: "dismiss_interactive_card",
            priority: 70,
          });
          controller.onToolEnd("Dismissed interactive card");
          return "Card closed.";
        },
      }),

      tool({
        name: "lookup_denial_code",
        description:
          "Instantly look up and explain a specific claim denial code (e.g. 'CO-16', 'CO-4', 'CO-50', 'CO-97', 'CO-29', 'PR-1') with exact root cause and appeal strategy.",
        parameters: z.object({
          code: z.string().describe("The denial code, e.g. 'CO-16', 'CO-4', 'CO-50', 'CO-97', 'CO-29', 'PR-1'."),
        }),
        flags: ToolFlag.CANCELLABLE,
        execute: async ({ code }) => {
          controller.onToolStart("lookup_denial_code");
          const denialResult = lookupDenialCode(code);
          await publishAction({
            type: "show_denial_card",
            priority: 85,
            denialData: denialResult,
          });
          controller.onToolEnd(`Looked up denial code ${code}`);
          return `Denial Code ${denialResult.code}: ${denialResult.name}. Cause: ${denialResult.explanation}. NIVREN Strategy: ${denialResult.recoveryStrategy} (${denialResult.nivrenAppealSuccessRate} recovery rate). Explain this clearly to the user.`;
        },
      }),

      tool({
        name: "assess_practice_health",
        description:
          "Perform a comprehensive Revenue Cycle Health Assessment and generate a Practice Financial Health Score (0-100, Grade A+ to D) with actionable recommendations.",
        parameters: z.object({
          denialRatePercent: z.number().default(10).describe("Current practice denial rate percentage (default 10%)."),
          arDays: z.number().default(45).describe("Average days in accounts receivable (default 45 days)."),
          cleanClaimRatePercent: z.number().default(88).describe("First-pass clean claim rate (default 88%)."),
        }),
        flags: ToolFlag.CANCELLABLE,
        execute: async ({ denialRatePercent, arDays, cleanClaimRatePercent }) => {
          controller.onToolStart("assess_practice_health");
          const healthResult = assessPracticeHealth(denialRatePercent, arDays, cleanClaimRatePercent);
          await publishAction({
            type: "show_health_score",
            priority: 85,
            healthData: healthResult,
          });
          controller.onToolEnd(`Assessed practice health score: ${healthResult.score}`);
          return `Health Assessment: Score is ${healthResult.score}/100 (Grade: ${healthResult.grade}, Status: ${healthResult.status}). Key Fix: ${healthResult.recommendations.join(" ")}. Explain this score and offer a free 100% full audit.`;
        },
      }),
    ];

    const agent = voice.Agent.create({ instructions: INSTRUCTIONS, tools });

    const session = new voice.AgentSession({
      llm: new google.realtime.RealtimeModel({
        model: "gemini-3.1-flash-live-preview",
        voice: "Puck", // 100% Professional Male Voice
        temperature: 0.35, // Natural, fluent conversational flow
        thinkingConfig: { thinkingBudget: 0 },
        toolBehavior: Behavior.NON_BLOCKING, // Smooth real-time non-stuttering voice streaming
        realtimeInputConfig: {
          automaticActivityDetection: {
            startOfSpeechSensitivity: StartSensitivity.START_SENSITIVITY_HIGH,
            endOfSpeechSensitivity: EndSensitivity.END_SENSITIVITY_HIGH,
            silenceDurationMs: 280, // Sub-300ms ultra-fast response
          },
          activityHandling: ActivityHandling.START_OF_ACTIVITY_INTERRUPTS,
          turnCoverage: TurnCoverage.TURN_INCLUDES_ONLY_ACTIVITY,
        },
      }),
    });

    session.on(AgentSessionEventTypes.MetricsCollected, (ev) => logMetrics(ev.metrics));

    // LiveKit billing safeguard timers: Auto-closes after 30s of complete user silence
    const INACTIVITY_TIMEOUT_MS = 30 * 1000; // 30 seconds of user silence to save billing costs
    const DISCONNECT_GRACE_PERIOD_MS = 10 * 1000; // 10 seconds farewell grace period
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
        const farewell = getFarewellMessage(getCurrentLocale());
        session.generateReply({
          instructions: `Say this exact farewell message clearly: "${farewell}" and call the end_session tool.`,
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

    // 1. Connect worker to LiveKit room immediately so the room join is instant
    await ctx.connect();

    // 2. Start voice agent session with RealtimeModel
    await session.start({ agent, room: ctx.room });
    
    // Start session timers right after connect
    resetInactivityTimer();
    maxSessionTimer = setTimeout(() => {
      terminateSession();
    }, MAX_SESSION_DURATION_MS);

    // Dr. Dylan speaks welcome message cleanly once when participant connects
    let greeted = false;
    const sendInitialGreeting = () => {
      if (greeted || isTerminating) return;
      greeted = true;
      try {
        const activeLocale = getCurrentLocale();
        const welcome = getWelcomeMessage(activeLocale);
        session.generateReply({
          instructions: `Greet the user immediately in the active language with this exact greeting: "${welcome}"`,
        });
      } catch (greetingErr) {
        console.warn("Initial greeting could not be spoken:", greetingErr);
      }
    };

    if (ctx.room.remoteParticipants.size > 0) {
      sendInitialGreeting();
    } else {
      ctx.room.once("participantConnected", () => {
        sendInitialGreeting();
      });
    }
  },
});

cli.runApp(new ServerOptions({ agent: __filename }));
