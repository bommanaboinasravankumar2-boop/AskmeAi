# AskMeAI

> **"Ask anything. Get intelligent answers."**

AskMeAI is a clean, modern, and responsive AI chatbot web application built with React, TypeScript, Tailwind CSS, Express, and Google Gemini API. It is designed to work seamlessly on both Android mobile and desktop screens.

---

## Features

- ⚡ **Real Google Gemini Integration**: Uses the official `@google/genai` TypeScript SDK with streaming Server-Sent Events (SSE) for fast token generation. No hardcoded or fake responses.
- 🔒 **Zero Client-Side Secret Exposure**: Server-side proxy architecture (`server.ts`) ensures the `GEMINI_API_KEY` is never sent to the browser bundle or exposed in network traffic.
- 🧠 **Conversation Context Memory**: Retains multi-turn conversation context so the AI understands follow-up questions (e.g. asking "What is VLSI?" followed by "Where is it used?").
- 💬 **Smart History & Auto-Titling**: Automatically generates clean, descriptive titles for new chats from the first question (e.g. "Explain VLSI" becomes "VLSI Basics").
- 📱 **Mobile & Android Optimized**: Touch-friendly targets (min 44px), collapsible slide-over sidebar drawer, virtual keyboard-friendly multiline input, and zero horizontal scrolling.
- 🎨 **Markdown & Code Highlighting**: Full GitHub Flavored Markdown (tables, blockquotes, ordered/unordered lists, headings) and syntax-styled code blocks with a one-click **Copy Code** button.
- 📋 **AI Response Utilities**: One-click Copy for full AI responses, thumbs up / down feedback, regenerate response, and stop generation controls.
- 🌗 **Dark / Light / System Themes**: Smooth theme switching with automatic system preference detection and persistence.
- ⚙️ **Settings & API Status**: Visual status badge for `GEMINI_API_KEY` configuration, Google AI Studio free-tier usage guides, customizable system prompt persona, and JSON chat export.

---

## Architecture

- **Backend**: Express server (`server.ts`) providing `/api/status`, `/api/chat/stream`, and `/api/chat` endpoints, serving Vite middleware in development and static bundles in production.
- **Frontend**: React 19 SPA, TypeScript, Tailwind CSS, Lucide icons, `react-markdown` with `remark-gfm`.
- **Port**: 3000

---

## Getting Started

### 1. Obtain a Google Gemini API Key
1. Visit the Google AI Studio console at [https://aistudio.google.com](https://aistudio.google.com).
2. Sign in with your Google account.
3. Click **"Get API key"** and create a new key.
4. Google provides free-tier usage limits according to current policies (e.g., generous rate limits on Flash models).

### 2. Configure Environment Variables
Copy the `.env.example` file to `.env`:

```bash
cp .env.example .env
```

Add your Gemini API key to `.env`:

```env
GEMINI_API_KEY="your_actual_gemini_api_key_here"
PORT=3000
```

> **Security Note**: Never commit `.env` to version control. The `.gitignore` file is already pre-configured to ignore all `.env*` files except `.env.example`.

### 3. Install Dependencies & Run Locally

```bash
# Install dependencies
npm install

# Start the full-stack development server (Express + Vite)
npm run dev
```

Open your browser at `http://localhost:3000`.

---

## Production Build & Deployment

To prepare the application for production deployment:

```bash
# 1. Build client bundle
npm run build

# 2. Start the production server
npm start
```

### Deploying Safely to Cloud Hosting (Cloud Run / VPS / Docker)
- Ensure the environment variable `GEMINI_API_KEY` is set in your hosting platform's secrets manager.
- Expose port `3000` (or configure via the `PORT` environment variable).
- Since the server handles all API calls via internal proxy routes, the browser only ever talks to your own domain `/api/*`.

---

## Default System Instruction

AskMeAI is tuned with the following instruction:
> *"You are AskMeAI, a helpful, accurate, concise AI assistant. Understand the user's intent before answering. Give clear explanations and useful examples. If the user asks for code, provide working code and explain important parts. If information is uncertain, say so instead of inventing facts."*
