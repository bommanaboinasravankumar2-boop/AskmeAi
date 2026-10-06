import React, { useRef, useEffect, useState } from 'react';
import {
  Sparkles,
  User,
  Copy,
  Check,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  ArrowDown,
  AlertCircle,
  Lightbulb,
  Code,
  Calendar,
  Layers,
  Bug,
} from 'lucide-react';
import { Message } from '../types/chat';
import { MarkdownRenderer } from './MarkdownRenderer';

interface ChatAreaProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (text: string) => void;
  onRegenerate: () => void;
  onFeedback: (messageId: string, feedback: 'like' | 'dislike') => void;
  onOpenSettings: () => void;
}

const SUGGESTIONS = [
  {
    title: 'Explain VLSI in simple words',
    category: 'Hardware & Silicon',
    icon: Lightbulb,
  },
  {
    title: 'Write Python code for a calculator',
    category: 'Coding & Algorithms',
    icon: Code,
  },
  {
    title: 'Create a study plan',
    category: 'Productivity & Learning',
    icon: Calendar,
  },
  {
    title: 'Explain this concept step by step',
    category: 'Deep Understanding',
    icon: Layers,
  },
  {
    title: 'Help me debug my code',
    category: 'Software Troubleshooting',
    icon: Bug,
  },
];

export const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  isLoading,
  onSendMessage,
  onRegenerate,
  onFeedback,
  onOpenSettings,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    bottomRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom(isLoading ? 'auto' : 'smooth');
  }, [messages, isLoading]);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const distanceToBottom = scrollHeight - scrollTop - clientHeight;
    setShowScrollBottom(distanceToBottom > 150);
  };

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (e) {
      console.warn('Failed to copy', e);
    }
  };

  // If conversation has no messages, show landing / empty state
  if (messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto px-4 py-8 flex flex-col items-center justify-center min-h-[400px]">
        <div className="max-w-2xl w-full text-center space-y-6">
          {/* Logo badge */}
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-violet-500 shadow-lg shadow-indigo-500/20 text-white mb-2">
            <Sparkles className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
              ASKME<span className="text-cyan-500">AI</span>
            </h1>
            <p className="text-base sm:text-lg font-medium text-neutral-600 dark:text-neutral-300">
              "Ask anything. Get intelligent answers."
            </p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              What can I help you with?
            </p>
          </div>

          {/* Suggestion cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-4 text-left">
            {SUGGESTIONS.map((sugg, idx) => {
              const Icon = sugg.icon;
              return (
                <button
                  key={idx}
                  onClick={() => onSendMessage(sugg.title)}
                  className={`group relative flex flex-col p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 hover:border-cyan-500/60 dark:hover:border-cyan-500/60 hover:bg-neutral-50 dark:hover:bg-neutral-850/80 transition-all text-left shadow-xs hover:shadow-md cursor-pointer ${
                    idx === SUGGESTIONS.length - 1 ? 'sm:col-span-2 sm:max-w-md sm:mx-auto sm:w-full' : ''
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1 text-cyan-600 dark:text-cyan-400">
                    <Icon className="w-4 h-4" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                      {sugg.category}
                    </span>
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-neutral-800 dark:text-neutral-200 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                    "{sugg.title}"
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={scrollContainerRef}
      onScroll={handleScroll}
      className="relative flex-1 overflow-y-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {messages.map((message, index) => {
          const isUser = message.role === 'user';
          const isLastMessage = index === messages.length - 1;

          if (isUser) {
            return (
              <div key={message.id} className="flex justify-end items-start gap-2.5 sm:gap-3 group">
                <div className="max-w-[85%] sm:max-w-[75%] rounded-2xl rounded-tr-sm bg-gradient-to-tr from-cyan-600 to-indigo-600 px-4 py-3 text-white shadow-xs">
                  <p className="whitespace-pre-wrap text-sm sm:text-base leading-relaxed break-words font-normal">
                    {message.content}
                  </p>
                </div>
                <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-semibold shadow-xs">
                  <User className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
              </div>
            );
          }

          // AI Message
          return (
            <div key={message.id} className="flex justify-start items-start gap-2.5 sm:gap-3 group">
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-violet-500 text-white shadow-xs font-bold">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>

              <div className="flex-1 max-w-[92%] sm:max-w-[85%] space-y-2">
                {message.error ? (
                  <div className="rounded-2xl rounded-tl-sm border border-rose-300 bg-rose-50/90 dark:border-rose-900/80 dark:bg-rose-950/40 p-4 text-rose-800 dark:text-rose-200 shadow-xs">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                      <div className="space-y-2 text-sm leading-relaxed">
                        <p className="font-semibold text-rose-900 dark:text-rose-100">
                          {message.errorMessage || 'Something went wrong while generating the response.'}
                        </p>
                        <div className="flex items-center gap-3 pt-1">
                          <button
                            onClick={onRegenerate}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium transition cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Try Again</span>
                          </button>
                          <button
                            onClick={onOpenSettings}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-rose-700 dark:text-rose-300 hover:underline text-xs font-medium cursor-pointer"
                          >
                            <span>Check API Configuration</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl rounded-tl-sm border border-neutral-200/80 bg-white/95 dark:border-neutral-800 dark:bg-neutral-900/90 p-4 sm:p-5 shadow-xs text-neutral-900 dark:text-neutral-100 transition-colors">
                    {message.content ? (
                      <MarkdownRenderer content={message.content} />
                    ) : isLoading && isLastMessage ? (
                      <div className="flex items-center gap-2 py-2 text-neutral-500 dark:text-neutral-400">
                        <div className="flex space-x-1.5">
                          <div className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce [animation-delay:-0.3s]"></div>
                          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.15s]"></div>
                          <div className="w-2 h-2 rounded-full bg-violet-500 animate-bounce"></div>
                        </div>
                        <span className="text-xs sm:text-sm font-medium">AskMeAI is thinking...</span>
                      </div>
                    ) : null}

                    {/* Action Bar for AI response */}
                    {message.content && (
                      <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-xs text-neutral-400 select-none">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleCopy(message.id, message.content)}
                            className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition cursor-pointer"
                            title="Copy response to clipboard"
                          >
                            {copiedId === message.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                                <span className="text-emerald-500">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>

                          {isLastMessage && !isLoading && (
                            <button
                              onClick={onRegenerate}
                              className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition cursor-pointer"
                              title="Regenerate response"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Regenerate</span>
                            </button>
                          )}
                        </div>

                        {/* Thumbs up / down feedback */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => onFeedback(message.id, 'like')}
                            className={`p-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer ${
                              message.feedback === 'like'
                                ? 'text-emerald-500'
                                : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'
                            }`}
                            title="Good response"
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onFeedback(message.id, 'dislike')}
                            className={`p-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer ${
                              message.feedback === 'dislike'
                                ? 'text-rose-500'
                                : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'
                            }`}
                            title="Poor response"
                          >
                            <ThumbsDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Floating Scroll to Bottom button */}
      {showScrollBottom && (
        <button
          onClick={() => scrollToBottom('smooth')}
          className="fixed bottom-24 right-6 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-lg hover:opacity-90 transition active:scale-95 cursor-pointer"
          title="Scroll to latest message"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
