import "dotenv/config";
import express from "express";
import cors from "cors";                         // 👈 NEW
import { crawlWebsite } from "./crawler";
import { indexPages } from "./store";
import { answerQuestion } from "./chat";

const app = express();

// ✅ Allow requests from your frontend (localhost:3000) or anything (for dev)
app.use(
  cors({
    origin: "*",                                // you can restrict later
  })
);

app.use(express.json());

app.get("/", (_req: any, res: any) => {
  res.json({
    status: "ok",
    message: "RAG crawler/chatbot running. Use POST /crawl and POST /chat.",
  });
});

// Crawl and index a site
app.post("/crawl", async (req: any, res: any) => {
  try {
    const { url, maxPages } = req.body;

    if (!url) {
      return res.status(400).json({ error: "Missing 'url' in body." });
    }

    console.log("[/crawl] Starting crawl:", url);
    const pages = await crawlWebsite(url, maxPages ?? 20);
    await indexPages(pages);

    res.json({
      message: "Crawl and indexing completed.",
      pagesIndexed: pages.length,
    });
  } catch (err: any) {
    console.error("[/crawl] Error:", err);
    res
      .status(500)
      .json({ error: "Failed to crawl site", details: err?.message });
  }
});

// Ask a question using RAG
app.post("/chat", async (req: any, res: any) => {
  try {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ error: "Missing 'question' in body." });
    }

    console.log("[/chat] Question:", question);
    const answer = await answerQuestion(question);
    res.json({ answer });
  } catch (err: any) {
    console.error("[/chat] Error:", err);
    res
      .status(500)
      .json({ error: "Failed to answer question", details: err?.message });
  }
});

const port = Number(process.env.PORT) || 3001;
app.listen(port, () => {
  console.log(`RAG crawler chatbot server running on http://localhost:${port}`);
});