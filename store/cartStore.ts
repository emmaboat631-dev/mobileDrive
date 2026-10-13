'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Vehicle, VehicleConfiguration } from '@/types/vehicle';
import { getVehicleById } from '@/lib/vehicles/data';
import { computeTotal } from '@/store/configuratorStore';

export interface CartLine {
  id: string;
  addedAt: number;
  configuration: VehicleConfiguration;
}

interface CartState {
  items: CartLine[];
  hydrated: boolean;
  _markHydrated: () => void;

  addFromConfiguration: (config: VehicleConfiguration) => string;
  remove: (lineId: string) => void;
  update: (lineId: string, patch: Partial<VehicleConfiguration>) => void;
  clear: () => void;
}

function makeLineId() {
  return 'cl_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      hydrated: false,
      _markHydrated: () => set({ hydrated: true }),

      addFromConfiguration: (config) => {
        const id = makeLineId();
        set((s) => ({
          items: [...s.items, { id, addedAt: Date.now(), configuration: config }],
        }));
        return id;
      },
      remove: (lineId) =>
        set((s) => ({ items: s.items.filter((i) => i.id !== lineId) })),
      update: (lineId, patch) =>
        set((s) => ({
          items: s.items.map((i) =>
            i.id === lineId ? { ...i, configuration: { ...i.configuration, ...patch } } : i,
          ),
        })),
      clear: () => set({ items: [] }),
    }),
    {
      name: 'mobiledrive.cart.v1',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => state?._markHydrated(),
      partialize: (s) => ({ items: s.items }),
    },
  ),
);

/** Resolve a cart line to full objects — vehicle, color, wheel, interior, packages — for rendering. */
export interface ResolvedCartLine {
  id: string;
  addedAt: number;
  vehicle: Vehicle;
  color: Vehicle['availableColors'][number];
  wheel: Vehicle['availableWheels'][number];
  interior: Vehicle['availableInteriors'][number];
  packages: Vehicle['availablePackages'];
  options: number;
  total: number;
}

export function resolveLine(line: CartLine): ResolvedCartLine | null {
  const vehicle = getVehicleById(line.configuration.vehicleId);
  if (!vehicle) return null;
  const totals = computeTotal(vehicle, {
    colorId: line.configuration.colorId,
    wheelId: line.configuration.wheelId,
    interiorId: line.configuration.interiorId,
    packageIds: line.configuration.packageIds,
  });
  if (!totals.color || !totals.wheel || !totals.interior) return null;
  return {
    id: line.id,
    addedAt: line.addedAt,
    vehicle,
    color: totals.color,
    wheel: totals.wheel,
    interior: totals.interior,
    packages: totals.packages,
    options: totals.options,
    total: totals.total,
  };
}

export function cartTotals(resolved: ResolvedCartLine[]) {
  const subtotal = resolved.reduce((s, r) => s + r.vehicle.price, 0);
  const options = resolved.reduce((s, r) => s + r.options, 0);
  const taxes = Math.round((subtotal + options) * 0.085);
  return { subtotal, options, taxes, grand: subtotal + options + taxes };
}
