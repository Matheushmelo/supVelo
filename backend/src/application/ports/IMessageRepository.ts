import { Message, CreateMessageInput } from '@domain/entities';

export interface IMessageRepository {
  // Busca todas as mensagens de uma conversa, ordenadas cronologicamente.
  findByConversationId(conversationId: string): Message[];

  // Cria uma nova mensagem associada a um conversa.
  create(input: CreateMessageInput): Message;
}