# gymGo — Auth + Supabase Plan Sync (Design Spec)

Date: 2026-07-14
Status: Approved (design), pending implementation

## 1. Overview

Add user accounts to gymGo and persist each user's weekly plan to a Supabase
Postgres backend so it syncs across devices. The app stays usable for guests;
signing in saves and syncs the plan. Sign-in methods: **Google** and
**email + password**. Email/password ships first (works with zero external
config); Google is added once a Google Cloud OAuth app exists.

## 2. Goals

- Guests can browse exercises and build a weekly plan with no account (current behavior).
- Users can create an account and sign in (email/password, later Google).
- A signed-in user's weekly plan is stored server-side and syncs across devices/browsers.
- First sign-in **merges** any existing local (guest) plan into the account so nothing is lost.
- Per-user data isolation enforced by the database (Row-Level Security), not just the UI.
- Full EN / 中文 localization and light/dark parity for all new UI.

## 3. Non-goals (YAGNI for this iteration)

- No social/coach features, shared plans, or friends.
- No per-exercise metadata (sets/reps/weight) — the plan remains `WeekPlan = Record<Day, string[]>`.
- No SSR-protected routes or server-rendered personalization (app stays client-rendered).
- No password reset UI in v1 beyond Supabase's built-in email flow link (can add a page later).
- No account settings page beyond sign-out (rename/delete account deferred).

## 4. Architecture

The app is fully client-rendered (`"use client"` providers + localStorage). Auth stays
**client-side** using `@supabase/supabase-js` wrapped in a new `AuthProvider` React context —
the same pattern as `ThemeProvider` / `LocaleProvider` / `PlanProvider`.

Rationale: there are no protected server routes. Guests browse freely; login only enables
sync. A client-side session (persisted by supabase-js in localStorage) with **RLS-enforced**
database access is simpler than `@supabase/ssr` + middleware and is equally secure, because
the database — not the client — enforces who can read/write which rows.

Provider nesting (in `src/app/layout.tsx`):
`ThemeProvider > LocaleProvider > ExercisesProvider > AuthProvider > PlanProvider`
(Plan sits inside Auth so it can react to sign-in/out.)

## 5. Data model (Supabase Postgres)

Single table, one row per user:

```sql
create table public.plans (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  week       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.plans enable row level security;

create policy "own plan - select" on public.plans
  for select using (auth.uid() = user_id);
create policy "own plan - insert" on public.plans
  for insert with check (auth.uid() = user_id);
create policy "own plan - update" on public.plans
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own plan - delete" on public.plans
  for delete using (auth.uid() = user_id);
```

`week` holds the existing `WeekPlan` shape (`{mon:[ids], tue:[ids], …, sun:[ids]}`), so the
reducer and UI are unchanged. Normalized per-exercise rows are a future upgrade path.

## 6. Sync behavior

- **Guest (signed out):** plan lives in localStorage exactly as today.
- **On sign-in:**
  1. Read local plan `L` from localStorage.
  2. Fetch account plan `R` from `plans` (may be empty/absent).
  3. Merge: for each day, union of `R[day]` and `L[day]` preserving order, de-duplicated by
     exercise id (remote first, then local extras). Merge (not overwrite) guarantees no loss.
  4. Upsert merged `M` to Supabase; set app state to `M`.
- **While signed in:** each plan mutation updates local React state immediately and schedules a
  **debounced (~1s) upsert** of the whole `week` blob to Supabase. Last-write-wins per device
  (acceptable for a single-user plan; `updated_at` reserved for future conflict UI).
- **On next load while signed in:** hydrate from Supabase (source of truth), falling back to
  localStorage if the network fails.
- **On sign-out:** keep the last plan in localStorage; stop syncing.

Failure handling: Supabase read/write errors never block the UI — the app keeps working from
local state and surfaces a non-blocking notice; the next successful mutation re-syncs.

## 7. Auth flows & UI

- **Header:** shows **"Sign in"** when logged out; when logged in, shows the user's email (or
  avatar) with a small menu containing **"Sign out"**.
