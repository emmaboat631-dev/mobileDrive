'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, ArrowUpRight } from 'lucide-react';
import type { Vehicle, BodyType } from '@/types/vehicle';
import { getHeroColor } from '@/lib/vehicles/data';
import { formatPrice } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import { useWishlist } from '@/store/wishlistStore';

interface Props {
  vehicle: Vehicle;
  layout?: 'grid' | 'list';
}

export function VehicleCard({ vehicle, layout = 'grid' }: Props) {
  const saved = useWishlist((s) => s.vehicleIds.includes(vehicle.id));
  const toggle = useWishlist((s) => s.toggle);
  const hydrated = useWishlist((s) => s.hydrated);
  const primaryColor = getHeroColor(vehicle).hex;

  if (layout === 'list') {
    return (
      <motion.article
        whileHover={{ y: -1 }}
        transition={{ duration: 0.25 }}
        className="group relative grid grid-cols-[180px_1fr_auto] items-center gap-5 overflow-hidden rounded-2xl border border-white/[0.06] bg-ink-800/60 p-3 pr-5 md:grid-cols-[220px_1fr_auto]"
      >
        <Link
          href={`/vehicles/${vehicle.id}`}
          className="relative aspect-[4/3] overflow-hidden rounded-xl"
          aria-label={`${vehicle.brand} ${vehicle.model}`}
        >
          <SilhouettePreview colorHex={primaryColor} bodyType={vehicle.bodyType} />
        </Link>

        <div className="min-w-0">
          <div className="truncate text-xs text-ink-200">{vehicle.brand} · {vehicle.year} · {vehicle.bodyType}</div>
          <Link href={`/vehicles/${vehicle.id}`} className="truncate font-display text-lg font-semibold text-white hover:underline">
            {vehicle.model}
          </Link>
          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[11px] text-ink-200">
            <span><span className="text-white">{vehicle.horsepower}</span> HP</span>
            <span><span className="text-white">{vehicle.acceleration.toFixed(1)}s</span> 0–100</span>
            <span><span className="text-white">{vehicle.topSpeed}</span> km/h top</span>
            <span><span className="text-white">{vehicle.fuelType}</span></span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="font-display text-base font-semibold text-white">
              {formatPrice(vehicle.price, vehicle.currency)}
            </div>
            <div className="text-[11px] text-ink-200">starting</div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              toggle(vehicle.id);
            }}
            aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
            aria-pressed={hydrated ? saved : undefined}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-ink-900/60 transition hover:bg-ink-900/90"
          >
            <Heart className={cn('h-4 w-4', hydrated && saved ? 'fill-white text-white' : 'text-ink-100')} />
          </button>
        </div>
      </motion.article>
    );
  }

  return (
    <motion.article
      whileHover={{ y: -3 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-ink-800/60"
    >
      <Link href={`/vehicles/${vehicle.id}`} className="block" aria-label={`${vehicle.brand} ${vehicle.model}`}>
        <div className="relative aspect-[4/3] overflow-hidden">
          <SilhouettePreview colorHex={primaryColor} bodyType={vehicle.bodyType} />
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
 * SVG paths vary by bodyType to give each card a distinct silhouette.
 */
function SilhouettePreview({ colorHex, bodyType }: { colorHex: string; bodyType: BodyType }) {
  const gradientId = `sheen-${bodyType}-${colorHex.replace('#', '')}`;
  const paths = SILHOUETTE_PATHS[bodyType] ?? SILHOUETTE_PATHS.Coupe;

  return (
    <div
      className="absolute inset-0"
      style={{
        background: `radial-gradient(80% 60% at 50% 55%, ${hexAlpha(colorHex, 0.9)}, #0A0B0E 85%)`,
      }}
    >
      <svg viewBox="0 0 400 300" className="absolute inset-x-0 bottom-0 h-full w-full" aria-hidden>
        <defs>
          <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.18" />
            <stop offset="55%" stopColor={colorHex} stopOpacity="1" />
            <stop offset="100%" stopColor="#000000" stopOpacity="1" />
          </linearGradient>
        </defs>
        {/* ground */}
        <ellipse cx="200" cy="248" rx="150" ry="12" fill="#000" opacity="0.55" />
        {/* body */}
        <path d={paths.body} fill={`url(#${gradientId})`} />
        {/* window */}
        <path d={paths.window} fill="#0A0C10" opacity="0.92" />
        {/* wheels */}
        <circle cx={paths.frontWheelX} cy="228" r="20" fill="#0A0B0E" stroke="#2A2D33" strokeWidth="2" />
        <circle cx={paths.frontWheelX} cy="228" r="8" fill="#1A1D22" />
        <circle cx={paths.rearWheelX} cy="228" r="20" fill="#0A0B0E" stroke="#2A2D33" strokeWidth="2" />
        <circle cx={paths.rearWheelX} cy="228" r="8" fill="#1A1D22" />
      </svg>
    </div>
  );
}

type Silhouette = { body: string; window: string; frontWheelX: number; rearWheelX: number };

/** SVG paths per bodyType. Coordinate system: 400x300, ground line ~230. */
const SILHOUETTE_PATHS: Record<BodyType, Silhouette> = {
  Coupe: {
    body: 'M60,212 L95,168 Q140,140 200,138 Q260,140 305,168 L340,212 Q335,232 310,234 L300,234 Q296,220 282,220 Q268,220 264,234 L136,234 Q132,220 118,220 Q104,220 100,234 L90,234 Q65,232 60,212 Z',
    window: 'M135,168 Q175,148 200,147 Q225,148 265,168 L255,183 L145,183 Z',
    frontWheelX: 282,
    rearWheelX: 118,
  },
  Sports: {
    body: 'M55,218 L100,180 Q145,160 200,158 Q255,160 300,180 L345,218 Q340,234 315,234 L300,234 Q296,222 282,222 Q268,222 264,234 L136,234 Q132,222 118,222 Q104,222 100,234 L85,234 Q60,234 55,218 Z',
    window: 'M140,180 Q175,164 200,163 Q225,164 260,180 L250,193 L150,193 Z',
    frontWheelX: 282,
    rearWheelX: 118,
  },
  Sedan: {
    body: 'M50,210 L90,160 Q140,140 200,138 Q260,140 310,160 L350,210 Q345,232 320,234 L305,234 Q301,220 287,220 Q273,220 269,234 L131,234 Q127,220 113,220 Q99,220 95,234 L80,234 Q55,232 50,210 Z',
    window: 'M130,160 Q175,144 200,143 Q225,144 270,160 L260,180 L140,180 Z',
    frontWheelX: 287,
    rearWheelX: 113,
  },
  Luxury: {
    body: 'M45,210 L85,158 Q140,138 200,137 Q260,138 315,158 L355,210 Q350,232 325,234 L305,234 Q301,220 287,220 Q273,220 269,234 L131,234 Q127,220 113,220 Q99,220 95,234 L75,234 Q50,232 45,210 Z',
    window: 'M125,158 Q175,142 200,141 Q225,142 275,158 L265,180 L135,180 Z',
    frontWheelX: 290,
    rearWheelX: 110,
  },
  SUV: {
    body: 'M55,210 L80,145 Q130,128 200,126 Q270,128 320,145 L345,210 Q340,232 315,234 L300,234 Q296,220 282,220 Q268,220 264,234 L136,234 Q132,220 118,220 Q104,220 100,234 L85,234 Q60,232 55,210 Z',
    window: 'M110,148 Q165,133 200,132 Q235,133 290,148 L280,182 L120,182 Z',
    frontWheelX: 285,
    rearWheelX: 115,
  },
  Pickup: {
    body: 'M40,212 L75,160 Q115,142 165,140 Q195,142 205,166 L205,210 L360,210 L360,230 Q355,236 335,236 L310,236 Q306,222 292,222 Q278,222 274,236 L130,236 Q126,222 112,222 Q98,222 94,236 L70,236 Q45,232 40,212 Z',
    window: 'M105,162 Q140,146 170,145 Q200,146 200,170 L200,185 L115,185 Z',
    frontWheelX: 292,
    rearWheelX: 112,
  },
  Electric: {
    // Treat Electric as a low-slung aerodynamic sedan.
    body: 'M50,212 L95,165 Q145,142 200,140 Q255,142 305,165 L350,212 Q345,232 320,234 L300,234 Q296,220 282,220 Q268,220 264,234 L136,234 Q132,220 118,220 Q104,220 100,234 L80,234 Q55,232 50,212 Z',
    window: 'M135,165 Q175,149 200,148 Q225,149 265,165 L255,182 L145,182 Z',
    frontWheelX: 285,
    rearWheelX: 115,
  },
};

function hexAlpha(hex: string, alpha: number) {
  const h = hex.replace('#', '');
  const bigint = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
