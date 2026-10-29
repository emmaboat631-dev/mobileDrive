import Link from 'next/link';
import { Edit3, Trash2, Plus, Search, Copy } from 'lucide-react';
import { getHeroColor } from '@/lib/vehicles/data';
import { fetchVehicles } from '@/lib/admin/queries';
import { formatPrice } from '@/lib/utils/format';
import type { Vehicle } from '@/types/vehicle';
import { Banner, StatusBadge, DataTable, type DataTableColumn } from '@/components/ui';

export const metadata = { title: 'Vehicles — Admin · mobileDrive' };

export default async function AdminVehiclesPage({
  searchParams,
}: {
  searchParams: { created?: string; mock?: string };
}) {
  const vehicles = await fetchVehicles();
  const createdId = searchParams.created;
  const mock = searchParams.mock === '1';

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <div className="eyebrow">Inventory</div>
          <h1 className="mt-2 font-display text-display-md font-semibold text-white">
            Vehicles
          </h1>
          <p className="mt-2 text-sm text-ink-200">
            {vehicles.length} listings · last synced moments ago
          </p>
        </div>
        <Link href="/admin/vehicles/new" className="btn-primary">
          <Plus className="h-4 w-4" />
          Add vehicle
        </Link>
      </header>

      {createdId && (
        <Banner tone={mock ? 'warning' : 'success'}>
          Published <code className="text-white">{createdId}</code>.{' '}
          {mock && (
            <>Local demo — set up Supabase in <code className="text-white">.env.local</code> to persist.</>
          )}
        </Banner>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
          <input
            type="search"
            placeholder="Search by brand or model…"
            className="h-10 w-full rounded-full border border-white/10 bg-ink-700 pl-11 pr-4 text-sm text-white placeholder:text-ink-300 focus:border-white/30 focus:outline-none"
          />
        </div>
        <div className="flex rounded-full border border-white/10 p-0.5 text-xs text-ink-100">
          {['All', 'Published', 'Drafts', 'Low stock'].map((t, i) => (
            <button
              key={t}
              type="button"
              className={
                'rounded-full px-3.5 py-1.5 font-medium ' +
                (i === 0 ? 'bg-white text-ink-900' : 'hover:text-white')
              }
            >
              {t}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="ml-auto inline-flex h-10 items-center gap-1.5 rounded-full border border-white/10 px-4 text-xs font-medium text-ink-100 hover:bg-white/5"
        >
          Export CSV
        </button>
      </div>

      <DataTable<Vehicle>
        rows={vehicles}
        getKey={(v) => v.id}
        columns={vehicleColumns}
      />
    </div>
  );
}

const vehicleColumns: DataTableColumn<Vehicle>[] = [
  {
    key: 'vehicle',
    header: 'Vehicle',
    render: (v) => {
      const color = getHeroColor(v);
      return (
        <div className="flex items-center gap-3">
          <div
            className="h-10 w-16 shrink-0 rounded-md"
            style={{ background: `radial-gradient(60% 60% at 50% 50%, ${color.hex}cc, #0A0B0E 85%)` }}
          >
            <div className="mx-auto mt-6 h-1.5 w-10 rounded-full" style={{ background: color.hex }} />
          </div>
          <div className="min-w-0">
            <div className="truncate font-medium text-white">{v.brand} {v.model}</div>
            <div className="text-[11px] text-ink-300">{v.bodyType} · {v.driveType}</div>
          </div>
        </div>
      );
    },
  },
  { key: 'year',   header: 'Year',  tabular: true, render: (v) => <span className="text-ink-100">{v.year}</span> },
  { key: 'price',  header: 'Price', tabular: true, render: (v) => <span className="font-medium text-white">{formatPrice(v.price, v.currency)}</span> },
  {
    key: 'options',
    header: 'Options',
    tabular: true,
    render: (v) => (
      <span className="text-ink-200">
        {v.availableColors.length}c · {v.availableWheels.length}w · {v.availableInteriors.length}i
      </span>
    ),
  },
  { key: 'status', header: 'Status', render: () => <StatusBadge tone="success">Published</StatusBadge> },
  {
    key: 'model',
    header: 'Model',
    render: (v) =>
      v.modelPath ? (
        <StatusBadge tone="info" dot>GLB</StatusBadge>
      ) : (
        <StatusBadge tone="muted" dot>Procedural</StatusBadge>
      ),
  },
  {
    key: 'actions',
    header: '',
    align: 'right',
    render: (v) => (
      <div className="inline-flex gap-1">
        <Link
          href={`/admin/vehicles/${v.id}`}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-ink-100 hover:bg-white/5"
          aria-label={`Edit ${v.model}`}
        >
          <Edit3 className="h-3.5 w-3.5" />
        </Link>
        <button
          type="button"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-ink-100 hover:bg-white/5"
          aria-label={`Duplicate ${v.model}`}
        >
          <Copy className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-rose-400/30 text-rose-300 hover:bg-rose-500/10"
          aria-label={`Delete ${v.model}`}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    ),
  },
];
