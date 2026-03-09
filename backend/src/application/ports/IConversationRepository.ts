import {
  Conversation,
  CreateConversationInput,
  UpdateConversationInput,
} from '../../domain/entities';

export interface IConversationRepository {
  // Busca uma conversa pelo ID. Retorna null se não existir.
  findById(id: string): Conversation | null;

  // Lista todas as conversas, ordenadas pela mais recente.
  findAll(): Conversation[];

  // Cria uma nova conversa com status BOT
  create(input: CreateConversationInput): Conversation;

  // Atualiza campos de uma conversa (status, setor, resumo, etc.).
  update(id: string, input: UpdateConversationInput): Conversation;
}