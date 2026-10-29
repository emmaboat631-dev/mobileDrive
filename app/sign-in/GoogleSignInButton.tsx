'use client';

import { useState, useTransition } from 'react';
import { AlertCircle } from 'lucide-react';
import { getBrowserSupabase } from '@/lib/supabase/client';

/**
 * "Continue with Google" OAuth button.
 *
 * Uses Supabase's PKCE flow: on click we call signInWithOAuth({provider:'google'}),
 * which redirects to Google and lands back at /auth/callback?code=xxx with the
 * `next` param preserved. Nothing to wire client-side after that — the callback
 * route exchanges the code for a session.
 *
 * Requires Google OAuth to be enabled in the Supabase dashboard (Auth →
 * Providers → Google). Until then the button renders but the Supabase redirect
 * returns an "unsupported_provider" error, which this surfaces inline.
 */
export function GoogleSignInButton({ next }: { next: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function onClick() {
    setError(null);
    start(async () => {
      const supabase = getBrowserSupabase();
      if (!supabase) {
        setError('Backend not configured.');
        return;
      }
      const site =
        typeof window !== 'undefined' ? window.location.origin : '';
      const { error: oauthErr } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${site}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      if (oauthErr) setError(oauthErr.message);
    });
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-white/15 bg-transparent text-sm font-medium text-white transition hover:bg-white/5 disabled:opacity-60"
      >
        <GoogleLogo />
        {pending ? 'Redirecting…' : 'Continue with Google'}
      </button>
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

function GoogleLogo() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
    </svg>
  );
}
