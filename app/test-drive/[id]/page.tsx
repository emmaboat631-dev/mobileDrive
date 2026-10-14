import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { getVehicleById, listVehicles, getHeroColor } from '@/lib/vehicles/data';
import { formatPrice } from '@/lib/utils/format';
import { BookTestDriveForm } from './BookTestDriveForm';

export function generateStaticParams() {
  return listVehicles().map((v) => ({ id: v.id }));
}

export function generateMetadata({ params }: { params: { id: string } }) {
  const v = getVehicleById(params.id);
  if (!v) return { title: 'Book a test drive — mobileDrive' };
  return { title: `Test drive ${v.brand} ${v.model} — mobileDrive` };
}

export default function TestDrivePage({ params }: { params: { id: string } }) {
  const vehicle = getVehicleById(params.id);
  if (!vehicle) notFound();

  const color = getHeroColor(vehicle);

  return (
    <section className="container-page pb-20 pt-28">
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-ink-300">
        <Link href="/" className="hover:text-white">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href={`/vehicles/${vehicle.id}`} className="hover:text-white">
          {vehicle.brand} {vehicle.model}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-white">Book a test drive</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1fr_484px]">
        <div>
          <div className="eyebrow mb-2">Test drive</div>
          <h1 className="font-display text-display-lg font-semibold text-white">
            {vehicle.brand} {vehicle.model}
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-100">
            Request a slot and a mobileDrive specialist will confirm by phone within
            one business day. We hold slots on a first-come basis; a request isn&apos;t a
            guaranteed booking until it&apos;s confirmed.
          </p>

          <div className="mt-10 overflow-hidden rounded-3xl border border-white/[0.06] bg-ink-800/60">
            <div
              className="relative h-64"
              style={{
                background: `radial-gradient(60% 50% at 50% 50%, ${color.hex}cc, #0A0B0E 85%)`,
              }}
            >
              <svg viewBox="0 0 400 220" className="absolute inset-x-0 bottom-0 h-full w-full" aria-hidden>
                <ellipse cx="200" cy="190" rx="150" ry="10" fill="#000" opacity="0.6" />
                <path
                  d="M70,160 L105,120 Q145,95 200,93 Q255,95 295,120 L330,160 Q325,178 305,180 L295,180 Q291,170 280,170 Q269,170 265,180 L135,180 Q131,170 120,170 Q109,170 105,180 L95,180 Q75,178 70,160 Z"
                  fill={color.hex}
                />
                <path d="M140,120 Q175,105 200,104 Q225,105 260,120 L252,132 L148,132 Z" fill="#0A0C10" opacity="0.9" />
                <circle cx="122" cy="175" r="16" fill="#0A0B0E" stroke="#2A2D33" strokeWidth="1.5" />
                <circle cx="278" cy="175" r="16" fill="#0A0B0E" stroke="#2A2D33" strokeWidth="1.5" />
              </svg>
            </div>
            <div className="px-6 py-5">
              <div className="eyebrow">{vehicle.brand} · {vehicle.year}</div>
              <div className="mt-1 font-display text-xl font-semibold text-white">{vehicle.model}</div>
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[11px] text-ink-200">
                <span><span className="text-white">{vehicle.horsepower}</span> HP</span>
                <span><span className="text-white">{vehicle.acceleration.toFixed(1)}s</span> 0–100</span>
                <span><span className="text-white">{vehicle.fuelType}</span></span>
                <span className="ml-auto font-display text-white">{formatPrice(vehicle.price, vehicle.currency)}</span>
              </div>
            </div>
          </div>
        </div>

        <aside>
          <BookTestDriveForm vehicleId={vehicle.id} />
        </aside>
      </div>
    </section>
  );
}
