import {ProcessMessageUseCase} from "@application/usecases";
import {Request, Response, NextFunction} from "express";
import {ProcessMessageSchema} from "@application/dtos";

export class MessageController {
    constructor(private readonly processMessageUseCase: ProcessMessageUseCase) {}

    sendMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const input = ProcessMessageSchema.parse(req.body);
            const result = await this.processMessageUseCase.execute(input);
            res.status(200).json(result);
        } catch (err) {
            next(err);
        }
    };
}