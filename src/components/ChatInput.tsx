import React, { useRef, useEffect } from 'react';
import { ArrowUp, Square } from 'lucide-react';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSend: (text: string) => void;
  isLoading: boolean;
  onStop: () => void;
  isApiConfigured: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  input,
  setInput,
  onSend,
  isLoading,
  onStop,
  isApiConfigured,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 180)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && input.trim()) {
        handleSubmit();
      }
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 pb-3 sm:pb-5 pt-2">
      <form
        onSubmit={handleSubmit}
        className="relative flex flex-col rounded-2xl border border-neutral-300 dark:border-neutral-700/80 bg-white dark:bg-neutral-900/90 shadow-md shadow-neutral-950/5 focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-500/20 transition-all"
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything... (e.g., Explain VLSI, debug code, solve a problem)"
          rows={1}
          disabled={isLoading && false}
          className="w-full resize-none bg-transparent px-4 py-3 sm:py-3.5 pr-14 text-sm sm:text-base text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none min-h-[48px] max-h-[180px] leading-relaxed"
        />

        <div className="flex items-center justify-between px-3 pb-2 pt-1 border-t border-neutral-100 dark:border-neutral-800/60 text-[11px] text-neutral-400 select-none">
          <div className="flex items-center gap-1.5">
            <span className="hidden sm:inline">Press</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 font-mono text-[10px]">
              Enter ↵
            </kbd>
            <span className="hidden sm:inline">to send,</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 font-mono text-[10px]">
              Shift + Enter
            </kbd>
            <span className="hidden sm:inline">for newline</span>
            {!isApiConfigured && (
              <span className="text-amber-600 dark:text-amber-400 font-medium">
                • API key configuration needed
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isLoading ? (
              <button
                type="button"
                onClick={onStop}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 text-neutral-100 hover:bg-neutral-700 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-xs font-semibold shadow-xs transition cursor-pointer"
                title="Stop response generation"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop</span>
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl transition duration-150 cursor-pointer ${
                  input.trim()
                    ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-sm hover:from-cyan-500 hover:to-indigo-500 active:scale-95'
                    : 'bg-neutral-200 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-600 cursor-not-allowed'
                }`}
                aria-label="Send message"
              >
                <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
              </button>
            )}
          </div>
        </div>
      </form>

      <div className="mt-1.5 text-center">
        <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
          AskMeAI is an intelligent assistant powered by Google Gemini. Verify important information.
        </p>
      </div>
    </div>
  );
};
