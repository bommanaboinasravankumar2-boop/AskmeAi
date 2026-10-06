import React, { useState } from 'react';
import {
  MessageSquare,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Search,
  KeyRound,
  Settings,
  Sparkles,
} from 'lucide-react';
import { Conversation } from '../types/chat';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[];
  activeId: string;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onDeleteConversation: (id: string) => void;
  onOpenSettings: () => void;
  isApiConfigured: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  conversations,
  activeId,
  onSelectConversation,
  onNewChat,
  onRenameConversation,
  onDeleteConversation,
  onOpenSettings,
  isApiConfigured,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const startEditing = (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const saveEditing = (id: string, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (editTitle.trim()) {
      onRenameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const cancelEditing = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingId(null);
  };

  const confirmDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteConversation(id);
    setDeletingId(null);
  };

  // Group conversations into Today, Yesterday, and Older
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfYesterday = startOfToday - 86400000;
  const startOfSevenDays = startOfToday - 6 * 86400000;

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groups: { label: string; items: Conversation[] }[] = [
    {
      label: 'Today',
      items: filteredConversations.filter((c) => c.updatedAt >= startOfToday),
    },
    {
      label: 'Yesterday',
      items: filteredConversations.filter(
        (c) => c.updatedAt >= startOfYesterday && c.updatedAt < startOfToday
      ),
    },
    {
      label: 'Previous 7 Days',
      items: filteredConversations.filter(
        (c) => c.updatedAt >= startOfSevenDays && c.updatedAt < startOfYesterday
      ),
    },
    {
      label: 'Older',
      items: filteredConversations.filter((c) => c.updatedAt < startOfSevenDays),
    },
  ].filter((g) => g.items.length > 0);

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-xs transition-opacity md:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-72 sm:w-80 flex-col border-r border-neutral-200/90 bg-neutral-50/95 dark:border-neutral-800/80 dark:bg-neutral-900/95 backdrop-blur-md transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top actions */}
        <div className="flex flex-col gap-2 p-3 sm:p-4 border-b border-neutral-200/80 dark:border-neutral-800/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-500" />
              <span className="font-semibold text-sm text-neutral-800 dark:text-neutral-200">
                Chat History
              </span>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 md:hidden"
              aria-label="Close sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => {
              onNewChat();
              if (window.innerWidth < 768) onClose();
            }}
            className="flex items-center justify-center gap-2 w-full rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>

          {/* Search bar */}
          <div className="relative mt-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950/80 pl-9 pr-3 py-1.5 text-xs text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* History list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-4">
          {groups.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center text-xs text-neutral-400 px-4">
              <MessageSquare className="w-8 h-8 mb-2 stroke-1 opacity-50" />
              <p>No conversations found</p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-2 text-cyan-600 dark:text-cyan-400 underline text-xs"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            groups.map((group) => (
              <div key={group.label} className="space-y-1">
                <div className="px-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                  {group.label}
                </div>
                {group.items.map((conv) => {
                  const isActive = conv.id === activeId;
                  const isEditing = conv.id === editingId;
                  const isDeleting = conv.id === deletingId;

                  if (isEditing) {
                    return (
                      <form
                        key={conv.id}
                        onSubmit={(e) => saveEditing(conv.id, e)}
                        className="flex items-center gap-1 p-1 rounded-lg bg-neutral-200/80 dark:bg-neutral-800"
                      >
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          autoFocus
                          className="flex-1 rounded px-2 py-1 text-xs bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none"
                        />
                        <button
                          type="submit"
                          className="p-1 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                          title="Save title"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={cancelEditing}
                          className="p-1 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400"
                          title="Cancel"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </form>
                    );
                  }

                  if (isDeleting) {
                    return (
                      <div
                        key={conv.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300"
                      >
                        <span className="font-medium truncate mr-1">Delete chat?</span>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={(e) => confirmDelete(conv.id, e)}
                            className="px-2 py-0.5 rounded bg-rose-600 text-white font-medium hover:bg-rose-700"
                          >
                            Delete
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingId(null);
                            }}
                            className="px-2 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={conv.id}
                      onClick={() => {
                        onSelectConversation(conv.id);
                        if (window.innerWidth < 768) onClose();
                      }}
                      className={`group relative flex items-center justify-between rounded-xl px-2.5 py-2 text-xs transition cursor-pointer select-none ${
                        isActive
                          ? 'bg-neutral-200/90 dark:bg-neutral-800/90 font-medium text-neutral-900 dark:text-white shadow-xs'
                          : 'text-neutral-700 hover:bg-neutral-200/50 dark:text-neutral-300 dark:hover:bg-neutral-800/50'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <MessageSquare
                          className={`w-3.5 h-3.5 shrink-0 ${
                            isActive
                              ? 'text-cyan-600 dark:text-cyan-400'
                              : 'text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300'
                          }`}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate leading-snug">{conv.title}</p>
                          <span className="text-[10px] text-neutral-400 dark:text-neutral-500 block">
                            {formatTime(conv.updatedAt)}
                          </span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div
                        className={`flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ${
                          isActive ? 'opacity-100' : ''
                        }`}
                      >
                        <button
                          onClick={(e) => startEditing(conv, e)}
                          className="rounded p-1 text-neutral-400 hover:bg-neutral-300/60 dark:hover:bg-neutral-700 hover:text-neutral-700 dark:hover:text-neutral-200"
                          title="Rename chat"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingId(conv.id);
                          }}
                          className="rounded p-1 text-neutral-400 hover:bg-neutral-300/60 dark:hover:bg-neutral-700 hover:text-rose-600 dark:hover:text-rose-400"
                          title="Delete chat"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer status & settings */}
        <div className="p-3 border-t border-neutral-200/80 dark:border-neutral-800/80 space-y-2">
          {/* API Status Pill */}
          <div
            onClick={onOpenSettings}
            className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-neutral-950/80 border border-neutral-200 dark:border-neutral-800/80 text-xs cursor-pointer hover:border-neutral-300 dark:hover:border-neutral-700 transition"
          >
            <div className="flex items-center gap-2">
              <KeyRound
                className={`w-3.5 h-3.5 ${
                  isApiConfigured ? 'text-emerald-500' : 'text-amber-500'
                }`}
              />
              <span className="text-neutral-700 dark:text-neutral-300 font-medium">
                {isApiConfigured ? 'API Configured' : 'Key Needed'}
              </span>
            </div>
            <span
              className={`inline-block w-2 h-2 rounded-full ${
                isApiConfigured ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
              }`}
            />
          </div>

          <button
            onClick={onOpenSettings}
            className="flex items-center justify-center gap-2 w-full py-1.5 px-3 rounded-lg text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100 transition cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Settings & Preferences</span>
          </button>
        </div>
      </aside>
    </>
  );
};
