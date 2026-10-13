import Link from 'next/link';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { AccountKpis } from './AccountKpis';

const TRACKER = ['Order placed', 'In production', 'Quality check', 'Shipping', 'Delivered'];

export default function AccountOverviewPage() {
  const currentStep = 1;

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <div className="eyebrow">Welcome back</div>
        <h1 className="mt-2 font-display text-display-md font-semibold text-white">
          Good evening, Asiamah.
        </h1>
      </div>

      {/* KPIs — client component reads wishlist/cart stores */}
      <AccountKpis />

      {/* Order tracker */}
      <div className="rounded-3xl border border-white/[0.06] bg-ink-800/60 p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="eyebrow">Current order</div>
            <h2 className="mt-1 font-display text-xl font-semibold text-white">
              Porsche 911 Carrera
            </h2>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-400/15 px-3 py-1.5 text-xs font-medium text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            In production
          </span>
        </div>

        <div className="mt-6 flex items-center">
          {TRACKER.map((step, i) => {
            const done = i <= currentStep;
            const current = i === currentStep;
            return (
              <div key={step} className="flex flex-1 items-center last:flex-none">
                <div className="flex min-w-0 flex-col items-center text-center">
                  <div
                    className={cn(
                      'grid h-6 w-6 place-items-center rounded-full text-[11px] font-semibold',
                      done ? 'bg-white text-ink-900' : 'bg-ink-700 text-ink-200',
                      current && 'ring-2 ring-white/60 ring-offset-2 ring-offset-ink-900',
                    )}
                  >
                    {done ? <Check className="h-3 w-3" strokeWidth={3} /> : i + 1}
                  </div>
                  <span
                    className={cn(
                      'mt-2 w-20 text-[10px] leading-tight',
                      current ? 'font-semibold text-white' : done ? 'text-white' : 'text-ink-300',
                    )}
                  >
                    {step}
                  </span>
                </div>
                {i < TRACKER.length - 1 && (
                  <div
                    className={cn(
                      'mx-3 h-0.5 flex-1',
                      i < currentStep ? 'bg-white/40' : 'bg-white/[0.08]',
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex flex-wrap gap-8 border-t border-white/[0.06] pt-5">
          {[
            ['Order #', 'MD-2026-1038'],
            ['Total', '$123,700'],
            ['Est. delivery', 'Nov 2, 2026'],
            ['Dealer', 'mobileDrive Accra'],
          ].map(([k, v]) => (
            <div key={k}>
              <div className="text-[10px] font-medium uppercase tracking-wider text-ink-300">
                {k}
              </div>
              <div className="mt-0.5 text-sm font-medium text-white">{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Two column */}
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/[0.06] bg-ink-800/60 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-base font-semibold text-white">Active builds</h3>
            <Link href="/account/builds" className="text-xs text-ink-100 hover:text-white">
              View all →
            </Link>
          </div>
          <div className="space-y-2.5">
            {[
              ['BMW · M4 Competition', 'Last edit 2h ago', '$87,700'],
              ['Tesla · Model S',       'Last edit yesterday', '$108,300'],
              ['Mercedes-AMG · GT',     'Last edit 3 days ago', '$141,500'],
            ].map(([title, time, price]) => (
              <div
                key={title}
                className="flex items-center gap-3 rounded-xl bg-ink-700/40 px-3 py-2.5"
              >
                <div className="h-11 w-14 shrink-0 rounded-md bg-ink-900" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-white">{title}</div>
                  <div className="text-[11px] text-ink-200">{time}</div>
                </div>
                <div className="shrink-0 text-sm font-semibold text-white">{price}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/[0.06] bg-ink-800/60 p-6">
          <h3 className="mb-4 font-display text-base font-semibold text-white">
            Next test drive
          </h3>
          <div className="rounded-xl border border-white/[0.08] bg-ink-700/40 p-4">
            <div className="flex items-center gap-4">
              <div className="grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-white text-ink-900">
                <div className="text-center">
                  <div className="font-display text-2xl font-semibold leading-none">12</div>
                  <div className="mt-1 text-[9px] font-semibold uppercase tracking-wider text-ink-700">
                    Oct
                  </div>
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Porsche 911 Carrera</div>
                <div className="text-[11px] text-ink-200">14:00 — 15:30</div>
                <div className="text-[11px] text-ink-200">mobileDrive Accra</div>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button type="button" className="btn-secondary h-10 flex-1 px-3 text-xs">
                Reschedule
              </button>
              <button type="button" className="btn-primary h-10 flex-1 px-3 text-xs">
                View details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
