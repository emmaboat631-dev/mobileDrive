'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, ArrowUpRight } from 'lucide-react';
import type { Vehicle } from '@/types/vehicle';
import { getHeroColor } from '@/lib/vehicles/data';
import { formatPrice } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import { useWishlist } from '@/store/wishlistStore';

interface Props {
  vehicle: Vehicle;
}

export function VehicleCard({ vehicle }: Props) {
  const saved = useWishlist((s) => s.vehicleIds.includes(vehicle.id));
  const toggle = useWishlist((s) => s.toggle);
  const hydrated = useWishlist((s) => s.hydrated);
  const primaryColor = getHeroColor(vehicle).hex;

  return (
    <motion.article
      whileHover={{ y: -3 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-ink-800/60"
    >
      <Link href={`/vehicles/${vehicle.id}`} className="block" aria-label={`${vehicle.brand} ${vehicle.model}`}>
        <div className="relative aspect-[4/3] overflow-hidden">
          <SilhouettePreview colorHex={primaryColor} />
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink-900/80 to-transparent" />
          <div className="absolute left-4 top-4 flex items-center gap-2">
            <span className="rounded-full border border-white/15 bg-ink-900/70 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-ink-100 backdrop-blur">
              {vehicle.bodyType}
            </span>
          </div>
        </div>
      </Link>

      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          toggle(vehicle.id);
        }}
        aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
        aria-pressed={hydrated ? saved : undefined}
        className={cn(
          'absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-ink-900/60 backdrop-blur transition hover:bg-ink-900/90',
        )}
      >
        <Heart
          className={cn(
            'h-4 w-4 transition',
            hydrated && saved ? 'fill-white text-white' : 'text-ink-100',
          )}
        />
      </button>

      <div className="flex flex-1 flex-col gap-3 px-5 pb-5 pt-4">
        <div className="flex items-baseline justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate text-xs text-ink-200">{vehicle.brand} · {vehicle.year}</div>
            <h3 className="truncate font-display text-lg font-semibold text-white">
              {vehicle.model}
            </h3>
          </div>
          <div className="shrink-0 text-right">
            <div className="font-display text-base font-semibold text-white">
              {formatPrice(vehicle.price, vehicle.currency)}
            </div>
            <div className="text-[11px] text-ink-200">starting</div>
          </div>
        </div>

        <div className="mt-1 grid grid-cols-3 gap-2 border-t border-white/[0.06] pt-3 text-[11px] text-ink-200">
          <Stat label="HP" value={`${vehicle.horsepower}`} />
          <Stat label="0–100" value={`${vehicle.acceleration.toFixed(1)}s`} />
          <Stat label="Fuel" value={vehicle.fuelType} />
        </div>

        <Link
          href={`/vehicles/${vehicle.id}`}
          className="mt-2 inline-flex items-center justify-between rounded-full border border-white/10 bg-transparent px-4 py-2 text-sm font-medium text-white transition hover:border-white/30 hover:bg-white/5"
        >
          View vehicle
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </motion.article>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <div className="text-[10px] uppercase tracking-wider text-ink-300">{label}</div>
      <div className="mt-0.5 truncate text-xs text-ink-50">{value}</div>
    </div>
  );
}

/**
 * Lightweight CSS/SVG silhouette so marketplace cards never load a 3D model.
 * The actual 3D model loads only inside the viewer / configurator.
 */
function SilhouettePreview({ colorHex }: { colorHex: string }) {
  return (
    <div
      className="absolute inset-0"
      style={{
        background: `radial-gradient(80% 60% at 50% 55%, ${hexAlpha(colorHex, 0.9)}, #0A0B0E 85%)`,
      }}
    >
      <svg
        viewBox="0 0 400 300"
        className="absolute inset-x-0 bottom-0 h-full w-full"
        aria-hidden
      >
        <defs>
          <linearGradient id={`sheen-${colorHex}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.18" />
            <stop offset="55%" stopColor={colorHex} stopOpacity="1" />
            <stop offset="100%" stopColor="#000000" stopOpacity="1" />
          </linearGradient>
        </defs>
        {/* ground */}
        <ellipse cx="200" cy="245" rx="150" ry="12" fill="#000" opacity="0.55" />
        {/* body */}
        <path
          d="M60,210 L95,165 Q140,135 200,132 Q260,135 305,165 L340,210 Q335,230 310,232 L300,232 Q296,218 282,218 Q268,218 264,232 L136,232 Q132,218 118,218 Q104,218 100,232 L90,232 Q65,230 60,210 Z"
          fill={`url(#sheen-${colorHex})`}
        />
        {/* window */}
        <path
          d="M135,165 Q175,145 200,144 Q225,145 265,165 L255,180 L145,180 Z"
          fill="#0A0C10"
          opacity="0.9"
        />
        {/* wheels */}
        <circle cx="118" cy="226" r="20" fill="#0A0B0E" stroke="#2A2D33" strokeWidth="2" />
        <circle cx="118" cy="226" r="8" fill="#1A1D22" />
        <circle cx="282" cy="226" r="20" fill="#0A0B0E" stroke="#2A2D33" strokeWidth="2" />
        <circle cx="282" cy="226" r="8" fill="#1A1D22" />
      </svg>
    </div>
  );
}

function hexAlpha(hex: string, alpha: number) {
  const h = hex.replace('#', '');
  const bigint = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
