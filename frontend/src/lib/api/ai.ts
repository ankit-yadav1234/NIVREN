import { apiFetch } from "./client";

export interface AIMessage {
  role: "user" | "assistant";
  content: string;
}

export type AIClientAction = { type: "navigate"; path: string } | { type: "scroll"; sectionId: string };

export interface AIChatResult {
  reply: string;
  actions: AIClientAction[];
}

export interface AIPageContext {
  route: string;
  title: string;
}

/** Send a message to the NIVREN AI assistant. May return client actions (e.g. navigate) to execute. */
export async function sendAIMessage(
  message: string,
  history: AIMessage[],
  pageContext: AIPageContext,
): Promise<AIChatResult> {
  return apiFetch<AIChatResult>("/api/ai/chat", {
    method: "POST",
    body: JSON.stringify({ message, history, pageContext }),
  });
}
