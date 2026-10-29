'use server';

import { revalidatePath } from 'next/cache';
import { getServerSupabase } from '@/lib/supabase/server';
import { refundTransaction, PaystackError } from '@/lib/payments/paystack';

export type OrderStatus = 'pending' | 'paid' | 'production' | 'quality' | 'shipping' | 'delivered' | 'cancelled';

export type AdminOrderResult =
  | { ok: true; refunded?: { amount: number; currency: string } }
  | { ok: false; message: string };

async function requireAdmin() {
  const supabase = getServerSupabase();
  if (!supabase) return { ok: false as const, message: 'Backend not configured.' };
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { ok: false as const, message: 'Not signed in.' };
  const db = supabase as unknown as {
    from: (t: string) => {
      select: (c: string) => {
        eq: (k: string, v: string) => {
          maybeSingle: () => Promise<{ data: { role: string } | null }>;
        };
      };
    };
  };
  const { data: profile } = await db.from('profiles').select('role').eq('id', userData.user.id).maybeSingle();
  if (profile?.role !== 'admin') return { ok: false as const, message: 'Admin only.' };
  return { ok: true as const, supabase };
}

/**
 * Transition an order to a new status. Admin-only.
 * This is the manual lever for pushing an order through the state machine —
 * paid → production → quality → shipping → delivered — once the dealer has
 * confirmed the next step externally.
 */
export async function setOrderStatus(orderId: string, status: OrderStatus): Promise<AdminOrderResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  const db = auth.supabase as unknown as {
    from: (t: string) => {
      update: (p: Record<string, unknown>) => {
        eq: (k: string, v: string) => Promise<{ error: { message: string } | null }>;
      };
    };
  };
  const { error } = await db.from('orders').update({ status }).eq('id', orderId);
  if (error) return { ok: false, message: error.message };

  revalidatePath('/admin/orders');
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath('/account/orders');
  return { ok: true };
}

/**
 * Cancel an order and, if it was already paid via Paystack, issue a real
 * refund through Paystack's /refund API. For other payment methods the admin
 * handles the refund externally and this just flips the DB status.
 */
export async function cancelOrder(orderId: string): Promise<AdminOrderResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  const db = auth.supabase as unknown as {
    from: (t: string) => {
      select: (c: string) => {
        eq: (k: string, v: string) => {
          maybeSingle: () => Promise<{
            data: {
              status: string;
              payment_method: string;
              payment_provider_id: string | null;
              grand_total: number;
              currency: string;
            } | null;
          }>;
        };
      };
      update: (p: Record<string, unknown>) => {
        eq: (k: string, v: string) => Promise<{ error: { message: string } | null }>;
      };
    };
  };

  const { data: order } = await db
    .from('orders')
    .select('status, payment_method, payment_provider_id, grand_total, currency')
    .eq('id', orderId)
    .maybeSingle();

  if (!order) return { ok: false, message: 'Order not found.' };
  if (order.status === 'cancelled') return { ok: false, message: 'Order is already cancelled.' };
  if (order.status === 'delivered') return { ok: false, message: 'Delivered orders can\'t be cancelled.' };

  // If paid via Paystack, refund through their API before we flip the status.
  // Any other state (pending, non-Paystack) just needs a status change.
  let refunded: { amount: number; currency: string } | undefined;
  const paidViaPaystack =
    order.status === 'paid' &&
    order.payment_method === 'paystack' &&
    !!order.payment_provider_id;

  if (paidViaPaystack) {
    try {
      // Don't pass amount or currency — Paystack refunds the full original
      // charge in whatever currency the transaction was actually captured in.
      // This matters because our order.grand_total may be in USD while the
      // test-mode charge was converted/capped to GHS; passing a mismatched
      // currency triggers "Transaction currency must match refund currency".
      const result = await refundTransaction({
        transaction: order.payment_provider_id!,
        reason: `Order ${orderId.slice(0, 8)} cancelled by admin`,
      });
      refunded = { amount: result.amount, currency: result.currency };
    } catch (err) {
      const message = err instanceof PaystackError
        ? `Paystack refund failed: ${err.message}`
        : 'Paystack refund failed.';
      return { ok: false, message };
    }
  }

  const { error } = await db.from('orders').update({ status: 'cancelled' }).eq('id', orderId);
  if (error) return { ok: false, message: error.message };

  revalidatePath('/admin/orders');
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath('/account/orders');
  return refunded ? { ok: true, refunded } : { ok: true };
}
