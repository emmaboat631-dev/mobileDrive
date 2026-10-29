'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Sliders } from 'lucide-react';
import type { Vehicle } from '@/types/vehicle';
import { useConfigurator } from '@/store/configuratorStore';
import { ConfiguratorPanel } from '@/components/configurator/ConfiguratorPanel';
import { CameraToolbar } from '@/components/configurator/CameraToolbar';

import { ViewerLoading } from '@/components/3d/ViewerLoading';

const CarViewer = dynamic(
  () => import('@/components/3d/CarViewer').then((m) => m.CarViewer),
  { ssr: false, loading: () => <ViewerLoading /> },
);

export function ConfigureClient({ vehicle }: { vehicle: Vehicle }) {
  const {
    colorId,
    wheelId,
    cameraPreset,
    headlightsOn,
    setCameraPreset,
    toggleHeadlights,
  } = useConfigurator();
  const [sheetOpen, setSheetOpen] = useState(false);

  // During the very first render colorId/wheelId are null until the panel initialises.
  // Fall back to the vehicle's first options so the 3D model doesn't render empty.
  const color =
    vehicle.availableColors.find((c) => c.id === colorId) ?? vehicle.availableColors[0];
  const wheel =
    vehicle.availableWheels.find((w) => w.id === wheelId) ?? vehicle.availableWheels[0];

  // Lock body scroll when the mobile sheet is open
  useEffect(() => {
    document.body.style.overflow = sheetOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [sheetOpen]);

  return (
    <div className="relative h-[calc(100svh-4rem)] w-full overflow-hidden bg-ink-900 mt-16">
      <div className="grid h-full grid-cols-1 lg:grid-cols-[1fr_420px] [&>*]:min-h-0">
        {/* 3D stage */}
        <div className="relative h-full min-h-[400px]">
          <CarViewer
            modelPath={vehicle.modelPath}
            bodyType={vehicle.bodyType}
            bodyHex={color.hex}
            bodyFinish={color.finish}
            wheelStyle={wheel.style}
            headlightsOn={headlightsOn}
            cameraPreset={cameraPreset}
            interactive
            showFullscreen
            className="absolute inset-0"
          />

          {/* Top-left back link */}
          <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-5">
            <Link
              href="/vehicles"
              className="pointer-events-auto inline-flex h-9 items-center gap-1.5 rounded-full border border-white/10 bg-ink-900/60 px-3 text-xs text-ink-100 backdrop-blur hover:bg-ink-900/90 hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" />
              Vehicles
            </Link>
          </div>

          {/* Camera toolbar */}
          <div className="pointer-events-none absolute inset-x-0 bottom-24 flex justify-center px-4 lg:bottom-8">
            <CameraToolbar
              preset={cameraPreset}
              onPreset={setCameraPreset}
              headlightsOn={headlightsOn}
              onToggleHeadlights={toggleHeadlights}
            />
          </div>
        </div>

        {/* Desktop side panel */}
        <aside className="hidden h-full border-l border-white/[0.06] bg-ink-800/80 lg:block">
          <ConfiguratorPanel vehicle={vehicle} />
        </aside>
      </div>

      {/* Mobile bottom button to open sheet */}
      <button
        type="button"
        onClick={() => setSheetOpen(true)}
        className="pointer-events-auto fixed inset-x-4 bottom-4 z-30 flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-medium text-ink-900 shadow-lg lg:hidden"
      >
        <Sliders className="h-4 w-4" />
        Customize
      </button>

      {/* Mobile bottom-sheet configurator */}
      {sheetOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close configurator"
            onClick={() => setSheetOpen(false)}
            className="absolute inset-0 bg-black/50"
          />
          <div className="absolute inset-x-0 bottom-0 top-16 overflow-hidden rounded-t-3xl border-t border-white/10 bg-ink-800">
            <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
              <div className="eyebrow">Configure</div>
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                className="text-sm text-ink-100"
              >
                Done
              </button>
            </div>
            <div className="h-[calc(100%-45px)]">
              <ConfiguratorPanel vehicle={vehicle} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
