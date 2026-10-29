import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';

export interface LegalSection {
  id: string;
  title: string;
  body: React.ReactNode;
}

interface LegalPageProps {
  kind: 'Privacy policy' | 'Terms of service' | 'Cookie policy';
  title: string;
  lede: string;
  effective: string;
  sections: LegalSection[];
}

const SIBLINGS = [
  { href: '/legal/privacy', label: 'Privacy policy' },
  { href: '/legal/terms',   label: 'Terms of service' },
  { href: '/legal/cookies', label: 'Cookie policy' },
];

export function LegalPage({ kind, title, lede, effective, sections }: LegalPageProps) {
  return (
    <section className="container-page pb-20 pt-28">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs text-ink-100 hover:text-white"
      >
        <ArrowLeft className="h-3 w-3" />
        Back to mobileDrive
      </Link>

      <header className="mt-6">
        <div className="eyebrow">{kind}</div>
        <h1 className="mt-2 font-display text-display-lg font-semibold -tracking-[0.025em] text-white">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl text-base text-ink-100 leading-relaxed">
          {lede}
        </p>
        <div className="mt-5 inline-flex items-center gap-2 text-xs text-ink-300">
          <FileText className="h-3.5 w-3.5" />
          Effective {effective}
        </div>
      </header>

      <div className="mt-12 grid gap-12 lg:grid-cols-[220px_1fr]">
        {/* Table of contents */}
        <aside className="h-fit space-y-6 lg:sticky lg:top-24">
          <nav aria-label="On this page" className="rounded-2xl border border-white/[0.06] bg-ink-800/60 p-5">
            <div className="eyebrow mb-3">On this page</div>
            <ul className="space-y-1.5">
              {sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="block rounded-md px-2.5 py-1.5 text-sm text-ink-100 hover:bg-white/[0.03] hover:text-white"
                  >
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="rounded-2xl border border-white/[0.06] bg-ink-800/60 p-5">
            <div className="eyebrow mb-3">Related</div>
            <ul className="space-y-1.5">
              {SIBLINGS.filter((p) => p.label !== kind).map((p) => (
                <li key={p.href}>
                  <Link
                    href={p.href}
                    className="block rounded-md px-2.5 py-1.5 text-sm text-ink-100 hover:bg-white/[0.03] hover:text-white"
                  >
                    {p.label} →
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Main */}
        <article className="min-w-0 space-y-12">
          {sections.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-28">
              <h2 className="font-display text-2xl font-semibold text-white">{s.title}</h2>
              <div className="mt-4 space-y-4 text-sm text-ink-100 leading-relaxed [&_a]:text-white [&_a]:underline [&_code]:rounded [&_code]:bg-ink-800 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-xs [&_code]:text-white [&_strong]:text-white [&_ul]:ml-5 [&_ul]:list-disc [&_ul]:space-y-1.5">
                {s.body}
              </div>
            </section>
          ))}

          <footer className="mt-16 border-t border-white/[0.06] pt-8 text-xs text-ink-200">
            Questions about this document? Email{' '}
            <a href="mailto:legal@mobiledrive.app" className="text-white underline">
              legal@mobiledrive.app
            </a>
            .
          </footer>
        </article>
      </div>
    </section>
  );
}
