'use client';

import { useState } from 'react';
import { useConversationStore } from "@/stores/conversationStore";
import { ConversationSummary } from "@/types/conversation";
import { createConversation } from '@/services/api';
import { ConversationItem } from './ConversationItem';

interface Props {
  conversations: ConversationSummary[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function ConversationList({ conversations, selectedId, onSelect }: Props) {
  const { upsertConversation } = useConversationStore();
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [showInput, setShowInput] = useState(false);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const conversation = await createConversation(newName.trim());
      upsertConversation({ ...conversation, lastMessagePreview: null });
      onSelect(conversation.id);
      setNewName('');
      setShowInput(false);
    } catch (err) {
      console.error('Erro ao criar conversa:', err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <aside className="w-72 h-screen bg-gray-900 flex flex-col shrink-0 border-r border-gray-800">
      <div className="px-4 py-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-semibold text-lg">Atendimentos</h2>
          <button onClick={() => setShowInput(!showInput)} className="text-blue-400 hover:text-blue-300 text-sm font-medium">
            + Novo
          </button>
        </div>
        {showInput && (
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Nome do cliente"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              className="flex-1 bg-gray-800 text-white text-sm rounded px-3 py-2 outline-none border border-gray-700 focus:border-blue-500"
              autoFocus
            />
            <button
              onClick={handleCreate}
              disabled={creating || !newName.trim()}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm px-3 py-2 rounded"
            >
              {creating ? '...' : 'Ok'}
            </button>
          </div>
        )}
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="text-gray-500 text-sm text-center py-8 px-4">
            Nenhum atendimento ainda.<br />Clique em "+ Novo" para começar.
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