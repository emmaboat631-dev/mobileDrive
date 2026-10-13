import Link from 'next/link';
import { ArrowRight, Plus, Edit3, Trash2, ShoppingBag } from 'lucide-react';
import { listVehicles, getHeroColor } from '@/lib/vehicles/data';
import { formatPrice } from '@/lib/utils/format';

export const metadata = { title: 'Builds — Account · mobileDrive' };

const SAVED_BUILDS = [
  { vehicleId: 'm4-competition', colorId: 'midnight-blue', wheelId: 'carbon',      interiorId: 'tan',   lastEdit: '2h ago',    label: 'Track-ready M4' },
  { vehicleId: 'tesla-model-s',  colorId: 'pearl-white',   wheelId: 'performance', interiorId: 'white', lastEdit: 'yesterday', label: 'Daily commuter' },
  { vehicleId: 'amg-gt',         colorId: 'obsidian-black', wheelId: 'luxury',     interiorId: 'black', lastEdit: '3 days ago', label: 'Weekend tourer' },
];

export default function AccountBuildsPage() {
  const resolved = SAVED_BUILDS.map((b) => {
    const v = listVehicles().find((x) => x.id === b.vehicleId)!;
    const color = v.availableColors.find((c) => c.id === b.colorId) ?? getHeroColor(v);
    const wheel = v.availableWheels.find((w) => w.id === b.wheelId)!;
    const interior = v.availableInteriors.find((i) => i.id === b.interiorId)!;
    const options = color.priceDelta + wheel.priceDelta + interior.priceDelta;
    return { ...b, v, color, wheel, interior, total: v.price + options, options };
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="eyebrow">Your garage</div>
          <h1 className="mt-2 font-display text-display-md font-semibold text-white">
            Saved builds
          </h1>
          <p className="mt-2 text-sm text-ink-200">
            {resolved.length} configurations · pick up where you left off
          </p>
        </div>
        <Link href="/vehicles" className="btn-primary">
          <Plus className="h-4 w-4" />
          Start a new build
        </Link>
      </header>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {resolved.map((b) => (
          <article
            key={b.vehicleId + b.colorId}
            className="overflow-hidden rounded-2xl border border-white/[0.06] bg-ink-800/60"
          >
            <div
              className="aspect-[16/9]"
              style={{
                background: `radial-gradient(60% 60% at 50% 50%, ${b.color.hex}cc, #0A0B0E 85%)`,
              }}
            >
              <svg viewBox="0 0 400 225" className="h-full w-full" aria-hidden>
                <ellipse cx="200" cy="200" rx="150" ry="10" fill="#000" opacity="0.5" />
                <path
                  d="M60,170 L95,115 Q150,90 200,88 Q250,90 305,115 L340,170 Q335,185 315,186 L305,186 Q301,174 288,174 Q275,174 271,186 L129,186 Q125,174 112,174 Q99,174 95,186 L85,186 Q65,185 60,170 Z"
                  fill={b.color.hex}
                />
                <path d="M135,115 Q175,96 200,94 Q225,96 265,115 L255,134 L145,134 Z" fill="#0A0C10" opacity="0.95" />
                <circle cx="112" cy="180" r="14" fill="#0A0B0E" stroke="#3A3F48" />
                <circle cx="288" cy="180" r="14" fill="#0A0B0E" stroke="#3A3F48" />
              </svg>
            </div>

            <div className="space-y-4 p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="eyebrow">{b.v.brand} · {b.v.year}</div>
                  <h2 className="mt-1 font-display text-lg font-semibold text-white">
                    {b.v.model}
                  </h2>
                  <div className="mt-0.5 text-[11px] italic text-ink-200">"{b.label}"</div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="font-display text-xl font-semibold text-white tabular-nums">
                    {formatPrice(b.total, b.v.currency)}
                  </div>
                  <div className="text-[11px] text-ink-200">
                    Options +{formatPrice(b.options, b.v.currency)}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                <span className="rounded-full border border-white/[0.08] bg-ink-700/60 px-2 py-0.5 text-[10px] text-ink-100">
                  {b.color.name}
                </span>
                <span className="rounded-full border border-white/[0.08] bg-ink-700/60 px-2 py-0.5 text-[10px] text-ink-100">
                  {b.wheel.name} wheels
                </span>
                <span className="rounded-full border border-white/[0.08] bg-ink-700/60 px-2 py-0.5 text-[10px] text-ink-100">
                  {b.interior.name}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-ink-200">
                <span>Last edit {b.lastEdit}</span>
              </div>

              <div className="flex gap-2">
                <Link href={`/configure/${b.v.id}`} className="btn-primary flex-1 text-xs">
                  <Edit3 className="h-3.5 w-3.5" />
                  Resume
                </Link>
                <Link href={`/configure/${b.v.id}`} className="btn-secondary flex-1 text-xs">
                  <ShoppingBag className="h-3.5 w-3.5" />
                  Add to cart
                </Link>
                <button
                  type="button"
                  aria-label="Delete build"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-red-400/30 text-red-300 hover:bg-red-500/10"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="rounded-2xl border border-dashed border-white/[0.08] p-6 text-sm text-ink-200">
        Tip — builds auto-save as you tweak the configurator. Sign in to sync them across devices.{' '}
        <Link href="/vehicles" className="text-white underline">
          Start a build <ArrowRight className="inline h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
