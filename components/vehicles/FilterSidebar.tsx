'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { Check } from 'lucide-react';

const BODY_TYPES = ['All', 'SUV', 'Sedan', 'Coupe', 'Sports', 'Electric', 'Luxury', 'Pickup'] as const;
const BRANDS = [
  { name: 'BMW', count: 12 },
  { name: 'Porsche', count: 8 },
  { name: 'Tesla', count: 5 },
  { name: 'Mercedes-AMG', count: 7 },
  { name: 'Audi', count: 9 },
  { name: 'Range Rover', count: 4 },
];
const FUELS = [
  { name: 'Petrol', count: 42 },
  { name: 'Diesel', count: 18 },
  { name: 'Electric', count: 24 },
  { name: 'Hybrid', count: 16 },
];

export function FilterSidebar() {
  const [bodyType, setBodyType] = useState<string[]>(['All', 'Coupe', 'Electric']);
  const [brands, setBrands] = useState<string[]>(['BMW', 'Porsche', 'Mercedes-AMG']);
  const [fuels, setFuels] = useState<string[]>(['Electric']);
  const [priceRange, setPriceRange] = useState<[number, number]>([60000, 180000]);

  const toggleIn = (list: string[], v: string, setter: (next: string[]) => void) => {
    setter(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  };

  return (
    <aside className="h-fit rounded-2xl border border-white/[0.06] bg-ink-800/60 p-5">
      <header className="mb-6 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-white">Filters</h2>
        <button
          type="button"
          onClick={() => {
            setBodyType(['All']);
            setBrands([]);
            setFuels([]);
            setPriceRange([60000, 180000]);
          }}
          className="text-xs font-medium text-ink-100 hover:text-white"
        >
          Clear
        </button>
      </header>

      <FilterGroup title="Body Type">
        <div className="flex flex-wrap gap-1.5">
          {BODY_TYPES.map((b) => {
            const active = bodyType.includes(b);
            return (
              <button
                key={b}
                type="button"
                onClick={() => toggleIn(bodyType, b, setBodyType)}
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
          {BRANDS.map((b) => {
            const checked = brands.includes(b.name);
            return (
              <label
                key={b.name}
                className="flex cursor-pointer items-center justify-between text-sm text-ink-100"
              >
                <span className="flex items-center gap-2.5">
                  <span
                    className={cn(
                      'flex h-4 w-4 items-center justify-center rounded-sm border transition',
                      checked
                        ? 'border-transparent bg-white'
                        : 'border-white/15 bg-ink-700',
                    )}
                  >
                    {checked && <Check className="h-2.5 w-2.5 text-ink-900" strokeWidth={3} />}
                  </span>
                  {b.name}
                </span>
                <span className="text-[11px] text-ink-300">{b.count}</span>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleIn(brands, b.name, setBrands)}
                  className="sr-only"
                />
              </label>
            );
          })}
        </div>
      </FilterGroup>

      <FilterGroup title="Price">
        <div className="text-sm font-medium text-white">
          ${priceRange[0].toLocaleString()} – ${priceRange[1].toLocaleString()}
        </div>
        <div className="mt-3">
          <div className="relative h-6">
            <div className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 rounded bg-white/15" />
            <div
              className="absolute top-1/2 h-0.5 -translate-y-1/2 rounded bg-white"
              style={{
                left: `${(priceRange[0] / 500000) * 100}%`,
                right: `${100 - (priceRange[1] / 500000) * 100}%`,
              }}
            />
            {priceRange.map((v, i) => (
              <div
                key={i}
                className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
                style={{ left: `${(v / 500000) * 100}%` }}
              />
            ))}
          </div>
        </div>
      </FilterGroup>

      <FilterGroup title="Fuel" last>
        <div className="space-y-2.5">
          {FUELS.map((f) => {
            const checked = fuels.includes(f.name);
            return (
              <label
                key={f.name}
                className="flex cursor-pointer items-center justify-between text-sm text-ink-100"
              >
                <span className="flex items-center gap-2.5">
                  <span
                    className={cn(
                      'flex h-4 w-4 items-center justify-center rounded-sm border transition',
                      checked
                        ? 'border-transparent bg-white'
                        : 'border-white/15 bg-ink-700',
                    )}
                  >
                    {checked && <Check className="h-2.5 w-2.5 text-ink-900" strokeWidth={3} />}
                  </span>
                  {f.name}
                </span>
                <span className="text-[11px] text-ink-300">{f.count}</span>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleIn(fuels, f.name, setFuels)}
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

function FilterGroup({
  title,
  children,
  last,
}: {
  title: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div className={cn('space-y-3', !last && 'mb-6 border-b border-white/[0.06] pb-6')}>
      <h3 className="text-[11px] font-medium uppercase tracking-wider text-ink-200">
        {title}
      </h3>
      {children}
    </div>
  );
}
