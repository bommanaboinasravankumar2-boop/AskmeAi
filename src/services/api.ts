import { APIStatusResponse, Message } from '../types/chat';

export async function fetchAPIStatus(): Promise<APIStatusResponse> {
  try {
    const res = await fetch('/api/status');
    if (!res.ok) {
      throw new Error(`Status check failed with code ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    return {
      configured: false,
      model: 'gemini-3.8-flash',
      appName: 'AskMeAI',
      version: '1.0.0',
      message: 'Unable to connect to the AI service. Check your internet connection.',
    };
  }
}

export interface StreamCallbacks {
  onChunk: (text: string) => void;
  onError: (errorMsg: string) => void;
  onDone: () => void;
}

export async function streamChatCompletion(
  messages: Array<{ role: 'user' | 'model'; content: string }>,
  systemInstruction: string | undefined,
  callbacks: StreamCallbacks,
  signal?: AbortSignal
): Promise<void> {
  try {
    const response = await fetch('/api/chat/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        systemInstruction,
      }),
      signal,
    });

    if (!response.ok) {
      let errMsg = 'Something went wrong while generating the response.';
      try {
        const data = await response.json();
        if (data.error) errMsg = data.error;
      } catch {
        if (response.status === 503) {
          errMsg = 'Gemini API key is not configured. Add your API key to the environment configuration.';
        } else if (response.status === 429) {
          errMsg = 'API usage limit reached. Please try again later or check your Gemini API quota.';
        } else if (response.status === 401 || response.status === 403) {
          errMsg = 'Your Gemini API key is invalid or unavailable.';
        }
      }
      callbacks.onError(errMsg);
      return;
    }

    if (!response.body) {
      callbacks.onError('Unable to connect to the AI service. Check your internet connection.');
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data:')) continue;

        const dataStr = trimmed.slice(5).trim();
        try {
          const parsed = JSON.parse(dataStr);
          if (parsed.error) {
            callbacks.onError(parsed.error);
            return;
          }
          if (parsed.text) {
            callbacks.onChunk(parsed.text);
          }
          if (parsed.done) {
            callbacks.onDone();
            return;
          }
        } catch {
          // ignore incomplete json chunk parse error
        }
      }
    }

    callbacks.onDone();
  } catch (error: any) {
    if (signal?.aborted) {
      // User aborted generation, call onDone gracefully
      callbacks.onDone();
      return;
    }

    const msg = error?.message || '';
    if (msg.includes('abort')) {
      callbacks.onDone();
    } else {
      callbacks.onError('Unable to connect to the AI service. Check your internet connection.');
    }
  }
}
