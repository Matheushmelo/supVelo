'use client';
import { useState, KeyboardEvent } from 'react';

interface Props {
  onSend: (content: string) => void;
  disabled?: boolean;
  disabledReason?: string;
  loading?: boolean;
}

export function MessageInput({ onSend, disabled, disabledReason, loading }: Props) {
  const [value, setValue] = useState('')

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled || loading) return;
    onSend(trimmed);
    setValue('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  if (disabled && disabledReason) {
    return (
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500 py-2">
          <span className="w-2 h-2 bg-yellow-400 rounded-full" />
          {disabledReason}
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-gray-200 p-4 bg-white">
      <div className="flex gap-3 items-end">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Digite uma mensagem... (Enter para enviar)"
          disabled={disabled || loading}
          rows={2}
          className="flex-1 resize-none border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <button
          onClick={handleSend}
          disabled={disabled || loading || !value.trim()}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-xl px-5 py-2.5 text-sm font-medium flex-shrink-0"
        >
          {loading ? '...' : 'Enviar'}
        </button>
      </div>
    </div>
  );
}