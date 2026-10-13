import { Plus, Send, Eye, MousePointerClick, BarChart3 } from 'lucide-react';
import { formatPrice } from '@/lib/utils/format';

export const metadata = { title: 'Marketing — Dealer · mobileDrive' };

interface Campaign {
  id: string;
  name: string;
  channel: 'Email' | 'SMS' | 'Instagram' | 'WhatsApp';
  status: 'Running' | 'Scheduled' | 'Ended' | 'Draft';
  audience: number;
  sent: number;
  opens: number;
  clicks: number;
  attributed: number;
  endsAt: string;
}

const CAMPAIGNS: Campaign[] = [
  { id: 'c_m4_year_end',    name: 'M4 year-end offer',       channel: 'Email',    status: 'Running',   audience: 1240, sent: 1240, opens: 612, clicks: 94, attributed: 174300, endsAt: 'Oct 31' },
  { id: 'c_porsche_launch', name: 'Porsche 911 launch',      channel: 'Instagram', status: 'Running',  audience: 18400, sent: 18400, opens: 11210, clicks: 428, attributed: 232800, endsAt: 'Oct 20' },
  { id: 'c_test_drive_sat', name: 'Test-drive Saturdays',    channel: 'SMS',      status: 'Running',   audience: 820, sent: 820, opens: 820, clicks: 182, attributed: 64200, endsAt: 'Nov 30' },
  { id: 'c_tesla_private',  name: 'Tesla private viewing',   channel: 'WhatsApp', status: 'Scheduled', audience: 180, sent: 0, opens: 0, clicks: 0, attributed: 0, endsAt: 'Starts Oct 14' },
  { id: 'c_rs6_dadsday',    name: 'RS6 Father\'s Day',       channel: 'Email',    status: 'Ended',     audience: 2140, sent: 2140, opens: 972, clicks: 156, attributed: 128000, endsAt: 'Ended Sep 15' },
];

const AUDIENCES = [
  { name: 'All customers',       size: 3920, growth: '+124' },
  { name: 'Deposit paid',        size: 42,   growth: '+6' },
  { name: 'Test drive, no order', size: 318, growth: '+22' },
  { name: 'Fleet buyers',        size: 48,   growth: '+2' },
  { name: 'Wishlist = BMW',      size: 184,  growth: '+9' },
  { name: 'Lost / inactive 30d', size: 76,   growth: '−14' },
];

const PROMOS = [
  { code: 'ACCRA10',   discount: '10% off trim upgrades', uses: 42, cap: 100,  ends: 'Oct 31' },
  { code: 'FLEET5X',   discount: '5× volume rebate',     uses: 6,  cap: 20,   ends: 'Dec 31' },
  { code: 'FIRSTBUYER', discount: '$2,000 off first order', uses: 118, cap: 500, ends: 'No limit' },
];

function statusColor(s: Campaign['status']) {
  switch (s) {
    case 'Running':   return 'bg-emerald-400/15 text-emerald-400 border-emerald-400/30';
    case 'Scheduled': return 'bg-sky-400/15 text-sky-300 border-sky-400/30';
    case 'Ended':     return 'bg-white/10 text-ink-100 border-white/15';
    case 'Draft':     return 'bg-amber-400/15 text-amber-300 border-amber-400/30';
  }
}

