import { CreateConversationUseCase, GetConversationHistoryUseCase, ListConversationsUseCase, ProcessMessageUseCase } from "@/backend/src/application";
import { TakeoverConversationUseCase } from "@/backend/src/application/usecases";
import { createDatabase } from "@/backend/src/infrastructure/database/connection";
import { SQLiteConversationRepository } from "@/backend/src/infrastructure/database/repositories";
import { createApp } from "@/backend/src/infrastructure/http/server";
import { describe, it, expect, beforeAll, vi } from 'vitest';
import request from 'supertest';
import { Container } from "@/backend/src/config/container";

// Mock do AI Provider - não chama o Gemini em testes
const mockAiProvider = {
  processMessage: vi.fn().mockResolvedValue({
    reply: 'Olá! Como posso ajudá-lo?',
    intent: null, sector: null, confidence: 0.3, shouldTransfer: false, summary: null,
  }),
};

const mockNotificationService = {
  notifyMessage: vi.fn(), notifyStatusChanged: vi.fn(),
  notifyConversationListUpdate: vi.fn(), emitTypingToken: vi.fn(),
};

describe('POST /messages', () => {
  let app: ReturnType<typeof createApp>;
  let conversationRepo: SQLiteConversationRepository;

  beforeAll(() => {
    const db = createDatabase(':memory:');
    conversationRepo = new SQLiteConversationRepository(db);
    const messageRepo = new SQLiteConversationRepository(db);

    const container: Container = {
      processMessageUseCase: new ProcessMessageUseCase(mockAiProvider as any, conversationRepo, messageRepo, mockNotificationService as any),
      createConversationUseCase: new CreateConversationUseCase(conversationRepo, mockNotificationService as any),
      listConversationsUseCase: new ListConversationsUseCase(conversationRepo, messageRepo),
      getConversationHistoryUseCase = new GetConversationHistoryUseCase(conversationRepo, messageRepo),
      takeoverConversationUseCase = new TakeoverConversationUseCase(conversationRepo, mockNotificationService as any),
      db,
    };

    app = createApp(container);
  });

  it('processa mensagem e retorna resposta do bot', async () => {
    const res = await request(app).post('/messages').send({
      conversationId: 'test-conv-1',
      clientName: 'Cliente Teste',
      content: 'Olá, preciso de ajuda',
    });
    expect(res.status).toBe(200);
    expect(res.body.botMessage.content).toBe('Olá! Como posso ajudá-lo?');
    expect(res.body.shouldTransfer.toBe(false));
  });

  it('retorna 409 quando conversa já foi transferida', async () => {
    const conv = conversationRepo.create({ clientName: 'Maria' });
    conversationRepo.update(conv.id, { status: 'transferido' as any });

    const res = await request(app).post('/messages').send({
      conversationId: conv.id,
      clientName: 'Maria',
      content: 'Mais uma mensagem',
    });
    expect(res.status).toBe(409);
  });
});