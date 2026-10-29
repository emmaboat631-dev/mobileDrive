'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCcw } from 'lucide-react';
import { cancelOrder } from '@/lib/orders/admin-actions';
import { formatPrice } from '@/lib/utils/format';
import { toast } from '@/store/toastStore';

export function RefundButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function onClick() {
    if (!window.confirm('Refund this order through Paystack? The buyer gets their money back and the order is marked cancelled.')) {
      return;
    }
    start(async () => {
      const result = await cancelOrder(orderId);
      if (!result.ok) {
        toast.error('Refund failed', result.message);
        return;
      }
      if ('refunded' in result && result.refunded) {
        toast.success('Refunded', `${formatPrice(result.refunded.amount)} ${result.refunded.currency} returned to the buyer.`);
      } else {
        toast.success('Order cancelled', 'No Paystack refund fired — issue manually if needed.');
      }
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className="inline-flex h-10 items-center gap-2 rounded-full border border-red-400/30 bg-red-500/10 px-5 text-sm font-medium text-red-200 transition hover:bg-red-500/15 disabled:opacity-60"
    >
      <RefreshCcw className="h-4 w-4" />
      {pending ? 'Refunding…' : 'Refund'}
    </button>
  );
}
