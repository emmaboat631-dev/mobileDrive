/**
 * mobileDrive runs with or without Supabase.
 *
 * When `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set
 * (either in `.env.local` or the hosting environment), the app uses the real
 * Supabase client. When they're missing — e.g. a fresh clone before anyone
 * has created a Supabase project — the client helpers return `null` and the
 * data layer falls back to the demo seed in `lib/vehicles/data.ts`.
 *
 * This keeps "git clone → npm run dev" working with zero backend setup.
 */

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}
