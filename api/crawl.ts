import type { VercelRequest, VercelResponse } from '@vercel/node'
import { crawlWebsite } from '../lib/crawler'

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { url } = req.body

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL is required' })
  }

  try {
    const pages = await crawlWebsite(url)
    return res.status(200).json({ pages })
  } catch (error: any) {
    console.error('Crawl error:', error)
    return res.status(500).json({ error: 'Failed to crawl website' })
  }
}
