import { ArrowUpRight, Download } from 'lucide-react';
import { formatPrice } from '@/lib/utils/format';

export const metadata = { title: 'Sales — Dealer · mobileDrive' };

const SALES = [
  { id: 'MD-2026-1038', closed: 'Oct 6', buyer: 'Asiamah Joshua', vehicle: 'Porsche 911 Carrera',  amount: 123700, deposit: 12370, status: 'Production' },
  { id: 'MD-2026-1037', closed: 'Oct 5', buyer: 'Nia Mensah',      vehicle: 'BMW M4 Competition',  amount: 87700,  deposit: 8770,  status: 'Shipping' },
  { id: 'MD-2026-1034', closed: 'Oct 4', buyer: 'Yaw Ampah',       vehicle: 'Mercedes-AMG GT',     amount: 142800, deposit: 14280, status: 'Production' },
  { id: 'MD-2026-1033', closed: 'Oct 3', buyer: 'Serwaa Appiah',   vehicle: 'Range Rover Sport',   amount: 112400, deposit: 11240, status: 'Shipping' },
  { id: 'MD-2026-1032', closed: 'Oct 1', buyer: 'Kwesi Darko',     vehicle: 'BMW M4 Competition',  amount: 94300,  deposit: 9430,  status: 'Delivered' },
  { id: 'MD-2026-1036', closed: 'Sep 30', buyer: 'Kojo Boateng',   vehicle: 'Tesla Model S',       amount: 108300, deposit: 10830, status: 'Delivered' },
];

const DAILY = [
  { day: 'Mon', value: 94000 },
  { day: 'Tue', value: 72000 },
  { day: 'Wed', value: 128000 },
  { day: 'Thu', value: 156000 },
  { day: 'Fri', value: 112000 },
  { day: 'Sat', value: 198000 },
  { day: 'Sun', value: 142000 },
];

const statusTone: Record<string, string> = {
  Production: 'bg-amber-400/15 text-amber-300 border-amber-400/30',
  Shipping:   'bg-sky-400/15 text-sky-300 border-sky-400/30',
  Delivered:  'bg-emerald-400/15 text-emerald-400 border-emerald-400/30',
};

export default function DealerSalesPage() {
  const total = SALES.reduce((s, r) => s + r.amount, 0);
  const deposits = SALES.reduce((s, r) => s + r.deposit, 0);
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
            {SALES.length} deals this period · {formatPrice(total)} booked · {formatPrice(deposits)} in deposits
          </p>
        </div>
        <button type="button" className="btn-secondary">
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </header>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Kpi label="Revenue (7d)"      value={formatPrice(total)} delta="+9.1%" good />
        <Kpi label="Deposits received" value={formatPrice(deposits)} />
        <Kpi label="Average order"     value={formatPrice(Math.round(total / SALES.length))} />
        <Kpi label="Conversion"        value="32%" hint="Test drive → order" />
      </div>

      {/* Trend chart */}
      <section className="rounded-2xl border border-white/[0.06] bg-ink-800/60 p-6">
        <div className="flex items-end justify-between">
          <div>
            <div className="eyebrow">Trend</div>
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
        <div className="overflow-x-auto">
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
              {SALES.map((s) => (
                <tr key={s.id} className="hover:bg-white/[0.02]">
                  <td className="px-6 py-3.5 font-medium text-white">{s.id}</td>
                  <td className="px-6 py-3.5 text-ink-200">{s.closed}</td>
                  <td className="px-6 py-3.5 text-ink-100">{s.buyer}</td>
                  <td className="px-6 py-3.5 text-ink-100">{s.vehicle}</td>
                  <td className="px-6 py-3.5 text-ink-200 tabular-nums">
                    {formatPrice(s.deposit)}
                  </td>
                  <td className="px-6 py-3.5 font-medium text-white tabular-nums">
                    {formatPrice(s.amount)}
                  </td>
                  <td className="px-6 py-3.5">
                    <span className={'inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-medium ' + statusTone[s.status]}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-right">
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
