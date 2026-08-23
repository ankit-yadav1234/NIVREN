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
import { retrieveContext, warmIndex } from "../ai/rag";
import { NAVIGABLE_ROUTES, isNavigableRoute } from "../ai/tools";
import { sectionsForRoute } from "../ai/pageSections";

dotenv.config();

/**
 * Voice pipeline for the same assistant exposed as text chat in index.ts.
 * Runs on Gemini's realtime (native-audio) model, which does STT+LLM+TTS in
 * one session off a single GOOGLE_API_KEY — no separate voice provider keys
 * needed. Tools mirror ai/tools.ts: search_knowledge reuses the same RAG
 * lookup, and navigate/book_appointment publish a data message on the room
 * (topic "agent-action") instead of acting directly, since only the browser
 * can actually change routes. No agentName is set, so the worker joins any
 * room automatically. See VOICE_AI_AGENT_PROMPT.md for the full roadmap.
 *
 * Latency/interruption notes (see also VOICE_AI_AGENT_PROMPT.md):
 * - Barge-in, VAD and turn detection are NOT reimplemented here — the
 *   realtime model does all three server-side over the live audio stream
 *   (Gemini's `activityHandling: START_OF_ACTIVITY_INTERRUPTS`, which is
 *   already the default). The framework auto-selects "realtime_llm" turn
 *   detection, so there's no separate STT/VAD/endpointing pipeline to keep
 *   in sync or introduce double-latency through.
 * - VAD sensitivity is intentionally LEFT AT PROVIDER DEFAULTS, not tuned
 *   for max speed: an earlier HIGH-sensitivity/short-interruption-window
 *   attempt caused false interrupts from acoustic echo (the agent hearing
 *   its own voice back through the mic without headphones) — the agent
 *   would cut itself off after nearly every word. Robustness against echo
 *   and background noise matters more than shaving off reaction time.
 * - Tool calls run non-blocking (toolBehavior/toolResponseScheduling below)
 *   so the model isn't frozen mid-turn waiting on a tool; the only tool with
 *   real latency (search_knowledge) is cancellable and time-boxed.
 * - There's deliberately no custom multi-tool concurrency/aggregation layer:
 *   this agent has 3 independent, single-purpose tools and the model never
 *   needs more than one per turn, so asyncio.gather-style fan-out would add
 *   complexity with nothing to parallelize.
 */

const INSTRUCTIONS =
  "You are the NIVREN voice assistant, embedded in the NIVREN website. NIVREN runs a connected " +
  "hospital network and also provides Revenue Cycle Management (RCM) services — billing, coding, " +
  "denial management, AR follow-up — to other healthcare organizations.\n\n" +
  "Rules:\n" +
  "- Use the search_knowledge tool before answering any factual question about NIVREN — never guess.\n" +
  "- Use the navigate tool when the user explicitly asks to go to a different page.\n" +
  "- Use the book_appointment tool whenever the user asks to book/schedule an appointment — including " +
  "when they only name a specialty or department (e.g. \"book with a cardiologist\") rather than a " +
  "specific doctor. Never substitute a search_knowledge answer for an actual booking request.\n" +
  "- Use scroll_to_section when the user asks to jump to a specific part of the CURRENT page (e.g. " +
  "\"take me to the timeline\", \"open the cards section\") — call list_sections first if you don't " +
  "already know this page's sections, then match their wording to the closest one. Same tool if they " +
  "ask what's on the current page.\n" +
  "- Never claim an action happened unless you actually called the matching tool.\n" +
  "- You are talking to a real customer on a live call — represent NIVREN like a knowledgeable " +
  "specialist would. When they ask about a service, department, or RCM feature, explain it " +
  "properly: what it covers, how it works, why it matters to them. Don't cut a real answer down " +
  "to one line just to sound fast — a thin answer makes NIVREN look thin.\n" +
  "- Speak naturally, the way a person explains something over the phone: no markdown, no reading " +
  "out lists or URLs, no repeating back what the user just said, no throat-clearing before you get " +
  "to the point. Say what's needed, well, without padding or repeating yourself.\n" +
  "- If you don't know something, say so plainly instead of guessing.";

