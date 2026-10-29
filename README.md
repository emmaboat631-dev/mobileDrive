# mobileDrive

> Configure. Experience. Drive.

A premium 3D automotive marketplace built with Next.js 14, Three.js and React
Three Fiber. This is a working prototype at demonstrable quality — not
production ready. See **Status** below for the honest state.

## What's in the box

### Public surface
- **Homepage** — editorial Hero with an interactive 3D stage, body-type
  category tiles, numbered featured rail, Studio section.
- **Marketplace (`/vehicles`)** — real search, filter chips, checkbox groups,
  dual-range price slider, sort, grid / list views, mobile filter drawer.
  Deep-linkable via `?body=SUV`, `?q=raptor`.
- **Vehicle detail (`/vehicles/[id]`)** — cinematic 3D viewer with camera
  presets (360 / Front / Side / Interior), paint swatches, headlight toggle,
  fullscreen; filled-in Specifications / Features / Interior tabs.
- **Configurator (`/configure/[id]`)** — live paint / finish / wheels /
  interior / packages, dynamic pricing, mobile bottom-sheet.
- **Compare (`/compare`)** — up to three vehicles, URL-persisted picker,
  best-in-row highlighting.
- **Test-drive booking (`/test-drive/[id]`)** — form with business-hour
  validation, 30-minute lead, 60-day horizon, duplicate check; falls back to
  a local-only confirmation when Supabase is not configured.

### Account / dealer / admin
- Protected via `middleware.ts` (`/account`, `/checkout`, `/admin`, `/dealer`,
  `/test-drive`). `/admin` and `/dealer` additionally gated by
  `profiles.role`.
- Overview pages, orders, inventory, customers, payments — operational
  tables on the shared `DataTable`, `KpiRow`, `StatusBadge`, `Banner`,
  `EmptyState` primitives.

### Brand
- Original double-chevron mark + `mobile` + **Drive** wordmark
  (`components/brand/Logo.tsx`).
- Three variants (`Mark`, `Wordmark`, `Lockup`); three sizes; three tones.
- `app/icon.svg` (favicon) and `public/apple-icon.svg` (iOS add-to-home-screen).

## Tech

| Area | Choice |
|---|---|
| Framework | Next.js 14.2 App Router, React 18, TypeScript 5.6 (strict) |
| Styling | Tailwind 3.4 + semantic CSS tokens in `app/globals.css` |
| 3D | Three.js 0.169 + @react-three/fiber + @react-three/drei |
| State | zustand 5 (cart, wishlist, configurator) |
| Motion | framer-motion with app-wide `MotionConfig reducedMotion="user"` |
| Backend | Supabase (optional — the app runs with it unconfigured) |

## Scripts

```bash
npm run dev        # http://localhost:3000
npm run typecheck  # tsc --noEmit
npm run lint       # next lint (uses .eslintrc.json)
npm run build      # next build
npm run start      # production server after build
```

### Preview on your phone

```powershell
# 1. Start the dev server
npm run dev

# 2. Get your IPv4 (Windows)
Get-NetIPAddress -AddressFamily IPv4 |
  Where-Object { ($_.PrefixOrigin -eq 'Dhcp' -or $_.PrefixOrigin -eq 'Manual') -and $_.IPAddress -notlike '127.*' -and $_.IPAddress -notlike '169.*' } |
  Select-Object -ExpandProperty IPAddress

# 3. Open http://<that-ip>:3000 on your phone (same Wi-Fi)
```

If the phone can't reach it: allow Node.js through Windows Firewall on
**Private**, or switch both devices to the same non-isolated SSID. See
`REDESIGN.md` for the full troubleshooting rundown.

## First-time setup

The app degrades gracefully — if an integration isn't configured it logs
instead of crashing, renders "not configured" banners instead of fake data,
and the in-memory rate limiter runs in place of Redis. You can get the UI
up with **no** env vars. To exercise the full stack (auth, payments,
emails) wire the following, one block at a time.

### 1. Install and run

```bash
npm install
cp .env.example .env.local   # on Windows PowerShell: Copy-Item .env.example .env.local
npm run dev                  # http://localhost:3000
```

