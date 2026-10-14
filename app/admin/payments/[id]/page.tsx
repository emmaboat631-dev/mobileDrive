import Link from 'next/link';
import {
  ArrowLeft, CreditCard, Check, RefreshCcw, Download, AlertCircle,
  Copy, ExternalLink, Shield, Database,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils/format';
import { StatusBadge, statusTone, Banner } from '@/components/ui';

export const metadata = { title: 'Transaction — Admin · mobileDrive' };

/**
 * Mock transaction detail. In production, resolve by id from Supabase + whichever
 * provider owns the charge (Stripe / Paystack / Mobile money) and show their reference.
 */
const MOCK = {
  id: 'ch_3Phvy2EXAMPLE123',
  orderId: 'MD-2026-1038',
  buyer: { name: 'Asiamah Joshua', email: 'asiamah@mobiledrive.app' },
  amount: 123700,
  currency: 'USD' as const,
  fee: 2970,
  net: 120730,
  method: 'Card' as const,
  cardBrand: 'Visa',
  cardLast4: '4567',
  provider: 'Stripe',
  providerRef: 'pi_3Phvy2EXAMPLE123',
  providerUrl: 'https://dashboard.stripe.com/payments/pi_3Phvy2EXAMPLE123',
  status: 'Captured' as 'Captured' | 'Pending' | 'Refunded' | 'Failed',
  risk: 'Low' as 'Low' | 'Elevated' | 'High',
  authorized: '2026-10-06T09:12:03+00:00',
  captured:   '2026-10-06T09:12:08+00:00',
  settled:    '2026-10-11T00:00:00+00:00',
};

const EVENTS = [
  { when: 'Oct 6 · 09:12:03', title: 'Authorization requested',   type: 'auth',   body: 'Card verified via 3-D Secure (challenge not required).' },
  { when: 'Oct 6 · 09:12:08', title: 'Payment captured',          type: 'ok',     body: 'Captured in full — $123,700 USD.' },
  { when: 'Oct 6 · 09:12:08', title: 'Order confirmed',           type: 'ok',     body: `Order ${MOCK.orderId} moved to Production.` },
  { when: 'Oct 6 · 09:12:15', title: 'Email receipt sent',        type: 'info',   body: 'Receipt + VAT invoice emailed to buyer.' },
  { when: 'Oct 6 · 09:12:21', title: 'Dealer notified',           type: 'info',   body: 'mobileDrive Accra received production kick-off task.' },
  { when: 'Oct 11 (projected)', title: 'Payout settlement',       type: 'future', body: `Expected to post to GCB •••7612 as part of weekly batch.` },
];

function riskTone(r: typeof MOCK.risk) {
  switch (r) {
    case 'Low':      return 'text-emerald-400';
    case 'Elevated': return 'text-amber-300';
    case 'High':     return 'text-rose-300';
  }
}

function eventTone(t: string) {
  switch (t) {
    case 'ok':     return 'bg-emerald-400/15 text-emerald-400';
    case 'auth':   return 'bg-sky-400/15 text-sky-300';
    case 'info':   return 'bg-white/[0.06] text-ink-100';
    case 'future': return 'bg-ink-700 text-ink-300';
    default:       return 'bg-white/[0.06] text-ink-100';
  }
}

export default function TransactionDetailPage({ params }: { params: { id: string } }) {
  const txn = { ...MOCK, id: params.id || MOCK.id };

  return (
    <div className="space-y-6">
      <Link
        href="/admin/payments"
        className="inline-flex items-center gap-1.5 text-xs text-ink-100 hover:text-white"
      >
        <ArrowLeft className="h-3 w-3" />
        Payments
      </Link>

      <Banner tone="warning" icon={<Database className="h-4 w-4" />} title="Mock transaction">
        Payment adapters in <code className="text-white">lib/payments/providers.ts</code> are
        placeholders. No real card was charged. All timestamps, fees, and provider refs below
        are illustrative.
      </Banner>

      {/* Header card */}
      <section className="rounded-3xl border border-white/[0.06] bg-ink-800/60 p-6">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <div className="eyebrow">Transaction</div>
            <h1 className="mt-2 flex items-baseline gap-3 font-display">
              <span className="font-mono text-2xl font-semibold text-white md:text-3xl">
                {txn.id}
              </span>
              <button
                type="button"
                aria-label="Copy transaction id"
                className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/10 text-ink-100 hover:bg-white/5"
              >
                <Copy className="h-3 w-3" />
              </button>
            </h1>
            <p className="mt-2 text-sm text-ink-200">
              {txn.provider} · {txn.providerRef}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn-secondary">
              <Download className="h-4 w-4" />
              Download receipt
            </button>
            <a
              href={txn.providerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              <ExternalLink className="h-4 w-4" />
              Open in {txn.provider}
            </a>
            {txn.status === 'Captured' && (
              <button
                type="button"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-rose-400/30 bg-rose-500/5 px-6 text-sm font-medium text-rose-300 hover:bg-rose-500/15"
              >
                <RefreshCcw className="h-4 w-4" />
                Refund
              </button>
            )}
          </div>
        </div>

        {/* Amount + status strip */}
        <div className="mt-6 grid gap-4 border-t border-white/[0.06] pt-5 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <div className="eyebrow">Amount</div>
            <div className="mt-1 font-display text-4xl font-semibold -tracking-[0.025em] text-white tabular-nums">
              {formatPrice(txn.amount, txn.currency)}
            </div>
            <div className="mt-1 text-[11px] text-ink-200">
              Fees {formatPrice(txn.fee, txn.currency)} · Net {formatPrice(txn.net, txn.currency)}
            </div>
          </div>
          <StripItem label="Status">
            <StatusBadge tone={statusTone(txn.status)} icon={<Check className="h-3 w-3" />}>
              {txn.status}
            </StatusBadge>
          </StripItem>
          <StripItem label="Risk">
            <span className={'inline-flex items-center gap-1.5 text-sm font-semibold ' + riskTone(txn.risk)}>
              <Shield className="h-4 w-4" />
              {txn.risk}
            </span>
          </StripItem>
          <StripItem label="Order">
            <Link
              href={`/admin/orders/${txn.orderId}`}
              className="inline-flex items-center gap-1 text-sm font-medium text-white hover:underline"
            >
              {txn.orderId}
              <ExternalLink className="h-3 w-3" />
            </Link>
          </StripItem>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          {/* Timeline */}
          <section className="rounded-2xl border border-white/[0.06] bg-ink-800/60 p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-white">Lifecycle</h2>
              <span className="text-xs text-ink-200">
                Authorized to captured in {msBetween(txn.authorized, txn.captured)}
              </span>
            </div>
            <ol className="mt-5 space-y-5">
              {EVENTS.map((e, i) => (
                <li key={e.title + e.when} className="relative pl-9">
                  <span
                    className={
                      'absolute left-0 top-1 grid h-6 w-6 place-items-center rounded-full text-[10px] font-semibold ' +
                      eventTone(e.type)
                    }
                  >
                    {e.type === 'ok' ? '✓' : e.type === 'future' ? '◷' : i + 1}
                  </span>
                  {i < EVENTS.length - 1 && (
                    <span className="absolute left-[11px] top-8 h-full w-px bg-white/[0.08]" />
                  )}
                  <div className="text-[11px] text-ink-300">{e.when}</div>
                  <div className="mt-0.5 text-sm font-semibold text-white">{e.title}</div>
                  <div className="mt-0.5 text-sm text-ink-100">{e.body}</div>
                </li>
              ))}
            </ol>
          </section>

          {/* Related tx */}
          <section className="overflow-hidden rounded-2xl border border-white/[0.06] bg-ink-800/60">
            <header className="px-5 py-4">
              <h2 className="font-display text-sm font-semibold text-white">
                Related transactions
                <span className="ml-2 text-xs font-normal text-ink-300">on this order</span>
              </h2>
            </header>
            <div className="border-t border-white/[0.06] divide-y divide-white/[0.04]">
              <div className="flex items-center justify-between px-5 py-3.5 text-sm">
                <div>
                  <div className="font-mono text-xs text-ink-100">{txn.id}</div>
                  <div className="mt-0.5 text-[11px] text-ink-300">Captured · This transaction</div>
                </div>
                <div className="text-right font-medium text-white tabular-nums">
                  {formatPrice(txn.amount, txn.currency)}
                </div>
              </div>
              <div className="px-5 py-3.5 text-xs text-ink-300">
                No prior holds, deposits or refunds recorded.
              </div>
            </div>
          </section>
        </div>

        {/* Right rail */}
        <aside className="space-y-6">
          <section className="rounded-2xl border border-white/[0.06] bg-ink-800/60 p-6">
            <h2 className="font-display text-base font-semibold text-white">Payment method</h2>
            <div className="mt-4 flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-lg bg-white/[0.06]">
                <CreditCard className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">
                  {txn.cardBrand} ·••• {txn.cardLast4}
                </div>
                <div className="text-[11px] text-ink-200">{txn.method} · {txn.provider}</div>
              </div>
            </div>
            <div className="mt-5 grid gap-3 text-sm">
              <KV k="Provider ref" v={txn.providerRef} mono />
              <KV k="Authorized"   v={new Date(txn.authorized).toLocaleString()} />
              <KV k="Captured"     v={new Date(txn.captured).toLocaleString()} />
              <KV k="Settlement"   v={new Date(txn.settled).toLocaleDateString()} />
            </div>
          </section>

          <section className="rounded-2xl border border-white/[0.06] bg-ink-800/60 p-6">
            <h2 className="font-display text-base font-semibold text-white">Buyer</h2>
            <div className="mt-4 flex items-center gap-3">
              <div
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-xs font-semibold text-white"
                style={{ background: 'linear-gradient(135deg, #A078FF, #FF78A0)' }}
              >
                {txn.buyer.name.split(' ').map((p) => p[0]).join('').slice(0, 2)}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-white">{txn.buyer.name}</div>
                <div className="truncate text-[11px] text-ink-200">{txn.buyer.email}</div>
              </div>
            </div>
            <Link
              href={`/admin/customers/${encodeURIComponent(txn.buyer.email)}`}
              className="btn-secondary mt-4 w-full text-xs"
            >
              Open customer profile
            </Link>
          </section>

          {/* Dispute flag */}
          <section className="rounded-2xl border border-white/[0.06] bg-ink-800/60 p-6">
            <h2 className="font-display text-base font-semibold text-white">Disputes</h2>
            <div className="mt-4 flex items-start gap-3 rounded-xl bg-ink-700/40 p-4">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-ink-300" />
              <div>
                <div className="text-sm font-medium text-white">No disputes filed</div>
                <div className="mt-1 text-xs text-ink-200">
                  You'll be notified here if the buyer or card issuer raises a chargeback.
                </div>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function StripItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="eyebrow">{label}</div>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function KV({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-ink-200">{k}</dt>
      <dd
        className={
          'min-w-0 truncate text-right font-medium text-white ' +
          (mono ? 'font-mono text-xs' : '')
        }
      >
        {v}
      </dd>
    </div>
  );
}

function msBetween(a: string, b: string) {
  const diff = Math.abs(new Date(b).getTime() - new Date(a).getTime()) / 1000;
  if (diff < 60) return `${diff.toFixed(1)}s`;
  if (diff < 3600) return `${(diff / 60).toFixed(1)} min`;
  return `${(diff / 3600).toFixed(1)}h`;
}
