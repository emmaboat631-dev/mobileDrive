import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured } from '@/lib/supabase/env';

/**
 * Supabase email callback handler.
 *
 * Supabase includes a URL like /auth/callback?code=xxx&next=/foo in the
 * confirmation email, password-reset email, and OAuth redirect. We exchange
 * the one-time code for a durable session cookie, then redirect to `next` —
 * or `/account` as a safe default.
 *
 * This handles three sign-in types with one route:
 *   • Signup confirmation  — mark email verified, land on /account
 *   • Password recovery    — land on /account/reset-password with session cookie
 *   • OAuth sign-in        — land on /account
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next') ?? '/account';

  if (!code || !isSupabaseConfigured()) {
    return NextResponse.redirect(new URL('/sign-in?error=missing_code', url.origin));
  }

  let response = NextResponse.redirect(new URL(next, url.origin));
  const supabase = createServerClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        response.cookies.set({ name, value: '', ...options });
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(
      new URL(`/sign-in?error=${encodeURIComponent(error.message)}`, url.origin),
    );
  }

  return response;
}
