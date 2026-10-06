import { useState, useEffect, useCallback } from 'react';
import { Conversation, Message } from '../types/chat';
import { generateChatTitle } from '../utils/titleGenerator';

const STORAGE_KEY = 'askmeai_conversations_v1';
const ACTIVE_ID_KEY = 'askmeai_active_conv_id_v1';

function createBlankConversation(): Conversation {
  const id = 'conv_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  return {
    id,
    title: 'New Chat',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    messages: [],
  };
}

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved conversations', e);
    }
    const initial = createBlankConversation();
    return [initial];
  });

  const [activeId, setActiveId] = useState<string>(() => {
    try {
      const savedActive = localStorage.getItem(ACTIVE_ID_KEY);
      if (savedActive) return savedActive;
    } catch {}
    return conversations[0]?.id || '';
  });

  // Ensure activeId is always valid
  useEffect(() => {
    if (!conversations.some((c) => c.id === activeId)) {
      if (conversations.length > 0) {
        setActiveId(conversations[0].id);
      } else {
        const newConv = createBlankConversation();
        setConversations([newConv]);
        setActiveId(newConv.id);
      }
    }
  }, [conversations, activeId]);

  // Persist conversations
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
      localStorage.setItem(ACTIVE_ID_KEY, activeId);
    } catch (e) {
      console.warn('Failed to save conversations to localStorage', e);
    }
  }, [conversations, activeId]);

  const activeConversation = conversations.find((c) => c.id === activeId) || conversations[0];

  const createNewConversation = useCallback(() => {
    // If current conversation is already blank with 0 messages, just select it
    if (activeConversation && activeConversation.messages.length === 0) {
      return activeConversation.id;
    }
    const newConv = createBlankConversation();
    setConversations((prev) => [newConv, ...prev]);
    setActiveId(newConv.id);
    return newConv.id;
  }, [activeConversation]);

  const selectConversation = useCallback((id: string) => {
    setActiveId(id);
  }, []);

  const renameConversation = useCallback((id: string, newTitle: string) => {
    const trimmed = newTitle.trim();
    if (!trimmed) return;
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: trimmed, updatedAt: Date.now() } : c))
    );
  }, []);

  const deleteConversation = useCallback(
    (id: string) => {
      setConversations((prev) => {
        const filtered = prev.filter((c) => c.id !== id);
        if (filtered.length === 0) {
          const fresh = createBlankConversation();
          return [fresh];
        }
        return filtered;
      });
    },
    []
  );

  const clearAllConversations = useCallback(() => {
    const fresh = createBlankConversation();
    setConversations([fresh]);
    setActiveId(fresh.id);
  }, []);

  const clearCurrentMessages = useCallback(() => {
    if (!activeId) return;
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeId ? { ...c, title: 'New Chat', messages: [], updatedAt: Date.now() } : c
      )
    );
  }, [activeId]);

  const appendUserMessage = useCallback(
    (convId: string, text: string): { userMsg: Message; updatedMessages: Message[] } => {
      const userMsg: Message = {
        id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        role: 'user',
        content: text.trim(),
        timestamp: Date.now(),
      };

      let newMessages: Message[] = [];

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== convId) return c;
          const isFirstMessage = c.messages.length === 0;
          const newTitle = isFirstMessage ? generateChatTitle(text) : c.title;
          newMessages = [...c.messages, userMsg];
          return {
            ...c,
            title: newTitle,
            updatedAt: Date.now(),
            messages: newMessages,
          };
        })
      );

      return { userMsg, updatedMessages: newMessages };
    },
    []
  );

  const appendModelPlaceholder = useCallback((convId: string): string => {
    const msgId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const placeholderMsg: Message = {
      id: msgId,
      role: 'model',
      content: '',
      timestamp: Date.now(),
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== convId) return c;
        return {
          ...c,
          updatedAt: Date.now(),
          messages: [...c.messages, placeholderMsg],
        };
      })
    );

    return msgId;
  }, []);

  const updateMessageContent = useCallback((convId: string, msgId: string, content: string) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== convId) return c;
        return {
          ...c,
          updatedAt: Date.now(),
          messages: c.messages.map((m) => (m.id === msgId ? { ...m, content } : m)),
        };
      })
    );
  }, []);

  const setMessageError = useCallback((convId: string, msgId: string, errorMessage: string) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== convId) return c;
        return {
          ...c,
          updatedAt: Date.now(),
          messages: c.messages.map((m) =>
            m.id === msgId ? { ...m, error: true, errorMessage } : m
          ),
        };
      })
    );
  }, []);

  const setMessageFeedback = useCallback(
    (convId: string, msgId: string, feedback: 'like' | 'dislike') => {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== convId) return c;
          return {
            ...c,
            messages: c.messages.map((m) =>
              m.id === msgId
                ? { ...m, feedback: m.feedback === feedback ? null : feedback }
                : m
            ),
          };
        })
      );
    },
    []
  );

  const removeMessage = useCallback((convId: string, msgId: string) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== convId) return c;
        return {
          ...c,
          messages: c.messages.filter((m) => m.id !== msgId),
        };
      })
    );
  }, []);

  return {
    conversations,
    activeId,
    activeConversation,
    createNewConversation,
    selectConversation,
    renameConversation,
    deleteConversation,
    clearAllConversations,
    clearCurrentMessages,
    appendUserMessage,
    appendModelPlaceholder,
    updateMessageContent,
    setMessageError,
    setMessageFeedback,
    removeMessage,
  };
}
