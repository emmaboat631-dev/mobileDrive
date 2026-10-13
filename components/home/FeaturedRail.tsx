import Link from 'next/link';
import { listVehicles } from '@/lib/vehicles/data';
import { VehicleCard } from '@/components/vehicles/VehicleCard';
import { ArrowRight } from 'lucide-react';

export function FeaturedRail() {
  const vehicles = listVehicles().slice(0, 4);
  return (
    <section className="container-page py-20">
      <div className="flex items-end justify-between">
        <div>
          <div className="eyebrow mb-2">Featured</div>
          <h2 className="font-display text-display-md font-semibold text-white">
            Hand-picked for you.
          </h2>
        </div>
        <Link
          href="/vehicles"
          className="hidden items-center gap-2 text-sm text-ink-100 hover:text-white sm:inline-flex"
        >
          View all
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {vehicles.map((v) => (
          <VehicleCard key={v.id} vehicle={v} />
        ))}
      </div>
    </section>
  );
}
