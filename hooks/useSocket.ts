'use client';

import { ConversationStatus } from "@/types/conversation";
import { listConversations } from "@/services/api";
import { getSocket, joinConversation, leaveConversation } from "@/services/socket";
import { useConversationStore } from "@/stores/conversationStore";
import { Sector } from "@/types/conversation";
import { Message } from "@/types/message";
import { useEffect } from "react";

interface StatusChangedPayload {
  conversationId: string;
  status: ConversationStatus;
  sector: Sector | null;
  intent: string | null;
  summary: string | null;
  confidence: number | null;
}

export function useSocket() {
  const { addMessage, appendTypingToken, clearTyping, setConversations, upsertConversation } = 
    useConversationStore();

  useEffect(() => {
    const socket = getSocket();

    socket.on('new_message', (msg: Message) => {
      addMessage(msg.conversationId, msg);
      if (msg.role === 'bot') clearTyping(msg.conversationId);
      upsertConversation({ id: msg.conversationId, lastMessagePreview: msg.content })
    });

    socket.on('bot_typing', ({ token, conversationId}: { token: string; conversationId: string}) => {
      if (conversationId) appendTypingToken(conversationId, token);
    });

    socket.on('status_changed', (payload: StatusChangedPayload) => {
      upsertConversation({ id: payload.conversationId ,...payload });
    });

    socket.on('conversation_list_updated', async () => {
      try {
        const conversations = await listConversations();
        setConversations(conversations);
      } catch (err) {
        console.error('Erro ao atualizar lista:', err)
      }
    });

    return () => {
      socket.off('new_message');
      socket.off('bot_typing');
      socket.off('status_changed');
      socket.off('conversation_list_updated');
    };

  }, [addMessage, appendTypingToken, clearTyping, setConversations, upsertConversation]);
}

export function useConversationRoom(conversationId: string | null) {
  useEffect(() => {
    if (!conversationId) return;
    joinConversation(conversationId);
    return () => leaveConversation(conversationId);
  }, [conversationId]);
}