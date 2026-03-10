import http from 'http';
import { Server as SocketServer } from 'socket.io';
import { createApp } from '@infrastructure/http/server';
import { createContainer } from '@config/container';
import { env } from '@config/env';

async function bootstrap() {
    const httpServer = http.createServer();
    const io = new SocketServer(httpServer, {
        cors: { origin: env.FRONTEND_URL, methods: ['GET', 'POST', 'PATCH'], credentials: true },
    });

    const container = createContainer(io);
    const app = createApp(container);
    httpServer.on('request', app);

    io.on('connection', (socket) => {
        console.log(`🔌 Cliente conectado: ${socket.id}`);
        socket.on('join_conversation', (conversationId: string) => {
            socket.join(conversationId);
            console.log(`  → ${socket.id} entrou na sala: ${conversationId}`);
        });
        socket.on('leave_conversation', (conversationId: string) => socket.leave(conversationId));
        socket.on('disconnect', () => console.log(`🔌 Desconectado: ${socket.id}`));
    });

    httpServer.listen(env.PORT, () => {
        console.log(`🚀 Servidor na porta ${env.PORT}`);
        console.log(`🌍 Ambiente: ${env.NODE_ENV}`);
        console.log(`💾 Banco: ${env.DATABASE_PATH}`);
    });
}

bootstrap().catch((err) => { console.error('❌ Falha ao iniciar:', err); process.exit(1); });