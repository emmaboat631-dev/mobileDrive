import { Mark } from '@/components/brand/Logo';

/**
 * Shared loading state for the dynamic 3D viewer. Dropping the viewer into
 * three places (hero, vehicle detail, configurator) with the same shell keeps
 * the initial frame coherent across the site.
 */
export function ViewerLoading() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-ink-200">
        <Mark size="lg" className="animate-pulse opacity-80" />
        <div className="text-[11px] uppercase tracking-[0.22em]">
          Preparing the showroom
        </div>
      </div>
    </div>
  );
}
