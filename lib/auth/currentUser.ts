import 'server-only';
import { getServerSupabase } from '@/lib/supabase/server';

export interface CurrentUser {
  id: string;
  email: string | null;
  fullName: string | null;
  role: 'customer' | 'dealer' | 'admin';
  avatarUrl: string | null;
  initials: string;
  firstName: string;
  dealerId: string | null;
}

function deriveInitials(name: string | null, email: string | null): string {
  const source = (name ?? email ?? 'U').trim();
  return source
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function deriveFirstName(name: string | null, email: string | null): string {
  if (name && name.trim()) return name.trim().split(/\s+/)[0];
  if (email) return email.split('@')[0];
  return 'there';
}

/**
 * Returns the signed-in user with their profile row joined, or null when
 * nobody is signed in / Supabase isn't configured. Server-only — call from
 * Server Components, layouts and server actions.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = getServerSupabase();
  if (!supabase) return null;

  const { data: userData, error } = await supabase.auth.getUser();
  if (error || !userData.user) return null;

  const user = userData.user;
  const db = supabase as unknown as {
    from: (t: string) => {
      select: (c: string) => {
        eq: (k: string, v: string) => {
          maybeSingle: () => Promise<{
            data: { full_name: string | null; role: string; avatar_url: string | null; dealer_id: string | null } | null;
          }>;
        };
      };
    };
  };
  const { data: profile } = await db
    .from('profiles')
    .select('full_name, role, avatar_url, dealer_id')
    .eq('id', user.id)
    .maybeSingle();

  const fullName =
    profile?.full_name ??
    (user.user_metadata?.full_name as string | undefined) ??
    null;

  return {
    id: user.id,
    email: user.email ?? null,
    fullName,
    role: ((profile?.role as CurrentUser['role']) ?? 'customer'),
    avatarUrl: profile?.avatar_url ?? null,
    initials: deriveInitials(fullName, user.email ?? null),
    firstName: deriveFirstName(fullName, user.email ?? null),
    dealerId: profile?.dealer_id ?? null,
  };
}
