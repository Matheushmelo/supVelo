import { vi, describe, it, expect, beforeEach } from 'vitest';
import {ConversationStatus, Sector} from '../../../src/domain/enums';
import type {Conversation} from '../../../src/domain/entities';
import { TakeoverConversationUseCase } from '../../../src/application/usecases/TakeoverConversationUseCase';

const mockConversationRepo = { findById: vi.fn(), findAll: vi.fn(), create: vi.fn(), update: vi.fn() };
const mockNotificationService = { notifyNewMessage: vi.fn(), notifyStatusChanged: vi.fn(), notifyConversationListUpdated: vi.fn(), emitTypingToken: vi.fn() };

function makeConv(status: ConversationStatus): Conversation {
    return { id: 'conv-1', clientName: 'Maria', status, sector: Sector.FINANCE, intent: 'pagamento', summary: 'Resumo', confidence: 0.9, createdAt: new Date(), updatedAt: new Date() };
}

describe('TakeoverConversationUseCase', () => {
    let useCase: TakeoverConversationUseCase;

    beforeEach(() => {
        vi.clearAllMocks();
        useCase = new TakeoverConversationUseCase(mockConversationRepo as any, mockNotificationService as any);
    });

    it('assume conversa transferida com sucesso', () => {
        mockConversationRepo.findById.mockReturnValue(makeConv(ConversationStatus.TRANSFERRED));
        mockConversationRepo.update.mockReturnValue(makeConv(ConversationStatus.BEING_SERVED));

        const result = useCase.execute('conv-1');

        expect(mockConversationRepo.update).toHaveBeenCalledWith('conv-1', { status: ConversationStatus.BEING_SERVED });
        expect(mockNotificationService.notifyStatusChanged).toHaveBeenCalled();
        expect(result.status).toBe(ConversationStatus.BEING_SERVED);
    });

    it('lança erro quando conversa não existe', () => {
        mockConversationRepo.findById.mockReturnValue(null);
        expect(() => useCase.execute('inexistente')).toThrow('não encontrada');
    });

    it('lança erro ao tentar assumir conversa em status BOT', () => {
        mockConversationRepo.findById.mockReturnValue(makeConv(ConversationStatus.BOT));
        expect(() => useCase.execute('conv-1')).toThrow();
        expect(mockConversationRepo.update).not.toHaveBeenCalled();
    });
});