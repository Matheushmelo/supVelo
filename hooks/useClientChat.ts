import { createConversation, sendMessage } from "@/services/api";
import { getSocket, joinConversation, leaveConversation } from "@/services/socket";
import { ConversationStatus, Sector } from "@/types/conversation";
import { Message } from "@/types/message";
import { useCallback, useEffect, useRef, useState } from "react";

export function useClientChat() {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [clientName, setClientName] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [status, setStatus] = useState<ConversationStatus | null>(null);
  const [sector, setSector] = useState<Sector | null>(null);
  const [sending, setSending] = useState(false);

  const convIdRef = useRef(conversationId);
  convIdRef.current = conversationId;
  const clientNameRef = useRef(clientName);
  clientNameRef.current = clientName;

  useEffect(() => {
    if (!conversationId) return;

    const socket = getSocket();
    joinConversation(conversationId);

    const onNewMessage = (msg: Message) => {
      if (msg.conversationId !== convIdRef.current) return;
      setMessages((prev) =>
        prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]
      );
      if (msg.role === 'bot') setIsTyping(false)
    };

    const onBotTyping = ({ conversationId: cid }: {conversationId: string }) => {
      if (cid !== convIdRef.current) return;
      setIsTyping(true);
    };

    const onStatusChanged = (payload: {
      conversationId: string;
      status: ConversationStatus;
      sector: Sector | null;
    }) => {
      if(payload.conversationId !== convIdRef.current) return;
      setStatus(payload.status);
      setSector(payload.sector);
    };

    socket.on('new_message', onNewMessage);
    socket.on('bot_typing', onBotTyping);
    socket.on('status_changed', onStatusChanged);

    return () => {
      leaveConversation(conversationId);
      socket.off('new_message', onNewMessage);
      socket.off('bot_typing', onBotTyping);
      socket.off('status_changed', onStatusChanged);
    };
  }, [conversationId]);

  const startConversation = useCallback(async (name: string) => {
    const conversation = await createConversation(name);
    setConversationId(conversationId);
    setClientName(name);
    setStatus(conversation.status)
  }, []);

  const send = useCallback(async (content: string) => {
    if (convIdRef.current) return;
    setSending(true)
    try {
      const res = await sendMessage(convIdRef.current, clientNameRef.current, content);
      setMessages((prev) => {
        const ids = new Set([res.clientMessage.id, res.botMessage.id]);
        return [...prev.filter((m) => !ids.has(m.id)), res.clientMessage, res.botMessage];
      });
      setStatus(res.conversationStatus as ConversationStatus);
      setSector(res.sector as Sector | null);
    } catch (err) {
      console.error('Erro ao enviar:', err);
    } finally {
      setSending(false);
    }
  }, []);

  return {
    conversationId,
    messages,
    isTyping,
    status,
    sector,
    sending,
    startConversation,
    send,
  };
}