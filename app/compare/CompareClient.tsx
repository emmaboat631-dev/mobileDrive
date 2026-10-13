'use client';

import { useMemo, useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowRight, X, Plus, Search } from 'lucide-react';
import type { Vehicle } from '@/types/vehicle';
import { getHeroColor } from '@/lib/vehicles/data';
import { formatPrice } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import { EmptyState } from '@/components/ui';

const MAX_SLOTS = 3;

const ROWS: Array<[string, (v: Vehicle) => string]> = [
  ['Price',        (v) => formatPrice(v.price, v.currency)],
  ['Power',        (v) => `${v.horsepower} HP`],
  ['0–100 km/h',   (v) => `${v.acceleration.toFixed(1)}s`],
  ['Top speed',    (v) => `${v.topSpeed} km/h`],
  ['Fuel',         (v) => v.fuelType],
  ['Transmission', (v) => v.transmission],
  ['Drive',        (v) => v.driveType],
  ['Body',         (v) => v.bodyType],
  ['Range',        (v) => (v.rangeKm ? `${v.rangeKm} km` : '—')],
  ['Year',         (v) => String(v.year)],
];

interface Props {
  vehicles: Vehicle[];
  defaultIds: string[];
}

export function CompareClient({ vehicles, defaultIds }: Props) {
  const search = useSearchParams();
  const router = useRouter();

  const initialIds = useMemo(() => {
    const raw = search?.get('v');
    const list = (raw ? raw.split(',') : defaultIds)
      .map((s) => s.trim())
      .filter((id) => vehicles.some((v) => v.id === id));
    return list.slice(0, MAX_SLOTS);
  }, [search, defaultIds, vehicles]);

  const [ids, setIds] = useState<string[]>(initialIds);
  const [pickerOpen, setPickerOpen] = useState(false);

  // Keep URL in sync with selection
  useEffect(() => {
    const next = new URLSearchParams();
    if (ids.length) next.set('v', ids.join(','));
    router.replace(ids.length ? `/compare?${next.toString()}` : '/compare', { scroll: false });
  }, [ids, router]);

  const selected = ids.map((id) => vehicles.find((v) => v.id === id)!).filter(Boolean);
  const addable = vehicles.filter((v) => !ids.includes(v.id));

  const remove = useCallback((id: string) => {
    setIds((prev) => prev.filter((x) => x !== id));
  }, []);
  const add = useCallback((id: string) => {
    setIds((prev) => (prev.includes(id) || prev.length >= MAX_SLOTS ? prev : [...prev, id]));
    setPickerOpen(false);
  }, []);

  // Highlight the best value per row (highest or lowest depending on metric).
  const bestIndex = useMemo(() => {
    const map: Record<string, number> = {};
    ROWS.forEach(([label]) => {
      let best = -1;
      let bestVal = Number.NEGATIVE_INFINITY;
      selected.forEach((v, i) => {
        const n = metric(label, v);
        if (n === null) return;
        if (n > bestVal) {
          bestVal = n;
          best = i;
        }
      });
      if (best >= 0) map[label] = best;
    });
    return map;
  }, [selected]);

  if (selected.length === 0) {
    return (
      <EmptyState
        title="No vehicles to compare yet"
        description="Add two or three vehicles side-by-side to see how they stack up."
        action={
          <button type="button" onClick={() => setPickerOpen(true)} className="btn-primary">
            <Plus className="h-4 w-4" />
            Add a vehicle
          </button>
        }
      />
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {selected.map((v) => (
          <article
            key={v.id}
            className="flex flex-col overflow-hidden rounded-3xl border border-white/[0.06] bg-ink-800/60"
          >
            <div
              className="relative h-56"
              style={{
                background: `radial-gradient(60% 50% at 50% 50%, ${getHeroColor(v).hex}cc, #0A0B0E 85%)`,
              }}
            >
              <SilhouetteSvg colorHex={getHeroColor(v).hex} />
            </div>

            <div className="px-6 py-5">
              <div className="eyebrow">{v.brand} · {v.year}</div>
              <h2 className="mt-1 font-display text-2xl font-semibold text-white">{v.model}</h2>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="font-display text-xl font-semibold text-white">
                  {formatPrice(v.price, v.currency)}
                </span>
                <button
                  type="button"
                  onClick={() => remove(v.id)}
                  className="inline-flex items-center gap-1 rounded-full border border-white/15 px-2.5 py-1 text-[11px] font-medium text-ink-100 hover:bg-white/5 hover:text-white"
                >
                  <X className="h-3 w-3" />
                  Remove
                </button>
              </div>
            </div>

            <div className="border-t border-white/[0.06]">
              {ROWS.map(([label, read], i) => {
                const myIndex = selected.findIndex((x) => x.id === v.id);
                const isBest = bestIndex[label] === myIndex && selected.length > 1;
                return (
                  <div
                    key={label}
                    className={cn(
                      'flex items-center justify-between px-6 py-3.5 text-sm',
                      i % 2 === 1 && 'bg-white/[0.015]',
                    )}
                  >
                    <span className="text-ink-200">{label}</span>
                    <span className={cn('font-medium', isBest ? 'text-emerald-400' : 'text-white')}>
                      {read(v)}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-auto border-t border-white/[0.06] px-6 py-5">
              <Link href={`/configure/${v.id}`} className="btn-primary w-full">
                Configure
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </article>
        ))}

        {/* Add slot */}
        {selected.length < MAX_SLOTS && addable.length > 0 && (
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="flex min-h-[480px] flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-white/15 bg-ink-800/20 text-sm text-ink-100 transition hover:border-white/30 hover:bg-ink-800/40 hover:text-white"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15">
              <Plus className="h-4 w-4" />
            </span>
            Add a vehicle to compare
          </button>
        )}
      </div>

      <p className="mt-6 text-xs text-ink-300">
        Best-in-row values are highlighted in green. {MAX_SLOTS - selected.length > 0
          ? `${MAX_SLOTS - selected.length} slot${MAX_SLOTS - selected.length === 1 ? '' : 's'} remaining.`
          : 'All slots filled.'}
      </p>

      {pickerOpen && (
        <VehiclePicker
          vehicles={addable}
          onPick={add}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </>
  );
}

function metric(label: string, v: Vehicle): number | null {
  // Lower is better for acceleration and price; higher is better for the rest.
  // "best" here just means to visually highlight the dominant spec.
  switch (label) {
    case 'Price':         return -v.price;
    case 'Power':         return v.horsepower;
    case '0–100 km/h':    return -v.acceleration;
    case 'Top speed':     return v.topSpeed;
    case 'Range':         return v.rangeKm ?? null;
    case 'Year':          return v.year;
    default:              return null;
  }
}

function VehiclePicker({
  vehicles,
  onPick,
  onClose,
}: {
  vehicles: Vehicle[];
  onPick: (id: string) => void;
  onClose: () => void;
}) {
  const [q, setQ] = useState('');
  const filtered = useMemo(() => {
    if (!q) return vehicles;
    const needle = q.toLowerCase();
    return vehicles.filter((v) => `${v.brand} ${v.model}`.toLowerCase().includes(needle));
  }, [q, vehicles]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/60"
      />
      <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-ink-800">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3">
          <h3 className="font-display text-base font-semibold text-white">Add vehicle to compare</h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink-100 hover:bg-white/5"
            aria-label="Close picker"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="border-b border-white/[0.06] px-5 py-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
            <input
              autoFocus
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search brand or model"
              className="h-10 w-full rounded-full border border-white/10 bg-ink-700 pl-10 pr-4 text-sm text-white placeholder:text-ink-300 focus:border-white/30 focus:outline-none"
            />
          </div>
        </div>
        <ul className="max-h-[55vh] overflow-y-auto">
          {filtered.map((v) => (
            <li key={v.id}>
              <button
                type="button"
                onClick={() => onPick(v.id)}
                className="flex w-full items-center justify-between gap-4 px-5 py-3 text-left text-sm transition hover:bg-white/5"
              >
                <span className="min-w-0">
                  <span className="block text-xs text-ink-200">{v.brand} · {v.year}</span>
                  <span className="block truncate font-medium text-white">{v.model}</span>
                </span>
                <span className="shrink-0 text-sm text-ink-100">
                  {formatPrice(v.price, v.currency)}
                </span>
              </button>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="px-5 py-6 text-center text-sm text-ink-200">No matches.</li>
          )}
        </ul>
      </div>
    </div>
  );
}

function SilhouetteSvg({ colorHex }: { colorHex: string }) {
  return (
    <svg viewBox="0 0 400 220" className="absolute inset-x-0 bottom-0 h-full w-full" aria-hidden>
      <ellipse cx="200" cy="190" rx="150" ry="10" fill="#000" opacity="0.6" />
      <path
        d="M70,160 L105,120 Q145,95 200,93 Q255,95 295,120 L330,160 Q325,178 305,180 L295,180 Q291,170 280,170 Q269,170 265,180 L135,180 Q131,170 120,170 Q109,170 105,180 L95,180 Q75,178 70,160 Z"
        fill={colorHex}
      />
      <path d="M140,120 Q175,105 200,104 Q225,105 260,120 L252,132 L148,132 Z" fill="#0A0C10" opacity="0.9" />
      <circle cx="122" cy="175" r="16" fill="#0A0B0E" stroke="#2A2D33" strokeWidth="1.5" />
      <circle cx="122" cy="175" r="6" fill="#1A1D22" />
      <circle cx="278" cy="175" r="16" fill="#0A0B0E" stroke="#2A2D33" strokeWidth="1.5" />
      <circle cx="278" cy="175" r="6" fill="#1A1D22" />
    </svg>
  );
}
