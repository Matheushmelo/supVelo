import {MessageController} from "@infrastructure/http/controllers/MessageController";
import {Router} from "express";
import { Container } from '../../../config/container';

export function messageRoutes(container: Container): Router {
    const router = Router();
    const controller = new MessageController(container.processMessageUseCase);
    router.post('/', controller.sendMessage);
    return router;
}