export default function DealerMarketingPage() {
  const totalAttributed = CAMPAIGNS.reduce((s, c) => s + c.attributed, 0);
  const openRate = CAMPAIGNS.reduce((s, c) => s + c.opens, 0) / CAMPAIGNS.reduce((s, c) => s + Math.max(c.sent, 1), 0) * 100;
  const clickRate = CAMPAIGNS.reduce((s, c) => s + c.clicks, 0) / CAMPAIGNS.reduce((s, c) => s + Math.max(c.sent, 1), 0) * 100;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="eyebrow">Marketing</div>
          <h1 className="mt-2 font-display text-display-md font-semibold text-white">
            Campaigns &amp; outreach
          </h1>
          <p className="mt-2 text-sm text-ink-200">
            {CAMPAIGNS.length} campaigns · {formatPrice(totalAttributed)} attributed revenue
          </p>
        </div>
        <button type="button" className="btn-primary">
          <Plus className="h-4 w-4" />
          New campaign
        </button>
      </header>

      {/* KPI row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Attributed revenue" value={formatPrice(totalAttributed)} tone="good" icon={BarChart3} />
        <Kpi label="Avg open rate"      value={`${openRate.toFixed(1)}%`} icon={Eye} />
        <Kpi label="Avg click-through"  value={`${clickRate.toFixed(1)}%`} icon={MousePointerClick} />
        <Kpi label="Messages this month" value={CAMPAIGNS.reduce((s, c) => s + c.sent, 0).toLocaleString()} icon={Send} />
      </div>

      {/* Campaigns table */}
      <section className="overflow-hidden rounded-2xl border border-white/[0.06] bg-ink-800/60">
        <header className="flex items-center justify-between px-6 py-5">
          <div>
            <div className="eyebrow">Campaigns</div>
            <h2 className="mt-1 font-display text-xl font-semibold text-white">All channels</h2>
          </div>
          <div className="flex gap-2">
            {['All', 'Running', 'Scheduled', 'Ended'].map((t, i) => (
              <button
                key={t}
                type="button"
                className={
                  'rounded-full border px-3 py-1 text-xs font-medium transition ' +
                  (i === 0 ? 'border-white bg-white text-ink-900' : 'border-white/10 text-ink-100 hover:border-white/30')
                }
              >
                {t}
              </button>
            ))}
          </div>
        </header>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-y border-white/[0.06] text-left text-[11px] uppercase tracking-wider text-ink-300">
              <tr>
                <th className="px-6 py-3 font-medium">Campaign</th>
                <th className="px-6 py-3 font-medium">Channel</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Audience</th>
                <th className="px-6 py-3 font-medium">Opens</th>
                <th className="px-6 py-3 font-medium">Clicks</th>
                <th className="px-6 py-3 font-medium">Attributed</th>
                <th className="px-6 py-3 font-medium">Ends</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {CAMPAIGNS.map((c) => {
                const openRateRow = c.sent > 0 ? (c.opens / c.sent) * 100 : 0;
                return (
                  <tr key={c.id} className="hover:bg-white/[0.02]">
                    <td className="px-6 py-3.5 font-medium text-white">{c.name}</td>
                    <td className="px-6 py-3.5 text-ink-100">{c.channel}</td>
                    <td className="px-6 py-3.5">
                      <span className={'inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-medium ' + statusColor(c.status)}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-ink-100 tabular-nums">
                      {c.audience.toLocaleString()}
                    </td>
                    <td className="px-6 py-3.5 text-ink-100 tabular-nums">
                      {c.sent > 0 ? `${c.opens.toLocaleString()} (${openRateRow.toFixed(0)}%)` : '—'}
                    </td>
                    <td className="px-6 py-3.5 text-ink-100 tabular-nums">
                      {c.sent > 0 ? c.clicks.toLocaleString() : '—'}
                    </td>
                    <td className="px-6 py-3.5 font-medium text-white tabular-nums">
                      {c.attributed > 0 ? formatPrice(c.attributed) : '—'}
                    </td>
                    <td className="px-6 py-3.5 text-ink-200">{c.endsAt}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Audiences + Promos */}
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-white/[0.06] bg-ink-800/60 p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <div className="eyebrow">Audiences</div>
              <h2 className="mt-1 font-display text-xl font-semibold text-white">Saved segments</h2>
            </div>
            <button type="button" className="btn-secondary text-xs">New segment</button>
          </div>
          <div className="space-y-2.5">
            {AUDIENCES.map((a) => {
              const shrinking = a.growth.startsWith('−');
              return (
                <div
                  key={a.name}
                  className="flex items-center justify-between rounded-xl bg-ink-700/40 px-4 py-3"
                >
                  <div>
                    <div className="text-sm font-medium text-white">{a.name}</div>
                    <div className="text-[11px] text-ink-200">
                      {a.size.toLocaleString()} people
                    </div>
                  </div>
                  <span
                    className={
                      'text-xs font-medium ' +
                      (shrinking ? 'text-red-300' : 'text-emerald-400')
                    }
                  >
                    {a.growth} / wk
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-white/[0.06] bg-ink-800/60 p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <div className="eyebrow">Promo codes</div>
              <h2 className="mt-1 font-display text-xl font-semibold text-white">Active discounts</h2>
            </div>
            <button type="button" className="btn-secondary text-xs">+ Create code</button>
          </div>
          <div className="space-y-2.5">
            {PROMOS.map((p) => {
              const pct = (p.uses / p.cap) * 100;
              return (
                <div
                  key={p.code}
                  className="rounded-xl bg-ink-700/40 px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <code className="rounded bg-ink-900/60 px-2 py-0.5 text-sm font-semibold text-white">
                        {p.code}
                      </code>
                      <div className="mt-1 text-[11px] text-ink-100">{p.discount}</div>
                    </div>
                    <div className="shrink-0 text-right text-[11px] text-ink-200">
                      <div>{p.uses}/{p.cap} used</div>
                      <div>{p.ends}</div>
                    </div>
                  </div>
                  <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-white/[0.05]">
                    <div
                      className="h-full rounded-full bg-white/80"
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

function Kpi({
  label, value, tone, icon: Icon,
}: {
  label: string;
  value: string;
  tone?: 'good';
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-ink-800/60 p-5">
      <div className="flex items-start justify-between">
        <div className="eyebrow">{label}</div>
        <Icon className="h-4 w-4 text-ink-300" />
      </div>
      <div
        className={
          'mt-2 font-display text-2xl font-semibold -tracking-[0.025em] tabular-nums ' +
          (tone === 'good' ? 'text-emerald-400' : 'text-white')
        }
      >
        {value}
      </div>
    </div>
  );
}
