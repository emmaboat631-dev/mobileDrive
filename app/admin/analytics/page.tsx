import { TrendingUp, TrendingDown, Download } from 'lucide-react';
import { formatPrice } from '@/lib/utils/format';
import { DemoBadge } from '@/components/ui';
import { fetchAnalyticsSnapshot } from '@/lib/admin/analytics';

export const metadata = { title: 'Analytics — Admin · mobileDrive' };
export const dynamic = 'force-dynamic';

const CHANNELS = [
  { name: 'Direct website',    value: 48, revenue: 892000 },
  { name: 'Dealer referral',   value: 22, revenue: 410000 },
  { name: 'Instagram',         value: 14, revenue: 262000 },
  { name: 'Email',             value: 9,  revenue: 168000 },
  { name: 'Other',             value: 7,  revenue: 128000 },
];

const TOP_VEHICLES = [
  { name: 'BMW M4 Competition',  units: 7, revenue: 576800 },
  { name: 'Porsche 911 Carrera', units: 5, revenue: 582000 },
  { name: 'Mercedes-AMG GT',     units: 4, revenue: 544000 },
  { name: 'Tesla Model S',       units: 4, revenue: 379960 },
  { name: 'Audi RS6 Avant',      units: 3, revenue: 384000 },
];

const FUNNEL = [
  { label: 'Marketplace visits',       value: 18420, pct: 100 },
  { label: 'Vehicle details',          value: 8740,  pct: 47.5 },
  { label: 'Entered configurator',     value: 3620,  pct: 19.7 },
  { label: 'Added to cart',            value: 924,   pct: 5.0 },
  { label: 'Started checkout',         value: 342,   pct: 1.9 },
  { label: 'Placed order',             value: 128,   pct: 0.7 },
];

