import Link from 'next/link';
import {
  ArrowLeft, Mail, Phone, MapPin, Package, Heart, Zap, Calendar, MessageSquare,
  Shield, Flag,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils/format';

export const metadata = { title: 'Customer — Admin · mobileDrive' };

/**
 * Mock customer detail. Real version:
 *   const { data } = await supabase.from('profiles').select(...).eq('email', email).single();
 *   plus one query each for orders, builds, test_drives, messages, wishlists.
 */
const MOCK = {
  name: 'Asiamah Joshua',
  email: 'asiamah@mobiledrive.app',
  phone: '+233 55 123 4567',
  address: '12 Independence Ave, Accra · Greater Accra · GA-123-4567, Ghana',
  tier: 'Premium',
  region: 'GH',
  since: '2024-05-01',
  lastSeen: '12 min ago',
  spent: 211400,
  orders: 1,
  avgOrder: 211400,
  specialist: { name: 'Kojo Boateng', showroom: 'mobileDrive Accra' },
  tags: ['High-intent', 'Fleet contact', 'Press partner'],
  flags: 0,
};

const ORDERS = [
  { id: 'MD-2026-1038', date: 'Oct 6, 2026', vehicle: 'Porsche 911 Carrera', amount: 123700, status: 'Production' },
  { id: 'MD-2025-0942', date: 'Dec 11, 2025', vehicle: 'BMW X5 xDrive40i',    amount: 87700,  status: 'Delivered' },
];

const BUILDS = [
  { vehicle: 'Tesla Model S',  color: 'Pearl White', when: '2h ago' },
  { vehicle: 'Mercedes-AMG GT', color: 'Obsidian Black', when: 'Yesterday' },
  { vehicle: 'Audi RS6 Avant',  color: 'Graphite', when: '4 days ago' },
];

const TESTS = [
  { date: 'Oct 7, 09:30', vehicle: 'Porsche 911 Carrera', status: 'Confirmed' },
  { date: 'Sep 24, 15:00', vehicle: 'BMW M4 Competition', status: 'Completed' },
];

const WISHLIST = [
  'Mercedes-AMG GT',
  'Audi RS6 Avant',
  'Range Rover Sport',
];

const MESSAGES = [
  { from: 'Asiamah', when: '12m ago', text: "Can I switch the Performance wheels for the Carbon Forged on my 911 build?" },
  { from: 'Specialist', when: '18m ago', text: "Yes — the switch adds $2,300 to the total. Want me to apply it?" },
  { from: 'Asiamah', when: '19m ago', text: "Please do, and send the updated invoice via WhatsApp." },
];

function statusTone(s: string) {
  switch (s) {
    case 'Delivered': return 'bg-emerald-400/15 text-emerald-400 border-emerald-400/30';
    case 'Production': return 'bg-amber-400/15 text-amber-300 border-amber-400/30';
    case 'Shipping': return 'bg-sky-400/15 text-sky-300 border-sky-400/30';
    case 'Confirmed': return 'bg-emerald-400/15 text-emerald-400 border-emerald-400/30';
    case 'Completed': return 'bg-white/10 text-ink-100 border-white/15';
    default: return 'bg-white/10 text-ink-100 border-white/15';
  }
}

export default function AdminCustomerDetailPage({
  params,
}: {
  params: { email: string };
}) {
  const customer = { ...MOCK, email: decodeURIComponent(params.email || MOCK.email) };

  return (
    <div className="space-y-6">
      <Link
        href="/admin/customers"
        className="inline-flex items-center gap-1.5 text-xs text-ink-100 hover:text-white"
      >
        <ArrowLeft className="h-3 w-3" />
        Customers
      </Link>

      {/* Header card */}
      <section className="rounded-3xl border border-white/[0.06] bg-ink-800/60 p-6">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="flex items-start gap-5">
            <div
              className="grid h-16 w-16 shrink-0 place-items-center rounded-full font-display text-xl font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #A078FF, #FF78A0)' }}
            >
              {customer.name.split(' ').map((p) => p[0]).join('').slice(0, 2)}
            </div>
            <div>
              <h1 className="font-display text-display-md font-semibold text-white">
                {customer.name}
              </h1>
              <p className="mt-1 text-sm text-ink-200">
                Member since {customer.since} · last seen {customer.lastSeen}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/15 px-2.5 py-0.5 text-[11px] font-medium text-amber-300">
                  {customer.tier}
                </span>
                {customer.tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-ink-700/60 px-2.5 py-0.5 text-[11px] text-ink-100"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button type="button" className="btn-secondary">
              <MessageSquare className="h-4 w-4" />
              Message
            </button>
            <button type="button" className="btn-primary">Edit profile</button>
          </div>
        </div>

        {/* KPI strip */}
        <div className="mt-6 grid gap-4 border-t border-white/[0.06] pt-5 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Lifetime value" value={formatPrice(customer.spent)} tone="good" />
          <Stat label="Orders"         value={String(customer.orders)} />
          <Stat label="Avg order"      value={formatPrice(customer.avgOrder)} />
          <Stat label="Flags"          value={String(customer.flags)} hint={customer.flags === 0 ? 'Clean record' : 'Needs review'} />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          {/* Orders */}
          <Panel icon={Package} title="Orders" count={ORDERS.length} link="/admin/orders">
            <div className="divide-y divide-white/[0.04]">
              {ORDERS.map((o) => (
                <div key={o.id} className="flex items-center gap-4 px-5 py-3.5">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-3">
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="text-sm font-medium text-white hover:underline"
                      >
                        {o.id}
                      </Link>
                      <span className={'inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-medium ' + statusTone(o.status)}>
                        {o.status}
                      </span>
                    </div>
                    <div className="mt-0.5 text-xs text-ink-200">
                      {o.vehicle} · {o.date}
                    </div>
                  </div>
                  <div className="text-right font-medium text-white tabular-nums">
                    {formatPrice(o.amount)}
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          {/* Builds + Wishlist */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Panel icon={Zap} title="Saved builds" count={BUILDS.length}>
              <ul className="divide-y divide-white/[0.04]">
                {BUILDS.map((b) => (
                  <li key={b.vehicle + b.when} className="flex items-start gap-3 px-5 py-3">
                    <div
                      className="mt-1 h-4 w-4 shrink-0 rounded-full"
                      style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.6), rgba(255,255,255,0.15))' }}
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-white">{b.vehicle}</div>
                      <div className="text-[11px] text-ink-200">{b.color} · last edit {b.when}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel icon={Heart} title="Wishlist" count={WISHLIST.length}>
              <ul className="divide-y divide-white/[0.04]">
                {WISHLIST.map((v) => (
                  <li key={v} className="flex items-center gap-3 px-5 py-3 text-sm text-white">
                    <Heart className="h-3.5 w-3.5 text-ink-300" />
                    {v}
                  </li>
                ))}
              </ul>
            </Panel>
          </div>

          {/* Test drives */}
          <Panel icon={Calendar} title="Test drives" count={TESTS.length}>
            <div className="divide-y divide-white/[0.04]">
              {TESTS.map((t) => (
                <div key={t.date + t.vehicle} className="flex items-center justify-between px-5 py-3.5">
                  <div>
                    <div className="text-sm font-medium text-white">{t.vehicle}</div>
                    <div className="text-[11px] text-ink-200">{t.date}</div>
                  </div>
                  <span className={'inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-medium ' + statusTone(t.status)}>
                    {t.status}
                  </span>
                </div>
              ))}
            </div>
          </Panel>

          {/* Messages */}
          <Panel icon={MessageSquare} title="Recent messages" count={MESSAGES.length}>
            <div className="divide-y divide-white/[0.04]">
              {MESSAGES.map((m, i) => (
                <div key={i} className="flex items-start gap-3 px-5 py-3.5">
                  <div
                    className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full text-[10px] font-semibold text-white"
                    style={{ background: m.from === 'Asiamah' ? 'linear-gradient(135deg, #A078FF, #FF78A0)' : 'rgba(255,255,255,0.08)' }}
                  >
                    {m.from === 'Asiamah' ? 'AJ' : 'KB'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <div className="text-xs font-semibold text-white">{m.from}</div>
                      <div className="text-[11px] text-ink-300">{m.when}</div>
                    </div>
                    <div className="mt-0.5 text-sm text-ink-100">{m.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        {/* Right rail */}
        <aside className="space-y-6">
          <section className="rounded-2xl border border-white/[0.06] bg-ink-800/60 p-6">
            <h2 className="font-display text-base font-semibold text-white">Contact</h2>
            <div className="mt-4 space-y-3 text-sm">
              <ContactRow icon={Mail}  value={customer.email} />
              <ContactRow icon={Phone} value={customer.phone} />
              <ContactRow icon={MapPin} value={customer.address} />
            </div>
          </section>

          <section className="rounded-2xl border border-white/[0.06] bg-ink-800/60 p-6">
            <h2 className="font-display text-base font-semibold text-white">Specialist</h2>
            <div className="mt-4 flex items-center gap-3">
              <div
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-xs font-semibold text-white"
                style={{ background: 'linear-gradient(135deg, #A078FF, #FF78A0)' }}
              >
                KB
              </div>
              <div>
                <div className="text-sm font-semibold text-white">{customer.specialist.name}</div>
                <div className="text-[11px] text-ink-200">{customer.specialist.showroom}</div>
              </div>
            </div>
            <button type="button" className="btn-secondary mt-4 w-full text-xs">
              Reassign specialist
            </button>
          </section>

          <section className="rounded-2xl border border-white/[0.06] bg-ink-800/60 p-6">
            <h2 className="font-display text-base font-semibold text-white">Trust &amp; safety</h2>
            <div className="mt-4 space-y-3 text-sm">
              <TrustRow
                icon={Shield}
                label="Identity verified"
                sub="Govt ID + proof of address"
                good
              />
              <TrustRow
                icon={Shield}
                label="2-factor enabled"
                sub="Authenticator app"
                good
              />
              <TrustRow
                icon={Flag}
                label="No open flags"
                sub="Clean record for 18 months"
                good
              />
            </div>
            <button type="button" className="btn-secondary mt-5 w-full text-xs">
              View audit log
            </button>
          </section>
        </aside>
      </div>
    </div>
  );
}

function Stat({ label, value, hint, tone }: { label: string; value: string; hint?: string; tone?: 'good' }) {
  return (
    <div>
      <div className="eyebrow">{label}</div>
      <div
        className={
          'mt-1 font-display text-2xl font-semibold -tracking-[0.025em] tabular-nums ' +
          (tone === 'good' ? 'text-emerald-400' : 'text-white')
        }
      >
        {value}
      </div>
      {hint && <div className="mt-0.5 text-[11px] text-ink-200">{hint}</div>}
    </div>
  );
}

function Panel({
  icon: Icon, title, count, link, children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  count?: number;
  link?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-white/[0.06] bg-ink-800/60">
      <header className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="grid h-7 w-7 place-items-center rounded-lg bg-white/[0.06]">
            <Icon className="h-3.5 w-3.5 text-white" />
          </div>
          <h2 className="font-display text-sm font-semibold text-white">
            {title}
            {typeof count === 'number' && (
              <span className="ml-2 text-xs font-normal text-ink-300">{count}</span>
            )}
          </h2>
        </div>
        {link && (
          <Link href={link} className="text-xs text-ink-100 hover:text-white">
            View all →
          </Link>
        )}
      </header>
      <div className="border-t border-white/[0.06]">{children}</div>
    </section>
  );
}

function ContactRow({ icon: Icon, value }: { icon: React.ComponentType<{ className?: string }>; value: string }) {
  return (
    <div className="flex items-start gap-2.5 text-ink-100">
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-300" />
      <span className="min-w-0 flex-1 break-words">{value}</span>
    </div>
  );
}

function TrustRow({
  icon: Icon, label, sub, good,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  sub: string;
  good?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className={
          'grid h-7 w-7 shrink-0 place-items-center rounded-full ' +
          (good ? 'bg-emerald-400/15 text-emerald-400' : 'bg-white/[0.06] text-ink-200')
        }
      >
        <Icon className="h-3 w-3" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-white">{label}</div>
        <div className="text-[11px] text-ink-200">{sub}</div>
      </div>
    </div>
  );
}
