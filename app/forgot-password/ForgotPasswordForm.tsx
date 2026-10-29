'use client';

import { useState, useTransition } from 'react';
import { ArrowRight, AlertCircle, CheckCircle2, MailCheck } from 'lucide-react';
import { requestPasswordReset } from '@/lib/auth/actions';

export function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [pending, start] = useTransition();

  function onSubmit(formData: FormData) {
    setError(null);
    start(async () => {
      const result = await requestPasswordReset(formData);
      if (result.ok === false) setError(result.message);
      else setSent(true);
    });
  }

  if (sent) {
    return (
      <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-5">
        <div className="flex items-start gap-3">
          <MailCheck className="mt-0.5 h-5 w-5 text-emerald-400" />
          <div>
            <div className="font-display text-base font-semibold text-white">
              Check your inbox
            </div>
            <p className="mt-1 text-sm text-ink-100">
              If an account exists for that email, we&apos;ve sent a password-reset link. The link
              expires in 1 hour.
            </p>
          </div>
        </div>
      </div>
    );
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

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <button type="submit" disabled={pending} className="btn-primary w-full disabled:opacity-60">
        {pending ? 'Sending link…' : 'Send reset link'}
        {!pending && <ArrowRight className="h-4 w-4" />}
      </button>
    </form>
  );
}
