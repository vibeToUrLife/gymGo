# gymGo 🏋️

A workout **training-planner** webapp. Browse exercises (动作), preview **how to perform** each via an animated demonstration, and build a personal training plan. Bilingual **EN / 中文**, light & dark.

Built 2026-07-14. Stack + data choices are fact-checked — see `docs/superpowers/specs/2026-07-14-gymgo-mvp-design.md`.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) · React 19 · TypeScript |
| Styling | Tailwind CSS v4 (`@theme`, `@tailwindcss/postcss`) · Barlow / Barlow Condensed |
| State | Lightweight React context (theme · i18n · plan · data) |
| Data | [`yuhonas/free-exercise-db`](https://github.com/yuhonas/free-exercise-db) — **public domain**, 873 exercises |
| Persistence | `localStorage` (plan) |
| Tests | `node --test` (Node 24 native TS) for the pure logic |

## Locked decisions (with the product owner)

- **Commercial / monetized** → data must be commercial-safe; host must allow commercial use.
- **Animation:** public-domain **2-frame cross-fade** (start pose → end pose). Zero licensing risk.
- **Audience:** global, **not** mainland China.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build (typechecks)
npm test         # pure-logic unit tests
```

## Project structure

```
public/exercises.json         # bundled dataset (873 exercises)
src/
  app/
    layout.tsx                # providers, fonts, no-flash theme script
    page.tsx                  # Browse
    plan/page.tsx             # My Plan
  lib/
    types.ts                  # Exercise type
    exercises.ts              # imageUrl + searchAndFilter + facets  (pure, tested)
    plan-reducer.ts           # plan state reducer                   (pure, tested)
    plan.tsx / theme.tsx / i18n.tsx / data.tsx   # React providers
  components/                 # SiteHeader, ExerciseCard, ExerciseModal, ExerciseImage,
                              # FilterBar, BrowseClient, PlanClient, FooterNote
```

## Data & images

Exercise metadata is bundled in `public/exercises.json`. Images are the two public-domain
frames per exercise, served from the **jsDelivr** CDN
(`cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/<id>/<n>.jpg`). `ExerciseImage`
cross-fades the two frames on a loop to form a "how-to" animation (respects
`prefers-reduced-motion`).

## Deploy

Target: **Netlify free** — the only free tier that permits commercial use *and* runs a full
Next.js App Router app. Watch the 300-credit/month ceiling. Scale-up: a $5–20/mo VPS
(`output: 'standalone'`) or Cloudflare Workers.
> ❌ Not Vercel Hobby — its terms restrict it to non-commercial personal use.

## Documented upgrade paths (deliberately out of MVP)

- **Accounts & cross-device sync** → Supabase (Postgres + Auth); move the plan off `localStorage`.
- **Mirror data + images** into your own Supabase/R2 bucket; transcode the frames to WebM/MP4
  (ffmpeg). Never hot-link a CDN you don't control in production.
- **Real looping animation** → license ExerciseDB GIFs commercially (exercisedb.io perpetual
  license) and drop them in behind the `ExerciseImage` interface.
- **Weekly calendar** → Schedule-X (free view) or FullCalendar core (MIT).
- **Drag-to-reorder** the plan → `pragmatic-drag-and-drop` (Atlassian); today reordering uses
  accessible up/down controls.
- **i18n at scale** → `next-intl` (routing + message extraction). Exercise *names* stay English;
  maintain your own zh mapping if you need localized names.
