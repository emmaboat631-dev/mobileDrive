import type { ReactNode } from 'react';
import Link from 'next/link';
import { Lockup } from '@/components/brand/Logo';

interface AuthLayoutProps {
  /** Marketing headline on the left pane. Keep to one or two short lines. */
  headline: ReactNode;
  /** Supporting copy under the headline. */
  description: ReactNode;
  /** Optional slot below the description — feature list, illustration, mini-car. */
  aside?: ReactNode;
  /** The form side (right pane). */
  children: ReactNode;
}

/**
 * Shared split-pane shell for /sign-in, /sign-up and /forgot-password.
 * Previously each page duplicated this layout — now it lives in one place
 * and the three auth pages read as a single typographic family.
 */
export function AuthLayout({ headline, description, aside, children }: AuthLayoutProps) {
  return (
    <div className="fixed inset-0 z-50 grid min-h-screen grid-cols-1 overflow-y-auto bg-ink-900 lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden lg:block">
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, #0F1E37 0%, #07080A 60%, #07080A 100%)',
          }}
        />
        <div
          className="absolute -left-24 top-24 h-[700px] w-[900px] rounded-full opacity-70"
          style={{
            background:
              'radial-gradient(50% 50% at 50% 50%, rgba(60,90,150,0.3), transparent 70%)',
          }}
          aria-hidden
        />
        <Link
          href="/"
          aria-label="mobileDrive — home"
          className="relative z-10 flex items-center px-12 pt-12 text-white"
        >
          <Lockup size="lg" tone="light" />
        </Link>
        <div className="relative z-10 mt-32 px-12">
          <h2 className="max-w-xl font-display text-5xl font-semibold leading-[1.05] -tracking-[0.025em] text-white">
            {headline}
          </h2>
          <div className="mt-6 max-w-md text-base leading-relaxed text-ink-100">
            {description}
          </div>
          {aside && <div className="mt-8">{aside}</div>}
        </div>
      </aside>

      <main className="flex items-center justify-center px-6 py-16 lg:px-16">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
