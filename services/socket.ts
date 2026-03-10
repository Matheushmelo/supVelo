import { io, Socket } from "socket.io-client";

// Socket conecta direto no backend (não passa pelo proxy do Next.js)
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

let socket: Socket | null = null;

export function getSocket(): Socket  {
  if (!socket) {
    socket = io(SOCKET_URL, { transports: ['websocket'], autoConnect: true});
    socket.on('connect', () =>console.log('🔌 Socket conectado:', socket?.id));
    socket.on('disconnect', () => console.log('🔌 Socket desconectado'));
  }
  return socket;
}

export function joinConversation(conversationId: string): void {
  getSocket().emit('join_conversation', conversationId);
}

export function leaveConversation(conversationId: string): void {
  getSocket().emit('leave_conversation', conversationId);
}