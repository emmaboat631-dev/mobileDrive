import { listVehiclesWithHeroes } from '@/lib/vehicles/server-data';
import { MarketplaceClient } from '@/components/vehicles/MarketplaceClient';

export const metadata = {
  title: 'Vehicles — mobileDrive',
};

export default async function VehiclesPage() {
  const vehicles = await listVehiclesWithHeroes();

  return (
    <section className="container-page pb-20 pt-28">
      <div className="mb-6">
        <div className="eyebrow mb-2">Marketplace</div>
        <h1 className="font-display text-display-lg font-semibold text-white">
          Explore Vehicles
        </h1>
        <p className="mt-3 max-w-md text-ink-200">
          Browse our curated inventory. Open any vehicle to enter the 3D configurator.
        </p>
      </div>

      <MarketplaceClient vehicles={vehicles} />
    </section>
  );
}
