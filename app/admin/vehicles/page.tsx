import Link from 'next/link';
import { Edit3, Trash2, Plus, Search, Copy, CheckCircle2 } from 'lucide-react';
import { listVehicles, getHeroColor } from '@/lib/vehicles/data';
import { formatPrice } from '@/lib/utils/format';

export const metadata = { title: 'Vehicles — Admin · mobileDrive' };

export default function AdminVehiclesPage({
  searchParams,
}: {
  searchParams: { created?: string; mock?: string };
}) {
  const vehicles = listVehicles();
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
        <div className="flex items-start gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-3 text-sm text-emerald-200">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
          <div>
            Published <code className="text-white">{createdId}</code>.{' '}
            {mock && (
              <>
                Local demo — set up Supabase in <code className="text-white">.env.local</code> to persist.
              </>
            )}
          </div>
        </div>
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

      {/* Table */}
      <section className="overflow-hidden rounded-2xl border border-white/[0.06] bg-ink-800/60">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-white/[0.06] text-left text-[11px] uppercase tracking-wider text-ink-300">
              <tr>
                <th className="w-10 px-6 py-3">
                  <input type="checkbox" aria-label="Select all" className="h-4 w-4 rounded border-white/15 bg-ink-700" />
                </th>
                <th className="px-6 py-3 font-medium">Vehicle</th>
                <th className="px-6 py-3 font-medium">Year</th>
                <th className="px-6 py-3 font-medium">Price</th>
                <th className="px-6 py-3 font-medium">Options</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Model</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {vehicles.map((v) => {
                const color = getHeroColor(v);
                return (
                  <tr key={v.id} className="hover:bg-white/[0.02]">
                    <td className="px-6 py-3">
                      <input type="checkbox" aria-label={`Select ${v.model}`} className="h-4 w-4 rounded border-white/15 bg-ink-700" />
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="h-10 w-16 shrink-0 rounded-md"
                          style={{
                            background: `radial-gradient(60% 60% at 50% 50%, ${color.hex}cc, #0A0B0E 85%)`,
                          }}
                        >
                          <div
                            className="mx-auto mt-6 h-1.5 w-10 rounded-full"
                            style={{ background: color.hex }}
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="truncate font-medium text-white">
                            {v.brand} {v.model}
                          </div>
                          <div className="text-[11px] text-ink-300">{v.bodyType} · {v.driveType}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-ink-100 tabular-nums">{v.year}</td>
                    <td className="px-6 py-3 font-medium text-white tabular-nums">
                      {formatPrice(v.price, v.currency)}
                    </td>
                    <td className="px-6 py-3 text-ink-200 tabular-nums">
                      {v.availableColors.length}c · {v.availableWheels.length}w · {v.availableInteriors.length}i
                    </td>
                    <td className="px-6 py-3">
                      <span className="inline-flex rounded-full border border-emerald-400/30 bg-emerald-400/15 px-2.5 py-0.5 text-[11px] font-medium text-emerald-400">
                        Published
                      </span>
                    </td>
                    <td className="px-6 py-3 text-[11px] text-ink-200">
                      {v.modelPath ? (
                        <span className="inline-flex items-center gap-1 text-sky-300">
                          <span className="h-1.5 w-1.5 rounded-full bg-sky-300" />
                          GLB
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-ink-300">
                          <span className="h-1.5 w-1.5 rounded-full bg-ink-400" />
                          Procedural
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-right">
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
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-red-400/30 text-red-300 hover:bg-red-500/10"
                          aria-label={`Delete ${v.model}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
