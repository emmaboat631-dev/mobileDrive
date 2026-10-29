-- mobileDrive — admin audit log (Phase 8, item 52).
--
-- Records every write performed by an admin or dealer so disputes can be
-- traced ("who changed this vehicle's price?", "who promoted that user?").
-- The logger is called from server actions after a successful mutation.
-- RLS: admins read, service-role writes. No one else can see the trail.

create table if not exists public.admin_audit_log (
  id          uuid primary key default uuid_generate_v4(),
  actor_id    uuid references public.profiles(id) on delete set null,
  actor_role  text,
  action      text not null,
  entity      text,
  entity_id   text,
  summary     text,
  diff        jsonb,
  ip          text,
  user_agent  text,
  created_at  timestamptz not null default now()
);

create index if not exists admin_audit_log_actor_idx on public.admin_audit_log(actor_id);
create index if not exists admin_audit_log_action_idx on public.admin_audit_log(action);
create index if not exists admin_audit_log_entity_idx on public.admin_audit_log(entity, entity_id);
create index if not exists admin_audit_log_created_idx on public.admin_audit_log(created_at desc);

alter table public.admin_audit_log enable row level security;

create policy "admin audit log readable by admins"
  on public.admin_audit_log for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );
-- No INSERT/UPDATE/DELETE policies → clients can't write. Only service-role
-- (used from server actions) can insert, which is exactly what we want.
