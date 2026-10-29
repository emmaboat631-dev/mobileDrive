'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { setOrderStatus, cancelOrder, type OrderStatus } from '@/lib/orders/admin-actions';
import { formatPrice } from '@/lib/utils/format';
import { toast } from '@/store/toastStore';
import { cn } from '@/lib/utils/cn';

/**
 * Status transition button for /admin/orders/[id].
 *
 * Each button targets one next-state transition. On click we call the admin
 * server action, toast the result, and refresh the route so the tracker +
 * header badge pick up the new status.
 */
export function StatusActionButton({
  orderId,
  status,
  label,
  danger,
  icon,
}: {
  orderId: string;
  status: OrderStatus;
  label: string;
  danger?: boolean;
  icon?: React.ReactNode;
}) {
  const [pending, start] = useTransition();
  const router = useRouter();

  function onClick() {
    const isCancel = status === 'cancelled';
    if (isCancel && !window.confirm('Cancel this order? If it was paid via Paystack, a refund will be issued.')) {
      return;
    }
    start(async () => {
      const result = isCancel
        ? await cancelOrder(orderId)
        : await setOrderStatus(orderId, status);
      if (!result.ok) {
        toast.error(isCancel ? 'Could not cancel order' : 'Could not update order', result.message);
        return;
      }
      if (isCancel && 'refunded' in result && result.refunded) {
        toast.success(
          'Order cancelled & refunded',
          `${formatPrice(result.refunded.amount)} ${result.refunded.currency} returned to the buyer.`,
        );
      } else if (isCancel) {
        toast.success('Order cancelled', 'Refund (if any) must be issued manually in Paystack.');
      } else {
        toast.success('Order updated', `Status set to ${status}.`);
      }
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className={cn(
        'inline-flex h-10 items-center justify-center gap-2 rounded-full px-5 text-sm font-medium transition disabled:opacity-60',
        danger
          ? 'border border-red-400/30 bg-red-500/10 text-red-200 hover:bg-red-500/15'
          : 'bg-white text-ink-900 hover:bg-ink-50 active:scale-[0.98]',
      )}
    >
      {icon}
      {pending ? 'Updating…' : label}
    </button>
  );
}
