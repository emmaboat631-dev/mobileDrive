import { Save, Trash2, UserPlus, ShieldCheck, Globe, Receipt, Palette } from 'lucide-react';

export const metadata = { title: 'Settings — Admin · mobileDrive' };

const TEAM = [
  { name: 'Asiamah Joshua', email: 'asiamah@mobiledrive.app', role: 'Owner',     added: '2024-05-01' },
  { name: 'Nia Mensah',      email: 'nia@mobiledrive.app',    role: 'Admin',     added: '2024-11-02' },
  { name: 'Kojo Boateng',    email: 'kojo@mobiledrive.app',   role: 'Finance',   added: '2025-03-14' },
  { name: 'Ama Owusu',       email: 'ama@mobiledrive.app',    role: 'Marketing', added: '2025-07-21' },
];

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <header>
        <div className="eyebrow">Settings</div>
        <h1 className="mt-2 font-display text-display-md font-semibold text-white">
          Platform settings
        </h1>
        <p className="mt-2 text-sm text-ink-200">
          Defaults applied across every mobileDrive storefront.
        </p>
      </header>

      <form className="space-y-6">
        <SectionCard icon={Globe} title="Localisation" subtitle="Default currency, timezone and language.">
          <div className="grid gap-4 sm:grid-cols-3">
            <Select name="currency" label="Default currency" options={['USD', 'GHS', 'EUR']} />
            <Select name="timezone" label="Timezone" options={['Africa/Accra (GMT)', 'Europe/London', 'America/New_York']} />
            <Select name="language" label="Language" options={['English', 'Français', 'Português']} />
          </div>
          <Field name="region_fallback" label="Fallback region (for new orders)" defaultValue="GH — Ghana" />
        </SectionCard>

        <SectionCard icon={Receipt} title="Taxes &amp; fees" subtitle="Applied to the order subtotal at checkout.">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field name="tax_rate"       label="VAT / sales tax" defaultValue="8.5%" />
            <Field name="processing_fee" label="Payment processing fee" defaultValue="2.4%" hint="Weighted average across providers" />
            <Field name="delivery_fee"   label="Default delivery fee" defaultValue="Included" />
          </div>
          <Toggle name="prices_include_tax" label="Display prices inclusive of tax" />
          <Toggle name="auto_capture" label="Auto-capture payments on order confirmation" defaultOn />
        </SectionCard>

        <SectionCard icon={ShieldCheck} title="Payment providers" subtitle="Toggle which methods appear at checkout.">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { k: 'stripe',    name: 'Stripe (card)',    status: 'Connected · last captured 2h ago' },
              { k: 'paystack',  name: 'Paystack',          status: 'Connected · last captured 2 days ago' },
              { k: 'mtn',       name: 'MTN Mobile Money',  status: 'Connected · last captured yesterday' },
              { k: 'telecel',   name: 'Telecel Cash',      status: 'Connected · last captured 5 days ago' },
              { k: 'airteltigo',name: 'AirtelTigo Money',  status: 'Not connected' },
            ].map((p) => (
              <div
                key={p.k}
                className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-ink-700/40 p-4"
              >
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-white">{p.name}</div>
                  <div className="mt-0.5 truncate text-[11px] text-ink-200">{p.status}</div>
                </div>
                <Toggle name={`provider_${p.k}`} label="" defaultOn={p.k !== 'airteltigo'} />
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard icon={Palette} title="Brand" subtitle="Shown in checkout emails and invoices.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field name="brand_name" label="Display name" defaultValue="mobileDrive" />
            <Field name="brand_email" label="Reply-to email" defaultValue="hello@mobiledrive.app" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field name="support_phone" label="Support phone" defaultValue="+233 30 299 1990" />
            <Field name="support_hours" label="Support hours" defaultValue="24/7 · Mon–Sun" />
          </div>
          <div className="flex items-center gap-4 rounded-xl border border-dashed border-white/15 bg-ink-700/40 p-5">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-white">
              <span className="font-display text-sm font-semibold text-ink-900">mD</span>
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-white">Logo artwork</div>
              <div className="text-xs text-ink-200">SVG or PNG · min 256×256 · white on transparent</div>
            </div>
            <button type="button" className="btn-secondary">Upload</button>
          </div>
        </SectionCard>

        <SectionCard icon={UserPlus} title="Team" subtitle="Who can access this admin area.">
          <div className="overflow-hidden rounded-xl border border-white/[0.04]">
            <table className="w-full text-sm">
              <thead className="bg-ink-700/40 text-left text-[11px] uppercase tracking-wider text-ink-300">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Member</th>
                  <th className="px-4 py-2.5 font-medium">Role</th>
                  <th className="px-4 py-2.5 font-medium">Added</th>
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
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium text-white">{m.name}</div>
                          <div className="truncate text-[11px] text-ink-200">{m.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full border border-white/15 bg-ink-700/60 px-2.5 py-0.5 text-[11px] text-ink-100">
                        {m.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink-200 tabular-nums">{m.added}</td>
                    <td className="px-4 py-3 text-right">
                      {m.role === 'Owner' ? (
                        <span className="text-[11px] text-ink-300">—</span>
                      ) : (
                        <button
                          type="button"
                          aria-label={`Remove ${m.name}`}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-red-400/30 text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button type="button" className="btn-secondary mt-3 w-fit">
            <UserPlus className="h-4 w-4" />
            Invite member
          </button>
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
  icon: Icon,
  title,
  subtitle,
  children,
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

function Toggle({ name, label, defaultOn }: { name: string; label: string; defaultOn?: boolean }) {
  return (
    <label className="flex items-center justify-between">
      <span className="text-sm text-ink-100">{label}</span>
      <span className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center">
        <input type="checkbox" name={name} defaultChecked={defaultOn} className="peer sr-only" />
        <span className="absolute inset-0 rounded-full bg-ink-500 transition peer-checked:bg-white" />
        <span className="relative ml-0.5 h-4 w-4 rounded-full bg-ink-900 transition peer-checked:translate-x-4" />
      </span>
    </label>
  );
}
