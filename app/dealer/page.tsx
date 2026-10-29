import Link from 'next/link';
import { ArrowRight, Plus, CalendarClock } from 'lucide-react';
import { formatPrice } from '@/lib/utils/format';
import { KpiRow, StatusBadge, DemoBadge } from '@/components/ui';

const UPCOMING = [
  { day: 7,  month: 'Oct', when: '09:30', buyer: 'Asiamah Joshua', vehicle: 'Porsche 911 Carrera',   confirmed: true },
  { day: 7,  month: 'Oct', when: '11:00', buyer: 'Nia Mensah',      vehicle: 'BMW M4 Competition',   confirmed: true },
  { day: 7,  month: 'Oct', when: '14:30', buyer: 'Kojo Boateng',    vehicle: 'Tesla Model S',        confirmed: false },
  { day: 8,  month: 'Oct', when: '10:00', buyer: 'Ama Owusu',       vehicle: 'Audi RS6 Avant',       confirmed: true },
  { day: 8,  month: 'Oct', when: '15:00', buyer: 'Yaw Ampah',       vehicle: 'Mercedes-AMG GT',      confirmed: true },
];

const SALES = [
  { day: 'Mon', value: 94 },
  { day: 'Tue', value: 72 },
  { day: 'Wed', value: 128 },
  { day: 'Thu', value: 156 },
  { day: 'Fri', value: 112 },
  { day: 'Sat', value: 198 },
  { day: 'Sun', value: 142 },
];

export default function DealerDashboardPage() {
  const salesTotalK = SALES.reduce((s, d) => s + d.value, 0);
  const max = Math.max(...SALES.map((d) => d.value));

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="eyebrow">Dealer dashboard</div>
            <DemoBadge note="KPIs + upcoming list are illustrative. /dealer/bookings is live." />
          </div>
          <h1 className="mt-2 font-display text-display-md font-semibold text-white">
            Good morning, Accra.
          </h1>
          <p className="mt-2 text-sm text-ink-200">
            {UPCOMING.length} test drives this week · {formatPrice(salesTotalK * 1000)} in sales
          </p>
        </div>
        <Link href="/dealer/inventory/new" className="btn-primary">
          <Plus className="h-4 w-4" />
          List vehicle
        </Link>
      </header>

      <KpiRow
        items={[
          { label: 'Inventory',       value: '24',                               hint: '4 reserved · 2 low stock' },
          { label: 'Test drives (7d)',value: '18',                               delta: '+6 vs last week',         deltaTone: 'good' },
          { label: 'Sales (7d)',      value: formatPrice(salesTotalK * 1000),    delta: '+9.1% vs last week',      deltaTone: 'good' },
          { label: 'Conversion',      value: '32', unit: '%',                    hint: 'Test drive → order' },
        ]}
      />

      {/* Sales chart + upcoming */}
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <section className="rounded-2xl border border-white/[0.06] bg-ink-800/60 p-6">
          <div className="flex items-end justify-between">
            <div>
              <div className="eyebrow">Sales</div>
              <h2 className="mt-1 font-display text-xl font-semibold text-white">Last 7 days (in thousands)</h2>
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
          <div className="mt-6 flex h-48 items-end gap-2">
            {SALES.map((d) => (
              <div key={d.day} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-md bg-gradient-to-t from-white/15 to-white/80 transition hover:from-white/20 hover:to-white"
                  style={{ height: `${(d.value / max) * 100}%` }}
                  title={`$${d.value}k`}
                />
                <div className="text-[11px] text-ink-300">{d.day}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-white/[0.06] bg-ink-800/60 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="eyebrow">Next up</div>
              <h2 className="mt-1 font-display text-xl font-semibold text-white">Test drives</h2>
            </div>
            <Link href="/dealer/bookings" className="inline-flex items-center gap-1 text-xs text-ink-100 hover:text-white">
              View all
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <ul className="mt-5 space-y-3">
            {UPCOMING.map((t) => (
              <li key={`${t.day}-${t.when}-${t.buyer}`} className="flex items-center gap-3 rounded-xl bg-ink-700/40 p-3">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-white text-ink-900">
                  <div className="text-center leading-none">
                    <div className="font-display text-lg font-semibold">{t.day}</div>
                    <div className="text-[8px] font-semibold uppercase tracking-wider">{t.month}</div>
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-white">{t.vehicle}</div>
                  <div className="text-[11px] text-ink-200">{t.buyer} · {t.when}</div>
                </div>
                <StatusBadge
                  tone={t.confirmed ? 'success' : 'warning'}
                  icon={<CalendarClock className="h-2.5 w-2.5" />}
                >
                  {t.confirmed ? 'Confirmed' : 'Pending'}
                </StatusBadge>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Messages / activity feed */}
      <section className="rounded-2xl border border-white/[0.06] bg-ink-800/60 p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="eyebrow">Activity</div>
            <h2 className="mt-1 font-display text-xl font-semibold text-white">Recent conversations</h2>
          </div>
          <Link href="/dealer/customers" className="inline-flex items-center gap-1 text-xs text-ink-100 hover:text-white">
            View all
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="mt-5 divide-y divide-white/[0.04]">
          {[
            { name: 'Asiamah Joshua', msg: 'Can I switch from Performance to Carbon Forged?', when: '12m' },
            { name: 'Nia Mensah',      msg: "I'll bring my son along to the test drive on Friday.", when: '1h' },
            { name: 'Yaw Ampah',       msg: "Any extra fleet discount if we order three X5s?", when: '3h' },
          ].map((m) => (
            <div key={m.name + m.when} className="flex items-center gap-4 py-3.5">
              <div
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-semibold text-white"
                style={{ background: 'linear-gradient(135deg, #A078FF, #FF78A0)' }}
              >
                {m.name.split(' ').map((p) => p[0]).join('').slice(0, 2)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <div className="truncate text-sm font-medium text-white">{m.name}</div>
                  <div className="text-[11px] text-ink-300">{m.when}</div>
                </div>
                <div className="truncate text-xs text-ink-200">{m.msg}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
