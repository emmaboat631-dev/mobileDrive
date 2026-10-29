import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Mail, MapPin, CreditCard, Check, Package, ClipboardList, Truck, X } from 'lucide-react';
import { formatPrice, relativeTime } from '@/lib/utils/format';
import { StatusBadge, statusTone } from '@/components/ui';
import { fetchOrderById, fetchVehicleById } from '@/lib/admin/queries';
import { StatusActionButton } from './StatusActionButton';

export const metadata = { title: 'Order — Admin · mobileDrive' };
export const dynamic = 'force-dynamic';

type OrderStatus = 'pending' | 'paid' | 'production' | 'quality' | 'shipping' | 'delivered' | 'cancelled';

const STATUS_STEPS: Array<{ id: OrderStatus; label: string; icon: typeof Check }> = [
  { id: 'paid',       label: 'Payment confirmed', icon: Check },
  { id: 'production', label: 'In production',     icon: Package },
  { id: 'quality',    label: 'Quality check',     icon: ClipboardList },
  { id: 'shipping',   label: 'Shipping',          icon: Truck },
  { id: 'delivered',  label: 'Delivered',         icon: Check },
];

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  pending:    'paid',
  paid:       'production',
  production: 'quality',
  quality:    'shipping',
  shipping:   'delivered',
};

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const order = await fetchOrderById(params.id);
  if (!order) notFound();

  const vehicles = await Promise.all(
    order.items.map(async (it) => ({ item: it, vehicle: await fetchVehicleById(it.vehicle_id) })),
  );

  const addr = order.delivery_address as Record<string, string>;
  const next = NEXT_STATUS[order.status as OrderStatus];
  const canCancel = order.status !== 'cancelled' && order.status !== 'delivered';
  const stepIdx = STATUS_STEPS.findIndex((s) => s.id === order.status);

  return (
    <div className="space-y-6">
      {/* Breadcrumb + actions */}
      <div className="flex items-start justify-between gap-6">
        <div>
          <Link href="/admin/orders" className="inline-flex items-center gap-1.5 text-xs text-ink-100 hover:text-white">
            <ArrowLeft className="h-3 w-3" />
            Orders
          </Link>
          <div className="mt-3 flex items-center gap-4">
            <h1 className="font-display text-display-md font-semibold text-white">
              {order.id.slice(0, 8).toUpperCase()}
            </h1>
            <StatusBadge tone={statusTone(order.status)} dot>
              {order.status[0].toUpperCase() + order.status.slice(1)}
            </StatusBadge>
          </div>
          <p className="mt-2 text-sm text-ink-200">
            Placed {relativeTime(order.created_at)} · {order.buyer_name ?? order.buyer_email ?? '—'}
          </p>
        </div>
        <div className="flex gap-2">
          {next && (
            <StatusActionButton
              orderId={order.id}
              status={next}
              label={`Advance to ${STATUS_STEPS.find((s) => s.id === next)?.label ?? next}`}
            />
          )}
          {canCancel && (
            <StatusActionButton
              orderId={order.id}
              status="cancelled"
              label="Cancel"
              danger
              icon={<X className="h-4 w-4" />}
            />
          )}
        </div>
      </div>

      {/* Status tracker */}
      <div className="rounded-2xl border border-white/[0.06] bg-ink-800/60 p-6">
        <div className="eyebrow mb-4">Fulfilment</div>
        <div className="flex items-center">
          {STATUS_STEPS.map((step, i) => {
            const done = stepIdx >= 0 && i <= stepIdx;
            const current = i === stepIdx;
            const Icon = step.icon;
            return (
              <div key={step.id} className="flex flex-1 items-center last:flex-none">
                <div className="flex min-w-0 flex-col items-center text-center">
                  <div className={'grid h-8 w-8 place-items-center rounded-full ' + (done ? 'bg-white text-ink-900' : 'bg-ink-700 text-ink-200') + (current ? ' ring-2 ring-white/60 ring-offset-2 ring-offset-ink-900' : '')}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <span className={'mt-2 w-24 text-[10px] leading-tight ' + (current ? 'font-semibold text-white' : done ? 'text-white' : 'text-ink-300')}>
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
      </div>

      {/* Two column */}
      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        {/* Items + totals */}
        <section className="rounded-2xl border border-white/[0.06] bg-ink-800/60 p-6">
          <div className="eyebrow mb-4">Line items</div>
          <ul className="divide-y divide-white/[0.04]">
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
          <dl className="mt-6 space-y-2 border-t border-white/[0.06] pt-5 text-sm">
            <Row k="Subtotal" v={formatPrice(order.subtotal)} />
            <Row k="Options" v={formatPrice(order.options_total)} />
            <Row k="Taxes" v={formatPrice(order.taxes)} />
            <Row k="Total" v={formatPrice(order.grand_total)} bold />
          </dl>
        </section>

        {/* Buyer + delivery + payment */}
        <section className="space-y-4">
          <div className="rounded-2xl border border-white/[0.06] bg-ink-800/60 p-6">
            <div className="eyebrow mb-3">Buyer</div>
            <div className="font-medium text-white">{order.buyer_name ?? '—'}</div>
            {order.buyer_email && (
              <a href={`mailto:${order.buyer_email}`} className="mt-1 inline-flex items-center gap-1 text-xs text-ink-200 hover:text-white">
                <Mail className="h-3 w-3" /> {order.buyer_email}
              </a>
            )}
          </div>
          <div className="rounded-2xl border border-white/[0.06] bg-ink-800/60 p-6">
            <div className="eyebrow mb-3">Delivery</div>
            <div className="flex items-start gap-2 text-sm text-ink-100">
              <MapPin className="mt-0.5 h-3.5 w-3.5 text-ink-200" />
              <div className="min-w-0">
                <div className="font-medium capitalize text-white">{order.delivery_method}</div>
                <div className="mt-1 text-[11px] text-ink-200">
                  {[addr?.street, addr?.city, addr?.region, addr?.postalCode].filter(Boolean).join(', ') || '—'}
                </div>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-white/[0.06] bg-ink-800/60 p-6">
            <div className="eyebrow mb-3">Payment</div>
            <div className="flex items-start gap-2 text-sm text-ink-100">
              <CreditCard className="mt-0.5 h-3.5 w-3.5 text-ink-200" />
              <div className="min-w-0">
                <div className="font-medium text-white capitalize">{order.payment_method}</div>
                {order.payment_provider_id && (
                  <div className="mt-1 truncate text-[11px] text-ink-200 font-mono">
                    {order.payment_provider_id}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function Row({ k, v, bold }: { k: string; v: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <dt className={bold ? 'text-sm font-semibold text-white' : 'text-xs uppercase tracking-wider text-ink-300'}>{k}</dt>
      <dd className={'tabular-nums ' + (bold ? 'text-base font-semibold text-white' : 'text-sm text-ink-100')}>{v}</dd>
    </div>
  );
}
