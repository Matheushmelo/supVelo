import { ConversationStatus, MessageRole } from "@domain/enums";
import { isValidTransition } from "@domain/enums/ConversationStatus";
import type { IAIProvider } from "@application/ports";
import type { IConversationRepository } from "@application/ports";
import type { IMessageRepository } from "@application/ports";
import type { INotificationService } from "@application/ports";
import type { ProcessMessageInput, ProcessMessageOutput } from "@application/dtos";

export class ProcessMessageUseCase {
  constructor(
    private readonly aiProvider: IAIProvider,
    private readonly conversationRepo: IConversationRepository,
    private readonly messageRepo: IMessageRepository,
    private readonly notificationService: INotificationService
  ) {}

  async execute(input: ProcessMessageInput): Promise<ProcessMessageOutput> {
    // 1. Buscar conversa existente ou criar uma nova
    let conversation = this.conversationRepo.findById(input.conversationId);

    if (!conversation) {
      conversation = this.conversationRepo.create({
        clientName: input.clientName,
      });
      this.notificationService.notifyConversationListUpdated();
    }

    // 2. Verificar se a conversa ainda aceita mensagens do bot
    if (conversation.status !== ConversationStatus.BOT) {
      throw new ConversationNotInBotStateError(
        conversation.id,
        conversation.status
      );
    }

    // 3. Salvar a mensagem do cliente
    const clientMessage = this.messageRepo.create({
      conversationId: conversation.id,
      role: MessageRole.CLIENT,
      content: input.content,
    });

    this.notificationService.notifyNewMessage(conversation.id, clientMessage);

    // 4. Buscar histórico completo e enviar para a IA
    const history = this.messageRepo.findByConversationId(conversation.id);

    const triageResult = await this.aiProvider.processMessage(
      history,
      (token) => {
        this.notificationService.emitTypingToken(conversation!.id, token);
      }
    );

    // 5. Salvar a resposta do bot
    const botMessage = this.messageRepo.create({
      conversationId: conversation.id,
      role: MessageRole.BOT,
      content: triageResult.reply,
    });

    this.notificationService.notifyNewMessage(conversation.id, botMessage);

    // 6. Se a IA decidir transferir, atualizar o status da conversa
    if (triageResult.shouldTransfer && triageResult.sector) {
      if (isValidTransition(conversation.status, ConversationStatus.TRANSFERRED)) {
        conversation = this.conversationRepo.update(conversation.id, {
          status: ConversationStatus.TRANSFERRED,
          sector: triageResult.sector,
          intent: triageResult.intent ?? undefined,
          summary: triageResult.summary ?? undefined,
          confidence: triageResult.confidence,
        });

        this.notificationService.notifyStatusChanged(conversation);
        this.notificationService.notifyConversationListUpdated();
      }
    } else if (triageResult.intent && triageResult.sector) {
      // Atualizar intenção parcial mesmo sem transferir ainda
      conversation = this.conversationRepo.update(conversation.id, {
        intent: triageResult.intent,
        sector: triageResult.sector,
        confidence: triageResult.confidence,
      });

      this.notificationService.notifyStatusChanged(conversation);
      this.notificationService.notifyConversationListUpdated();
    }

    return {
      conversationId: conversation.id,
      clientMessage: {
        id: clientMessage.id,
        content: clientMessage.content,
        role: clientMessage.role,
        createdAt: clientMessage.createdAt,
      },
      botMessage: {
        id: botMessage.id,
        content: botMessage.content,
        role: botMessage.role,
        createdAt: botMessage.createdAt,
      },
      conversationStatus: conversation.status,
      sector: conversation.sector,
      intent: conversation.intent,
      shouldTransfer: triageResult.shouldTransfer,
      summary: triageResult.summary,
      confidence: triageResult.confidence,
    };
  }
}

export class ConversationNotInBotStateError extends Error {
  constructor(conversationId: string, currentStatus: ConversationStatus) {
    super(
      `Conversa ${conversationId} não está no estado BOT (status atual: ${currentStatus}). ` +
        `O bot não pode mais processar mensagens nesta conversa.`
    );
    this.name = 'ConversationNotInBotStateError';
  }
}