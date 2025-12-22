import type { VercelRequest, VercelResponse } from "@vercel/node";
import { cors } from "./cors";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (cors(req, res)) return;

  return res.status(200).json({
    status: "OK",
    message: "RAGcr API running on Vercel"
  });
}