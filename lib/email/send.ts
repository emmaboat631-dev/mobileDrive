import 'server-only';
import { Resend } from 'resend';
import { render } from '@react-email/render';
import type { ReactElement } from 'react';
import { getAdminSupabase } from '@/lib/supabase/admin';

/**
 * Resend wrapper. Every outbound email funnels through here so we:
 *   1. render React Email templates to HTML + plaintext
 *   2. send via Resend (or no-op when RESEND_API_KEY is unset)
 *   3. log the result to `email_log` for admin visibility
 *
 * The function never throws — a failed send is recorded with status='failed'
 * and the caller continues. Email delivery must not block the order flow.
 */

const DEFAULT_FROM =
  process.env.RESEND_FROM ?? 'mobileDrive <onboarding@resend.dev>';

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  react: ReactElement;
  template: string;                 // slug for logging, e.g. 'order-confirmation'
  from?: string;
  replyTo?: string;
  relatedOrder?: string | null;
  relatedBooking?: string | null;
}

export interface SendResult {
  ok: boolean;
  providerId?: string;
  error?: string;
}

export async function sendEmail(opts: SendEmailOptions): Promise<SendResult> {
  const key = process.env.RESEND_API_KEY;
  const toList = Array.isArray(opts.to) ? opts.to : [opts.to];
  const toJoined = toList.join(', ');

  // Dev mode without a key: log instead of sending.
  if (!key) {
    console.log('[email] (no RESEND_API_KEY — would send)', opts.template, '→', toJoined, '|', opts.subject);
    await logEmail({ ...opts, status: 'queued', error: 'RESEND_API_KEY not set' });
    return { ok: true };
  }

  const resend = new Resend(key);
  const html = await render(opts.react);
  const text = await render(opts.react, { plainText: true });

  try {
    const { data, error } = await resend.emails.send({
      from: opts.from ?? DEFAULT_FROM,
      to: toList,
      subject: opts.subject,
      html,
      text,
      replyTo: opts.replyTo,
    });

    if (error) {
      console.error('[email] send failed:', opts.template, error.message);
      await logEmail({ ...opts, status: 'failed', error: error.message });
      return { ok: false, error: error.message };
    }

    await logEmail({ ...opts, status: 'sent', providerId: data?.id ?? null });
    return { ok: true, providerId: data?.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown send error';
    console.error('[email] threw:', opts.template, message);
    await logEmail({ ...opts, status: 'failed', error: message });
    return { ok: false, error: message };
  }
}

interface LogInput extends Omit<SendEmailOptions, 'react'> {
  status: 'sent' | 'failed' | 'queued';
  error?: string;
  providerId?: string | null;
}

async function logEmail(input: LogInput): Promise<void> {
  const supabase = getAdminSupabase();
  if (!supabase) return;
  const db = supabase as unknown as {
    from: (t: string) => { insert: (p: Record<string, unknown>) => Promise<{ error: unknown }> };
  };
  const to = Array.isArray(input.to) ? input.to.join(', ') : input.to;
  await db.from('email_log').insert({
    to_address: to,
    template: input.template,
    subject: input.subject,
    related_order: input.relatedOrder ?? null,
    related_booking: input.relatedBooking ?? null,
    provider: 'resend',
    provider_id: input.providerId ?? null,
    status: input.status,
    error: input.error ?? null,
  });
}
