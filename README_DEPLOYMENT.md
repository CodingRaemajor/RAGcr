# RAG Crawler + Next.js Frontend Deployment Guide

This README explains how to properly set up, run, and deploy the **RAG Crawler Backend (Express)** and **Next.js Frontend (Vercel)**.

---

# 🚀 Project Overview

You are building a 2‑part system:

1. **Backend (RAGcr folder)**
   - Express server
   - Crawls websites
   - Generates embeddings
   - Provides `/crawl` and `/chat` endpoints
   - Cannot be hosted on Vercel Serverless as-is

2. **Frontend (Next.js on Vercel)**
   - UI for entering URLs
   - Chat UI for querying the crawled site
   - Hosted on Vercel
   - Talks to your backend via `NEXT_PUBLIC_API_URL`

---

# 📦 Backend Setup (Local or External Host)

### 1. Install dependencies

```powershell
cd "C:\Users\ipart\OneDrive\Desktop\RAGcr"
pnpm install
```

### 2. Add environment variables

Create a file:

```
.env
```

Contents:

```env
OPENAI_API_KEY=your-key-here
PORT=3001
```

### 3. Run backend locally

```powershell
pnpm run dev
```

You should see:

```
RAG crawler chatbot server running on http://localhost:3001
```

### 4. Backend endpoints

#### **POST /crawl**

```json
{
  "url": "https://www.uregina.ca/",
  "maxPages": 5
}
```

#### **POST /chat**

```json
{
  "question": "What is this website about?"
}
```

---

# 🌐 Backend Deployment (IMPORTANT)

You **cannot** deploy the backend directly to Vercel — it will fail with:

```
FUNCTION_INVOCATION_FAILED
```

Instead, host your backend on:

- Render.com (recommended free tier)
- Railway.app
- Fly.io
- Your own VPS / EC2

Then the backend gets a public URL like:

```
https://rag-backend.onrender.com
```

You will use this URL in your Next.js frontend.

---

# 🖥️ Frontend Setup (Next.js App for Vercel)

### 1. Create your Next.js app

```bash
npx create-next-app@latest rag-web-ui --typescript
cd rag-web-ui
```

### 2. Add environment variable

Create:

```
.env.local
```

Contents:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

When deploying to Vercel, change it to your hosted backend URL:

```env
NEXT_PUBLIC_API_URL=https://rag-backend.onrender.com
```

---

# 🎨 Frontend UI Features

- Input field for website URL
- Button to crawl & index
- Live chat UI
- Messages aligned left/right
- “Bot is thinking…” indicators
- Fully responsive, modern UI

---

# 🚀 Running the Full System (Local Dev)

### Terminal #1 → Start backend

```powershell
cd "C:\Users\ipart\OneDrive\Desktop\RAGcr"
pnpm run dev
```

### Terminal #2 → Start frontend

```powershell
cd rag-web-ui
pnpm dev
```

Open:

```
http://localhost:3000
```

---

# 🌍 Deploying the Frontend to Vercel

### 1. Push your `rag-web-ui` folder to GitHub

### 2. Go to Vercel → New Project → Import repo

### 3. Add environment variable:

```env
NEXT_PUBLIC_API_URL=https://rag-backend.onrender.com
```

### 4. Deploy
Vercel will build and host the UI globally.

---

# ❌ DO NOT DEPLOY BACKEND TO Vercel

The backend uses an Express server:

```
app.listen(...)
```

Vercel serverless functions cannot run a persistent server.

Hence:

- **Backend → Render/Railway**
- **Frontend → Vercel**

---

# 🎯 Summary

| Component | Host | Purpose |
|----------|------|---------|
| **Express Backend (RAGcr)** | Render/Railway/Local | Crawling, embeddings, answers |
| **Next.js Frontend** | Vercel | UI for chatbot + crawl controls |

This ensures everything works properly across both environments.

---

# 📁 Files Included

This README is included as a downloadable `.md` file named:

```
README_DEPLOYMENT.md
```
