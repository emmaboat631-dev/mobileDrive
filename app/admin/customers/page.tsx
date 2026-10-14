import Link from 'next/link';
import { ArrowUpRight, Search, UserPlus, Mail } from 'lucide-react';
import { formatPrice } from '@/lib/utils/format';
import { DataTable, StatusBadge, statusTone, type DataTableColumn, type StatusTone } from '@/components/ui';

export const metadata = { title: 'Customers — Admin · mobileDrive' };

interface Customer {
  name: string;
  email: string;
  region: string;
  orders: number;
  spent: number;
  since: string;
  status: 'Active' | 'Pending' | 'Lead';
  tier: 'Premium' | 'Standard' | 'Fleet' | 'Prospect';
}

const CUSTOMERS: Customer[] = [
  { name: 'Asiamah Joshua',   email: 'asiamah@mobiledrive.app', region: 'GH', orders: 1, spent: 123700, since: '2025-11-02', status: 'Active', tier: 'Premium' },
  { name: 'Nia Mensah',       email: 'nia@acme.co',             region: 'GH', orders: 3, spent: 287400, since: '2024-07-14', status: 'Active', tier: 'Premium' },
  { name: 'Kojo Boateng',     email: 'kojo.b@workmail.com',     region: 'GH', orders: 2, spent: 203100, since: '2025-03-20', status: 'Active', tier: 'Standard' },
  { name: 'Ama Owusu',        email: 'ama.o@studio.gh',         region: 'GH', orders: 1, spent: 141500, since: '2026-01-05', status: 'Pending', tier: 'Standard' },
  { name: 'Yaw Ampah',        email: 'y.ampah@fleet.com',       region: 'GH', orders: 5, spent: 622000, since: '2023-09-11', status: 'Active', tier: 'Fleet' },
  { name: 'Serwaa Appiah',    email: 's.appiah@fx.com',         region: 'GH', orders: 1, spent: 112400, since: '2026-02-18', status: 'Active', tier: 'Standard' },
  { name: 'Afia Kusi',        email: 'afia.kusi@ventures.co',   region: 'GH', orders: 0, spent: 0,      since: '2026-10-01', status: 'Lead',   tier: 'Prospect' },
  { name: 'Rafael Mendes',    email: 'rafael.m@imports.pt',     region: 'EU', orders: 1, spent: 142800, since: '2025-12-02', status: 'Active', tier: 'Standard' },
];

const TIER_TONE: Record<Customer['tier'], StatusTone> = {
  Premium:  'warning',
  Fleet:    'info',
  Standard: 'neutral',
  Prospect: 'muted',
};

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

      <DataTable<Customer>
        rows={CUSTOMERS}
        getKey={(c) => c.email}
        columns={customerColumns}
      />
    </div>
  );
}

const customerColumns: DataTableColumn<Customer>[] = [
  {
    key: 'customer',
    header: 'Customer',
    render: (c) => (
      <div className="flex items-center gap-3">
        <div
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #A078FF, #FF78A0)' }}
          aria-hidden
        >
          {c.name.split(' ').map((p) => p[0]).join('').slice(0, 2)}
        </div>
        <div className="min-w-0">
          <div className="truncate font-medium text-white">{c.name}</div>
          <div className="truncate text-[11px] text-ink-200">{c.email}</div>
        </div>
      </div>
    ),
  },
  { key: 'tier',    header: 'Tier',    render: (c) => <StatusBadge tone={TIER_TONE[c.tier]}>{c.tier}</StatusBadge> },
  { key: 'orders',  header: 'Orders',  tabular: true, render: (c) => <span className="text-ink-100">{c.orders}</span> },
  { key: 'spent',   header: 'Spent',   tabular: true, render: (c) => <span className="font-medium text-white">{c.spent > 0 ? formatPrice(c.spent) : '—'}</span> },
  { key: 'region',  header: 'Region',  render: (c) => c.region },
  { key: 'since',   header: 'Since',   tabular: true, render: (c) => <span className="text-ink-200">{c.since}</span> },
  { key: 'status',  header: 'Status',  render: (c) => <StatusBadge tone={statusTone(c.status)} dot>{c.status}</StatusBadge> },
  {
    key: 'actions',
    header: '',
    align: 'right',
    render: (c) => (
      <div className="inline-flex gap-1">
        <a
          href={`mailto:${c.email}`}
          aria-label={`Email ${c.name}`}
          className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/10 text-ink-100 hover:bg-white/5"
        >
          <Mail className="h-3 w-3" />
        </a>
        <Link
          href={`/admin/customers/${encodeURIComponent(c.email)}`}
          aria-label={`Open ${c.name}`}
          className="inline-flex h-7 items-center gap-1 rounded-full border border-white/10 px-3 text-[11px] text-ink-100 hover:bg-white/5"
        >
          Open
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>
    ),
  },
];
