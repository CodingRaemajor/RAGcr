// api/chat.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getRelevantChunks } from '../lib/embeddings';
import { askQuestion } from '../lib/chat';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { question } = req.body;

  if (!question || typeof question !== 'string') {
    return res.status(400).json({ error: 'Question is required' });
  }

  try {
    const chunks = await getRelevantChunks(question);
    const answer = await askQuestion(question, chunks);

    return res.status(200).json({ answer });
  } catch (error: any) {
    console.error('Chat error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
