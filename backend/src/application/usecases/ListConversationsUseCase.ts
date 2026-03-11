import type { IConversationRepository } from "@application/ports";
import type { IMessageRepository } from "@application/ports";
import type { ConversationSummaryDTO } from "@application/dtos";

export class ListConversationsUseCase {
  constructor(
    private readonly conversationRepo: IConversationRepository,
    private readonly messageRepo: IMessageRepository
  ) {}

  execute(): ConversationSummaryDTO[] {
    const conversations = this.conversationRepo.findAll();

    return conversations.map((conversation) => {
      const messages = this.messageRepo.findByConversationId(conversation.id);
      const lastMessage = messages[messages.length - 1];

      return {
        id: conversation.id,
        clientName: conversation.clientName,
        status: conversation.status,
        sector: conversation.sector,
        intent: conversation.intent,
        summary: conversation.summary,
        confidence: conversation.confidence,
        lastMessagePreview: lastMessage
          ? lastMessage.content.substring(0, 80) +
            (lastMessage.content.length > 80 ? "..." : "")
          : null,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
      };
    });
  }
}