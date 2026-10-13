import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface SectionHeaderProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  trailing?: ReactNode;
  size?: 'md' | 'lg';
  className?: string;
}

/**
 * Section headers across the app follow the same shape: optional eyebrow,
 * display-cased title, optional description, optional right-aligned trailing
 * slot (actions, filters, status). Use everywhere a page or section begins.
 */
export function SectionHeader({
  eyebrow,
  title,
  description,
  trailing,
  size = 'md',
  className,
}: SectionHeaderProps) {
  return (
    <header className={cn('flex items-end justify-between gap-6', className)}>
      <div className="min-w-0">
        {eyebrow && <div className="eyebrow mb-2">{eyebrow}</div>}
        <h2
          className={cn(
            'font-display font-semibold text-white',
            size === 'lg' ? 'text-display-lg' : 'text-display-md',
          )}
        >
          {title}
        </h2>
        {description && (
          <p className="mt-3 max-w-xl text-sm text-ink-200">{description}</p>
        )}
      </div>
      {trailing && <div className="shrink-0">{trailing}</div>}
    </header>
  );
}
