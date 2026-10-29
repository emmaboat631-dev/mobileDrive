import Link from 'next/link';
import { Save, LogOut, ShieldCheck, Download, Trash2 } from 'lucide-react';
import { redirect } from 'next/navigation';
import { signOut, updateProfile } from '@/lib/auth/actions';
import { getCurrentUser } from '@/lib/auth/currentUser';
import { getServerSupabase } from '@/lib/supabase/server';

export const metadata = { title: 'Settings — Account · mobileDrive' };
export const dynamic = 'force-dynamic';

async function saveProfile(formData: FormData) {
  'use server';
  const result = await updateProfile(formData);
  const q = result.ok ? '?saved=1' : `?error=${encodeURIComponent(result.message)}`;
  redirect(`/account/settings${q}`);
}

const REGION_OPTIONS = ['GH — Ghana', 'US — United States', 'EU — Europe'];

interface AddressJson {
  street?: string;
  city?: string;
  region?: string;
  postalCode?: string;
}

interface NotificationPrefsJson {
  orders?: boolean;
  builds?: boolean;
  offers?: boolean;
  dealer?: boolean;
  sms?: boolean;
}

interface ProfileExtras {
  phone: string | null;
  region: string | null;
  address: AddressJson | null;
  prefs: NotificationPrefsJson;
}

async function fetchProfileExtras(userId: string): Promise<ProfileExtras> {
  const supabase = getServerSupabase();
  const fallback: ProfileExtras = {
    phone: null,
    region: null,
    address: null,
    prefs: { orders: true, builds: false, offers: true, dealer: true, sms: true },
  };
  if (!supabase) return fallback;
  const db = supabase as unknown as {
    from: (t: string) => {
      select: (c: string) => {
        eq: (k: string, v: string) => {
          maybeSingle: () => Promise<{
            data: {
              phone: string | null;
              region: string | null;
              default_delivery_address: AddressJson | null;
              notification_prefs: NotificationPrefsJson | null;
            } | null;
          }>;
        };
      };
    };
  };
  const { data } = await db
    .from('profiles')
    .select('phone, region, default_delivery_address, notification_prefs')
    .eq('id', userId)
    .maybeSingle();
  if (!data) return fallback;
  return {
    phone: data.phone,
    region: data.region,
    address: data.default_delivery_address,
    prefs: { ...fallback.prefs, ...(data.notification_prefs ?? {}) },
  };
}

export default async function AccountSettingsPage({
  searchParams,
}: {
  searchParams: { saved?: string; error?: string };
}) {
  const user = await getCurrentUser();
  const extras: ProfileExtras = user
    ? await fetchProfileExtras(user.id)
    : { phone: null, region: null, address: null, prefs: { orders: true, builds: false, offers: true, dealer: true, sms: true } };

  const [firstName = '', ...rest] = (user?.fullName ?? '').trim().split(/\s+/);
  const lastName = rest.join(' ');
  const regionDefault = extras.region
    ? REGION_OPTIONS.find((o) => o.startsWith(extras.region as string)) ?? REGION_OPTIONS[0]
    : REGION_OPTIONS[0];
  const address = extras.address ?? {};
  const prefs = extras.prefs;

  return (
    <div className="space-y-6">
      <header>
        <div className="eyebrow">Settings</div>
        <h1 className="mt-2 font-display text-display-md font-semibold text-white">
          Profile &amp; preferences
        </h1>
      </header>

      {searchParams.saved && (
        <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
          Profile updated.
        </div>
      )}
      {searchParams.error && (
        <div className="rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200">
          Couldn&apos;t save: {searchParams.error}
        </div>
      )}

      <form action={saveProfile} className="space-y-6">
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
              {user?.initials ?? 'U'}
            </div>
            <div className="flex gap-2">
              <button type="button" className="btn-secondary text-xs">Upload photo</button>
              <button type="button" className="text-xs text-ink-200 hover:text-white">Remove</button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field name="first_name" label="First name" defaultValue={firstName} />
            <Field name="last_name"  label="Last name"  defaultValue={lastName} />
          </div>
          <Field type="email" name="email" label="Email" defaultValue={user?.email ?? ''} readOnly />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field name="phone"  label="Phone"  defaultValue={extras.phone ?? ''} />
            <Select name="region" label="Region" defaultValue={regionDefault} options={REGION_OPTIONS} />
          </div>
        </Section>

        {/* Delivery defaults */}
        <Section title="Default delivery address" subtitle="Used to pre-fill checkout.">
          <Field name="street"      label="Street address" defaultValue={address.street ?? ''} />
          <div className="grid gap-4 sm:grid-cols-3">
            <Field name="city"        label="City"        defaultValue={address.city ?? ''} />
            <Field name="region_city" label="Region"      defaultValue={address.region ?? ''} />
            <Field name="postal_code" label="Postal code" defaultValue={address.postalCode ?? ''} />
          </div>
        </Section>

        {/* Notifications */}
        <Section title="Notifications" subtitle="How we reach you about builds, orders and test drives.">
          <div className="space-y-3 text-sm">
            <Toggle name="n_orders"  label="Order updates (email)"      defaultOn={prefs.orders} hint="Production, shipping and delivery" />
            <Toggle name="n_builds"  label="Saved-build reminders"      defaultOn={prefs.builds} hint="If you leave a build for more than a week" />
            <Toggle name="n_offers"  label="Launches &amp; promotions"  defaultOn={prefs.offers} />
            <Toggle name="n_dealer"  label="Dealer messages"            defaultOn={prefs.dealer} />
            <Toggle name="n_sms"     label="SMS test-drive reminders"   defaultOn={prefs.sms} />
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
              className="flex items-center gap-3 rounded-xl border border-rose-400/30 bg-rose-500/5 p-4 text-left text-rose-200 hover:bg-rose-500/15"
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
          <button type="submit" formAction={signOut} className="inline-flex items-center gap-2 text-sm text-ink-100 hover:text-white">
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
  name, label, defaultValue, type, readOnly,
}: {
  name: string; label: string; defaultValue?: string; type?: string; readOnly?: boolean;
}) {
  return (
    <label className="block">
      <span className="eyebrow block">{label}</span>
      <input
        name={name}
        type={type ?? 'text'}
        defaultValue={defaultValue}
        readOnly={readOnly}
        className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-ink-700 px-4 text-sm text-white placeholder:text-ink-300 focus:border-white/30 focus:outline-none disabled:opacity-60 read-only:opacity-60 read-only:cursor-not-allowed"
      />
    </label>
  );
}

function Select({
  name, label, options, defaultValue,
}: {
  name: string; label: string; options: string[]; defaultValue?: string;
}) {
  return (
    <label className="block">
      <span className="eyebrow block">{label}</span>
      <select
        name={name}
        defaultValue={defaultValue}
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
