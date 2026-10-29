# Vehicle 3D models

The showroom ships with a **procedural** car built from Three.js primitives (`components/3d/CarModel.tsx`). To use real vehicle geometry, drop GLB files here and set `vehicle.modelPath` in `lib/vehicles/data.ts`.

The viewer tolerates missing files: if `modelPath` points at a GLB that doesn't exist, fails to parse, or needs a decoder we don't have, `GLTFCarWithFallback.tsx` catches the error and renders the procedural model so the showroom never crashes.

## How to add a model

1. Save the GLB to `public/models/<id>.glb` (same `<id>` as the vehicle's `id` in the seed data).
2. In `lib/vehicles/data.ts`, add `modelPath: '/models/<id>.glb'` to that vehicle.
3. Hot-reload the dev server; the viewer picks up the file.
4. If the GLB uses Draco or Meshopt compression, add the decoder paths (not configured by default).

## Expected material naming convention

For the configurator's live colour / wheel / headlight swaps to take effect, the GLB should name its materials:

| Name            | Meaning                                   |
| --------------- | ----------------------------------------- |
| `Body_Paint`    | Primary painted body panels               |
| `Body_Trim`     | Chrome / black trim                       |
| `Glass`         | Windshield, windows                       |
| `Headlights`    | Front light housing (used for toggle)     |
| `Taillights`    | Rear light housing (used for toggle)      |
| `Wheels`        | Wheel rims (swappable per style)          |
| `Interior_Seat` | Primary seat upholstery                   |
| `Interior_Trim` | Dashboard / door card trim                |

Any material not matching one of those names is left untouched by the configurator — it still renders normally with whatever the GLB authored.

## Asset sources — license guidance

**This session cannot download or purchase assets on your behalf.** Pick a source, verify its licence, drop the file here, and I'll wire it up.

### Free, pre-cleared for commercial use

| Source | Example | Licence | Notes |
|---|---|---|---|
| **Khronos glTF Sample Models** | `ToyCar` | CC0 / Public Domain | Stylised, not a road car — good as a test fixture, not for the hero |
| **Sketchfab** (filtered to `Creative Commons CC-BY` + `3D Models` + `Cars`) | varies | CC-BY 4.0 | **Attribution required** — put the author line in the footer or an about page. Many realistic road cars exist in this filter |
| **Poly Haven** (`models` section) | varies | CC0 | Fewer vehicles, but anything that *is* there is unconditionally safe |
| **CGTrader "Free" tab** | varies | Mixed — read each listing | Most free CGTrader models are "Royalty Free" but **not** for redistribution; usable in your deployed app but not in a public GitHub mirror of this repo |

### Paid, usually one-time licence

| Source | Price range | Licence |
|---|---|---|
| **Sketchfab Store** | $5–$150 per model | Standard / Editorial — read per-model |
| **TurboSquid** | $25–$500 | Royalty-free, excludes redistribution |
| **CGTrader** | $5–$300 | Royalty-free |

### Hard pass

- The Ferrari / BMW / Porsche GLBs in the Three.js examples repo. They look authoritative but the examples/README is explicit that the models remain the trademark of the OEMs and are only licenced for use inside the three.js documentation site. They are **not** redistributable in your repo. Do not use them.
- Any Sketchfab model licensed `No AI` or `Editorial Use Only`.
- Anything scraped without a visible licence.

## Attribution

If you use a CC-BY asset, add the attribution line to the vehicle record (I can extend the `Vehicle` type with an `attribution: string` field when you pick one) or to a shared `/credits` page.

## Decoders

If a GLB uses Draco or Meshopt compression, drei's `useGLTF` needs the matching decoder. We're not loading them yet — if the file you drop here needs one, the viewer will surface the error and fall back to procedural, and the dev console will say which decoder is missing. Tell me, and I'll wire it in — the decoder itself is MIT-licensed and shipped with three.