- **Auth modal** (`auth-modal.tsx`, styled like the muscle-map modal): 
  - Google button (calls `signInWithOAuth({ provider: 'google' })`).
  - Email + password form with a **Sign in / Sign up** toggle.
  - Loading state on submit, inline error messages, required-field indicators.
  - On sign-up, show "check your email to confirm" (email confirmation is ON).
  - Esc / backdrop close; focus first field; full EN/中文.
- **AuthProvider API:** `user`, `session`, `loading`, `signUpWithPassword(email, pw)`,
  `signInWithPassword(email, pw)`, `signInWithGoogle()`, `signOut()`. Subscribes to
  `supabase.auth.onAuthStateChange` and cleans up on unmount.

## 8. Files

New:
- `src/lib/supabase.ts` — singleton browser client from env vars.
- `src/lib/auth.tsx` — `AuthProvider` + `useAuth()`.
- `src/components/auth-modal.tsx` — sign in / sign up UI.

Edited:
- `src/lib/plan.tsx` — add Supabase hydrate/merge-on-login/debounced-upsert; unchanged when guest.
- `src/components/site-header.tsx` — sign-in button / user menu.
- `src/app/layout.tsx` — insert `AuthProvider` into the provider tree.
- `src/lib/i18n.tsx` — auth strings (signIn, signOut, signUp, email, password, emailSent, auth errors, etc.).

Config:
- `.env.local` — `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (git-ignored).
- `.env.local.example` — committed template with blank values.
- Ensure `.gitignore` excludes `.env*.local`.

## 9. Environment & config

- The **anon (public) key** is safe to ship to the browser; RLS protects data. The
  **service_role key is never used client-side and never committed.**
- If Supabase env vars are absent, `supabase.ts` exports `null` and the app runs in
  **guest-only mode** (Sign-in button hidden or shows a "not configured" note) so development
  without keys still works.

## 10. Supabase project setup (done with the user in their Chrome)

1. User signs up at supabase.com and creates a project (assistant guides screens; cannot create the account).
2. Run the SQL in §5 via the Supabase SQL editor.
3. Copy Project URL + anon key into `.env.local`.
4. Auth settings: email confirmation **ON**; add the app origin (e.g. `http://localhost:3005`,
   later the production URL) to allowed redirect URLs.

## 11. Google OAuth setup (second milestone)

1. In Google Cloud Console: create OAuth consent screen + OAuth 2.0 client (Web).
2. Authorized redirect URI = the Supabase callback (`https://<ref>.supabase.co/auth/v1/callback`).
3. Paste client ID/secret into Supabase → Auth → Providers → Google; enable it.
4. Assistant guides each screen in Chrome; the user performs account actions and pastes secrets
   (assistant does not enter the user's credentials).

## 12. Testing plan & constraints

- Verify (assistant-driven in Chrome): guest browse/plan unchanged; Sign-in button/modal render;
  form validation, loading, and error states; user menu + sign-out; light/dark + EN/中文; no
  console errors; `tsc` clean; unit tests for the merge function.
- **Constraint:** the assistant will **not** create accounts or type real passwords. The user
  performs live sign-up/sign-in; assistant verifies the resulting signed-in state and that the
  plan round-trips to Supabase.
- New unit test: `mergeWeek(remote, local)` — union per day, de-dup by id, order preserved,
  empty-side cases.

## 13. Security notes

- RLS is mandatory and must be verified (a user cannot read another user's row).
- Only the anon key reaches the browser; `.env*.local` is git-ignored.
- No personal data placed in URLs; OAuth uses Supabase's standard redirect.

## 14. Build order (milestones)

1. **M1 — Backend up:** create Supabase project + `plans` table + RLS (with user).
2. **M2 — Wiring:** `supabase.ts`, env, guest-safe fallback.
3. **M3 — Auth core:** `AuthProvider`, header button/menu, `auth-modal` (email/password), i18n.
4. **M4 — Sync:** plan hydrate + merge-on-login + debounced upsert; merge unit test.
5. **M5 — Verify:** full in-browser QA (guest + signed-in round-trip), `tsc`, tests.
6. **M6 — Google:** Google Cloud OAuth app + Supabase provider; verify Google sign-in.
