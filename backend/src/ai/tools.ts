import type { Type as SchemaType } from "@google/genai";

/**
 * The controlled action registry — the ONLY things the assistant is allowed
 * to do beyond talking. No arbitrary JS execution, no unbounded input: every
 * tool has a strict parameter schema and, for navigate/book_appointment, a
 * server-side whitelist so a hallucinated route can never be sent to the
 * browser.
 *
 * - "search_knowledge" is a read tool: the backend executes it directly
 *   (RAG lookup) and feeds the result back to the model.
 * - "navigate" / "book_appointment" / "scroll_to_section" are client-executed
 *   actions: the backend only validates and forwards them — actual routing
 *   or scrolling happens in the browser, where the frontend owns the
 *   confirmation UX.
 * - "scroll_to_section" only ever gets a sectionId the model was already
 *   told is valid for the CURRENT page (see pageSections.ts and
 *   buildSystemInstruction in index.ts) — there's no fixed whitelist here
 *   because valid ids are page-dependent, unlike NAVIGABLE_ROUTES. An
 *   unknown id is harmless: the frontend's getElementById just no-ops.
 */

export const NAVIGABLE_ROUTES = [
  "/",
  "/about",
  "/services",
  "/departments",
  "/doctors",
  "/rcm",
  "/locations",
  "/appointment",
  "/contact",
  "/faq",
] as const;

export type NavigableRoute = (typeof NAVIGABLE_ROUTES)[number];

export function isNavigableRoute(path: string): path is NavigableRoute {
  return (NAVIGABLE_ROUTES as readonly string[]).includes(path);
}

export const toolDeclarations = [
  {
    name: "search_knowledge",
    description:
      "Search NIVREN's knowledge base (RCM services, hospital departments, FAQs, company info) for facts " +
      "needed to answer the user's question. Always use this before answering questions about NIVREN " +
      "specifically — never guess.",
    parameters: {
      type: "OBJECT" as SchemaType,
      properties: {
        query: { type: "STRING" as SchemaType, description: "What to search for, in the user's own words." },
      },
      required: ["query"],
    },
  },
  {
    name: "navigate",
    description:
      `Send the user to a page in the app. Only these exact paths are allowed: ${NAVIGABLE_ROUTES.join(", ")}. ` +
      "Use this when the user explicitly asks to go somewhere (e.g. \"open the services page\").",
    parameters: {
      type: "OBJECT" as SchemaType,
      properties: {
        path: { type: "STRING" as SchemaType, description: "One of the allowed paths, exactly as listed." },
      },
      required: ["path"],
    },
  },
  {
    name: "book_appointment",
    description:
      "Start the appointment booking flow. Navigates the user to the appointment page, optionally " +
      "pre-selecting a doctor. This does NOT submit anything by itself — the user still fills in and " +
      "submits the form themselves.",
    parameters: {
      type: "OBJECT" as SchemaType,
      properties: {
        doctorSlug: {
          type: "STRING" as SchemaType,
          description: "Optional doctor slug to pre-select, if the user named a specific doctor.",
        },
      },
      required: [],
    },
  },
  {
    name: "scroll_to_section",
    description:
      "Scroll to a specific content section within the CURRENT page (never a different page — use " +
      "navigate for that). Only call this with a sectionId that was explicitly listed as available for " +
      "the current page in your instructions — never guess or invent one.",
    parameters: {
      type: "OBJECT" as SchemaType,
      properties: {
        sectionId: {
          type: "STRING" as SchemaType,
          description: "The exact section id, exactly as listed for the current page.",
        },
      },
      required: ["sectionId"],
    },
  },
] as const;

export type ToolName = (typeof toolDeclarations)[number]["name"];

/** A tool call the model wants to make, before it's been validated/executed. */
export interface ToolCall {
  name: string;
  args: Record<string, unknown>;
}

/** An action the frontend must execute (navigation, opening the booking flow, scrolling to a section). */
export type ClientAction = { type: "navigate"; path: string } | { type: "scroll"; sectionId: string };

/** Validates a `navigate` / `book_appointment` / `scroll_to_section` call into a safe client action, or null if invalid. */
export function toClientAction(call: ToolCall): ClientAction | null {
  if (call.name === "navigate") {
    const path = String(call.args.path ?? "");
    return isNavigableRoute(path) ? { type: "navigate", path } : null;
  }
  if (call.name === "book_appointment") {
    const slug = call.args.doctorSlug ? String(call.args.doctorSlug) : "";
    const path = slug ? `/appointment?doctor=${encodeURIComponent(slug)}` : "/appointment";
    return { type: "navigate", path };
  }
  if (call.name === "scroll_to_section") {
    const sectionId = String(call.args.sectionId ?? "").trim();
    return sectionId ? { type: "scroll", sectionId } : null;
  }
  return null;
}
