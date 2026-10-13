'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { listVehicles } from '@/lib/vehicles/data';
import { formatPrice } from '@/lib/utils/format';

const CarViewer = dynamic(
  () => import('@/components/3d/CarViewer').then((m) => m.CarViewer),
  { ssr: false, loading: () => <HeroLoading /> },
);

const ALL = listVehicles();
const VEHICLE_COUNT = ALL.length;
const BRAND_COUNT = new Set(ALL.map((v) => v.brand)).size;
const BODY_COUNT = new Set(ALL.map((v) => v.bodyType)).size;
const STARTING = ALL.reduce((min, v) => (v.price < min ? v.price : min), Number.POSITIVE_INFINITY);

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden pb-20 pt-28 md:pt-32">
      {/* Backdrop — single warm accent, no multi-gradient slop */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden
        style={{
          background:
            'radial-gradient(60% 55% at 72% 42%, rgba(120, 150, 200, 0.14), transparent 70%)',
        }}
      />
      {/* Faint hairline rule as a horizon */}
      <div className="pointer-events-none absolute inset-x-0 top-[62%] -z-10 h-px bg-white/[0.05]" aria-hidden />

      <div className="container-page">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
          {/* Left column — editorial type stack */}
          <div className="relative order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-ink-100"
            >
              <Sparkles className="h-3 w-3" />
              A 3D automotive marketplace
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
              className="mt-7 font-display text-[clamp(2.75rem,7vw,6rem)] font-semibold leading-[0.95] tracking-[-0.03em] text-white"
            >
              Drive the<br />
              <span className="relative inline-block">
                extraordinary.
                <span
                  aria-hidden
                  className="absolute -bottom-2 left-0 right-0 h-px bg-gradient-to-r from-white/60 via-white/15 to-transparent"
                />
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="mt-7 max-w-md text-base leading-relaxed text-ink-100"
            >
              Explore, configure and experience your next vehicle in an interactive
              showroom — paint, wheels, trims and packages, in real time.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="mt-8 flex flex-col gap-3 sm:flex-row"
            >
              <Link href="/vehicles" className="btn-primary">
                Explore Vehicles
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/configure/porsche-911" className="btn-secondary">
                Build Your Vehicle
              </Link>
            </motion.div>

            {/* Signal strip — real data, no fake numbers */}
            <motion.dl
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.4 }}
              className="mt-10 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-white/[0.06] pt-6 md:grid-cols-4"
            >
              <SignalInline label="Vehicles" value={String(VEHICLE_COUNT)} />
              <SignalInline label="Brands" value={String(BRAND_COUNT)} />
              <SignalInline label="Body types" value={String(BODY_COUNT)} />
              <SignalInline label="Starting from" value={formatPrice(STARTING, 'USD')} />
            </motion.dl>
          </div>

          {/* Right column — 3D stage, generous aspect, bleeds right on wide screens */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative order-1 h-[46vh] min-h-[320px] w-full lg:order-2 lg:h-[64vh]"
          >
            <CarViewer
              bodyHex="#0F2341"
              bodyFinish="metallic"
              wheelStyle="performance"
              silhouette="sports"
              headlightsOn={false}
              autoRotate
              interactive
              showFullscreen
              className="h-full w-full"
            />
            {/* Floor fade */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink-900 to-transparent" />
            {/* Vehicle caption — anchors the stage to real content */}
            <div className="pointer-events-none absolute left-5 top-5 flex items-center gap-3 text-[11px] tracking-[0.14em] text-ink-200">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.75)]" />
              LIVE · 911 CARRERA · MIDNIGHT BLUE
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function SignalInline({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-[0.18em] text-ink-300">{label}</dt>
      <dd className="mt-1 font-display text-xl font-semibold text-white">{value}</dd>
    </div>
  );
}

function HeroLoading() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="text-sm text-ink-200">Preparing your vehicle…</div>
    </div>
  );
}
