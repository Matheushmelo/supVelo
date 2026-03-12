import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProcessMessageUseCase, ConversationNotInBotStateError } from '../../../src/application/usecases';
import { ConversationStatus, MessageRole, Sector } from '../../../src/domain/enums';
import type { Conversation } from '../../../src/domain/entities';

const mockAiProvider = { processMessage: vi.fn() };
const mockConversationRepo = { findById: vi.fn(), findAll: vi.fn(), create: vi.fn(), update: vi.fn() };
const mockMessageRepo = { findByConversationId: vi.fn(), create: vi.fn() };
const mockNotificationService = { notifyNewMessage: vi.fn(), notifyStatusChanged: vi.fn(), notifyConversationListUpdated: vi.fn(), emitTypingToken: vi.fn() };

function makeConv(overrides: Partial<Conversation> = {}): Conversation {
    return { id: 'conv-1', clientName: 'João', status: ConversationStatus.BOT, sector: null, intent: null, summary: null, confidence: null, createdAt: new Date(), updatedAt: new Date(), ...overrides };
}

describe('ProcessMessageUseCase', () => {
    let useCase: ProcessMessageUseCase;

    beforeEach(() => {
        vi.clearAllMocks();
        useCase = new ProcessMessageUseCase(mockAiProvider as any, mockConversationRepo as any, mockMessageRepo as any, mockNotificationService as any);
    });

    it('cria nova conversa quando conversationId não existe', async () => {
        const newConv = makeConv({ id: 'new-uuid' });
        mockConversationRepo.findById.mockReturnValue(null);
        mockConversationRepo.create.mockReturnValue(newConv);
        mockConversationRepo.update.mockReturnValue(newConv);
        mockMessageRepo.findByConversationId.mockReturnValue([]);
        let n = 0;
        mockMessageRepo.create.mockImplementation((input: any) => ({ id: `msg-${++n}`, ...input, createdAt: new Date() }));
        mockAiProvider.processMessage.mockResolvedValue({ reply: 'Olá!', intent: null, sector: null, confidence: 0.3, shouldTransfer: false, summary: null });

        const result = await useCase.execute({ conversationId: 'qualquer', clientName: 'João', content: 'Oi' });

        expect(mockConversationRepo.create).toHaveBeenCalledWith({ clientName: 'João' });
        expect(result.botMessage.content).toBe('Olá!');
        expect(result.shouldTransfer).toBe(false);
    });

    it('transfere quando IA retorna shouldTransfer = true', async () => {
        const conv = makeConv();
        const transferred = makeConv({ status: ConversationStatus.TRANSFERRED, sector: Sector.FINANCE, intent: 'pagamento', confidence: 0.95, summary: 'Boleto vencido' });
        mockConversationRepo.findById.mockReturnValue(conv);
        mockConversationRepo.update.mockReturnValue(transferred);
        mockMessageRepo.findByConversationId.mockReturnValue([]);
        let n = 0;
        mockMessageRepo.create.mockImplementation((input: any) => ({ id: `msg-${++n}`, ...input, createdAt: new Date() }));
        mockAiProvider.processMessage.mockResolvedValue({ reply: 'Transferindo!', intent: 'pagamento', sector: Sector.FINANCE, confidence: 0.95, shouldTransfer: true, summary: 'Boleto vencido' });

        const result = await useCase.execute({ conversationId: 'conv-1', clientName: 'João', content: 'Pagar boleto' });

        expect(mockConversationRepo.update).toHaveBeenCalledWith('conv-1', expect.objectContaining({ status: ConversationStatus.TRANSFERRED }));
        expect(mockNotificationService.notifyStatusChanged).toHaveBeenCalled();
        expect(result.shouldTransfer).toBe(true);
        expect(result.sector).toBe(Sector.FINANCE);
    });

    it('lança erro quando conversa não está no estado BOT', async () => {
        mockConversationRepo.findById.mockReturnValue(makeConv({ status: ConversationStatus.TRANSFERRED }));
        await expect(useCase.execute({ conversationId: 'conv-1', clientName: 'João', content: 'Oi' }))
            .rejects.toThrow(ConversationNotInBotStateError);
        expect(mockAiProvider.processMessage).not.toHaveBeenCalled();
    });
});