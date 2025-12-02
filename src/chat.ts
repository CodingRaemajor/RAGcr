import OpenAI from "openai";
import { retrieveRelevantChunks } from "./store";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function answerQuestion(question: string): Promise<string> {
  const relevantChunks = await retrieveRelevantChunks(question, 6);

  if (relevantChunks.length === 0) {
    return "I don't have any information indexed yet. Please crawl a website first.";
  }

  const context = relevantChunks
    .map(
      (c, i) =>
        `# Source ${i + 1} (${c.url})\n${c.content}`
    )
    .join("\n\n---\n\n");

  const systemPrompt = `
You are a helpful RAG assistant. 
You ONLY answer using the context from the website below. 
If the answer is not in the context, say you don't know and suggest reading the website.

Context:
${context}
  `.trim();

  const res = await client.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: question }
    ]
  });

  return res.choices[0]?.message?.content ?? "Sorry, I could not generate an answer.";
}