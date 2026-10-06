import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV === 'production';
const port = parseInt(process.env.PORT || '3000', 10);

const PRIMARY_MODEL = 'gemini-3.8-flash';
const FALLBACK_MODEL = 'gemini-3.1-flash-lite';

const DEFAULT_SYSTEM_INSTRUCTION =
  'You are AskMeAI, a helpful, accurate, concise AI assistant. Understand the user\'s intent before answering. Give clear explanations and useful examples. If the user asks for code, provide working code and explain important parts. If information is uncertain, say so instead of inventing facts.';

function getErrorMessage(error: any): { message: string; statusCode: number } {
  const errMsg = String(error?.message || error || '').toLowerCase();
  const status = error?.status || error?.statusCode;

  if (
    errMsg.includes('api_key_invalid') ||
    errMsg.includes('invalid api key') ||
    errMsg.includes('api key not valid') ||
    errMsg.includes('unauthenticated') ||
    status === 401 ||
    status === 403
  ) {
    return {
      message: 'Your Gemini API key is invalid or unavailable.',
      statusCode: 401,
    };
  }

  if (
    errMsg.includes('quota') ||
    errMsg.includes('resource_exhausted') ||
    errMsg.includes('rate limit') ||
    status === 429
  ) {
    return {
      message: 'API usage limit reached. Please try again later or check your Gemini API quota.',
      statusCode: 429,
    };
  }

  if (
    errMsg.includes('enotfound') ||
    errMsg.includes('econnrefused') ||
    errMsg.includes('fetch failed') ||
    errMsg.includes('network') ||
    errMsg.includes('timeout')
  ) {
    return {
      message: 'Unable to connect to the AI service. Check your internet connection.',
      statusCode: 503,
    };
  }

  if (errMsg.includes('high demand') || status === 503 || errMsg.includes('unavailable')) {
    return {
      message: 'The AI model is experiencing temporary high demand. Please try again in a moment.',
      statusCode: 503,
    };
  }

  return {
    message: 'Something went wrong while generating the response.',
    statusCode: 500,
  };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // Helper to check API key
  const hasValidKey = () => {
    const key = process.env.GEMINI_API_KEY;
    return !!key && key.trim() !== '' && key !== 'MY_GEMINI_API_KEY';
  };

  // Status check endpoint
  app.get('/api/status', (_req, res) => {
    const configured = hasValidKey();
    res.json({
      configured,
      model: PRIMARY_MODEL,
      appName: 'AskMeAI',
      version: '1.0.0',
      message: configured
        ? 'API key configured'
        : 'Gemini API key is not configured. Add your API key to the environment configuration.',
    });
  });

  // Streaming Chat endpoint (Server-Sent Events)
  app.post('/api/chat/stream', async (req, res) => {
    if (!hasValidKey()) {
      res.status(503).json({
        error: 'Gemini API key is not configured. Add your API key to the environment configuration.',
      });
      return;
    }

    const { messages, systemInstruction } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: 'Please provide messages for the conversation.' });
      return;
    }

    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const formattedContents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'model' || m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content || '' }],
    }));

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const config = {
      systemInstruction: systemInstruction || DEFAULT_SYSTEM_INSTRUCTION,
    };

    let didStreamChunks = false;
    const modelsToTry = [PRIMARY_MODEL, FALLBACK_MODEL];

    for (const model of modelsToTry) {
      try {
        const stream = await ai.models.generateContentStream({
          model,
          contents: formattedContents,
          config,
        });

        for await (const chunk of stream) {
          if (chunk.text) {
            didStreamChunks = true;
            res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
          }
        }

        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        res.end();
        return;
      } catch (err: any) {
        console.warn(`Streaming attempt with ${model} failed:`, err?.message || err);
        if (didStreamChunks) {
          // If we already sent chunks to client, don't restart with another model mid-stream
          const { message } = getErrorMessage(err);
          res.write(`data: ${JSON.stringify({ error: message })}\n\n`);
          res.end();
          return;
        }
        // If no chunks were sent yet and there is a fallback model left, try next model
        if (model === modelsToTry[modelsToTry.length - 1]) {
          const { message } = getErrorMessage(err);
          res.write(`data: ${JSON.stringify({ error: message })}\n\n`);
          res.end();
          return;
        }
      }
    }
  });

  // Non-streaming Chat endpoint fallback
  app.post('/api/chat', async (req, res) => {
    if (!hasValidKey()) {
      res.status(503).json({
        error: 'Gemini API key is not configured. Add your API key to the environment configuration.',
      });
      return;
    }

    const { messages, systemInstruction } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: 'Please provide messages for the conversation.' });
      return;
    }

    const formattedContents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'model' || m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content || '' }],
    }));

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const config = {
      systemInstruction: systemInstruction || DEFAULT_SYSTEM_INSTRUCTION,
    };

    const modelsToTry = [PRIMARY_MODEL, FALLBACK_MODEL];
    let lastError: any = null;

    for (const model of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: formattedContents,
          config,
        });

        res.json({
          text: response.text || '',
        });
        return;
      } catch (err: any) {
        console.warn(`Unary generation with ${model} failed:`, err?.message || err);
        lastError = err;
      }
    }

    const { message, statusCode } = getErrorMessage(lastError);
    res.status(statusCode).json({ error: message });
  });

  // Mount Vite or serve static
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`AskMeAI Server running on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
