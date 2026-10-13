import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface EmptyStateProps {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}

/**
 * Shared empty state. One typographic treatment for "nothing here yet"
 * across wishlist, orders, cart, admin tables, dealer lists.
 */
export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-white/[0.06] bg-ink-800/40 px-6 py-14 text-center',
        className,
      )}
    >
      {icon && (
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-ink-700/60 text-ink-100">
          {icon}
        </div>
      )}
      <h3 className="font-display text-lg font-semibold text-white">{title}</h3>
      {description && <p className="mt-2 max-w-sm text-sm text-ink-200">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
