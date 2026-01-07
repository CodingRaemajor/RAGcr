// api/crawl.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import crawlWebsite from "../lib/crawler";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { url, maxPages } = req.body;

  if (!url || typeof url !== "string") {
    res.status(400).json({ error: "URL is required" });
    return;
  }

  try {
    const pages = await crawlWebsite(url, maxPages ?? 10);

    res.status(200).json({
      pagesIndexed: pages.length,
      preview: pages.slice(0, 3),
    });
  } catch (error: any) {
  console.error("Crawl error:", error.message);
  res.status(500).json({
    error: "Crawl failed",
    detail: error.message,
  });
}
}