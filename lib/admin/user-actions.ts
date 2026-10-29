'use server';

import { revalidatePath } from 'next/cache';
import { getServerSupabase } from '@/lib/supabase/server';
import { logAdminAction } from '@/lib/security/audit';

export type UserRole = 'customer' | 'dealer' | 'admin';

export type AdminUserResult = { ok: true } | { ok: false; message: string };

async function requireAdmin() {
  const supabase = getServerSupabase();
  if (!supabase) return { ok: false as const, message: 'Backend not configured.' };
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { ok: false as const, message: 'Not signed in.' };
  const db = supabase as unknown as {
    from: (t: string) => {
      select: (c: string) => {
        eq: (k: string, v: string) => {
          maybeSingle: () => Promise<{ data: { role: string } | null }>;
        };
      };
    };
  };
  const { data: profile } = await db.from('profiles').select('role').eq('id', userData.user.id).maybeSingle();
  if (profile?.role !== 'admin') return { ok: false as const, message: 'Admin only.' };
  return { ok: true as const, supabase, me: userData.user.id };
}

/**
 * Change a user's role. Updates profiles.role for the target user. The caller
 * must be an admin; the DB-level check is handled by RLS, this is a
 * belt-and-braces check so we can return a nicer error.
 *
 * Promoting to 'dealer' optionally sets dealer_id too — a dealer without a
 * dealer_id can see every row (bad), so the UI always pairs the role change
 * with a showroom selection.
 */
export async function setUserRole(
  userId: string,
  role: UserRole,
  dealerId?: string | null,
): Promise<AdminUserResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  if (userId === auth.me && role !== 'admin') {
    return { ok: false, message: "You can't demote yourself." };
  }

  const patch: Record<string, unknown> = { role };
  if (role === 'dealer') patch.dealer_id = dealerId ?? null;
  if (role !== 'dealer' && role !== 'admin') patch.dealer_id = null;

  const db = auth.supabase as unknown as {
    from: (t: string) => {
      update: (p: Record<string, unknown>) => {
        eq: (k: string, v: string) => Promise<{ error: { message: string } | null }>;
      };
    };
  };
  const { error } = await db.from('profiles').update(patch).eq('id', userId);
  if (error) return { ok: false, message: error.message };

  await logAdminAction({
    action: 'user.role_change',
    entity: 'profile',
    entityId: userId,
    summary: `Set role to ${role}${role === 'dealer' && dealerId ? ` (dealer ${dealerId})` : ''}`,
    diff: patch,
  });

  revalidatePath('/admin/customers');
  revalidatePath(`/admin/customers/${userId}`);
  return { ok: true };
}
