import fetch from 'node-fetch'
import { load } from 'cheerio'

export async function crawlWebsite(url: string): Promise<string[]> {
  const res = await fetch(url)
  const html = await res.text()

  const $ = load(html)
  const texts: string[] = []

  $('p').each((_, el) => {
    const text = $(el).text().trim()
    if (text.length > 50) texts.push(text)
  })

  return texts
}
