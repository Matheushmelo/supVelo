import { Conversation, Message } from '../../domain/entities';

export interface iNotificationService {
  // Notifica que uma mensagem foi adicionada à conversa
  notifyNewMessage(conversationId: string, message: Message): void;

  // Notifica que o status de uma conversa mudou
  notifyStatusChanged(conversation: Conversation): void;

  // Notifica que a lista de conversas foi atualizada
  notifyConversationListUpdated(): void;

  // Emite um token parcial durante streaming de IA
  emitTypingToken(conversationId: string, token: string): void;
}