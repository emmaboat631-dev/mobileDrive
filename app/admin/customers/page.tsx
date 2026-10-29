import Link from 'next/link';
import { ArrowUpRight, Search, UserPlus, Mail } from 'lucide-react';
import { DataTable, StatusBadge, statusTone, EmptyState, type DataTableColumn, type StatusTone } from '@/components/ui';
import { fetchProfiles, type ProfileRow } from '@/lib/admin/queries';

export const metadata = { title: 'Customers — Admin · mobileDrive' };
export const dynamic = 'force-dynamic';

const ROLE_TONE: Record<string, StatusTone> = {
  admin: 'warning',
  dealer: 'info',
  customer: 'neutral',
};

export default async function AdminCustomersPage() {
  const CUSTOMERS = await fetchProfiles(100);

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <div className="eyebrow">Customers</div>
          <h1 className="mt-2 font-display text-display-md font-semibold text-white">
            People buying with mobileDrive
          </h1>
          <p className="mt-2 text-sm text-ink-200">
            {CUSTOMERS.length} profiles
          </p>
        </div>
        <button type="button" className="btn-primary">
          <UserPlus className="h-4 w-4" />
          Invite
        </button>
      </header>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {['All', 'Admin', 'Dealer', 'Customer'].map((t, i) => (
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

      {CUSTOMERS.length === 0 ? (
        <EmptyState
          title="No customers yet"
          description="Profiles appear here as soon as someone signs up through the app."
        />
      ) : (
        <DataTable<ProfileRow> rows={CUSTOMERS} getKey={(c) => c.id} columns={customerColumns} />
      )}
    </div>
  );
}

const customerColumns: DataTableColumn<ProfileRow>[] = [
  {
    key: 'customer',
    header: 'Customer',
    render: (c) => {
      const label = c.full_name || c.email || c.id;
      const initials = (c.full_name ?? c.email ?? 'U')
        .split(/[\s@._-]+/)
        .map((p) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
      return (
        <div className="flex items-center gap-3">
          <div
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #A078FF, #FF78A0)' }}
            aria-hidden
          >
            {initials}
          </div>
          <div className="min-w-0">
            <div className="truncate font-medium text-white">{label}</div>
            <div className="truncate text-[11px] text-ink-200">{c.email ?? '—'}</div>
          </div>
        </div>
      );
    },
  },
  { key: 'role',   header: 'Role',   render: (c) => <StatusBadge tone={ROLE_TONE[c.role] ?? 'neutral'}>{c.role}</StatusBadge> },
  { key: 'phone',  header: 'Phone',  render: (c) => c.phone ?? '—' },
  { key: 'region', header: 'Region', render: (c) => c.region ?? '—' },
  { key: 'since',  header: 'Since',  tabular: true, render: (c) => <span className="text-ink-200">{new Date(c.created_at).toLocaleDateString()}</span> },
  { key: 'status', header: 'Status', render: () => <StatusBadge tone={statusTone('Active')} dot>Active</StatusBadge> },
  {
    key: 'actions',
    header: '',
    align: 'right',
    render: (c) => (
      <div className="inline-flex gap-1">
        {c.email && (
          <a
            href={`mailto:${c.email}`}
            aria-label={`Email ${c.full_name ?? c.email}`}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/10 text-ink-100 hover:bg-white/5"
          >
            <Mail className="h-3 w-3" />
          </a>
        )}
        <Link
          href={`/admin/customers/${encodeURIComponent(c.id)}`}
          aria-label={`Open ${c.full_name ?? c.email ?? c.id}`}
          className="inline-flex h-7 items-center gap-1 rounded-full border border-white/10 px-3 text-[11px] text-ink-100 hover:bg-white/5"
        >
          Open
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>
    ),
  },
];
