import 'server-only';

/**
 * Paystack adapter — Phase 4 production path for Ghana.
 *
 * Flow:
 *  1. placeOrder() creates an orders row with status 'pending'.
 *  2. initializeTransaction() calls Paystack's /transaction/initialize with
 *     the order's grand_total (converted to pesewas) and a reference string
 *     we tie back to the order (`md_<orderId>`).
 *  3. Paystack returns an authorization_url — we redirect the buyer there.
 *  4. Buyer completes payment on Paystack's hosted page, then is sent to
 *     /checkout/confirm?reference=... .
 *  5. Paystack fires a webhook to /api/webhooks/paystack with charge.success;
 *     the webhook route verifies, marks the order 'paid'.
 *
 * Requires PAYSTACK_SECRET_KEY in .env.local (test or live). Public key is
 * only needed for the inline popup; the redirect flow we use doesn't need it.
 */

export const PAYSTACK_BASE_URL = 'https://api.paystack.co';

export interface InitializeInput {
  /** Buyer's email — Paystack keys receipts off this. */
  email: string;
  /** Amount in major units (GHS). We convert to pesewas before sending. */
  amount: number;
  currency: 'GHS' | 'USD' | 'EUR';
  /** Our stable id for this transaction; shows up on receipts + the webhook. */
  reference: string;
  /** Where the buyer lands after completing payment. */
  callbackUrl: string;
  /** Any extra data we want surfaced on the webhook payload. */
  metadata?: Record<string, unknown>;
}

export interface InitializeResult {
  authorizationUrl: string;
  accessCode: string;
  reference: string;
}

export class PaystackError extends Error {
  constructor(public code: string, message: string, public raw?: unknown) {
    super(message);
    this.name = 'PaystackError';
  }
}

/** Convert GHS/USD/EUR major units to the subunit Paystack expects. */
function toSubunits(amount: number): number {
  return Math.round(amount * 100);
}

/**
 * Create a Paystack transaction and return the hosted-checkout URL to redirect
 * the buyer to. Throws PaystackError on any non-200 response or malformed body.
 */
export async function initializeTransaction(input: InitializeInput): Promise<InitializeResult> {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    throw new PaystackError(
      'missing_secret',
      'PAYSTACK_SECRET_KEY is not set. Add your test key in .env.local.',
    );
  }

  const res = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secret}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: input.email,
      amount: toSubunits(input.amount),
      currency: input.currency,
      reference: input.reference,
      callback_url: input.callbackUrl,
      metadata: input.metadata ?? {},
    }),
  });

  const body = (await res.json().catch(() => null)) as
    | { status: boolean; message: string; data?: { authorization_url: string; access_code: string; reference: string } }
    | null;

  if (!res.ok || !body || !body.status || !body.data) {
    throw new PaystackError(
      'initialize_failed',
      body?.message ?? `Paystack initialize returned ${res.status}`,
      body,
    );
  }

  return {
    authorizationUrl: body.data.authorization_url,
    accessCode: body.data.access_code,
    reference: body.data.reference,
  };
}

/**
 * Issue a refund against a successful Paystack transaction. Pass either the
 * reference we used at initialize-time (`md_<orderId>`) or Paystack's own
 * transaction id. Omitting `amount` refunds the whole charge; pass pesewas
 * for a partial refund.
 *
 * Returns Paystack's refund record. Throws PaystackError on any non-200.
 */
export async function refundTransaction(opts: {
  transaction: string;
  amount?: number;          // in major units (GHS/USD); if omitted, full refund
  currency?: 'GHS' | 'USD' | 'EUR';
  reason?: string;          // free-text, shown on the Paystack dashboard
}): Promise<{
  id: number;
  status: string;
  amount: number;
  currency: string;
  raw: unknown;
}> {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    throw new PaystackError('missing_secret', 'PAYSTACK_SECRET_KEY is not set.');
  }

  const body: Record<string, unknown> = { transaction: opts.transaction };
  if (opts.amount !== undefined) body.amount = toSubunits(opts.amount);
  if (opts.currency) body.currency = opts.currency;
  if (opts.reason) body.merchant_note = opts.reason;

  const res = await fetch(`${PAYSTACK_BASE_URL}/refund`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secret}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const parsed = (await res.json().catch(() => null)) as
    | { status: boolean; message: string; data?: { id: number; status: string; amount: number; currency: string } }
    | null;
  if (!res.ok || !parsed?.status || !parsed.data) {
    throw new PaystackError(
      'refund_failed',
      parsed?.message ?? `Paystack refund returned ${res.status}`,
      parsed,
    );
  }
  return {
    id: parsed.data.id,
    status: parsed.data.status,
    amount: parsed.data.amount / 100,
    currency: parsed.data.currency,
    raw: parsed,
  };
}

/** Verify a transaction by reference. Used by the confirm page as a backup to the webhook. */
export async function verifyTransaction(reference: string): Promise<{
  status: 'success' | 'failed' | 'abandoned' | 'pending';
  amount: number;
  currency: string;
  raw: unknown;
}> {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    throw new PaystackError('missing_secret', 'PAYSTACK_SECRET_KEY is not set.');
  }
  const res = await fetch(
    `${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`,
    { headers: { Authorization: `Bearer ${secret}` } },
  );
  const body = (await res.json().catch(() => null)) as
    | { status: boolean; data?: { status: string; amount: number; currency: string } }
    | null;
  if (!res.ok || !body?.status || !body.data) {
    throw new PaystackError('verify_failed', `Paystack verify returned ${res.status}`, body);
  }
  return {
    status: body.data.status as 'success' | 'failed' | 'abandoned' | 'pending',
    amount: body.data.amount / 100,
    currency: body.data.currency,
    raw: body,
  };
}
