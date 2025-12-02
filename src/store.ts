import OpenAI from "openai";
import { CrawledPage } from "./crawler";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export type Chunk = {
  id: string;
  url: string;
  content: string;
  embedding: number[];
};

let chunks: Chunk[] = [];

function chunkText(text: string, size = 1000, overlap = 200): string[] {
  const result: string[] = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + size, text.length);
    const slice = text.slice(start, end).trim();
    if (slice.length > 200) {
      result.push(slice);
    }
    start += size - overlap;
  }
  return result;
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (!normA || !normB) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function indexPages(pages: CrawledPage[]) {
  console.log("[store] Indexing pages:", pages.length);
  chunks = []; // reset in-memory index

  const allChunks: { content: string; url: string }[] = [];
  for (const page of pages) {
    const pieces = chunkText(page.text);
    for (const p of pieces) {
      allChunks.push({ content: p, url: page.url });
    }
  }

  if (allChunks.length === 0) {
    console.warn("[store] No chunks to index");
    return;
  }

  const inputs = allChunks.map((c) => c.content);

  const embeddingRes = await client.embeddings.create({
    model: "text-embedding-3-small",
    input: inputs
  });

  const vectors = embeddingRes.data.map((d) => d.embedding);

  chunks = allChunks.map((c, i) => ({
    id: `chunk-${i}`,
    url: c.url,
    content: c.content,
    embedding: vectors[i]
  }));

  console.log("[store] Indexed chunks:", chunks.length);
}

export async function retrieveRelevantChunks(
  question: string,
  k: number = 5
): Promise<Chunk[]> {
  if (chunks.length === 0) return [];

  const embeddingRes = await client.embeddings.create({
    model: "text-embedding-3-small",
    input: [question]
  });

  const qEmbedding = embeddingRes.data[0].embedding;

  const scored = chunks.map((c) => ({
    chunk: c,
    score: cosineSimilarity(qEmbedding, c.embedding)
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, k).map((s) => s.chunk);
}