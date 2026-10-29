import Image from 'next/image';
import { cn } from '@/lib/utils/cn';

/**
 * mobileDrive brand mark — raster lockup from the brand kit.
 * One PNG for dark surfaces (logo-light.png = white glyph on black), one for
 * light surfaces (logo-dark.png = black glyph on white). Both are the full
 * MD monogram + road ribbon in horizontal aspect (~2.25:1). Prefer this
 * component over inline SVG anywhere a logo is shown.
 */

// Width:height matches the raster's native 630x270 ratio (2.333...) so Next's
// Image doesn't warn about CSS re-sizing one dimension without the other.
const DIMS: Record<'sm' | 'md' | 'lg', { h: number; w: number }> = {
  sm: { h: 20, w: 47 },
  md: { h: 24, w: 56 },
  lg: { h: 32, w: 75 },
};

export function Mark({
  className,
  size = 'md',
  tone = 'light',
}: {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  /** 'light' = white-on-black (for dark surfaces); 'dark' = black-on-white (for light surfaces). */
  tone?: 'light' | 'dark';
}) {
  const { h, w } = DIMS[size];
  const src = tone === 'dark' ? '/logo-dark.png' : '/logo-light.png';
  return (
    <Image
      src={src}
      alt="mobileDrive"
      width={w}
      height={h}
      priority
      className={cn('select-none', className)}
    />
  );
}

export function Wordmark({
  className,
  size = 'md',
}: {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizeClass =
    size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-xl' : 'text-base';
  return (
    <span
      className={cn(
        'font-display font-semibold tracking-[-0.015em] text-current',
        sizeClass,
        className,
      )}
    >
      mobile<span className="font-bold">Drive</span>
    </span>
  );
}

/**
 * Full brand lockup — raster mark + wordmark aligned to the same baseline.
 * This is what the navigation and auth header show by default.
 */
export function Lockup({
  className,
  size = 'md',
  tone = 'light',
  showWordmark = true,
}: {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  tone?: 'light' | 'dark';
  showWordmark?: boolean;
}) {
  const toneClass = tone === 'dark' ? 'text-ink-900' : 'text-white';
  return (
    <span className={cn('inline-flex items-center gap-2', toneClass, className)}>
      <Mark size={size} tone={tone} />
      {showWordmark && <Wordmark size={size} />}
    </span>
  );
}
