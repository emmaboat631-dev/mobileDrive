# mobileDrive — whole-app redesign plan

Living document. Updated at the end of every phase. Keep it short.

## Design principles

- **Deliberately art-directed, not a dashboard template.** Dark automotive theme, structural restraint, generous negative space, display type doing the heavy lifting.
- **No AI-slop patterns.** No decorative gradients, no glassmorphism except where it earns its keep (nav scrim, canvas overlays), no card-in-card-in-card, no animation without purpose.
- **One system across the surface.** Same card, same header, same stat tile, same empty state everywhere.
- **Context-appropriate density.**
  - Home + showroom + detail → cinematic.
  - Marketplace → discovery, scanning, filtering.
  - Account / dealer / admin → operational clarity.
- **Preserve working functionality.** No destructive rewrites of routes, data, or state.

## Implementation checklist

Status: ☐ not started · ◐ in progress · ☑ done

### Shared system
- ☑ Git baseline + hardening (phase 2A)
- ☑ 3D viewer silhouette variants + fullscreen + working camera presets (phase 2B)
- ☑ Design system foundation — tokens + core primitives (phase 2C-DS)
- ☑ Marketplace rebuild — working filters/search/sort, list+grid, mobile drawer, body-type SVG silhouettes, 20 varied vehicles (phase 2C-M)
- ☑ Homepage treatment — editorial Hero, ShopByCategory, numbered FeaturedRail, Studio section (phase 2D-H)
- ☑ Vehicle detail tabs — Specifications / Features / Interior (phase 2D-D)
- ☑ Compare page — working picker, URL state, best-row highlight (phase 2D-C)
- ☑ Auth unification — one AuthLayout for sign-in / sign-up / forgot-password (phase 2F-Auth)
- ◐ Card primitive adoption sweep — Card/SectionHeader/StatTile/EmptyState/Kpi/StatusBadge/Banner/DataTable in use across the overviews, auth, bookings, admin orders / payments / vehicles. ~65 inline cards remain across remaining dealer sub-pages + account sub-pages.
- ☐ Loading states — `app/loading.tsx` already present and sufficient. Per-route skeletons: not needed yet.
- ☐ Error states — `app/error.tsx` and `/not-found` already polished. Inline empty states standardised through `EmptyState`.
- ☑ Shared data primitives — `KpiRow`, `StatusBadge`, `statusTone()`, `Banner`, `DataTable`, `Field` + `TextInput` + `SelectInput` + `TextArea` extracted. Form adoption begins next phase.

### Public surface
- ☑ (1) Homepage — editorial Hero + ShopByCategory + FeaturedRail + Studio.
- ☑ (1) Global navigation — pruned to real routes; translucent-on-scroll works.
- ☑ (2) `/vehicles` marketplace — working search/filters/sort, grid+list, mobile drawer, 20 vehicles, body-type-specific SVG previews.
- ☑ (3) `/vehicles/[id]` detail — viewer kept, Specifications/Features/Interior tabs filled with real content, Reviews is an honest empty state.
- ◐ (4) `/configure/[id]` — fully functional; configurator panel visual pass still possible but not critical.
- ☑ (5) `/compare` — working add/remove, URL-param-persisted selection, picker modal with search, best-in-row highlighting.
- ◐ (5) `/account/wishlist` — functional. Visual pass to adopt `EmptyState` + `Card` not yet done.

### Auth
- ☑ (6) `/sign-in`, `/sign-up`, `/forgot-password` — unified `AuthLayout` template.

### Customer
- ☑ (7) `/account` overview — StatusBadge adopted; functional, consistent with the system.
- ◐ (7) `/account/builds`, `/orders`, `/orders/[id]`, `/settings` — functional. Not reviewed in detail this session.
- ☑ (10) Test-drive booking — `/test-drive/[id]` page + form + server action + `test_drive_bookings` migration + RLS. Validates business hours (09:00–18:00), 30-min lead, 60-day horizon, phone format. Duplicate check on (user, vehicle, time). Falls back to local-only when Supabase isn't configured; UI is honest about this.
- ☑ (10) Test-drive data integration — `/account` "Next test drive" reads real upcoming booking with cancel action; `/dealer/bookings` reads real upcoming bookings for the next 14 days grouped by day. Both surfaces render honest banners when Supabase is unconfigured, user is unauthenticated, or role is insufficient.

