import fetch from "node-fetch";
import * as cheerio from "cheerio";

export type CrawledPage = {
  url: string;  
  text: string;
};

function isSameDomain(root: URL, candidate: URL) {
  return root.hostname === candidate.hostname;
}

function extractTextFromHtml(html: string): string {
  const $ = cheerio.load(html);

  // Remove script/style/nav/footer/etc for cleaner text
  ["script", "style", "noscript", "nav", "footer"].forEach((tag) => $(tag).remove());

  const bodyText = $("body").text();
  // Collapse whitespace
  return bodyText.replace(/\s+/g, " ").trim();
}

export async function crawlWebsite(
  rootUrl: string,
  maxPages: number = 20
): Promise<CrawledPage[]> {
  const root = new URL(rootUrl);
  const visited = new Set<string>();
  const queue: string[] = [root.href];
  const pages: CrawledPage[] = [];

  while (queue.length > 0 && pages.length < maxPages) {
    const current = queue.shift()!;
    if (visited.has(current)) continue;
    visited.add(current);

    try {
      const res = await fetch(current);
      if (!res.ok) {
        console.warn("[crawl] Failed:", current, res.status);
        continue;
      }

      const html = await res.text();
      const text = extractTextFromHtml(html);
      if (text.length > 200) {
        pages.push({ url: current, text });
        console.log("[crawl] Collected:", current);
      }

      // Collect links for BFS
      const $ = cheerio.load(html);
      $("a[href]").each((_, el) => {
        const href = $(el).attr("href");
        if (!href) return;
        try {
          const url = new URL(href, root);
          if (
            isSameDomain(root, url) &&
            (url.protocol === "http:" || url.protocol === "https:")
          ) {
            const clean = url.href.split("#")[0]; // strip anchors
            if (!visited.has(clean) && !queue.includes(clean)) {
              queue.push(clean);
            }
          }
        } catch {
          // ignore invalid URLs
        }
      });
    } catch (err) {
      console.error("[crawl] Error fetching", current, err);
    }
  }

  return pages;
}