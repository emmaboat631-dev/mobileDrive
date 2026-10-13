import Link from 'next/link';
import {
  ArrowLeft, Check, Package, ClipboardList, Truck, Download, MessageSquare, Phone, MapPin,
} from 'lucide-react';
import { getVehicleById } from '@/lib/vehicles/data';
import { formatPrice } from '@/lib/utils/format';

export const metadata = { title: 'Order — Account · mobileDrive' };

/**
 * Buyer-facing order tracker. Server component — swap the mock below for a
 * `getServerSupabase()?.from('orders').select(...).eq('id', id).single()` once
 * the backend is wired.
 */
const MOCK_ORDER = {
  id: 'MD-2026-1038',
  placed: '2026-10-06T09:12:00+00:00',
  status: 'production' as 'pending' | 'paid' | 'production' | 'quality' | 'shipping' | 'delivered',
  eta: 'Nov 2, 2026',
  dealer: 'mobileDrive Accra',
  dealerContact: '+233 30 299 1990',
  delivery: {
    method: 'Door-to-door',
    address: '12 Independence Ave, Accra · Greater Accra · GA-123-4567, Ghana',
  },
  payment: {
    method: 'Card',
    last4: '4567',
  },
  items: [
    {
      vehicleId: 'porsche-911',
      colorId: 'racing-red',
      wheelId: 'performance',
      interiorId: 'black',
      packageIds: ['driver-assist'],
    },
  ],
};

const STATUS_STEPS: Array<{
  id: typeof MOCK_ORDER.status;
  label: string;
  icon: typeof Check;
  description: string;
}> = [
  { id: 'paid',       label: 'Payment confirmed', icon: Check,         description: 'Your deposit has been received.' },
  { id: 'production', label: 'In production',     icon: Package,       description: 'Your vehicle is being built in Zuffenhausen.' },
  { id: 'quality',    label: 'Quality check',     icon: ClipboardList, description: '3-day inspection and pre-delivery setup.' },
  { id: 'shipping',   label: 'Shipping',          icon: Truck,         description: 'En route via secure transport.' },
  { id: 'delivered',  label: 'Delivered',         icon: Check,         description: 'Vehicle handed over.' },
];

const UPDATES = [
  { when: 'Today · 09:12', title: 'Order confirmed',      body: 'Payment captured. Your build has been queued at the factory.' },
  { when: 'Today · 09:14', title: 'Specialist assigned',  body: 'Kojo B. is your specialist. Expect a WhatsApp intro within 24h.' },
  { when: 'Oct 7 · 11:00', title: 'Factory slot booked',  body: 'Production begins Nov 11. ETA holds at Nov 2.' },
];

