'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { listVehicles } from '@/lib/vehicles/data';

const VEHICLE_COUNT = listVehicles().length;

const CarViewer = dynamic(
  () => import('@/components/3d/CarViewer').then((m) => m.CarViewer),
  { ssr: false, loading: () => <HeroLoading /> },
);

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden pb-10 pt-28 md:pt-36 lg:pb-20 lg:pt-40">
      {/* Backdrop gradient */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden
        style={{
          background:
            'radial-gradient(60% 50% at 50% 15%, rgba(80, 110, 160, 0.14), transparent 70%), radial-gradient(50% 40% at 50% 85%, rgba(20, 20, 25, 0.9), #07080A 70%)',
        }}
      />

      <div className="container-page">
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-ink-100"
          >
            <Sparkles className="h-3 w-3" />
            Interactive 3D showroom
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 max-w-4xl font-display text-display-xl font-semibold text-white"
          >
            Drive the extraordinary.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 max-w-xl text-balance text-base text-ink-100 md:text-lg"
          >
            Explore, configure and experience your next vehicle in an interactive 3D showroom.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="mt-9 flex flex-col items-center gap-3 sm:flex-row"
          >
            <Link href="/vehicles" className="btn-primary">
              Explore Vehicles
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/configure/m4-competition" className="btn-secondary">
              Build Your Vehicle
            </Link>
          </motion.div>
        </div>

        {/* 3D stage */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative mt-10 h-[52vh] min-h-[380px] w-full md:mt-14 md:h-[62vh]"
        >
          <CarViewer
            bodyHex="#0F2341"
            bodyFinish="metallic"
            wheelStyle="performance"
            headlightsOn={false}
            autoRotate
            interactive
            className="h-full w-full"
          />
          {/* Floor fade */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink-900 to-transparent" />
        </motion.div>

        {/* Signal row */}
        <div className="mt-6 grid grid-cols-2 gap-3 text-sm md:mt-10 md:grid-cols-4">
          <Signal label="Vehicles" value={`${VEHICLE_COUNT}`} hint="Curated inventory" />
          <Signal label="Build time" value="< 2 min" hint="Configure in 3D" />
          <Signal label="Delivery" value="Nationwide" hint="Door to door" />
          <Signal label="Support" value="24/7" hint="Specialist concierge" />
        </div>
      </div>
    </section>
  );
}

function Signal({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-ink-800/40 px-5 py-4">
      <div className="eyebrow">{label}</div>
      <div className="mt-1 font-display text-lg font-semibold text-white">{value}</div>
      <div className="mt-0.5 text-xs text-ink-200">{hint}</div>
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
