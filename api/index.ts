import type { VercelRequest, VercelResponse } from "@vercel/node";
import { embedText } from "../lib/embeddings";
import { addToStore } from "../lib/store";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: "Missing text" });
  }

  try {
    const embedding = await embedText(text);
    addToStore({ text, embedding });

    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({
      error: "Embedding failed",
      details: err.message,
    });
  }
}
