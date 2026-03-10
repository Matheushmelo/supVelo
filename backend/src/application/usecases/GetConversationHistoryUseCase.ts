import type { Conversation, Message } from '@domain/entities';
import type { IConversationRepository } from '../ports/IConversationRepository';
import type { IMessageRepository } from '../ports/IMessageRepository';

export class GetConversationHistoryUseCase {
  constructor(
    private readonly conversationRepo: IConversationRepository,
    private readonly messageRepo: IMessageRepository
  ) {}

  execute(conversationId: string): ConversationsWithMessages | null {
    const conversation = this.conversationRepo.findById(conversationId);
    if (!conversation) return null;

    const messages = this.messageRepo.findByConversationId(conversationId);

    return {
      conversation,
      messages,
    };
  }
}

export interface ConversationsWithMessages {
  conversation: Conversation;
  messages: Message[];
}