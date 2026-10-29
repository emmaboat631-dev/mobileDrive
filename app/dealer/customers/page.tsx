import Link from 'next/link';
import { ArrowUpRight, Mail, Phone, Search, UserPlus, MessageSquare } from 'lucide-react';
import { formatPrice } from '@/lib/utils/format';
import { DemoBadge } from '@/components/ui';

export const metadata = { title: 'Customers — Dealer · mobileDrive' };

interface DealerCustomer {
  name: string;
  email: string;
  phone: string;
  stage: 'Lead' | 'Test drive' | 'Negotiating' | 'Deposit paid' | 'Delivered' | 'Lost';
  vehicle: string;
  lastContact: string;
  nextAction: string;
  value: number;
}

const CUSTOMERS: DealerCustomer[] = [
  { name: 'Asiamah Joshua', email: 'asiamah@mobiledrive.app', phone: '+233 55 123 4567', stage: 'Deposit paid',   vehicle: 'Porsche 911 Carrera', lastContact: '2h ago',    nextAction: 'Confirm paint upgrade', value: 123700 },
  { name: 'Nia Mensah',      email: 'nia@acme.co',             phone: '+233 24 987 6543', stage: 'Delivered',      vehicle: 'BMW M4 Competition',  lastContact: '1 day ago', nextAction: 'Delivery follow-up',    value: 87700 },
  { name: 'Kojo Boateng',    email: 'kojo.b@workmail.com',     phone: '+233 20 555 1212', stage: 'Delivered',      vehicle: 'Tesla Model S',        lastContact: '3 days ago', nextAction: 'Request review',        value: 108300 },
  { name: 'Ama Owusu',       email: 'ama.o@studio.gh',         phone: '+233 54 221 7788', stage: 'Negotiating',    vehicle: 'Audi RS6 Avant',       lastContact: '1 day ago',  nextAction: 'Send proposal doc',     value: 141500 },
  { name: 'Yaw Ampah',       email: 'y.ampah@fleet.com',       phone: '+233 50 998 2211', stage: 'Negotiating',    vehicle: 'Mercedes-AMG GT',      lastContact: '4h ago',     nextAction: 'Fleet discount quote',  value: 142800 },
  { name: 'Serwaa Appiah',   email: 's.appiah@fx.com',         phone: '+233 24 440 0101', stage: 'Deposit paid',   vehicle: 'Range Rover Sport',    lastContact: '2 days ago', nextAction: 'Confirm colour',         value: 112400 },
  { name: 'Afia Kusi',       email: 'afia.kusi@ventures.co',   phone: '+233 55 303 2020', stage: 'Test drive',     vehicle: 'BMW M4 Competition',   lastContact: '6h ago',     nextAction: 'Schedule 2nd drive',    value: 0 },
  { name: 'Rafael Mendes',    email: 'rafael.m@imports.pt',     phone: '+351 912 345 678', stage: 'Test drive',     vehicle: 'Porsche 911 Carrera',  lastContact: 'Yesterday',  nextAction: 'Fly-and-buy logistics', value: 0 },
  { name: 'Kwame Adu',       email: 'kwame@startup.gh',        phone: '+233 24 112 9933', stage: 'Lead',           vehicle: 'Tesla Model X',        lastContact: '3 days ago', nextAction: 'Discovery call',         value: 0 },
  { name: 'Mohammed Ali',    email: 'mo.ali@logistics.com',    phone: '+233 50 227 1818', stage: 'Lost',           vehicle: 'BMW X5',               lastContact: '2 weeks ago', nextAction: 'Re-engage Q1',          value: 0 },
];

function stageColor(s: DealerCustomer['stage']) {
  switch (s) {
    case 'Lead':         return 'bg-white/10 text-ink-100 border-white/15';
    case 'Test drive':   return 'bg-sky-400/15 text-sky-300 border-sky-400/30';
    case 'Negotiating':  return 'bg-amber-400/15 text-amber-300 border-amber-400/30';
    case 'Deposit paid': return 'bg-indigo-400/15 text-indigo-300 border-indigo-400/30';
    case 'Delivered':    return 'bg-emerald-400/15 text-emerald-400 border-emerald-400/30';
    case 'Lost':         return 'bg-red-500/15 text-red-300 border-red-500/30';
  }
}

const PIPELINE: Array<[DealerCustomer['stage'], string]> = [
  ['Lead',          'Prospects not yet contacted'],
  ['Test drive',    'Scheduled or completed'],
  ['Negotiating',   'Quote or finance in progress'],
  ['Deposit paid',  'Build & delivery in motion'],
  ['Delivered',     'Follow-up & reviews'],
];

