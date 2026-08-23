import { GoogleGenAI } from "@google/genai";
import { knowledgeBase, type KnowledgeDoc } from "./knowledge";

const EMBEDDING_MODEL = "gemini-embedding-001";

interface IndexedDoc extends KnowledgeDoc {
  vector: number[];
}

let index: IndexedDoc[] | null = null;
let indexing: Promise<IndexedDoc[]> | null = null;

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB) || 1);
}

let sharedClient: GoogleGenAI | null = null;
function getClient(): GoogleGenAI {
  if (!sharedClient) {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) throw new Error("GOOGLE_API_KEY is not set.");
    sharedClient = new GoogleGenAI({ apiKey });
  }
  return sharedClient;
}

async function buildIndex(client: GoogleGenAI): Promise<IndexedDoc[]> {
  const response = await client.models.embedContent({
    model: EMBEDDING_MODEL,
    contents: knowledgeBase.map((d) => d.text),
  });
  const embeddings = response.embeddings ?? [];
  return knowledgeBase.map((doc, i) => ({
    ...doc,
    vector: embeddings[i]?.values ?? [],
  }));
}

/**
 * Kicks off the (one-time) embedding build in the background without
 * blocking the caller. Call this once at process startup — the voice agent
 * in particular can't afford to pay this cold-start cost inside a live
 * call's first search_knowledge tool call.
 */
export function warmIndex(): void {
  if (index || indexing) return;
  indexing = buildIndex(getClient());
  indexing.catch(() => {
    indexing = null; // let the next retrieveContext() retry
  });
}

/**
 * Retrieves the top-k most relevant knowledge documents for a query.
 * The embedding index is built once (lazily, on first call, or eagerly via
 * warmIndex()) and cached — the knowledge base is small and static, so
 * there's no need to re-embed on every request.
 */
export async function retrieveContext(query: string, topK = 3): Promise<KnowledgeDoc[]> {
  const client = getClient();
  if (!index) {
    if (!indexing) indexing = buildIndex(client);
    index = await indexing;
  }

  const queryEmbedding = await client.models.embedContent({
    model: EMBEDDING_MODEL,
    contents: [query],
  });
  const queryVector = queryEmbedding.embeddings?.[0]?.values ?? [];
  if (queryVector.length === 0) return [];

  return [...index]
    .map((doc) => ({ doc, score: cosineSimilarity(queryVector, doc.vector) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .filter((r) => r.score > 0.5)
    .map((r) => r.doc);
}
