import Link from 'next/link';
import { listVehicles } from '@/lib/vehicles/data';
import type { BodyType } from '@/types/vehicle';

const ORDER: BodyType[] = ['Sports', 'Coupe', 'Sedan', 'SUV', 'Electric', 'Luxury', 'Pickup'];

/**
 * Category tiles sit under the hero and let visitors enter the marketplace
 * with a pre-applied body filter. Silhouettes mirror the body-type SVG paths
 * used in VehicleCard so the visual language stays coherent.
 */
export function ShopByCategory() {
  const all = listVehicles();
  const tiles = ORDER
    .map((body) => ({
      body,
      count: all.filter((v) => v.bodyType === body).length,
    }))
    .filter((t) => t.count > 0);

  return (
    <section className="container-page pb-16">
      <header className="mb-6 flex items-end justify-between">
        <div>
          <div className="eyebrow mb-2">Shop by category</div>
          <h2 className="font-display text-display-md font-semibold text-white">
            Pick the shape of your drive.
          </h2>
        </div>
        <Link href="/vehicles" className="hidden text-sm text-ink-100 hover:text-white md:inline">
          Browse all →
        </Link>
      </header>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
        {tiles.map(({ body, count }) => (
          <Link
            key={body}
            href={`/vehicles?body=${encodeURIComponent(body)}`}
            className="group relative flex aspect-[4/3] flex-col justify-between overflow-hidden rounded-xl border border-white/[0.06] bg-ink-800/60 p-4 transition hover:border-white/15"
          >
            <div className="relative z-10">
              <div className="text-sm font-medium text-white">{body}</div>
              <div className="text-[11px] text-ink-200">
                {count} {count === 1 ? 'vehicle' : 'vehicles'}
              </div>
            </div>
            <div className="relative z-10 self-end text-[10px] tracking-[0.14em] text-ink-300 opacity-0 transition group-hover:opacity-100">
              VIEW →
            </div>
            {/* Silhouette watermark */}
            <svg
              viewBox="0 0 400 300"
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 h-[60%] w-full opacity-[0.18]"
            >
              <path d={BODY_SILHOUETTES[body]} fill="#F0F3F7" />
            </svg>
          </Link>
        ))}
      </div>
    </section>
  );
}

/** Simplified silhouette paths — mirror those in VehicleCard but used as a watermark here. */
const BODY_SILHOUETTES: Record<BodyType, string> = {
  Coupe:    'M60,212 L95,168 Q140,140 200,138 Q260,140 305,168 L340,212 Q335,232 310,234 L90,234 Q65,232 60,212 Z',
  Sports:   'M55,218 L100,180 Q145,160 200,158 Q255,160 300,180 L345,218 Q340,234 315,234 L85,234 Q60,234 55,218 Z',
  Sedan:    'M50,210 L90,160 Q140,140 200,138 Q260,140 310,160 L350,210 Q345,232 320,234 L80,234 Q55,232 50,210 Z',
  Luxury:   'M45,210 L85,158 Q140,138 200,137 Q260,138 315,158 L355,210 Q350,232 325,234 L75,234 Q50,232 45,210 Z',
  SUV:      'M55,210 L80,145 Q130,128 200,126 Q270,128 320,145 L345,210 Q340,232 315,234 L85,234 Q60,232 55,210 Z',
  Pickup:   'M40,212 L75,160 Q115,142 165,140 Q195,142 205,166 L205,210 L360,210 L360,230 L70,236 Q45,232 40,212 Z',
  Electric: 'M50,212 L95,165 Q145,142 200,140 Q255,142 305,165 L350,212 Q345,232 320,234 L80,234 Q55,232 50,212 Z',
};
