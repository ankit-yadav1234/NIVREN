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

/**
 * Keyword & Semantic Token Matcher fallback when Embedding API quota is exhausted.
 */
function fallbackKeywordSearch(query: string, topK = 3): KnowledgeDoc[] {
  const queryWords = query
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 2);

  if (queryWords.length === 0) return knowledgeBase.slice(0, topK);

  const scored = knowledgeBase.map((doc) => {
    const textLower = (doc.text + " " + doc.category + " " + doc.id).toLowerCase();
    let score = 0;
    for (const word of queryWords) {
      if (textLower.includes(word)) {
        score += word.length > 4 ? 2 : 1;
      }
    }
    return { doc, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((s) => s.doc);
}

async function buildIndex(client: GoogleGenAI): Promise<IndexedDoc[]> {
  try {
    const response = await client.models.embedContent({
      model: EMBEDDING_MODEL,
      contents: knowledgeBase.map((d) => d.text),
    });
    const embeddings = response.embeddings ?? [];
    return knowledgeBase.map((doc, i) => ({
      ...doc,
      vector: embeddings[i]?.values ?? [],
    }));
  } catch (err) {
    console.warn("Embedding index build skipped (using fast keyword fallback):", (err as Error)?.message);
    return [];
  }
}

export function warmIndex(): void {
  if (index || indexing) return;
  try {
    indexing = buildIndex(getClient());
    indexing.catch(() => {
      indexing = null;
    });
  } catch (_) {}
}

export async function retrieveContext(query: string, topK = 3): Promise<KnowledgeDoc[]> {
  try {
    const client = getClient();
    if (!index || index.length === 0) {
      if (!indexing) indexing = buildIndex(client);
      index = await indexing;
    }

    if (index.length > 0) {
      const queryEmbedding = await client.models.embedContent({
        model: EMBEDDING_MODEL,
        contents: [query],
      });
      const queryVector = queryEmbedding.embeddings?.[0]?.values ?? [];
      if (queryVector.length > 0) {
        const matches = [...index]
          .map((doc) => ({ doc, score: cosineSimilarity(queryVector, doc.vector) }))
          .sort((a, b) => b.score - a.score)
          .slice(0, topK)
          .filter((r) => r.score > 0.45)
          .map((r) => r.doc);

        if (matches.length > 0) return matches;
      }
    }
  } catch (err) {
    // Embedding quota exceeded or network error -> seamlessly use keyword fallback
  }

  return fallbackKeywordSearch(query, topK);
}
