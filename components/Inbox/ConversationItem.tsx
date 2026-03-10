'use client'

import { ConversationSummary, ConversationStatus, Sector, STATUS_LABEL, SECTOR_LABEL } from "@/types/conversation"

interface Props {
  conversation: ConversationSummary
  isSelected: boolean;
  onClick: () => void;
}

const STATUS_DOT: Record<ConversationStatus, string> = {
  bot: 'bg-blue-500',
  transferido: 'bg-yellow-500',
  em_atendimento: 'bg-green-500',
};

const SECTOR_COLOR: Record<Sector, string> = {
  vendas: 'text-green-400',
  suporte: 'text-blue-400',
  financeiro: 'text-yellow-400',
};

export function ConversationItem({ conversation, isSelected, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 border-b border-gray-800 hover:bg-gray-800 transition-colors ${
        isSelected ? 'bg-gray-800 border-l-2 border-l-blue-500' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-white font-medium text-sm truncate">{conversation.clientName}</span>
        <span className={`w-2 h-2 rounded-full shrink-0 ml-2 ${STATUS_DOT[conversation.status]}`} />
      </div>
      {conversation.sector && (
        <span className={`text-xs font-semibold uppercase tracking-wide ${SECTOR_COLOR[conversation.sector]}`}>
          {SECTOR_LABEL[conversation.sector]}
        </span>
      )}
      {conversation.lastMessagePreview && (
        <p className="text-gray-400 text-xs mt-1 truncate">{conversation.lastMessagePreview}</p>
      )}
      <div className="mt-2">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
          conversation.status === 'bot' ? 'bg-blue-900 text-blue-300'
          : conversation.status === 'transferido' ? 'bg-yellow-900 text-yellow-300'
          : 'bg-green-900 text-green-300'
        }`}>
          {STATUS_LABEL[conversation.status]}
        </span>
      </div>
    </button>
  );
}