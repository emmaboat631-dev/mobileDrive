import Link from 'next/link';
import { listVehicles } from '@/lib/vehicles/data';
import { VehicleCard } from '@/components/vehicles/VehicleCard';
import { ArrowRight } from 'lucide-react';

/**
 * Three editorially-chosen vehicles with numeric index chrome. The composition
 * is intentionally asymmetric to avoid a flat four-up card grid.
 */
export function FeaturedRail() {
  const picks = listVehicles().slice(0, 3);

  return (
    <section className="container-page py-20">
      <header className="mb-10 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <div className="eyebrow mb-2">The editorial</div>
          <h2 className="font-display text-display-md font-semibold text-white">
            Three vehicles<br className="hidden md:block" /> worth your attention.
          </h2>
        </div>
        <Link
          href="/vehicles"
          className="inline-flex items-center gap-2 self-end text-sm text-ink-100 hover:text-white"
        >
          See the full catalogue
          <ArrowRight className="h-4 w-4" />
        </Link>
      </header>

      <ol className="grid gap-6 lg:grid-cols-3">
        {picks.map((v, i) => (
          <li key={v.id} className="relative">
            {/* Oversized index number */}
            <div
              aria-hidden
              className="pointer-events-none absolute -left-1 -top-6 select-none font-display text-[80px] font-semibold leading-none tracking-[-0.04em] text-white/[0.06]"
            >
              {String(i + 1).padStart(2, '0')}
            </div>
            <div className="relative z-10">
              <VehicleCard vehicle={v} />
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