/** Search is the only tool with real latency — bound it so a slow/hung embedding call can never stall the turn. */
const SEARCH_TIMEOUT_MS = 4000;

function withTimeout<T>(promise: Promise<T>, ms: number, signal?: AbortSignal): Promise<T> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new Error("cancelled"));
      return;
    }
    const timer = setTimeout(() => reject(new Error("search_knowledge timed out")), ms);
    const onAbort = () => {
      clearTimeout(timer);
      reject(new Error("cancelled"));
    };
    signal?.addEventListener("abort", onAbort, { once: true });
    promise.then(
      (value) => {
        clearTimeout(timer);
        signal?.removeEventListener("abort", onAbort);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        signal?.removeEventListener("abort", onAbort);
        reject(err);
      },
    );
  });
}

type AgentAction = { type: "navigate"; path: string } | { type: "scroll"; sectionId: string };

function publishAction(ctx: JobContext, action: AgentAction) {
  const payload = new TextEncoder().encode(JSON.stringify(action));
  return ctx.room.localParticipant?.publishData(payload, { reliable: true, topic: "agent-action" });
}

/**
 * The voice agent has no per-turn pageContext like text chat does — it
 * reads the frontend's current route from the user participant's
 * attributes instead (set via room.localParticipant.setAttributes({route})
 * on connect and after every navigate — see useVoiceSession.ts).
 */
function getCurrentRoute(ctx: JobContext): string | undefined {
  const participant = [...ctx.room.remoteParticipants.values()][0];
  return participant?.attributes?.route;
}

// Build the RAG embedding index in the background as soon as the worker
// process starts (not per-call) — a worker sits registered and idle for at
// least a few seconds before its first real job, which is normally enough
// to absorb this cold start before any caller ever triggers search_knowledge.
warmIndex();

