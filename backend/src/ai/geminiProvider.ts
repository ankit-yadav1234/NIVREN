import { GoogleGenAI, type FunctionDeclaration } from "@google/genai";
import type { AIGenerateRequest, AIGenerateResponse, AIMessage, AIProvider } from "./types";

const DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

function toContents(history: AIMessage[] | undefined, message: string, context: string | undefined) {
  const contents = (history ?? []).map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const userText = context ? `Context:\n${context}\n\nUser: ${message}` : message;
  contents.push({ role: "user", parts: [{ text: userText }] });
  return contents;
}

/** Gemini implementation of {@link AIProvider}. Requires GOOGLE_API_KEY (server-side only). */
export class GeminiProvider implements AIProvider {
  private client: GoogleGenAI;

  constructor(apiKey: string) {
    if (!apiKey) throw new Error("GOOGLE_API_KEY is required to construct GeminiProvider.");
    this.client = new GoogleGenAI({ apiKey });
  }

  async generate(request: AIGenerateRequest): Promise<AIGenerateResponse> {
    const response = await this.client.models.generateContent({
      model: DEFAULT_MODEL,
      contents: toContents(request.history, request.message, request.context),
      config: {
        systemInstruction: request.systemInstruction,
        tools: request.tools?.length
          ? [{ functionDeclarations: request.tools as FunctionDeclaration[] }]
          : undefined,
      },
    });
    const toolCalls = response.functionCalls?.map((c) => ({
      name: c.name ?? "",
      args: (c.args ?? {}) as Record<string, unknown>,
    }));
    return { text: response.text ?? "", toolCalls: toolCalls?.length ? toolCalls : undefined };
  }

  async *generateStream(request: AIGenerateRequest): AsyncGenerator<string, void, unknown> {
    const stream = await this.client.models.generateContentStream({
      model: DEFAULT_MODEL,
      contents: toContents(request.history, request.message, request.context),
      config: request.systemInstruction
        ? { systemInstruction: request.systemInstruction }
        : undefined,
    });
    for await (const chunk of stream) {
      const text = chunk.text;
      if (text) yield text;
    }
  }
}

let cached: GeminiProvider | null = null;

/** Lazily constructs a single shared GeminiProvider instance from GOOGLE_API_KEY. */
export function getAIProvider(): AIProvider {
  if (!cached) {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error("GOOGLE_API_KEY is not set. Add it to backend/.env (see .env.example).");
    }
    cached = new GeminiProvider(apiKey);
  }
  return cached;
}
