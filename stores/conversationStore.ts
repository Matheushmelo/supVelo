'use client';
import { create } from 'zustand';
import type { ConversationSummary } from '@/types/conversation';
import type { Message } from '@/types/message';

interface ConversationStore {
  conversations: ConversationSummary[];
  setConversations: (list: ConversationSummary[]) => void;
  upsertConversation: (c: Partial<ConversationSummary> & { id: string }) => void;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  getSelected: () => ConversationSummary | undefined;
  messages: Record<string, Message[]>;
  setMessages: (conversationId: string, msgs: Message[]) => void;
  addMessage: (conversationId: string, msg: Message) => void;
  typing: Record<string, string>;
  appendTypingToken: (conversationId: string, token: string) => void;
  clearTyping: (conversationId: string) => void;
}

export const useConversationStore = create<ConversationStore>((set, get) => ({
  conversations: [],
  setConversations: (list) => set({ conversations: list }),
  upsertConversation: (updated) =>
    set((state) => {
      const exists = state.conversations.find((c) => c.id === updated.id);
      if (exists) {
        return {
          conversations: state.conversations.map((c) =>
            c.id === updated.id ? { ...c, ...updated } : c
          ),
        };
      }
      return { conversations: [updated as ConversationSummary, ...state.conversations] };
    }),

  selectedId: null,
  setSelectedId: (id) => set({ selectedId: id }),
  getSelected: () => {
    const { conversations, selectedId } = get();
    return conversations.find((c) => c.id === selectedId);
  },

  messages: {},
  setMessages: (conversationId, msgs) =>
    set((state) => ({ messages: { ...state.messages, [conversationId]: msgs } })),
  addMessage: (conversationId, msg) =>
    set((state) => {
      const existing = state.messages[conversationId] ?? [];
      if (existing.some((m) => m.id === msg.id)) return state;
      return { messages: { ...state.messages, [conversationId]: [...existing, msg] } };
    }),

  typing: {},
  appendTypingToken: (conversationId, token) =>
    set((state) => ({
      typing: { ...state.typing, [conversationId]: (state.typing[conversationId] ?? '') + token },
    })),
  clearTyping: (conversationId) =>
    set((state) => {
      const next = { ...state.typing };
      delete next[conversationId];
      return { typing: next };
    }),
}));