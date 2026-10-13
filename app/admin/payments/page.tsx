import Link from 'next/link';
import { ArrowUpRight, Download, RefreshCcw, Search, CreditCard, Smartphone, Building2 } from 'lucide-react';
import { formatPrice } from '@/lib/utils/format';

export const metadata = { title: 'Payments — Admin · mobileDrive' };

interface Txn {
  id: string;
  orderId: string;
  buyer: string;
  method: 'Card' | 'MTN MoMo' | 'Telecel Cash' | 'AirtelTigo' | 'Paystack';
  provider: 'Stripe' | 'Paystack' | 'Mobile money';
  amount: number;
  status: 'Captured' | 'Pending' | 'Refunded' | 'Failed';
  when: string;
}

const TXNS: Txn[] = [
  { id: 'ch_3Phvy2EXAMPLE123', orderId: 'MD-2026-1038', buyer: 'Asiamah Joshua', method: 'Card',         provider: 'Stripe',        amount: 123700, status: 'Captured', when: '2h ago' },
  { id: 'tx_mtn_8842901',      orderId: 'MD-2026-1037', buyer: 'Nia Mensah',      method: 'MTN MoMo',     provider: 'Mobile money',  amount: 87700,  status: 'Captured', when: 'Yesterday' },
  { id: 'tx_pay_1920384',      orderId: 'MD-2026-1036', buyer: 'Kojo Boateng',    method: 'Paystack',     provider: 'Paystack',      amount: 108300, status: 'Captured', when: '2 days ago' },
  { id: 'ch_3Pfj4K778xyz',     orderId: 'MD-2026-1035', buyer: 'Ama Owusu',       method: 'Card',         provider: 'Stripe',        amount: 14150,  status: 'Pending',  when: '3 days ago' },
  { id: 'ch_3Pdd92Dkabcd',     orderId: 'MD-2026-1034', buyer: 'Yaw Ampah',       method: 'Card',         provider: 'Stripe',        amount: 142800, status: 'Captured', when: '4 days ago' },
  { id: 'tx_tel_7716603',      orderId: 'MD-2026-1033', buyer: 'Serwaa Appiah',   method: 'Telecel Cash', provider: 'Mobile money',  amount: 112400, status: 'Captured', when: '5 days ago' },
  { id: 'tx_pay_1927714',      orderId: 'MD-2026-1032', buyer: 'Kwesi Darko',     method: 'Paystack',     provider: 'Paystack',      amount: 94300,  status: 'Captured', when: '1 week ago' },
  { id: 'ch_3Pbb30refund2',    orderId: 'MD-2026-1031', buyer: 'Afia Kusi',       method: 'Card',         provider: 'Stripe',        amount: 128900, status: 'Refunded', when: '1 week ago' },
  { id: 'ch_3PaaFaild0',       orderId: 'MD-2026-1030', buyer: 'Mohammed Ali',    method: 'Card',         provider: 'Stripe',        amount: 83200,  status: 'Failed',   when: '9 days ago' },
];

const PAYOUTS = [
  { id: 'po_2026_1004', date: 'Oct 4, 2026',  bank: 'GCB · ••7612',   amount: 582400, status: 'Paid' },
  { id: 'po_2026_0927', date: 'Sep 27, 2026', bank: 'GCB · ••7612',   amount: 406700, status: 'Paid' },
  { id: 'po_2026_0920', date: 'Sep 20, 2026', bank: 'GCB · ••7612',   amount: 338100, status: 'Paid' },
  { id: 'po_2026_1011', date: 'Oct 11, 2026', bank: 'GCB · ••7612',   amount: 696200, status: 'In transit' },
];

function statusColor(s: Txn['status']) {
  switch (s) {
    case 'Captured': return 'bg-emerald-400/15 text-emerald-400 border-emerald-400/30';
    case 'Pending':  return 'bg-amber-400/15 text-amber-300 border-amber-400/30';
    case 'Refunded': return 'bg-sky-400/15 text-sky-300 border-sky-400/30';
    case 'Failed':   return 'bg-red-500/15 text-red-300 border-red-500/30';
  }
}

function methodIcon(m: Txn['method']) {
  if (m === 'Card') return CreditCard;
  if (m === 'Paystack') return Building2;
  return Smartphone;
}

