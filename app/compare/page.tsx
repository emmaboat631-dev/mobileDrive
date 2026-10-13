import Link from 'next/link';
import { ArrowRight, X } from 'lucide-react';
import { getVehicleById, getHeroColor } from '@/lib/vehicles/data';
import { formatPrice } from '@/lib/utils/format';

export const metadata = { title: 'Compare — mobileDrive' };

const DEFAULT_IDS = ['m4-competition', 'porsche-911', 'tesla-model-s'] as const;

const ROWS: Array<[string, (v: ReturnType<typeof getVehicleById>) => string]> = [
  ['Power', (v) => `${v!.horsepower} HP`],
  ['0–100 km/h', (v) => `${v!.acceleration.toFixed(1)}s`],
  ['Top speed', (v) => `${v!.topSpeed} km/h`],
  ['Fuel', (v) => v!.fuelType],
  ['Transmission', (v) => v!.transmission],
  ['Drive', (v) => v!.driveType],
  ['Body', (v) => v!.bodyType],
  ['Range', (v) => (v!.rangeKm ? `${v!.rangeKm} km` : '—')],
  ['Year', (v) => String(v!.year)],
];

export default function ComparePage() {
  const vehicles = DEFAULT_IDS.map((id) => getVehicleById(id)!).filter(Boolean);

  return (
    <section className="container-page pb-20 pt-28">
      <div className="mb-10">
        <div className="eyebrow mb-2">Compare</div>
        <h1 className="font-display text-display-lg font-semibold text-white">
          Side-by-side, in detail.
        </h1>
        <p className="mt-3 max-w-xl text-ink-200">
          Compare up to 3 vehicles across price, performance, dimensions and features.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {vehicles.map((v) => (
          <article
            key={v.id}
            className="flex flex-col overflow-hidden rounded-3xl border border-white/[0.06] bg-ink-800/60"
          >
            {/* Visual */}
            <div
              className="relative h-56"
              style={{
                background: `radial-gradient(60% 50% at 50% 50%, ${getHeroColor(v).hex}cc, #0A0B0E 85%)`,
              }}
            >
              <SilhouetteSvg colorHex={getHeroColor(v).hex} />
            </div>

            {/* Header */}
            <div className="px-6 py-5">
              <div className="eyebrow">{v.brand} · {v.year}</div>
              <h2 className="mt-1 font-display text-2xl font-semibold text-white">
                {v.model}
              </h2>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="font-display text-xl font-semibold text-white">
                  {formatPrice(v.price, v.currency)}
                </span>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-full border border-white/15 px-2.5 py-1 text-[11px] font-medium text-ink-100 hover:text-white"
                >
                  <X className="h-3 w-3" />
                  Remove
                </button>
              </div>
            </div>

            {/* Spec rows */}
            <div className="border-t border-white/[0.06]">
              {ROWS.map(([label, read], i) => (
                <div
                  key={label}
                  className={
                    'flex items-center justify-between px-6 py-3.5 text-sm ' +
                    (i % 2 === 1 ? 'bg-white/[0.015]' : '')
                  }
                >
                  <span className="text-ink-200">{label}</span>
                  <span className="font-medium text-white">{read(v)}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-auto border-t border-white/[0.06] px-6 py-5">
              <Link
                href={`/configure/${v.id}`}
                className="btn-primary w-full"
              >
                Configure
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </article>
        ))}
      </div>

      <p className="mt-10 text-xs text-ink-300">
        Demo comparison. Add real vehicles via the Add to Compare action on any vehicle detail page.
      </p>
    </section>
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
      <path
        d="M140,120 Q175,105 200,104 Q225,105 260,120 L252,132 L148,132 Z"
        fill="#0A0C10"
        opacity="0.9"
      />
      <circle cx="122" cy="175" r="16" fill="#0A0B0E" stroke="#2A2D33" strokeWidth="1.5" />
      <circle cx="122" cy="175" r="6" fill="#1A1D22" />
      <circle cx="278" cy="175" r="16" fill="#0A0B0E" stroke="#2A2D33" strokeWidth="1.5" />
      <circle cx="278" cy="175" r="6" fill="#1A1D22" />
    </svg>
  );
}