export default async function AnalyticsPage() {
  const snapshot = await fetchAnalyticsSnapshot(30);
  const DAILY_REVENUE = snapshot.dailyRevenue.map((d) => Math.round(d.revenue / 1000));
  const total = snapshot.revenue;
  const avgDaily = Math.round(total / Math.max(DAILY_REVENUE.length, 1));
  const delta = 0;
  const REGIONS = snapshot.regionBreakdown.map((r) => ({ name: r.region, share: r.share, revenue: r.revenue }));

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="eyebrow">Analytics</div>
            <DemoBadge note="Needs an analytics processor like PostHog or Plausible." />
          </div>
          <h1 className="mt-2 font-display text-display-md font-semibold text-white">
            Platform performance
          </h1>
          <p className="mt-2 text-sm text-ink-200">
            Last 30 days · {formatPrice(total)} revenue · 128 orders
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-full border border-white/10 p-0.5">
            {['7d', '30d', '90d', '12m', 'All'].map((p, i) => (
              <button
                key={p}
                type="button"
                className={
                  'rounded-full px-3 py-1 text-xs font-medium ' +
                  (i === 1 ? 'bg-white text-ink-900' : 'text-ink-100 hover:text-white')
                }
              >
                {p}
              </button>
            ))}
          </div>
          <button type="button" className="btn-secondary">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </header>

      {/* KPI tiles with change */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiTile label="Revenue"       value={formatPrice(total)}             delta={+12.4} />
        <KpiTile label="Orders"        value="128"                             delta={+8.1} />
        <KpiTile label="Avg order"     value={formatPrice(Math.round(total / 128))} delta={+4.3} />
        <KpiTile label="Conversion"    value="0.70%"                           delta={-0.3} />
      </div>

      {/* Big revenue chart */}
      <section className="rounded-2xl border border-white/[0.06] bg-ink-800/60 p-6">
        <div className="flex items-end justify-between">
          <div>
            <div className="eyebrow">Revenue trend</div>
            <h2 className="mt-1 font-display text-xl font-semibold text-white">Last 30 days</h2>
            <p className="mt-1 text-xs text-ink-200">
              Daily average {formatPrice(Math.round(avgDaily))} · {delta.toFixed(1)}% vs previous 30 days
            </p>
          </div>
        </div>
        <RevenueTrendChart data={DAILY_REVENUE} />
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        {/* Conversion funnel */}
        <section className="rounded-2xl border border-white/[0.06] bg-ink-800/60 p-6">
          <div className="eyebrow">Funnel</div>
          <h2 className="mt-1 font-display text-xl font-semibold text-white">
            Marketplace → order
          </h2>
          <div className="mt-5 space-y-4">
            {FUNNEL.map((row, i) => {
              const prev = i > 0 ? FUNNEL[i - 1].value : row.value;
              const drop = i > 0 ? 100 - (row.value / prev) * 100 : 0;
              return (
                <div key={row.label}>
                  <div className="mb-1.5 flex items-baseline justify-between gap-4">
                    <div className="text-sm text-white">{row.label}</div>
                    <div className="shrink-0 text-right">
                      <span className="text-sm font-semibold text-white tabular-nums">
                        {row.value.toLocaleString()}
                      </span>
                      <span className="ml-2 text-[11px] text-ink-200 tabular-nums">
                        {row.pct}%
                      </span>
                    </div>
                  </div>
                  <div className="relative h-2 overflow-hidden rounded-full bg-white/[0.05]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-white/90 to-white/60"
                      style={{ width: `${row.pct}%` }}
                    />
                  </div>
                  {i > 0 && drop > 0 && (
                    <div className="mt-1 text-[11px] text-ink-300">
                      −{drop.toFixed(1)}% from above
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Channel breakdown */}
        <section className="rounded-2xl border border-white/[0.06] bg-ink-800/60 p-6">
          <div className="eyebrow">Attribution</div>
          <h2 className="mt-1 font-display text-xl font-semibold text-white">
            Where orders came from
          </h2>
          <ChannelDonut channels={CHANNELS} />
          <div className="mt-5 space-y-2.5 border-t border-white/[0.06] pt-5 text-sm">
            {CHANNELS.map((c, i) => (
              <div key={c.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: CHANNEL_COLORS[i] }}
                  />
                  <span className="text-ink-100">{c.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-white tabular-nums">
                    {c.value}%
                  </span>
                  <span className="ml-3 text-[11px] text-ink-200 tabular-nums">
                    {formatPrice(c.revenue)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top vehicles */}
        <section className="rounded-2xl border border-white/[0.06] bg-ink-800/60 p-6">
          <div className="eyebrow">Top sellers</div>
          <h2 className="mt-1 font-display text-xl font-semibold text-white">By revenue</h2>
          <div className="mt-5 space-y-3">
            {TOP_VEHICLES.map((v, i) => {
              const max = Math.max(...TOP_VEHICLES.map((t) => t.revenue));
              return (
                <div key={v.name}>
                  <div className="flex items-baseline justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="font-display text-sm font-semibold text-ink-300 tabular-nums w-5">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <div className="text-sm font-medium text-white">{v.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-white tabular-nums">
                        {formatPrice(v.revenue)}
                      </div>
                      <div className="text-[11px] text-ink-200 tabular-nums">
                        {v.units} units
                      </div>
                    </div>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
                    <div
                      className="h-full rounded-full bg-white/70"
                      style={{ width: `${(v.revenue / max) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Region breakdown */}
        <section className="rounded-2xl border border-white/[0.06] bg-ink-800/60 p-6">
          <div className="eyebrow">Geography</div>
          <h2 className="mt-1 font-display text-xl font-semibold text-white">By region</h2>
          <div className="stack-table mt-5 overflow-hidden rounded-xl border border-white/[0.04]">
            <table className="w-full text-sm">
              <thead className="bg-ink-700/40 text-left text-[11px] uppercase tracking-wider text-ink-300">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Region</th>
                  <th className="px-4 py-2.5 font-medium">Share</th>
                  <th className="px-4 py-2.5 font-medium text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {REGIONS.map((r) => (
                  <tr key={r.name}>
                    <td data-label="Region" className="px-4 py-3 text-white">{r.name}</td>
                    <td data-label="Share" className="px-4 py-3 text-ink-200">
                      <div className="flex items-center gap-2">
                        <div className="relative h-1.5 w-24 overflow-hidden rounded-full bg-white/[0.05]">
                          <div
                            className="h-full rounded-full bg-white/70"
                            style={{ width: `${r.share}%` }}
                          />
                        </div>
                        <span className="tabular-nums">{r.share}%</span>
                      </div>
                    </td>
                    <td data-label="Revenue" className="px-4 py-3 text-right font-medium text-white tabular-nums">
                      {formatPrice(r.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

function KpiTile({ label, value, delta }: { label: string; value: string; delta: number }) {
  const positive = delta >= 0;
  const Arrow = positive ? TrendingUp : TrendingDown;
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-ink-800/60 p-5">
      <div className="eyebrow">{label}</div>
      <div className="mt-2 font-display text-3xl font-semibold -tracking-[0.025em] text-white tabular-nums">
        {value}
      </div>
      <div
        className={
          'mt-1 inline-flex items-center gap-1 text-xs font-medium ' +
          (positive ? 'text-emerald-400' : 'text-red-300')
        }
      >
        <Arrow className="h-3 w-3" />
        {Math.abs(delta).toFixed(1)}% vs prev
      </div>
    </div>
  );
}

/**
 * Revenue trend — inline SVG, no library.
 * Area + stroke + endpoint; grid lines labeled in $k; x-axis labels every 5 days.
 */
function RevenueTrendChart({ data }: { data: number[] }) {
  const w = 1100;
  const h = 260;
  const padL = 48;
  const padR = 24;
  const padT = 16;
  const padB = 32;
  const max = Math.max(...data);
  const stepX = (w - padL - padR) / (data.length - 1);
  const pts = data.map(
    (v, i) => [padL + i * stepX, h - padB - (v / max) * (h - padT - padB)] as const,
  );
  const path = pts.map((p, i) => (i === 0 ? `M ${p[0]} ${p[1]}` : `L ${p[0]} ${p[1]}`)).join(' ');
  const area = `${path} L ${pts[pts.length - 1][0]} ${h - padB} L ${pts[0][0]} ${h - padB} Z`;

  const yTicks = [0, 0.25, 0.5, 0.75, 1];
  const xLabels = [1, 6, 11, 16, 21, 26, 30];

  return (
    <div className="mt-6 overflow-x-auto">
      <svg viewBox={`0 0 ${w} ${h}`} className="h-64 w-full min-w-[720px]" aria-label="Daily revenue">
        <defs>
          <linearGradient id="trend-area" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="white" stopOpacity="0.3" />
            <stop offset="1" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* grid + y labels */}
        {yTicks.map((f) => {
          const y = h - padB - f * (h - padT - padB);
          const value = Math.round(max * f);
          return (
            <g key={f}>
              <line x1={padL} x2={w - padR} y1={y} y2={y} stroke="rgba(255,255,255,0.06)" strokeDasharray="2 4" />
              <text x={padL - 8} y={y + 3} textAnchor="end" fontSize="10" fill="#5A6069">
                ${value}k
              </text>
            </g>
          );
        })}

        <path d={area} fill="url(#trend-area)" />
        <path d={path} fill="none" stroke="white" strokeWidth="2" strokeLinejoin="round" />

        {/* endpoint pulse */}
        {(() => {
          const last = pts[pts.length - 1];
          return (
            <>
              <circle cx={last[0]} cy={last[1]} r="12" fill="white" opacity="0.15" />
              <circle cx={last[0]} cy={last[1]} r="4.5" fill="white" />
            </>
          );
        })()}

        {/* x labels */}
        {xLabels.map((d) => {
          const i = d - 1;
          if (i >= data.length) return null;
          const x = padL + i * stepX;
          return (
            <text key={d} x={x} y={h - 10} textAnchor="middle" fontSize="10" fill="#5A6069">
              Day {d}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

const CHANNEL_COLORS = ['#FFFFFF', '#A5B8FF', '#F6A5A5', '#FFD584', '#5A6069'];

/**
 * Simple donut from stacked arc segments. Pure SVG, no library.
 */
function ChannelDonut({ channels }: { channels: Array<{ name: string; value: number }> }) {
  const r = 56;
  const stroke = 18;
  const circumference = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="mt-5 flex items-center justify-center">
      <svg viewBox="0 0 160 160" className="h-40 w-40 -rotate-90">
        <circle cx="80" cy="80" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={stroke} />
        {channels.map((c, i) => {
          const length = (c.value / 100) * circumference;
          const circle = (
            <circle
              key={c.name}
              cx="80"
              cy="80"
              r={r}
              fill="none"
              stroke={CHANNEL_COLORS[i]}
              strokeWidth={stroke}
              strokeDasharray={`${length} ${circumference - length}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
            />
          );
          offset += length;
          return circle;
        })}
      </svg>
    </div>
  );
}
