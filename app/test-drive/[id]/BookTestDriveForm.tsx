'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Calendar, Clock, User, Phone, MessageSquare, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { bookTestDrive, type BookingResult } from '@/lib/bookings/actions';
import { cn } from '@/lib/utils/cn';

/** Build business-hour slots at :00 and :30, 09:00 – 17:30. */
const SLOTS = (() => {
  const out: string[] = [];
  for (let h = 9; h < 18; h++) {
    out.push(`${String(h).padStart(2, '0')}:00`);
    out.push(`${String(h).padStart(2, '0')}:30`);
  }
  return out;
})();

/** Max 60 days ahead per server-side validation. */
function maxDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 60);
  return d.toISOString().slice(0, 10);
}
function tomorrowDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

export function BookTestDriveForm({ vehicleId }: { vehicleId: string }) {
  const [date, setDate] = useState(tomorrowDate());
  const [time, setTime] = useState('10:00');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [result, setResult] = useState<BookingResult | null>(null);
  const [pending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);
    startTransition(async () => {
      const r = await bookTestDrive({ vehicleId, date, time, fullName, phone, notes });
      setResult(r);
    });
  };

  // Success: show the confirmation panel in place of the form.
  if (result && result.ok) {
    const when = new Date(result.scheduledAt);
    const whenLabel = when.toLocaleString(undefined, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    });
    return (
      <div className="rounded-2xl border border-white/[0.06] bg-ink-800/80 p-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/10 text-emerald-400">
            <CheckCircle2 className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-display text-lg font-semibold text-white">
              {result.mode === 'persisted' ? 'Request received' : 'Request captured'}
            </h3>
            <p className="text-xs text-ink-200">{whenLabel}</p>
          </div>
        </div>

        <p className="mt-5 text-sm leading-relaxed text-ink-100">
          Your test-drive request has been {result.mode === 'persisted' ? 'saved' : 'captured locally'}.
          A mobileDrive specialist will call you within one business day to confirm the
          slot, vehicle readiness, and pickup location.
        </p>

        {result.mode === 'local' && (
          <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-[11px] text-amber-200">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              Supabase is not configured in this environment, so this request has not been
              persisted to the backend. Hook up the environment variables to enable real
              bookings.
            </span>
          </div>
        )}

        {result.bookingId && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-ink-700/60 px-3 py-1.5 text-[11px] text-ink-200">
            <span>Reference</span>
            <code className="text-white">{result.bookingId.slice(0, 8).toUpperCase()}</code>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-2.5">
          <Link href={`/vehicles/${result.vehicleId}`} className="btn-primary w-full">
            Back to vehicle
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/account" className="btn-secondary w-full">
            Open my account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-white/[0.06] bg-ink-800/80 p-6">
      <h3 className="font-display text-lg font-semibold text-white">When works for you?</h3>
      <p className="text-xs text-ink-200">
        Pick a slot during 09:00–18:00. We&apos;ll confirm by phone.
      </p>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Date" icon={<Calendar className="h-3.5 w-3.5" />}>
          <input
            type="date"
            required
            min={tomorrowDate()}
            max={maxDate()}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="input-field pl-3"
          />
        </Field>
        <Field label="Time" icon={<Clock className="h-3.5 w-3.5" />}>
          <select
            required
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="input-field pl-3"
          >
            {SLOTS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Full name" icon={<User className="h-3.5 w-3.5" />}>
        <input
          type="text"
          required
          minLength={2}
          autoComplete="name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Your full name"
          className="input-field pl-3"
        />
      </Field>

      <Field label="Phone" icon={<Phone className="h-3.5 w-3.5" />}>
        <input
          type="tel"
          required
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+233 20 123 4567"
          className="input-field pl-3"
        />
      </Field>

      <Field label="Notes (optional)" icon={<MessageSquare className="h-3.5 w-3.5" />}>
        <textarea
          rows={3}
          value={notes}
          maxLength={500}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Anything the specialist should know?"
          className="w-full rounded-2xl border border-white/10 bg-ink-700 px-4 py-3 text-sm text-white placeholder:text-ink-300 focus:border-white/30 focus:outline-none"
        />
      </Field>

      {result && !result.ok && (
        <div className="flex items-start gap-2.5 rounded-xl border border-rose-400/30 bg-rose-400/10 p-3 text-[11px] text-rose-200">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{result.error}</span>
        </div>
      )}

      <button type="submit" disabled={pending} className={cn('btn-primary w-full', pending && 'cursor-wait')}>
        {pending ? 'Submitting…' : 'Request test drive'}
      </button>
      <p className="text-[10px] leading-relaxed text-ink-300">
        By submitting, you agree to be contacted about this request. We will not confirm
        a booking automatically — a specialist confirms by phone.
      </p>
    </form>
  );
}

function Field({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-ink-200">
        {icon}
        {label}
      </span>
      {children}
    </label>
  );
}
