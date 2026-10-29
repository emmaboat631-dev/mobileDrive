-- mobileDrive — persisted log of every email we send.
--
-- Each row records who received the message, which template produced it,
-- which order/booking it relates to, and whether the provider (Resend)
-- accepted or rejected the send. Admins can see this on /admin/email-log
-- (future) to audit deliverability.

create table if not exists public.email_log (
  id              uuid primary key default uuid_generate_v4(),
  to_address      text not null,
  template        text not null,
  subject         text not null,
  related_order   uuid references public.orders(id) on delete set null,
  related_booking uuid references public.test_drive_bookings(id) on delete set null,
  provider        text not null default 'resend',
  provider_id     text,
  status          text not null default 'sent'
                   check (status in ('sent','failed','queued')),
  error           text,
  created_at      timestamptz not null default now()
);

create index if not exists email_log_created on public.email_log(created_at desc);
create index if not exists email_log_to on public.email_log(to_address);
create index if not exists email_log_order on public.email_log(related_order);

alter table public.email_log enable row level security;

create policy "email log readable by admins"
  on public.email_log for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );
