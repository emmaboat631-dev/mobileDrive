import Link from 'next/link';
import { ArrowUpRight, Download, RefreshCcw, Search, CreditCard, Smartphone, Building2, Database } from 'lucide-react';
import { formatPrice, relativeTime } from '@/lib/utils/format';
import { KpiRow, StatusBadge, DataTable, Banner, DemoBadge, type DataTableColumn } from '@/components/ui';
import { fetchTransactions, type TxnRow } from '@/lib/admin/payments';

export const metadata = { title: 'Payments — Admin · mobileDrive' };
export const dynamic = 'force-dynamic';

const PAYOUTS = [
  { id: 'po_2026_1004', date: 'Oct 4, 2026',  bank: 'GCB · ••7612',   amount: 582400, status: 'Paid' },
  { id: 'po_2026_0927', date: 'Sep 27, 2026', bank: 'GCB · ••7612',   amount: 406700, status: 'Paid' },
  { id: 'po_2026_0920', date: 'Sep 20, 2026', bank: 'GCB · ••7612',   amount: 338100, status: 'Paid' },
  { id: 'po_2026_1011', date: 'Oct 11, 2026', bank: 'GCB · ••7612',   amount: 696200, status: 'In transit' },
];

function txnTone(s: TxnRow['status']) {
  if (s === 'Captured') return 'success' as const;
  if (s === 'Pending')  return 'warning' as const;
  if (s === 'Refunded') return 'info' as const;
  return 'danger' as const;
}

function methodIcon(provider: string) {
  if (provider === 'Stripe') return CreditCard;
  if (provider === 'Paystack') return Building2;
  return Smartphone;
}

