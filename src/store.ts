import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export type Chunk = {
  id: string;
  url: string;
  content: string;
  embedding: number[];
};

let chunks: Chunk[] = [];

// Safety cap: don't keep unlimited text per page (helps avoid huge token counts)
const MAX_CHARS_PER_PAGE = 8000;

// How many chunks to embed in one API call
const EMBEDDING_BATCH_SIZE = 100;

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

// Define the CrawledPage type
export type CrawledPage = {
  url: string;
  text: string;
};

export async function indexPages(pages: CrawledPage[]) {
  console.log("[store] Indexing pages:", pages.length);
  chunks = []; // reset in-memory index

  const allChunks: { content: string; url: string }[] = [];
  for (const page of pages) {
    // Truncate very long pages to avoid insane token counts
    const clippedText =
      page.text.length > MAX_CHARS_PER_PAGE
        ? page.text.slice(0, MAX_CHARS_PER_PAGE)
        : page.text;

    const pieces = chunkText(clippedText);
    for (const p of pieces) {
      allChunks.push({ content: p, url: page.url });
    }
  }

  if (allChunks.length === 0) {
    console.warn("[store] No chunks to index");
    return;
  }

  console.log("[store] Total chunks to embed:", allChunks.length);

  const model = "text-embedding-3-small";

  // Embed in batches so we never hit the 300k-token limit in one request
  for (let i = 0; i < allChunks.length; i += EMBEDDING_BATCH_SIZE) {
    const batch = allChunks.slice(i, i + EMBEDDING_BATCH_SIZE);
    const inputs = batch.map((c) => c.content);

    console.log(
      `[store] Embedding batch ${i}–${i + batch.length - 1} (size=${batch.length})`
    );

    const embeddingRes = await client.embeddings.create({
      model,
      input: inputs,
    });

    embeddingRes.data.forEach((d: { embedding: number[] }, idx: number) => {
      const globalIndex = i + idx;
      const src = batch[idx];

      chunks.push({
        id: `chunk-${globalIndex}`,
        url: src.url,
        content: src.content,
        embedding: d.embedding,
      });
    });
  }

  console.log("[store] Indexed chunks:", chunks.length);
}

export async function retrieveRelevantChunks(
  question: string,
  k: number = 5
): Promise<Chunk[]> {
  if (chunks.length === 0) return [];

  const embeddingRes = await client.embeddings.create({
    model: "text-embedding-3-small",
    input: [question],
  });

  const qEmbedding = embeddingRes.data[0].embedding;

  const scored = chunks.map((c) => ({
    chunk: c,
    score: cosineSimilarity(qEmbedding, c.embedding),
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, k).map((s) => s.chunk);
}