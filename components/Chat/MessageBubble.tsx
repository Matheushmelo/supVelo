'use client'
import type { Message } from '@/types/message';

export function MessageBubble({ message }: { message: Message }) {
  const isClient = message.role === 'client';
  const isBot = message.role === 'bot';
  const time = new Date(message.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`flex mb-4 ${isClient ? 'justify-end' : 'justify-start'}`}>
      {!isClient && (
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mr-2 shrink-0 mt-1 ${isBot ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'}`}>
          {isBot ? 'IA' : 'AG'}
        </div>
      )}
      <div className="max-w-xs lg:max-w-md xl:max-w-lg">
        {!isClient && <p className="text-xs text-gray-400 mb-1 ml-1">{isBot ? 'Agente IA' : 'Atendente'}</p>}
        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
          isClient ? 'bg-blue-600 text-white rounded-br-sm'
          : isBot ? 'bg-gray-100 text-gray-800 rounded-bl-sm'
          : 'bg-green-100 text-green-900 rounded-bl-sm'
        }`}>
          {message.content}
        </div>
        <p className={`text-xs text-gray-400 mt-1 ${isClient ? 'text-right' : 'text-left ml-1'}`}>{time}</p>
      </div>
      {isClient && (
        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold ml-2 shrink-0 mt-1 text-gray-600">CL</div>
      )}
    </div>
  );
}