export default function AdminPaymentsPage() {
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

      {/* KPI row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Captured"      value={formatPrice(captured)} tone="good" />
        <Kpi label="Pending"       value={formatPrice(pending)} />
        <Kpi label="Refunded"      value={formatPrice(refunded)} />
        <Kpi label="Processing fees"
             value={formatPrice(fees)}
             hint={`${(feeRate * 100).toFixed(1)}% weighted average`} />
      </div>

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

      {/* Transactions table */}
      <section className="overflow-hidden rounded-2xl border border-white/[0.06] bg-ink-800/60">
        <header className="flex flex-wrap items-center justify-between gap-3 px-6 py-5">
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

        {/* Status filter chips */}
        <div className="flex flex-wrap gap-2 border-y border-white/[0.06] px-6 py-3">
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

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-white/[0.06] text-left text-[11px] uppercase tracking-wider text-ink-300">
              <tr>
                <th className="px-6 py-3 font-medium">Txn id</th>
                <th className="px-6 py-3 font-medium">Order</th>
                <th className="px-6 py-3 font-medium">Buyer</th>
                <th className="px-6 py-3 font-medium">Method</th>
                <th className="px-6 py-3 font-medium">Amount</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">When</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {TXNS.map((t) => {
                const MIcon = methodIcon(t.method);
                return (
                  <tr key={t.id} className="hover:bg-white/[0.02]">
                    <td className="px-6 py-3.5 font-mono text-[11px] text-ink-100">{t.id}</td>
                    <td className="px-6 py-3.5">
                      <Link
                        href={`/admin/orders/${t.orderId}`}
                        className="font-medium text-white hover:underline"
                      >
                        {t.orderId}
                      </Link>
                    </td>
                    <td className="px-6 py-3.5 text-ink-100">{t.buyer}</td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2 text-ink-100">
                        <MIcon className="h-3.5 w-3.5 text-ink-300" />
                        {t.method}
                      </div>
                    </td>
                    <td className="px-6 py-3.5 font-medium text-white tabular-nums">
                      {formatPrice(t.amount)}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className={'inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-medium ' + statusColor(t.status)}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-ink-200">{t.when}</td>
                    <td className="px-6 py-3.5 text-right">
                      <div className="inline-flex gap-1">
                        {t.status === 'Captured' && (
                          <button
                            type="button"
                            aria-label={`Refund ${t.id}`}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/10 text-ink-100 hover:bg-white/5"
                          >
                            <RefreshCcw className="h-3 w-3" />
                          </button>
                        )}
                        <Link
                          href={`/admin/payments/${encodeURIComponent(t.id)}`}
                          aria-label={`Open ${t.id}`}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/10 text-ink-100 hover:bg-white/5"
                        >
                          <ArrowUpRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Payouts */}
      <section className="overflow-hidden rounded-2xl border border-white/[0.06] bg-ink-800/60">
        <header className="flex items-center justify-between px-6 py-5">
          <div>
            <div className="eyebrow">Payouts</div>
            <h2 className="mt-1 font-display text-xl font-semibold text-white">Weekly settlements</h2>
          </div>
          <button type="button" className="btn-secondary text-xs">
            Payout settings
          </button>
        </header>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-y border-white/[0.06] text-left text-[11px] uppercase tracking-wider text-ink-300">
              <tr>
                <th className="px-6 py-3 font-medium">Payout id</th>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Bank</th>
                <th className="px-6 py-3 font-medium">Amount</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {PAYOUTS.map((p) => (
                <tr key={p.id} className="hover:bg-white/[0.02]">
                  <td className="px-6 py-3.5 font-mono text-[11px] text-ink-100">{p.id}</td>
                  <td className="px-6 py-3.5 text-ink-200">{p.date}</td>
                  <td className="px-6 py-3.5 text-ink-100">{p.bank}</td>
                  <td className="px-6 py-3.5 font-medium text-white tabular-nums">
                    {formatPrice(p.amount)}
                  </td>
                  <td className="px-6 py-3.5">
                    <span
                      className={
                        'inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-medium ' +
                        (p.status === 'Paid'
                          ? 'border-emerald-400/30 bg-emerald-400/15 text-emerald-400'
                          : 'border-sky-400/30 bg-sky-400/15 text-sky-300')
                      }
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <button
                      type="button"
                      className="inline-flex h-7 items-center gap-1 rounded-full border border-white/10 px-3 text-[11px] text-ink-100 hover:bg-white/5"
                    >
                      Statement
                      <ArrowUpRight className="h-3 w-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Kpi({ label, value, hint, tone }: { label: string; value: string; hint?: string; tone?: 'good' }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-ink-800/60 p-5">
      <div className="eyebrow">{label}</div>
      <div
        className={
          'mt-2 font-display text-3xl font-semibold -tracking-[0.025em] tabular-nums ' +
          (tone === 'good' ? 'text-emerald-400' : 'text-white')
        }
      >
        {value}
      </div>
      {hint && <div className="mt-1 text-[11px] text-ink-200">{hint}</div>}
    </div>
  );
}
