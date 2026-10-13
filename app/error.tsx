'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { RefreshCcw, Home, AlertTriangle } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Hook into your real error logger here (Sentry, LogRocket, etc.)
    console.error('[mobileDrive] route error', error);
  }, [error]);

  return (
    <section className="container-page relative overflow-hidden pb-24 pt-40 text-center">
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden
        style={{
          background:
            'radial-gradient(60% 50% at 50% 15%, rgba(220, 70, 70, 0.12), transparent 70%)',
        }}
      />

      <div className="mx-auto max-w-xl">
        <div className="eyebrow mx-auto inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-red-200">
          <AlertTriangle className="h-3 w-3" />
          Something went wrong
        </div>
        <h1 className="mt-6 font-display text-display-lg font-semibold -tracking-[0.025em] text-white">
          Pit stop.
        </h1>
        <p className="mt-4 text-base text-ink-100">
          We ran into an unexpected error loading this page. Try again — if it keeps happening
          our team has already been notified.
        </p>

        {error.digest && (
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-ink-800/60 px-3 py-1.5 text-[11px] text-ink-200">
            <span>Reference</span>
            <code className="text-white">{error.digest}</code>
          </div>
        )}

        <div className="mt-9 flex items-center justify-center gap-3">
          <button type="button" onClick={reset} className="btn-primary">
            <RefreshCcw className="h-4 w-4" />
            Try again
          </button>
          <Link href="/" className="btn-secondary">
            <Home className="h-4 w-4" />
            Back to home
          </Link>
        </div>
      </div>
    </section>
  );
}
