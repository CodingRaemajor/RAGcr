# 🧠 RAG Chatbot System (Local + Vercel)

This README describes how to run your **RAG chatbot** locally or on **Vercel** with:

- 🔍 `crawler.ts` to extract web page content
- 🧠 `store.ts` to embed content using OpenAI
- 🤖 `chat.ts` to retrieve & answer questions using GPT-4
- ✅ Working frontend connected via `NEXT_PUBLIC_API_URL`

---

## ⚙️ Backend Setup (RAGcr)

### 1. Install dependencies

```bash
pnpm install
```

### 2. Create `.env`

```
OPENAI_API_KEY=your-key-here
PORT=3001
```

### 3. Run backend

```bash
pnpm run dev
```

You’ll see:

```
RAG crawler chatbot server running on http://localhost:3001
```

---

## ☁️ Deploying to Vercel

The project now exposes Vercel Serverless Functions under `/api` so you can deploy without running a custom server.

### 1) Configure environment variables

In your Vercel project settings, add:

```
OPENAI_API_KEY=your-key-here
```

### 2) Deploy

- Push this repository to GitHub
- Import the repo in Vercel (framework: **Other**)
- Vercel will automatically build the `/api` functions.

### 3) Use the hosted endpoints

- Health check: `GET https://<your-vercel-domain>/api`
- Crawl: `POST https://<your-vercel-domain>/api/crawl`
- Chat: `POST https://<your-vercel-domain>/api/chat`

> ℹ️ Embeddings are stored in-memory inside the serverless function. They persist only while the function instance stays warm. For production, connect a database or vector store.

---

## 📦 Key Backend Files

| File | Purpose |
|------|---------|
| `crawler.ts` | Crawl pages & extract clean text |
| `store.ts` | Chunk text, create embeddings, in-memory search |
| `chat.ts` | Answer user questions with GPT-4 |
| `server.ts` | Express server with `/crawl` and `/chat` endpoints (local dev) |
| `api/*.ts` | Vercel serverless functions for `/api/crawl`, `/api/chat`, `/api` |

---

## 🧪 Backend Endpoints

### `POST /crawl`

```json
{
  "url": "https://www.uregina.ca/",
  "maxPages": 5
}
```

### `POST /chat`

```json
{
  "question": "What is this website about?"
}
```

---

## 💻 Frontend (Local Only)

Make sure your **frontend project** (e.g., built with Next.js) points to the backend.

In `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Start frontend:

```bash
pnpm dev
```

Then open:

```
http://localhost:3000
```

---

## 🧠 How Retrieval Works

- `crawler.ts` extracts readable text from all pages
- `store.ts` chunks the content, embeds with OpenAI (`text-embedding-3-small`)
- A user question is embedded and compared (cosine similarity)
- Top-k chunks passed into GPT-4 via system prompt + chat

---

## 🔒 Notes

- No database: embeddings stored in memory (reset on restart)
- No caching: embeddings recomputed per crawl
- Works with up to ~500 chunks comfortably

---

## ✅ To-Do (Optional Enhancements)

- Add SQLite or MongoDB to persist chunks
- Add Redis for caching
- Add daily scheduled crawling
- Limit crawl scope to avoid too large payloads
