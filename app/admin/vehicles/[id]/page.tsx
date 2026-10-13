import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import { getVehicleById, listVehicles, getHeroColor } from '@/lib/vehicles/data';
import { formatPrice } from '@/lib/utils/format';

export const dynamic = 'force-dynamic';

export function generateStaticParams() {
  return listVehicles().map((v) => ({ id: v.id }));
}

export function generateMetadata({ params }: { params: { id: string } }) {
  const v = getVehicleById(params.id);
  return { title: v ? `Edit ${v.brand} ${v.model} — Admin · mobileDrive` : 'Vehicle — Admin · mobileDrive' };
}

export default function AdminVehicleDetailPage({ params }: { params: { id: string } }) {
  const vehicle = getVehicleById(params.id);
  if (!vehicle) notFound();

  const hero = getHeroColor(vehicle);
  const activeColorIds = vehicle.availableColors.map((c) => c.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-6">
        <div>
          <Link
            href="/admin/vehicles"
            className="inline-flex items-center gap-1.5 text-xs text-ink-100 hover:text-white"
          >
            <ArrowLeft className="h-3 w-3" />
            Vehicles
          </Link>
          <div className="mt-3 flex items-center gap-4">
            <h1 className="font-display text-display-md font-semibold text-white">
              {vehicle.brand} {vehicle.model}
            </h1>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/15 px-3 py-1.5 text-xs font-medium text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Published
            </span>
          </div>
          <p className="mt-2 text-sm text-ink-200">
            Slug: <code className="text-white">/vehicles/{vehicle.id}</code>
            {vehicle.modelPath && (
              <>
                {' · '}
                <span className="text-sky-300">GLB loaded</span>
              </>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" className="btn-secondary">
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
          <button type="submit" form="edit-vehicle" className="btn-primary">
            <Save className="h-4 w-4" />
            Save changes
          </button>
        </div>
      </div>

      <form id="edit-vehicle" className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {/* Preview */}
          <section className="overflow-hidden rounded-2xl border border-white/[0.06] bg-ink-800/60">
            <div
              className="aspect-[21/9]"
              style={{
                background: `radial-gradient(60% 60% at 50% 50%, ${hero.hex}cc, #0A0B0E 85%)`,
              }}
            >
              <svg viewBox="0 0 400 170" className="h-full w-full" aria-hidden>
                <ellipse cx="200" cy="150" rx="150" ry="8" fill="#000" opacity="0.5" />
                <path
                  d="M60,130 L95,80 Q145,55 200,52 Q255,55 305,80 L340,130 Q335,145 315,146 L305,146 Q301,135 288,135 Q275,135 271,146 L129,146 Q125,135 112,135 Q99,135 95,146 L85,146 Q65,145 60,130 Z"
                  fill={hero.hex}
                />
                <path d="M135,80 Q175,60 200,58 Q225,60 265,80 L255,96 L145,96 Z" fill="#0A0C10" opacity="0.95" />
                <circle cx="112" cy="140" r="14" fill="#0A0B0E" stroke="#3A3F48" />
                <circle cx="288" cy="140" r="14" fill="#0A0B0E" stroke="#3A3F48" />
              </svg>
            </div>
            <div className="flex items-end justify-between gap-6 border-t border-white/[0.06] p-5">
              <div>
                <div className="eyebrow">Live preview</div>
                <div className="mt-1 text-sm text-ink-100">
                  Hero color: <span className="text-white">{hero.name}</span>
                </div>
              </div>
              <Link
                href={`/vehicles/${vehicle.id}`}
                target="_blank"
                className="btn-secondary"
              >
                Open on site →
              </Link>
            </div>
          </section>

          {/* Identity */}
          <Section title="Identity">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field name="brand" label="Brand" defaultValue={vehicle.brand} />
              <Field name="model" label="Model" defaultValue={vehicle.model} />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field name="year" label="Year" defaultValue={String(vehicle.year)} />
              <Field name="body_type" label="Body type" defaultValue={vehicle.bodyType} />
              <Field name="drive_type" label="Drive" defaultValue={vehicle.driveType} />
            </div>
            <Field name="slug" label="URL slug" defaultValue={vehicle.id} readOnly hint="Slug is permanent after first publish." />
            <Textarea name="description" label="Description" rows={4} defaultValue={vehicle.description} />
          </Section>

          <Section title="Performance">
            <div className="grid gap-4 sm:grid-cols-4">
              <Field name="horsepower"   label="Power (HP)"       defaultValue={String(vehicle.horsepower)} />
              <Field name="acceleration" label="0–100 (s)"        defaultValue={String(vehicle.acceleration)} />
              <Field name="top_speed"    label="Top speed (km/h)" defaultValue={String(vehicle.topSpeed)} />
              <Field name="range_km"     label="Range (km)"       defaultValue={vehicle.rangeKm?.toString() ?? ''} />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field name="fuel_type"    label="Fuel"         defaultValue={vehicle.fuelType} />
              <Field name="transmission" label="Transmission" defaultValue={vehicle.transmission} />
              <Field name="torque"       label="Torque (Nm)"  defaultValue="650" />
            </div>
          </Section>

          <Section title="Pricing">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field name="price"    label="Base price" defaultValue={String(vehicle.price)} />
              <Field name="currency" label="Currency"   defaultValue={vehicle.currency} />
              <Field name="deposit"  label="Deposit %"  defaultValue="10" />
            </div>
          </Section>

          <Section
            title="3D model"
            subtitle="Current source: GLB in /public/models/ if path is set, otherwise the procedural fallback."
          >
            <Field
              name="model_path"
              label="GLB path"
              defaultValue={vehicle.modelPath ?? ''}
              placeholder="/models/m4-competition.glb"
            />
          </Section>

          <Section title="Available options">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <OptionCount k="Colors"    v={vehicle.availableColors.length} />
              <OptionCount k="Wheels"    v={vehicle.availableWheels.length} />
              <OptionCount k="Interiors" v={vehicle.availableInteriors.length} />
              <OptionCount k="Packages"  v={vehicle.availablePackages.length} />
            </div>
          </Section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-5">
          <div className="rounded-2xl border border-white/[0.06] bg-ink-800/60 p-5">
            <div className="eyebrow">At a glance</div>
            <dl className="mt-4 space-y-3 text-sm">
              <KV k="Price" v={formatPrice(vehicle.price, vehicle.currency)} />
              <KV k="Horsepower" v={`${vehicle.horsepower} HP`} />
              <KV k="0–100" v={`${vehicle.acceleration.toFixed(1)}s`} />
              <KV k="Top speed" v={`${vehicle.topSpeed} km/h`} />
              <KV k="Fuel" v={vehicle.fuelType} />
            </dl>
          </div>

          <div className="rounded-2xl border border-white/[0.06] bg-ink-800/60 p-5">
            <div className="eyebrow">Hero color</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {vehicle.availableColors.map((c) => {
                const active = c.id === vehicle.heroColorId;
                return (
                  <label
                    key={c.id}
                    className={
                      'relative h-9 w-9 cursor-pointer rounded-full border transition ' +
                      (active ? 'border-white' : 'border-white/15 hover:border-white/40')
                    }
                  >
                    <input
                      type="radio"
                      name="hero_color_id"
                      value={c.id}
                      defaultChecked={active}
                      className="peer sr-only"
                    />
                    <span
                      className="absolute inset-1 rounded-full"
                      style={{
                        background: `radial-gradient(circle at 30% 30%, ${c.hex}, #000 140%)`,
                      }}
                      aria-label={c.name}
                    />
                  </label>
                );
              })}
            </div>
            <p className="mt-3 text-[11px] text-ink-300">
              {activeColorIds.length} paint finishes available in the configurator.
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.06] bg-ink-800/60 p-5">
            <div className="eyebrow">Danger zone</div>
            <p className="mt-2 text-xs text-ink-200">
              Unpublishing hides this vehicle from the marketplace. Deleting removes all
              listings and configurator state — orders already placed are retained.
            </p>
            <div className="mt-4 flex gap-2">
              <button type="button" className="btn-secondary flex-1 text-xs">Unpublish</button>
              <button
                type="button"
                className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-full border border-red-400/30 bg-red-500/5 px-4 text-xs font-medium text-red-300 hover:bg-red-500/15"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            </div>
          </div>
        </aside>
      </form>
    </div>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/[0.06] bg-ink-800/60 p-6">
      <header className="mb-4">
        <h2 className="font-display text-lg font-semibold text-white">{title}</h2>
        {subtitle && <p className="mt-1 text-xs text-ink-200">{subtitle}</p>}
      </header>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({
  name,
  label,
  defaultValue,
  placeholder,
  readOnly,
  hint,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  placeholder?: string;
  readOnly?: boolean;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="eyebrow block">{label}</span>
      <input
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        readOnly={readOnly}
        className={
          'mt-2 h-11 w-full rounded-xl border border-white/10 bg-ink-700 px-4 text-sm text-white placeholder:text-ink-300 focus:border-white/30 focus:outline-none ' +
          (readOnly ? 'text-ink-200' : '')
        }
      />
      {hint && <span className="mt-1 block text-[11px] text-ink-300">{hint}</span>}
    </label>
  );
}

function Textarea({
  name, label, rows, defaultValue,
}: {
  name: string; label: string; rows: number; defaultValue?: string;
}) {
  return (
    <label className="block">
      <span className="eyebrow block">{label}</span>
      <textarea
        name={name}
        rows={rows}
        defaultValue={defaultValue}
        className="mt-2 w-full rounded-xl border border-white/10 bg-ink-700 px-4 py-3 text-sm text-white placeholder:text-ink-300 focus:border-white/30 focus:outline-none"
      />
    </label>
  );
}

function KV({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-ink-200">{k}</dt>
      <dd className="font-medium text-white tabular-nums">{v}</dd>
    </div>
  );
}

function OptionCount({ k, v }: { k: string; v: number }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-ink-700/40 p-4">
      <div className="eyebrow">{k}</div>
      <div className="mt-1 flex items-baseline gap-1 font-display text-2xl font-semibold text-white tabular-nums">
        {v}
        <span className="text-xs text-ink-300">
          {k === 'Packages' ? ' packs' : ' options'}
        </span>
      </div>
      <button type="button" className="mt-2 text-xs text-ink-100 underline hover:text-white">
        Edit…
      </button>
    </div>
  );
}
