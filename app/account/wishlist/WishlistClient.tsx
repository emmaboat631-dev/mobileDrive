'use client';

import Link from 'next/link';
import { Heart, ArrowRight, Trash2, ShoppingBag } from 'lucide-react';
import { useWishlist } from '@/store/wishlistStore';
import { getVehicleById, getHeroColor } from '@/lib/vehicles/data';
import { formatPrice } from '@/lib/utils/format';

export function WishlistClient() {
  const ids = useWishlist((s) => s.vehicleIds);
  const hydrated = useWishlist((s) => s.hydrated);
  const remove = useWishlist((s) => s.remove);
  const clear = useWishlist((s) => s.clear);

  if (!hydrated) {
    return (
      <div className="space-y-6">
        <Header count={0} hydrated={false} />
        <div className="h-40 animate-pulse rounded-2xl border border-white/[0.06] bg-ink-800/40" />
      </div>
    );
  }

  const vehicles = ids
    .map((id) => getVehicleById(id))
    .filter((v): v is NonNullable<typeof v> => v !== undefined);

  if (vehicles.length === 0) {
    return (
      <div className="space-y-6">
        <Header count={0} hydrated={true} />
        <div className="rounded-2xl border border-white/[0.06] bg-ink-800/40 p-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/10">
            <Heart className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-5 font-display text-xl font-semibold text-white">
            No vehicles saved yet
          </h2>
          <p className="mt-2 text-sm text-ink-200">
            Tap the heart on any vehicle to add it to your wishlist.
          </p>
          <Link href="/vehicles" className="btn-primary mt-6">
            Browse vehicles
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Header count={vehicles.length} hydrated={true} onClear={clear} />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {vehicles.map((v) => {
          const color = getHeroColor(v);
          return (
            <article
              key={v.id}
              className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-ink-800/60"
            >
              <Link
                href={`/vehicles/${v.id}`}
                className="block"
                aria-label={`${v.brand} ${v.model}`}
              >
                <div
                  className="relative aspect-[4/3]"
                  style={{
                    background: `radial-gradient(60% 50% at 50% 50%, ${color.hex}cc, #0A0B0E 85%)`,
                  }}
                >
                  <svg viewBox="0 0 400 300" className="absolute inset-x-0 bottom-0 h-full w-full" aria-hidden>
                    <ellipse cx="200" cy="245" rx="150" ry="12" fill="#000" opacity="0.55" />
                    <path
                      d="M60,210 L95,165 Q140,135 200,132 Q260,135 305,165 L340,210 Q335,230 310,232 L300,232 Q296,218 282,218 Q268,218 264,232 L136,232 Q132,218 118,218 Q104,218 100,232 L90,232 Q65,230 60,210 Z"
                      fill={color.hex}
                    />
                    <path d="M135,165 Q175,145 200,144 Q225,145 265,165 L255,180 L145,180 Z" fill="#0A0C10" opacity="0.9" />
                    <circle cx="118" cy="226" r="20" fill="#0A0B0E" stroke="#2A2D33" />
                    <circle cx="118" cy="226" r="8" fill="#1A1D22" />
                    <circle cx="282" cy="226" r="20" fill="#0A0B0E" stroke="#2A2D33" />
                    <circle cx="282" cy="226" r="8" fill="#1A1D22" />
                  </svg>
                </div>
              </Link>

              <button
                type="button"
                onClick={() => remove(v.id)}
                aria-label={`Remove ${v.model} from wishlist`}
                className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-ink-900/60 text-white backdrop-blur transition hover:bg-ink-900/90"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>

              <div className="flex flex-col gap-3 px-5 pb-5 pt-4">
                <div className="flex items-baseline justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-xs text-ink-200">{v.brand} · {v.year}</div>
                    <h3 className="truncate font-display text-lg font-semibold text-white">
                      {v.model}
                    </h3>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="font-display text-base font-semibold text-white">
                      {formatPrice(v.price, v.currency)}
                    </div>
                    <div className="text-[11px] text-ink-200">starting</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/configure/${v.id}`}
                    className="btn-primary flex-1 text-xs"
                  >
                    <ShoppingBag className="h-3.5 w-3.5" />
                    Configure
                  </Link>
                  <Link
                    href={`/vehicles/${v.id}`}
                    className="btn-secondary flex-1 text-xs"
                  >
                    Details
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function Header({
  count,
  hydrated,
  onClear,
}: {
  count: number;
  hydrated: boolean;
  onClear?: () => void;
}) {
  return (
    <header className="flex items-end justify-between gap-4">
      <div>
        <div className="eyebrow">Your wishlist</div>
        <h1 className="mt-2 font-display text-display-md font-semibold text-white">
          Saved for later
        </h1>
        {hydrated && (
          <p className="mt-2 text-sm text-ink-200">
            {count} vehicle{count === 1 ? '' : 's'} saved
          </p>
        )}
      </div>
      {onClear && count > 0 && (
        <button
          type="button"
          onClick={onClear}
          className="btn-secondary"
        >
          Clear all
        </button>
      )}
    </header>
  );
}
