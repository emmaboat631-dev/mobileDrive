'use client';

import { create } from 'zustand';
import type { Vehicle } from '@/types/vehicle';

export type CameraPreset = 'orbit' | 'front' | 'rear' | 'side' | 'interior';

interface ConfiguratorState {
  vehicleId: string | null;
  colorId: string | null;
  wheelId: string | null;
  interiorId: string | null;
  packageIds: string[];
  cameraPreset: CameraPreset;
  headlightsOn: boolean;

  initFromVehicle: (vehicle: Vehicle) => void;
  setColor: (id: string) => void;
  setWheel: (id: string) => void;
  setInterior: (id: string) => void;
  togglePackage: (id: string) => void;
  setCameraPreset: (preset: CameraPreset) => void;
  toggleHeadlights: () => void;
}

export const useConfigurator = create<ConfiguratorState>((set) => ({
  vehicleId: null,
  colorId: null,
  wheelId: null,
  interiorId: null,
  packageIds: [],
  cameraPreset: 'orbit',
  headlightsOn: false,

  initFromVehicle: (vehicle) =>
    set({
      vehicleId: vehicle.id,
      colorId: vehicle.availableColors[0]?.id ?? null,
      wheelId: vehicle.availableWheels[0]?.id ?? null,
      interiorId: vehicle.availableInteriors[0]?.id ?? null,
      packageIds: [],
      cameraPreset: 'orbit',
      headlightsOn: false,
    }),
  setColor: (id) => set({ colorId: id }),
  setWheel: (id) => set({ wheelId: id }),
  setInterior: (id) => set({ interiorId: id }),
  togglePackage: (id) =>
    set((s) => ({
      packageIds: s.packageIds.includes(id)
        ? s.packageIds.filter((p) => p !== id)
        : [...s.packageIds, id],
    })),
  setCameraPreset: (preset) => set({ cameraPreset: preset }),
  toggleHeadlights: () => set((s) => ({ headlightsOn: !s.headlightsOn })),
}));

export function computeTotal(
  vehicle: Vehicle,
  state: Pick<ConfiguratorState, 'colorId' | 'wheelId' | 'interiorId' | 'packageIds'>,
) {
  const color = vehicle.availableColors.find((c) => c.id === state.colorId);
  const wheel = vehicle.availableWheels.find((w) => w.id === state.wheelId);
  const interior = vehicle.availableInteriors.find((i) => i.id === state.interiorId);
  const packages = vehicle.availablePackages.filter((p) => state.packageIds.includes(p.id));

  const deltas = [
    color?.priceDelta ?? 0,
    wheel?.priceDelta ?? 0,
    interior?.priceDelta ?? 0,
    ...packages.map((p) => p.priceDelta),
  ];

  const options = deltas.reduce((sum, d) => sum + d, 0);
  return {
    base: vehicle.price,
    options,
    total: vehicle.price + options,
    color,
    wheel,
    interior,
    packages,
  };
}
