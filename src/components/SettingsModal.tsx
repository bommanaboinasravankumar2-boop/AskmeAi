import React, { useState } from 'react';
import {
  X,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  Sun,
  Moon,
  Laptop,
  Trash2,
  Info,
  RefreshCw,
  Sliders,
  Download,
} from 'lucide-react';
import { ThemeMode, APIStatusResponse, Conversation } from '../types/chat';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  themeMode: ThemeMode;
  onSelectTheme: (mode: ThemeMode) => void;
  apiStatus: APIStatusResponse;
  onRefreshApiStatus: () => Promise<void>;
  conversations: Conversation[];
  onClearAllConversations: () => void;
  systemInstruction: string;
  onUpdateSystemInstruction: (instruction: string) => void;
  onResetSystemInstruction: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  themeMode,
  onSelectTheme,
  apiStatus,
  onRefreshApiStatus,
  conversations,
  onClearAllConversations,
  systemInstruction,
  onUpdateSystemInstruction,
  onResetSystemInstruction,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'api' | 'instruction' | 'about'>('general');

  if (!isOpen) return null;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefreshApiStatus();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleExportChats = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(conversations, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `askmeai_chats_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const totalMessages = conversations.reduce((acc, c) => acc + c.messages.length, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="w-full max-w-xl rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white">
              Settings & Configuration
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-700 dark:hover:text-neutral-200 transition cursor-pointer"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/50 px-4 text-xs font-medium">
          <button
            onClick={() => setActiveTab('general')}
            className={`py-3 px-3 border-b-2 transition cursor-pointer ${
              activeTab === 'general'
                ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400 font-semibold'
                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            General & Theme
          </button>
          <button
            onClick={() => setActiveTab('api')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'api'
                ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400 font-semibold'
                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            <span>API Configuration</span>
            <span
              className={`w-2 h-2 rounded-full ${
                apiStatus.configured ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
          </button>
          <button
            onClick={() => setActiveTab('instruction')}
            className={`py-3 px-3 border-b-2 transition cursor-pointer ${
              activeTab === 'instruction'
                ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400 font-semibold'
                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            AI Behavior
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`py-3 px-3 border-b-2 transition cursor-pointer ${
              activeTab === 'about'
                ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400 font-semibold'
                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            About
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 text-sm">
          {activeTab === 'general' && (
            <div className="space-y-6">
              {/* Theme Section */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Interface Theme
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => onSelectTheme('light')}
                    className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition cursor-pointer ${
                      themeMode === 'light'
                        ? 'border-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/20 text-cyan-700 dark:text-cyan-300 font-medium'
                        : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    <Sun className="w-5 h-5 text-amber-500" />
                    <span className="text-xs">Light</span>
                  </button>

                  <button
                    onClick={() => onSelectTheme('dark')}
                    className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition cursor-pointer ${
                      themeMode === 'dark'
                        ? 'border-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/20 text-cyan-700 dark:text-cyan-300 font-medium'
                        : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    <Moon className="w-5 h-5 text-cyan-400" />
                    <span className="text-xs">Dark</span>
                  </button>

                  <button
                    onClick={() => onSelectTheme('system')}
                    className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition cursor-pointer ${
                      themeMode === 'system'
                        ? 'border-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/20 text-cyan-700 dark:text-cyan-300 font-medium'
                        : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    <Laptop className="w-5 h-5 text-neutral-400" />
                    <span className="text-xs">System</span>
                  </button>
                </div>
              </div>

              {/* Chat History & Data Section */}
              <div className="space-y-3 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Data & History Management
                </label>
                <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-950/50 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <p className="font-medium text-neutral-800 dark:text-neutral-200">
                      Stored Conversations
                    </p>
                    <p className="text-neutral-500 dark:text-neutral-400">
                      {conversations.length} {conversations.length === 1 ? 'chat' : 'chats'} ({totalMessages} messages total)
                    </p>
                  </div>
                  <button
                    onClick={handleExportChats}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export JSON</span>
                  </button>
                </div>

                {showClearConfirm ? (
                  <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 space-y-2">
                    <p className="text-xs font-medium text-rose-800 dark:text-rose-200">
                      Are you sure you want to permanently delete all chats and history?
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          onClearAllConversations();
                          setShowClearConfirm(false);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition cursor-pointer"
                      >
                        Yes, Delete All
                      </button>
                      <button
                        onClick={() => setShowClearConfirm(false)}
                        className="px-3 py-1.5 rounded-lg bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-medium transition cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowClearConfirm(true)}
                    className="flex items-center gap-2 w-full justify-center px-4 py-2 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-medium transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Clear All Chat History</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="space-y-5">
              {/* API Status Banner */}
              <div
                className={`p-4 rounded-xl border ${
                  apiStatus.configured
                    ? 'border-emerald-200 bg-emerald-50/70 dark:border-emerald-900/60 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-100'
                    : 'border-amber-200 bg-amber-50/70 dark:border-amber-900/60 dark:bg-amber-950/30 text-amber-900 dark:text-amber-100'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {apiStatus.configured ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-1">
                      <p className="font-bold text-sm">
                        {apiStatus.configured
                          ? 'API key configured'
                          : 'Gemini API key is not configured. Add your API key to the environment configuration.'}
                      </p>
                      <p className="text-xs text-neutral-600 dark:text-neutral-300">
                        {apiStatus.configured
                          ? 'AskMeAI is connected to Google Gemini and ready to generate intelligent responses.'
                          : 'The backend cannot access GEMINI_API_KEY. Configure it in your server environment variables or AI Studio Secrets.'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-neutral-600 dark:text-neutral-400 transition cursor-pointer"
                    title="Refresh API status"
                  >
                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Engine Details */}
              <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 space-y-3 bg-neutral-50/50 dark:bg-neutral-950/40">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-500 dark:text-neutral-400 font-medium">Model Engine</span>
                  <span className="font-mono font-semibold text-neutral-900 dark:text-neutral-100 bg-neutral-200/60 dark:bg-neutral-800 px-2 py-0.5 rounded">
                    gemini-3.8-flash
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-500 dark:text-neutral-400 font-medium">SDK Integration</span>
                  <span className="font-mono text-neutral-700 dark:text-neutral-300">@google/genai</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-500 dark:text-neutral-400 font-medium">Architecture</span>
                  <span className="text-neutral-700 dark:text-neutral-300">Full-Stack Server Proxy (Secure)</span>
                </div>
              </div>

              {/* Free Tier & Setup Guide */}
              <div className="space-y-3 text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                  <KeyRound className="w-3.5 h-3.5 text-cyan-500" />
                  Free API Key & Google Policies Information
                </h4>
                <p>
                  You can obtain a Gemini API key from Google's official AI Studio at{' '}
                  <a
                    href="https://aistudio.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-600 dark:text-cyan-400 underline font-medium"
                  >
                    aistudio.google.com
                  </a>
                  . Availability and free-tier limits depend on Google's current policies (such as requests-per-minute quotas for the free tier).
                </p>
                <div className="p-3 rounded-lg bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/60 space-y-1.5 font-mono text-[11px]">
                  <p className="text-neutral-500 dark:text-neutral-400">Environment variable name:</p>
                  <code className="text-cyan-600 dark:text-cyan-400 font-bold">GEMINI_API_KEY="your_api_key_here"</code>
                </div>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  🔒 <strong className="text-neutral-700 dark:text-neutral-300">Security:</strong> Your API key is kept securely on the server-side proxy and is never exposed in client browser code or network packets.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'instruction' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-cyan-500" />
                  System Instruction / Persona
                </label>
                <button
                  onClick={onResetSystemInstruction}
                  className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
                >
                  Reset to default
                </button>
              </div>

              <textarea
                value={systemInstruction}
                onChange={(e) => onUpdateSystemInstruction(e.target.value)}
                rows={5}
                className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 p-3 text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 leading-relaxed"
                placeholder="Enter AI instructions..."
              />

              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                Default behavior: "You are AskMeAI, a helpful, accurate, concise AI assistant. Understand the user's intent before answering. Give clear explanations and useful examples. If the user asks for code, provide working code and explain important parts. If information is uncertain, say so instead of inventing facts."
              </p>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-gradient-to-tr from-cyan-500/10 via-indigo-500/10 to-violet-500/10 space-y-2">
                <h3 className="font-bold text-base text-neutral-900 dark:text-white">
                  AskMeAI
                </h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-300 italic">
                  "Ask anything. Get intelligent answers."
                </p>
                <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-200 pt-1 leading-relaxed">
                  AskMeAI is an experimental AI assistant powered by Google Gemini.
                </p>
              </div>

              <div className="space-y-2 text-xs text-neutral-600 dark:text-neutral-400">
                <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-800">
                  <span>Version</span>
                  <span className="font-medium text-neutral-800 dark:text-neutral-200">1.0.0</span>
                </div>
                <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-800">
                  <span>Target Platforms</span>
                  <span className="font-medium text-neutral-800 dark:text-neutral-200">Desktop & Android Mobile</span>
                </div>
                <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-800">
                  <span>Rendering</span>
                  <span className="font-medium text-neutral-800 dark:text-neutral-200">GitHub Flavored Markdown & Code Highlighting</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Intelligence</span>
                  <span className="font-medium text-neutral-800 dark:text-neutral-200">Google Gemini Flash 3.8</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-5 py-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/60">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 text-xs font-semibold hover:opacity-90 transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
