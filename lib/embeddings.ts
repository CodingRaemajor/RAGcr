import OpenAI from 'openai'
import { saveChunks, getAllChunks } from './store'

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function embedTexts(texts: string[]) {
  const response = await client.embeddings.create({
    model: 'text-embedding-3-small',
    input: texts
  })

  const chunks = texts.map((text, i) => ({
    text,
    embedding: response.data[i].embedding
  }))

  saveChunks(chunks)
}

function cosineSimilarity(a: number[], b: number[]) {
  const dot = a.reduce((sum, v, i) => sum + v * b[i], 0)
  const normA = Math.sqrt(a.reduce((s, v) => s + v * v, 0))
  const normB = Math.sqrt(b.reduce((s, v) => s + v * v, 0))
  return dot / (normA * normB)
}

export async function getRelevantChunks(query: string, topK = 4) {
  const queryEmbedding = (
    await client.embeddings.create({
      model: 'text-embedding-3-small',
      input: query
    })
  ).data[0].embedding

  const chunks = getAllChunks()

  return chunks
    .map(chunk => ({
      ...chunk,
      score: cosineSimilarity(chunk.embedding, queryEmbedding)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
}