export default function AccountOrderDetailPage({ params }: { params: { id: string } }) {
  const order = { ...MOCK_ORDER, id: params.id || MOCK_ORDER.id };
  const stepIdx = STATUS_STEPS.findIndex((s) => s.id === order.status);
  const currentStep = STATUS_STEPS[stepIdx];

  const resolved = order.items.map((it) => {
    const v = getVehicleById(it.vehicleId)!;
    const color = v.availableColors.find((c) => c.id === it.colorId)!;
    const wheel = v.availableWheels.find((w) => w.id === it.wheelId)!;
    const interior = v.availableInteriors.find((i) => i.id === it.interiorId)!;
    const packages = v.availablePackages.filter((p) => it.packageIds.includes(p.id));
    const options =
      color.priceDelta + wheel.priceDelta + interior.priceDelta +
      packages.reduce((s, p) => s + p.priceDelta, 0);
    return { v, color, wheel, interior, packages, unit: v.price, options, line: v.price + options };
  });

  const subtotal = resolved.reduce((s, r) => s + r.unit, 0);
  const optionsTotal = resolved.reduce((s, r) => s + r.options, 0);
  const taxes = Math.round((subtotal + optionsTotal) * 0.085);
  const grand = subtotal + optionsTotal + taxes;

  return (
    <div className="space-y-6">
      <Link
        href="/account/orders"
        className="inline-flex items-center gap-1.5 text-xs text-ink-100 hover:text-white"
      >
        <ArrowLeft className="h-3 w-3" />
        All orders
      </Link>

      {/* Header card */}
      <section className="rounded-3xl border border-white/[0.06] bg-ink-800/60 p-6">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <div className="eyebrow">Order {order.id}</div>
            <h1 className="mt-2 font-display text-display-md font-semibold text-white">
              Porsche 911 Carrera
            </h1>
            <p className="mt-2 text-sm text-ink-200">
              Placed {new Date(order.placed).toLocaleDateString()} ·{' '}
              <span className="text-white">Est. delivery {order.eta}</span>
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/15 px-3 py-1.5 text-xs font-medium text-amber-300">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            {currentStep?.label ?? 'Status update'}
          </span>
        </div>

        {/* Progress tracker */}
        <div className="mt-8 flex items-center">
          {STATUS_STEPS.map((step, i) => {
            const done = i <= stepIdx;
            const current = i === stepIdx;
            const Icon = step.icon;
            return (
              <div key={step.id} className="flex flex-1 items-center last:flex-none">
                <div className="flex min-w-0 flex-col items-center text-center">
                  <div
                    className={
                      'grid h-10 w-10 place-items-center rounded-full ' +
                      (done ? 'bg-white text-ink-900' : 'bg-ink-700 text-ink-200') +
                      (current ? ' ring-2 ring-white/60 ring-offset-2 ring-offset-ink-800' : '')
                    }
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <span
                    className={
                      'mt-2 w-24 text-[11px] leading-tight ' +
                      (current ? 'font-semibold text-white' : done ? 'text-white' : 'text-ink-300')
                    }
                  >
                    {step.label}
                  </span>
                </div>
                {i < STATUS_STEPS.length - 1 && (
                  <div
                    className={
                      'mx-3 h-0.5 flex-1 ' +
                      (i < stepIdx ? 'bg-white/40' : 'bg-white/[0.08]')
                    }
                  />
                )}
              </div>
            );
          })}
        </div>

        {currentStep?.description && (
          <p className="mt-6 rounded-xl border border-white/[0.06] bg-ink-700/40 px-4 py-3 text-sm text-ink-100">
            <span className="font-medium text-white">What's happening now:</span>{' '}
            {currentStep.description}
          </p>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          {/* Vehicle */}
          <section className="rounded-2xl border border-white/[0.06] bg-ink-800/60 p-6">
            <h2 className="font-display text-lg font-semibold text-white">Your build</h2>
            <div className="mt-5 space-y-4">
              {resolved.map((r) => (
                <div
                  key={r.v.id}
                  className="flex gap-4 rounded-xl border border-white/[0.04] bg-ink-700/40 p-4"
                >
                  <div
                    className="h-28 w-44 shrink-0 overflow-hidden rounded-lg"
                    style={{
                      background: `radial-gradient(60% 60% at 50% 50%, ${r.color.hex}cc, #0A0B0E 85%)`,
                    }}
                  >
                    <svg viewBox="0 0 180 112" className="h-full w-full" aria-hidden>
                      <path
                        d="M25,78 L42,54 Q68,42 90,41 Q112,42 138,54 L155,78 Q152,88 142,89 L136,89 Q132,80 123,80 Q114,80 112,89 L68,89 Q66,80 57,80 Q48,80 44,89 L38,89 Q28,88 25,78 Z"
                        fill={r.color.hex}
                      />
                      <circle cx="54" cy="85" r="9" fill="#0A0B0E" stroke="#2A2D33" />
                      <circle cx="126" cy="85" r="9" fill="#0A0B0E" stroke="#2A2D33" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="eyebrow">{r.v.brand} · {r.v.year}</div>
                    <div className="mt-0.5 font-display text-lg font-semibold text-white">
                      {r.v.model}
                    </div>
                    <div className="mt-3 grid gap-x-6 gap-y-1 text-xs text-ink-200 sm:grid-cols-2">
                      <span>Paint: <span className="text-white">{r.color.name}</span></span>
                      <span>Wheels: <span className="text-white">{r.wheel.name}</span></span>
                      <span>Interior: <span className="text-white">{r.interior.name}</span></span>
                      <span>
                        Packages: <span className="text-white">
                          {r.packages.length ? r.packages.map((p) => p.name).join(', ') : '—'}
                        </span>
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="font-display text-lg font-semibold text-white tabular-nums">
                      {formatPrice(r.line, r.v.currency)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-2.5 border-t border-white/[0.06] pt-5 text-sm">
              <Row label="Subtotal" value={formatPrice(subtotal)} />
              <Row label="Options" value={`+${formatPrice(optionsTotal)}`} />
              <Row label="Delivery" value="Included" muted />
              <Row label="Taxes & fees" value={`+${formatPrice(taxes)}`} />
              <div className="mt-4 flex items-baseline justify-between border-t border-white/[0.06] pt-4">
                <div className="eyebrow">Total paid</div>
                <div className="font-display text-3xl font-semibold text-white tabular-nums">
                  {formatPrice(grand)}
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <button type="button" className="btn-secondary">
                <Download className="h-4 w-4" />
                Invoice (PDF)
              </button>
              <button type="button" className="btn-secondary">
                Order confirmation
              </button>
            </div>
          </section>

          {/* Timeline */}
          <section className="rounded-2xl border border-white/[0.06] bg-ink-800/60 p-6">
            <h2 className="font-display text-lg font-semibold text-white">Updates</h2>
            <ol className="mt-5 space-y-5">
              {UPDATES.map((u, i) => (
                <li key={u.when} className="relative pl-7">
                  <span
                    className={
                      'absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full ' +
                      (i === 0 ? 'bg-white' : 'bg-ink-500')
                    }
                  />
                  {i < UPDATES.length - 1 && (
                    <span className="absolute left-[4px] top-5 h-full w-px bg-white/[0.08]" />
                  )}
                  <div className="text-[11px] text-ink-300">{u.when}</div>
                  <div className="mt-0.5 text-sm font-semibold text-white">{u.title}</div>
                  <div className="mt-0.5 text-sm text-ink-100">{u.body}</div>
                </li>
              ))}
            </ol>
          </section>
        </div>

        {/* Right side */}
        <aside className="space-y-6">
          {/* Specialist */}
          <section className="rounded-2xl border border-white/[0.06] bg-ink-800/60 p-6">
            <h2 className="font-display text-base font-semibold text-white">Your specialist</h2>
            <div className="mt-4 flex items-center gap-3">
              <div
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-xs font-semibold text-white"
                style={{ background: 'linear-gradient(135deg, #A078FF, #FF78A0)' }}
              >
                KB
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Kojo Boateng</div>
                <div className="text-[11px] text-ink-200">{order.dealer}</div>
              </div>
            </div>
            <div className="mt-5 space-y-2">
              <button
                type="button"
                className="btn-primary w-full"
              >
                <MessageSquare className="h-4 w-4" />
                Message specialist
              </button>
              <a
                href={`tel:${order.dealerContact}`}
                className="btn-secondary w-full"
              >
                <Phone className="h-4 w-4" />
                Call {order.dealerContact}
              </a>
            </div>
          </section>

          {/* Delivery */}
          <section className="rounded-2xl border border-white/[0.06] bg-ink-800/60 p-6">
            <h2 className="font-display text-base font-semibold text-white">Delivery</h2>
            <div className="mt-4 space-y-3 text-sm">
              <div>
                <div className="eyebrow">Method</div>
                <div className="mt-1 text-white">{order.delivery.method}</div>
              </div>
              <div>
                <div className="eyebrow">Address</div>
                <div className="mt-1 flex items-start gap-2 text-ink-100">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-300" />
                  <span className="min-w-0 flex-1 break-words">{order.delivery.address}</span>
                </div>
              </div>
              <div>
                <div className="eyebrow">Estimated arrival</div>
                <div className="mt-1 text-white">{order.eta}</div>
              </div>
            </div>
          </section>

          {/* Payment */}
          <section className="rounded-2xl border border-white/[0.06] bg-ink-800/60 p-6">
            <h2 className="font-display text-base font-semibold text-white">Payment</h2>
            <div className="mt-4 text-sm">
              <div className="eyebrow">Method</div>
              <div className="mt-1 text-white">{order.payment.method} ·••• {order.payment.last4}</div>
            </div>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/15 px-3 py-1 text-[11px] font-medium text-emerald-400">
              <Check className="h-3 w-3" />
              Paid
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={muted ? 'text-ink-300' : 'text-ink-200'}>{label}</span>
      <span className={'font-medium tabular-nums ' + (muted ? 'text-ink-300' : 'text-ink-50')}>
        {value}
      </span>
    </div>
  );
}
