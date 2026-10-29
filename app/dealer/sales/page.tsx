import { ArrowUpRight, Download } from 'lucide-react';
import { formatPrice, relativeTime } from '@/lib/utils/format';
import { EmptyState, DemoBadge } from '@/components/ui';
import { fetchOrders } from '@/lib/admin/queries';
import { getCurrentUser } from '@/lib/auth/currentUser';

export const metadata = { title: 'Sales — Dealer · mobileDrive' };
export const dynamic = 'force-dynamic';

const DAILY = [
  { day: 'Mon', value: 94000 },
  { day: 'Tue', value: 72000 },
  { day: 'Wed', value: 128000 },
  { day: 'Thu', value: 156000 },
  { day: 'Fri', value: 112000 },
  { day: 'Sat', value: 198000 },
  { day: 'Sun', value: 142000 },
];

const dealStatusTone: Record<string, string> = {
  pending:    'bg-ink-400/15 text-ink-200 border-white/15',
  paid:       'bg-emerald-400/15 text-emerald-400 border-emerald-400/30',
  production: 'bg-amber-400/15 text-amber-300 border-amber-400/30',
  quality:    'bg-amber-400/15 text-amber-300 border-amber-400/30',
  shipping:   'bg-sky-400/15 text-sky-300 border-sky-400/30',
  delivered:  'bg-emerald-400/15 text-emerald-400 border-emerald-400/30',
  cancelled:  'bg-red-400/15 text-red-300 border-red-400/30',
};

