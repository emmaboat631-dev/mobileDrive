'use client';

import { useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Check, Lock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { PAYMENT_METHODS, type PaymentMethodId } from '@/lib/payments/providers';
import { cartTotals, resolveLine, useCart } from '@/store/cartStore';
import { placeOrder } from '@/lib/orders/actions';

const STEPS = ['Customer', 'Delivery', 'Payment', 'Review'] as const;

export default function CheckoutPage() {
  const router = useRouter();
  const [stepIdx] = useState(1); // Delivery
  const [payment, setPayment] = useState<PaymentMethodId>('card');
  const [delivery, setDelivery] = useState<'door' | 'pickup'>('door');
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const items = useCart((s) => s.items);
  const hydrated = useCart((s) => s.hydrated);
  const clearCart = useCart((s) => s.clear);
  const resolved = items.map(resolveLine).filter((r): r is NonNullable<typeof r> => r !== null);
  const totals = cartTotals(resolved);

  function readAddr(form: HTMLFormElement) {
    const data = new FormData(form);
    return {
      fullName: String(data.get('full_name') ?? ''),
      phone: String(data.get('phone') ?? ''),
      street: String(data.get('street') ?? ''),
      city: String(data.get('city') ?? ''),
      region: String(data.get('region') ?? ''),
      postalCode: String(data.get('postal_code') ?? ''),
    };
  }

  function handlePlaceOrder() {
    setError(null);
    if (resolved.length === 0) {
      setError('Your cart is empty.');
      return;
    }
    const form = formRef.current;
    if (!form) return;
    const addr = readAddr(form);

    start(async () => {
      const result = await placeOrder({
        items: resolved.map((it) => ({
          vehicleId: it.vehicle.id,
          configuration: {
            vehicleId: it.vehicle.id,
            colorId: it.color.id,
            wheelId: it.wheel.id,
            interiorId: it.interior.id,
            packageIds: it.packages.map((p) => p.id),
          },
          unitPrice: it.vehicle.price,
          optionsPrice: it.options,
          lineTotal: it.total,
        })),
        subtotal: totals.subtotal,
        optionsTotal: totals.options,
        taxes: totals.taxes,
        grandTotal: totals.grand,
        currency: resolved[0].vehicle.currency,
        deliveryMethod: delivery,
        deliveryAddress: addr,
        paymentMethod: payment,
      });

      if (!result.ok) {
        setError(result.message);
        return;
      }
      clearCart();
      router.push(`/checkout/confirmation?order=${encodeURIComponent(result.orderId)}${result.mock ? '&mock=1' : ''}`);
    });
  }

  return (
    <section className="container-page pb-20 pt-28">
      {/* Progress */}
      <nav aria-label="Checkout steps" className="mb-10 flex items-center justify-between">
        {STEPS.map((label, i) => {
          const done = i < stepIdx;
          const current = i === stepIdx;
          const active = i <= stepIdx;
          return (
            <div key={label} className="flex flex-1 items-center">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition',
                    active ? 'bg-white text-ink-900' : 'bg-ink-700 text-ink-200',
                    current && 'ring-2 ring-white/60 ring-offset-2 ring-offset-ink-900',
                  )}
                >
                  {done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : i + 1}
                </div>
                <span
                  className={cn(
                    'text-sm',
                    current ? 'font-semibold text-white' : active ? 'font-medium text-white' : 'text-ink-200',
                  )}
                >
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    'mx-4 h-px flex-1',
                    done ? 'bg-white/40' : 'bg-white/10',
                  )}
                />
              )}
            </div>
          );
        })}
      </nav>

      <form ref={formRef} onSubmit={(e) => { e.preventDefault(); handlePlaceOrder(); }} className="grid gap-6 lg:grid-cols-[1fr_440px]">
        <div className="space-y-6">
          {/* Delivery */}
          <section className="rounded-3xl border border-white/[0.06] bg-ink-800/60 p-7">
            <header className="mb-5 flex items-center justify-between">
              <div>
                <div className="eyebrow">Step 2</div>
                <h2 className="mt-1 font-display text-xl font-semibold text-white">Delivery</h2>
              </div>
              <span className="text-xs text-ink-200">Shipping to Ghana</span>
            </header>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { id: 'door' as const, name: 'Door-to-door', desc: 'Direct to your address, 3–4 weeks', price: 'Included' },
                { id: 'pickup' as const, name: 'Dealer pickup', desc: 'Collect from mobileDrive showroom', price: 'Save $400' },
              ].map((opt) => {
                const active = delivery === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setDelivery(opt.id)}
                    className={cn(
                      'rounded-xl border p-4 text-left transition',
                      active
                        ? 'border-white bg-white/[0.06]'
                        : 'border-white/10 bg-ink-700/60 hover:border-white/25',
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-white">{opt.name}</span>
                      <span className="text-xs text-ink-100">{opt.price}</span>
                    </div>
                    <p className="mt-1 text-xs text-ink-200">{opt.desc}</p>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field name="full_name" label="FULL NAME" defaultValue="Asiamah Joshua" />
                <Field name="phone" label="PHONE" defaultValue="+233 55 123 4567" />
              </div>
              <Field name="street" label="STREET ADDRESS" defaultValue="12 Independence Ave" />
              <div className="grid gap-4 sm:grid-cols-3">
                <Field name="city" label="CITY" defaultValue="Accra" />
                <Field name="region" label="REGION" defaultValue="Greater Accra" />
                <Field name="postal_code" label="POSTAL CODE" defaultValue="GA-123-4567" />
              </div>
            </div>
          </section>

          {/* Payment */}
          <section className="rounded-3xl border border-white/[0.06] bg-ink-800/60 p-7">
            <header className="mb-5">
              <div className="eyebrow">Step 3</div>
              <h2 className="mt-1 font-display text-xl font-semibold text-white">Payment method</h2>
            </header>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {PAYMENT_METHODS.slice(0, 4).map((m) => {
                const active = payment === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPayment(m.id)}
                    className={cn(
                      'rounded-xl border p-3.5 text-left transition',
                      active
                        ? 'border-white bg-white/[0.06]'
                        : 'border-white/10 bg-ink-700/60 hover:border-white/25',
                    )}
                  >
                    <div className="text-sm font-semibold text-white">{m.name}</div>
                    <div className="mt-0.5 text-[10px] text-ink-200">{m.subtitle}</div>
                  </button>
                );
              })}
            </div>

            {payment === 'card' && (
              <div className="mt-5 grid gap-4">
                <Field label="CARD NUMBER" defaultValue="•••• •••• •••• 4567" />
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="EXPIRY" defaultValue="12/27" />
                  <Field label="CVC" defaultValue="•••" />
                  <Field label="ZIP" defaultValue="GA-123" />
                </div>
              </div>
            )}

            {payment !== 'card' && (
              <div className="mt-5 grid gap-4">
                <Field label="MOBILE NUMBER" placeholder="024 123 4567" />
                <p className="text-xs text-ink-200">
                  You'll receive a prompt on your phone to authorise the payment.
                </p>
              </div>
            )}
          </section>
        </div>

        {/* Summary */}
        <aside className="h-fit rounded-3xl border border-white/[0.06] bg-ink-800/80 p-6">
          <h2 className="font-display text-lg font-semibold text-white">Your order</h2>

          {!hydrated ? (
            <div className="mt-5 h-20 animate-pulse rounded-lg bg-white/[0.03]" />
          ) : resolved.length === 0 ? (
            <div className="mt-5 rounded-lg border border-white/[0.06] bg-ink-700/40 p-4 text-xs text-ink-200">
              Your cart is empty. <Link href="/vehicles" className="text-white underline">Browse vehicles →</Link>
            </div>
          ) : (
            <div className="mt-5 space-y-3.5">
              {resolved.map((it) => (
                <div key={it.id} className="flex items-center gap-3">
                  <div
                    className="h-14 w-20 shrink-0 rounded-lg"
                    style={{
                      background: `radial-gradient(60% 60% at 50% 50%, ${it.color.hex}cc, #0A0B0E 85%)`,
                    }}
                  >
                    <div
                      className="mx-auto mt-9 h-2.5 w-12 rounded-full"
                      style={{ background: it.color.hex }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] text-ink-200">{it.vehicle.brand}</div>
                    <div className="truncate text-sm font-medium text-white">{it.vehicle.model}</div>
                  </div>
                  <div className="text-sm font-semibold text-white">${it.total.toLocaleString()}</div>
                </div>
              ))}
            </div>
          )}

          <div className="my-5 h-px bg-white/[0.06]" />

          <div className="space-y-2.5 text-sm">
            <Row label="Subtotal" value={`$${totals.subtotal.toLocaleString()}`} />
            <Row label="Options" value={`+$${totals.options.toLocaleString()}`} />
            <Row label="Delivery" value="Included" muted />
            <Row label="Taxes & fees" value={`+$${totals.taxes.toLocaleString()}`} />
          </div>

          <div className="my-5 h-px bg-white/[0.06]" />

          <div className="flex items-baseline justify-between">
            <div className="eyebrow">Total</div>
            <div className="font-display text-3xl font-semibold text-white">
              ${totals.grand.toLocaleString()}
            </div>
          </div>

          {error && (
            <div className="mt-5 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={pending || !hydrated}
            className="btn-primary mt-5 w-full disabled:opacity-60"
          >
            {pending ? 'Placing order…' : 'Place Order'}
            {!pending && <ArrowRight className="h-4 w-4" />}
          </button>

          <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-ink-200">
            <Lock className="h-3 w-3" />
            Secure checkout · 256-bit encryption
          </div>
        </aside>
      </form>
    </section>
  );
}

function Field({
  name,
  label,
  defaultValue,
  placeholder,
}: {
  name?: string;
  label: string;
  defaultValue?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="eyebrow block">{label}</span>
      <input
        type="text"
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-ink-700 px-4 text-sm text-white placeholder:text-ink-300 focus:border-white/30 focus:outline-none"
      />
    </label>
  );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={muted ? 'text-ink-300' : 'text-ink-200'}>{label}</span>
      <span className={'font-medium ' + (muted ? 'text-ink-300' : 'text-ink-50')}>{value}</span>
    </div>
  );
}
