import { Request, Response, NextFunction} from "express";
import {ConversationNotInBotStateError} from "@application/usecases";
import {ZodError} from "zod";

export function errorHandler(
    err: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction
): void {
    if (err instanceof ZodError) {
        res.status(400).json({
            error: 'Dados inválidos',
            details: err.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
        });
        return;
    }

    if (err instanceof ConversationNotInBotStateError) {
        res.status(409).json({ error: err.message });
        return;
    }

    if (err instanceof Error) {
        console.error('Erro capturado:', err.message);
        const status = err.message.includes('não encontrada') ? 404 : 400;
        res.status(status).json({ error: err.message });
        return;
    }

    console.error('unhandled error:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
}