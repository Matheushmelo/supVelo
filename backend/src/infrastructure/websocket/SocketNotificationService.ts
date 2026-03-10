import { Server as SocketServer } from 'socket.io'
import {INotificationService} from "@application/ports";
import {Conversation, Message} from "@domain/entities";

export class SocketNotificationService implements INotificationService {
    constructor(private readonly io: SocketServer) {}

    notifyNewMessage(conversationId: string, message: Message) {
        this.io.to(conversationId).emit('new_message', {
            id: message.id,
            conversationId: message.conversationId,
            role: message.role,
            content: message.content,
            createdAt: message.createdAt,
        });
    }

    notifyStatusChanged(conversation: Conversation) {
        this.io.to(conversation.id).emit('status_changed', {
            conversationId: conversation.id,
            status: conversation.status,
            sector: conversation.sector,
            intent: conversation.intent,
            summary: conversation.summary,
            confidence: conversation.confidence,
        });
    }

    notifyConversationListUpdated() {
        this.io.emit('conversation_list_updated');
    }

    emitTypingToken(conversationId: string, token: string) {
        this.io.to(conversationId).emit('bot_typing', { token, conversationId });
    }
}