// src/crawler.ts

import { JSDOM } from "jsdom";
import fetch from "node-fetch";

// Basic website crawler to get innerText
export async function crawlWebsite(url: string, maxPages = 20): Promise<{ url: string, text: string }[]> {
  const visited = new Set<string>();
  const toVisit = [url];
  const results = [];

  while (toVisit.length > 0 && visited.size < maxPages) {
    const currentUrl = toVisit.shift()!;
    if (visited.has(currentUrl)) continue;
    visited.add(currentUrl);

    try {
      const res = await fetch(currentUrl);
      const html = await res.text();
      const dom = new JSDOM(html);
      const text = dom.window.document.body.textContent || "";

      results.push({ url: currentUrl, text });

      // Add internal links to crawl
      const links = Array.from(dom.window.document.querySelectorAll("a"))
        .map(a => a.href)
        .filter(href => href.startsWith(url) && !visited.has(href));

      toVisit.push(...links);
    } catch (err) {
      console.error(`Failed to crawl ${currentUrl}:`, err);
    }
  }

  return results;
}