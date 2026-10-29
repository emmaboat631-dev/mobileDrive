import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Check, Package, ClipboardList, Truck, Download, MessageSquare, Phone, MapPin } from 'lucide-react';
import { formatPrice, relativeTime } from '@/lib/utils/format';
import { fetchOrderById, fetchVehicleById } from '@/lib/admin/queries';
import { getCurrentUser } from '@/lib/auth/currentUser';

export const metadata = { title: 'Order — Account · mobileDrive' };
export const dynamic = 'force-dynamic';

type OrderStatus = 'pending' | 'paid' | 'production' | 'quality' | 'shipping' | 'delivered' | 'cancelled';

const STATUS_STEPS: Array<{
  id: OrderStatus;
  label: string;
  icon: typeof Check;
  description: string;
}> = [
  { id: 'paid',       label: 'Payment confirmed', icon: Check,         description: 'Your deposit has been received.' },
  { id: 'production', label: 'In production',     icon: Package,       description: 'Your vehicle is being built.' },
  { id: 'quality',    label: 'Quality check',     icon: ClipboardList, description: 'Pre-delivery inspection and setup.' },
  { id: 'shipping',   label: 'Shipping',          icon: Truck,         description: 'En route via secure transport.' },
  { id: 'delivered',  label: 'Delivered',         icon: Check,         description: 'Vehicle handed over.' },
];

