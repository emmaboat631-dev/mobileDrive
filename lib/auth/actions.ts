'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getServerSupabase } from '@/lib/supabase/server';
import { rateLimit } from '@/lib/security/rate-limit';
import { assertSameOrigin } from '@/lib/security/csrf';

export type AuthResult = { ok: true } | { ok: false; message: string };

function tooManyMessage(bucket: string, retryAfterSec: number): string {
  if (retryAfterSec >= 60) {
    const mins = Math.ceil(retryAfterSec / 60);
    return `Too many ${bucket} attempts. Try again in ${mins} minute${mins === 1 ? '' : 's'}.`;
  }
  return `Too many ${bucket} attempts. Try again in ${retryAfterSec} seconds.`;
}

export async function signInWithPassword(formData: FormData): Promise<AuthResult> {
  const origin = await assertSameOrigin();
  if (!origin.ok) return { ok: false, message: origin.message };

  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const next = String(formData.get('next') ?? '/account');

  const rl = await rateLimit('signin', email);
  if (!rl.ok) return { ok: false, message: tooManyMessage('sign-in', rl.retryAfterSec) };

  const supabase = getServerSupabase();
  if (!supabase) {
    return { ok: false, message: 'Authentication is not configured yet. Set the Supabase env vars in .env.local.' };
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, message: error.message };

  revalidatePath('/', 'layout');
  redirect(next);
}

export async function signUpWithPassword(formData: FormData): Promise<AuthResult> {
  const origin = await assertSameOrigin();
  if (!origin.ok) return { ok: false, message: origin.message };

  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const fullName = String(formData.get('full_name') ?? '').trim();

  const rl = await rateLimit('signup', email);
  if (!rl.ok) return { ok: false, message: tooManyMessage('sign-up', rl.retryAfterSec) };

  const supabase = getServerSupabase();
  if (!supabase) {
    return { ok: false, message: 'Authentication is not configured yet. Set the Supabase env vars in .env.local.' };
  }

  const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${site}/auth/callback?next=/account`,
    },
  });
  if (error) return { ok: false, message: error.message };

  revalidatePath('/', 'layout');
  return { ok: true };
}

export async function updateProfile(formData: FormData): Promise<AuthResult> {
  const origin = await assertSameOrigin();
  if (!origin.ok) return { ok: false, message: origin.message };

  const supabase = getServerSupabase();
  if (!supabase) return { ok: false, message: 'Backend not configured.' };

  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData.user) return { ok: false, message: 'You need to be signed in.' };

  const firstName = String(formData.get('first_name') ?? '').trim();
  const lastName = String(formData.get('last_name') ?? '').trim();
  const fullName = [firstName, lastName].filter(Boolean).join(' ').trim() || null;
  const phone = String(formData.get('phone') ?? '').trim() || null;
  const regionRaw = String(formData.get('region') ?? '').trim();
  const regionCode = regionRaw.startsWith('GH') ? 'GH' : regionRaw.startsWith('US') ? 'US' : regionRaw.startsWith('EU') ? 'EU' : null;

  const street = String(formData.get('street') ?? '').trim();
  const city = String(formData.get('city') ?? '').trim();
  const addressRegion = String(formData.get('region_city') ?? '').trim();
  const postal = String(formData.get('postal_code') ?? '').trim();
  const defaultAddress =
    street || city || addressRegion || postal
      ? { street, city, region: addressRegion, postalCode: postal }
      : null;

  const notificationPrefs = {
    orders: formData.get('n_orders') === 'on',
    builds: formData.get('n_builds') === 'on',
    offers: formData.get('n_offers') === 'on',
    dealer: formData.get('n_dealer') === 'on',
    sms:    formData.get('n_sms')    === 'on',
  };

  const db = supabase as unknown as {
    from: (t: string) => {
      update: (p: Record<string, unknown>) => {
        eq: (k: string, v: string) => Promise<{ error: { message: string } | null }>;
      };
    };
  };

  const { error } = await db
    .from('profiles')
    .update({
      full_name: fullName,
      phone,
      region: regionCode,
      default_delivery_address: defaultAddress,
      notification_prefs: notificationPrefs,
    })
    .eq('id', userData.user.id);

  if (error) return { ok: false, message: error.message };

  revalidatePath('/account', 'layout');
  return { ok: true };
}

export async function signOut(_formData?: FormData) {
  const supabase = getServerSupabase();
  if (!supabase) redirect('/');
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/');
}

export async function requestPasswordReset(formData: FormData): Promise<AuthResult> {
  const origin = await assertSameOrigin();
  if (!origin.ok) return { ok: false, message: origin.message };

  const email = String(formData.get('email') ?? '').trim();
  if (!email) return { ok: false, message: 'Enter the email address on your account.' };

  const rl = await rateLimit('reset', email);
  if (!rl.ok) return { ok: false, message: tooManyMessage('password reset', rl.retryAfterSec) };

  const supabase = getServerSupabase();
  if (!supabase) {
    // Dev mode: pretend the email was sent so the UI can confirm the flow.
    return { ok: true };
  }

  const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${site}/auth/callback?next=/account/reset-password`,
  });
  if (error) return { ok: false, message: error.message };
  return { ok: true };
}

/**
 * Update the current user's password. Called by /account/reset-password after
 * the auth/callback handler has exchanged the reset code for a session.
 */
export async function updatePassword(formData: FormData): Promise<AuthResult> {
  const origin = await assertSameOrigin();
  if (!origin.ok) return { ok: false, message: origin.message };

  const password = String(formData.get('password') ?? '');
  const confirm = String(formData.get('confirm') ?? '');

  if (password.length < 8) return { ok: false, message: 'Password must be at least 8 characters.' };
  if (password !== confirm) return { ok: false, message: 'Passwords do not match.' };

  const supabase = getServerSupabase();
  if (!supabase) return { ok: false, message: 'Authentication is not configured yet.' };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { ok: false, message: error.message };

  revalidatePath('/', 'layout');
  return { ok: true };
}
