import { Sector } from '@domain/enums';
import { SchemaType, type FunctionDeclaration } from '@google/generative-ai';

// Declaração da função no formato do Gemini (functionDeclarations)
export const CLASSIFY_FUNCTION_DECLARATION: FunctionDeclaration = {
    name: 'classify_conversation',
    description:
        'Registra o estado atual da triagem após cada resposta ao cliente. DEVE ser chamada após TODA resposta.',
    parameters: {
        type: SchemaType.OBJECT,
        properties: {
            intent: {
                type: SchemaType.STRING,
                description: 'Intenção específica (ex: "pagamento de boleto"). Omitir se ainda não identificou.',
                nullable: true,
            },
            sector: {
                type: SchemaType.STRING,
                format: 'enum',
                enum: Object.values(Sector),
                description: 'Setor: vendas, suporte ou financeiro. Omitir se não identificou.',
                nullable: true,
            },
            confidence: {
                type: SchemaType.NUMBER,
                description: 'Confiança de 0 a 1. Use 0.3 para incerto, 0.75+ para transferir.',
            },
            shouldTransfer: {
                type: SchemaType.BOOLEAN,
                description: 'True quando a intenção está clara e deve transferir agora.',
            },
            summary: {
                type: SchemaType.STRING,
                description: 'Resumo para o agente humano. Preencher SOMENTE quando shouldTransfer = true.',
                nullable: true,
            },
        },
        required: ['confidence', 'shouldTransfer'],
    },
};

export interface ClassifyConversationArgs {
    intent?: string | null;
    sector?: string | null;
    confidence: number;
    shouldTransfer: boolean;
    summary?: string | null;
}