'use client';
import {ConversationSummary} from "@/types/conversation";
import { SectorBadge } from './SectorBadge';

function ConfidenceBar({ value }: { value: number }) {
    const pct = Math.round(value * 100);
    const color = pct >= 75 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-red-400';
    return (
        <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Confiança</span><span className="font-medium">{pct}%</span>
            </div>
            <div className="h-1.5 bg-gray-200 rounded-full">
                <div className={`h-1.5 rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
}

export function TriageInfoCard({ conversation }: { conversation: ConversationSummary }) {
    const hasData = conversation.sector || conversation.intent;
    return (
        <aside className="w-72 h-screen bg-gray-50 border-l border-gray-200 flex flex-col shrink-0">
            <div className="px-5 py-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-800 text-sm">Informações do Atendimento</h3>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
                {!hasData ? (
                    <p className="text-gray-400 text-sm text-center py-8">A IA ainda está coletando informações...</p>
                ) : (
                    <>
                        {conversation.sector && (
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2">Setor identificado</p>
                                <SectorBadge sector={conversation.sector} size="lg" />
                            </div>
                        )}
                        {conversation.intent && (
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Intenção detectada</p>
                                <p className="text-gray-800 text-sm capitalize">{conversation.intent}</p>
                            </div>
                        )}
                        {conversation.confidence != null && <ConfidenceBar value={conversation.confidence} />}
                        {conversation.summary && (
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Resumo da IA</p>
                                <div className="bg-white border border-gray-200 rounded-lg p-3">
                                    <p className="text-gray-700 text-sm leading-relaxed">{conversation.summary}</p>
                                </div>
                            </div>
                        )}
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2">Status</p>
                            <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${
                                conversation.status === 'bot' ? 'bg-blue-100 text-blue-700'
                                    : conversation.status === 'transferido' ? 'bg-yellow-100 text-yellow-700'
                                        : 'bg-green-100 text-green-700'
                            }`}>
                {conversation.status === 'bot' ? '🤖 Bot em atendimento'
                    : conversation.status === 'transferido' ? '⏳ Aguardando atendente'
                        : '✅ Em atendimento humano'}
              </span>
                        </div>
                    </>
                )}
            </div>
        </aside>
    );
}