import {IConversationRepository, INotificationService} from "@application/ports";
import {Conversation} from "@domain/entities";
import {ConversationStatus, isValidTransition} from "@domain/enums";

export class TakeoverConversationUseCase {
    constructor(
        private readonly conversationRepo: IConversationRepository,
        private readonly notificationService: INotificationService
    ) {}

    execute(conversationId: string): Conversation {
        const conversation = this.conversationRepo.findById(conversationId)

        if (!conversation) {
            throw new Error(`Conversa ${conversationId} não encontrada`);
        }

        if (!isValidTransition(conversation.status, ConversationStatus.BEING_SERVED)) {
            throw new Error(
                `Conversa não pode ir para EM_ATENDIMENTO a partir do status "${conversation.status}". ` +
                `Só é possível assumir conversas com status "transferido"`
            );
        }

        const updated = this.conversationRepo.update(conversationId, {
            status: ConversationStatus.BEING_SERVED,
        });

        this.notificationService.notifyStatusChanged(updated);
        this.notificationService.notifyConversationListUpdated();

        return updated;
    }
}