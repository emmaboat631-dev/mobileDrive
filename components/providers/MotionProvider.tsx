'use client';

import { MotionConfig } from 'framer-motion';
import type { ReactNode } from 'react';

/**
 * App-wide Framer Motion config. `reducedMotion="user"` honours the operating
 * system's prefers-reduced-motion setting on every motion component, so
 * vestibular-sensitive users never get the entry/scale animations.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
