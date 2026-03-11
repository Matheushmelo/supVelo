'use client';

import { ConversationSummary } from "@/types/conversation";
import { ConversationItem } from './ConversationItem';

interface Props {
  conversations: ConversationSummary[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function ConversationList({ conversations, selectedId, onSelect }: Props) {
  return (
    <aside className="w-72 h-screen bg-gray-900 flex flex-col shrink-0 border-r border-gray-800">
      <div className="px-4 py-4 border-b border-gray-800">
        <h2 className="text-white font-semibold text-lg">Atendimentos</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="text-gray-500 text-sm text-center py-8 px-4">
            Nenhum atendimento ainda.<br />
            Aguardando clientes entrarem em contato.
          </div>
        ) : (
          conversations.map((c) => (
            <ConversationItem
              key={c.id}
              conversation={c}
              isSelected={c.id === selectedId}
              onClick={() => onSelect(c.id)}
            />
          ))
        )}
      </div>
    </aside>
  );
}