'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface WishlistState {
  vehicleIds: string[];
  hydrated: boolean;
  _markHydrated: () => void;

  has: (vehicleId: string) => boolean;
  toggle: (vehicleId: string) => void;
  add: (vehicleId: string) => void;
  remove: (vehicleId: string) => void;
  clear: () => void;
}

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      vehicleIds: [],
      hydrated: false,
      _markHydrated: () => set({ hydrated: true }),

      has: (vehicleId) => get().vehicleIds.includes(vehicleId),
      toggle: (vehicleId) =>
        set((s) => ({
          vehicleIds: s.vehicleIds.includes(vehicleId)
            ? s.vehicleIds.filter((id) => id !== vehicleId)
            : [...s.vehicleIds, vehicleId],
        })),
      add: (vehicleId) =>
        set((s) => ({
          vehicleIds: s.vehicleIds.includes(vehicleId) ? s.vehicleIds : [...s.vehicleIds, vehicleId],
        })),
      remove: (vehicleId) =>
        set((s) => ({ vehicleIds: s.vehicleIds.filter((id) => id !== vehicleId) })),
      clear: () => set({ vehicleIds: [] }),
    }),
    {
      name: 'mobiledrive.wishlist.v1',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => state?._markHydrated(),
      partialize: (s) => ({ vehicleIds: s.vehicleIds }),
    },
  ),
);
