import {
    CreateConversationUseCase,
    GetConversationHistoryUseCase,
    ListConversationsUseCase, TakeoverConversationUseCase
} from "@application/usecases";
import {Request, Response, NextFunction} from "express";
import { z } from 'zod';

const CreateConversationSchema = z.object({
    clientName: z.string().min(1, 'clientName obrigatório').max(100),
});

export class ConversationController {
    constructor(
        private readonly listConversationsUseCase: ListConversationsUseCase,
        private readonly getHistoryUseCase: GetConversationHistoryUseCase,
        private readonly createConversationUseCase: CreateConversationUseCase,
        private readonly takeoverUseCase: TakeoverConversationUseCase
    ) {}

    listConversations = (_req: Request, res: Response, next: NextFunction): void => {
        try {
            res.json(this.listConversationsUseCase.execute());
        } catch (err) { next(err); }
    };

    createConversation = (req: Request, res: Response, next: NextFunction): void => {
        try {
            const { clientName } = CreateConversationSchema.parse(req.body);
            res.status(201).json(this.createConversationUseCase.execute(clientName));
        } catch (err) { next(err); }
    };

    // Request<{ id: string }> informa ao TypeScript que params.id é string (não string | string[])
    getHistory = (req: Request<{ id: string }>, res: Response, next: NextFunction): void => {
        try {
            const { id } = req.params;
            const result = this.getHistoryUseCase.execute(id);
            if (!result) { res.status(404).json({ error: 'Conversa não encontrada' }); return; }
            res.json(result);
        } catch (err) { next(err); }
    };

    takeover = (req: Request<{ id: string }>, res: Response, next: NextFunction): void => {
        try {
            const { id } = req.params;
            res.json(this.takeoverUseCase.execute(id));
        } catch (err) { next(err); }
    };
}