import { z } from 'zod';
import { ConversationStatus, Sector, MessageRole } from '../../domain/enums';

export const ProcessMessageSchema = z.object({
  conversationId: z.string().min(1, 'conversationID é obrigatório'),
  clientName: z.string().min(1, 'clientName é obrigatório').max(100),
  content: z.string().min(1, 'content é obrigatório').max(5000),
});

export type ProcessMessageInput = z.infer<typeof ProcessMessageSchema>;

export interface ProcessMessageOutput {
  conversationId: string;
  clientMessage: {
    id: string;
    content: string;
    role: MessageRole;
    createdAt: Date;
  };
  botMessage: {
    id: string;
    content: string;
    role: MessageRole;
    createdAt: Date;
  };
  conversationStatus: ConversationStatus;
  sector: Sector | null;
  intent: string | null;
  shouldTransfer: boolean;
  summary: string | null;
  confidence: number;
}