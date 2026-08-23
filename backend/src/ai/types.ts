/** Provider-agnostic chat message. */
export interface AIMessage {
  role: "user" | "assistant";
  content: string;
}

/** A single request to an AI provider. */
export interface AIGenerateRequest {
  /** Prior turns in the conversation, oldest first. Does not include the new user message. */
  history?: AIMessage[];
  /** The new user message for this turn. */
  message: string;
  /** Instructions that shape the assistant's behavior/persona for this call. */
  systemInstruction?: string;
  /** Extra grounding text (e.g. RAG chunks, page context) injected before the user message. */
  context?: string;
  /** Tool/function declarations the model may call, in provider-agnostic form. */
  tools?: unknown[];
}

export interface AIToolCall {
  name: string;
  args: Record<string, unknown>;
}

export interface AIGenerateResponse {
  text: string;
  toolCalls?: AIToolCall[];
}

/**
 * Provider-agnostic AI abstraction. Swapping LLM providers (Gemini today,
 * others later) means writing a new class that implements this interface —
 * nothing above this layer (routes, frontend) needs to change.
 */
export interface AIProvider {
  /** Non-streaming text generation — returns the full response at once. */
  generate(request: AIGenerateRequest): Promise<AIGenerateResponse>;

  /** Streaming text generation — yields text chunks as they arrive. */
  generateStream(request: AIGenerateRequest): AsyncGenerator<string, void, unknown>;
}
