# Flash — Ruflo Agent Memory

## Project Identity
- **App:** Flash — disposable camera web app for events
- **Live:** https://flashcam.app  (Vercel alias also serves flash-roan.vercel.app)
- **Repo:** https://github.com/behnamp/flash
- **Stack:** Next.js 16 (App Router), React 19, TypeScript (strict), Tailwind v4, Supabase, Vercel
- **Native:** Capacitor 8 shell (iOS + Android) that loads the live site, so web
  deploys ship to the apps instantly — only native chrome (icons, splash,
  plugins) requires an Xcode/Android rebuild + `npx cap sync`.
- **CMS:** Sanity (embedded Studio at `/studio`, visual editing via Presentation).
  Pages read content client-side and fall back to hardcoded defaults when
  `NEXT_PUBLIC_SANITY_PROJECT_ID` is unset.
- **Owner:** Behnam (Iranian-Canadian, operates from iPhone, does not write code manually)

## Design System (Non-Negotiable)
- **Accent: Kodak yellow `#ffb800`** on near-black `#0a0a0a`. (Migrated from the
  old lime `#e8ff47` — do not reintroduce lime.) Yellow lightning-bolt logo.
- Aesthetic: luxury minimal, editorial, cinematic; dark theme only.
- Icons: white/yellow SVG (Phosphor + hand-rolled in `components/icons.tsx`).
  Emoji are used deliberately in the event **cover picker** only.
- Body text must stay readable — dim grays were lifted to meet ~WCAG AA on the
  dark background; keep new copy at `#8a8a8a` or brighter.
- Mobile-first: the marketing/landing pages are designed for iPhone first, with a
  hamburger menu and an always-visible header.
- RTL: supported (20+ languages including Farsi/Arabic).

## Core Features
- Photo/film modes: **5 ship live to guests** (Kodak Gold, Ilford B&W, Portra 400,
  Polaroid, Golden Hour) via `constants/photoModes.ts` → `ALL_MODES`.
  `lib/filterCanvas.ts` (`CANVAS_FILTERS`) holds the broader ~29-preset library
  the brand markets; only ids present in `ALL_MODES` are selectable in-app.
- 5 reveal modes (`constants/revealModes.ts`): instant, end, rolling, morning, milestone.
- Guest flow (keep low-friction, don't touch casually): scan QR → enter name → shoot.
- Host flow: create event → pay/activate → share QR → reveal → download.
- Event extras: scavenger hunt, guest book, live slideshow, AI highlight reel, print.
- Planners product (`/planners`) — monthly plans for DJs/venues/agencies + Stripe subs.

## Key Routes & Files
- `app/page.tsx` — marketing landing (mobile-first, motion, Sanity-backed copy).
- `app/create/page.tsx` — **3-step** create flow (occasion+name+date → guests/plan →
  confirm). Advanced config (film modes, cover, reveal timing, features) lives in
  `app/host/[eventId]/edit/page.tsx`, editable after the event exists.
- `app/host/page.tsx` — dashboard; Drafts / Live / Past sections + "Try free" path.
- `app/join/[code]/camera/page.tsx` — guest camera (film strip, zoom, "roll full" state).
- `app/reveal/[code]/page.tsx` — cinematic reveal sequence.
- `lib/eventLogic.ts` — **pure, unit-tested** business rules (status, guest cap,
  QR parse, reveal copy, tier math). Prefer adding shared logic here over inlining
  it in `'use client'` pages, so it stays testable.
- `app/api/stripe/*` — checkout, subscriptions, keep-forever, webhook.

## Event Lifecycle (source of truth — see `eventLogic.eventStatus`)
- **Draft (unpaid):** `paid: false` — never activated; shows "Pay Now" + "Delete".
- **Live:** `paid: true, is_active: true, revealed: false`.
- **Revealed:** `paid: true, revealed: true`.
- **Ended:** `paid: true, is_active: false`. Never call an unpaid event "Ended".
- Terminology in UI: `shot_limit` → "Photos per guest", `guest_cap` → "Max guests",
  live count → "Photos so far". Never show a bare "Limit" or a raw event UUID.

## Testing
- **Vitest** unit tests in `tests/` — run `npm test` (`test:watch` for TDD).
- Cover the pure logic in `lib/eventLogic.ts`, the film-filter library, and the
  content constants (mode/reveal integrity, monotonic pricing).
- CI: `.github/workflows/ci.yml` runs `npm test` + `npm run build` on PRs and main.
- Guest camera / QR scanning have no headless coverage (needs a real camera) —
  verify those on-device.

## Tech Constraints
- Next.js 16 App Router (not Pages Router). TypeScript strict mode.
- Supabase for auth, storage, realtime. Realtime channels MUST be unsubscribed via
  a ref-stored cleanup returned from `useEffect` (not from an inner async fn) —
  this leak has recurred; check it on any new realtime page.
- iOS Safari has no `BarcodeDetector`: QR scanning falls back to jsQR. Keep that path.
- Vercel for deployment — preserve existing env vars.
- Do not deploy to production without a passing `npm run build`.

## Cost Controls
- RUFLO_COST_BUDGET=5.00 per session.
- Prefer efficient models for implementation; escalate only when needed.

## Forbidden Shortcuts
- Do not reintroduce the old lime accent — the brand is Kodak yellow `#ffb800`.
- Do not remove RTL support.
- Do not break the 5 live photo modes or the guest scan→name→shoot flow.
- Do not change Supabase schema without a migration (ask the owner first).
- Do not deploy to production without passing the build check.
- Do not show raw UUIDs or un-activated events labeled as "Ended" in the UI.
- Do not use placeholder images in UI.
