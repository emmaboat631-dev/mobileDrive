import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

interface BaseFieldProps {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  id?: string;
  className?: string;
}

interface FieldProps extends BaseFieldProps {
  children: ReactNode;
}

/**
 * Field shell for a labelled form control. Wraps the control, pairs the label
 * via htmlFor, surfaces hint/error text under the input, and consistently
 * sets aria-describedby so screen readers announce them. All auth, admin and
 * dealer forms should use this instead of hand-rolled label markup.
 */
export function Field({ label, hint, error, required, id, children, className }: FieldProps) {
  const describedBy = [hint && `${id ?? ''}-hint`, error && `${id ?? ''}-error`]
    .filter(Boolean)
    .join(' ') || undefined;

  return (
    <div className={cn('space-y-1.5', className)}>
      <label htmlFor={id} className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider text-ink-200">
        {label}
        {required && <span className="text-rose-300" aria-hidden>*</span>}
      </label>
      <div data-field-control aria-describedby={describedBy}>
        {children}
      </div>
      {hint && !error && (
        <p id={id ? `${id}-hint` : undefined} className="text-[11px] text-ink-300">
          {hint}
        </p>
      )}
      {error && (
        <p
          id={id ? `${id}-error` : undefined}
          className="text-[11px] text-rose-300"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}

/** A compact styled <input> matching the ink / rounded-full aesthetic. */
export function TextInput({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'h-10 w-full rounded-full border border-white/10 bg-ink-700 px-4 text-sm text-white placeholder:text-ink-300 focus:border-white/30 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60',
        className,
      )}
      {...props}
    />
  );
}

export function SelectInput({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        'h-10 w-full rounded-full border border-white/10 bg-ink-700 px-3 text-sm text-white focus:border-white/30 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function TextArea({
  className,
  rows = 3,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      rows={rows}
      className={cn(
        'w-full rounded-2xl border border-white/10 bg-ink-700 px-4 py-3 text-sm text-white placeholder:text-ink-300 focus:border-white/30 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60',
        className,
      )}
      {...props}
    />
  );
}
