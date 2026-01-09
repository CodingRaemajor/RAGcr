import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function embedText(text: string) {
  const embedding = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text.slice(0, 6000),
  });

  return embedding.data[0].embedding;
}
