import { NextResponse, type NextRequest } from 'next/server';
import crypto from 'node:crypto';
import { getAdminSupabase } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/email/send';
import { OrderConfirmationEmail } from '@/emails/OrderConfirmation';
import { DealerNewOrderEmail } from '@/emails/DealerNewOrder';
import { formatPrice } from '@/lib/utils/format';

/**
 * Paystack webhook — receives charge.* events for orders processed via the
 * Paystack adapter.
 *
 * Signature verification follows Paystack's spec: HMAC-SHA512 of the raw body
 * with PAYSTACK_SECRET_KEY, compared against the x-paystack-signature header
 * in constant time. Requests that don't verify get 401 and are not logged.
 *
 * On charge.success we transition the referenced order to 'paid'. On
 * charge.failed we insert into payment_failures so admins can see it in
 * /admin/payments and reach out to the buyer.
 *
 * The reference we expect is `md_<orderId>` — placed on the order at
 * initialize-time by lib/payments/paystack.ts.
 */

export const runtime = 'nodejs'; // need Node crypto, not Edge Web Crypto

interface PaystackEvent {
  event: string;
  data: {
    reference: string;
    status: string;
    amount: number;
    currency: string;
    gateway_response?: string;
  };
}

function verify(secret: string, body: string, signature: string | null): boolean {
  if (!signature) return false;
  const expected = crypto.createHmac('sha512', secret).update(body).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

function orderIdFromReference(reference: string | undefined | null): string | null {
  if (!reference || !reference.startsWith('md_')) return null;
  return reference.slice(3);
}

export async function POST(request: NextRequest) {
  console.log('[paystack-webhook] ← received');
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    console.error('[paystack-webhook] PAYSTACK_SECRET_KEY not set');
    return NextResponse.json({ ok: false, error: 'webhook_not_configured' }, { status: 500 });
  }

  const raw = await request.text();
  const signature = request.headers.get('x-paystack-signature');
  const sigOk = verify(secret, raw, signature);
  console.log('[paystack-webhook] signature ok?', sigOk, '| header=', signature?.slice(0, 12) + '…');

  if (!sigOk) {
    return NextResponse.json({ ok: false, error: 'bad_signature' }, { status: 401 });
  }

  let event: PaystackEvent;
  try {
    event = JSON.parse(raw);
  } catch {
    console.error('[paystack-webhook] bad json');
    return NextResponse.json({ ok: false, error: 'bad_json' }, { status: 400 });
  }
  console.log('[paystack-webhook] event:', event.event, '| ref:', event.data?.reference);

  const supabase = getAdminSupabase();
  if (!supabase) {
    console.error('[paystack-webhook] SUPABASE_SERVICE_ROLE_KEY not set — webhook can\'t write past RLS');
    return NextResponse.json({ ok: false, error: 'supabase_service_role_missing' }, { status: 500 });
  }
  const db = supabase as unknown as {
    from: (t: string) => {
      update: (p: Record<string, unknown>) => {
        eq: (k: string, v: string) => Promise<{ data: unknown[] | null; error: { message: string } | null }>;
      };
      insert: (p: Record<string, unknown>) => Promise<{ error: { message: string } | null }>;
      select: (c: string) => {
        eq: (k: string, v: string) => {
          maybeSingle: () => Promise<{ data: any }>;
        };
      };
    };
  };

  const orderId = orderIdFromReference(event.data.reference);

  if (event.event === 'charge.success') {
    if (!orderId) {
      console.warn('[paystack-webhook] reference not mapped:', event.data.reference);
      return NextResponse.json({ ok: true, note: 'reference_not_mapped' });
    }
    const { error } = await db
      .from('orders')
      .update({
        status: 'paid',
        payment_provider_id: event.data.reference,
      })
      .eq('id', orderId);
    if (error) {
      console.error('[paystack-webhook] db update failed:', error.message);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
    console.log('[paystack-webhook] ✓ order', orderId, '→ paid');

    // Fire-and-forget emails: buyer confirmation + dealer new-order ping.
    // We don't block the webhook response on these — Resend accepts quickly
    // but any delay here risks Paystack retrying. Errors land in email_log.
    void sendOrderEmails(db, orderId, event.data.reference);

    return NextResponse.json({ ok: true });
  }

  if (event.event === 'charge.failed') {
    const { error } = await db.from('payment_failures').insert({
      order_id: orderId,
      provider: 'paystack',
      provider_ref: event.data.reference,
      amount: Math.round(event.data.amount / 100),
      currency: event.data.currency,
      code: event.data.status,
      message: event.data.gateway_response ?? 'Payment failed.',
      raw: event,
    });
    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  }

  // Any other event type is ignored but acknowledged so Paystack doesn't retry.
  return NextResponse.json({ ok: true, note: 'event_ignored' });
}

/**
 * Join the order to its buyer profile + dealer, then dispatch the two emails
 * the order flow depends on: buyer confirmation and dealer new-order ping.
 * Any missing join falls back gracefully so one broken piece doesn't swallow
 * both emails.
 */
async function sendOrderEmails(db: any, orderId: string, paystackReference: string) {
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

  const { data: order } = await db
    .from('orders')
    .select('id, grand_total, currency, dealer_id, profiles!orders_user_id_fkey(email, full_name), order_items(vehicle_id), dealers(name, email)')
    .eq('id', orderId)
    .maybeSingle();

  if (!order) {
    console.warn('[paystack-webhook] email join missed; order not found for', orderId);
    return;
  }

  const firstVehicleId: string | undefined = order.order_items?.[0]?.vehicle_id;
  let brand = 'Your vehicle';
  let model = '';
  if (firstVehicleId) {
    const { data: v } = await db.from('vehicles').select('brand, model').eq('id', firstVehicleId).maybeSingle();
    if (v) { brand = v.brand; model = v.model; }
  }

  const buyerEmail: string | null = order.profiles?.email ?? null;
  const buyerName: string = order.profiles?.full_name ?? 'there';
  const firstName = buyerName.split(/\s+/)[0];
  const dealerName: string = order.dealers?.name ?? 'mobileDrive Accra';
  const dealerEmail: string | null = order.dealers?.email ?? null;
  const amountFormatted = formatPrice(order.grand_total, order.currency as 'USD' | 'GHS' | 'EUR');

  // Buyer confirmation
  if (buyerEmail) {
    await sendEmail({
      to: buyerEmail,
      subject: `Order confirmed — ${brand} ${model}`,
      template: 'order-confirmation',
      relatedOrder: orderId,
      react: OrderConfirmationEmail({
        siteUrl: site,
        firstName,
        orderId,
        vehicleBrand: brand,
        vehicleModel: model,
        amountFormatted,
        paystackReference,
        estDeliveryWeeks: '3–4 weeks',
        dealerName,
      }),
    });
  }

  // Dealer ping
  if (dealerEmail) {
    await sendEmail({
      to: dealerEmail,
      subject: `New order ${orderId.slice(0, 8).toUpperCase()} · ${brand} ${model}`,
      template: 'dealer-new-order',
      relatedOrder: orderId,
      react: DealerNewOrderEmail({
        siteUrl: site,
        dealerName,
        orderId,
        buyerName,
        buyerEmail,
        buyerPhone: null,
        vehicleBrand: brand,
        vehicleModel: model,
        amountFormatted,
      }),
    });
  }
}
