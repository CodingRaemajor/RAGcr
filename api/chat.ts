import type { VercelRequest, VercelResponse } from "@vercel/node";
import OpenAI from "openai";
import { getStore } from "../lib/store";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Missing message" });
  }

  const docs = getStore();

  if (docs.length === 0) {
    return res.json({
      answer: "No website content indexed yet.",
    });
  }

  const context = docs.map(d => d.text).join("\n");

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "Answer using only the provided website content.",
      },
      {
        role: "user",
        content: `Context:\n${context}\n\nQuestion: ${message}`,
      },
    ],
  });

  return res.json({
    answer: completion.choices[0].message.content,
  });
}
