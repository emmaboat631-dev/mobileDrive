import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

type Elevation = 'flat' | 'raised' | 'overlay';
type Padding = 'none' | 'sm' | 'md' | 'lg';
type Radius = 'md' | 'lg';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  elevation?: Elevation;
  padding?: Padding;
  radius?: Radius;
  interactive?: boolean;
}

const ELEVATION: Record<Elevation, string> = {
  flat: 'bg-transparent',
  raised: 'bg-ink-800/80',
  overlay: 'bg-ink-700/60',
};

const PADDING: Record<Padding, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6 md:p-8',
};

const RADIUS: Record<Radius, string> = {
  md: 'rounded-xl',
  lg: 'rounded-2xl',
};

/**
 * The canonical card surface. Replaces the inline
 * `rounded-2xl border border-white/[0.06] bg-ink-800/...` pattern repeated
 * 90+ times across the app. Adopt it per-page; no caller is forced today.
 */
export function Card({
  elevation = 'raised',
  padding = 'md',
  radius = 'lg',
  interactive = false,
  className,
  ...rest
}: CardProps) {
  return (
    <div
      className={cn(
        'border border-white/[0.06]',
        RADIUS[radius],
        ELEVATION[elevation],
        PADDING[padding],
        interactive && 'transition hover:border-white/15',
        className,
      )}
      {...rest}
    />
  );
}
