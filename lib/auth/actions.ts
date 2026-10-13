'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getServerSupabase } from '@/lib/supabase/server';

export type AuthResult = { ok: true } | { ok: false; message: string };

export async function signInWithPassword(formData: FormData): Promise<AuthResult> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const next = String(formData.get('next') ?? '/account');

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
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const fullName = String(formData.get('full_name') ?? '').trim();

  const supabase = getServerSupabase();
  if (!supabase) {
    return { ok: false, message: 'Authentication is not configured yet. Set the Supabase env vars in .env.local.' };
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });
  if (error) return { ok: false, message: error.message };

  revalidatePath('/', 'layout');
  return { ok: true };
}

export async function signOut() {
  const supabase = getServerSupabase();
  if (!supabase) redirect('/');
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/');
}

export async function requestPasswordReset(formData: FormData): Promise<AuthResult> {
  const email = String(formData.get('email') ?? '').trim();
  if (!email) return { ok: false, message: 'Enter the email address on your account.' };

  const supabase = getServerSupabase();
  if (!supabase) {
    // Dev mode: pretend the email was sent so the UI can confirm the flow.
    return { ok: true };
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/sign-in?reset=1`,
  });
  if (error) return { ok: false, message: error.message };
  return { ok: true };
}
