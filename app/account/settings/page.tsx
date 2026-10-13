import Link from 'next/link';
import { Save, LogOut, ShieldCheck, Download, Trash2 } from 'lucide-react';

export const metadata = { title: 'Settings — Account · mobileDrive' };

export default function AccountSettingsPage() {
  return (
    <div className="space-y-6">
      <header>
        <div className="eyebrow">Settings</div>
        <h1 className="mt-2 font-display text-display-md font-semibold text-white">
          Profile &amp; preferences
        </h1>
      </header>

      <form className="space-y-6">
        {/* Personal */}
        <Section
          title="Personal information"
          subtitle="This is how your name appears on orders and the dealer floor."
        >
          <div className="flex items-center gap-5">
            <div
              className="grid h-16 w-16 shrink-0 place-items-center rounded-full font-display text-xl font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #A078FF, #FF78A0)' }}
            >
              A
            </div>
            <div className="flex gap-2">
              <button type="button" className="btn-secondary text-xs">Upload photo</button>
              <button type="button" className="text-xs text-ink-200 hover:text-white">Remove</button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field name="first_name" label="First name" defaultValue="Asiamah" />
            <Field name="last_name"  label="Last name"  defaultValue="Joshua" />
          </div>
          <Field type="email" name="email" label="Email" defaultValue="asiamah@mobiledrive.app" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field name="phone"  label="Phone"  defaultValue="+233 55 123 4567" />
            <Select name="region" label="Region" options={['GH — Ghana', 'US — United States', 'EU — Europe']} />
          </div>
        </Section>

        {/* Delivery defaults */}
        <Section title="Default delivery address" subtitle="Used to pre-fill checkout.">
          <Field name="street"      label="Street address" defaultValue="12 Independence Ave" />
          <div className="grid gap-4 sm:grid-cols-3">
            <Field name="city"        label="City"        defaultValue="Accra" />
            <Field name="region_city" label="Region"      defaultValue="Greater Accra" />
            <Field name="postal_code" label="Postal code" defaultValue="GA-123-4567" />
          </div>
        </Section>

        {/* Notifications */}
        <Section title="Notifications" subtitle="How we reach you about builds, orders and test drives.">
          <div className="space-y-3 text-sm">
            <Toggle name="n_orders"  label="Order updates (email)"      defaultOn hint="Production, shipping and delivery" />
            <Toggle name="n_builds"  label="Saved-build reminders"      hint="If you leave a build for more than a week" />
            <Toggle name="n_offers"  label="Launches &amp; promotions"  defaultOn />
            <Toggle name="n_dealer"  label="Dealer messages"            defaultOn />
            <Toggle name="n_sms"     label="SMS test-drive reminders"   defaultOn />
          </div>
        </Section>

        {/* Security */}
        <Section title="Security">
          <div className="rounded-xl border border-white/[0.06] bg-ink-700/40 p-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 text-emerald-400" />
              <div className="flex-1">
                <div className="text-sm font-semibold text-white">Two-factor authentication</div>
                <div className="mt-0.5 text-xs text-ink-200">Enabled via authenticator app · last used 3 days ago</div>
              </div>
              <button type="button" className="btn-secondary text-xs">Manage</button>
            </div>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-ink-700/40 p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 h-2 w-2 rounded-full bg-ink-300" />
              <div className="flex-1">
                <div className="text-sm font-semibold text-white">Password</div>
                <div className="mt-0.5 text-xs text-ink-200">Last changed 2 months ago</div>
              </div>
              <Link href="/forgot-password" className="btn-secondary text-xs">
                Change password
              </Link>
            </div>
          </div>
        </Section>

        {/* Privacy */}
        <Section title="Data &amp; privacy">
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-ink-700/40 p-4 text-left hover:border-white/20"
            >
              <Download className="h-4 w-4 text-white" />
              <div>
                <div className="text-sm font-semibold text-white">Export my data</div>
                <div className="text-[11px] text-ink-200">Builds, orders, wishlist — delivered to your email</div>
              </div>
            </button>
            <button
              type="button"
              className="flex items-center gap-3 rounded-xl border border-red-400/30 bg-red-500/5 p-4 text-left text-red-200 hover:bg-red-500/15"
            >
              <Trash2 className="h-4 w-4" />
              <div>
                <div className="text-sm font-semibold">Delete account</div>
                <div className="text-[11px] opacity-80">Permanent · orders already placed are retained</div>
              </div>
            </button>
          </div>
        </Section>

        <div className="flex items-center justify-between gap-3 border-t border-white/[0.06] pt-5">
          <button
            type="button"
            className="inline-flex items-center gap-2 text-sm text-ink-100 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
          <div className="flex gap-2">
            <button type="button" className="btn-secondary">Discard</button>
            <button type="submit" className="btn-primary">
              <Save className="h-4 w-4" />
              Save changes
            </button>
          </div>
        </div>
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
  name, label, defaultValue, type,
}: {
  name: string; label: string; defaultValue?: string; type?: string;
}) {
  return (
    <label className="block">
      <span className="eyebrow block">{label}</span>
      <input
        name={name}
        type={type ?? 'text'}
        defaultValue={defaultValue}
        className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-ink-700 px-4 text-sm text-white placeholder:text-ink-300 focus:border-white/30 focus:outline-none"
      />
    </label>
  );
}

function Select({
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

function Toggle({
  name,
  label,
  defaultOn,
  hint,
}: {
  name: string;
  label: string;
  defaultOn?: boolean;
  hint?: string;
}) {
  return (
    <label className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <span className="block text-ink-100">{label}</span>
        {hint && <span className="mt-0.5 block text-[11px] text-ink-300">{hint}</span>}
      </div>
      <span className="relative mt-1 inline-flex h-5 w-9 shrink-0 cursor-pointer items-center">
        <input type="checkbox" name={name} defaultChecked={defaultOn} className="peer sr-only" />
        <span className="absolute inset-0 rounded-full bg-ink-500 transition peer-checked:bg-white" />
        <span className="relative ml-0.5 h-4 w-4 rounded-full bg-ink-900 transition peer-checked:translate-x-4" />
      </span>
    </label>
  );
}
