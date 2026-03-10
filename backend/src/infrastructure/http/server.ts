import express, { Application } from 'express';
import cors from 'cors';
import {messageRoutes} from "@infrastructure/http/routes/message.routes";
import {conversationRoutes} from "@infrastructure/http/routes/conversation.routes";
import {errorHandler} from "@infrastructure/http/middlewares/error-handler";
import { Container } from '@config/container';

export function createApp(container: Container): Application {
    const app = express();
    app.use(cors({ origin:process.env['FRONTEND_URL'] || '*', credentials: true }));
    app.use(express.json());
    app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date() }));
    app.use('/messages', messageRoutes(container));
    app.use('/conversations', conversationRoutes(container));
    app.use(errorHandler)

    return app;
}