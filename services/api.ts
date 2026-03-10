import { Conversation, ConversationSummary } from "@/types/conversation";
import { Message } from "@/types/message";
import axios from "axios";

// Usa a proxy do next.config.ts
const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export async function listConversations(): Promise<ConversationSummary[]> {
  const { data } = await api.get<ConversationSummary[]>("/conversations");
  return data;
}

export async function createConversation(clientName: string): Promise<Conversation> {
  const { data } = await api.post<Conversation>("/conversations", { clientName });
  return data;
}

export async function getConversationHistory(id: string): Promise<{
  conversation: Conversation;
  messages: Message[];
}> {
  const { data } = await api.get(`/conversations/${id}/history`);
  return data;
}

export async function takeoverConversation(id: string): Promise<Conversation> {
  const { data } = await api.patch<Conversation>(`/conversations/${id}/takeover`);
  return data;
}

export interface SendMessageResponse {
  conversationId: string;
  clientMessage: Message;
  botMessage: Message;
  conversationStatus: string;
  sector: string | null;
  intent: string | null;
  shouldTransfer: boolean;
  summary: string | null;
  confidence: number;
}

export async function sendMessage(
  conversationId: string,
  clientName: string,
  content: string
): Promise<SendMessageResponse> {
  const { data } = await api.post<SendMessageResponse>('/messages', {
    conversationId,
    clientName,
    content,
  });
  return data;
}