import { Sector } from "../enums";

export interface TriageResult {
  // Mensagem de resposta para o cliente
  reply: string;

  // Intenção específica detectada
  intent: string | null;

  // Setor classificado para encaminhamento
  sector: Sector | null;

  // Confiança da classificação (0 a 1)
  confidence: number;

  // Se o atendimento deve ser transferido agora
  shouldTransfer: boolean;

  // Resumo do atendimento para o atendente humano
  summary: string | null;
}