'use server';

import { getServerSupabase } from '@/lib/supabase/server';
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
  | { ok: true; orderId: string; mock: boolean }
  | { ok: false; message: string };

/**
 * Create an order. When Supabase is configured and the user is signed in,
 * writes to the orders + order_items tables and returns the real order id.
 * Otherwise returns a mock id so the UI can confirm the flow in local dev.
 */
export async function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  return { ok: true, orderId: order.id as string, mock: false };
}
