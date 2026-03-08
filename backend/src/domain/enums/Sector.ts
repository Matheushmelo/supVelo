export enum Sector {
    SALES = 'vendas',
    SUPPORT = 'suporte',
    FINANCE = 'finenceiro',
}

export const SECTOR_LABELS: Record<Sector, string> = {
    [Sector.SALES]: 'Vendas',
    [Sector.SUPPORT]: 'Suporte',
    [Sector.FINANCE]: 'Financeiro',
};