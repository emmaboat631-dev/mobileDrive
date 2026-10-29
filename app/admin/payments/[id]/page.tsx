import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, CreditCard, ExternalLink, Shield } from 'lucide-react';
import { formatPrice, relativeTime } from '@/lib/utils/format';
import { StatusBadge, type StatusTone } from '@/components/ui';
import { getServerSupabase } from '@/lib/supabase/server';
import { RefundButton } from './RefundButton';

export const metadata = { title: 'Transaction — Admin · mobileDrive' };
export const dynamic = 'force-dynamic';

interface OrderTxn {
  kind: 'order';
  orderId: string;
  grand_total: number;
  currency: string;
  status: string;
  payment_method: string;
  payment_provider_id: string | null;
  created_at: string;
  updated_at: string;
  buyer_name: string | null;
  buyer_email: string | null;
}

interface FailureTxn {
  kind: 'failure';
  failureId: string;
  orderId: string | null;
  provider: string;
  provider_ref: string | null;
  amount: number;
  currency: string;
  code: string | null;
  message: string | null;
  created_at: string;
}

type Txn = OrderTxn | FailureTxn;

async function fetchTxn(id: string): Promise<Txn | null> {
  const supabase = getServerSupabase();
  if (!supabase) return null;
  const db = supabase as any;

  if (id.startsWith('o_')) {
    const orderId = id.slice(2);
    const { data } = await db
      .from('orders')
      .select('id, grand_total, currency, status, payment_method, payment_provider_id, created_at, updated_at, profiles!orders_user_id_fkey(email, full_name)')
      .eq('id', orderId)
      .maybeSingle();
    if (!data) return null;
    return {
      kind: 'order',
      orderId: data.id,
      grand_total: data.grand_total,
      currency: data.currency,
      status: data.status,
      payment_method: data.payment_method,
      payment_provider_id: data.payment_provider_id,
      created_at: data.created_at,
      updated_at: data.updated_at,
      buyer_name: data.profiles?.full_name ?? null,
      buyer_email: data.profiles?.email ?? null,
    };
  }

  if (id.startsWith('f_')) {
    const failureId = id.slice(2);
    const { data } = await db
      .from('payment_failures')
      .select('id, order_id, provider, provider_ref, amount, currency, code, message, created_at')
      .eq('id', failureId)
      .maybeSingle();
    if (!data) return null;
    return {
      kind: 'failure',
      failureId: data.id,
      orderId: data.order_id,
      provider: data.provider,
      provider_ref: data.provider_ref,
      amount: data.amount ?? 0,
      currency: data.currency ?? 'GHS',
      code: data.code,
      message: data.message,
      created_at: data.created_at,
    };
  }

  return null;
}

function statusLabelForOrder(s: string): { label: string; tone: StatusTone } {
  if (s === 'paid' || s === 'production' || s === 'quality' || s === 'shipping' || s === 'delivered') {
    return { label: 'Captured', tone: 'success' };
  }
  if (s === 'cancelled') return { label: 'Refunded', tone: 'info' };
  return { label: 'Pending', tone: 'warning' };
}

export default async function AdminPaymentDetailPage({ params }: { params: { id: string } }) {
  const txn = await fetchTxn(params.id);
  if (!txn) notFound();

  return (
    <div className="space-y-6">
      <Link href="/admin/payments" className="inline-flex items-center gap-1.5 text-xs text-ink-100 hover:text-white">
        <ArrowLeft className="h-3 w-3" />
        Payments
      </Link>

      {txn.kind === 'order' ? (
        <OrderTxnView txn={txn} />
      ) : (
        <FailureTxnView txn={txn} />
      )}
    </div>
  );
}

