'use client';

import Link from 'next/link';
import { ArrowRight, Edit3, Heart, Trash2, ShoppingBag } from 'lucide-react';
import { cartTotals, resolveLine, useCart } from '@/store/cartStore';
import { formatPrice } from '@/lib/utils/format';

export function CartClient() {
  const items = useCart((s) => s.items);
  const hydrated = useCart((s) => s.hydrated);
  const remove = useCart((s) => s.remove);

  // Avoid hydration mismatch: show a stable placeholder until the client store has rehydrated.
  if (!hydrated) {
    return (
      <section className="container-page pb-20 pt-28">
        <div className="eyebrow mb-2">Your garage</div>
        <h1 className="font-display text-display-lg font-semibold text-white">Your cart</h1>
        <div className="mt-10 h-40 animate-pulse rounded-2xl border border-white/[0.06] bg-ink-800/40" />
      </section>
    );
  }

  const resolved = items.map(resolveLine).filter((r): r is NonNullable<typeof r> => r !== null);

  if (resolved.length === 0) {
    return (
      <section className="container-page pb-20 pt-28">
        <div className="eyebrow mb-2">Your garage</div>
        <h1 className="font-display text-display-lg font-semibold text-white">
          Your cart is empty.
        </h1>
        <p className="mt-4 max-w-xl text-ink-100">
          Browse the marketplace and configure a vehicle to add it here.
        </p>
        <Link href="/vehicles" className="btn-primary mt-8">
          Explore vehicles
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    );
  }

  const totals = cartTotals(resolved);

  return (
    <section className="container-page pb-20 pt-28">
      <div className="mb-10">
        <div className="eyebrow mb-2">Your garage</div>
        <h1 className="font-display text-display-lg font-semibold text-white">Your cart</h1>
        <p className="mt-3 text-sm text-ink-200">
          {resolved.length} item{resolved.length === 1 ? '' : 's'} · Review before checkout
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_440px]">
        <div className="space-y-4">
          {resolved.map((it) => (
            <article
              key={it.id}
              className="flex gap-5 rounded-2xl border border-white/[0.06] bg-ink-800/60 p-5"
            >
              <div
                className="h-32 w-48 shrink-0 overflow-hidden rounded-xl"
                style={{
                  background: `radial-gradient(60% 60% at 50% 50%, ${it.color.hex}cc, #0A0B0E 85%)`,
                }}
              >
                <svg viewBox="0 0 200 128" className="h-full w-full" aria-hidden>
                  <path
                    d="M30,90 L50,65 Q80,50 100,49 Q120,50 150,65 L170,90 Q168,100 158,101 L152,101 Q149,94 142,94 Q135,94 133,101 L67,101 Q65,94 58,94 Q51,94 48,101 L42,101 Q32,100 30,90 Z"
                    fill={it.color.hex}
                  />
                  <path
                    d="M72,65 Q90,56 100,55 Q110,56 128,65 L124,72 L76,72 Z"
                    fill="#0A0C10"
                    opacity="0.9"
                  />
                  <circle cx="58" cy="98" r="10" fill="#0A0B0E" stroke="#2A2D33" />
                  <circle cx="142" cy="98" r="10" fill="#0A0B0E" stroke="#2A2D33" />
                </svg>
              </div>

              <div className="min-w-0 flex-1">
                <div className="eyebrow">{it.vehicle.brand} · {it.vehicle.year}</div>
                <h2 className="mt-1 font-display text-xl font-semibold text-white">
                  {it.vehicle.model}
                </h2>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <ConfigTag>{it.color.name}</ConfigTag>
                  <ConfigTag>{it.wheel.name} wheels</ConfigTag>
                  <ConfigTag>{it.interior.name}</ConfigTag>
                  {it.packages.map((p) => (
                    <ConfigTag key={p.id}>{p.name}</ConfigTag>
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-5 text-xs text-ink-100">
                  <Link
                    href={`/configure/${it.vehicle.id}`}
                    className="inline-flex items-center gap-1.5 hover:text-white"
                  >
                    <Edit3 className="h-3 w-3" />
                    Edit configuration
                  </Link>
                  <button type="button" className="inline-flex items-center gap-1.5 hover:text-white">
                    <Heart className="h-3 w-3" />
                    Save for later
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(it.id)}
                    className="inline-flex items-center gap-1.5 text-ink-100 hover:text-white"
                  >
                    <Trash2 className="h-3 w-3" />
                    Remove
                  </button>
                </div>
              </div>

              <div className="shrink-0 text-right">
                <div className="font-display text-2xl font-semibold text-white">
                  {formatPrice(it.total, it.vehicle.currency)}
                </div>
                <div className="mt-1 text-[11px] text-ink-200">
                  Base {formatPrice(it.vehicle.price, it.vehicle.currency)}
                </div>
                <div className="text-[11px] text-ink-200">
                  Options +{formatPrice(it.options, it.vehicle.currency)}
                </div>
              </div>
            </article>
          ))}
        </div>

        <aside className="h-fit rounded-2xl border border-white/[0.06] bg-ink-800/80 p-6">
          <h2 className="font-display text-lg font-semibold text-white">Order summary</h2>

          <div className="mt-5 space-y-2.5 text-sm">
            <Row label={`Subtotal (${resolved.length} vehicle${resolved.length === 1 ? '' : 's'})`} value={formatPrice(totals.subtotal)} />
            <Row label="Options" value={`+${formatPrice(totals.options)}`} />
            <Row label="Delivery" value="Included" muted />
            <Row label="Taxes & fees" value={`+${formatPrice(totals.taxes)}`} />
          </div>

          <div className="my-5 h-px bg-white/[0.06]" />

          <div className="flex items-baseline justify-between">
            <div className="eyebrow">Total</div>
            <div className="font-display text-3xl font-semibold text-white">
              {formatPrice(totals.grand)}
            </div>
          </div>

          <div className="mt-4 inline-flex items-center gap-2 text-xs text-ink-100">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Estimated delivery 3–4 weeks
          </div>

          <Link href="/checkout" className="btn-primary mt-5 w-full">
            <ShoppingBag className="h-4 w-4" />
            Proceed to Checkout
          </Link>

          <div className="mt-3 flex h-10 items-center justify-between rounded-full border border-white/10 px-4">
            <input
              type="text"
              placeholder="Promo code"
              className="flex-1 bg-transparent text-xs text-white placeholder:text-ink-300 focus:outline-none"
            />
            <button type="button" className="text-xs font-medium text-white hover:text-ink-50">
              Apply
            </button>
          </div>
        </aside>
      </div>
    </section>
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

function ConfigTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-white/[0.08] bg-ink-700/60 px-2 py-0.5 text-[10px] text-ink-100">
      {children}
    </span>
  );
}