export default async function DealerSalesPage() {
  const user = await getCurrentUser();
  // Admins see every order; a dealer-role user is filtered to their showroom.
  const dealerFilter = user?.role === 'dealer' ? user.dealerId ?? undefined : undefined;
  const SALES = await fetchOrders(50, dealerFilter);

  const total = SALES.reduce((s, r) => s + r.grand_total, 0);
  const deposits = Math.round(total * 0.1);
  const max = Math.max(...DAILY.map((d) => d.value));

  // Chart layout
  const w = 760;
  const h = 220;
  const padX = 32;
  const padY = 24;
  const stepX = (w - padX * 2) / (DAILY.length - 1);
  const points = DAILY.map(
    (d, i) => [padX + i * stepX, h - padY - ((d.value / max) * (h - padY * 2))] as const,
  );
  const path = points.map((p, i) => (i === 0 ? `M ${p[0]} ${p[1]}` : `L ${p[0]} ${p[1]}`)).join(' ');
  const areaPath = `${path} L ${padX + stepX * (DAILY.length - 1)} ${h - padY} L ${padX} ${h - padY} Z`;

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <div className="eyebrow">Sales</div>
          <h1 className="mt-2 font-display text-display-md font-semibold text-white">
            Closed deals
          </h1>
          <p className="mt-2 text-sm text-ink-200">
            {SALES.length} deals · {formatPrice(total)} booked · {formatPrice(deposits)} est. deposits
          </p>
        </div>
        <button type="button" className="btn-secondary">
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </header>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Kpi label="Revenue"           value={formatPrice(total)} />
        <Kpi label="Deposits received" value={formatPrice(deposits)} />
        <Kpi label="Average order"     value={formatPrice(SALES.length > 0 ? Math.round(total / SALES.length) : 0)} />
        <Kpi label="Conversion"        value="—" hint="Needs analytics wiring" />
      </div>

      {/* Trend chart — still synthetic until we aggregate orders by day */}
      <section className="rounded-2xl border border-white/[0.06] bg-ink-800/60 p-6">
        <div className="flex items-end justify-between">
          <div>
            <div className="eyebrow flex items-center gap-2">Trend <DemoBadge note="chart values are illustrative" /></div>
            <h2 className="mt-1 font-display text-xl font-semibold text-white">Daily revenue</h2>
          </div>
          <div className="flex rounded-full border border-white/10 p-0.5">
            {['7d', '30d', '90d'].map((p, i) => (
              <button
                key={p}
                type="button"
                className={
                  'rounded-full px-3 py-1 text-xs font-medium ' +
                  (i === 0 ? 'bg-white text-ink-900' : 'text-ink-100 hover:text-white')
                }
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-6 overflow-x-auto">
          <svg viewBox={`0 0 ${w} ${h}`} className="h-56 w-full min-w-[640px]">
            <defs>
              <linearGradient id="sales-area" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor="white" stopOpacity="0.28" />
                <stop offset="1" stopColor="white" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[0.25, 0.5, 0.75].map((f) => (
              <line
                key={f}
                x1={padX}
                x2={w - padX}
                y1={h - padY - (f * (h - padY * 2))}
                y2={h - padY - (f * (h - padY * 2))}
                stroke="rgba(255,255,255,0.06)"
                strokeDasharray="2 4"
              />
            ))}
            <path d={areaPath} fill="url(#sales-area)" />
            <path d={path} fill="none" stroke="white" strokeWidth="2" strokeLinejoin="round" />
            {points.map((p, i) => (
              <circle key={i} cx={p[0]} cy={p[1]} r={i === points.length - 1 ? 5 : 3} fill="white" />
            ))}
          </svg>
          <div className="mx-8 mt-2 flex justify-between text-[11px] text-ink-300">
            {DAILY.map((d) => (
              <span key={d.day}>{d.day}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Deals table */}
      <section className="overflow-hidden rounded-2xl border border-white/[0.06] bg-ink-800/60">
        <header className="flex items-center justify-between px-6 py-5">
          <div>
            <div className="eyebrow">Deals</div>
            <h2 className="mt-1 font-display text-xl font-semibold text-white">Closed in this period</h2>
          </div>
        </header>
        <div className="stack-table overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-y border-white/[0.06] text-left text-[11px] uppercase tracking-wider text-ink-300">
              <tr>
                <th className="px-6 py-3 font-medium">Order</th>
                <th className="px-6 py-3 font-medium">Closed</th>
                <th className="px-6 py-3 font-medium">Customer</th>
                <th className="px-6 py-3 font-medium">Vehicle</th>
                <th className="px-6 py-3 font-medium">Deposit</th>
                <th className="px-6 py-3 font-medium">Amount</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {SALES.length === 0 && (
                <tr><td colSpan={8} className="px-6 py-10 text-center text-sm text-ink-200">No closed deals at this showroom yet.</td></tr>
              )}
              {SALES.map((s) => (
                <tr key={s.id} className="hover:bg-white/[0.02]">
                  <td data-label="Order" className="px-6 py-3.5 font-medium text-white">{s.id.slice(0, 8).toUpperCase()}</td>
                  <td data-label="Closed" className="px-6 py-3.5 text-ink-200">{relativeTime(s.created_at)}</td>
                  <td data-label="Customer" className="px-6 py-3.5 text-ink-100">{s.buyer_name ?? s.buyer_email ?? '—'}</td>
                  <td data-label="Vehicle" className="px-6 py-3.5 text-ink-100">{s.items_summary || '—'}</td>
                  <td data-label="Deposit" className="px-6 py-3.5 text-ink-200 tabular-nums">
                    {formatPrice(Math.round(s.grand_total * 0.1))}
                  </td>
                  <td data-label="Amount" className="px-6 py-3.5 font-medium text-white tabular-nums">
                    {formatPrice(s.grand_total)}
                  </td>
                  <td data-label="Status" className="px-6 py-3.5">
                    <span className={'inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-medium ' + (dealStatusTone[s.status] ?? dealStatusTone.pending)}>
                      {s.status}
                    </span>
                  </td>
                  <td data-label="" className="px-6 py-3.5 text-right">
                    <a
                      href={`/admin/orders/${s.id}`}
                      className="inline-flex h-7 items-center gap-1 rounded-full border border-white/10 px-3 text-[11px] text-ink-100 hover:bg-white/5"
                    >
                      Open
                      <ArrowUpRight className="h-3 w-3" />
                    </a>
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

function Kpi({
  label, value, delta, hint, good,
}: {
  label: string;
  value: string;
  delta?: string;
  hint?: string;
  good?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-ink-800/60 p-5">
      <div className="eyebrow">{label}</div>
      <div className="mt-2 flex items-baseline gap-2">
        <div className="font-display text-2xl font-semibold -tracking-[0.025em] text-white tabular-nums">
          {value}
        </div>
        {delta && (
          <span className={'text-xs font-medium ' + (good ? 'text-emerald-400' : 'text-ink-200')}>
            {delta}
          </span>
        )}
      </div>
      {hint && <div className="mt-1 text-[11px] text-ink-200">{hint}</div>}
    </div>
  );
}
