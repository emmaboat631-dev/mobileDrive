import { listVehiclesWithHeroes } from '@/lib/vehicles/server-data';
import { CompareClient } from './CompareClient';

export const metadata = { title: 'Compare — mobileDrive' };

const DEFAULT_IDS = ['chevrolet-corvette', 'lamborghini-aventador', 'porsche-taycan'];

export default async function ComparePage() {
  const vehicles = await listVehiclesWithHeroes();
  return (
    <section className="container-page pb-20 pt-28">
      <div className="mb-10">
        <div className="eyebrow mb-2">Compare</div>
        <h1 className="font-display text-display-lg font-semibold text-white">
          Side-by-side, in detail
        </h1>
        <p className="mt-3 max-w-xl text-ink-200">
          Compare up to 3 vehicles across price, performance and features. Best-in-row
          values are highlighted so the dominant spec jumps out at a glance.
        </p>
      </div>
      <CompareClient vehicles={vehicles} defaultIds={DEFAULT_IDS} />
    </section>
  );
}
