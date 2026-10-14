import Link from 'next/link';
import {
  ArrowLeft, Printer, Mail, Phone, MapPin, CreditCard, Check,
  AlertCircle, Truck, Package, ClipboardList,
} from 'lucide-react';
import { getVehicleById, getHeroColor } from '@/lib/vehicles/data';
import { formatPrice } from '@/lib/utils/format';
import { StatusBadge, statusTone } from '@/components/ui';

export const metadata = { title: 'Order — Admin · mobileDrive' };

/**
 * In Phase 1 we don't have a real orders table in Supabase for every order id —
 * admin stays on the mock orders table. In production, swap this stub for
 *   const order = await (await getServerSupabase())?.from('orders')... .single()
 */
const MOCK_ORDER = {
  id: 'MD-2026-1038',
  placed: '2026-10-06T09:12:00+00:00',
  status: 'production' as 'pending' | 'paid' | 'production' | 'quality' | 'shipping' | 'delivered',
  buyer: {
    name: 'Asiamah Joshua',
    email: 'asiamah@mobiledrive.app',
    phone: '+233 55 123 4567',
    region: 'GH',
    tier: 'Premium',
  },
  delivery: {
    method: 'Door-to-door',
    etaWeeks: '3–4 weeks',
    address: '12 Independence Ave, Accra · Greater Accra · GA-123-4567, Ghana',
  },
  payment: {
    method: 'Card',
    last4: '4567',
    confirmed: true,
    providerRef: 'pi_3Phvy2EXAMPLE123',
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
  notes: 'Buyer confirmed Carbon Forged wheels upgrade pending approval.',
};

const STATUS_STEPS: Array<{ id: typeof MOCK_ORDER.status; label: string; icon: typeof Check }> = [
  { id: 'paid',       label: 'Payment confirmed', icon: Check },
  { id: 'production', label: 'In production',     icon: Package },
  { id: 'quality',    label: 'Quality check',     icon: ClipboardList },
  { id: 'shipping',   label: 'Shipping',          icon: Truck },
  { id: 'delivered',  label: 'Delivered',         icon: Check },
];

export default function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const order = { ...MOCK_ORDER, id: params.id || MOCK_ORDER.id };

  const stepIdx = STATUS_STEPS.findIndex((s) => s.id === order.status);

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
      {/* Breadcrumb + actions */}
      <div className="flex items-start justify-between gap-6">
        <div>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1.5 text-xs text-ink-100 hover:text-white"
          >
            <ArrowLeft className="h-3 w-3" />
            Orders
          </Link>
          <div className="mt-3 flex items-center gap-4">
            <h1 className="font-display text-display-md font-semibold text-white">
              {order.id}
            </h1>
            <StatusBadge tone={statusTone(order.status)} dot>
              {order.status === 'production' ? 'In production' : order.status[0].toUpperCase() + order.status.slice(1)}
            </StatusBadge>
          </div>
          <p className="mt-2 text-sm text-ink-200">
            Placed {new Date(order.placed).toLocaleString()} · {order.buyer.name}
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" className="btn-secondary">
            <Printer className="h-4 w-4" />
            Print
          </button>
          <button type="button" className="btn-primary">
            Advance status
          </button>
        </div>
      </div>

      {/* Progress tracker */}
      <section className="rounded-2xl border border-white/[0.06] bg-ink-800/60 p-6">
        <div className="flex items-center">
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
                      (current ? ' ring-2 ring-white/60 ring-offset-2 ring-offset-ink-900' : '')
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
                      'mx-3 h-0.5 flex-1 ' + (i < stepIdx ? 'bg-white/40' : 'bg-white/[0.08]')
                    }
                  />
                )}
              </div>
            );
          })}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Items */}
        <div className="space-y-6">
          <section className="rounded-2xl border border-white/[0.06] bg-ink-800/60 p-6">
            <h2 className="font-display text-lg font-semibold text-white">Items</h2>
            <div className="mt-5 space-y-4">
              {resolved.map((r) => (
                <div
                  key={r.v.id}
                  className="flex gap-4 rounded-xl border border-white/[0.04] bg-ink-700/40 p-4"
                >
                  <div
                    className="h-24 w-36 shrink-0 overflow-hidden rounded-lg"
                    style={{
                      background: `radial-gradient(60% 60% at 50% 50%, ${r.color.hex}cc, #0A0B0E 85%)`,
                    }}
                  >
                    <svg viewBox="0 0 150 100" className="h-full w-full" aria-hidden>
                      <path
                        d="M20,70 L35,50 Q58,38 75,37 Q92,38 115,50 L130,70 Q128,78 120,79 L115,79 Q113,73 106,73 Q99,73 97,79 L53,79 Q51,73 44,73 Q37,73 35,79 L30,79 Q22,78 20,70 Z"
                        fill={r.color.hex}
                      />
                      <circle cx="44" cy="76" r="7" fill="#0A0B0E" stroke="#2A2D33" />
                      <circle cx="106" cy="76" r="7" fill="#0A0B0E" stroke="#2A2D33" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="eyebrow">{r.v.brand} · {r.v.year}</div>
                    <div className="mt-0.5 font-display text-lg font-semibold text-white">
                      {r.v.model}
                    </div>
                    <div className="mt-2 grid gap-x-6 gap-y-1 text-xs text-ink-200 sm:grid-cols-2">
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
                    <div className="font-display text-xl font-semibold text-white tabular-nums">
                      {formatPrice(r.line, r.v.currency)}
                    </div>
                    <div className="mt-1 text-[11px] text-ink-200">
                      Base {formatPrice(r.unit, r.v.currency)}
                    </div>
                    <div className="text-[11px] text-ink-200">
                      Options +{formatPrice(r.options, r.v.currency)}
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
                <div className="eyebrow">Total</div>
                <div className="font-display text-3xl font-semibold text-white tabular-nums">
                  {formatPrice(grand)}
                </div>
              </div>
            </div>
          </section>

          {order.notes && (
            <section className="rounded-2xl border border-white/[0.06] bg-ink-800/60 p-6">
              <h2 className="font-display text-base font-semibold text-white">Internal notes</h2>
              <p className="mt-3 text-sm text-ink-100">{order.notes}</p>
              <div className="mt-4 inline-flex items-center gap-2 text-xs text-amber-300">
                <AlertCircle className="h-3.5 w-3.5" />
                Visible to admins and dealers only
              </div>
            </section>
          )}
        </div>

        {/* Right side: customer + payment + delivery */}
        <aside className="space-y-6">
          <section className="rounded-2xl border border-white/[0.06] bg-ink-800/60 p-6">
            <h2 className="font-display text-base font-semibold text-white">Customer</h2>
            <div className="mt-4 flex items-center gap-3">
              <div
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-xs font-semibold text-white"
                style={{ background: 'linear-gradient(135deg, #A078FF, #FF78A0)' }}
              >
                {order.buyer.name.split(' ').map((p) => p[0]).join('').slice(0, 2)}
              </div>
              <div>
                <div className="text-sm font-semibold text-white">{order.buyer.name}</div>
                <div className="text-[11px] text-ink-200">{order.buyer.tier} member</div>
              </div>
            </div>
            <div className="mt-5 space-y-2 text-sm">
              <ContactRow icon={Mail} value={order.buyer.email} />
              <ContactRow icon={Phone} value={order.buyer.phone} />
              <ContactRow icon={MapPin} value={order.delivery.address} />
            </div>
          </section>

          <section className="rounded-2xl border border-white/[0.06] bg-ink-800/60 p-6">
            <h2 className="font-display text-base font-semibold text-white">Payment</h2>
            <div className="mt-4 flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-white/10">
                <CreditCard className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">
                  {order.payment.method} ·••• {order.payment.last4}
                </div>
                <div className="text-[11px] text-ink-200">Ref {order.payment.providerRef}</div>
              </div>
            </div>
            <div className="mt-4">
              <StatusBadge tone="info" icon={<Check className="h-3 w-3" />}>
                Captured (mock)
              </StatusBadge>
            </div>
          </section>

          <section className="rounded-2xl border border-white/[0.06] bg-ink-800/60 p-6">
            <h2 className="font-display text-base font-semibold text-white">Delivery</h2>
            <div className="mt-4 space-y-2 text-sm text-ink-100">
              <div className="flex items-center justify-between">
                <span className="text-ink-200">Method</span>
                <span className="text-white">{order.delivery.method}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-200">ETA</span>
                <span className="text-white">{order.delivery.etaWeeks}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-200">Region</span>
                <span className="text-white">{order.buyer.region}</span>
              </div>
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

function ContactRow({
  icon: Icon,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2.5 text-ink-100">
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-300" />
      <span className="min-w-0 flex-1 break-words">{value}</span>
    </div>
  );
}
