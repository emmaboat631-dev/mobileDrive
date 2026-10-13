'use client';

import { useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Upload, AlertCircle } from 'lucide-react';
import { createVehicle } from '@/lib/vehicles/actions';

const HERO_COLORS = [
  { id: 'arctic-silver', hex: '#C8CCD0', name: 'Arctic Silver' },
  { id: 'obsidian-black', hex: '#0B0B0D', name: 'Obsidian Black' },
  { id: 'midnight-blue', hex: '#0F2341', name: 'Midnight Blue' },
  { id: 'racing-red', hex: '#9B1E1E', name: 'Racing Red' },
  { id: 'pearl-white', hex: '#EDEDE8', name: 'Pearl White' },
  { id: 'graphite', hex: '#2A2D33', name: 'Graphite' },
] as const;

export function NewVehicleForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function onSubmit(formData: FormData) {
    setError(null);
    start(async () => {
      const result = await createVehicle(formData);
      if (result.ok === false) setError(result.message);
      // On success the server action redirects, so nothing to do here.
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin/vehicles"
            className="inline-flex items-center gap-1.5 text-xs text-ink-100 hover:text-white"
          >
            <ArrowLeft className="h-3 w-3" />
            Vehicles
          </Link>
          <h1 className="mt-3 font-display text-display-md font-semibold text-white">
            Add vehicle
          </h1>
          <p className="mt-2 text-sm text-ink-200">
            Catalog entries go live immediately. Options can be edited after saving.
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" className="btn-secondary" disabled={pending}>Save draft</button>
          <button
            type="submit"
            form="new-vehicle"
            disabled={pending}
            className="btn-primary disabled:opacity-60"
          >
            {pending ? (
              'Publishing…'
            ) : (
              <>
                <Save className="h-4 w-4" />
                Publish
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form
        id="new-vehicle"
        ref={formRef}
        action={onSubmit}
        className="grid gap-6 lg:grid-cols-[1fr_320px]"
      >
        <div className="space-y-6">
          <Section title="Identity" subtitle="How the vehicle is listed and found.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field name="brand" label="Brand" placeholder="BMW" required />
              <Field name="model" label="Model" placeholder="M4 Competition" required />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field name="year" label="Year" placeholder="2025" required />
              <Select name="body_type" label="Body type" options={['Coupe', 'Sedan', 'SUV', 'Sports', 'Electric', 'Luxury', 'Pickup']} />
              <Select name="drive_type" label="Drive" options={['RWD', 'FWD', 'AWD']} />
            </div>
            <Field
              name="slug"
              label="URL slug"
              placeholder="m4-competition"
              hint="Lowercase, hyphenated. Appears in /vehicles/<slug>."
              required
            />
            <Textarea name="description" label="Description" rows={4} placeholder="A track-sharpened grand tourer…" />
          </Section>

          <Section title="Performance" subtitle="The headline specifications shown on the detail page.">
            <div className="grid gap-4 sm:grid-cols-4">
              <Field name="horsepower"   label="Power (HP)"       placeholder="503" />
              <Field name="acceleration" label="0–100 (s)"        placeholder="3.9" />
              <Field name="top_speed"    label="Top speed (km/h)" placeholder="290" />
              <Field name="range_km"     label="Range (km)"       placeholder="— (ICE)" />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Select name="fuel_type" label="Fuel" options={['Petrol', 'Diesel', 'Electric', 'Hybrid']} />
              <Select name="transmission" label="Transmission" options={['Automatic', 'Manual', 'DCT']} />
              <Field name="torque" label="Torque (Nm)" placeholder="650" />
            </div>
          </Section>

          <Section title="Pricing" subtitle="Base price before options and taxes.">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field name="price" label="Base price" placeholder="82400" required />
              <Select name="currency" label="Currency" options={['USD', 'GHS', 'EUR']} />
              <Field name="deposit" label="Deposit %" placeholder="10" />
            </div>
          </Section>

          <Section
            title="3D model"
            subtitle="Drop a licensed GLB to replace the procedural fallback. Material names: Body_Paint, Wheels, Headlights, Taillights, Glass, Interior_Seat, Interior_Trim."
          >
            <div className="flex items-center gap-4 rounded-xl border border-dashed border-white/15 bg-ink-700/40 p-5">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-white/10">
                <Upload className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-white">Upload .glb or .gltf</div>
                <div className="text-xs text-ink-200">Up to 50 MB · dropped into /public/models/</div>
              </div>
              <button type="button" className="btn-secondary">Choose file</button>
            </div>
            <Field
              name="model_path"
              label="Or path (if already uploaded)"
              placeholder="/models/m4-competition.glb"
            />
          </Section>

          <Section title="Options" subtitle="Colors, wheels, interiors and packages buyers can choose in the configurator.">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { k: 'Colors',    v: '6 defaults' },
                { k: 'Wheels',    v: '4 defaults' },
                { k: 'Interiors', v: '4 defaults' },
                { k: 'Packages',  v: '3 defaults' },
              ].map((p) => (
                <div key={p.k} className="rounded-xl border border-white/[0.06] bg-ink-700/40 p-4">
                  <div className="eyebrow">{p.k}</div>
                  <div className="mt-1 text-sm font-medium text-white">{p.v}</div>
                  <button type="button" className="mt-3 text-xs text-ink-100 hover:text-white underline">
                    Customize…
                  </button>
                </div>
              ))}
            </div>
          </Section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-5">
          <div className="rounded-2xl border border-white/[0.06] bg-ink-800/60 p-5">
            <div className="eyebrow">Status</div>
            <div className="mt-3 flex items-center gap-2 text-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              <span className="text-white">Draft</span>
            </div>
            <p className="mt-2 text-xs text-ink-200">
              Publishing lists the vehicle in the marketplace immediately.
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.06] bg-ink-800/60 p-5">
            <div className="eyebrow">Hero color</div>
            <p className="mt-2 text-xs text-ink-200">
              The paint shown on marketplace cards and in Compare.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {HERO_COLORS.map((c, i) => (
                <label
                  key={c.id}
                  className="relative h-9 w-9 cursor-pointer rounded-full border border-white/15 hover:border-white/40 transition peer-checked:border-white"
                >
                  <input
                    type="radio"
                    name="hero_color_id"
                    value={c.id}
                    defaultChecked={i === 2 /* midnight-blue by default */}
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
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.06] bg-ink-800/60 p-5">
            <div className="eyebrow">Visibility</div>
            <div className="mt-3 space-y-2.5 text-sm">
              <Toggle name="vis_marketplace" label="Marketplace" defaultOn />
              <Toggle name="vis_compare" label="Compare" defaultOn />
              <Toggle name="vis_deals" label="Deals" />
              <Toggle name="vis_dealer_only" label="Dealer-only" />
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
  placeholder,
  hint,
  required,
}: {
  name: string;
  label: string;
  placeholder?: string;
  hint?: string;
  required?: boolean;
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

function Textarea({
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

function Select({
  name,
  label,
  options,
}: {
  name: string;
  label: string;
  options: string[];
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
        <input
          type="checkbox"
          name={name}
          defaultChecked={defaultOn}
          className="peer sr-only"
        />
        <span className="absolute inset-0 rounded-full bg-ink-500 transition peer-checked:bg-white" />
        <span className="relative ml-0.5 h-4 w-4 rounded-full bg-ink-900 transition peer-checked:translate-x-4" />
      </span>
    </label>
  );
}
