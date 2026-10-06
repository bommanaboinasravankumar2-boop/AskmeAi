/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { ChatInput } from './components/ChatInput';
import { SettingsModal } from './components/SettingsModal';
import { useConversations } from './hooks/useConversations';
import { useTheme } from './hooks/useTheme';
import { fetchAPIStatus, streamChatCompletion } from './services/api';
import { APIStatusResponse, ThemeMode } from './types/chat';

const DEFAULT_SYSTEM_INSTRUCTION =
  'You are AskMeAI, a helpful, accurate, concise AI assistant. Understand the user\'s intent before answering. Give clear explanations and useful examples. If the user asks for code, provide working code and explain important parts. If information is uncertain, say so instead of inventing facts.';

const SYSTEM_INSTRUCTION_STORAGE_KEY = 'askmeai_system_instruction_v1';

export default function App() {
  const { themeMode, setThemeMode } = useTheme();
  const {
    conversations,
    activeId,
    activeConversation,
    createNewConversation,
    selectConversation,
    renameConversation,
    deleteConversation,
    clearAllConversations,
    appendUserMessage,
    appendModelPlaceholder,
    updateMessageContent,
    setMessageError,
    setMessageFeedback,
    removeMessage,
  } = useConversations();

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    return typeof window !== 'undefined' ? window.innerWidth >= 1024 : false;
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [systemInstruction, setSystemInstruction] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(SYSTEM_INSTRUCTION_STORAGE_KEY);
      if (saved) return saved;
    } catch {}
    return DEFAULT_SYSTEM_INSTRUCTION;
  });

  const [apiStatus, setApiStatus] = useState<APIStatusResponse>({
    configured: false,
    model: 'gemini-3.8-flash',
    appName: 'AskMeAI',
    version: '1.0.0',
    message: 'Checking status...',
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  // Check API configuration status
  const loadStatus = useCallback(async () => {
    const status = await fetchAPIStatus();
    setApiStatus(status);
  }, []);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  // Persist custom system instruction
  const handleUpdateSystemInstruction = (newInstruction: string) => {
    setSystemInstruction(newInstruction);
    try {
      localStorage.setItem(SYSTEM_INSTRUCTION_STORAGE_KEY, newInstruction);
    } catch {}
  };

  const handleResetSystemInstruction = () => {
    setSystemInstruction(DEFAULT_SYSTEM_INSTRUCTION);
    try {
      localStorage.removeItem(SYSTEM_INSTRUCTION_STORAGE_KEY);
    } catch {}
  };

  // Toggle theme quick cycle
  const handleToggleTheme = () => {
    const cycle: Record<ThemeMode, ThemeMode> = {
      light: 'dark',
      dark: 'system',
      system: 'light',
    };
    setThemeMode(cycle[themeMode]);
  };

  // Send message
  const handleSendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isLoading || !activeConversation) return;

    // Append user message
    const currentConvId = activeConversation.id;
    appendUserMessage(currentConvId, trimmed);

    // Prepare full conversation history for context memory
    const existingMessages = activeConversation.messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));
    const messageHistory = [...existingMessages, { role: 'user' as const, content: trimmed }];

    // Append model placeholder for response
    const modelMsgId = appendModelPlaceholder(currentConvId);

    setIsLoading(true);
    abortControllerRef.current = new AbortController();

    let accumulatedText = '';

    await streamChatCompletion(
      messageHistory,
      systemInstruction,
      {
        onChunk: (chunk: string) => {
          accumulatedText += chunk;
          updateMessageContent(currentConvId, modelMsgId, accumulatedText);
        },
        onError: (errorMessage: string) => {
          setMessageError(currentConvId, modelMsgId, errorMessage);
          setIsLoading(false);
          abortControllerRef.current = null;
        },
        onDone: () => {
          if (!accumulatedText.trim()) {
            // If empty text returned without error
            updateMessageContent(
              currentConvId,
              modelMsgId,
              accumulatedText || 'I could not generate an answer for that query. Please try rephrasing.'
            );
          }
          setIsLoading(false);
          abortControllerRef.current = null;
        },
      },
      abortControllerRef.current.signal
    );
  };

  // Stop generation
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  };

  // Regenerate last response
  const handleRegenerate = async () => {
    if (isLoading || !activeConversation || activeConversation.messages.length === 0) return;

    const msgs = activeConversation.messages;
    const lastMsg = msgs[msgs.length - 1];

    if (lastMsg.role === 'model') {
      // Find the last user message before this
      const lastUserMsg = msgs.slice(0, -1).reverse().find((m) => m.role === 'user');
      if (!lastUserMsg) return;

      // Remove the last model message
      removeMessage(activeConversation.id, lastMsg.id);

      // Re-prepare context up to that user message
      const historyUntilUser = msgs.slice(0, -1).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const modelMsgId = appendModelPlaceholder(activeConversation.id);
      setIsLoading(true);
      abortControllerRef.current = new AbortController();

      let accumulatedText = '';

      await streamChatCompletion(
        historyUntilUser,
        systemInstruction,
        {
          onChunk: (chunk: string) => {
            accumulatedText += chunk;
            updateMessageContent(activeConversation.id, modelMsgId, accumulatedText);
          },
          onError: (errorMessage: string) => {
            setMessageError(activeConversation.id, modelMsgId, errorMessage);
            setIsLoading(false);
            abortControllerRef.current = null;
          },
          onDone: () => {
            setIsLoading(false);
            abortControllerRef.current = null;
          },
        },
        abortControllerRef.current.signal
      );
    }
  };

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-neutral-100 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 font-sans antialiased">
      {/* Sidebar with History */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        conversations={conversations}
        activeId={activeId}
        onSelectConversation={selectConversation}
        onNewChat={createNewConversation}
        onRenameConversation={renameConversation}
        onDeleteConversation={deleteConversation}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isApiConfigured={apiStatus.configured}
      />

      {/* Main Chat Panel */}
      <div className="flex flex-1 flex-col h-full min-w-0 overflow-hidden bg-white dark:bg-neutral-900/60 transition-colors">
        {/* Header */}
        <Header
          onNewChat={createNewConversation}
          onOpenSettings={() => setIsSettingsOpen(true)}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          themeMode={themeMode}
          onToggleTheme={handleToggleTheme}
          isApiConfigured={apiStatus.configured}
        />

        {/* Chat Messages / Empty State */}
        <ChatArea
          messages={activeConversation ? activeConversation.messages : []}
          isLoading={isLoading}
          onSendMessage={handleSendMessage}
          onRegenerate={handleRegenerate}
          onFeedback={(id, fb) => {
            if (activeConversation) {
              setMessageFeedback(activeConversation.id, id, fb);
            }
          }}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        {/* Chat Input Box */}
        <ChatInput
          input={input}
          setInput={setInput}
          onSend={handleSendMessage}
          isLoading={isLoading}
          onStop={handleStopGeneration}
          isApiConfigured={apiStatus.configured}
        />
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        themeMode={themeMode}
        onSelectTheme={setThemeMode}
        apiStatus={apiStatus}
        onRefreshApiStatus={loadStatus}
        conversations={conversations}
        onClearAllConversations={clearAllConversations}
        systemInstruction={systemInstruction}
        onUpdateSystemInstruction={handleUpdateSystemInstruction}
        onResetSystemInstruction={handleResetSystemInstruction}
      />
    </div>
  );
}
