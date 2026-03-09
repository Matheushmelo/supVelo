import type { Conversation } from "../../domain/entities";
import type { IConversationRepository } from "../ports/IConversationRepository";
import type { INotificationService } from "../ports/INotificationService";

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