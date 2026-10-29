import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_URL } from './env';

/**
 * Service-role Supabase client. Bypasses Row Level Security — only safe to use
 * from server-only code (webhooks, cron jobs, admin actions after you've done
 * your own permission check). NEVER import this into a client component.
 *
 * Returns null when SUPABASE_SERVICE_ROLE_KEY isn't set, so the caller can
 * fail with a clear error instead of crashing on import.
 */
let _admin: SupabaseClient | null = null;

export function getAdminSupabase(): SupabaseClient | null {
  if (!SUPABASE_URL) return null;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) return null;
  if (_admin) return _admin;
  _admin = createClient(SUPABASE_URL, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return _admin;
}
