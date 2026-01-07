// lib/crawler.ts
import fetch from "node-fetch";
import { load } from "cheerio";

export default async function crawlWebsite(
  url: string,
  maxPages = 10
): Promise<string[]> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch website");
  }

  const html = await response.text();
  const $ = load(html);

  const texts: string[] = [];

  $("p").each((_, el) => {
    const text = $(el).text().trim();
    if (text.length > 50) {
      texts.push(text);
    }
  });

  return texts.slice(0, maxPages);
}
