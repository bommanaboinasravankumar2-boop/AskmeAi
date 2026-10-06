import React from 'react';
import {
  Sparkles,
  Plus,
  Settings,
  PanelLeftClose,
  PanelLeft,
  Sun,
  Moon,
  Laptop,
} from 'lucide-react';
import { ThemeMode } from '../types/chat';

interface HeaderProps {
  onNewChat: () => void;
  onOpenSettings: () => void;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  themeMode: ThemeMode;
  onToggleTheme: () => void;
  isApiConfigured: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onNewChat,
  onOpenSettings,
  isSidebarOpen,
  onToggleSidebar,
  themeMode,
  onToggleTheme,
  isApiConfigured,
}) => {
  return (
    <header className="sticky top-0 z-20 flex h-14 sm:h-16 items-center justify-between border-b border-neutral-200/80 bg-white/80 px-3 sm:px-5 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/80 transition-colors">
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={onToggleSidebar}
          aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100 transition cursor-pointer"
          title={isSidebarOpen ? 'Hide conversation history' : 'Show conversation history'}
        >
          {isSidebarOpen ? (
            <PanelLeftClose className="h-5 w-5" />
          ) : (
            <PanelLeft className="h-5 w-5" />
          )}
        </button>

        <div className="flex items-center gap-2 select-none">
          <div className="relative flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-violet-500 shadow-sm shadow-indigo-500/20 text-white font-bold">
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
            <span
              className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-neutral-900 ${
                isApiConfigured ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
              title={isApiConfigured ? 'Gemini API is configured' : 'API Key check pending/warning'}
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold tracking-tight text-neutral-900 dark:text-white text-base sm:text-lg">
                AskMe<span className="text-cyan-500">AI</span>
              </span>
              <span className="hidden sm:inline-block rounded-full bg-cyan-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-cyan-800 dark:bg-cyan-950/70 dark:text-cyan-300">
                Gemini
              </span>
            </div>
            <p className="hidden md:block text-[11px] text-neutral-500 dark:text-neutral-400 -mt-0.5">
              Ask anything. Get intelligent answers.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          onClick={onNewChat}
          className="flex items-center gap-1.5 rounded-lg bg-neutral-900 px-3 py-1.5 text-xs sm:text-sm font-medium text-white shadow-sm hover:bg-neutral-800 active:scale-98 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white transition cursor-pointer"
          title="Start a new chat session"
        >
          <Plus className="h-4 w-4" />
          <span>New Chat</span>
        </button>

        <button
          onClick={onToggleTheme}
          aria-label="Toggle theme"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100 transition cursor-pointer"
          title={`Theme mode (${themeMode})`}
        >
          {themeMode === 'light' ? (
            <Sun className="h-4 w-4 text-amber-500" />
          ) : themeMode === 'dark' ? (
            <Moon className="h-4 w-4 text-cyan-400" />
          ) : (
            <Laptop className="h-4 w-4 text-neutral-400" />
          )}
        </button>

        <button
          onClick={onOpenSettings}
          aria-label="Open settings"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100 transition cursor-pointer"
          title="Settings & API Configuration"
        >
          <Settings className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
};
