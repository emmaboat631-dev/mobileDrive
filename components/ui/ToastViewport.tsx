'use client';

import Link from 'next/link';
import { CheckCircle2, AlertTriangle, Info, XCircle, X, ArrowUpRight } from 'lucide-react';
import { useToasts, type Toast, type ToastTone } from '@/store/toastStore';
import { cn } from '@/lib/utils/cn';

const TONE_ICON = {
  success: CheckCircle2,
  warning: AlertTriangle,
  danger:  XCircle,
  info:    Info,
  default: Info,
} as const;

const TONE_CLASSES: Record<ToastTone, { border: string; bg: string; icon: string }> = {
  success: {
    border: 'border-emerald-400/30',
    bg:     'bg-emerald-400/10',
    icon:   'text-emerald-400',
  },
  warning: {
    border: 'border-amber-400/30',
    bg:     'bg-amber-400/10',
    icon:   'text-amber-300',
  },
  danger: {
    border: 'border-red-500/30',
    bg:     'bg-red-500/10',
    icon:   'text-red-300',
  },
  info: {
    border: 'border-sky-400/30',
    bg:     'bg-sky-400/10',
    icon:   'text-sky-300',
  },
  default: {
    border: 'border-white/[0.08]',
    bg:     'bg-ink-800/90',
    icon:   'text-ink-100',
  },
};

/**
 * Mount in app/layout.tsx. Reads from the Zustand store and renders a stack
 * of dismissible notifications fixed to the bottom-right (desktop) or
 * bottom-full (mobile) of the viewport.
 */
export function ToastViewport() {
  const toasts = useToasts((s) => s.toasts);
  const dismiss = useToasts((s) => s.dismiss);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-label="Notifications"
      className="pointer-events-none fixed inset-x-4 bottom-4 z-[70] flex flex-col items-stretch gap-2 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:max-w-sm"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const Icon = TONE_ICON[toast.tone];
  const tone = TONE_CLASSES[toast.tone];

  return (
    <div
      role="status"
      className={cn(
        'pointer-events-auto flex items-start gap-3 rounded-xl border p-3.5 shadow-lg backdrop-blur-xl',
        'animate-slide-up',
        tone.border,
        tone.bg,
      )}
    >
      <div
        className={cn(
          'grid h-7 w-7 shrink-0 place-items-center rounded-full bg-ink-900/60',
          tone.icon,
        )}
      >
        <Icon className="h-3.5 w-3.5" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-white">{toast.title}</div>
        {toast.description && (
          <div className="mt-0.5 text-xs text-ink-100">{toast.description}</div>
        )}
        {toast.action && (
          <div className="mt-2">
            {toast.action.href ? (
              <Link
                href={toast.action.href}
                className="inline-flex items-center gap-1 text-xs font-medium text-white hover:underline"
                onClick={onDismiss}
              >
                {toast.action.label}
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => {
                  toast.action?.onClick?.();
                  onDismiss();
                }}
                className="text-xs font-medium text-white hover:underline"
              >
                {toast.action.label}
              </button>
            )}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-ink-200 hover:bg-white/[0.05] hover:text-white"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}
