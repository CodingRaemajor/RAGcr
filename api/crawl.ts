import type { VercelRequest, VercelResponse } from "@vercel/node";
import crawlWebsite from "../lib/crawler";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { url } = req.body;

  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "Invalid URL" });
  }

  try {
    const pages = await crawlWebsite(url);

    return res.status(200).json({
      success: true,
      pagesIndexed: pages.length,
      preview: pages,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: "Failed to crawl website",
      details: err.message,
    });
  }
}
