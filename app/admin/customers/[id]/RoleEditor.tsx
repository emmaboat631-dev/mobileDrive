'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Check, AlertCircle } from 'lucide-react';
import { setUserRole, type UserRole } from '@/lib/admin/user-actions';
import { toast } from '@/store/toastStore';
import { cn } from '@/lib/utils/cn';

interface DealerOption {
  id: string;
  name: string;
}

/**
 * Admin control to change a user's role. 'dealer' requires a dealer selection
 * (so the user is scoped to a showroom); for 'customer' and 'admin' the dealer
 * dropdown is hidden.
 */
export function RoleEditor({
  userId,
  currentRole,
  currentDealerId,
  dealers,
}: {
  userId: string;
  currentRole: UserRole;
  currentDealerId: string | null;
  dealers: DealerOption[];
}) {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>(currentRole);
  const [dealerId, setDealerId] = useState<string | null>(currentDealerId);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const dirty = role !== currentRole || (role === 'dealer' && dealerId !== currentDealerId);
  const needsDealer = role === 'dealer';
  const canSave = dirty && (!needsDealer || !!dealerId) && !pending;

  function onSave() {
    setError(null);
    start(async () => {
      const result = await setUserRole(userId, role, needsDealer ? dealerId : null);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      toast.success('Role updated', `User is now ${role}.`);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-ink-200" />
        <div className="eyebrow">Access level</div>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        {(['customer', 'dealer', 'admin'] as UserRole[]).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRole(r)}
            className={cn(
              'flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition',
              role === r
                ? 'border-white bg-white/[0.08] text-white'
                : 'border-white/10 text-ink-100 hover:border-white/30',
            )}
          >
            <div>
              <div className="font-medium capitalize">{r}</div>
              <div className="text-[11px] text-ink-200">
                {r === 'customer' && 'Shops the storefront.'}
                {r === 'dealer' && 'Staffs one showroom.'}
                {r === 'admin' && 'Full platform access.'}
              </div>
            </div>
            {role === r && <Check className="h-4 w-4 shrink-0" />}
          </button>
        ))}
      </div>

      {needsDealer && (
        <label className="block">
          <span className="eyebrow block">Assign to showroom</span>
          <select
            value={dealerId ?? ''}
            onChange={(e) => setDealerId(e.target.value || null)}
            className="mt-2 h-11 w-full appearance-none rounded-xl border border-white/10 bg-ink-700 px-4 text-sm text-white focus:border-white/30 focus:outline-none"
          >
            <option value="">Pick a showroom…</option>
            {dealers.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </label>
      )}

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex items-center justify-end gap-2">
        <button type="button" onClick={() => { setRole(currentRole); setDealerId(currentDealerId); setError(null); }} disabled={!dirty || pending} className="text-xs text-ink-200 hover:text-white disabled:opacity-50">
          Reset
        </button>
        <button type="button" onClick={onSave} disabled={!canSave} className="btn-primary disabled:opacity-60">
          {pending ? 'Saving…' : 'Save role'}
        </button>
      </div>
    </div>
  );
}
