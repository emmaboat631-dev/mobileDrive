import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { Database } from './database.types';
import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured } from './env';

/**
 * Server-side Supabase client for use in Server Components, Route Handlers,
 * and Server Actions. Returns null if env vars aren't set.
 *
 * This reads/writes auth cookies through next/headers so session refresh works
 * seamlessly across RSC renders.
 */
export function getServerSupabase() {
  if (!isSupabaseConfigured()) return null;

  const cookieStore = cookies();
  return createServerClient<Database>(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch {
          // Server Component contexts can't mutate cookies; middleware handles refresh instead.
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: '', ...options });
        } catch {
          /* ignore — see note above */
        }
      },
    },
  });
}
