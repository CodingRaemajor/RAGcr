import type { VercelRequest, VercelResponse } from "@vercel/node";
import { cors } from "./cors";
import { crawlWebsite } from "../lib/crawler";
import { createEmbedding } from "../lib/embeddings";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (cors(req, res)) return;

  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

  const { message, url } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    let context = "";

    // OPTIONAL: RAG context from URL
    if (url) {
      const pages = await crawlWebsite(url);
      context = pages.map(p => p.content).join("\n").slice(0, 4000);
    }

    // (Embedding call here for future vector DB usage)
    await createEmbedding(message);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a helpful RAG-based assistant."
          },
          ...(context
            ? [
                {
                  role: "system",
                  content: `Context:\n${context}`
                }
              ]
            : []),
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.3
      })
    });

    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };

    return res.status(200).json({
      answer: data.choices?.[0]?.message?.content || "No response"
    });
  } catch (err: any) {
    return res.status(500).json({
      error: err.message || "Chat failed"
    });
  }
}