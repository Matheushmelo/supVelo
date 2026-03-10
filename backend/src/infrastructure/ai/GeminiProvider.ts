import {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
    type Content,
} from '@google/generative-ai';
import { IAIProvider } from '@application/ports';
import { Message } from '@domain/entities';
import { MessageRole, Sector } from '@domain/enums';
import { TriageResult } from '@domain/value-objects/TriageResult';
import { SYSTEM_PROMPT } from './prompts/system-prompt';
import { CLASSIFY_FUNCTION_DECLARATION, ClassifyConversationArgs } from './schemas/ai-response';

const MAX_HISTORY_MESSAGES = 20;
const MODEL_NAME = 'gemini-2.5-flash';

const SAFETY_SETTINGS = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

export class GeminiProvider implements IAIProvider {
    private readonly genAI: GoogleGenerativeAI;

    constructor(apiKey: string) {
        this.genAI = new GoogleGenerativeAI(apiKey);
    }

    async processMessage(
        messages: Message[],
        onToken?: (token: string) => void
    ): Promise<TriageResult> {
        const recentMessages = messages.slice(-MAX_HISTORY_MESSAGES);
        const lastMessage = recentMessages[recentMessages.length - 1];
        const historyMessages = recentMessages.slice(0, -1);

        if (!lastMessage) throw new Error('Nenhuma mensagem para processar');

        const model = this.genAI.getGenerativeModel({
            model: MODEL_NAME,
            systemInstruction: SYSTEM_PROMPT,
            tools: [{ functionDeclarations: [CLASSIFY_FUNCTION_DECLARATION] }],
            toolConfig: { functionCallingConfig: { mode: 'AUTO' as any } },
            safetySettings: SAFETY_SETTINGS,
        });

        const history: Content[] = this.buildHistory(historyMessages);
        const chat = model.startChat({ history });

        let textReply = '';
        let classifyArgs: ClassifyConversationArgs | null = null;

        const streamResult = await chat.sendMessageStream(lastMessage.content);

        for await (const chunk of streamResult.stream) {
            const chunkText = chunk.text();
            if (chunkText) {
                textReply += chunkText;
                onToken?.(chunkText);
            }
        }

        const finalResponse = await streamResult.response;
        for (const candidate of finalResponse.candidates ?? []) {
            for (const part of candidate.content?.parts ?? []) {
                if (part.functionCall?.name === 'classify_conversation') {
                    classifyArgs = part.functionCall.args as ClassifyConversationArgs;
                }
            }
        }

        if (!textReply.trim()) {
            textReply = 'Olá! Sou o assistente de atendimento. Como posso ajudá-lo hoje?';
        }

        return {
            reply: textReply,
            intent: classifyArgs?.intent ?? null,
            sector: this.parseSector(classifyArgs?.sector),
            confidence: classifyArgs?.confidence ?? 0.3,
            shouldTransfer: classifyArgs?.shouldTransfer ?? false,
            summary: classifyArgs?.summary ?? null,
        };
    }

    private buildHistory(messages: Message[]): Content[] {
        const result: Content[] = [];
        for (const msg of messages) {
            const role: 'user' | 'model' =
                msg.role === MessageRole.CLIENT ? 'user' : 'model';
            const last = result[result.length - 1];
            if (last && last.role === role) {
                const lastPart = last.parts[last.parts.length - 1];
                if (lastPart && 'text' in lastPart) lastPart.text += '\n' + msg.content;
            } else {
                result.push({ role, parts: [{ text: msg.content }] });
            }
        }
        return result;
    }

    private parseSector(value: string | null | undefined): Sector | null {
        const valid = Object.values(Sector) as string[];
        if (typeof value === 'string' && valid.includes(value)) return value as Sector;
        return null;
    }
}