function OrderTxnView({ txn }: { txn: OrderTxn }) {
  const s = statusLabelForOrder(txn.status);
  const canRefund = txn.status === 'paid' || txn.status === 'production' || txn.status === 'quality' || txn.status === 'shipping';
  const paystackUrl = txn.payment_method === 'paystack' && txn.payment_provider_id
    ? `https://dashboard.paystack.com/#/transactions?query=${encodeURIComponent(txn.payment_provider_id)}`
    : null;

  return (
    <>
      <section className="rounded-3xl border border-white/[0.06] bg-ink-800/60 p-6">
        <div className="eyebrow">Transaction</div>
        <h1 className="mt-1 break-all font-display text-display-sm font-semibold text-white">
          {txn.payment_provider_id ?? ('o_' + txn.orderId.slice(0, 8))}
        </h1>
        <div className="mt-2 flex items-center gap-2 text-sm text-ink-200">
          <span className="capitalize">{txn.payment_method}</span>
          {txn.payment_provider_id && (
            <>
              <span className="h-1 w-1 rounded-full bg-ink-400" />
              <code className="font-mono text-xs">{txn.payment_provider_id}</code>
            </>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {paystackUrl && (
            <a href={paystackUrl} target="_blank" rel="noreferrer" className="btn-secondary">
              <ExternalLink className="h-4 w-4" />
              Open in Paystack
            </a>
          )}
          {canRefund && <RefundButton orderId={txn.orderId} />}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-4">
        <Stat label="Amount" value={formatPrice(txn.grand_total)} big />
        <Stat label="Status" valueNode={<StatusBadge tone={s.tone} dot>{s.label}</StatusBadge>} />
        <Stat label="Risk" valueNode={<span className="inline-flex items-center gap-1.5 text-emerald-300"><Shield className="h-3.5 w-3.5" />Low</span>} />
        <Stat
          label="Order"
          valueNode={
            <Link href={`/admin/orders/${txn.orderId}`} className="inline-flex items-center gap-1 font-medium text-white hover:underline">
              {txn.orderId.slice(0, 8).toUpperCase()}
              <ExternalLink className="h-3 w-3" />
            </Link>
          }
        />
      </div>

      <section className="rounded-2xl border border-white/[0.06] bg-ink-800/60 p-6">
        <h2 className="font-display text-lg font-semibold text-white">Buyer</h2>
        <div className="mt-3 text-sm text-ink-100">
          <div className="font-medium text-white">{txn.buyer_name ?? '—'}</div>
          {txn.buyer_email && (
            <a href={`mailto:${txn.buyer_email}`} className="text-xs text-ink-200 hover:text-white">
              {txn.buyer_email}
            </a>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-white/[0.06] bg-ink-800/60 p-6">
        <h2 className="font-display text-lg font-semibold text-white">Timeline</h2>
        <ol className="mt-5 space-y-5">
          <TimelineRow when={relativeTime(txn.created_at)} title="Order placed" body={`Buyer selected ${txn.payment_method} as payment method.`} />
          {(txn.status === 'paid' || txn.status === 'production' || txn.status === 'quality' || txn.status === 'shipping' || txn.status === 'delivered') && (
            <TimelineRow when={relativeTime(txn.updated_at)} title="Payment captured" body="Paystack confirmed the charge via webhook." tone="good" />
          )}
          {txn.status === 'cancelled' && (
            <TimelineRow when={relativeTime(txn.updated_at)} title="Refunded" body="Admin cancelled the order; Paystack refund API fired." tone="info" />
          )}
          {txn.status === 'pending' && (
            <TimelineRow when="…" title="Awaiting webhook" body="Paystack hasn't notified us this is paid yet. Check the Test Webhook URL in Paystack dashboard." tone="muted" />
          )}
        </ol>
      </section>
    </>
  );
}

function FailureTxnView({ txn }: { txn: FailureTxn }) {
  return (
    <>
      <section className="rounded-3xl border border-red-400/30 bg-red-500/10 p-6">
        <div className="eyebrow text-red-200">Failed transaction</div>
        <h1 className="mt-1 break-all font-display text-display-sm font-semibold text-white">
          {txn.provider_ref ?? ('f_' + txn.failureId.slice(0, 8))}
        </h1>
        <p className="mt-3 text-sm text-red-100">{txn.message ?? 'Payment failed.'}</p>
        {txn.code && <code className="mt-2 inline-block font-mono text-[11px] text-red-200">{txn.code}</code>}
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <Stat label="Amount" value={formatPrice(txn.amount)} big />
        <Stat label="Provider" value={txn.provider} />
        <Stat label="When" value={relativeTime(txn.created_at)} />
      </div>

      {txn.orderId && (
        <section className="rounded-2xl border border-white/[0.06] bg-ink-800/60 p-6">
          <h2 className="font-display text-lg font-semibold text-white">Linked order</h2>
          <Link href={`/admin/orders/${txn.orderId}`} className="mt-2 inline-flex items-center gap-1.5 text-sm text-ink-100 hover:text-white">
            {txn.orderId.slice(0, 8).toUpperCase()}
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </section>
      )}
    </>
  );
}

function Stat({ label, value, valueNode, big }: { label: string; value?: string; valueNode?: React.ReactNode; big?: boolean }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-ink-800/60 p-5">
      <div className="eyebrow">{label}</div>
      <div className={'mt-1 ' + (big ? 'font-display text-3xl font-semibold text-white tabular-nums' : 'text-sm text-white')}>
        {valueNode ?? value}
      </div>
    </div>
  );
}

function TimelineRow({ when, title, body, tone = 'default' }: { when: string; title: string; body: string; tone?: 'good' | 'info' | 'muted' | 'default' }) {
  const dot = tone === 'good' ? 'bg-emerald-400' : tone === 'info' ? 'bg-sky-400' : tone === 'muted' ? 'bg-ink-500' : 'bg-white';
  return (
    <li className="relative pl-7">
      <span className={'absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full ' + dot} />
      <div className="text-[11px] text-ink-300">{when}</div>
      <div className="mt-0.5 text-sm font-semibold text-white">{title}</div>
      <div className="mt-0.5 text-sm text-ink-100">{body}</div>
    </li>
  );
}
