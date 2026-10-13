import Link from 'next/link';
import {
  ArrowLeft, Phone, Mail, MessageSquare, CalendarPlus, Edit3, Plus,
  MapPin, Zap, TrendingUp, Clock,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils/format';

export const metadata = { title: 'Customer — Dealer · mobileDrive' };

/**
 * Mock dealer-side customer view — pipeline-focused.
 * Real version would resolve from Supabase by email + join orders / messages / notes.
 */
const MOCK = {
  name: 'Ama Owusu',
  email: 'ama.o@studio.gh',
  phone: '+233 54 221 7788',
  address: '7 Osu Oxford St, Accra',
  stage: 'Negotiating' as const,
  value: 141500,
  vehicle: 'Audi RS6 Avant',
  specialist: 'Kojo Boateng',
  openedBy: 'Mar 14, 2026',
  lastContact: '1 day ago',
  interest: 85,
};

const TIMELINE = [
  { when: 'Today · 14:12', type: 'note',    title: 'Internal note',               body: 'Asked about Dynamic Package upgrade and whether we can swap in winter wheels.' },
  { when: 'Today · 11:40', type: 'message', title: 'Message from Ama',            body: 'Can I keep the configurator snapshot? I want my husband to see it tonight.' },
  { when: 'Yesterday',     type: 'drive',   title: 'Test drive completed',        body: 'Drove the RS6 for 45 min on the N1. Loved the ride comfort.' },
  { when: 'Oct 3',          type: 'build',   title: 'Build saved',                 body: 'Daytona Grey · Carbon wheels · Red leather · Dynamic Package.' },
  { when: 'Sep 29',         type: 'drive',   title: 'Test drive scheduled',        body: 'Confirmed for Oct 5, 10:00. Request: valet parking.' },
  { when: 'Sep 24',         type: 'lead',    title: 'Lead captured',               body: 'Opt-in via Instagram ad "RS6 private viewing".' },
];

const NEXT_ACTIONS = [
  { label: 'Send proposal document',   due: 'Today', priority: 'High' },
  { label: 'Confirm Dynamic Package',   due: 'Tomorrow', priority: 'High' },
  { label: 'Add partner to WhatsApp',   due: 'This week', priority: 'Medium' },
  { label: 'Schedule paint selection',  due: 'Oct 14', priority: 'Low' },
];

const BUILDS = [
  { vehicle: 'Audi RS6 Avant',   color: 'Daytona Grey',   price: 141500 },
  { vehicle: 'Mercedes-AMG GT',  color: 'Obsidian Black', price: 138200 },
];

function stageTone(s: string) {
  switch (s) {
    case 'Negotiating':   return 'bg-amber-400/15 text-amber-300 border-amber-400/30';
    case 'Deposit paid':  return 'bg-indigo-400/15 text-indigo-300 border-indigo-400/30';
    case 'Test drive':    return 'bg-sky-400/15 text-sky-300 border-sky-400/30';
    default:              return 'bg-white/10 text-ink-100 border-white/15';
  }
}

function priorityTone(p: string) {
  switch (p) {
    case 'High':   return 'text-red-300';
    case 'Medium': return 'text-amber-300';
    case 'Low':    return 'text-ink-300';
    default:       return 'text-ink-200';
  }
}

function timelineIcon(t: string) {
  switch (t) {
    case 'note':    return Edit3;
    case 'message': return MessageSquare;
    case 'drive':   return CalendarPlus;
    case 'build':   return Zap;
    case 'lead':    return TrendingUp;
    default:        return Clock;
  }
}

export default function DealerCustomerDetailPage({
  params,
}: {
  params: { email: string };
}) {
  const customer = { ...MOCK, email: decodeURIComponent(params.email || MOCK.email) };

  return (
    <div className="space-y-6">
      <Link
        href="/dealer/customers"
        className="inline-flex items-center gap-1.5 text-xs text-ink-100 hover:text-white"
      >
        <ArrowLeft className="h-3 w-3" />
        Pipeline
      </Link>

      {/* Header */}
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
              <div className="eyebrow">Customer</div>
              <h1 className="mt-1 font-display text-display-md font-semibold text-white">
                {customer.name}
              </h1>
              <p className="mt-1 text-sm text-ink-200">
                Opened {customer.openedBy} · last contact {customer.lastContact}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className={'inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-medium ' + stageTone(customer.stage)}>
                  {customer.stage}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-ink-700/60 px-2.5 py-0.5 text-[11px] text-ink-100">
                  Interest in {customer.vehicle}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href={`tel:${customer.phone}`} className="btn-secondary">
              <Phone className="h-4 w-4" />
              Call
            </a>
            <a href={`mailto:${customer.email}`} className="btn-secondary">
              <Mail className="h-4 w-4" />
              Email
            </a>
            <button type="button" className="btn-primary">
              <MessageSquare className="h-4 w-4" />
              Message
            </button>
          </div>
        </div>

        {/* Deal strip */}
        <div className="mt-6 grid gap-4 border-t border-white/[0.06] pt-5 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Deal value"  value={formatPrice(customer.value)} tone="good" />
          <Stat label="Interest"    value={`${customer.interest}%`}       hint="Model: hot-lead score" />
          <Stat label="Days open"   value="21" />
          <Stat label="Specialist"  value={customer.specialist} small />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Timeline + builds */}
        <div className="space-y-6">
          <section className="rounded-2xl border border-white/[0.06] bg-ink-800/60 p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-white">Activity</h2>
              <button type="button" className="btn-secondary text-xs">
                <Edit3 className="h-3.5 w-3.5" />
                Add note
              </button>
            </div>
            <ol className="mt-5 space-y-5">
              {TIMELINE.map((t, i) => {
                const Icon = timelineIcon(t.type);
                return (
                  <li key={t.when + t.title} className="relative pl-9">
                    <span
                      className={
                        'absolute left-0 top-1 grid h-6 w-6 place-items-center rounded-full ' +
                        (i === 0 ? 'bg-white text-ink-900' : 'bg-ink-700 text-ink-200')
                      }
                    >
                      <Icon className="h-3 w-3" />
                    </span>
                    {i < TIMELINE.length - 1 && (
                      <span className="absolute left-[11px] top-8 h-full w-px bg-white/[0.08]" />
                    )}
                    <div className="text-[11px] text-ink-300">{t.when}</div>
                    <div className="mt-0.5 text-sm font-semibold text-white">{t.title}</div>
                    <div className="mt-0.5 text-sm text-ink-100">{t.body}</div>
                  </li>
                );
              })}
            </ol>
          </section>

          {/* Builds */}
          <section className="rounded-2xl border border-white/[0.06] bg-ink-800/60 p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-white">Saved builds</h2>
              <button type="button" className="btn-secondary text-xs">
                <Plus className="h-3.5 w-3.5" />
                Attach build
              </button>
            </div>
            <ul className="mt-5 divide-y divide-white/[0.04]">
              {BUILDS.map((b) => (
                <li key={b.vehicle} className="flex items-center justify-between py-3.5">
                  <div>
                    <div className="text-sm font-medium text-white">{b.vehicle}</div>
                    <div className="text-[11px] text-ink-200">{b.color}</div>
                  </div>
                  <div className="text-right font-medium text-white tabular-nums">
                    {formatPrice(b.price)}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Right rail */}
        <aside className="space-y-6">
          {/* Next actions */}
          <section className="rounded-2xl border border-white/[0.06] bg-ink-800/60 p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-semibold text-white">Next actions</h2>
              <button type="button" className="text-xs text-ink-100 hover:text-white">+ Add</button>
            </div>
            <ul className="mt-4 space-y-2.5">
              {NEXT_ACTIONS.map((a) => (
                <li
                  key={a.label}
                  className="flex items-start gap-3 rounded-xl bg-ink-700/40 px-4 py-3"
                >
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/15 bg-ink-700 text-white focus:ring-white"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm text-white">{a.label}</div>
                    <div className="mt-0.5 flex items-center gap-2 text-[11px]">
                      <span className="text-ink-200">{a.due}</span>
                      <span className="text-ink-300">·</span>
                      <span className={priorityTone(a.priority)}>{a.priority}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* Contact */}
          <section className="rounded-2xl border border-white/[0.06] bg-ink-800/60 p-6">
            <h2 className="font-display text-base font-semibold text-white">Contact</h2>
            <div className="mt-4 space-y-3 text-sm">
              <ContactRow icon={Mail} value={customer.email} />
              <ContactRow icon={Phone} value={customer.phone} />
              <ContactRow icon={MapPin} value={customer.address} />
            </div>
          </section>

          {/* Deal snapshot */}
          <section className="rounded-2xl border border-white/[0.06] bg-ink-800/60 p-6">
            <h2 className="font-display text-base font-semibold text-white">Deal snapshot</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <KV k="Vehicle"       v={customer.vehicle} />
              <KV k="Likely value"  v={formatPrice(customer.value)} />
              <KV k="Finance"       v="Lease · 36 months" />
              <KV k="Delivery"      v="Door-to-door, Accra" />
              <KV k="Target close"  v="Oct 20" />
            </dl>
            <button type="button" className="btn-primary mt-5 w-full">
              Advance to Deposit paid
            </button>
          </section>
        </aside>
      </div>
    </div>
  );
}

function Stat({ label, value, hint, tone, small }: { label: string; value: string; hint?: string; tone?: 'good'; small?: boolean }) {
  return (
    <div>
      <div className="eyebrow">{label}</div>
      <div
        className={
          'mt-1 font-display font-semibold -tracking-[0.025em] tabular-nums ' +
          (small ? 'text-base' : 'text-2xl ') +
          (tone === 'good' ? 'text-emerald-400' : 'text-white')
        }
      >
        {value}
      </div>
      {hint && <div className="mt-0.5 text-[11px] text-ink-200">{hint}</div>}
    </div>
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

function KV({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-ink-200">{k}</dt>
      <dd className="font-medium text-white">{v}</dd>
    </div>
  );
}