export default function DealerCustomersPage() {
  const bookedValue = CUSTOMERS
    .filter((c) => c.stage === 'Deposit paid' || c.stage === 'Delivered')
    .reduce((s, c) => s + c.value, 0);

  const stageCounts = PIPELINE.map(([stage, hint]) => ({
    stage,
    hint,
    count: CUSTOMERS.filter((c) => c.stage === stage).length,
  }));

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="eyebrow">Customers</div>
            <DemoBadge note="Pipeline stages are illustrative — needs a CRM layer." />
          </div>
          <h1 className="mt-2 font-display text-display-md font-semibold text-white">
            Your pipeline
          </h1>
          <p className="mt-2 text-sm text-ink-200">
            {CUSTOMERS.length} people in the funnel · {formatPrice(bookedValue)} already booked
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" className="btn-secondary">
            <MessageSquare className="h-4 w-4" />
            Bulk message
          </button>
          <button type="button" className="btn-primary">
            <UserPlus className="h-4 w-4" />
            Add customer
          </button>
        </div>
      </header>

      {/* Pipeline stage cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {stageCounts.map(({ stage, hint, count }) => (
          <div
            key={stage}
            className="rounded-2xl border border-white/[0.06] bg-ink-800/60 p-4"
          >
            <div className="flex items-center justify-between">
              <span className={'inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium ' + stageColor(stage)}>
                {stage}
              </span>
              <span className="font-display text-xl font-semibold text-white tabular-nums">
                {count}
              </span>
            </div>
            <p className="mt-3 text-[11px] text-ink-200">{hint}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        {['All', 'Hot leads', 'This week', 'Delivered', 'Lost'].map((t, i) => (
          <button
            key={t}
            type="button"
            className={
              'rounded-full border px-3.5 py-1.5 text-xs font-medium transition ' +
              (i === 0 ? 'border-white bg-white text-ink-900' : 'border-white/10 text-ink-100 hover:border-white/30')
            }
          >
            {t}
          </button>
        ))}
        <div className="relative ml-auto w-full max-w-sm">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
          <input
            type="search"
            placeholder="Search by name, email or vehicle…"
            className="h-10 w-full rounded-full border border-white/10 bg-ink-700 pl-11 pr-4 text-sm text-white placeholder:text-ink-300 focus:border-white/30 focus:outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <section className="overflow-hidden rounded-2xl border border-white/[0.06] bg-ink-800/60">
        <div className="stack-table overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-white/[0.06] text-left text-[11px] uppercase tracking-wider text-ink-300">
              <tr>
                <th className="px-6 py-3 font-medium">Customer</th>
                <th className="px-6 py-3 font-medium">Stage</th>
                <th className="px-6 py-3 font-medium">Vehicle</th>
                <th className="px-6 py-3 font-medium">Deal value</th>
                <th className="px-6 py-3 font-medium">Last contact</th>
                <th className="px-6 py-3 font-medium">Next action</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {CUSTOMERS.map((c) => (
                <tr key={c.email} className="hover:bg-white/[0.02]">
                  <td data-label="Customer" className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-semibold text-white"
                        style={{ background: 'linear-gradient(135deg, #A078FF, #FF78A0)' }}
                      >
                        {c.name.split(' ').map((p) => p[0]).join('').slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate font-medium text-white">{c.name}</div>
                        <div className="truncate text-[11px] text-ink-200">{c.email}</div>
                      </div>
                    </div>
                  </td>
                  <td data-label="Stage" className="px-6 py-3.5">
                    <span className={'inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-medium ' + stageColor(c.stage)}>
                      {c.stage}
                    </span>
                  </td>
                  <td data-label="Vehicle" className="px-6 py-3.5 text-ink-100">{c.vehicle}</td>
                  <td data-label="Deal value" className="px-6 py-3.5 font-medium text-white tabular-nums">
                    {c.value > 0 ? formatPrice(c.value) : <span className="text-ink-300">—</span>}
                  </td>
                  <td data-label="Last contact" className="px-6 py-3.5 text-ink-200">{c.lastContact}</td>
                  <td data-label="Next action" className="px-6 py-3.5 text-ink-100">{c.nextAction}</td>
                  <td data-label="" className="px-6 py-3.5 text-right">
                    <div className="inline-flex gap-1">
                      <a
                        href={`tel:${c.phone}`}
                        aria-label={`Call ${c.name}`}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/10 text-ink-100 hover:bg-white/5"
                      >
                        <Phone className="h-3 w-3" />
                      </a>
                      <a
                        href={`mailto:${c.email}`}
                        aria-label={`Email ${c.name}`}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/10 text-ink-100 hover:bg-white/5"
                      >
                        <Mail className="h-3 w-3" />
                      </a>
                      <Link
                        href={`/dealer/customers/${encodeURIComponent(c.email)}`}
                        aria-label={`Open ${c.name}`}
                        className="inline-flex h-7 items-center gap-1 rounded-full border border-white/10 px-3 text-[11px] text-ink-100 hover:bg-white/5"
                      >
                        Open
                        <ArrowUpRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
