import 'server-only';
import { headers } from 'next/headers';
import { getServerSupabase } from '@/lib/supabase/server';
import { getAdminSupabase } from '@/lib/supabase/admin';

/**
 * Writes a row to `admin_audit_log` for a successful admin / dealer mutation.
 *
 * Call this *after* the write succeeds (not before) so a failed mutation
 * doesn't leave a misleading trail. The logger never throws — a failed log
 * write prints a server-side warning but doesn't fail the caller's action.
 *
 * Usage:
 *   await logAdminAction({
 *     action: 'vehicle.update',
 *     entity: 'vehicle',
 *     entityId: id,
 *     summary: `Updated ${brand} ${model}`,
 *     diff: { price: { from: 48000, to: 51200 } },
 *   });
 */
export interface AuditInput {
  action: string;
  entity?: string;
  entityId?: string;
  summary?: string;
  diff?: unknown;
}

export async function logAdminAction(input: AuditInput): Promise<void> {
  const admin = getAdminSupabase();
  if (!admin) return;

  let actorId: string | null = null;
  let actorRole: string | null = null;
  try {
    const server = getServerSupabase();
    if (server) {
      const { data: userData } = await server.auth.getUser();
      actorId = userData.user?.id ?? null;
      if (actorId) {
        const db = admin as unknown as {
          from: (t: string) => {
            select: (c: string) => {
              eq: (k: string, v: string) => {
                maybeSingle: () => Promise<{ data: { role: string } | null }>;
              };
            };
          };
        };
        const { data } = await db.from('profiles').select('role').eq('id', actorId).maybeSingle();
        actorRole = data?.role ?? null;
      }
    }
  } catch {
    // Resolving the actor is best-effort — a missing session shouldn't drop the log.
  }

  const h = await headers();
  const ip = (h.get('x-forwarded-for') ?? h.get('x-real-ip') ?? '').split(',')[0]?.trim() || null;
  const ua = h.get('user-agent');

  const row = {
    actor_id: actorId,
    actor_role: actorRole,
    action: input.action,
    entity: input.entity ?? null,
    entity_id: input.entityId ?? null,
    summary: input.summary ?? null,
    diff: (input.diff ?? null) as unknown,
    ip,
    user_agent: ua,
  };

  try {
    const db = admin as unknown as {
      from: (t: string) => {
        insert: (p: Record<string, unknown>) => Promise<{ error: { message: string } | null }>;
      };
    };
    const { error } = await db.from('admin_audit_log').insert(row);
    if (error) {
      // eslint-disable-next-line no-console
      console.warn('[audit] insert failed:', error.message);
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('[audit] threw:', e);
  }
}
