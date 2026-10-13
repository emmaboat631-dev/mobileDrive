'use client';

import { cn } from '@/lib/utils/cn';
import { formatDelta } from '@/lib/utils/format';

interface OptionItem {
  id: string;
  name: string;
  description?: string;
  priceDelta: number;
}

interface Props {
  title: string;
  items: OptionItem[];
  selectedId?: string | null;
  selectedIds?: string[];
  multi?: boolean;
  onSelect: (id: string) => void;
}

export function OptionList({ title, items, selectedId, selectedIds, multi, onSelect }: Props) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-medium text-white">{title}</h3>
      <div className="flex flex-col gap-2">
        {items.map((item) => {
          const active = multi
            ? selectedIds?.includes(item.id)
            : item.id === selectedId;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              aria-pressed={active}
              className={cn(
                'group flex w-full items-center justify-between gap-4 rounded-lg border px-4 py-3 text-left transition',
                active
                  ? 'border-white bg-white/5'
                  : 'border-white/10 bg-ink-700/40 hover:border-white/25',
              )}
            >
              <div className="min-w-0">
                <div className="text-sm font-medium text-white">{item.name}</div>
                {item.description && (
                  <div className="mt-0.5 line-clamp-1 text-xs text-ink-200">
                    {item.description}
                  </div>
                )}
              </div>
              <div className="shrink-0 text-xs text-ink-100">
                {formatDelta(item.priceDelta)}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
