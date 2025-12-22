export async function crawlWebsite(url: string) {
  const res = await fetch(url);
  const html = await res.text();

  // VERY basic text extraction (Vercel-safe)
  const text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return [
    {
      url,
      content: text.slice(0, 5000) // prevent timeout
    }
  ];
}