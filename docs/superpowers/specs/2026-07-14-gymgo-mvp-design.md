# gymGo MVP — Design Spec (2026-07-14)

## What
A workout **training-planner** webapp. Users browse exercises (动作), preview **how to perform** each via an animated demonstration, and assemble a personal training plan.

## Decisions locked (with user, 2026-07-14)
- **Commercial / monetized** app → hosting must allow commercial use; exercise data must be commercial-safe.
- **Animation fidelity:** public-domain **2-frame cross-fade** (start pose → end pose). Zero licensing risk.
- **Audience:** global, **not** mainland China (standard hosting/CDN, YouTube allowed).
- **Bilingual EN / 中文** UI (assumption; exercise names stay English).

## Stack
- **Next.js 16** App Router + **React 19** + **TypeScript**
- **Tailwind CSS v4** (CSS-first `@theme`, `@tailwindcss/postcss`)
- **Barlow / Barlow Condensed** via `next/font/google`
- Lightweight in-app **theme** + **i18n** contexts (next-intl documented as upgrade path — kept lean for MVP)
- Plan persistence: **localStorage** for MVP (Supabase Auth documented as upgrade path)
- Deploy target: **Netlify free** (commercial-OK + full Next.js); scale-up = VPS / Cloudflare Workers

## Data
- **`yuhonas/free-exercise-db`** (Unlicense / public domain, ~800 exercises).
- Bundled as `public/exercises.json`; images served from jsDelivr CDN
  (`https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/<id>/<n>.jpg`).
- Production hardening (documented, not in MVP): mirror JSON + images into own Supabase/R2 bucket; never hot-link at runtime.

## Units (each independently understandable/testable)
- `lib/types.ts` — `Exercise` type.
- `lib/exercises.ts` — load data, `imageUrl(path)`, `searchAndFilter(list, query)` (pure, tested).
- `lib/i18n.tsx` — `LocaleProvider` + `useI18n()` (t + locale toggle), EN/中 dict, term maps for category/muscle/equipment/level.
- `lib/theme.tsx` — `ThemeProvider` + `useTheme()` (.dark on <html>, persisted, no FOUC).
- `lib/plan.tsx` — `PlanProvider` + `usePlan()` (add/remove/reorder/has, localStorage, pure reducer tested).
- `components/*` — `SiteHeader`, `ExerciseImage` (cross-fade), `ExerciseCard`, `ExerciseModal` (prev/next), `FilterBar`, `BrowseClient`, `PlanClient`.
- `app/page.tsx` (Browse), `app/plan/page.tsx` (My Plan), `app/layout.tsx` (providers + fonts).

## Cross-fade animation
`ExerciseImage` stacks frame 0 and frame 1; a CSS opacity transition on an interval (~1.1s each side) cross-fades between them → a looping "how-to". Respects `prefers-reduced-motion` (shows static frame 0).

## Data flow
`BrowseClient` (client) fetches `/exercises.json` once → holds in state → `searchAndFilter` drives the grid → click opens `ExerciseModal` (auto-playing cross-fade, instructions, prev/next within filtered set) → "Add to plan" calls `usePlan().add`. `PlanClient` reads plan ids, resolves against the dataset, supports reorder/remove.

## Testing
- Unit tests (node:test) for the pure logic: `searchAndFilter`, plan reducer. UI verified in-browser (dev server) across: cross-fade cycles, search+filter, modal prev/next, add/reorder/remove plan, EN↔中, light↔dark, responsive.

## Out of scope (MVP)
Accounts/auth, weekly calendar, real animated GIFs/video, Supabase, drag-drop on a calendar. All documented as upgrade paths in README.
