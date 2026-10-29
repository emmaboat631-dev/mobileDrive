'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';

const START_FRAME = 5;
const END_FRAME = 168;
const TOTAL_FRAMES = END_FRAME - START_FRAME + 1;
const FRAME_URL = (i: number) =>
  `/scroll-car/ezgif-frame-${String(START_FRAME + i).padStart(3, '0')}.jpg`;

/**
 * Full-bleed, scroll-driven homepage hero. 240 pre-rendered frames of an
 * exploded-view animation drive a canvas as the user scrolls through this
 * pinned section. Editorial copy, feature pills and CTAs sit over the car.
 */
export function ScrollShowcase() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const [loaded, setLoaded] = useState(0);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  // Copy fades out as the user scrolls (so the exploded reveal takes over)
  const copyOpacity = useTransform(scrollYProgress, [0, 0.25, 0.45], [1, 0.6, 0]);
  const copyY = useTransform(scrollYProgress, [0, 0.5], ['0px', '-40px']);
  const hintOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);

  useEffect(() => {
    const images: HTMLImageElement[] = new Array(TOTAL_FRAMES);
    let cancelled = false;
    let done = 0;

    // Two-pass load: every 4th frame first (gives a usable timeline fast),
    // then fill in the gaps. ~40 priority images instead of 164 up-front.
    const prioritize: number[] = [];
    const rest: number[] = [];
    for (let i = 0; i < TOTAL_FRAMES; i++) {
      (i % 4 === 0 ? prioritize : rest).push(i);
    }

    const load = (i: number) => {
      const img = new Image();
      img.src = FRAME_URL(i);
      img.onload = img.onerror = () => {
        done += 1;
        if (!cancelled) setLoaded(done);
      };
      images[i] = img;
    };

    prioritize.forEach(load);
    // Defer the fill-in pass until after the priority images start downloading
    const t = setTimeout(() => {
      if (!cancelled) rest.forEach(load);
    }, 400);

    imagesRef.current = images;
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, []);

  useEffect(() => {
    paintFrame(0);
  }, [loaded]);

  useEffect(() => {
    const unsub = scrollYProgress.on('change', (p) => {
      const idx = Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.floor(p * (TOTAL_FRAMES - 1))));
      paintFrame(idx);
    });
    return () => unsub();
  }, [scrollYProgress]);

  function paintFrame(idx: number) {
    const canvas = canvasRef.current;
    const images = imagesRef.current;
    // Walk outward from the requested idx until we hit a ready image.
    let img = images[idx];
    if (!img || !img.complete || img.naturalWidth === 0) {
      for (let d = 1; d < TOTAL_FRAMES; d++) {
        const left = images[idx - d];
        if (left && left.complete && left.naturalWidth > 0) { img = left; break; }
        const right = images[idx + d];
        if (right && right.complete && right.naturalWidth > 0) { img = right; break; }
      }
    }
    if (!canvas || !img || !img.complete || img.naturalWidth === 0) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Portrait / narrow viewports → contain (whole car visible, letterboxed).
    // Landscape / wide viewports → cover (fills frame, slight crop).
    const canvasAspect = canvas.width / canvas.height;
    const imgAspect = img.naturalWidth / img.naturalHeight;
    const useCover = canvasAspect >= 1;
    const scale = useCover
      ? Math.max(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight)
      : Math.min(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight);
    const w = img.naturalWidth * scale;
    const h = img.naturalHeight * scale;
    const x = (canvas.width - w) / 2;
    const y = (canvas.height - h) / 2;
    ctx.drawImage(img, x, y, w, h);
    // Silence unused-var lint without changing behavior
    void imgAspect;
  }

  const loadingPct = Math.round((loaded / TOTAL_FRAMES) * 100);

  return (
    <section ref={sectionRef} className="relative h-[400vh] bg-ink-900">
      <div className="sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full"
          style={{ filter: 'contrast(1.06) saturate(1.08) brightness(1.02)', imageRendering: 'auto' }}
          aria-label="Vehicle exploded view animation"
        />

        {/* Dark overlays for text legibility */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink-900/50 via-transparent to-ink-900/80" aria-hidden />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-ink-900/70 to-transparent" aria-hidden />

        {loaded < 10 && !reduced && (
          <div className="absolute inset-0 flex items-center justify-center text-xs tracking-[0.3em] text-ink-200">
            LOADING {loadingPct}%
          </div>
        )}

        <motion.div
          style={reduced ? undefined : { opacity: copyOpacity, y: copyY }}
          className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-6 pt-24 text-center"
        >
          {/* Top pill */}
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/15 bg-ink-900/40 px-4 py-1.5 text-[11px] uppercase tracking-[0.2em] text-ink-100 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
            The mobileDrive showroom
          </div>

          {/* Headline */}
          <h1 className="font-display text-[clamp(2.5rem,6.5vw,5.5rem)] font-semibold leading-[0.98] tracking-[-0.03em] text-white drop-shadow-[0_4px_30px_rgba(0,0,0,0.6)]">
            Drive the <span className="italic text-ink-100">extraordinary</span>
          </h1>

          {/* Feature checks */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-ink-100">
            <FeatureCheck label="We curate" />
            <FeatureCheck label="We verify" />
            <FeatureCheck label="We deliver" />
          </div>

          {/* CTAs */}
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link href="/vehicles" className="btn-primary">
              Explore vehicles
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/configure/porsche-911" className="btn-secondary">
              Build your vehicle
            </Link>
          </div>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          style={reduced ? undefined : { opacity: hintOpacity }}
          className="pointer-events-none absolute inset-x-0 bottom-8 flex flex-col items-center text-[10px] uppercase tracking-[0.35em] text-ink-200"
        >
          <span>Scroll</span>
          <span className="mt-2 h-6 w-px bg-ink-200/60" />
        </motion.div>
      </div>
    </section>
  );
}

function FeatureCheck({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Check className="h-3.5 w-3.5 text-white" />
      <span>{label}</span>
    </span>
  );
}
