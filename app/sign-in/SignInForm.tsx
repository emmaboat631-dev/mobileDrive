'use client';

import { useState, useTransition } from 'react';
import { ArrowRight, AlertCircle } from 'lucide-react';
import { signInWithPassword } from '@/lib/auth/actions';

export function SignInForm({ next }: { next: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function onSubmit(formData: FormData) {
    setError(null);
    formData.set('next', next);
    start(async () => {
      const result = await signInWithPassword(formData);
      if (result.ok === false) setError(result.message);
      // On ok the server action redirects; nothing else to do here.
    });
  }

  return (
    <form action={onSubmit} className="space-y-4">
      <label className="block">
        <span className="eyebrow block">Email</span>
        <input
          type="email"
          name="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-ink-700 px-5 text-sm text-white placeholder:text-ink-300 focus:border-white/30 focus:outline-none"
        />
      </label>
      <label className="block">
        <span className="eyebrow block">Password</span>
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          required
          placeholder="••••••••••"
          className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-ink-700 px-5 text-sm text-white placeholder:text-ink-300 focus:border-white/30 focus:outline-none"
        />
      </label>

      <div className="flex items-center justify-between pt-1">
        <label className="flex items-center gap-2.5 text-sm text-ink-100">
          <input
            type="checkbox"
            defaultChecked
            name="remember"
            className="h-4 w-4 rounded border-white/15 bg-ink-700 text-white focus:ring-white"
          />
          Remember me
        </label>
        <a href="/forgot-password" className="text-sm font-medium text-white hover:underline">
          Forgot password?
        </a>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <button type="submit" disabled={pending} className="btn-primary w-full disabled:opacity-60">
        {pending ? 'Signing in…' : 'Sign in'}
        {!pending && <ArrowRight className="h-4 w-4" />}
      </button>
    </form>
  );
}
