'use client';
import { useConversations } from '@/hooks/useConversations';
import { useSocket } from '@/hooks/useSocket';
import { AppLayout } from './Layout/AppLayout';
import { ConversationList } from './Inbox/ConversationList';
import { ChatWindow } from './Chat/ChatWindow';
import { TriageInfoCard } from './TriagePanel/TriageInfoCard';
import { useConversationStore } from '@/stores/conversationStore';

export function SupVeloApp() {
    useSocket();
    const { conversations, selectedId, setSelectedId } = useConversations();
    const { getSelected } = useConversationStore();
    const selectedConversation = getSelected();

    return (
        <AppLayout
            sidebar={
                <ConversationList conversations={conversations} selectedId={selectedId} onSelect={setSelectedId} />
            }
            chat={
                selectedConversation ? (
                    <ChatWindow key={selectedConversation.id} conversation={selectedConversation} />
                ) : (
                    <main className="flex-1 flex items-center justify-center bg-gray-50">
                        <div className="text-center text-gray-400">
                            <p className="text-4xl mb-3">💬</p>
                            <p className="text-lg font-medium">Selecione um atendimento</p>
                            <p className="text-sm mt-1">ou clique em "+ Novo" para iniciar</p>
                        </div>
                    </main>
                )
            }
            panel={
                selectedConversation ? (
                    <TriageInfoCard conversation={selectedConversation} />
                ) : (
                    <aside className="w-72 h-screen bg-gray-50 border-l border-gray-200" />
                )
            }
        />
    );
}