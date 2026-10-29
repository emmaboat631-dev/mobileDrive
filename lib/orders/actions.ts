'use server';

import { getServerSupabase } from '@/lib/supabase/server';
import { assertSameOrigin } from '@/lib/security/csrf';
import { orderSchema, firstZodMessage } from '@/lib/validation/schemas';
import { initializeTransaction, PaystackError } from '@/lib/payments/paystack';
import type { VehicleConfiguration } from '@/types/vehicle';
import type { PaymentMethodId } from '@/lib/payments/providers';

export interface PlaceOrderInput {
  items: Array<{
    vehicleId: string;
    configuration: VehicleConfiguration;
    unitPrice: number;
    optionsPrice: number;
    lineTotal: number;
  }>;
  subtotal: number;
  optionsTotal: number;
  taxes: number;
  grandTotal: number;
  currency: 'USD' | 'GHS' | 'EUR';
  deliveryMethod: 'door' | 'pickup';
  deliveryAddress: {
    fullName: string;
    phone: string;
    street: string;
    city: string;
    region: string;
    postalCode: string;
  };
  paymentMethod: PaymentMethodId;
}

export type PlaceOrderResult =
  | { ok: true; orderId: string; mock: boolean; redirectUrl?: string }
  | { ok: false; message: string };

/**
 * Create an order. When Supabase is configured and the user is signed in,
 * writes to the orders + order_items tables and returns the real order id.
 * Otherwise returns a mock id so the UI can confirm the flow in local dev.
 */
export async function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  const origin = await assertSameOrigin();
  if (!origin.ok) return { ok: false, message: origin.message };

  const parsed = orderSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: firstZodMessage(parsed.error) };
  }
  const supabase = getServerSupabase();

  if (!supabase) {
    return { ok: true, orderId: 'MD-DEMO-' + Date.now().toString(36).toUpperCase(), mock: true };
  }

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return { ok: false, message: 'You need to sign in before placing an order.' };
  }
  const userId = userData.user.id;

  // Supabase typed client generics drop in some tooling versions; cast to any for the
  // insert/select calls. Regenerating `database.types.ts` with
  //   `supabase gen types typescript --project-id $PROJECT_REF`
  // restores full type inference, so this is scaffolding only.
  const db = supabase as any;

  const { data: order, error: orderErr } = await db
    .from('orders')
    .insert({
      user_id: userId,
      status: 'pending',
      subtotal: input.subtotal,
      options_total: input.optionsTotal,
      taxes: input.taxes,
      grand_total: input.grandTotal,
      currency: input.currency,
      delivery_method: input.deliveryMethod,
      delivery_address: input.deliveryAddress,
      payment_method: input.paymentMethod,
    })
    .select('id')
    .single();

  if (orderErr || !order) {
    return { ok: false, message: orderErr?.message ?? 'Failed to create order.' };
  }

  const { error: itemsErr } = await db.from('order_items').insert(
    input.items.map((it: PlaceOrderInput['items'][number]) => ({
      order_id: order.id,
      vehicle_id: it.vehicleId,
      configuration: it.configuration,
      unit_price: it.unitPrice,
      options_price: it.optionsPrice,
      line_total: it.lineTotal,
    })),
  );

  if (itemsErr) {
    return { ok: false, message: 'Order created, but items failed: ' + itemsErr.message };
  }

  // If the buyer chose Paystack, open a hosted checkout. The webhook
  // (app/api/webhooks/paystack/route.ts) marks the order 'paid' on success.
  //
  // Paystack Ghana accounts only accept GHS (and USD/EUR on request). We force
  // GHS and convert USD/EUR via PAYSTACK_FX_USD / PAYSTACK_FX_EUR env vars so
  // the test flow works out of the box. Default rate is a placeholder — set
  // the real rate in .env.local before going live, or enable USD on your
  // Paystack dashboard and remove the conversion.
  if (input.paymentMethod === 'paystack') {
    try {
      const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
      const fxUsd = Number(process.env.PAYSTACK_FX_USD ?? '15');
      const fxEur = Number(process.env.PAYSTACK_FX_EUR ?? '16');
      const grandTotalGhs =
        input.currency === 'USD' ? Math.round(input.grandTotal * fxUsd)
        : input.currency === 'EUR' ? Math.round(input.grandTotal * fxEur)
        : input.grandTotal;

      // In Paystack test mode, large amounts trigger an auto-conversion to the
      // card's native currency (USD for the universal test Visa 408...4081),
      // which then fails because test accounts can't settle USD. We cap test
      // charges to a tiny GHS amount so the flow completes end-to-end. In live
      // mode we send the real amount.
      const isTestMode = (process.env.PAYSTACK_SECRET_KEY ?? '').startsWith('sk_test_');
      const amountGhs = isTestMode ? 100 : grandTotalGhs;

      const init = await initializeTransaction({
        email: userData.user.email ?? input.deliveryAddress.phone + '@mobiledrive.app',
        amount: amountGhs,
        currency: 'GHS',
        reference: `md_${order.id as string}`,
        callbackUrl: `${site}/checkout/confirmation?order=${encodeURIComponent(order.id as string)}`,
        metadata: {
          order_id: order.id,
          user_id: userId,
          source_currency: input.currency,
          source_amount: input.grandTotal,
          source_amount_ghs: grandTotalGhs,
          test_mode: isTestMode,
        },
      });
      return {
        ok: true,
        orderId: order.id as string,
        mock: false,
        redirectUrl: init.authorizationUrl,
      };
    } catch (err) {
      const message = err instanceof PaystackError ? err.message : 'Failed to start Paystack checkout.';
      return { ok: false, message };
    }
  }

  return { ok: true, orderId: order.id as string, mock: false };
}
