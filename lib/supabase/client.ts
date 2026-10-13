'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './database.types';
import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured } from './env';

let _client: ReturnType<typeof createBrowserClient<Database>> | null = null;

/** Browser-side Supabase client. Returns null if env vars aren't set yet. */
export function getBrowserSupabase() {
  if (!isSupabaseConfigured()) return null;
  if (_client) return _client;
  _client = createBrowserClient<Database>(SUPABASE_URL!, SUPABASE_ANON_KEY!);
  return _client;
}
