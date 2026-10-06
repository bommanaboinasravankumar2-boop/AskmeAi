import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Check, Copy } from 'lucide-react';

interface CodeBlockProps {
  language?: string;
  code: string;
}

function CodeBlock({ language, code }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.warn('Failed to copy', e);
    }
  };

  return (
    <div className="relative my-4 overflow-hidden rounded-xl border border-neutral-700/60 bg-neutral-900/95 dark:border-neutral-800 dark:bg-neutral-950/90 shadow-sm text-neutral-100 font-mono text-xs sm:text-sm">
      <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-700/50 bg-neutral-800/60 dark:bg-neutral-900/60 text-xs text-neutral-400">
        <span className="font-semibold uppercase tracking-wider text-neutral-300">
          {language || 'code'}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-neutral-300 hover:text-white bg-neutral-700/50 hover:bg-neutral-700 transition cursor-pointer"
          title="Copy code to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="p-4 overflow-x-auto text-neutral-200">
        <pre className="m-0 font-mono leading-relaxed">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none break-words text-sm sm:text-base leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const isBlock = !!match || String(children).includes('\n');
            const codeString = String(children).replace(/\n$/, '');

            if (isBlock) {
              return (
                <CodeBlock
                  language={match ? match[1] : undefined}
                  code={codeString}
                />
              );
            }

            return (
              <code
                className="px-1.5 py-0.5 rounded-md text-xs sm:text-sm font-mono bg-neutral-200/70 dark:bg-neutral-800 text-cyan-700 dark:text-cyan-300 border border-neutral-300/60 dark:border-neutral-700/60 font-semibold"
                {...props}
              >
                {children}
              </code>
            );
          },
          table({ children }) {
            return (
              <div className="my-4 overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-700/80">
                <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700 text-left text-xs sm:text-sm">
                  {children}
                </table>
              </div>
            );
          },
          thead({ children }) {
            return (
              <thead className="bg-neutral-100 dark:bg-neutral-800/80 font-semibold text-neutral-800 dark:text-neutral-200">
                {children}
              </thead>
            );
          },
          th({ children }) {
            return (
              <th className="px-3.5 py-2.5 font-semibold text-neutral-900 dark:text-neutral-100">
                {children}
              </th>
            );
          },
          td({ children }) {
            return (
              <td className="px-3.5 py-2.5 border-t border-neutral-100 dark:border-neutral-800/60 text-neutral-700 dark:text-neutral-300">
                {children}
              </td>
            );
          },
          blockquote({ children }) {
            return (
              <blockquote className="my-3 border-l-4 border-cyan-500/80 pl-4 py-1 italic text-neutral-600 dark:text-neutral-300 bg-cyan-50/50 dark:bg-cyan-950/20 rounded-r-md">
                {children}
              </blockquote>
            );
          },
          ul({ children }) {
            return (
              <ul className="my-2 list-disc list-outside pl-5 space-y-1 text-neutral-800 dark:text-neutral-200">
                {children}
              </ul>
            );
          },
          ol({ children }) {
            return (
              <ol className="my-2 list-decimal list-outside pl-5 space-y-1 text-neutral-800 dark:text-neutral-200">
                {children}
              </ol>
            );
          },
          h1({ children }) {
            return (
              <h1 className="text-xl sm:text-2xl font-bold mt-4 mb-2 text-neutral-900 dark:text-neutral-50 tracking-tight">
                {children}
              </h1>
            );
          },
          h2({ children }) {
            return (
              <h2 className="text-lg sm:text-xl font-bold mt-3 mb-2 text-neutral-900 dark:text-neutral-100 tracking-tight">
                {children}
              </h2>
            );
          },
          h3({ children }) {
            return (
              <h3 className="text-base sm:text-lg font-semibold mt-3 mb-1.5 text-neutral-850 dark:text-neutral-150">
                {children}
              </h3>
            );
          },
          p({ children }) {
            return (
              <p className="my-2 leading-relaxed text-neutral-800 dark:text-neutral-200">
                {children}
              </p>
            );
          },
          a({ href, children }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-600 dark:text-cyan-400 underline underline-offset-2 hover:text-cyan-700 dark:hover:text-cyan-300 transition"
              >
                {children}
              </a>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
