import { Hero } from '@/components/home/Hero';
import { ShopByCategory } from '@/components/home/ShopByCategory';
import { FeaturedRail } from '@/components/home/FeaturedRail';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <>
      <Hero />
      <ShopByCategory />
      <FeaturedRail />

      {/* The studio / configurator proposition — intentionally quiet, no cards */}
      <section className="container-page pb-24">
        <div className="grid gap-10 border-t border-white/[0.06] pt-16 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-xl">
            <div className="eyebrow mb-3">The studio</div>
            <h2 className="font-display text-display-md font-semibold text-white">
              A configurator that moves with you.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-ink-100">
              Choose paint, wheels, interior and packages while the vehicle in your window
              updates in real time — photoreal materials, interactive lighting, camera
              presets and fullscreen when you want to look closer.
            </p>
            <dl className="mt-8 grid grid-cols-2 gap-x-10 gap-y-5 border-t border-white/[0.06] pt-6">
              <SmallStat label="Paint finishes" value="12" />
              <SmallStat label="Wheel designs" value="4" />
              <SmallStat label="Interior trims" value="4" />
              <SmallStat label="Camera presets" value="4" />
            </dl>
          </div>

          <div className="flex flex-col gap-3 lg:self-end">
            <Link href="/configure/porsche-911" className="btn-primary">
              Start a build
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/vehicles" className="btn-secondary">
              Explore the inventory
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function SmallStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-[0.18em] text-ink-300">{label}</dt>
      <dd className="mt-1 font-display text-2xl font-semibold text-white">{value}</dd>
    </div>
  );
}
