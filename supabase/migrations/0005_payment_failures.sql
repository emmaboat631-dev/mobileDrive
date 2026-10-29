-- mobileDrive — persisted log of failed payment attempts.
--
-- Any webhook event that reports a declined / failed / expired charge, or any
-- initialize() call that raised, lands here so admins can see the failure
-- surface and refund-support stories in /admin/payments.
-- RLS lets only admins read; the webhook route writes with the service role.

create table if not exists public.payment_failures (
  id            uuid primary key default uuid_generate_v4(),
  order_id      uuid references public.orders(id) on delete set null,
  provider      text not null,
  provider_ref  text,
  amount        int,
  currency      text,
  code          text,
  message       text,
  raw           jsonb,
  created_at    timestamptz not null default now()
);

create index if not exists payment_failures_order on public.payment_failures(order_id);
create index if not exists payment_failures_created on public.payment_failures(created_at desc);

alter table public.payment_failures enable row level security;

create policy "payment failures are readable by admins"
  on public.payment_failures for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );
