'use client';

import { useMemo, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, ChevronDown, LayoutGrid, List, X } from 'lucide-react';
import type { Vehicle, BodyType, FuelType } from '@/types/vehicle';
import { VehicleCard } from './VehicleCard';
import { FilterSidebar, type FilterState } from './FilterSidebar';
import { EmptyState } from '@/components/ui';

const ALL_BODY_TYPES: readonly BodyType[] = [
  'SUV', 'Sedan', 'Coupe', 'Sports', 'Electric', 'Luxury', 'Pickup',
] as const;

type SortKey = 'recommended' | 'price-asc' | 'price-desc' | 'power-desc' | 'accel-asc';
type View = 'grid' | 'list';

const SORT_LABELS: Record<SortKey, string> = {
  recommended: 'Recommended',
  'price-asc': 'Price: low to high',
  'price-desc': 'Price: high to low',
  'power-desc': 'Power',
  'accel-asc': '0–100 km/h',
};

function sortVehicles(list: Vehicle[], key: SortKey): Vehicle[] {
  const copy = [...list];
  switch (key) {
    case 'price-asc':  return copy.sort((a, b) => a.price - b.price);
    case 'price-desc': return copy.sort((a, b) => b.price - a.price);
    case 'power-desc': return copy.sort((a, b) => b.horsepower - a.horsepower);
    case 'accel-asc':  return copy.sort((a, b) => a.acceleration - b.acceleration);
    default:           return copy;
  }
}

function matches(v: Vehicle, f: FilterState, q: string): boolean {
  if (q) {
    const needle = q.toLowerCase();
    const hay = `${v.brand} ${v.model} ${v.bodyType} ${v.fuelType}`.toLowerCase();
    if (!hay.includes(needle)) return false;
  }
  if (f.bodyTypes.length && !f.bodyTypes.includes(v.bodyType)) return false;
  if (f.brands.length && !f.brands.includes(v.brand)) return false;
  if (f.fuels.length && !f.fuels.includes(v.fuelType)) return false;
  if (v.price < f.priceMin || v.price > f.priceMax) return false;
  return true;
}

