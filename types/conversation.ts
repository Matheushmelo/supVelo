export type ConversationStatus = 'bot' | 'transferido' | 'em_atendimento';
export type Sector = 'vendas' | 'suporte' | 'financeiro';

export interface Conversation {
  id: string;
  clientName: string;
  status: ConversationStatus;
  sector: Sector | null;
  intent: string | null;
  summary: string | null;
  confidence: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationSummary extends Conversation {
  lastMessagePreview: string | null;
}

export const STATUS_LABEL: Record<ConversationStatus, string> = {
  bot: 'Bot',
  transferido: 'Aguardando',
  em_atendimento: 'Em Atendimento',
};

export const SECTOR_LABEL: Record<Sector, string> = {
  vendas: 'Vendas',
  suporte: 'Suporte',
  financeiro: 'Financeiro',
};