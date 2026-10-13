import { CalendarClock, Check, Mail, Phone, MapPin, Clock } from 'lucide-react';

export const metadata = { title: 'Test drives — Dealer · mobileDrive' };

const WEEK: Array<{
  date: string;
  weekday: string;
  slots: Array<{
    time: string;
    buyer: string;
    phone: string;
    vehicle: string;
    status: 'Confirmed' | 'Pending' | 'Completed';
    note?: string;
  }>;
}> = [
  {
    date: 'Oct 7',
    weekday: 'Monday',
    slots: [
      { time: '09:30', buyer: 'Asiamah Joshua', phone: '+233 55 123 4567', vehicle: 'Porsche 911 Carrera',   status: 'Confirmed', note: 'Wants to try Sport+ mode.' },
      { time: '11:00', buyer: 'Nia Mensah',      phone: '+233 24 987 6543', vehicle: 'BMW M4 Competition',   status: 'Confirmed' },
      { time: '14:30', buyer: 'Kojo Boateng',    phone: '+233 20 555 1212', vehicle: 'Tesla Model S',         status: 'Pending',   note: 'Needs valet parking.' },
    ],
  },
  {
    date: 'Oct 8',
    weekday: 'Tuesday',
    slots: [
      { time: '10:00', buyer: 'Ama Owusu',       phone: '+233 54 221 7788', vehicle: 'Audi RS6 Avant',       status: 'Confirmed' },
      { time: '15:00', buyer: 'Yaw Ampah',       phone: '+233 50 998 2211', vehicle: 'Mercedes-AMG GT',       status: 'Confirmed' },
    ],
  },
  {
    date: 'Oct 9',
    weekday: 'Wednesday',
    slots: [
      { time: '09:00', buyer: 'Serwaa Appiah',   phone: '+233 24 440 0101', vehicle: 'Range Rover Sport',    status: 'Pending' },
    ],
  },
  {
    date: 'Oct 10',
    weekday: 'Thursday',
    slots: [],
  },
  {
    date: 'Oct 11',
    weekday: 'Friday',
    slots: [
      { time: '13:00', buyer: 'Afia Kusi',       phone: '+233 55 303 2020', vehicle: 'BMW M4 Competition',   status: 'Confirmed' },
      { time: '16:30', buyer: 'Rafael Mendes',    phone: '+351 912 345 678', vehicle: 'Porsche 911 Carrera',  status: 'Confirmed', note: 'Fly-and-buy; test & flight at 20:00.' },
    ],
  },
];

const statusTone: Record<string, string> = {
  Confirmed: 'bg-emerald-400/15 text-emerald-400 border-emerald-400/30',
  Pending:   'bg-amber-400/15 text-amber-300 border-amber-400/30',
  Completed: 'bg-white/10 text-ink-100 border-white/15',
};

export default function DealerBookingsPage() {
  const total = WEEK.reduce((s, d) => s + d.slots.length, 0);
  const confirmed = WEEK.flatMap((d) => d.slots).filter((s) => s.status === 'Confirmed').length;
  const pending = WEEK.flatMap((d) => d.slots).filter((s) => s.status === 'Pending').length;

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <div className="eyebrow">This week</div>
          <h1 className="mt-2 font-display text-display-md font-semibold text-white">
            Test drives
          </h1>
          <p className="mt-2 text-sm text-ink-200">
            {total} slots · {confirmed} confirmed · {pending} awaiting confirmation
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" className="btn-secondary">Export</button>
          <button type="button" className="btn-primary">
            <CalendarClock className="h-4 w-4" />
            Block time
          </button>
        </div>
      </header>

      {/* Week calendar */}
      <div className="grid gap-3 lg:grid-cols-5">
        {WEEK.map((day) => (
          <section
            key={day.date}
            className="rounded-2xl border border-white/[0.06] bg-ink-800/60 p-4"
          >
            <header className="mb-3 flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div>
                <div className="text-sm font-semibold text-white">{day.date}</div>
                <div className="text-[11px] text-ink-200">{day.weekday}</div>
              </div>
              <div className="text-[11px] text-ink-200">
                {day.slots.length} slot{day.slots.length === 1 ? '' : 's'}
              </div>
            </header>

            {day.slots.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/[0.08] px-3 py-4 text-center text-[11px] text-ink-300">
                Free day — add a slot
              </div>
            ) : (
              <ul className="space-y-2">
                {day.slots.map((s) => (
                  <li
                    key={day.date + s.time + s.buyer}
                    className="rounded-xl border border-white/[0.04] bg-ink-700/40 p-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="inline-flex items-center gap-1.5 text-[11px] text-ink-100">
                        <Clock className="h-3 w-3" />
                        {s.time}
                      </div>
                      <span
                        className={
                          'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ' +
                          statusTone[s.status]
                        }
                      >
                        {s.status === 'Confirmed' && <Check className="h-2.5 w-2.5" />}
                        {s.status}
                      </span>
                    </div>
                    <div className="mt-2 text-sm font-semibold text-white">{s.vehicle}</div>
                    <div className="mt-0.5 text-[11px] text-ink-200">{s.buyer}</div>
                    {s.note && (
                      <div className="mt-2 rounded-md bg-white/[0.03] px-2 py-1.5 text-[10px] italic text-ink-100">
                        {s.note}
                      </div>
                    )}
                    <div className="mt-2 flex gap-2 text-[11px] text-ink-200">
                      <a href={`tel:${s.phone}`} className="inline-flex items-center gap-1 hover:text-white">
                        <Phone className="h-2.5 w-2.5" />
                        Call
                      </a>
                      <a href={`mailto:#`} className="inline-flex items-center gap-1 hover:text-white">
                        <Mail className="h-2.5 w-2.5" />
                        Email
                      </a>
                      <a className="ml-auto inline-flex items-center gap-1 hover:text-white">
                        <MapPin className="h-2.5 w-2.5" />
                        Showroom
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
