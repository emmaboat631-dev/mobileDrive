import { listVehicles } from '@/lib/vehicles/data';
import { VehicleCard } from '@/components/vehicles/VehicleCard';
import { FilterSidebar } from '@/components/vehicles/FilterSidebar';
import { Search, SlidersHorizontal, ChevronDown, LayoutGrid, List } from 'lucide-react';

export const metadata = {
  title: 'Vehicles — mobileDrive',
};

export default function VehiclesPage() {
  const vehicles = listVehicles();

  return (
    <section className="container-page pb-20 pt-28">
      {/* Header */}
      <div className="mb-6">
        <div className="eyebrow mb-2">Marketplace</div>
        <h1 className="font-display text-display-lg font-semibold text-white">
          Explore Vehicles
        </h1>
        <p className="mt-3 max-w-md text-ink-200">
          Browse 120+ curated demo vehicles. Open any to enter the 3D configurator.
        </p>
      </div>

      {/* Search + sort row */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
          <input
            type="search"
            placeholder="Search brand or model"
            className="h-11 w-full rounded-full border border-white/10 bg-ink-700 pl-11 pr-4 text-sm text-white placeholder:text-ink-300 focus:border-white/30 focus:outline-none"
            aria-label="Search vehicles"
          />
        </div>
        <button
          type="button"
          className="inline-flex h-11 items-center gap-2 rounded-full border border-white/15 px-5 text-sm font-medium text-white hover:bg-white/5"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-white px-1 text-[10px] font-semibold text-ink-900">
            3
          </span>
        </button>
        <button
          type="button"
          className="inline-flex h-11 items-center gap-2 rounded-full border border-white/10 px-4 text-sm text-white hover:bg-white/5"
        >
          Sort: Recommended
          <ChevronDown className="h-3 w-3 text-ink-200" />
        </button>
      </div>

      {/* Results count + view toggle */}
      <div className="mt-6 mb-6 flex items-center justify-between">
        <div className="text-sm text-ink-200">
          Showing {vehicles.length} of 120 vehicles
        </div>
        <div className="flex rounded-full border border-white/10 bg-ink-700 p-0.5">
          <button
            type="button"
            aria-label="Grid view"
            className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-ink-900"
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            Grid
          </button>
          <button
            type="button"
            aria-label="List view"
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-ink-100 hover:text-white"
          >
            <List className="h-3.5 w-3.5" />
            List
          </button>
        </div>
      </div>

      {/* Body: sidebar + results grid */}
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <FilterSidebar />
        <div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
            {vehicles.map((v) => (
              <VehicleCard key={v.id} vehicle={v} />
            ))}
          </div>

          {/* Pagination */}
          <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-1.5">
            {['‹', '1', '2', '3', '…', '12', '›'].map((p, i) => {
              const active = p === '1';
              const spacer = p === '…';
              return (
                <button
                  key={i}
                  type="button"
                  disabled={spacer}
                  className={
                    'flex h-9 w-9 items-center justify-center rounded-full text-xs font-medium transition ' +
                    (spacer
                      ? 'text-ink-200'
                      : active
                        ? 'bg-white text-ink-900'
                        : 'border border-white/10 text-ink-100 hover:bg-white/5 hover:text-white')
                  }
                >
                  {p}
                </button>
              );
            })}
          </nav>

          <p className="mt-10 text-xs text-ink-300">
            Demo inventory. Pricing and specifications are illustrative.
          </p>
        </div>
      </div>
    </section>
  );
}
