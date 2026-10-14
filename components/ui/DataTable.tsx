import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

export interface DataTableColumn<T> {
  key: string;
  header: ReactNode;
  render: (row: T) => ReactNode;
  align?: 'left' | 'right' | 'center';
  /** Fixed column width (any valid CSS width). */
  width?: string;
  /** Make the cell content tabular (numeric columns). */
  tabular?: boolean;
}

interface Props<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  getKey: (row: T) => string;
  /** Render when `rows` is empty. */
  empty?: ReactNode;
  /** Called with the row; wrap each row in a Link by returning an href. */
  rowHref?: (row: T) => string | undefined;
  className?: string;
}

/**
 * Operational table used by admin + dealer. One typographic treatment, one
 * header style, zebra striping. Avoids 15 bespoke `<table>` call-sites across
 * the app each with slightly different padding.
 */
export function DataTable<T>({ columns, rows, getKey, empty, rowHref, className }: Props<T>) {
  if (rows.length === 0) {
    return (
      <div className={cn('rounded-2xl border border-white/[0.06] bg-ink-800/60 px-6 py-10 text-center text-sm text-ink-200', className)}>
        {empty ?? 'No records to show.'}
      </div>
    );
  }

  return (
    <div className={cn('overflow-x-auto rounded-2xl border border-white/[0.06] bg-ink-800/60', className)}>
      <table className="w-full text-sm">
        <thead className="border-b border-white/[0.06] text-left text-[11px] uppercase tracking-wider text-ink-300">
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                className={cn(
                  'px-6 py-3 font-medium',
                  c.align === 'right' && 'text-right',
                  c.align === 'center' && 'text-center',
                )}
                style={c.width ? { width: c.width } : undefined}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.04]">
          {rows.map((row) => {
            const href = rowHref?.(row);
            const content = columns.map((c) => (
              <td
                key={c.key}
                className={cn(
                  'px-6 py-3.5',
                  c.align === 'right' && 'text-right',
                  c.align === 'center' && 'text-center',
                  c.tabular && 'tabular-nums',
                )}
              >
                {c.render(row)}
              </td>
            ));
            return (
              <tr
                key={getKey(row)}
                className={cn('text-ink-100 transition hover:bg-white/[0.02]', href && 'cursor-pointer')}
              >
                {content}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
