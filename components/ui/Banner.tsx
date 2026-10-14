import type { ReactNode } from 'react';
import { AlertTriangle, Info, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export type BannerTone = 'info' | 'success' | 'warning' | 'danger';

interface Props {
  tone?: BannerTone;
  icon?: ReactNode;
  title?: ReactNode;
  children: ReactNode;
  className?: string;
}

const TONE: Record<BannerTone, string> = {
  info:    'border-sky-400/30 bg-sky-400/10 text-sky-200',
  success: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200',
  warning: 'border-amber-400/30 bg-amber-400/10 text-amber-200',
  danger:  'border-rose-400/30 bg-rose-400/10 text-rose-200',
};

const DEFAULT_ICON: Record<BannerTone, ReactNode> = {
  info:    <Info className="h-4 w-4" />,
  success: <CheckCircle2 className="h-4 w-4" />,
  warning: <AlertTriangle className="h-4 w-4" />,
  danger:  <XCircle className="h-4 w-4" />,
};

/**
 * Inline announcement banner for backend-state notices (unconfigured Supabase,
 * demo mode, missing permissions, write errors). One shape across the app.
 */
export function Banner({ tone = 'info', icon, title, children, className }: Props) {
  return (
    <div
      role="status"
      className={cn('flex items-start gap-3 rounded-xl border p-3 text-[13px] leading-relaxed', TONE[tone], className)}
    >
      <div className="mt-0.5 shrink-0">{icon ?? DEFAULT_ICON[tone]}</div>
      <div className="min-w-0 flex-1">
        {title && <div className="font-medium text-white">{title}</div>}
        <div className={title ? 'mt-0.5' : ''}>{children}</div>
      </div>
    </div>
  );
}
