# mobileDrive — whole-app redesign plan

Living document. Updated at the end of every phase. Keep it short.

## Design principles

- **Deliberately art-directed, not a dashboard template.** Dark automotive theme, structural restraint, generous negative space, display type doing the heavy lifting.
- **No AI-slop patterns.** No decorative gradients, no glassmorphism except where it earns its keep (nav scrim, canvas overlays), no card-in-card-in-card, no animation without purpose.
- **One system across the surface.** Same card, same header, same stat tile, same empty state everywhere. If a page needs a new shape, promote it to the system.
- **Context-appropriate density.**
  - Home + showroom + detail → cinematic, large type, hero media.
  - Marketplace → discovery, scanning, filtering.
  - Account / dealer / admin → operational clarity, dense tables, tight hierarchy.
- **Preserve working functionality.** No destructive rewrites of routes, data, or state. Primitives are introduced additively; adoption happens page by page.

## Design system foundation (Phase 2C-DS)

- CSS variables for semantic surfaces, strokes, text levels, elevation (globals.css).
- `components/ui/` primitives: `Card`, `SectionHeader`, `StatTile`, `Tag`, `EmptyState`, `Divider`.
- Existing `btn-primary/secondary/ghost`, `.eyebrow`, `.container-page` stay as the authoritative class API; no renames.
- `tailwind.config.ts`: additive only — no colour renames, no scale changes that could break existing JSX.

## Implementation checklist

Status: ☐ not started · ◐ in progress · ☑ done

### Shared system
- ☑ Git baseline + hardening (phase 2A)
- ☑ 3D viewer silhouette variants + fullscreen + working camera presets (phase 2B)
- ☑ Design system foundation — tokens + core primitives (phase 2C-DS)
- ☑ Marketplace rebuild — working filters/search/sort, list+grid, mobile drawer, body-type SVG silhouettes, 20 varied vehicles (phase 2C-M)
- ☐ Adoption pass across existing pages — swap inline card markup for `<Card>` etc.
- ☐ Loading states (`app/loading.tsx` + per-route) — one visual language
- ☐ Error states (`app/error.tsx`, `/not-found`, inline empty states)
- ☐ Shared data primitives: `DataTable`, `KpiRow`, `StatusBadge`, `FormField`

### Public surface
- ☑ (1) Homepage — editorial Hero (side-by-side type + 3D stage), ShopByCategory tiles, numbered FeaturedRail, Studio section. Real data-driven KPIs.
- ☐ (1) Global navigation — current nav is OK; audit against the new system.
- ☑ (2) `/vehicles` marketplace — working search/filters/sort, grid+list, mobile drawer, 20 vehicles, body-type-specific SVG previews.
- ☑ (3) `/vehicles/[id]` detail — viewer kept, Specifications/Features/Interior tabs filled with real content, Reviews is an honest empty state.
- ☐ (4) `/configure/[id]` — align configurator panel to the system; keep bottom sheet.
- ☑ (5) `/compare` — working add/remove, URL-param-persisted selection, picker modal with search, best-in-row highlighting.
- ☐ (5) `/account/wishlist` — adopt system; empty state.

### Auth
- ☑ (6) `/sign-in`, `/sign-up`, `/forgot-password` — unified `AuthLayout` template, 70%+ duplication removed.

### Customer
- ☐ (7) `/account` overview — KPI row + recent activity, no gradients.
- ☐ (7) `/account/builds`, `/orders`, `/orders/[id]`, `/settings` — table + detail template.
- ☐ (10) Test-drive booking + reservation flow — new; depends on auth.

### Dealer
- ☐ (8) `/dealer` overview, inventory, bookings, sales, customers, marketing, settings — operational clarity.

### Admin
- ☐ (9) `/admin` overview, vehicles (list/new/edit), orders, customers, payments, analytics, settings.

### Commerce
- ☐ (10) `/cart`, `/checkout`, `/checkout/confirmation` — tightened step flow.

### Cross-cutting
- ☐ Responsive QA pass (320 → 1536px) on every shipped surface.
- ☐ Reduced-motion audit — current global override is enough but confirm per page.
- ☐ Final README update replacing stale Phase 1 narrative.

## Order of work

Done: 2A, 2B.
Next: **2C-DS** (foundation only; no page rewrites yet) → **2C-M** (marketplace + VehicleCard adoption) → **2D-H** (homepage treatment) → **2D-D** (vehicle detail tabs) → **2E-Shells** (account/dealer/admin adoption pass) → **2F-Auth** → **2G-Commerce** → **2H-States-and-polish**.

Each phase: implement → `tsc --noEmit` → `next build` → commit → update this file.

## Decisions outstanding

- 3D source (procedural vs licensed GLB vs hybrid) — still open. Does not block anything until phase 2D-D wants photoreal cars.
- Branding (logo mark, accent colour, tone) — currently neutral white-on-ink. Will stay unless you redirect.
- Target market scope — currently US/GH/EU in types; UI shows USD only. Not addressed in this phase.
