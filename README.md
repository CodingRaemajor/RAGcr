# 🧠 RAG Chatbot System (Local Setup)

This README describes how to run your **local RAG chatbot** with:

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

## 📦 Key Backend Files

| File | Purpose |
|------|---------|
| `crawler.ts` | Crawl pages & extract clean text |
| `store.ts` | Chunk text, create embeddings, in-memory search |
| `chat.ts` | Answer user questions with GPT-4 |
| `index.ts` | Express server with `/crawl` and `/chat` endpoints |

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
