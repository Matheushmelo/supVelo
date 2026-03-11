import type { Conversation } from "@domain/entities";
import type { IConversationRepository } from "@application/ports";
import type { INotificationService } from "@application/ports";

export class CreateConversationUseCase {
  constructor(
    private readonly conversationRepo: IConversationRepository,
    private readonly notificationService: INotificationService
  ) {}

  execute(clientName: string): Conversation {
    const conversation = this.conversationRepo.create({ clientName });
    this.notificationService.notifyConversationListUpdated();
    return conversation;
  }
}