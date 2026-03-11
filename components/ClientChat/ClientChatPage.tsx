'use client';

import { useClientChat } from "@/hooks/useClientChat";
import { useEffect, useRef, useState } from "react";
import { MessageBubble } from "../Chat/MessageBubble";
import { TypingIndicator } from "../Chat/TypingIndicator";
import { MessageInput } from "../Chat/MessageInput";

function NameForm({ onStart }: { onStart: (name: string) => Promise<void> }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || loading) return;
    setLoading(true);
    try {
      await onStart(name.trim());
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <input
        type="text"
        placeholder="Qual é o seu nome?"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 mb-3"
        autoFocus
        disabled={loading}
      />
      <button
        onClick={handleSubmit}
        disabled={loading || !name.trim()}
        className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-3 rounded-lg text-sm font-medium transition-colors"
      >
        {loading ? 'Iniciando...' : 'Iniciar atendimento'}
      </button>
    </>
  );
}

export function ClientChatPage() {
  const { conversationId, messages, isTyping, status, sector, sending, startConversation, send } =
    useClientChat();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Tela de entrada: formulário de nome
  if (!conversationId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-sm">
          <div className="text-center mb-6">
            <p className="text-4xl">💬</p>
            <h1 className="text-xl font-semibold text-gray-900 mt-2">Fale conosco</h1>
            <p className="text-sm text-gray-500 mt-1">Nosso assistente vai te ajudar</p>
          </div>
          <NameForm onStart={startConversation} />
        </div>
      </div>
    );
  }

  // Tela de chat
  const isDisabled = status === 'transferido' || status === 'em_atendimento';
  const disabledReason =
    status === 'transferido'
      ? `Transferido para ${sector ?? 'atendimento'} — aguardando atendente`
      : status === 'em_atendimento'
      ? 'Em atendimento humano'
      : undefined;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 w-full max-w-lg flex flex-col h-[600px]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-200 flex-shrink-0">
          <p className="font-semibold text-gray-900 text-sm">Atendimento ao Cliente</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {status === 'bot' && '🤖 Assistente virtual'}
            {status === 'transferido' && `⏳ Aguardando atendente — ${sector ?? ''}`}
            {status === 'em_atendimento' && `✅ Em atendimento — ${sector ?? ''}`}
          </p>
        </div>

        {/* Mensagens */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          {isTyping && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <MessageInput
          onSend={send}
          disabled={isDisabled}
          disabledReason={disabledReason}
          loading={sending}
        />
      </div>
    </div>
  );
}