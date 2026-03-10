export type MessageRole = 'client' | 'bot' | 'agent';

export interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  timestamp: number;
}