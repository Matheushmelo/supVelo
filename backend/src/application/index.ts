// Use Cases
export {
  ProcessMessageUseCase,
  ConversationNotInBotStateError,
  ListConversationsUseCase,
  GetConversationHistoryUseCase,
  CreateConversationUseCase,
  type ConversationsWithMessages,
} from './usecases'

// Ports (Interfaces)
export type { IAIProvider } from './ports';
export type { IConversationRepository } from './ports';
export type { IMessageRepository } from './ports';
export type { INotificationService } from './ports';

// DTOs
export {
  ProcessMessageSchema,
  type ProcessMessageInput,
  type ProcessMessageOutput,
} from './dtos';

export type { ConversationSummaryDTO } from './dtos';