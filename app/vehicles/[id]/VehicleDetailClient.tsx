'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { ChevronRight, Heart, Plus, ArrowRight, Check, Lightbulb } from 'lucide-react';
import type { Vehicle } from '@/types/vehicle';
import { getHeroColor } from '@/lib/vehicles/data';
import { formatPrice } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import { useWishlist } from '@/store/wishlistStore';
import type { CameraPreset } from '@/store/configuratorStore';
import { Tag } from '@/components/ui';

import { ViewerLoading } from '@/components/3d/ViewerLoading';

const CarViewer = dynamic(
  () => import('@/components/3d/CarViewer').then((m) => m.CarViewer),
  { ssr: false, loading: () => <ViewerLoading /> },
);

const TABS = ['Overview', 'Specifications', 'Features', 'Interior', 'Reviews'] as const;

export function VehicleDetailClient({ vehicle }: { vehicle: Vehicle }) {
  const [tab, setTab] = useState<(typeof TABS)[number]>('Overview');
  const saved = useWishlist((s) => s.vehicleIds.includes(vehicle.id));
  const toggleSaved = useWishlist((s) => s.toggle);
  const hydrated = useWishlist((s) => s.hydrated);
  const defaultColor = getHeroColor(vehicle);
  const defaultWheel = vehicle.availableWheels[0];
  const [selectedColorId, setSelectedColorId] = useState(defaultColor.id);
  const [preset, setPreset] = useState<CameraPreset>('orbit');
  const [headlightsOn, setHeadlightsOn] = useState(false);
  const activeColor =
    vehicle.availableColors.find((c) => c.id === selectedColorId) ?? defaultColor;

  // Build gallery: hero first, then any extra angles from vehicle.images.
  const galleryImages: string[] = [
    ...(vehicle.heroImageUrl ? [vehicle.heroImageUrl] : []),
    ...vehicle.images.filter((u) => u !== vehicle.heroImageUrl),
  ];
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const activeImage = galleryImages[activeImageIdx] ?? vehicle.heroImageUrl;
  const hasGallery = galleryImages.length > 1;
  // When a vehicle has a 3D model, we start in 3D view and let the 360° button
  // or any image thumbnail toggle between model and photo.
  const [view3D, setView3D] = useState<boolean>(Boolean(vehicle.modelPath));
  const show3D = view3D && Boolean(vehicle.modelPath);

  const VIEW_PRESETS: { label: string; preset: CameraPreset }[] = [
    { label: '360°',      preset: 'orbit' },
    { label: 'Front',     preset: 'front' },
    { label: 'Side',      preset: 'side' },
    { label: 'Interior',  preset: 'interior' },
  ];

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
        <div
          className="relative aspect-[4/3] md:aspect-auto md:h-[560px] overflow-hidden rounded-3xl border border-white/[0.06] bg-ink-800/40"
          style={
            !show3D && activeImage
              ? { background: 'radial-gradient(120% 70% at 50% 35%, #1A1C21 0%, #0E0F13 55%, #07080A 100%)' }
              : undefined
          }
        >
          {/* CarViewer stays mounted so switching to a photo and back doesn't
              reload the GLB — we just hide it with visibility. The photo
              overlays on top when image mode is active. */}
          {vehicle.modelPath && (
            <div
              aria-hidden={!show3D}
              className="absolute inset-0"
              style={{
                visibility: show3D ? 'visible' : 'hidden',
                pointerEvents: show3D ? 'auto' : 'none',
              }}
            >
              <CarViewer
                modelPath={vehicle.modelPath}
                bodyType={vehicle.bodyType}
                bodyHex={activeColor.hex}
                bodyFinish={activeColor.finish}
                wheelStyle={defaultWheel.style}
                headlightsOn={headlightsOn}
                autoRotate={preset === 'orbit'}
                cameraPreset={preset}
                interactive
                showFullscreen
                className="absolute inset-0"
              />
            </div>
          )}
          {!show3D && activeImage && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeImage}
                alt={`${vehicle.brand} ${vehicle.model}`}
                className="absolute inset-x-0 bottom-[10%] top-[10%] mx-auto h-[80%] w-full object-contain"
              />
              <div
                className="pointer-events-none absolute left-1/2 bottom-[14%] h-5 w-[60%] -translate-x-1/2 rounded-[50%] opacity-70 blur-lg"
                style={{ background: 'rgba(0,0,0,0.7)' }}
                aria-hidden
              />
            </>
          )}
          {!vehicle.modelPath && (
            <CarViewer
              bodyType={vehicle.bodyType}
              bodyHex={activeColor.hex}
              bodyFinish={activeColor.finish}
              wheelStyle={defaultWheel.style}
              headlightsOn={headlightsOn}
              autoRotate={preset === 'orbit'}
              cameraPreset={preset}
              interactive
              showFullscreen
              className="absolute inset-0"
            />
          )}
          {/* Headlights button — only relevant in 3D mode */}
          {show3D && (
            <button
              type="button"
              onClick={() => setHeadlightsOn((v) => !v)}
              aria-pressed={headlightsOn}
              aria-label="Toggle headlights"
              className={cn(
                'pointer-events-auto absolute right-5 bottom-24 z-20 flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur-sm transition',
                headlightsOn
                  ? 'border-white bg-white text-ink-900'
                  : 'border-white/10 bg-ink-900/50 text-ink-100 hover:border-white/25',
              )}
            >
              <Lightbulb className="h-4 w-4" />
            </button>
          )}
          {(hasGallery || vehicle.modelPath) && (
            <div className="pointer-events-auto absolute inset-x-0 bottom-0 z-10 flex items-center justify-start gap-2 overflow-x-auto bg-gradient-to-t from-ink-900/80 to-transparent p-3 md:justify-center">
              {vehicle.modelPath && (
                <button
                  type="button"
                  onClick={() => setView3D(true)}
                  aria-label="Show 3D model"
                  aria-pressed={show3D}
                  className={cn(
                    'relative flex h-12 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border text-[11px] font-medium transition md:h-14 md:w-20',
                    show3D ? 'border-white bg-white/10 text-white ring-1 ring-white/60' : 'border-white/15 bg-ink-900/60 text-ink-100 opacity-80 hover:opacity-100',
                  )}
                >
                  360°
                </button>
              )}
              {galleryImages.map((url, i) => (
                <button
                  key={url + i}
                  type="button"
                  onClick={() => { setActiveImageIdx(i); setView3D(false); }}
                  aria-label={`Show image ${i + 1}`}
                  aria-pressed={!show3D && i === activeImageIdx}
                  className={cn(
                    'relative h-12 w-16 shrink-0 overflow-hidden rounded-lg border transition md:h-14 md:w-20',
                    !show3D && i === activeImageIdx ? 'border-white ring-1 ring-white/60' : 'border-white/15 opacity-60 hover:opacity-100',
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="absolute inset-0 h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
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

          {/* Paint swatches — procedural materials support any hex/finish */}
          <div>
            <div className="eyebrow mb-2.5">Paint · {activeColor.name}</div>
            <div className="flex flex-wrap gap-2">
              {vehicle.availableColors.map((c) => {
                const active = c.id === selectedColorId;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedColorId(c.id)}
                    aria-label={c.name}
                    aria-pressed={active}
                    title={c.name}
                    className={cn(
                      'h-8 w-8 rounded-full border-2 transition',
                      active ? 'border-white' : 'border-white/15 hover:border-white/40',
                    )}
                    style={{ backgroundColor: c.hex }}
                  />
                );
              })}
            </div>
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
                <Link href={`/test-drive/${vehicle.id}`} className="btn-secondary w-full whitespace-nowrap">
                  Test Drive
                </Link>
                <Link href={`/compare?v=${vehicle.id}`} className="btn-secondary w-full">
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

      {tab === 'Specifications' && (
        <div className="mt-10 grid gap-10 lg:grid-cols-2">
          <SpecGroup
            title="Performance"
            rows={[
              ['Horsepower', `${vehicle.horsepower} HP`],
              ['0–100 km/h', `${vehicle.acceleration.toFixed(1)} s`],
              ['Top speed', `${vehicle.topSpeed} km/h`],
              ['Power-to-weight', `~${Math.round(vehicle.horsepower / 1.5)} HP/t`],
            ]}
          />
          <SpecGroup
            title="Drivetrain"
            rows={[
              ['Fuel', vehicle.fuelType],
              ['Transmission', vehicle.transmission],
              ['Drive type', vehicle.driveType],
              vehicle.rangeKm ? ['Electric range', `${vehicle.rangeKm} km`] : null,
            ]}
          />
          <SpecGroup
            title="Build options"
            rows={[
              ['Paint finishes', String(vehicle.availableColors.length)],
              ['Wheel designs', String(vehicle.availableWheels.length)],
              ['Interior trims', String(vehicle.availableInteriors.length)],
              ['Available packages', String(vehicle.availablePackages.length)],
            ]}
          />
          <SpecGroup
            title="Classification"
            rows={[
              ['Body type', vehicle.bodyType],
              ['Model year', String(vehicle.year)],
              ['Starting price', formatPrice(vehicle.price, vehicle.currency)],
              ['Warranty', '3-year factory'],
            ]}
          />
        </div>
      )}

      {tab === 'Features' && (
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <section>
            <h2 className="font-display text-2xl font-semibold text-white">Standard</h2>
            <ul className="mt-6 divide-y divide-white/[0.06] rounded-2xl border border-white/[0.06] bg-ink-800/60">
              {vehicle.features.map((f) => (
                <li key={f} className="flex items-center gap-3 px-5 py-3.5 text-sm text-white">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10">
                    <Check className="h-3 w-3 text-white" />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h2 className="font-display text-2xl font-semibold text-white">Available packages</h2>
            <ul className="mt-6 space-y-3">
              {vehicle.availablePackages.map((p) => (
                <li
                  key={p.id}
                  className="rounded-2xl border border-white/[0.06] bg-ink-800/60 p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-white">{p.name}</div>
                      <div className="mt-1 text-xs text-ink-200">{p.description}</div>
                    </div>
                    <div className="shrink-0 font-display text-sm font-semibold text-white">
                      +{formatPrice(p.priceDelta, vehicle.currency)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}

      {tab === 'Interior' && (
        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <h2 className="font-display text-2xl font-semibold text-white">Trim options</h2>
            <p className="mt-3 max-w-md text-sm text-ink-200">
              {vehicle.availableInteriors.length} interior {vehicle.availableInteriors.length === 1 ? 'trim is' : 'trims are'} available.
              Select one in the configurator to see materials and stitching in context.
            </p>
            <Link
              href={`/configure/${vehicle.id}`}
              className="mt-6 inline-flex items-center gap-2 text-sm text-ink-100 hover:text-white"
            >
              Open the configurator
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-2">
            {vehicle.availableInteriors.map((i) => (
              <li
                key={i.id}
                className="overflow-hidden rounded-2xl border border-white/[0.06] bg-ink-800/60"
              >
                <div
                  className="h-28 w-full"
                  style={{
                    background: `linear-gradient(135deg, ${i.seatHex} 55%, ${i.trimHex} 55%)`,
                  }}
                  aria-hidden
                />
                <div className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="text-sm font-medium text-white">{i.name}</div>
                  <div className="text-xs text-ink-200">
                    {i.priceDelta === 0 ? 'Included' : `+${formatPrice(i.priceDelta, vehicle.currency)}`}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tab === 'Reviews' && (
        <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-white/[0.06] bg-ink-800/40 px-6 py-14 text-center">
          <div className="font-display text-lg font-semibold text-white">
            Reviews land with real buyers.
          </div>
          <p className="mt-2 max-w-md text-sm text-ink-200">
            When owner reviews and dealership ratings go live, they will appear here with
            an aggregate score, verified-buyer badge and filterable sentiment.
          </p>
        </div>
      )}
    </section>
  );
}

function SpecGroup({ title, rows }: { title: string; rows: ([string, string] | null)[] }) {
  const clean = rows.filter((r): r is [string, string] => r !== null);
  return (
    <section>
      <h2 className="font-display text-2xl font-semibold text-white">{title}</h2>
      <div className="mt-6 overflow-hidden rounded-2xl border border-white/[0.06] bg-ink-800/60">
        {clean.map(([k, v], i) => (
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
    </section>
  );
}