export default defineAgent({
  entry: async (ctx: JobContext) => {
    const tools = [
      tool({
        name: "search_knowledge",
        description:
          "Search NIVREN's knowledge base (RCM services, hospital departments, FAQs, company info) for " +
          "facts needed to answer the user's question. Always use this before answering questions about " +
          "NIVREN specifically — never guess.",
        parameters: z.object({
          query: z.string().describe("What to search for, in the user's own words."),
        }),
        // Cancellable: if the user barges in while this is still running, the
        // framework aborts it instead of finishing a search nobody will hear.
        flags: ToolFlag.CANCELLABLE,
        execute: async ({ query }, { abortSignal }) => {
          try {
            const docs = await withTimeout(retrieveContext(query), SEARCH_TIMEOUT_MS, abortSignal);
            if (docs.length === 0) return "No matching information was found in the knowledge base.";
            return docs.map((d) => `[${d.category}] ${d.text} (see ${d.route})`).join("\n");
          } catch {
            return "Knowledge search took too long. Tell the user briefly and offer to try again.";
          }
        },
      }),
      tool({
        name: "navigate",
        description:
          `Send the user to a page in the app. Only these exact paths are allowed: ${NAVIGABLE_ROUTES.join(", ")}. ` +
          'Use this when the user explicitly asks to go somewhere (e.g. "open the services page").',
        parameters: z.object({
          path: z.string().describe("One of the allowed paths, exactly as listed."),
        }),
        flags: ToolFlag.CANCELLABLE,
        execute: async ({ path }) => {
          if (!isNavigableRoute(path)) return `"${path}" is not a valid page.`;
          await publishAction(ctx, { type: "navigate", path });
          return "Done, navigating now.";
        },
      }),
      tool({
        name: "book_appointment",
        description:
          "Start the appointment booking flow. Navigates the user to the appointment page, optionally " +
          "pre-selecting a doctor. This does NOT submit anything by itself — the user still fills in and " +
          "submits the form themselves.",
        parameters: z.object({
          doctorSlug: z.string().optional().describe("Optional doctor slug to pre-select, if the user named one."),
        }),
        flags: ToolFlag.CANCELLABLE,
        execute: async ({ doctorSlug }) => {
          const path = doctorSlug ? `/appointment?doctor=${encodeURIComponent(doctorSlug)}` : "/appointment";
          await publishAction(ctx, { type: "navigate", path });
          return "Done, opening the booking page now.";
        },
      }),
      tool({
        name: "list_sections",
        description:
          "List the named content sections on the page the user is CURRENTLY looking at — use this to " +
          "answer 'what's on this page' or to find the right sectionId before calling scroll_to_section.",
        execute: async () => {
          const route = getCurrentRoute(ctx);
          if (!route) return "The current page is unknown.";
          const sections = sectionsForRoute(route);
          if (sections.length === 0) return "This page has no named sections to jump to.";
          return sections.map((s) => `${s.id}: ${s.label}`).join("\n");
        },
      }),
      tool({
        name: "scroll_to_section",
        description:
          "Scroll to a specific content section on the page the user is CURRENTLY looking at (never a " +
          "different page — use navigate for that). Only use a sectionId returned by list_sections — " +
          "never guess one.",
        parameters: z.object({
          sectionId: z.string().describe("The exact section id, exactly as returned by list_sections."),
        }),
        flags: ToolFlag.CANCELLABLE,
        execute: async ({ sectionId }) => {
          await publishAction(ctx, { type: "scroll", sectionId });
          return "Done, scrolling there now.";
        },
      }),
    ];

    const agent = voice.Agent.create({ instructions: INSTRUCTIONS, tools });

    const session = new voice.AgentSession({
      // Left at framework defaults (minDuration: 500ms) — an earlier, more
      // aggressive 300ms setting caused false interruptions from acoustic
      // echo (the agent's own voice leaking back into the mic through
      // speakers, especially without headphones), which cut the agent off
      // mid-word repeatedly. Robustness against echo/noise matters more
      // here than shaving another ~200ms off real barge-in reaction time.
      llm: new google.beta.realtime.RealtimeModel({
        model: "gemini-2.5-flash-native-audio-preview-12-2025",
        voice: "Puck",
        temperature: 0.7,
        // No extended reasoning before speaking — every ms here delays first audio.
        thinkingConfig: { thinkingBudget: 0 },
        // Tool calls never freeze the live session: the model can keep the
        // turn moving while search_knowledge/navigate/book_appointment run,
        // and their results get folded in without cutting off in-flight
        // generation ("WHEN_IDLE" — only speak the result once it's actually
        // idle, not by barging over its own filler speech).
        toolBehavior: Behavior.NON_BLOCKING,
        toolResponseScheduling: FunctionResponseScheduling.WHEN_IDLE,
        realtimeInputConfig: {
          automaticActivityDetection: {
            // LOW (provider default) start-of-speech sensitivity: HIGH was
            // tuned purely for barge-in latency and turned out to fire on
            // acoustic echo (the agent's own voice bleeding back into the
            // mic without headphones), causing a false-interrupt loop —
            // the agent would cut itself off after almost every word.
            // Robustness against echo matters more than shaving off the
            // last bit of reaction time; LOW still interrupts on genuine
            // speech, just not on brief echoed fragments.
            startOfSpeechSensitivity: StartSensitivity.START_SENSITIVITY_LOW,
            endOfSpeechSensitivity: EndSensitivity.END_SENSITIVITY_LOW,
            // A bit more silence required before ending the user's turn —
            // paired with LOW sensitivity, avoids reacting to short noise.
            silenceDurationMs: 600,
          },
          // Explicit (matches the API default): starting to speak always
          // cuts the agent off mid-response — never talk over the user.
          activityHandling: ActivityHandling.START_OF_ACTIVITY_INTERRUPTS,
          // Explicit (matches the API default): only actual speech counts
          // toward the user's turn, not silence in between.
          turnCoverage: TurnCoverage.TURN_INCLUDES_ONLY_ACTIVITY,
        },
      }),
    });

    // Structured latency metrics (EOU delay, time-to-first-audio-token,
    // interruption detection delay, ...) straight from the framework — see
    // @livekit/agents/metrics for the full field list per event type.
    session.on(AgentSessionEventTypes.MetricsCollected, (ev) => logMetrics(ev.metrics));

    await session.start({ agent, room: ctx.room });
    await ctx.connect();
    await session.generateReply({
      instructions: "Greet the user briefly as the NIVREN assistant and ask how you can help.",
    });
  },
});

cli.runApp(new ServerOptions({ agent: __filename }));
