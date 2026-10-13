import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface StatTileProps {
  label: string;
  value: ReactNode;
  unit?: string;
  hint?: ReactNode;
  tone?: 'default' | 'muted';
  className?: string;
}

/**
 * Operational stat tile used in hero, vehicle detail KPIs, admin/dealer
 * dashboards. Single source so the metric treatment is consistent.
 */
export function StatTile({ label, value, unit, hint, tone = 'default', className }: StatTileProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-white/[0.06] px-4 py-3.5',
        tone === 'muted' ? 'bg-ink-800/40' : 'bg-ink-700/60',
        className,
      )}
    >
      <div className="eyebrow text-[10px]">{label}</div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="font-display text-xl font-semibold text-white">{value}</span>
        {unit && <span className="text-[11px] text-ink-200">{unit}</span>}
      </div>
      {hint && <div className="mt-0.5 text-xs text-ink-200">{hint}</div>}
    </div>
  );
}