export function MarketplaceClient({ vehicles }: { vehicles: Vehicle[] }) {
  const priceBounds = useMemo(() => {
    const prices = vehicles.map((v) => v.price);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [vehicles]);

  // Seed initial state from URL (e.g. /vehicles?body=SUV&q=raptor).
  const search = useSearchParams();
  const initialBody = useMemo(() => {
    const raw = search?.get('body');
    if (!raw) return [] as BodyType[];
    return raw
      .split(',')
      .map((s) => s.trim())
      .filter((s): s is BodyType => (ALL_BODY_TYPES as readonly string[]).includes(s));
  }, [search]);
  const initialQuery = search?.get('q') ?? '';

  const [query, setQuery] = useState(initialQuery);
  const [view, setView] = useState<View>('grid');
  const [sort, setSort] = useState<SortKey>('recommended');
  const [sortOpen, setSortOpen] = useState(false);
  const [mobileFilters, setMobileFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    bodyTypes: initialBody,
    brands: [],
    fuels: [],
    priceMin: priceBounds.min,
    priceMax: priceBounds.max,
  });

  const results = useMemo(
    () => sortVehicles(vehicles.filter((v) => matches(v, filters, query)), sort),
    [vehicles, filters, query, sort],
  );

  const activeFilterCount =
    filters.bodyTypes.length +
    filters.brands.length +
    filters.fuels.length +
    (filters.priceMin !== priceBounds.min || filters.priceMax !== priceBounds.max ? 1 : 0);

  const resetFilters = useCallback(
    () =>
      setFilters({
        bodyTypes: [],
        brands: [],
        fuels: [],
        priceMin: priceBounds.min,
        priceMax: priceBounds.max,
      }),
    [priceBounds],
  );

  return (
    <>
      {/* Search + filter + sort row */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search brand or model"
            className="h-11 w-full rounded-full border border-white/10 bg-ink-700 pl-11 pr-4 text-sm text-white placeholder:text-ink-300 focus:border-white/30 focus:outline-none"
            aria-label="Search vehicles"
          />
        </div>
        <button
          type="button"
          onClick={() => setMobileFilters(true)}
          className="inline-flex h-11 items-center gap-2 rounded-full border border-white/15 px-5 text-sm font-medium text-white hover:bg-white/5 lg:hidden"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-white px-1 text-[10px] font-semibold text-ink-900">
              {activeFilterCount}
            </span>
          )}
        </button>
        <div className="relative">
          <button
            type="button"
            onClick={() => setSortOpen((v) => !v)}
            className="inline-flex h-11 items-center gap-2 rounded-full border border-white/10 px-4 text-sm text-white hover:bg-white/5"
            aria-expanded={sortOpen}
            aria-haspopup="listbox"
          >
            Sort: {SORT_LABELS[sort]}
            <ChevronDown className="h-3 w-3 text-ink-200" />
          </button>
          {sortOpen && (
            <ul
              role="listbox"
              className="absolute right-0 top-12 z-20 w-56 overflow-hidden rounded-xl border border-white/[0.08] bg-ink-800 py-1 shadow-xl"
            >
              {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
                <li key={k}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={sort === k}
                    onClick={() => {
                      setSort(k);
                      setSortOpen(false);
                    }}
                    className={
                      'flex w-full items-center justify-between px-4 py-2 text-left text-sm transition ' +
                      (sort === k
                        ? 'bg-white/10 text-white'
                        : 'text-ink-100 hover:bg-white/5 hover:text-white')
                    }
                  >
                    {SORT_LABELS[k]}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Count + view toggle */}
      <div className="mb-6 mt-6 flex items-center justify-between">
        <div className="text-sm text-ink-200">
          {results.length === vehicles.length
            ? `${vehicles.length} vehicles`
            : `${results.length} of ${vehicles.length} vehicles`}
        </div>
        <div className="flex rounded-full border border-white/10 bg-ink-700 p-0.5">
          <button
            type="button"
            aria-label="Grid view"
            aria-pressed={view === 'grid'}
            onClick={() => setView('grid')}
            className={
              'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ' +
              (view === 'grid' ? 'bg-white text-ink-900' : 'text-ink-100 hover:text-white')
            }
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            Grid
          </button>
          <button
            type="button"
            aria-label="List view"
            aria-pressed={view === 'list'}
            onClick={() => setView('list')}
            className={
              'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ' +
              (view === 'list' ? 'bg-white text-ink-900' : 'text-ink-100 hover:text-white')
            }
          >
            <List className="h-3.5 w-3.5" />
            List
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="hidden lg:block">
          <FilterSidebar
            vehicles={vehicles}
            filters={filters}
            onChange={setFilters}
            onReset={resetFilters}
            priceBounds={priceBounds}
          />
        </div>

        <div>
          {results.length === 0 ? (
            <EmptyState
              title="No vehicles match"
              description="Try removing a filter or widening your price range."
              action={
                <button type="button" onClick={resetFilters} className="btn-secondary">
                  Reset filters
                </button>
              }
            />
          ) : view === 'grid' ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
              {results.map((v) => (
                <VehicleCard key={v.id} vehicle={v} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {results.map((v) => (
                <VehicleCard key={v.id} vehicle={v} layout="list" />
              ))}
            </div>
          )}
          <p className="mt-10 text-xs text-ink-300">
            Pricing and specifications are illustrative.
          </p>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {mobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close filters"
            onClick={() => setMobileFilters(false)}
            className="absolute inset-0 bg-black/60"
          />
          <div className="absolute inset-x-0 bottom-0 top-16 overflow-hidden rounded-t-3xl border-t border-white/10 bg-ink-900">
            <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
              <h2 className="font-display text-base font-semibold text-white">Filters</h2>
              <button
                type="button"
                onClick={() => setMobileFilters(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-ink-100 hover:bg-white/5"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="h-[calc(100%-57px)] overflow-y-auto p-4">
              <FilterSidebar
                vehicles={vehicles}
                filters={filters}
                onChange={setFilters}
                onReset={resetFilters}
                priceBounds={priceBounds}
                flat
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

