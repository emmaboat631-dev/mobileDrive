# mobileDrive

> Configure. Experience. Drive.

A premium 3D automotive marketplace built with Next.js, Three.js and
React Three Fiber. This repository is **Phase 1** of mobileDrive and
covers the showroom experience, not the full commerce stack.

## What's in Phase 1

- Landing page with cinematic 3D hero vehicle (interactive, auto-rotating)
- Responsive premium design system (dark automotive theme)
- Global navigation (desktop + mobile menu + sticky translucent on scroll)
- Marketplace grid at `/vehicles` with filter chips and lightweight SVG previews
- Full 3D configurator at `/configure/[id]` with:
  - Live paint color + finish (metallic / solid / pearl / matte)
  - Wheel style swap (updates the actual rim geometry + material)
  - Interior and package options
  - Camera presets (orbit, front, side, rear) with smooth transitions
  - Headlights toggle (emissive materials)
  - Dynamic pricing calculated from a centralized Zustand store
  - Mobile bottom-sheet configurator
- One **procedural** demo vehicle (`CarModel.tsx`) built from Three.js primitives
  so no copyrighted GLB/GLTF files are needed to run the project

## What's **not** in Phase 1 (coming later)

Checkout, admin, Supabase auth + persistence, Ghana payment integrations,
wishlists persisted to a backend, and real licensed vehicle GLB models.
These are architected for but not implemented yet.

## Getting started

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Project structure

```
app/
  page.tsx                   Landing (3D hero + featured rail)
  vehicles/page.tsx          Marketplace
  configure/[id]/            3D configurator
  compare/                   Phase 2 placeholder
  cart/                      Phase 2 placeholder

components/
  layout/                    Navbar, Footer
  home/                      Hero, FeaturedRail
  3d/                        CarViewer, CarModel (procedural demo car)
  configurator/              Panel, color picker, option list, camera toolbar
  vehicles/                  VehicleCard (SVG silhouette preview)

lib/
  vehicles/data.ts           Seed inventory
  utils/                     cn, format

store/
  configuratorStore.ts       Zustand state + pricing math

types/
  vehicle.ts

public/
  models/README.md           How to drop in a licensed GLB
```

## Replacing the procedural car

Phase 1 ships a procedural sports coupe built from boxes, cylinders and
physical materials. The viewer treats paint, wheels, interior and lights
as independent material channels, so when you add a licensed GLB you only
need to:

1. Save it to `public/models/`.
2. Set `vehicle.modelPath` in `lib/vehicles/data.ts`.
3. Branch `CarModel.tsx` on `modelPath` to `useGLTF` and patch materials
   from the configurator state. The material naming convention is
   documented in `public/models/README.md`.

## Performance

- 3D models load **only** inside the viewer / configurator. Marketplace
  cards render lightweight SVG silhouettes, never a Three.js scene.
- The Canvas uses `dpr=[1,2]` + `AdaptiveDpr` to throttle pixel ratio
  under load.
- Materials are memoised per color / finish / wheel style change.
- The viewer is `dynamic`-imported with `ssr: false`, so the server
  bundle stays small.

## Accessibility

- Semantic HTML, visible focus rings, ARIA labels on icon buttons.
- All interactive 3D controls (camera presets, headlights) have DOM
  button equivalents that announce state.
- `prefers-reduced-motion` is respected globally in `globals.css`.
- Minimum tested viewport: 320px.
