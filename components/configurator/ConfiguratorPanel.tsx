'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Vehicle } from '@/types/vehicle';
import { computeTotal, useConfigurator } from '@/store/configuratorStore';
import { useCart } from '@/store/cartStore';
import { useWishlist } from '@/store/wishlistStore';
import { toast } from '@/store/toastStore';
import { ColorPicker } from './ColorPicker';
import { OptionList } from './OptionList';
import { formatPrice, formatDelta } from '@/lib/utils/format';
import { Heart, ShoppingBag, Check } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export function ConfiguratorPanel({ vehicle }: { vehicle: Vehicle }) {
  const router = useRouter();
  const addFromConfiguration = useCart((s) => s.addFromConfiguration);
  const saved = useWishlist((s) => s.vehicleIds.includes(vehicle.id));
  const toggleSaved = useWishlist((s) => s.toggle);
  const wishlistHydrated = useWishlist((s) => s.hydrated);
  const [justAdded, setJustAdded] = useState(false);

  const {
    colorId,
    wheelId,
    interiorId,
    packageIds,
    initFromVehicle,
    setColor,
    setWheel,
    setInterior,
    togglePackage,
  } = useConfigurator();

  useEffect(() => {
    initFromVehicle(vehicle);
  }, [vehicle, initFromVehicle]);

  function handleAddToCart() {
    if (!colorId || !wheelId || !interiorId) return;
    addFromConfiguration({
      vehicleId: vehicle.id,
      colorId,
      wheelId,
      interiorId,
      packageIds,
    });
    setJustAdded(true);
    toast.success(`Added to cart`, `${vehicle.brand} ${vehicle.model}`, {
      action: { label: 'Open cart', href: '/cart' },
      duration: 3500,
    });
    window.setTimeout(() => router.push('/cart'), 650);
  }

  const totals = computeTotal(vehicle, { colorId, wheelId, interiorId, packageIds });

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/[0.06] px-6 py-5">
        <div className="eyebrow">{vehicle.brand}</div>
        <h2 className="mt-1 font-display text-2xl font-semibold text-white">
          {vehicle.model}
        </h2>
        <div className="mt-2 flex items-center gap-4 text-xs text-ink-200">
          <span>{vehicle.horsepower} HP</span>
          <span className="h-1 w-1 rounded-full bg-ink-400" />
          <span>{vehicle.acceleration.toFixed(1)}s · 0–100</span>
          <span className="h-1 w-1 rounded-full bg-ink-400" />
          <span>{vehicle.transmission}</span>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-7 overflow-y-auto px-6 py-6">
        <ColorPicker
          colors={vehicle.availableColors}
          selectedId={colorId}
          onSelect={setColor}
        />

        <OptionList
          title="Wheels"
          items={vehicle.availableWheels.map((w) => ({
            id: w.id,
            name: w.name,
            description: `${w.style[0].toUpperCase()}${w.style.slice(1)} forged`,
            priceDelta: w.priceDelta,
          }))}
          selectedId={wheelId}
          onSelect={setWheel}
        />

        <OptionList
          title="Interior"
          items={vehicle.availableInteriors.map((i) => ({
            id: i.id,
            name: i.name,
            priceDelta: i.priceDelta,
          }))}
          selectedId={interiorId}
          onSelect={setInterior}
        />

        <OptionList
          title="Packages"
          multi
          items={vehicle.availablePackages.map((p) => ({
            id: p.id,
            name: p.name,
            description: p.description,
            priceDelta: p.priceDelta,
          }))}
          selectedIds={packageIds}
          onSelect={togglePackage}
        />
      </div>

      <div className="border-t border-white/[0.06] bg-ink-800/60 px-6 py-5">
        <div className="space-y-1 text-sm">
          <Row label="Base vehicle" value={formatPrice(totals.base)} />
          <Row label="Options" value={formatDelta(totals.options)} muted={totals.options === 0} />
          <div className="my-3 h-px bg-white/[0.06]" />
          <div className="flex items-end justify-between">
            <div className="eyebrow">Total</div>
            <div className="font-display text-2xl font-semibold text-white">
              {formatPrice(totals.total)}
            </div>
          </div>
        </div>
        <div className="mt-5 flex items-center gap-2">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={justAdded}
            className="btn-primary flex-1"
          >
            {justAdded ? (
              <>
                <Check className="h-4 w-4" />
                Added — opening cart…
              </>
            ) : (
              <>
                <ShoppingBag className="h-4 w-4" />
                Add to Cart
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => toggleSaved(vehicle.id)}
            aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
            aria-pressed={wishlistHydrated ? saved : undefined}
            className="btn-secondary h-11 w-11 px-0"
          >
            <Heart
              className={cn(
                'h-4 w-4 transition',
                wishlistHydrated && saved ? 'fill-white text-white' : '',
              )}
            />
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-ink-200">{label}</span>
      <span className={muted ? 'text-ink-300' : 'text-ink-50'}>{value}</span>
    </div>
  );
}
