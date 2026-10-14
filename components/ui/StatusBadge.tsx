import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

export type StatusTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'muted';

interface Props {
  children: ReactNode;
  tone?: StatusTone;
  icon?: ReactNode;
  dot?: boolean;
  className?: string;
}

const TONE: Record<StatusTone, string> = {
  neutral: 'border-white/15 bg-ink-700/60 text-ink-100',
  success: 'border-emerald-400/30 bg-emerald-400/15 text-emerald-400',
  warning: 'border-amber-400/30 bg-amber-400/15 text-amber-300',
  danger:  'border-rose-400/30 bg-rose-400/15 text-rose-300',
  info:    'border-sky-400/30 bg-sky-400/15 text-sky-300',
  muted:   'border-white/[0.08] bg-white/[0.03] text-ink-200',
};

const DOT: Record<StatusTone, string> = {
  neutral: 'bg-ink-200',
  success: 'bg-emerald-400',
  warning: 'bg-amber-400',
  danger:  'bg-rose-400',
  info:    'bg-sky-400',
  muted:   'bg-ink-300',
};

/**
 * One canonical status indicator for the shells. Previously each page re-rolled
 * tone-specific className ternaries ('Delivered'→emerald, 'Pending'→amber, etc.);
 * now they map a status string to a tone and reuse this.
 */
export function StatusBadge({ children, tone = 'neutral', icon, dot, className }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-medium',
        TONE[tone],
        className,
      )}
    >
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full', DOT[tone])} />}
      {icon}
      {children}
    </span>
  );
}

/** Maps mobileDrive order/booking status strings to the badge tone. */
export function statusTone(status: string): StatusTone {
  const s = status.toLowerCase();
  if (s === 'delivered' || s === 'confirmed' || s === 'paid' || s === 'active') return 'success';
  if (s === 'shipping' || s === 'production' || s === 'quality' || s === 'in production') return 'info';
  if (s === 'pending' || s === 'awaiting' || s === 'review') return 'warning';
  if (s === 'cancelled' || s === 'failed' || s === 'refunded') return 'danger';
  return 'neutral';
}
