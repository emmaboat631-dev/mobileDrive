'use client';

import type { ColorOption } from '@/types/vehicle';
import { cn } from '@/lib/utils/cn';
import { formatDelta } from '@/lib/utils/format';

interface Props {
  colors: ColorOption[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function ColorPicker({ colors, selectedId, onSelect }: Props) {
  const selected = colors.find((c) => c.id === selectedId);
  return (
    <div>
      <div className="mb-4 flex items-baseline justify-between">
        <h3 className="text-sm font-medium text-white">Exterior Color</h3>
        <span className="text-xs text-ink-200">{selected?.name}</span>
      </div>
      <div className="flex flex-wrap gap-3">
        {colors.map((c) => {
          const active = c.id === selectedId;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelect(c.id)}
              aria-label={c.name}
              aria-pressed={active}
              className={cn(
                'relative h-10 w-10 rounded-full border transition',
                active ? 'border-white' : 'border-white/15 hover:border-white/40',
              )}
            >
              <span
                className="absolute inset-1 rounded-full"
                style={{
                  background:
                    c.finish === 'metallic' || c.finish === 'pearl'
                      ? `radial-gradient(circle at 30% 30%, ${c.hex}, #000 140%)`
                      : c.hex,
                }}
              />
              {active && (
                <span className="pointer-events-none absolute -inset-1 rounded-full ring-1 ring-white/40" />
              )}
            </button>
          );
        })}
      </div>
      {selected && (
        <div className="mt-3 text-xs text-ink-200">
          {selected.finish[0].toUpperCase() + selected.finish.slice(1)} finish ·{' '}
          <span className="text-ink-100">{formatDelta(selected.priceDelta)}</span>
        </div>
      )}
    </div>
  );
}
