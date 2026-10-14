export const UNKNOWN_ORDER_OWNER = 'Chưa xác định';
export type SalesOrder = {
  id: string; code: string; externalId: string; source: 'SAPO' | 'PANCAKE';
  orderedAt: string; currency: string; value: number; revenue: number;
  eligible: boolean; status: string; platform: string; channel: string; channelId: string | null;
  owner: string; team: string; seller: string; sellerTeam: string; attribution: string; pageId: string | null;
};
export type SalesDashboard = { market: string; sourceName: string; loadedAt: string; revenueRule: string; orders: SalesOrder[]; syncWarning?: string | null; syncSchedule?: string | null };
export type OrderFilters = { currency: string; platform: string; channel: string; staff: string; team: string; status: string; search: string; role: 'owner' | 'seller' };
export type OrderGroup = { key: string; name: string; team: string; orders: number; revenue: number; currency: string };
export const channelKey = (o: SalesOrder) => o.channelId || o.pageId || `${o.platform}:${o.channel}`;
export const orderStaff = (o: SalesOrder, role: OrderFilters['role']) => role === 'owner' ? o.owner : o.seller;
export const orderTeam = (o: SalesOrder, role: OrderFilters['role']) => role === 'owner' ? o.team : o.sellerTeam;

export function filterOrders(orders: SalesOrder[], f: OrderFilters): SalesOrder[] {
  const search = f.search.trim().toLocaleLowerCase();
  return orders.filter(o => o.currency === f.currency
    && (!f.platform || o.platform === f.platform)
    && (!f.channel || channelKey(o) === f.channel)
    && (!f.staff || orderStaff(o, f.role) === f.staff)
    && (!f.team || orderTeam(o, f.role) === f.team)
    && (f.status === 'ALL' || (f.status === 'REVENUE' ? o.eligible : o.status === f.status))
    && (!search || [o.code, o.externalId, o.pageId, o.channel, o.owner, o.seller, o.team, o.sellerTeam].some(s => s?.toLocaleLowerCase().includes(search))));
}

export function groupOrders(orders: SalesOrder[], by: 'staff' | 'channel' | 'team', role: OrderFilters['role']): OrderGroup[] {
  const groups = new Map<string, OrderGroup>();
  for (const o of orders) {
    const team = orderTeam(o, role);
    const name = by === 'staff' ? orderStaff(o, role) : by === 'team' ? team : o.channel;
    // Never combine currencies or merge a person's different teams.
    const key = JSON.stringify([o.currency, by === 'channel' ? channelKey(o) : name, by === 'staff' ? team : '']);
    const item = groups.get(key) || { key, name, team: by === 'staff' ? team : '', orders: 0, revenue: 0, currency: o.currency };
    item.orders++;
    item.revenue += o.revenue;
    groups.set(key, item);
  }
  return [...groups.values()].sort((a, b) => b.revenue - a.revenue || b.orders - a.orders);
}

export function formatOrderMoney(value: number, currency: string, compact = false): string {
  const n = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2, ...(compact ? { notation: 'compact' as const } : {}) }).format(value);
  return `${n} ${currency === 'UNKNOWN' ? '(chưa rõ tiền tệ)' : currency}`;
}