export default async function AdminPaymentsPage() {
  const TXNS = await fetchTransactions(50);
  const captured = TXNS.filter((t) => t.status === 'Captured').reduce((s, t) => s + t.amount, 0);
  const pending = TXNS.filter((t) => t.status === 'Pending').reduce((s, t) => s + t.amount, 0);
  const refunded = TXNS.filter((t) => t.status === 'Refunded').reduce((s, t) => s + t.amount, 0);
  const feeRate = 0.024;
  const fees = Math.round(captured * feeRate);

  // Provider mix
  const providerTotals = TXNS.filter((t) => t.status === 'Captured').reduce<Record<string, number>>((acc, t) => {
    acc[t.provider] = (acc[t.provider] ?? 0) + t.amount;
    return acc;
  }, {});
  const providerRows = Object.entries(providerTotals).map(([name, amount]) => ({ name, amount }));
  const providerTotal = providerRows.reduce((s, r) => s + r.amount, 0);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="eyebrow">Payments</div>
          <h1 className="mt-2 font-display text-display-md font-semibold text-white">
            Transactions &amp; payouts
          </h1>
          <p className="mt-2 text-sm text-ink-200">
            {TXNS.length} transactions this period · {formatPrice(captured)} captured
          </p>
        </div>
        <button type="button" className="btn-secondary">
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </header>

      <KpiRow
        items={[
          { label: 'Captured',        value: formatPrice(captured),  delta: '+12.4%', deltaTone: 'good' },
          { label: 'Pending',         value: formatPrice(pending) },
          { label: 'Refunded',        value: formatPrice(refunded) },
          { label: 'Processing fees', value: formatPrice(fees), hint: `${(feeRate * 100).toFixed(1)}% weighted average` },
        ]}
      />

      {/* Provider mix */}
      <section className="rounded-2xl border border-white/[0.06] bg-ink-800/60 p-6">
        <div className="eyebrow">Provider mix</div>
        <h2 className="mt-1 font-display text-xl font-semibold text-white">
          Where money moves
        </h2>
        <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_1fr_1fr]">
          {providerRows
            .sort((a, b) => b.amount - a.amount)
            .map((p) => {
              const pct = (p.amount / providerTotal) * 100;
              return (
                <div
                  key={p.name}
                  className="rounded-xl border border-white/[0.06] bg-ink-700/40 p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-white">{p.name}</div>
                    <div className="text-xs text-ink-200 tabular-nums">{pct.toFixed(1)}%</div>
                  </div>
                  <div className="mt-2 font-display text-xl font-semibold text-white tabular-nums">
                    {formatPrice(p.amount)}
                  </div>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
                    <div className="h-full rounded-full bg-white/80" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
        </div>
      </section>

      {/* Transactions */}
      <section className="space-y-3">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="eyebrow">Transactions</div>
            <h2 className="mt-1 font-display text-xl font-semibold text-white">All payments</h2>
          </div>
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
            <input
              type="search"
              placeholder="Search by id, order or buyer…"
              className="h-10 w-full rounded-full border border-white/10 bg-ink-700 pl-11 pr-4 text-sm text-white placeholder:text-ink-300 focus:border-white/30 focus:outline-none"
            />
          </div>
        </header>

        <div className="flex flex-wrap gap-2">
          {['All', 'Captured', 'Pending', 'Refunded', 'Failed'].map((t, i) => (
            <button
              key={t}
              type="button"
              className={
                'rounded-full border px-3 py-1 text-[11px] font-medium transition ' +
                (i === 0
                  ? 'border-white bg-white text-ink-900'
                  : 'border-white/10 text-ink-100 hover:border-white/30')
              }
            >
              {t}
            </button>
          ))}
        </div>

        <DataTable<TxnRow>
          rows={TXNS}
          getKey={(t) => t.id}
          columns={txnColumns}
        />
      </section>

      {/* Payouts */}
      <section className="space-y-3">
        <header className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="eyebrow">Payouts</div>
              <DemoBadge note="Needs a payouts table + Paystack settlement reconciliation." />
            </div>
            <h2 className="mt-1 font-display text-xl font-semibold text-white">Weekly settlements</h2>
          </div>
          <button type="button" className="btn-secondary text-xs">
            Payout settings
          </button>
        </header>
        <DataTable<typeof PAYOUTS[number]>
          rows={PAYOUTS}
          getKey={(p) => p.id}
          columns={payoutColumns}
        />
      </section>
    </div>
  );
}

const txnColumns: DataTableColumn<TxnRow>[] = [
  { key: 'id',       header: 'Txn id',  render: (t) => <span className="font-mono text-[11px] text-ink-100">{t.providerRef ?? t.id.slice(0, 10)}</span> },
  { key: 'order',    header: 'Order',   render: (t) => t.orderId ? <Link href={`/admin/orders/${t.orderId}`} className="font-medium text-white hover:underline">{t.orderId.slice(0, 8).toUpperCase()}</Link> : <span className="text-ink-300">—</span> },
  { key: 'buyer',    header: 'Buyer',   render: (t) => t.buyer },
  {
    key: 'method',
    header: 'Method',
    render: (t) => {
      const MIcon = methodIcon(t.provider);
      return (
        <span className="inline-flex items-center gap-2">
          <MIcon className="h-3.5 w-3.5 text-ink-300" />
          <span className="capitalize">{t.method}</span>
        </span>
      );
    },
  },
  { key: 'amount',   header: 'Amount',  tabular: true, render: (t) => <span className="font-medium text-white">{formatPrice(t.amount)}</span> },
  { key: 'status',   header: 'Status',  render: (t) => <StatusBadge tone={txnTone(t.status)}>{t.status}</StatusBadge> },
  { key: 'when',     header: 'When',    render: (t) => <span className="text-ink-200">{relativeTime(t.when)}</span> },
  {
    key: 'actions',
    header: '',
    align: 'right',
    render: (t) => (
      <div className="inline-flex gap-1">
        {t.status === 'Captured' && (
          <button type="button" aria-label={`Refund ${t.id}`} className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/10 text-ink-100 hover:bg-white/5">
            <RefreshCcw className="h-3 w-3" />
          </button>
        )}
        <Link href={`/admin/payments/${encodeURIComponent(t.id)}`} aria-label={`Open ${t.id}`} className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/10 text-ink-100 hover:bg-white/5">
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>
    ),
  },
];

const payoutColumns: DataTableColumn<typeof PAYOUTS[number]>[] = [
  { key: 'id',     header: 'Payout id', render: (p) => <span className="font-mono text-[11px] text-ink-100">{p.id}</span> },
  { key: 'date',   header: 'Date',      render: (p) => <span className="text-ink-200">{p.date}</span> },
  { key: 'bank',   header: 'Bank',      render: (p) => p.bank },
  { key: 'amount', header: 'Amount',    tabular: true, render: (p) => <span className="font-medium text-white">{formatPrice(p.amount)}</span> },
  {
    key: 'status',
    header: 'Status',
    render: (p) => (
      <StatusBadge tone={p.status === 'Paid' ? 'success' : 'info'}>{p.status}</StatusBadge>
    ),
  },
  {
    key: 'actions',
    header: '',
    align: 'right',
    render: () => (
      <button type="button" className="inline-flex h-7 items-center gap-1 rounded-full border border-white/10 px-3 text-[11px] text-ink-100 hover:bg-white/5">
        Statement
        <ArrowUpRight className="h-3 w-3" />
      </button>
    ),
  },
];
