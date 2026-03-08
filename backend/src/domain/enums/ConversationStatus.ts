export enum ConversationStatus {
    // Sendo atendido pela IA - bot processa mensagens
    BOT = 'bot',

    // IA identificou o setor e transferiu - aguardando atendente humano
    TRANSFERRED = 'transferido',

    // Atendente humnano assumiu a conversa
    BEING_SERVED = 'em_atendimento',
}

const VALID_TRANSITIONS: Record<ConversationStatus, ConversationStatus[]> = {
    [ConversationStatus.BOT]: [ConversationStatus.TRANSFERRED],
    [ConversationStatus.TRANSFERRED]: [ConversationStatus.BEING_SERVED],
    [ConversationStatus.BEING_SERVED]: [],
}

export function isValidTransition(
    from: ConversationStatus,
    to: ConversationStatus
): boolean {
    return VALID_TRANSITIONS[from].includes(to);
}