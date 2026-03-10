'use client';
import { useEffect } from 'react';
import { listConversations } from '@/services/api';
import { useConversationStore } from '@/stores/conversationStore';

export function useConversations() {
  const { conversations, setConversations, selectedId, setSelectedId } =
    useConversationStore();

  useEffect(() => {
    listConversations()
      .then(setConversations)
      .catch((err) => console.error('Erro ao carregar conversas:', err));
  }, [setConversations]);

  return { conversations, selectedId, setSelectedId };
}