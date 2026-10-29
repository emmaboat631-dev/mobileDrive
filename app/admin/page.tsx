import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { getHeroColor } from '@/lib/vehicles/data';
import { fetchVehicles, fetchOrders } from '@/lib/admin/queries';
import { formatPrice, relativeTime } from '@/lib/utils/format';
import { KpiRow, StatusBadge, statusTone, EmptyState } from '@/components/ui';

export const dynamic = 'force-dynamic';

export default async function AdminOverviewPage() {
  const [allVehicles, RECENT_ORDERS] = await Promise.all([fetchVehicles(), fetchOrders(5)]);
  const vehicles = allVehicles.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex items-end justify-between">
        <div>
          <div className="eyebrow">Admin overview</div>
          <h1 className="mt-2 font-display text-display-md font-semibold text-white">
            This week at mobileDrive.
          </h1>
        </div>
        <Link href="/admin/vehicles/new" className="btn-primary">
          + Add vehicle
        </Link>
      </div>

      <KpiRow
        items={[
          { label: 'Revenue (7d)',       value: '$1.86M', delta: '+12.4%', deltaTone: 'good' },
          { label: 'Orders (7d)',        value: '18',     delta: '+3',     deltaTone: 'good' },
          { label: 'Active customers',   value: '412',    delta: '+22',    deltaTone: 'good' },
          { label: 'Inventory listings', value: '124',    delta: '+6',     deltaTone: 'good' },
        ]}
      />

      {/* Chart stub + recent orders */}
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <section className="rounded-2xl border border-white/[0.06] bg-ink-800/60 p-6">
          <div className="flex items-end justify-between">
            <div>
              <div className="eyebrow">Revenue</div>
              <h2 className="mt-1 font-display text-xl font-semibold text-white">Last 7 days</h2>
            </div>
            <div className="flex rounded-full border border-white/10 p-0.5">
              {['7d', '30d', '90d', 'All'].map((p) => (
                <button
                  key={p}
                  type="button"
                  className={
                    'rounded-full px-3 py-1 text-xs font-medium ' +
                    (p === '7d' ? 'bg-white text-ink-900' : 'text-ink-100 hover:text-white')
                  }
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <RevenueSpark />
        </section>

        <section className="rounded-2xl border border-white/[0.06] bg-ink-800/60 p-6">
          <div className="eyebrow">Attention</div>
          <h2 className="mt-1 font-display text-xl font-semibold text-white">Needs review</h2>
          <ul className="mt-5 space-y-3 text-sm">
            {[
              ['3 orders', 'awaiting payment confirmation', '/admin/orders?status=pending'],
              ['2 vehicles', 'low stock', '/admin/vehicles?filter=low'],
              ['1 dealer', 'awaiting approval', '/admin/customers?role=dealer'],
              ['12 test drives', 'this week', '/admin/orders?type=test-drive'],
            ].map(([label, hint, href]) => (
              <li key={label as string} className="flex items-center justify-between rounded-xl bg-ink-700/40 px-4 py-3">
                <div>
                  <div className="font-medium text-white">{label}</div>
                  <div className="text-xs text-ink-200">{hint}</div>
                </div>
                <Link
                  href={href as string}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-ink-100 hover:bg-white/5"
                  aria-label={`Open ${label}`}
                >
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Recent orders table */}
      <section className="rounded-2xl border border-white/[0.06] bg-ink-800/60">
        <header className="flex items-center justify-between px-6 py-5">
          <div>
            <div className="eyebrow">Orders</div>
            <h2 className="mt-1 font-display text-xl font-semibold text-white">Recent orders</h2>
          </div>
          <Link href="/admin/orders" className="inline-flex items-center gap-1.5 text-sm text-ink-100 hover:text-white">
            View all
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </header>
        <div className="stack-table overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-y border-white/[0.06] text-left text-[11px] uppercase tracking-wider text-ink-300">
              <tr>
                <th className="px-6 py-3 font-medium">Order</th>
                <th className="px-6 py-3 font-medium">Customer</th>
                <th className="px-6 py-3 font-medium">Vehicle</th>
                <th className="px-6 py-3 font-medium">Amount</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">When</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {RECENT_ORDERS.length === 0 && (
                <tr><td colSpan={7} className="px-6 py-10 text-center text-sm text-ink-200">No orders yet — this fills in once a customer completes checkout.</td></tr>
              )}
              {RECENT_ORDERS.map((o) => (
                <tr key={o.id} className="hover:bg-white/[0.02]">
                  <td data-label="Order" className="px-6 py-3.5 font-medium text-white">{o.id.slice(0, 8)}</td>
                  <td data-label="Customer" className="px-6 py-3.5 text-ink-100">{o.buyer_name ?? o.buyer_email ?? '—'}</td>
                  <td data-label="Vehicle" className="px-6 py-3.5 text-ink-100">{o.items_summary || '—'}</td>
                  <td data-label="Amount" className="px-6 py-3.5 font-medium text-white tabular-nums">
                    {formatPrice(o.grand_total)}
                  </td>
                  <td data-label="Status" className="px-6 py-3.5">
                    <StatusBadge tone={statusTone(o.status)}>{o.status}</StatusBadge>
                  </td>
                  <td data-label="When" className="px-6 py-3.5 text-ink-200">{relativeTime(o.created_at)}</td>
                  <td data-label="" className="px-6 py-3.5 text-right">
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="inline-flex h-7 items-center gap-1 rounded-full border border-white/10 px-3 text-[11px] text-ink-100 hover:bg-white/5"
                    >
                      Open
                      <ArrowUpRight className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Inventory snapshot */}
      <section className="rounded-2xl border border-white/[0.06] bg-ink-800/60">
        <header className="flex items-center justify-between px-6 py-5">
          <div>
            <div className="eyebrow">Inventory</div>
            <h2 className="mt-1 font-display text-xl font-semibold text-white">Catalog snapshot</h2>
          </div>
          <Link href="/admin/vehicles" className="inline-flex items-center gap-1.5 text-sm text-ink-100 hover:text-white">
            Manage inventory
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </header>
        <div className="grid grid-cols-2 gap-4 border-t border-white/[0.06] p-6 md:grid-cols-3 lg:grid-cols-5">
          {vehicles.map((v) => {
            const color = getHeroColor(v);
            return (
              <Link
                key={v.id}
                href={`/admin/vehicles/${v.id}`}
                className="group overflow-hidden rounded-xl border border-white/[0.06] bg-ink-700/40 transition hover:border-white/20"
              >
                <div
                  className="aspect-[16/10]"
                  style={{
                    background: `radial-gradient(60% 60% at 50% 50%, ${color.hex}cc, #0A0B0E 85%)`,
                  }}
                >
                  <svg viewBox="0 0 200 128" className="h-full w-full" aria-hidden>
                    <path
                      d="M30,90 L50,65 Q80,50 100,49 Q120,50 150,65 L170,90 Q168,100 158,101 L152,101 Q149,94 142,94 Q135,94 133,101 L67,101 Q65,94 58,94 Q51,94 48,101 L42,101 Q32,100 30,90 Z"
                      fill={color.hex}
                    />
                    <circle cx="58" cy="98" r="9" fill="#0A0B0E" stroke="#2A2D33" />
                    <circle cx="142" cy="98" r="9" fill="#0A0B0E" stroke="#2A2D33" />
                  </svg>
                </div>
                <div className="p-3">
                  <div className="text-[10px] uppercase tracking-wider text-ink-300">
                    {v.brand}
                  </div>
                  <div className="truncate text-sm font-medium text-white">{v.model}</div>
                  <div className="mt-1 flex items-center justify-between text-[11px] text-ink-200">
                    <span>{formatPrice(v.price, v.currency)}</span>
                    <span className="text-emerald-400">In stock</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

/**
 * Lightweight inline SVG sparkline — one path, grid, and endpoint marker.
 * No chart library needed for a 7-day summary.
 */
function RevenueSpark() {
  const data = [220, 180, 265, 310, 195, 360, 410];
  const max = Math.max(...data);
  const w = 640;
  const h = 180;
  const padX = 24;
  const padY = 16;
  const stepX = (w - padX * 2) / (data.length - 1);
  const points = data.map((v, i) => [padX + i * stepX, h - padY - ((v / max) * (h - padY * 2))] as const);
  const path = points.map((p, i) => (i === 0 ? `M ${p[0]} ${p[1]}` : `L ${p[0]} ${p[1]}`)).join(' ');
  const areaPath = `${path} L ${padX + stepX * (data.length - 1)} ${h - padY} L ${padX} ${h - padY} Z`;

  return (
    <div className="mt-5">
      <svg viewBox={`0 0 ${w} ${h}`} className="h-48 w-full" aria-label="Weekly revenue">
        <defs>
          <linearGradient id="rev-area" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="white" stopOpacity="0.25" />
            <stop offset="1" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* grid */}
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
        <path d={areaPath} fill="url(#rev-area)" />
        <path d={path} fill="none" stroke="white" strokeWidth="2" strokeLinejoin="round" />
        {/* endpoint */}
        {(() => {
          const last = points[points.length - 1];
          return (
            <>
              <circle cx={last[0]} cy={last[1]} r="5" fill="white" />
              <circle cx={last[0]} cy={last[1]} r="10" fill="white" opacity="0.15" />
            </>
          );
        })()}
      </svg>
      <div className="mt-2 flex justify-between text-[11px] text-ink-300">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
    </div>
  );
}
