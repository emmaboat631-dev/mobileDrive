'use client';

import { useState, useTransition } from 'react';
import { AlertCircle, Save } from 'lucide-react';
import { createDealer, updateDealer, type DealerResult } from '@/lib/admin/dealer-actions';
import { toast } from '@/store/toastStore';
import { useRouter } from 'next/navigation';

interface DealerDefaults {
  name?: string;
  slug?: string;
  city?: string | null;
  region?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  active?: boolean;
}

/**
 * Shared form for /admin/dealers/new and /admin/dealers/[id]. Pass editId to
 * flip from "Create" to "Save changes" and point at updateDealer.
 */
export function DealerForm({
  defaults,
  editId,
}: {
  defaults?: DealerDefaults;
  editId?: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function onSubmit(formData: FormData) {
    setError(null);
    start(async () => {
      const result: DealerResult = editId
        ? await updateDealer(editId, formData)
        : await createDealer(formData);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      toast.success(editId ? 'Showroom updated' : 'Showroom created');
      if (editId) router.refresh();
    });
  }

  return (
    <form action={onSubmit} className="space-y-6">
      <div className="rounded-2xl border border-white/[0.06] bg-ink-800/60 p-6">
        <h2 className="font-display text-lg font-semibold text-white">Basics</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field name="name" label="Showroom name" defaultValue={defaults?.name ?? ''} required />
          <Field name="slug" label="URL slug" defaultValue={defaults?.slug ?? ''} required hint="Lowercase + hyphens, e.g. accra, kumasi-east" />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field name="city" label="City" defaultValue={defaults?.city ?? ''} />
          <Field name="region" label="Region" defaultValue={defaults?.region ?? ''} />
        </div>
      </div>

      <div className="rounded-2xl border border-white/[0.06] bg-ink-800/60 p-6">
        <h2 className="font-display text-lg font-semibold text-white">Contact</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field name="phone" label="Phone" defaultValue={defaults?.phone ?? ''} />
          <Field name="email" label="Email" type="email" defaultValue={defaults?.email ?? ''} />
        </div>
        <div className="mt-4">
          <Field name="address" label="Address" defaultValue={defaults?.address ?? ''} />
        </div>
      </div>

      <div className="rounded-2xl border border-white/[0.06] bg-ink-800/60 p-6">
        <label className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <span className="block text-sm text-white">Active</span>
            <span className="mt-0.5 block text-[11px] text-ink-200">
              Inactive showrooms stay in the database but new orders can&apos;t be routed here.
            </span>
          </div>
          <span className="relative mt-1 inline-flex h-5 w-9 shrink-0 cursor-pointer items-center">
            <input
              type="checkbox"
              name="active"
              defaultChecked={defaults?.active ?? true}
              className="peer sr-only"
            />
            <span className="absolute inset-0 rounded-full bg-ink-500 transition peer-checked:bg-white" />
            <span className="relative ml-0.5 h-4 w-4 rounded-full bg-ink-900 transition peer-checked:translate-x-4" />
          </span>
        </label>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex justify-end">
        <button type="submit" disabled={pending} className="btn-primary disabled:opacity-60">
          <Save className="h-4 w-4" />
          {pending ? 'Saving…' : editId ? 'Save changes' : 'Create showroom'}
        </button>
      </div>
    </form>
  );
}

function Field({
  name, label, defaultValue, type, required, hint,
}: {
  name: string; label: string; defaultValue?: string; type?: string; required?: boolean; hint?: string;
}) {
  return (
    <label className="block">
      <span className="eyebrow block">
        {label} {required && <span className="text-red-300">*</span>}
      </span>
      <input
        name={name}
        type={type ?? 'text'}
        defaultValue={defaultValue}
        required={required}
        className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-ink-700 px-4 text-sm text-white placeholder:text-ink-300 focus:border-white/30 focus:outline-none"
      />
      {hint && <span className="mt-1 block text-[11px] text-ink-300">{hint}</span>}
    </label>
  );
}
