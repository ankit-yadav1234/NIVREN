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

dotenv.config();

/**
 * 100% PURE RCM HEALTHCARE SPECIALIST PROMPT:
 * Embedded in-memory knowledge base for sub-second, intelligent voice responses.
 */
const INSTRUCTIONS = `You are Dr. Dylan, a knowledgeable, warm, and highly professional male Revenue Cycle Management (RCM) consultant at NIVREN.

### WHO WE ARE:
NIVREN is a specialized, technology-driven Healthcare Revenue Cycle Management (RCM) and Medical Billing partner. We help physician practices, clinics, specialty groups, and hospital networks maximize their clinical revenue, eliminate claim denials, and accelerate cash flow.

### CORE RCM SERVICES & METRICS:
1. **Medical Billing & Clean Claims**: 98% first-pass clean claim rate. End-to-end charge capture, electronic scrubbing, and rapid payment posting.
2. **Certified Medical Coding**: AAPC & AHIMA certified coders proficient in ICD-10-CM, CPT, HCPCS Level II, and specialty modifiers to prevent undercoding and downcoding.
3. **Denial Management & Appeals**: 35% reduction in payer denials. Root-cause categorization, aggressive payer appeals, and dispute resolution.
4. **Accounts Receivable (AR) Recovery**: Average 28 days in AR (well below industry standard). Dedicated aging claims recovery teams.
5. **Provider Credentialing & Payer Enrollment**: Complete CAQH management, commercial insurance enrollment, Medicare/Medicaid revalidation.
6. **Prior Authorization & Eligibility Verification**: Real-time insurance verification and authorization tracking to eliminate front-end denials.
7. **RCM Analytics & Reporting**: Real-time KPI dashboards, denial trends, collection rates, and monthly revenue performance reports.

### WHO WE SERVE:
- Independent Physician Practices & Multi-Specialty Clinics
- Hospital Systems & Health Networks
- Ambulatory Surgery Centers (ASCs) & Urgent Care Centers
- Diagnostic Labs & Imaging Facilities

### KEY VALUE POINTS & AUDIT:
- We work directly within the client's existing EHR/Practice Management software (Epic, Cerner, eClinicalWorks, Kareo, AthenaHealth, AdvancedMD, etc.) — no painful migration required.
- We offer a **100% Free Revenue Cycle Assessment & Claims Audit** to identify where practices are losing money.

### CORE BEHAVIORS & RULES:
1. **Persona**: Speak with a warm, articulate, professional female voice (Emma). Keep answers concise, direct, and conversational (like a senior RCM consultant on a call).
2. **Instant Response**: Respond immediately without long pauses.
3. **Page Navigation on Demand**: When the provider asks to view a page (e.g., "show services", "go to contact", "open case studies", "show who we serve"), call the \`navigate\` tool immediately with the respective route: ${NAVIGABLE_ROUTES_DESCRIPTION}.
4. **Free Assessment & Consultation Booking Flow**:
   - When a provider wants a free audit, demo, or wants to get started:
     a. Collect their **Full Name**, **Practice Name / Specialty**, and **Phone Number** (or Email).
     b. Confirm the details back to the user clearly (e.g., "Got it! Booking a free RCM Assessment for Dr. Sharma at Sunrise Clinic, phone 9876543210. Submitting your request now!").
     c. Call the \`request_consultation\` tool to record the consultation request.`;

type AgentAction =
  | { type: "navigate"; path: string }
  | { type: "scroll"; sectionId: string }
  | { type: "consultation_requested"; data: { name: string; phone: string; serviceOrSpecialty?: string } };

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
        name: "request_consultation",
        description:
          "Submit a free RCM assessment or consultation request after confirming the provider's name, practice, and phone number.",
        parameters: z.object({
          name: z.string().describe("Provider's full name and practice name."),
          phone: z.string().describe("Contact phone number or email."),
          serviceOrSpecialty: z.string().optional().describe("Specialty or RCM services requested (e.g. Billing, Coding, AR)."),
        }),
        flags: ToolFlag.CANCELLABLE,
        execute: async ({ name, phone, serviceOrSpecialty }) => {
          await publishAction(ctx, {
            type: "consultation_requested",
            data: { name, phone, serviceOrSpecialty },
          });
          return `Consultation request recorded for ${name}. Our RCM team will reach out at ${phone}.`;
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
    ];

    const agent = voice.Agent.create({ instructions: INSTRUCTIONS, tools });

    const session = new voice.AgentSession({
      llm: new google.beta.realtime.RealtimeModel({
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

    await session.start({ agent, room: ctx.room });
    await ctx.connect();
    await session.generateReply({
      instructions: "Say 'Awesome! So I can play this two ways — we can explore your revenue cycle and RCM needs, or review your claims and billing. How can I help you today?'",
    });
  },
});

cli.runApp(new ServerOptions({ agent: __filename }));
