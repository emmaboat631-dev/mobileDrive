import Link from 'next/link';
import { ArrowRight, Home, Search } from 'lucide-react';

export const metadata = { title: 'Lost in the showroom — mobileDrive' };

export default function NotFound() {
  return (
    <section className="container-page relative overflow-hidden pb-24 pt-40 text-center">
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden
        style={{
          background:
            'radial-gradient(60% 50% at 50% 15%, rgba(80, 110, 160, 0.14), transparent 70%)',
        }}
      />

      <div className="mx-auto max-w-xl">
        <div className="eyebrow mx-auto inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
          404 · route not found
        </div>
        <h1 className="mt-6 font-display text-display-lg font-semibold -tracking-[0.025em] text-white">
          Nothing in this bay.
        </h1>
        <p className="mt-4 text-base text-ink-100">
          The page you were looking for might have moved, or the vehicle has been retired from
          inventory. Head back to the showroom to pick up another thread.
        </p>

        <div className="mt-9 flex items-center justify-center gap-3">
          <Link href="/" className="btn-primary">
            <Home className="h-4 w-4" />
            Back to home
          </Link>
          <Link href="/vehicles" className="btn-secondary">
            <Search className="h-4 w-4" />
            Browse vehicles
          </Link>
        </div>

        {/* Car silhouette (lost in the void) */}
        <div className="mx-auto mt-16 w-full max-w-md opacity-60">
          <svg viewBox="0 0 500 180" aria-hidden>
            <ellipse cx="250" cy="160" rx="200" ry="8" fill="#000" opacity="0.4" />
            <path
              d="M80,130 L120,80 Q175,55 250,52 Q325,55 380,80 L420,130 Q415,145 395,146 L385,146 Q381,135 368,135 Q355,135 351,146 L149,146 Q145,135 132,135 Q119,135 115,146 L105,146 Q85,145 80,130 Z"
              fill="#1A1D23"
            />
            <path d="M160,80 Q210,60 250,58 Q290,60 340,80 L330,96 L170,96 Z" fill="#0A0C10" opacity="0.95" />
            <circle cx="132" cy="140" r="16" fill="#0A0B0E" stroke="#3A3F48" strokeWidth="1.5" />
            <circle cx="368" cy="140" r="16" fill="#0A0B0E" stroke="#3A3F48" strokeWidth="1.5" />
          </svg>
        </div>

        <div className="mt-12 text-xs text-ink-300">
          Looking for something specific?{' '}
          <Link href="/vehicles" className="text-white underline">
            Search the marketplace
          </Link>
          .
        </div>
      </div>
    </section>
  );
}
