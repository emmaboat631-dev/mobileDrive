import { Save, Clock, MapPin, Phone, Building2, UserPlus, Trash2, CreditCard } from 'lucide-react';
import { formatPrice } from '@/lib/utils/format';

export const metadata = { title: 'Settings — Dealer · mobileDrive' };

const HOURS = [
  { day: 'Monday',    open: '08:00', close: '18:00', closed: false },
  { day: 'Tuesday',   open: '08:00', close: '18:00', closed: false },
  { day: 'Wednesday', open: '08:00', close: '18:00', closed: false },
  { day: 'Thursday',  open: '08:00', close: '18:00', closed: false },
  { day: 'Friday',    open: '08:00', close: '19:00', closed: false },
  { day: 'Saturday',  open: '10:00', close: '16:00', closed: false },
  { day: 'Sunday',    open: '',      close: '',      closed: true  },
];

const TEAM = [
  { name: 'Kojo Boateng',    email: 'kojo@mobiledrive.app',  role: 'Specialist',  since: '2024-05-01' },
  { name: 'Ama Ofori',       email: 'ama.o@mobiledrive.app', role: 'Specialist',  since: '2024-07-14' },
  { name: 'Yaw Mensah',      email: 'yaw@mobiledrive.app',   role: 'Technician',  since: '2024-11-02' },
  { name: 'Serwaa Appiah',   email: 'serwaa@mobiledrive.app',role: 'Front desk',  since: '2025-01-20' },
];

const PAYOUTS = [
  { date: 'Oct 4, 2026',  amount: 582400, status: 'Paid' },
  { date: 'Sep 27, 2026', amount: 406700, status: 'Paid' },
  { date: 'Sep 20, 2026', amount: 338100, status: 'Paid' },
  { date: 'Oct 11, 2026', amount: 696200, status: 'Scheduled' },
];

