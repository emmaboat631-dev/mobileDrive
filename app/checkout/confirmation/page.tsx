import Link from 'next/link';
import { Check, ArrowRight, Package } from 'lucide-react';

export const metadata = { title: 'Order placed — mobileDrive' };

export default function ConfirmationPage({
  searchParams,
}: {
  searchParams: { order?: string; mock?: string };
}) {
  const orderId = searchParams.order ?? 'MD-UNKNOWN';
  const mock = searchParams.mock === '1';

  return (
    <section className="container-page pb-20 pt-28">
      <div className="mx-auto max-w-xl text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white">
          <Check className="h-7 w-7 text-ink-900" strokeWidth={3} />
        </div>
        <div className="eyebrow mt-6">Order placed</div>
        <h1 className="mt-2 font-display text-display-md font-semibold text-white">
          Thank you — we're on it.
        </h1>
        <p className="mt-4 text-sm text-ink-100">
          Your order has been received. We'll email you production and delivery updates as your
          vehicle moves through each stage.
        </p>

        <div className="mt-10 rounded-2xl border border-white/[0.06] bg-ink-800/60 p-6 text-left">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
            <div>
              <div className="eyebrow">Order #</div>
              <div className="mt-1 font-display text-lg font-semibold text-white">{orderId}</div>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-400/15 px-3 py-1.5 text-xs font-medium text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Confirmed
            </span>
          </div>

          <div className="mt-5 grid gap-4 text-sm sm:grid-cols-3">
            <div>
              <div className="eyebrow">Next step</div>
              <div className="mt-1 text-white">Production kick-off</div>
            </div>
            <div>
              <div className="eyebrow">Estimated delivery</div>
              <div className="mt-1 text-white">3–4 weeks</div>
            </div>
            <div>
              <div className="eyebrow">Specialist</div>
              <div className="mt-1 text-white">Assigned shortly</div>
            </div>
          </div>
        </div>

        {mock && (
          <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-ink-800/60 px-3 py-1.5 text-[11px] text-ink-200">
            <Package className="h-3 w-3" />
            Local demo order — set up Supabase in <code className="text-white">.env.local</code> to persist orders.
          </p>
        )}

        <div className="mt-10 flex items-center justify-center gap-3">
          <Link href="/account" className="btn-primary">
            Track in your garage
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/vehicles" className="btn-secondary">
            Keep exploring
          </Link>
        </div>
      </div>
    </section>
  );
}
