-- mobileDrive — RLS hardening follow-ups.
--
-- Supabase's security linter flagged two issues after 0011:
--
--   * SECURITY DEFINER functions were callable as PostgREST RPCs by `anon`
--     and `authenticated` roles. The functions are triggers; they should
--     never be invoked directly. Revoke EXECUTE from PUBLIC and the client
--     roles so they can only run from inside the trigger.
--
--   * `public.touch_updated_at` had a mutable search_path, which lets a
--     caller shadow pg builtins via a hijacked path. Pin it to `pg_catalog`.
--
-- Idempotent.

-- Pin touch_updated_at's search_path.
create or replace function public.touch_updated_at() returns trigger
language plpgsql
set search_path = pg_catalog
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Lock down the SECURITY DEFINER functions so clients can't call them as RPCs.
revoke execute on function public.handle_new_user()                       from public, anon, authenticated;
revoke execute on function public.profiles_block_privilege_escalation()   from public, anon, authenticated;
