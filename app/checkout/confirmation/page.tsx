import Link from 'next/link';
import { Check, ArrowRight, AlertTriangle } from 'lucide-react';
import { StatusBadge } from '@/components/ui';

export const metadata = { title: 'Order received — mobileDrive' };

/**
 * Order confirmation. mobileDrive currently uses mock payment providers
 * (see lib/payments/providers.ts), so this page never claims payment has
 * been successfully taken. It confirms that the ORDER was received and that
 * a specialist will follow up to finalise payment.
 */
export default function ConfirmationPage({
  searchParams,
}: {
  searchParams: { order?: string; mock?: string };
}) {
  const orderId = searchParams.order ?? 'MD-UNKNOWN';
  const demo = searchParams.mock === '1';

  return (
    <section className="container-page pb-20 pt-28">
      <div className="mx-auto max-w-xl text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/15 bg-ink-800">
          <Check className="h-7 w-7 text-white" strokeWidth={3} />
        </div>
        <div className="eyebrow mt-6">Order received</div>
        <h1 className="mt-2 font-display text-display-md font-semibold text-white">
          Thanks — we have your order.
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-ink-100">
          A mobileDrive specialist will contact you within one business day to
          finalise payment and schedule production. Payment is not yet complete.
        </p>

        <div className="mt-10 rounded-2xl border border-white/[0.06] bg-ink-800/60 p-6 text-left">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
            <div>
              <div className="eyebrow">Order #</div>
              <div className="mt-1 font-display text-lg font-semibold text-white">{orderId}</div>
            </div>
            <StatusBadge tone="warning" dot>Awaiting payment</StatusBadge>
          </div>

          <div className="mt-5 grid gap-4 text-sm sm:grid-cols-3">
            <div>
              <div className="eyebrow">Next step</div>
              <div className="mt-1 text-white">Payment confirmation</div>
            </div>
            <div>
              <div className="eyebrow">Estimated delivery</div>
              <div className="mt-1 text-white">3–4 weeks after payment</div>
            </div>
            <div>
              <div className="eyebrow">Specialist</div>
              <div className="mt-1 text-white">Assigned shortly</div>
            </div>
          </div>
        </div>

        {demo && (
          <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-left text-[11px] text-amber-200">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              This is a local demo order. No payment was processed and no record is
              stored in a database. Configure Supabase and a real payment adapter to
              take real orders.
            </span>
          </div>
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
