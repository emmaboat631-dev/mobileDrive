'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils/cn';
import { Check } from 'lucide-react';
import type { Vehicle, BodyType, FuelType } from '@/types/vehicle';

export interface FilterState {
  bodyTypes: BodyType[];
  brands: string[];
  fuels: FuelType[];
  priceMin: number;
  priceMax: number;
}

interface Props {
  vehicles: Vehicle[];
  filters: FilterState;
  onChange: (next: FilterState) => void;
  onReset: () => void;
  priceBounds: { min: number; max: number };
  /** Drop the outer card chrome (used inside a mobile drawer). */
  flat?: boolean;
}

const BODY_TYPES: BodyType[] = ['SUV', 'Sedan', 'Coupe', 'Sports', 'Electric', 'Luxury', 'Pickup'];
const FUELS: FuelType[] = ['Petrol', 'Diesel', 'Electric', 'Hybrid'];

export function FilterSidebar({ vehicles, filters, onChange, onReset, priceBounds, flat = false }: Props) {
  const brandCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const v of vehicles) map.set(v.brand, (map.get(v.brand) ?? 0) + 1);
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [vehicles]);

  const fuelCounts = useMemo(() => {
    const map = new Map<FuelType, number>();
    for (const v of vehicles) map.set(v.fuelType, (map.get(v.fuelType) ?? 0) + 1);
    return map;
  }, [vehicles]);

  const bodyCounts = useMemo(() => {
    const map = new Map<BodyType, number>();
    for (const v of vehicles) map.set(v.bodyType, (map.get(v.bodyType) ?? 0) + 1);
    return map;
  }, [vehicles]);

  const toggleBody = (b: BodyType) =>
    onChange({
      ...filters,
      bodyTypes: filters.bodyTypes.includes(b)
        ? filters.bodyTypes.filter((x) => x !== b)
        : [...filters.bodyTypes, b],
    });

  const toggleBrand = (b: string) =>
    onChange({
      ...filters,
      brands: filters.brands.includes(b)
        ? filters.brands.filter((x) => x !== b)
        : [...filters.brands, b],
    });

  const toggleFuel = (f: FuelType) =>
    onChange({
      ...filters,
      fuels: filters.fuels.includes(f) ? filters.fuels.filter((x) => x !== f) : [...filters.fuels, f],
    });

  const setPriceMin = (v: number) =>
    onChange({ ...filters, priceMin: Math.min(v, filters.priceMax) });
  const setPriceMax = (v: number) =>
    onChange({ ...filters, priceMax: Math.max(v, filters.priceMin) });

  return (
    <aside
      className={cn(
        'h-fit',
        !flat && 'rounded-2xl border border-white/[0.06] bg-ink-800/60 p-5',
      )}
    >
      <header className="mb-6 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-white">Filters</h2>
        <button
          type="button"
          onClick={onReset}
          className="text-xs font-medium text-ink-100 hover:text-white"
        >
          Clear
        </button>
      </header>

      <FilterGroup title="Body Type">
        <div className="flex flex-wrap gap-1.5">
          {BODY_TYPES.map((b) => {
            const active = filters.bodyTypes.includes(b);
            const count = bodyCounts.get(b) ?? 0;
            if (count === 0) return null;
            return (
              <button
                key={b}
                type="button"
                onClick={() => toggleBody(b)}
                className={cn(
                  'rounded-full px-2.5 py-1.5 text-[11px] font-medium transition',
                  active
                    ? 'bg-white text-ink-900'
                    : 'border border-white/10 text-ink-100 hover:border-white/30',
                )}
              >
                {b}
              </button>
            );
          })}
        </div>
      </FilterGroup>

      <FilterGroup title="Brand">
        <div className="space-y-2.5">
          {brandCounts.map(([name, count]) => {
            const checked = filters.brands.includes(name);
            return (
              <label
                key={name}
                className="flex cursor-pointer items-center justify-between text-sm text-ink-100"
              >
                <span className="flex items-center gap-2.5">
                  <span
                    className={cn(
                      'flex h-4 w-4 items-center justify-center rounded-sm border transition',
                      checked ? 'border-transparent bg-white' : 'border-white/15 bg-ink-700',
                    )}
                  >
                    {checked && <Check className="h-2.5 w-2.5 text-ink-900" strokeWidth={3} />}
                  </span>
                  {name}
                </span>
                <span className="text-[11px] text-ink-300">{count}</span>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleBrand(name)}
                  className="sr-only"
                />
              </label>
            );
          })}
        </div>
      </FilterGroup>

      <FilterGroup title="Price (USD)">
        <div className="text-sm font-medium text-white">
          ${filters.priceMin.toLocaleString()} – ${filters.priceMax.toLocaleString()}
        </div>
        <div className="mt-3 space-y-3">
          <label className="block">
            <span className="text-[10px] uppercase tracking-wider text-ink-300">Minimum</span>
            <input
              type="range"
              min={priceBounds.min}
              max={priceBounds.max}
              step={1000}
              value={filters.priceMin}
              onChange={(e) => setPriceMin(Number(e.target.value))}
              className="mt-1 w-full accent-white"
            />
          </label>
          <label className="block">
            <span className="text-[10px] uppercase tracking-wider text-ink-300">Maximum</span>
            <input
              type="range"
              min={priceBounds.min}
              max={priceBounds.max}
              step={1000}
              value={filters.priceMax}
              onChange={(e) => setPriceMax(Number(e.target.value))}
              className="mt-1 w-full accent-white"
            />
          </label>
        </div>
      </FilterGroup>

      <FilterGroup title="Fuel" last>
        <div className="space-y-2.5">
          {FUELS.map((f) => {
            const count = fuelCounts.get(f) ?? 0;
            if (count === 0) return null;
            const checked = filters.fuels.includes(f);
            return (
              <label
                key={f}
                className="flex cursor-pointer items-center justify-between text-sm text-ink-100"
              >
                <span className="flex items-center gap-2.5">
                  <span
                    className={cn(
                      'flex h-4 w-4 items-center justify-center rounded-sm border transition',
                      checked ? 'border-transparent bg-white' : 'border-white/15 bg-ink-700',
                    )}
                  >
                    {checked && <Check className="h-2.5 w-2.5 text-ink-900" strokeWidth={3} />}
                  </span>
                  {f}
                </span>
                <span className="text-[11px] text-ink-300">{count}</span>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleFuel(f)}
                  className="sr-only"
                />
              </label>
            );
          })}
        </div>
      </FilterGroup>
    </aside>
  );
}

function FilterGroup({ title, children, last }: { title: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div className={cn('space-y-3', !last && 'mb-6 border-b border-white/[0.06] pb-6')}>
      <h3 className="text-[11px] font-medium uppercase tracking-wider text-ink-200">{title}</h3>
      {children}
    </div>
  );
}
