import { getServerSupabase } from '@/lib/supabase/server';

export interface AnalyticsSnapshot {
  revenue: number;
  orderCount: number;
  avgOrder: number;
  statusCounts: Record<string, number>;
  regionBreakdown: Array<{ region: string; share: number; revenue: number; orders: number }>;
  dailyRevenue: Array<{ date: string; revenue: number }>;
}

interface OrderMini {
  grand_total: number;
  status: string;
  created_at: string;
  delivery_address: Record<string, unknown> | null;
}

/**
 * Pull every order from the window and aggregate client-side (in memory).
 * Fine while order volume is < ~10k rows per window; past that we'd move to
 * a materialized view or a daily rollup table.
 */
export async function fetchAnalyticsSnapshot(windowDays = 30): Promise<AnalyticsSnapshot> {
  const empty: AnalyticsSnapshot = {
    revenue: 0,
    orderCount: 0,
    avgOrder: 0,
    statusCounts: {},
    regionBreakdown: [],
    dailyRevenue: [],
  };

  const supabase = getServerSupabase();
  if (!supabase) return empty;

  const since = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000).toISOString();
  const db = supabase as unknown as {
    from: (t: string) => {
      select: (c: string) => {
        gte: (k: string, v: string) => Promise<{ data: OrderMini[] | null }>;
      };
    };
  };
  const { data } = await db
    .from('orders')
    .select('grand_total, status, created_at, delivery_address')
    .gte('created_at', since);
  const rows = data ?? [];

  // Totals (excluding cancelled)
  const paid = rows.filter((r) => r.status !== 'cancelled');
  const revenue = paid.reduce((s, r) => s + r.grand_total, 0);
  const orderCount = paid.length;
  const avgOrder = orderCount > 0 ? Math.round(revenue / orderCount) : 0;

  // Status counts
  const statusCounts: Record<string, number> = {};
  for (const r of rows) {
    statusCounts[r.status] = (statusCounts[r.status] ?? 0) + 1;
  }

  // Region breakdown
  const regionTotals = new Map<string, { revenue: number; orders: number }>();
  for (const r of paid) {
    const addr = (r.delivery_address ?? {}) as Record<string, unknown>;
    const region = String(addr.region ?? addr.city ?? 'Unknown') || 'Unknown';
    const prev = regionTotals.get(region) ?? { revenue: 0, orders: 0 };
    prev.revenue += r.grand_total;
    prev.orders += 1;
    regionTotals.set(region, prev);
  }
  const regionBreakdown = Array.from(regionTotals.entries())
    .map(([region, t]) => ({
      region,
      revenue: t.revenue,
      orders: t.orders,
      share: revenue > 0 ? Math.round((t.revenue / revenue) * 100) : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  // Daily revenue (last N days, zero-filled)
  const dayMap = new Map<string, number>();
  for (let i = windowDays - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    dayMap.set(key, 0);
  }
  for (const r of paid) {
    const key = r.created_at.slice(0, 10);
    if (dayMap.has(key)) dayMap.set(key, dayMap.get(key)! + r.grand_total);
  }
  const dailyRevenue = Array.from(dayMap.entries()).map(([date, revenue]) => ({ date, revenue }));

  return { revenue, orderCount, avgOrder, statusCounts, regionBreakdown, dailyRevenue };
}
