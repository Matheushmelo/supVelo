import { ConversationStatus, Sector } from "../enums";

export interface Conversation {
  id: string;
  clientName: string;
  status: ConversationStatus;
  sector: Sector | null;
  intent: string | null;
  summary: string | null;
  confidence: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateConversationInput {
  clientName: string;
}

export interface UpdateConversationInput {
  status?: ConversationStatus;
  sector?: Sector;
  intent?: string;
  summary?: string;
  confidence?: number;
}