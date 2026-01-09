import fetch from "node-fetch";
import * as cheerio from "cheerio";

export type CrawledPage = {
  url: string;
  text: string;
};

export default async function crawlWebsite(url: string): Promise<CrawledPage[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000); // Vercel-safe

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
        Accept: "text/html",
      },
    });

    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    // Remove junk
    $("script, style, nav, footer, header, noscript").remove();

    const text = $("body")
      .text()
      .replace(/\s+/g, " ")
      .trim();

    if (!text) {
      throw new Error("No readable text found");
    }

    return [
      {
        url,
        text: text.slice(0, 6000), // HARD CAP
      },
    ];
  } catch (err) {
    console.error("Crawler error:", err);
    throw err;
  }
}
