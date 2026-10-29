import Link from 'next/link';
import { ArrowLeft, Save, Package } from 'lucide-react';
import { getHeroColor } from '@/lib/vehicles/data';
import { fetchVehicles } from '@/lib/admin/queries';
import { formatPrice } from '@/lib/utils/format';

export const metadata = { title: 'List vehicle — Dealer · mobileDrive' };
export const dynamic = 'force-dynamic';

export default async function DealerListVehiclePage() {
  const vehicles = await fetchVehicles();

  return (
    <div className="space-y-6">
      <Link
        href="/dealer/inventory"
        className="inline-flex items-center gap-1.5 text-xs text-ink-100 hover:text-white"
      >
        <ArrowLeft className="h-3 w-3" />
        Inventory
      </Link>

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="eyebrow">New listing</div>
          <h1 className="mt-2 font-display text-display-md font-semibold text-white">
            List a vehicle at Accra
          </h1>
          <p className="mt-2 text-sm text-ink-200">
            Pick a catalog vehicle, record the VIN and set delivery expectations.
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" className="btn-secondary">Save draft</button>
          <button type="submit" form="list-vehicle" className="btn-primary">
            <Save className="h-4 w-4" />
            Publish listing
          </button>
        </div>
      </header>

      <form id="list-vehicle" className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {/* Vehicle picker */}
          <section className="rounded-2xl border border-white/[0.06] bg-ink-800/60 p-6">
            <header className="mb-4">
              <h2 className="font-display text-lg font-semibold text-white">Catalog vehicle</h2>
              <p className="mt-1 text-xs text-ink-200">
                Only vehicles already in the public catalog can be stocked. Need something
                new? Contact mobileDrive to add it first.
              </p>
            </header>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {vehicles.map((v, i) => {
                const color = getHeroColor(v);
                const selected = i === 1;
                return (
                  <label
                    key={v.id}
                    className={
                      'cursor-pointer overflow-hidden rounded-xl border transition ' +
                      (selected
                        ? 'border-white bg-white/[0.03]'
                        : 'border-white/[0.06] bg-ink-700/40 hover:border-white/20')
                    }
                  >
                    <input
                      type="radio"
                      name="vehicle_id"
                      value={v.id}
                      defaultChecked={selected}
                      className="peer sr-only"
                    />
                    <div
                      className="aspect-[16/9]"
                      style={{
                        background: `radial-gradient(60% 60% at 50% 50%, ${color.hex}cc, #0A0B0E 85%)`,
                      }}
                    >
                      <svg viewBox="0 0 150 100" className="h-full w-full" aria-hidden>
                        <path
                          d="M20,70 L35,50 Q58,38 75,37 Q92,38 115,50 L130,70 Q128,78 120,79 L115,79 Q113,73 106,73 Q99,73 97,79 L53,79 Q51,73 44,73 Q37,73 35,79 L30,79 Q22,78 20,70 Z"
                          fill={color.hex}
                        />
                        <circle cx="44" cy="76" r="7" fill="#0A0B0E" stroke="#2A2D33" />
                        <circle cx="106" cy="76" r="7" fill="#0A0B0E" stroke="#2A2D33" />
                      </svg>
                    </div>
                    <div className="p-3">
                      <div className="text-[10px] uppercase tracking-wider text-ink-300">
                        {v.brand}
                      </div>
                      <div className="truncate text-sm font-medium text-white">
                        {v.model}
                      </div>
                      <div className="mt-1 text-[11px] text-ink-200">
                        {formatPrice(v.price, v.currency)}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </section>

          {/* Unit details */}
          <section className="rounded-2xl border border-white/[0.06] bg-ink-800/60 p-6">
            <header className="mb-4">
              <h2 className="font-display text-lg font-semibold text-white">Unit details</h2>
            </header>
            <div className="space-y-4">
              <Field name="vin" label="VIN" placeholder="WP0AB2A99KS123456" required hint="17 characters, no I/O/Q." />
              <div className="grid gap-4 sm:grid-cols-3">
                <Field name="color"     label="Paint"           placeholder="Racing Red" />
                <Field name="wheels"    label="Wheels"          placeholder="Performance" />
                <Field name="interior"  label="Interior"        placeholder="Black Merino" />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field name="bay"            label="Showroom bay" placeholder="A3" />
                <Field name="mileage"        label="Mileage (km)" placeholder="12" />
                <Field name="production_date" label="Production date" placeholder="2026-08-14" />
              </div>
              <TextArea name="notes" label="Notes" rows={3} placeholder="Pre-sold to Nia Mensah pending delivery schedule." />
            </div>
          </section>

          {/* Delivery */}
          <section className="rounded-2xl border border-white/[0.06] bg-ink-800/60 p-6">
            <header className="mb-4">
              <h2 className="font-display text-lg font-semibold text-white">Delivery &amp; availability</h2>
            </header>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field name="arrived_at" label="Arrived at showroom" placeholder="2026-10-02" />
              <Field name="eta_delivery" label="Target delivery window" placeholder="3–4 weeks" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField name="availability" label="Availability" options={['Available', 'Reserved', 'In transit', 'In workshop']} />
              <Field name="price_delta" label="Price adjustment" placeholder="+$0" />
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-5">
          <div className="rounded-2xl border border-white/[0.06] bg-ink-800/60 p-5">
            <div className="eyebrow">Visibility</div>
            <div className="mt-3 space-y-2.5 text-sm">
              <Toggle name="visible_marketplace" label="Marketplace" defaultOn />
              <Toggle name="visible_compare"     label="Compare" defaultOn />
              <Toggle name="dealer_only"         label="Dealer-only (sold privately)" />
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.06] bg-ink-800/60 p-5">
            <div className="eyebrow">Reminders</div>
            <ul className="mt-3 space-y-3 text-xs text-ink-200">
              <li className="flex items-start gap-2.5">
                <Package className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-300" />
                Pre-delivery inspection due within 72h of arrival.
              </li>
              <li className="flex items-start gap-2.5">
                <Package className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-300" />
                Add exterior photos within 48h — listings without photos get 60% less engagement.
              </li>
            </ul>
          </div>
        </aside>
      </form>
    </div>
  );
}

function Field({
  name, label, placeholder, hint, required,
}: {
  name: string; label: string; placeholder?: string; hint?: string; required?: boolean;
}) {
  return (
    <label className="block">
      <span className="eyebrow block">
        {label}
        {required && <span className="text-red-300"> *</span>}
      </span>
      <input
        name={name}
        placeholder={placeholder}
        required={required}
        className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-ink-700 px-4 text-sm text-white placeholder:text-ink-300 focus:border-white/30 focus:outline-none"
      />
      {hint && <span className="mt-1 block text-[11px] text-ink-300">{hint}</span>}
    </label>
  );
}

function TextArea({
  name, label, rows, placeholder,
}: {
  name: string; label: string; rows: number; placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="eyebrow block">{label}</span>
      <textarea
        name={name}
        rows={rows}
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl border border-white/10 bg-ink-700 px-4 py-3 text-sm text-white placeholder:text-ink-300 focus:border-white/30 focus:outline-none"
      />
    </label>
  );
}

function SelectField({
  name, label, options,
}: {
  name: string; label: string; options: string[];
}) {
  return (
    <label className="block">
      <span className="eyebrow block">{label}</span>
      <select
        name={name}
        className="mt-2 h-11 w-full appearance-none rounded-xl border border-white/10 bg-ink-700 px-4 text-sm text-white focus:border-white/30 focus:outline-none"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

function Toggle({ name, label, defaultOn }: { name: string; label: string; defaultOn?: boolean }) {
  return (
    <label className="flex items-center justify-between">
      <span className="text-ink-100">{label}</span>
      <span className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center">
        <input type="checkbox" name={name} defaultChecked={defaultOn} className="peer sr-only" />
        <span className="absolute inset-0 rounded-full bg-ink-500 transition peer-checked:bg-white" />
        <span className="relative ml-0.5 h-4 w-4 rounded-full bg-ink-900 transition peer-checked:translate-x-4" />
      </span>
    </label>
  );
}
