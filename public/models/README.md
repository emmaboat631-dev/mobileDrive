# Vehicle 3D models

Phase 1 of mobileDrive ships a **procedural** demo vehicle built from Three.js
primitives (see `components/3d/CarModel.tsx`). This means we do **not** depend
on any copyrighted GLB/GLTF files for the showroom experience.

## Adding a licensed GLB/GLTF model

When you have a vehicle model that is properly licensed for commercial use,
drop it in this folder, for example:

```
public/models/m4-competition.glb
```

Then wire it up on the vehicle record in `lib/vehicles/data.ts`:

```ts
{
  id: 'm4-competition',
  // ...
  modelPath: '/models/m4-competition.glb',
}
```

### Expected material naming convention

To keep the configurator working across models, author your GLB so that the
following mesh/material names are present (case-sensitive):

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

The configurator state (`store/configuratorStore.ts`) exposes these as the
canonical knobs. A thin wrapper component in `components/3d/CarModel.tsx` is
where you would branch on `vehicle.modelPath` and load the GLB via
`useGLTF` from `@react-three/drei`, then patch the materials from the
configurator state.

## Licensing checklist

Before committing any `.glb` / `.gltf`:

- [ ] The source is under a license that permits commercial redistribution.
- [ ] Trademark rights (badges, logos) are either licensed or removed.
- [ ] The source is credited in `CREDITS.md` at the project root.

Do **not** scrape marketplace models or vendor demo files whose license
disallows redistribution.
