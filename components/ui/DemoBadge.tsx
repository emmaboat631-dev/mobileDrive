import { AlertTriangle } from 'lucide-react';

/**
 * Honest marker for pages whose content is still hardcoded in the file rather
 * than queried from Supabase. Drop at the top of a page under `<header>`:
 *
 *   <DemoBadge note="Marketing campaigns table lands in a future migration." />
 *
 * The amber styling matches the existing warning tone so the signal is
 * consistent with Banner({tone:'warning'}).
 */
export function DemoBadge({ note }: { note?: string }) {
  return (
    <div className="inline-flex items-start gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-[11px] font-medium text-amber-200">
      <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
      <span>
        <strong className="font-semibold text-amber-100">DEMO DATA</strong>
        {note ? <span className="text-amber-200/80"> — {note}</span> : null}
      </span>
    </div>
  );
}
