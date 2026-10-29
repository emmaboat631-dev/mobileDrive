import { getServerSupabase } from '@/lib/supabase/server';

export interface TxnRow {
  id: string;              // order id or failure id
  kind: 'order' | 'failure';
  orderId: string | null;
  buyer: string;
  method: string;
  provider: string;
  amount: number;
  currency: string;
  status: 'Captured' | 'Pending' | 'Refunded' | 'Failed';
  providerRef: string | null;
  when: string;
}

interface OrderJoin {
  id: string;
  grand_total: number;
  currency: string;
  status: string;
  payment_method: string;
  payment_provider_id: string | null;
  created_at: string;
  profiles: { email: string | null; full_name: string | null } | null;
}

interface FailureJoin {
  id: string;
  order_id: string | null;
  provider: string;
  provider_ref: string | null;
  amount: number | null;
  currency: string | null;
  message: string | null;
  created_at: string;
}

/**
 * Union payment transactions and failed-charge attempts into one admin feed.
 * Captured / pending orders come from `orders`; failed charges come from
 * `payment_failures` (which the Paystack webhook writes to).
 */
export async function fetchTransactions(limit = 50): Promise<TxnRow[]> {
  const supabase = getServerSupabase();
  if (!supabase) return [];
  const db = supabase as any;

  const [{ data: orders }, { data: failures }] = await Promise.all([
    db
      .from('orders')
      .select('id, grand_total, currency, status, payment_method, payment_provider_id, created_at, profiles!orders_user_id_fkey(email, full_name)')
      .order('created_at', { ascending: false })
      .limit(limit),
    db
      .from('payment_failures')
      .select('id, order_id, provider, provider_ref, amount, currency, message, created_at')
      .order('created_at', { ascending: false })
      .limit(limit),
  ]);

  const providerFor = (method: string): string => {
    if (method === 'paystack') return 'Paystack';
    if (method === 'card') return 'Stripe';
    if (method?.includes('momo') || method?.includes('cash') || method?.includes('tigo')) return 'Mobile money';
    return method ?? '—';
  };

  const statusFor = (s: string): TxnRow['status'] => {
    if (s === 'pending') return 'Pending';
    if (s === 'cancelled') return 'Refunded';
    return 'Captured';
  };

  const fromOrders: TxnRow[] = (orders as OrderJoin[] | null ?? []).map((o) => ({
    id: 'o_' + o.id,
    kind: 'order',
    orderId: o.id,
    buyer: o.profiles?.full_name ?? o.profiles?.email ?? '—',
    method: o.payment_method,
    provider: providerFor(o.payment_method),
    amount: o.grand_total,
    currency: o.currency,
    status: statusFor(o.status),
    providerRef: o.payment_provider_id,
    when: o.created_at,
  }));

  const fromFailures: TxnRow[] = (failures as FailureJoin[] | null ?? []).map((f) => ({
    id: 'f_' + f.id,
    kind: 'failure',
    orderId: f.order_id,
    buyer: '—',
    method: f.provider,
    provider: f.provider[0].toUpperCase() + f.provider.slice(1),
    amount: f.amount ?? 0,
    currency: f.currency ?? 'USD',
    status: 'Failed',
    providerRef: f.provider_ref,
    when: f.created_at,
  }));

  return [...fromOrders, ...fromFailures].sort((a, b) => (a.when < b.when ? 1 : -1));
}
