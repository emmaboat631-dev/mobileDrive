'use client';

import type { CameraPreset } from '@/store/configuratorStore';
import { cn } from '@/lib/utils/cn';
import { Lightbulb, RotateCcw } from 'lucide-react';

interface Props {
  preset: CameraPreset;
  onPreset: (p: CameraPreset) => void;
  headlightsOn: boolean;
  onToggleHeadlights: () => void;
}

const PRESETS: { id: CameraPreset; label: string }[] = [
  { id: 'orbit', label: '360°' },
  { id: 'front', label: 'Front' },
  { id: 'side', label: 'Side' },
  { id: 'rear', label: 'Rear' },
];

export function CameraToolbar({ preset, onPreset, headlightsOn, onToggleHeadlights }: Props) {
  return (
    <div className="pointer-events-auto flex items-center justify-between gap-2 rounded-full border border-white/10 bg-ink-800/80 p-1.5 backdrop-blur-md">
      <div className="flex items-center gap-1">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onPreset(p.id)}
            className={cn(
              'rounded-full px-3.5 py-1.5 text-xs font-medium transition',
              preset === p.id
                ? 'bg-white text-ink-900'
                : 'text-ink-100 hover:bg-white/10 hover:text-white',
            )}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-1 pl-1">
        <button
          type="button"
          onClick={onToggleHeadlights}
          aria-pressed={headlightsOn}
          aria-label="Toggle headlights"
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-full transition',
            headlightsOn ? 'bg-white text-ink-900' : 'text-ink-100 hover:bg-white/10',
          )}
        >
          <Lightbulb className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onPreset('orbit')}
          aria-label="Reset camera"
          className="flex h-8 w-8 items-center justify-center rounded-full text-ink-100 transition hover:bg-white/10"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