export default function DealerSettingsPage() {
  return (
    <div className="space-y-6">
      <header>
        <div className="eyebrow">Settings</div>
        <h1 className="mt-2 font-display text-display-md font-semibold text-white">
          Dealer settings
        </h1>
        <p className="mt-2 text-sm text-ink-200">
          mobileDrive Accra · showroom-level configuration.
        </p>
      </header>

      <form className="space-y-6">
        {/* Store info */}
        <SectionCard icon={Building2} title="Store information" subtitle="Shown to customers on vehicle detail pages and in checkout.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field name="store_name"  label="Store name"       defaultValue="mobileDrive Accra" />
            <Field name="handle"      label="Public handle"    defaultValue="accra" hint="appears in /showroom/<handle>" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field name="address"     label="Street address"   defaultValue="24 Independence Ave" />
            <Field name="city"        label="City"             defaultValue="Accra, Greater Accra" />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field name="phone"       label="Phone"            defaultValue="+233 30 299 1990" />
            <Field name="whatsapp"    label="WhatsApp"         defaultValue="+233 55 199 0000" />
            <Field name="email"       label="Email"            defaultValue="accra@mobiledrive.app" />
          </div>
          <Textarea name="description" label="About" rows={3}
            defaultValue="Flagship mobileDrive showroom serving Accra and West Africa. 24 vehicle bays, full configurator studio, and on-site specialist support." />
        </SectionCard>

        {/* Hours */}
        <SectionCard icon={Clock} title="Opening hours" subtitle="Buyers only see test-drive slots within these windows.">
          <div className="overflow-hidden rounded-xl border border-white/[0.04]">
            <table className="w-full text-sm">
              <thead className="bg-ink-700/40 text-left text-[11px] uppercase tracking-wider text-ink-300">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Day</th>
                  <th className="px-4 py-2.5 font-medium">Opens</th>
                  <th className="px-4 py-2.5 font-medium">Closes</th>
                  <th className="px-4 py-2.5 font-medium">Closed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {HOURS.map((h) => (
                  <tr key={h.day}>
                    <td className="px-4 py-2.5 font-medium text-white">{h.day}</td>
                    <td className="px-4 py-2.5">
                      <input
                        type="text"
                        defaultValue={h.open || '—'}
                        disabled={h.closed}
                        className="h-9 w-28 rounded-lg border border-white/10 bg-ink-700 px-3 text-sm text-white disabled:opacity-50 focus:border-white/30 focus:outline-none"
                      />
                    </td>
                    <td className="px-4 py-2.5">
                      <input
                        type="text"
                        defaultValue={h.close || '—'}
                        disabled={h.closed}
                        className="h-9 w-28 rounded-lg border border-white/10 bg-ink-700 px-3 text-sm text-white disabled:opacity-50 focus:border-white/30 focus:outline-none"
                      />
                    </td>
                    <td className="px-4 py-2.5">
                      <Toggle name={`closed_${h.day}`} defaultOn={h.closed} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        {/* Location / delivery */}
        <SectionCard icon={MapPin} title="Delivery &amp; service area" subtitle="Where this showroom offers door-to-door delivery and roadside pickup.">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field name="radius"   label="Delivery radius"      defaultValue="150 km" />
            <Field name="base_fee" label="Delivery base fee"    defaultValue="Included (≤ 50km)" />
            <Field name="eta_days" label="Typical ETA"          defaultValue="3–4 weeks" />
          </div>
          <Toggle name="allow_pickup" label="Allow dealer pickup" defaultOn />
          <Toggle name="international" label="International orders (shipping arranged externally)" />
        </SectionCard>

        {/* Team */}
        <SectionCard icon={UserPlus} title="Showroom team" subtitle="People reachable from a buyer's order or test-drive page.">
          <div className="overflow-hidden rounded-xl border border-white/[0.04]">
            <table className="w-full text-sm">
              <thead className="bg-ink-700/40 text-left text-[11px] uppercase tracking-wider text-ink-300">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Member</th>
                  <th className="px-4 py-2.5 font-medium">Role</th>
                  <th className="px-4 py-2.5 font-medium">Since</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {TEAM.map((m) => (
                  <tr key={m.email}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[11px] font-semibold text-white"
                          style={{ background: 'linear-gradient(135deg, #A078FF, #FF78A0)' }}
                        >
                          {m.name.split(' ').map((p) => p[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">{m.name}</div>
                          <div className="text-[11px] text-ink-200">{m.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full border border-white/15 bg-ink-700/60 px-2.5 py-0.5 text-[11px] text-ink-100">
                        {m.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink-200 tabular-nums">{m.since}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        aria-label={`Remove ${m.name}`}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-red-400/30 text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button type="button" className="btn-secondary mt-3 w-fit">
            <UserPlus className="h-4 w-4" />
            Invite teammate
          </button>
        </SectionCard>

        {/* Payouts */}
        <SectionCard icon={CreditCard} title="Payouts" subtitle="Weekly settlement to the showroom bank account.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field name="bank_name"    label="Bank"            defaultValue="GCB Bank" />
            <Field name="bank_account" label="Account (masked)" defaultValue="•••••••7612" />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field name="payout_day"   label="Payout day"      defaultValue="Monday" />
            <Field name="min_payout"   label="Minimum balance"  defaultValue={formatPrice(5000)} />
            <Field name="currency"     label="Currency"        defaultValue="USD" />
          </div>
          <div className="overflow-hidden rounded-xl border border-white/[0.04]">
            <table className="w-full text-sm">
              <thead className="bg-ink-700/40 text-left text-[11px] uppercase tracking-wider text-ink-300">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Date</th>
                  <th className="px-4 py-2.5 font-medium">Amount</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {PAYOUTS.map((p) => (
                  <tr key={p.date}>
                    <td className="px-4 py-3 text-ink-200">{p.date}</td>
                    <td className="px-4 py-3 font-medium text-white tabular-nums">
                      {formatPrice(p.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          'inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-medium ' +
                          (p.status === 'Paid'
                            ? 'border-emerald-400/30 bg-emerald-400/15 text-emerald-400'
                            : 'border-sky-400/30 bg-sky-400/15 text-sky-300')
                        }
                      >
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <div className="flex items-center justify-end gap-2 border-t border-white/[0.06] pt-5">
          <button type="button" className="btn-secondary">Discard</button>
          <button type="submit" className="btn-primary">
            <Save className="h-4 w-4" />
            Save settings
          </button>
        </div>
      </form>
    </div>
  );
}

function SectionCard({
  icon: Icon, title, subtitle, children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/[0.06] bg-ink-800/60 p-6">
      <header className="mb-4 flex items-start gap-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/[0.06]">
          <Icon className="h-4 w-4 text-white" />
        </div>
        <div>
          <h2 className="font-display text-lg font-semibold text-white">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs text-ink-200">{subtitle}</p>}
        </div>
      </header>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({
  name, label, defaultValue, hint,
}: {
  name: string; label: string; defaultValue?: string; hint?: string;
}) {
  return (
    <label className="block">
      <span className="eyebrow block">{label}</span>
      <input
        name={name}
        defaultValue={defaultValue}
        className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-ink-700 px-4 text-sm text-white placeholder:text-ink-300 focus:border-white/30 focus:outline-none"
      />
      {hint && <span className="mt-1 block text-[11px] text-ink-300">{hint}</span>}
    </label>
  );
}

function Textarea({ name, label, rows, defaultValue }: { name: string; label: string; rows: number; defaultValue?: string }) {
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

function Toggle({ name, label, defaultOn }: { name: string; label?: string; defaultOn?: boolean }) {
  return (
    <label className="flex items-center justify-between gap-4">
      {label && <span className="text-sm text-ink-100">{label}</span>}
      <span className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center">
        <input type="checkbox" name={name} defaultChecked={defaultOn} className="peer sr-only" />
        <span className="absolute inset-0 rounded-full bg-ink-500 transition peer-checked:bg-white" />
        <span className="relative ml-0.5 h-4 w-4 rounded-full bg-ink-900 transition peer-checked:translate-x-4" />
      </span>
    </label>
  );
}
