import Link from 'next/link';
import { ArrowLeft, Search } from 'lucide-react';

/**
 * Themed in-shell 404 — used by /admin/not-found.tsx and /dealer/not-found.tsx
 * so a bad id lands inside the correct sidebar rather than falling through to
 * the root /not-found. Keep the body copy pragmatic — admins and dealers want
 * to know what to search for, not a brand moment.
 */
export function InShellNotFound({
  backLabel,
  backHref,
  title = "That record doesn't exist.",
  description = 'The id in the URL may be wrong, or the record was deleted. Head back to the list to pick another.',
}: {
  backLabel: string;
  backHref: string;
  title?: string;
  description?: string;
}) {
  return (
    <div className="rounded-3xl border border-white/[0.06] bg-ink-800/40 p-10 text-center">
      <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-[11px] font-medium text-amber-300">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
        404 · not found
      </div>
      <h1 className="mt-6 font-display text-display-md font-semibold -tracking-[0.025em] text-white">
        {title}
      </h1>
      <p className="mx-auto mt-4 max-w-md text-sm text-ink-100">
        {description}
      </p>
      <div className="mt-8 flex items-center justify-center gap-3">
        <Link href={backHref} className="btn-primary">
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </Link>
        <Link href="/" className="btn-secondary">
          <Search className="h-4 w-4" />
          Back to home
        </Link>
      </div>
    </div>
  );
}
