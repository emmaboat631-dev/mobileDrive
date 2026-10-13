'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { ChevronRight, Heart, Plus, ArrowRight, Check } from 'lucide-react';
import type { Vehicle } from '@/types/vehicle';
import { getHeroColor } from '@/lib/vehicles/data';
import { formatPrice } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import { useWishlist } from '@/store/wishlistStore';

const CarViewer = dynamic(
  () => import('@/components/3d/CarViewer').then((m) => m.CarViewer),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center">
        <div className="text-sm text-ink-200">Preparing your vehicle…</div>
      </div>
    ),
  },
);

const TABS = ['Overview', 'Specifications', 'Features', 'Interior', 'Reviews'] as const;

export function VehicleDetailClient({ vehicle }: { vehicle: Vehicle }) {
  const [tab, setTab] = useState<(typeof TABS)[number]>('Overview');
  const saved = useWishlist((s) => s.vehicleIds.includes(vehicle.id));
  const toggleSaved = useWishlist((s) => s.toggle);
  const hydrated = useWishlist((s) => s.hydrated);
  const defaultColor = getHeroColor(vehicle);
  const defaultWheel = vehicle.availableWheels[0];

  const monthly = Math.round((vehicle.price * 0.0196) / 1); // rough simulated monthly

  return (
    <section className="container-page pb-20 pt-28">
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-ink-300">
        <Link href="/" className="hover:text-white">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/vehicles" className="hover:text-white">Vehicles</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-white">{vehicle.brand} {vehicle.model}</span>
      </nav>

      {/* Hero: 3D stage left, info right */}
      <div className="grid gap-8 lg:grid-cols-[1fr_484px]">
        <div className="relative h-[560px] overflow-hidden rounded-3xl border border-white/[0.06] bg-ink-800/40">
          <CarViewer
            modelPath={vehicle.modelPath}
            bodyHex={defaultColor.hex}
            bodyFinish={defaultColor.finish}
            wheelStyle={defaultWheel.style}
            headlightsOn={false}
            autoRotate
            interactive
            className="absolute inset-0"
          />
          {/* View tag */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex gap-2 p-5">
            {['360°', 'Front', 'Side', 'Interior'].map((v, i) => (
              <div
                key={v}
                className={cn(
                  'pointer-events-auto flex h-16 w-16 items-center justify-center rounded-xl border text-[11px] font-medium',
                  i === 0
                    ? 'border-white bg-ink-900/70 text-white backdrop-blur-sm'
                    : 'border-white/10 bg-ink-900/50 text-ink-100 backdrop-blur-sm hover:border-white/25',
                )}
              >
                {v}
              </div>
            ))}
          </div>
        </div>

        <aside className="flex flex-col gap-6">
          <div>
            <div className="eyebrow">{vehicle.brand} · {vehicle.year}</div>
            <h1 className="mt-2 font-display text-display-md font-semibold text-white">
              {vehicle.model}
            </h1>
            <p className="mt-4 text-sm text-ink-100 leading-relaxed">{vehicle.description}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Tag>{vehicle.bodyType.toUpperCase()}</Tag>
            <Tag>{vehicle.driveType}</Tag>
            <Tag tone="success">IN STOCK</Tag>
          </div>

          {/* Price card */}
          <div className="rounded-2xl border border-white/[0.06] bg-ink-800/80 p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs text-ink-200">Starting price</div>
                <div className="mt-1 font-display text-3xl font-semibold text-white">
                  {formatPrice(vehicle.price, vehicle.currency)}
                </div>
                <div className="mt-1 text-xs text-ink-200">
                  or ${monthly.toLocaleString()}/mo · 60 mo, 4.9% APR
                </div>
              </div>
              <button type="button" className="rounded-full border border-white/15 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/5">
                Finance
              </button>
            </div>

            <div className="mt-5 space-y-2.5">
              <Link
                href={`/configure/${vehicle.id}`}
                className="btn-primary w-full"
              >
                Customize Vehicle
                <ArrowRight className="h-4 w-4" />
              </Link>
              <div className="grid grid-cols-2 gap-2.5">
                <button type="button" className="btn-secondary w-full">Book Test Drive</button>
                <Link href="/compare" className="btn-secondary w-full">
                  <Plus className="h-4 w-4" />
                  Compare
                </Link>
              </div>
            </div>
          </div>

          {/* KPI tiles */}
          <div className="grid grid-cols-4 gap-2.5">
            {[
              { label: 'POWER', value: vehicle.horsepower, unit: 'HP' },
              { label: '0–100', value: vehicle.acceleration.toFixed(1), unit: 's' },
              { label: 'TOP', value: vehicle.topSpeed, unit: 'km/h' },
              { label: 'DRIVE', value: vehicle.driveType, unit: '' },
            ].map((k) => (
              <div
                key={k.label}
                className="rounded-xl border border-white/[0.06] bg-ink-700/60 p-3.5"
              >
                <div className="text-[9px] font-medium uppercase tracking-wider text-ink-300">
                  {k.label}
                </div>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="font-display text-xl font-semibold text-white">{k.value}</span>
                  {k.unit && <span className="text-[11px] text-ink-200">{k.unit}</span>}
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => toggleSaved(vehicle.id)}
            aria-pressed={hydrated ? saved : undefined}
            className="inline-flex items-center justify-center gap-2 text-sm text-ink-100 hover:text-white"
          >
            <Heart
              className={cn('h-4 w-4', hydrated && saved ? 'fill-white text-white' : 'text-ink-200')}
            />
            {hydrated && saved ? 'Saved to wishlist' : 'Save to wishlist'}
          </button>
        </aside>
      </div>

      {/* Tabs */}
      <div className="mt-16 border-b border-white/[0.06]">
        <div className="flex items-center gap-6">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                'relative pb-3 text-sm transition',
                tab === t
                  ? 'font-semibold text-white'
                  : 'font-medium text-ink-200 hover:text-white',
              )}
            >
              {t}
              {tab === t && (
                <span className="absolute inset-x-0 -bottom-px h-0.5 bg-white" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Overview content */}
      {tab === 'Overview' && (
        <div className="mt-10 grid gap-10 lg:grid-cols-[640px_1fr]">
          <div>
            <h2 className="font-display text-2xl font-semibold text-white">
              Why this {vehicle.model.split(' ')[0]}
            </h2>
            <ul className="mt-6 space-y-3.5">
              {vehicle.features.map((f) => (
                <li key={f} className="flex items-start gap-3.5">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10">
                    <Check className="h-3 w-3 text-white" />
                  </span>
                  <div>
                    <div className="text-sm font-medium text-white">{f}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-display text-2xl font-semibold text-white">At a glance</h2>
            <div className="mt-6 overflow-hidden rounded-2xl border border-white/[0.06] bg-ink-800/60">
              {[
                ['Brand', vehicle.brand],
                ['Model', vehicle.model],
                ['Year', String(vehicle.year)],
                ['Horsepower', `${vehicle.horsepower} HP`],
                ['Transmission', vehicle.transmission],
                ['Drive', vehicle.driveType],
                ['Fuel', vehicle.fuelType],
                ['0–100 km/h', `${vehicle.acceleration.toFixed(1)} seconds`],
                ['Top speed', `${vehicle.topSpeed} km/h`],
                vehicle.rangeKm ? ['Range', `${vehicle.rangeKm} km`] : null,
                ['Body type', vehicle.bodyType],
              ]
                .filter((row): row is [string, string] => row !== null)
                .map(([k, v], i) => (
                  <div
                    key={k}
                    className={cn(
                      'flex items-center justify-between px-5 py-3.5 text-sm',
                      i % 2 === 1 && 'bg-white/[0.015]',
                    )}
                  >
                    <span className="text-ink-100">{k}</span>
                    <span className="font-medium text-white">{v}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {tab !== 'Overview' && (
        <div className="mt-10 rounded-2xl border border-white/[0.06] bg-ink-800/40 p-10 text-center text-sm text-ink-200">
          {tab} content coming in Phase 2.
        </div>
      )}
    </section>
  );
}

function Tag({ children, tone }: { children: React.ReactNode; tone?: 'success' }) {
  return (
    <span
      className={cn(
        'rounded-full border px-2.5 py-1 text-[10px] font-medium tracking-wider',
        tone === 'success'
          ? 'border-emerald-500/40 bg-ink-700/60 text-emerald-400'
          : 'border-white/15 bg-ink-700/60 text-ink-100',
      )}
    >
      {children}
    </span>
  );
}
