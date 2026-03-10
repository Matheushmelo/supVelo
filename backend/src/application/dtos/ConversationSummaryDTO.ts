import { ConversationStatus, Sector } from "@domain/enums";

export interface ConversationSummaryDTO {
  id: string;
  clientName: string;
  status: ConversationStatus;
  sector: Sector | null;
  intent: string | null;
  summary: string | null;
  confidence: number | null;
  lastMessagePreview: string | null;
  createdAt: Date;
  updatedAt: Date;
}