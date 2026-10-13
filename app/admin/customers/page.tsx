import Link from 'next/link';
import { ArrowUpRight, Search, UserPlus, Mail } from 'lucide-react';
import { formatPrice } from '@/lib/utils/format';

export const metadata = { title: 'Customers — Admin · mobileDrive' };

const CUSTOMERS = [
  { name: 'Asiamah Joshua',   email: 'asiamah@mobiledrive.app', region: 'GH', orders: 1, spent: 123700, since: '2025-11-02', status: 'Active', tier: 'Premium' },
  { name: 'Nia Mensah',       email: 'nia@acme.co',             region: 'GH', orders: 3, spent: 287400, since: '2024-07-14', status: 'Active', tier: 'Premium' },
  { name: 'Kojo Boateng',     email: 'kojo.b@workmail.com',     region: 'GH', orders: 2, spent: 203100, since: '2025-03-20', status: 'Active', tier: 'Standard' },
  { name: 'Ama Owusu',        email: 'ama.o@studio.gh',         region: 'GH', orders: 1, spent: 141500, since: '2026-01-05', status: 'Pending', tier: 'Standard' },
  { name: 'Yaw Ampah',        email: 'y.ampah@fleet.com',       region: 'GH', orders: 5, spent: 622000, since: '2023-09-11', status: 'Active', tier: 'Fleet' },
  { name: 'Serwaa Appiah',    email: 's.appiah@fx.com',         region: 'GH', orders: 1, spent: 112400, since: '2026-02-18', status: 'Active', tier: 'Standard' },
  { name: 'Afia Kusi',        email: 'afia.kusi@ventures.co',   region: 'GH', orders: 0, spent: 0,      since: '2026-10-01', status: 'Lead',   tier: 'Prospect' },
  { name: 'Rafael Mendes',    email: 'rafael.m@imports.pt',     region: 'EU', orders: 1, spent: 142800, since: '2025-12-02', status: 'Active', tier: 'Standard' },
];

function tierColor(t: string) {
  switch (t) {
    case 'Premium':  return 'bg-amber-400/15 text-amber-300 border-amber-400/30';
    case 'Fleet':    return 'bg-sky-400/15 text-sky-300 border-sky-400/30';
    case 'Standard': return 'bg-white/10 text-ink-100 border-white/15';
    case 'Prospect': return 'bg-ink-700 text-ink-300 border-white/10';
    default:         return 'bg-white/10 text-ink-100 border-white/15';
  }
}
function statusColor(s: string) {
  switch (s) {
    case 'Active':  return 'text-emerald-400';
    case 'Pending': return 'text-amber-400';
    case 'Lead':    return 'text-ink-200';
    default:        return 'text-ink-200';
  }
}

export default function AdminCustomersPage() {
  const total = CUSTOMERS.reduce((s, c) => s + c.spent, 0);

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <div className="eyebrow">Customers</div>
          <h1 className="mt-2 font-display text-display-md font-semibold text-white">
            People buying with mobileDrive
          </h1>
          <p className="mt-2 text-sm text-ink-200">
            {CUSTOMERS.length} profiles · {formatPrice(total)} lifetime value
          </p>
        </div>
        <button type="button" className="btn-primary">
          <UserPlus className="h-4 w-4" />
          Invite
        </button>
      </header>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {['All', 'Premium', 'Standard', 'Fleet', 'Prospects'].map((t, i) => (
          <button
            key={t}
            type="button"
            className={
              'rounded-full border px-3.5 py-1.5 text-xs font-medium transition ' +
              (i === 0 ? 'border-white bg-white text-ink-900' : 'border-white/10 text-ink-100 hover:border-white/30')
            }
          >
            {t}
          </button>
        ))}
        <div className="relative ml-auto w-full max-w-sm">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
          <input
            type="search"
            placeholder="Search by name or email…"
            className="h-10 w-full rounded-full border border-white/10 bg-ink-700 pl-11 pr-4 text-sm text-white placeholder:text-ink-300 focus:border-white/30 focus:outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <section className="overflow-hidden rounded-2xl border border-white/[0.06] bg-ink-800/60">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-white/[0.06] text-left text-[11px] uppercase tracking-wider text-ink-300">
              <tr>
                <th className="px-6 py-3 font-medium">Customer</th>
                <th className="px-6 py-3 font-medium">Tier</th>
                <th className="px-6 py-3 font-medium">Orders</th>
                <th className="px-6 py-3 font-medium">Spent</th>
                <th className="px-6 py-3 font-medium">Region</th>
                <th className="px-6 py-3 font-medium">Since</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {CUSTOMERS.map((c) => (
                <tr key={c.email} className="hover:bg-white/[0.02]">
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-semibold text-white"
                        style={{ background: 'linear-gradient(135deg, #A078FF, #FF78A0)' }}
                      >
                        {c.name.split(' ').map((p) => p[0]).join('').slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate font-medium text-white">{c.name}</div>
                        <div className="truncate text-[11px] text-ink-200">{c.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className={'inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-medium ' + tierColor(c.tier)}>
                      {c.tier}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-ink-100 tabular-nums">{c.orders}</td>
                  <td className="px-6 py-3.5 font-medium text-white tabular-nums">
                    {c.spent > 0 ? formatPrice(c.spent) : '—'}
                  </td>
                  <td className="px-6 py-3.5 text-ink-100">{c.region}</td>
                  <td className="px-6 py-3.5 text-ink-200 tabular-nums">{c.since}</td>
                  <td className="px-6 py-3.5">
                    <span className={'inline-flex items-center gap-1.5 text-xs font-medium ' + statusColor(c.status)}>
                      <span className={'h-1.5 w-1.5 rounded-full ' + (c.status === 'Active' ? 'bg-emerald-400' : c.status === 'Pending' ? 'bg-amber-400' : 'bg-ink-300')} />
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <div className="inline-flex gap-1">
                      <button
                        type="button"
                        aria-label={`Email ${c.name}`}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/10 text-ink-100 hover:bg-white/5"
                      >
                        <Mail className="h-3 w-3" />
                      </button>
                      <Link
                        href={`/admin/customers/${encodeURIComponent(c.email)}`}
                        aria-label={`Open ${c.name}`}
                        className="inline-flex h-7 items-center gap-1 rounded-full border border-white/10 px-3 text-[11px] text-ink-100 hover:bg-white/5"
                      >
                        Open
                        <ArrowUpRight className="h-3 w-3" />
                      </Link>
                    </div>
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
