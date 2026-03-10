import { Server as SocketServer } from 'socket.io';
import {createDatabase} from "@infrastructure/database/connection";
import {SQLiteConversationRepository, SQLiteMessageRepository} from "@infrastructure/database/repositories";
import {GeminiProvider} from "@infrastructure/ai/GeminiProvider";
import {SocketNotificationService} from "@infrastructure/websocket/SocketNotificationService";
import {
    CreateConversationUseCase,
    GetConversationHistoryUseCase,
    ListConversationsUseCase,
    ProcessMessageUseCase, TakeoverConversationUseCase
} from "@application/usecases";
import { env } from './env';

export function createContainer(io: SocketServer) {
    const db = createDatabase(env.DATABASE_PATH);
    const conversationRepo = new SQLiteConversationRepository(db);
    const messageRepo = new SQLiteMessageRepository(db);
    const aiProvider = new GeminiProvider(env.GEMINI_API_KEY);
    const notificationService = new SocketNotificationService(io);

    return {
        processMessageUseCase: new ProcessMessageUseCase(aiProvider, conversationRepo, messageRepo, notificationService),
        createConversationUseCase: new CreateConversationUseCase(conversationRepo, notificationService),
        listConversationsUseCase: new ListConversationsUseCase(conversationRepo, messageRepo),
        getConversationHistoryUseCase: new GetConversationHistoryUseCase(conversationRepo, messageRepo),
        takeoverConversationUseCase: new TakeoverConversationUseCase(conversationRepo, notificationService),
        db,
    };
}

export type Container = ReturnType<typeof createContainer>;