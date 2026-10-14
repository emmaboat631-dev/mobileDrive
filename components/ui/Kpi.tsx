import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

export interface KpiProps {
  label: string;
  value: ReactNode;
  unit?: string;
  /** Short delta/change string, e.g. "+6 vs last week" or "+9.1%". */
  delta?: string;
  deltaTone?: 'good' | 'bad' | 'muted';
  /** Short caption below value, used when delta isn't appropriate. */
  hint?: ReactNode;
  className?: string;
}

/**
 * Dashboard KPI tile. Operational tile for admin/dealer/account overviews.
 * Replaces repeated inline `rounded-2xl border border-white/[0.06] bg-ink-800/60 p-5`
 * KPI blocks across the three shells.
 */
export function Kpi({ label, value, unit, delta, deltaTone = 'muted', hint, className }: KpiProps) {
  const toneClass =
    deltaTone === 'good'
      ? 'text-emerald-400'
      : deltaTone === 'bad'
        ? 'text-rose-300'
        : 'text-ink-200';
  return (
    <div className={cn('rounded-2xl border border-white/[0.06] bg-ink-800/60 p-5', className)}>
      <div className="eyebrow">{label}</div>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="font-display text-3xl font-semibold -tracking-[0.025em] text-white">
          {value}
        </span>
        {unit && <span className="text-base text-ink-200">{unit}</span>}
      </div>
      {delta && <div className={cn('mt-1 text-[11px]', toneClass)}>{delta}</div>}
      {!delta && hint && <div className="mt-1 text-[11px] text-ink-200">{hint}</div>}
    </div>
  );
}

export interface KpiRowProps {
  items: KpiProps[];
  columns?: 2 | 3 | 4;
}

export function KpiRow({ items, columns = 4 }: KpiRowProps) {
  const colClass =
    columns === 2
      ? 'sm:grid-cols-2'
      : columns === 3
        ? 'sm:grid-cols-2 lg:grid-cols-3'
        : 'sm:grid-cols-2 lg:grid-cols-4';
  return (
    <div className={cn('grid gap-4', colClass)}>
      {items.map((it) => (
        <Kpi key={it.label} {...it} />
      ))}
    </div>
  );
}
