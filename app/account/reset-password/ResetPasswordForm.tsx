'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { updatePassword } from '@/lib/auth/actions';

export function ResetPasswordForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, start] = useTransition();

  function onSubmit(formData: FormData) {
    setError(null);
    start(async () => {
      const result = await updatePassword(formData);
      if (result.ok === false) {
        setError(result.message);
        return;
      }
      setDone(true);
      setTimeout(() => router.push('/account'), 1200);
    });
  }

  if (done) {
    return (
      <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-5">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-400" />
          <div>
            <div className="font-display text-base font-semibold text-white">
              Password updated
            </div>
            <p className="mt-1 text-sm text-ink-100">
              Taking you to your account…
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form action={onSubmit} className="space-y-4">
      <label className="block">
        <span className="eyebrow block">New password</span>
        <input
          type="password"
          name="password"
          autoComplete="new-password"
          required
          minLength={8}
          placeholder="At least 8 characters"
          className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-ink-700 px-5 text-sm text-white placeholder:text-ink-300 focus:border-white/30 focus:outline-none"
        />
      </label>

      <label className="block">
        <span className="eyebrow block">Confirm password</span>
        <input
          type="password"
          name="confirm"
          autoComplete="new-password"
          required
          minLength={8}
          placeholder="Type it again"
          className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-ink-700 px-5 text-sm text-white placeholder:text-ink-300 focus:border-white/30 focus:outline-none"
        />
      </label>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <button type="submit" disabled={pending} className="btn-primary w-full disabled:opacity-60">
        {pending ? 'Updating…' : 'Update password'}
        {!pending && <ArrowRight className="h-4 w-4" />}
      </button>
    </form>
  );
}