export default async function AccountOrderDetailPage({ params }: { params: { id: string } }) {
  const [order, user] = await Promise.all([fetchOrderById(params.id), getCurrentUser()]);
  if (!order) notFound();
  // Buyer-only guard — RLS also protects, but this keeps the URL honest.
  if (user && user.id !== order.user_id && user.role === 'customer') notFound();

  const vehicles = await Promise.all(
    order.items.map(async (it) => ({ item: it, vehicle: await fetchVehicleById(it.vehicle_id) })),
  );

  const stepIdx = STATUS_STEPS.findIndex((s) => s.id === order.status);
  const currentStep = STATUS_STEPS[stepIdx];
  const addr = order.delivery_address as Record<string, string>;

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
            <div className="eyebrow">Order {order.id.slice(0, 8).toUpperCase()}</div>
            <h1 className="mt-2 font-display text-display-md font-semibold text-white">
              {vehicles[0]?.vehicle ? `${vehicles[0].vehicle.brand} ${vehicles[0].vehicle.model}` : 'Your order'}
            </h1>
            <p className="mt-2 text-sm text-ink-200">
              Placed {relativeTime(order.created_at)}
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/15 px-3 py-1.5 text-xs font-medium text-amber-300">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            {currentStep?.label ?? order.status[0].toUpperCase() + order.status.slice(1)}
          </span>
        </div>

        {/* Progress tracker */}
        {order.status !== 'cancelled' && (
          <>
            <div className="mt-8 flex items-center">
              {STATUS_STEPS.map((step, i) => {
                const done = stepIdx >= 0 && i <= stepIdx;
                const current = i === stepIdx;
                const Icon = step.icon;
                return (
                  <div key={step.id} className="flex flex-1 items-center last:flex-none">
                    <div className="flex min-w-0 flex-col items-center text-center">
                      <div className={'grid h-10 w-10 place-items-center rounded-full ' + (done ? 'bg-white text-ink-900' : 'bg-ink-700 text-ink-200') + (current ? ' ring-2 ring-white/60 ring-offset-2 ring-offset-ink-800' : '')}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className={'mt-2 w-24 text-[11px] leading-tight ' + (current ? 'font-semibold text-white' : done ? 'text-white' : 'text-ink-300')}>
                        {step.label}
                      </span>
                    </div>
                    {i < STATUS_STEPS.length - 1 && (
                      <div className={'mx-3 h-0.5 flex-1 ' + (i < stepIdx ? 'bg-white/40' : 'bg-white/[0.08]')} />
                    )}
                  </div>
                );
              })}
            </div>

            {currentStep?.description && (
              <p className="mt-6 rounded-xl border border-white/[0.06] bg-ink-700/40 px-4 py-3 text-sm text-ink-100">
                <span className="font-medium text-white">What&apos;s happening now:</span>{' '}
                {currentStep.description}
              </p>
            )}
          </>
        )}
        {order.status === 'cancelled' && (
          <p className="mt-6 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            This order was cancelled. If you were charged, the refund has been requested.
          </p>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          {/* Vehicle */}
          <section className="rounded-2xl border border-white/[0.06] bg-ink-800/60 p-6">
            <h2 className="font-display text-lg font-semibold text-white">Your build</h2>
            <ul className="mt-5 divide-y divide-white/[0.04]">
              {vehicles.map(({ item, vehicle }) => (
                <li key={item.vehicle_id} className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <div className="font-medium text-white">
                      {vehicle ? `${vehicle.brand} ${vehicle.model}` : item.vehicle_id}
                    </div>
                    <div className="mt-1 text-[11px] text-ink-200">
                      Base {formatPrice(item.unit_price)} · Options {formatPrice(item.options_price)}
                    </div>
                  </div>
                  <div className="shrink-0 font-medium text-white tabular-nums">
                    {formatPrice(item.line_total)}
                  </div>
                </li>
              ))}
            </ul>

            <dl className="mt-6 space-y-2.5 border-t border-white/[0.06] pt-5 text-sm">
              <Row label="Subtotal" value={formatPrice(order.subtotal)} />
              <Row label="Options" value={`+${formatPrice(order.options_total)}`} />
              <Row label="Delivery" value="Included" muted />
              <Row label="Taxes & fees" value={`+${formatPrice(order.taxes)}`} />
              <div className="mt-4 flex items-baseline justify-between border-t border-white/[0.06] pt-4">
                <div className="eyebrow">Total paid</div>
                <div className="font-display text-3xl font-semibold text-white tabular-nums">
                  {formatPrice(order.grand_total)}
                </div>
              </div>
            </dl>

            <div className="mt-6 flex flex-wrap gap-2">
              <button type="button" className="btn-secondary" disabled>
                <Download className="h-4 w-4" />
                Invoice (PDF)
              </button>
              <button type="button" className="btn-secondary" disabled>
                Order confirmation
              </button>
            </div>
          </section>
        </div>

        {/* Right side */}
        <aside className="space-y-6">
          <section className="rounded-2xl border border-white/[0.06] bg-ink-800/60 p-6">
            <h3 className="font-display text-base font-semibold text-white">Delivery</h3>
            <div className="mt-3 flex items-start gap-2 text-sm text-ink-100">
              <MapPin className="mt-0.5 h-3.5 w-3.5 text-ink-200" />
              <div className="min-w-0">
                <div className="font-medium capitalize text-white">{order.delivery_method}</div>
                <div className="mt-1 text-[11px] text-ink-200">
                  {[addr?.street, addr?.city, addr?.region, addr?.postalCode].filter(Boolean).join(', ') || '—'}
                </div>
              </div>
            </div>
          </section>
          <section className="rounded-2xl border border-white/[0.06] bg-ink-800/60 p-6">
            <h3 className="font-display text-base font-semibold text-white">Need help?</h3>
            <p className="mt-2 text-xs text-ink-200">
              Your dealer specialist will reach out as soon as production begins. In the meantime:
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <a href="tel:+233302991990" className="btn-secondary w-full">
                <Phone className="h-4 w-4" />
                Call mobileDrive Accra
              </a>
              <button type="button" className="btn-secondary w-full">
                <MessageSquare className="h-4 w-4" />
                Message specialist
              </button>
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
      <dt className={muted ? 'text-xs uppercase tracking-wider text-ink-300' : 'text-xs uppercase tracking-wider text-ink-300'}>
        {label}
      </dt>
      <dd className={'tabular-nums ' + (muted ? 'text-sm text-ink-200' : 'text-sm text-ink-100')}>{value}</dd>
    </div>
  );
}
