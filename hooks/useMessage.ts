'use client';
import { useEffect, useState } from 'react';
import { getConversationHistory } from '@/services/api';
import { useConversationStore } from '@/stores/conversationStore';

export function useMessages(conversationId: string | null) {
  const { messages, setMessages } = useConversationStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!conversationId) return;
    if (messages[conversationId]?.length) return;
    setLoading(true);
    getConversationHistory(conversationId)
      .then(({ messages: msgs }) => setMessages(conversationId, msgs))
      .catch((err) => console.error('Erro ao carregar histórico:', err))
      .finally(() => setLoading(false));
  }, [conversationId, messages, setMessages]);

  return {
    messages: conversationId ? (messages[conversationId] ?? []) : [],
    loading,
  };
}