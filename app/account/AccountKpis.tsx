'use client';

import { useCart } from '@/store/cartStore';
import { useWishlist } from '@/store/wishlistStore';
import { cn } from '@/lib/utils/cn';

/**
 * Dashboard KPI tiles — read the live wishlist and cart counts from Zustand.
 * Falls back to a stable placeholder before stores hydrate, so SSR and the
 * first client render match.
 */
export function AccountKpis() {
  const wishlistCount = useWishlist((s) => s.vehicleIds.length);
  const wishlistHydrated = useWishlist((s) => s.hydrated);
  const cartCount = useCart((s) => s.items.length);
  const cartHydrated = useCart((s) => s.hydrated);

  const tiles = [
    { label: 'ACTIVE BUILDS', value: '0', hint: 'None saved yet', color: 'text-white' },
    {
      label: 'WISHLIST',
      value: wishlistHydrated ? String(wishlistCount) : '—',
      hint: 'Vehicles saved',
      color: 'text-white',
    },
    { label: 'ORDERS', value: '0', hint: 'No orders yet', color: 'text-white' },
    { label: 'CART',   value: cartHydrated ? String(cartCount) : '—', hint: 'Ready to checkout', color: 'text-white' },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {tiles.map((k) => (
        <div
          key={k.label}
          className="rounded-2xl border border-white/[0.06] bg-ink-800/60 p-5"
        >
          <div className="eyebrow">{k.label}</div>
          <div className={cn('mt-1 font-display text-3xl font-semibold -tracking-[0.025em]', k.color)}>
            {k.value}
          </div>
          <div className="mt-0.5 text-[11px] text-ink-200">{k.hint}</div>
        </div>
      ))}
    </div>
  );
}
