'use client';
import type { Sector } from '@/types/conversation';
import { SECTOR_LABEL } from '@/types/conversation';

const COLORS: Record<Sector, string> = {
    vendas: 'bg-green-100 text-green-800 border-green-200',
    suporte: 'bg-blue-100 text-blue-800 border-blue-200',
    financeiro: 'bg-yellow-100 text-yellow-800 border-yellow-200',
};

export function SectorBadge({ sector, size = 'sm' }: { sector: Sector; size?: 'sm' | 'lg' }) {
    return (
        <span className={`inline-flex items-center border rounded-full font-semibold uppercase tracking-wider ${COLORS[sector]} ${size === 'lg' ? 'px-4 py-1.5 text-sm' : 'px-2.5 py-1 text-xs'}`}>
            {SECTOR_LABEL[sector]}
        </span>
    );
}