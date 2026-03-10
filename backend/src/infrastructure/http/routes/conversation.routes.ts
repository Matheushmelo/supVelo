import { Router } from "express";
import {ConversationController} from "@infrastructure/http/controllers/ConversationController";

export function conversationRoutes(container: Container): Router {
    const router = Router();
    const controller = new ConversationController(
        container.listConversationsUseCase,
        container.getConversationHistoryUseCase,
        container.createConversationUseCase,
        container.takeoverConversationUsseCase
    );

    // GET /conversations
    router.get('/', controller.listConversations);

    // POST /conversations
    router.post('/', controller.createConversation);

    // GET /conversations/:id/history
    router.get('/:id/history', controller.getHistory);

    // PATCH /conversations/:id/takeover
    router.patch('/:id/takeover', controller.takeover);

    return router
}