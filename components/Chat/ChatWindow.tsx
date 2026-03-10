'use client';

import { useEffect, useRef, useState } from 'react';
import { useMessages } from "@/hooks/useMessage";
import { useConversationStore } from "@/stores/conversationStore";
import { ConversationSummary } from "@/types/conversation";
import { useConversationRoom } from '@/hooks/useSocket';
import { sendMessage, takeoverConversation } from '@/services/api';
import { MessageInput } from './MessageInput';
import { TypingIndicator } from './TypingIndicator';
import { MessageBubble } from './MessageBubble';

export function ChatWindow({ conversation }: {conversation: ConversationSummary}) {
  const { messages, loading } = useMessages(conversation.id);
  const { addMessage, upsertConversation, typing } = useConversationStore();
  const [sending, setSending] = useState(false);
  const [takingOver, setTakingOver] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useConversationRoom(conversation.id);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing[conversation.id]])

  const handleSend = async (content: string) => {
    setSending(true);
    try {
      const response = await sendMessage(conversation.id, conversation.clientName, content);
      addMessage(conversation.id, response.clientMessage);
      addMessage(conversation.id, response.botMessage);
      upsertConversation({
        id: conversation.id,
        status: response.conversationStatus as any,
        sector: response.sector as any,
        intent: response.intent,
        summary: response.summary,
        confidence: response.confidence,
        lastMessagePreview: response.botMessage.content.substring(0, 80),
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
    } finally {
      setSending(false);
    }
  };

  const handleTakeover = async () => {
    setTakingOver(true);
    try {
      const updated = await takeoverConversation(conversation.id);
      upsertConversation({ ...conversation, ...updated });
    } catch (err) {
      console.error('Erro ao assumir:', err);
    } finally {
      setTakingOver(false);
    }
  };

  const isTransferred = conversation.status === 'transferido';
  const isBeingServed = conversation.status === 'em_atendimento';
  const isTyping = Boolean(typing[conversation.id]);

  return (
    <main className="flex-1 flex flex-col h-screen bg-white min-w-0">
      <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-gray-900">{conversation.clientName}</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {conversation.sector ? `Setor: ${conversation.sector}` : 'Triagem em andamento...'}
          </p>
        </div>
        {isTransferred && (
          <button onClick={handleTakeover} disabled={takingOver}
            className="bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-lg font-medium">
            {takingOver ? 'Assumindo...' : '✋ Assumir Atendimento'}
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {loading ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">Carregando...</div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">Nenhuma mensagem ainda.</div>
        ) : (
          <>
            {messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)}
            {isTyping && <TypingIndicator />}
            <div ref={bottomRef} />
          </>
        )}
      </div>
      <MessageInput
        onSend={handleSend}
        disabled={isTransferred || isBeingServed}
        disabledReason={
          isTransferred ? `Transferido para ${conversation.sector ?? 'setor'} — Aguardando atendente`
          : isBeingServed ? 'Em atendimento humano'
          : undefined
        }
        loading={sending}
      />
    </main>
  );
}