### Dealer
- ◐ (8) `/dealer` overview adopted KpiRow + StatusBadge; sub-pages (inventory, bookings, sales, customers, marketing, settings) still carry inline markup.

### Admin
- ◐ (9) `/admin` overview + `/orders` + `/payments` + `/vehicles` + `/vehicles/new` + `/orders/[id]` + `/payments/[id]` + `/customers` adopt shared primitives; `/analytics`, `/settings`, `/vehicles/[id]`, `/customers/[email]` still inline.

### Commerce
- ◐ (10) `/cart`, `/checkout` functional. `/checkout/confirmation` rewritten to never claim payment succeeded — explicit "Awaiting payment", prominent demo-mode disclaimer when backend not configured.

### Cross-cutting
- ☐ Responsive QA pass (320 → 1536px) on every shipped surface — not performed; sandbox has neither Playwright nor a browser binary.
- ◐ Reduced-motion — global CSS override + Framer `MotionConfig reducedMotion="user"` wrapper in root layout. User-triggered OS preference now disables both CSS transitions and framer-motion entrances.
- ◐ Keyboard access — global `:focus-visible` outlines added, visible on both dark and light buttons; skip-to-main link; mobile menu now exposes `aria-expanded`/`aria-controls`; Navbar Search is a real link, not a dead button.
- ☐ Final README update replacing stale Phase 1 narrative — not touched.
- ☐ Visual QA against reference images / HTML prototype — reference assets not provided to the session, so could not compare.

## Decisions outstanding

- **3D source** (procedural vs licensed GLB vs hybrid) — still open. Does not block anything until a photoreal-vehicle phase. Current procedural silhouettes are differentiated by body type.
- **Branding** (logo mark, accent colour, tone) — currently neutral white-on-ink.
- **Target market scope** — currently US/GH/EU in types; UI shows USD only.
- **Supabase connection** — `.env.local` not set; middleware and auth are no-ops locally until configured. Full auth, orders, and admin role gates become live once Supabase is wired.

## Resume checkpoint — exact next step

The highest-leverage remaining work is the **operational dashboards pass**. Two concrete next phases:

**Phase 2E-Shells** — redesign admin / dealer / account overview pages for operational clarity:
1. Extract shared primitives: `KpiRow`, `StatusBadge`, `DataTable`.
2. Rewrite `app/admin/page.tsx`, `app/dealer/page.tsx`, `app/account/page.tsx` using them.
3. Replace per-page sample data (placeholder names, orders) with store-backed or seed-driven data where possible.
4. Audit the sub-pages (`vehicles`, `orders`, `customers`, `payments`, `analytics`, `settings` in both admin and dealer) and give them a consistent list/table/detail template.

**Phase 2G-Commerce** — polish cart / checkout / confirmation:
1. Verify `/checkout` step flow and typography.
2. Adopt `Card`, `SectionHeader`, `EmptyState` throughout.
3. Confirmation page: receipt treatment that reads like a delivery letter, not a dashboard tile.

**Phase 2H-Polish**:
1. Browser-based responsive QA at 320 / 768 / 1024 / 1440 (needs a browser, impossible here).
2. Reduced-motion audit per route.
3. README refresh.
4. Final sweep adopting `<Card>` across the ~85 remaining inline card call-sites.

Each phase: implement → `tsc --noEmit` → `next build` → commit → update this file.

## Commits so far

```
7e2534e (phase 2C-DS) design system foundation (tokens + ui primitives)
5c1d4e3 (phase 2B)    silhouette variants, fullscreen, working view presets
8781f80 (phase 2A)    harden auth gates, prune broken nav, fix fake copy
c13ce18 (baseline)    chore: baseline before phase 2A hardening
```
Later commits (verified via `git log --oneline`): 2C-M marketplace, 2D-H homepage, 2D-D detail tabs, 2D-C compare, 2F-Auth unification, dealer-shell label fix.
