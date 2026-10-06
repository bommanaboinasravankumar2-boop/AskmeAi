export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  error?: boolean;
  errorMessage?: string;
  feedback?: 'like' | 'dislike' | null;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
}

export type ThemeMode = 'light' | 'dark' | 'system';

export interface APIStatusResponse {
  configured: boolean;
  model: string;
  appName: string;
  version: string;
  message: string;
}

export interface ChatSettings {
  theme: ThemeMode;
  systemInstruction: string;
  streamResponse: boolean;
}
