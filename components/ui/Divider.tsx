import { cn } from '@/lib/utils/cn';

interface DividerProps {
  tone?: 'hairline' | 'strong';
  className?: string;
}

export function Divider({ tone = 'hairline', className }: DividerProps) {
  return (
    <div
      role="separator"
      className={cn(
        'h-px w-full',
        tone === 'strong' ? 'bg-white/15' : 'bg-white/[0.06]',
        className,
      )}
    />
  );
}
