# AeUI

Describe a UI component in plain English and get React code back, with a live preview next to it.

**Live:** https://ae-ui.vercel.app

## How it works

1. You write a prompt, such as "a pricing card with three tiers", and choose a styling mode (Tailwind, Bootstrap or plain CSS).
2. A Next.js API route (`/api/generate`) sends it to Groq with a strict system prompt that asks for a single `GeneratedComponent`.
3. The code is rendered in a sandboxed iframe using React UMD and Babel standalone, so you see the result without a build step.

## Stack

Next.js 14 (pages router), React 18, Groq chat completions API.

## Run locally

```bash
cd frontend
cat > .env.local <<ENV
GROQ_API_KEY=your_key
GROQ_MODEL=llama-3.3-70b-versatile
ENV
npm install
npm run dev
```

Open http://localhost:3000.
