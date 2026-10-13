import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

interface TagProps {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}

const TONE: Record<Tone, string> = {
  neutral: 'border-white/15 bg-ink-700/60 text-ink-100',
  success: 'border-emerald-500/40 bg-ink-700/60 text-emerald-400',
  warning: 'border-amber-500/40 bg-ink-700/60 text-amber-300',
  danger:  'border-rose-500/40 bg-ink-700/60 text-rose-300',
  info:    'border-sky-500/40 bg-ink-700/60 text-sky-300',
};

export function Tag({ children, tone = 'neutral', className }: TagProps) {
  return (
    <span
      className={cn(
        'rounded-full border px-2.5 py-1 text-[10px] font-medium tracking-wider',
        TONE[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