### 2. Supabase (auth, DB, storage) — required for anything beyond browsing

1. Create a free project at [supabase.com](https://supabase.com/dashboard).
2. Project Settings → API: copy the **URL**, **anon** key, and **service_role** key
   into `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server-only, never expose)
3. Apply all migrations in `supabase/migrations/` in filename order
   (`0001_init.sql` → `0012_rls_hardening_followups.sql`). Either:
   - Supabase CLI: `supabase db push`, or
   - Studio → SQL Editor: paste each file and run.
4. In Studio → Authentication → Settings, toggle **Leaked password
   protection** on (free, 10 seconds, blocks compromised passwords).
5. Promote your first user to admin by running in the SQL Editor:
   ```sql
   update public.profiles set role = 'admin' where email = 'you@example.com';
   ```

### 3. Paystack (payments) — required for checkout

1. Create a Paystack account at [paystack.com](https://paystack.com).
2. Settings → Developers: copy the **test** keys into `.env.local`:
   - `PAYSTACK_SECRET_KEY=sk_test_...`
   - `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_...`
3. Add your current USD/EUR → GHS rates:
   - `PAYSTACK_FX_USD=15`
   - `PAYSTACK_FX_EUR=16`
4. Paystack webhook: Settings → Developers → Webhooks → add
   `https://<your-site>/api/webhooks/paystack`. The handler lives in
   `app/api/webhooks/paystack/route.ts` and verifies the signature.

### 4. Resend (transactional emails) — optional

1. Create a Resend account at [resend.com](https://resend.com).
2. API Keys → copy into `.env.local`:
   - `RESEND_API_KEY`
   - `RESEND_FROM="mobileDrive <onboarding@resend.dev>"` (or your verified
     domain)
3. When `RESEND_API_KEY` is unset, every send logs to the console instead
   — handy for local dev.

### 5. Upstash Redis (rate limiting) — optional in dev, required in prod

1. Create a free Redis DB at [console.upstash.com](https://console.upstash.com).
2. Copy the REST URL + token into `.env.local`:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
3. Without these, an in-memory limiter runs — fine locally but **not safe
   for production** (resets per instance, doesn't share across Vercel's
   serverless functions).

### 6. Site URL

For local dev, the default `http://localhost:3000` works. In production,
set `NEXT_PUBLIC_SITE_URL` to your canonical domain so auth, email, and
payment-callback redirects point at the right host.

## 3D models

The 3D car is **procedural** — primitives built in `components/3d/CarModel.tsx`
with per-body-type silhouettes (coupe, sedan, sports, suv, wagon, pickup).
Not photoreal.

To use real GLB models, drop them in `public/models/` and set
`vehicle.modelPath` in `lib/vehicles/data.ts`. The viewer tolerates missing
files via `GLTFCarWithFallback.tsx` — if a GLB fails to load, it falls back
to the procedural car. See `public/models/README.md` for license-vetted
asset sources (CC0 / CC-BY / paid).

## Status

**Not production ready.** This is a working prototype at prototype quality.

What is real:
- All routes compile and build cleanly.
- Typecheck, lint, and production build all pass.
- Design system is coherent; one card, one header, one badge, one empty
  state across the app.
- 3D viewer, filters, compare, test-drive form, auth flow, cart, and the
  dashboards all work end-to-end against the demo seed.
- Honest backend banners appear everywhere Supabase isn't configured.

What is **not** real:
- Payment adapters in `lib/payments/providers.ts` are mocks — the admin
  payments surface shows this explicitly. **No simulated payment is ever
  rendered as a real success.**
- No automated tests (none in `package.json`).
- No CI or deployment configuration.
- No real vehicle photography or licensed 3D models.
- Supabase persistence has not been verified against a live project in this
  repository's working history — the code paths type-check and the migrations
  are present but the integration path requires a real project to confirm.

Suitable for: local demo, design review, stakeholder walkthrough.
Not suitable for: live customers, taking payment, or publishing without
first wiring real Supabase, real payments, licensed assets, and a test suite.

## Project history and plan

`REDESIGN.md` is the living design-system plan and phase checklist. Every
phase since 2A is tracked there with its scope and current state.
