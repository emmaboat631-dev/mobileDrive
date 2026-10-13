import { Hero } from '@/components/home/Hero';
import { FeaturedRail } from '@/components/home/FeaturedRail';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedRail />

      {/* Secondary CTA — Configurator entry */}
      <section className="container-page pb-20">
        <div className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-ink-800 p-8 md:p-14">
          <div
            className="pointer-events-none absolute inset-0 opacity-70"
            aria-hidden
            style={{
              background:
                'radial-gradient(60% 70% at 85% 50%, rgba(100, 130, 180, 0.18), transparent 70%)',
            }}
          />
          <div className="relative grid gap-10 md:grid-cols-2 md:items-center">
            <div>
              <div className="eyebrow mb-3">The configurator</div>
              <h2 className="font-display text-display-md font-semibold text-white">
                Shape every detail. In real time.
              </h2>
              <p className="mt-4 max-w-md text-base text-ink-100">
                Change paint, wheels, interior and packages — the vehicle in your window
                updates instantly, with photoreal materials and interactive lighting.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/configure/m4-competition" className="btn-primary">
                  Start a build
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/vehicles" className="btn-secondary">
                  Browse inventory
                </Link>
              </div>
            </div>
            <ul className="grid grid-cols-2 gap-4">
              {[
                ['12', 'Paint finishes'],
                ['4', 'Wheel designs'],
                ['4', 'Interior trims'],
                ['3', 'Equipment packs'],
              ].map(([v, l]) => (
                <li
                  key={l}
                  className="rounded-xl border border-white/[0.06] bg-ink-700/50 p-5"
                >
                  <div className="font-display text-3xl font-semibold text-white">{v}</div>
                  <div className="mt-1 text-xs text-ink-200">{l}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
