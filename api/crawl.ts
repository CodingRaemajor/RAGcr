import type { VercelRequest, VercelResponse } from "@vercel/node";
import { cors } from "./cors";
import { crawlWebsite } from "../lib/crawler";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (cors(req, res)) return;

  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL required" });
  }

  try {
    const pages = await crawlWebsite(url);

    return res.status(200).json({
      success: true,
      pagesCrawled: pages.length,
      data: pages
    });
  } catch (err: any) {
    return res.status(500).json({
      error: err.message || "Crawl failed"
    });
  }
}