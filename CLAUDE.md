# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Flash** — a disposable-camera web app for events. Hosts create an event; guests join by code/QR with no account, get a limited number of shots with film-style filters, and photos "develop" according to the event's reveal mode.

- **Live:** https://flashcam.app (Vercel project `flash-roan`)
- **Owner:** Behnam — operates from iPhone, does not write code manually. Claude Code writes and deploys everything.
- **Stack:** Next.js 16 App Router (root `app/`, no `src/`), React 19, TypeScript strict, Supabase (auth/Postgres/storage/realtime), Stripe + Apple StoreKit, Capacitor 8 (iOS/Android shells), Sanity CMS, Resend (email), Vercel.

## Commands

```bash
npm run dev            # Local dev server
npm run build          # Production build — must pass before any deploy
npm run lint           # ESLint (flat config, eslint.config.mjs)

npm run cap:sync       # Sync Capacitor native projects
npm run cap:ios        # Sync + open Xcode
npm run cap:android    # Sync + open Android Studio
npm run build:ios      # next build + cap sync ios
npm run build:android  # next build + cap sync android
```

There is no test suite. Deployment is automatic: Vercel deploys on push to `main`. Vercel env vars and custom domains are managed by manually-dispatched GitHub workflows (`.github/workflows/set-vercel-env.yml`, `add-domain.yml`) — preserve existing Vercel env vars. `.env.production` is intentionally committed (public keys only); secrets live in Vercel/GitHub secrets.

## Architecture

### Two audiences, two auth models
- **Hosts** use Supabase auth. `proxy.ts` (Next middleware) guards `/host`, `/create`, `/admin` — unauthenticated users are redirected to `/login?next=...`. Host flow: `/create` (3-step event creation) → `/host/[eventId]` (dashboard) → `edit`, `poster`, `download` subpages.
- **Guests** never authenticate. They join at `/join/[code]`, and their identity is a row in the `guests` table cached in `localStorage` under `flash_guest_{eventId}`. Guest flow: `/join/[code]` → `camera` → `gallery`.

Other public surfaces: `/gallery/[token]` (tokenized share link + `embed`), `/reveal/[code]`, `/slideshow/[code]`, `/scan` (QR scanner), `/pricing`, `/planners`.

### Supabase
- `lib/supabase/client.ts` (browser) and `lib/supabase/server.ts` (server components/routes) via `@supabase/ssr`. API routes that need elevated access call the Supabase REST API directly with `SUPABASE_SERVICE_ROLE_KEY`.
- Schema types are hand-maintained in `types/database.ts`: `profiles`, `events`, `guests`, `shots`, `reactions` + `event_summary` view. The `events` row holds all per-event configuration (shot limits, mode control, reveal mode, feature toggles, branding, language). Keep this file in sync with any schema change, and never change the Supabase schema without a migration.

### Photo modes (filters)
Two files that must stay in sync by mode `id`:
- `constants/photoModes.ts` — `PHOTO_MODES` (the categorized UI list shown in create/edit/camera) and `ALL_MODES`.
- `lib/filterCanvas.ts` — `CANVAS_FILTERS` maps mode id → CSS filter string + optional `fx` post-processing (vignette, grain, light leak, glitch). Filters run 100% client-side on Canvas 2D — no server or API involved.

`lib/modePreviews.ts` supplies preview imagery. Never remove or rename existing mode ids — they are persisted in `shots.mode_id`.

### Reveal modes
`constants/revealModes.ts` defines the 5 reveal modes: `instant`, `end`, `rolling`, `morning`, `milestone`. Reveal state lives on `events` (`reveal_mode`, `reveal_at`, `revealed`) and per-shot `shots.revealed`.

### Payments
Per-event tiers (mini → unlimited, plus `keep_forever`). Web uses Stripe (`app/api/stripe/*`: create-checkout, webhook, verify-payment, etc.). Native iOS uses Apple IAP through the StoreKit bridge in `lib/storekit.ts`, which detects the Capacitor shell and maps tier ids → StoreKit product ids. Any pricing change must handle both paths.

### Native apps (Capacitor)
`ios/` and `android/` are thin WebView shells: `capacitor.config.ts` points `server.url` at the live site, so app features ship via web deploys without app-store releases. Only touch native projects for plugins, icons/splash, or StoreKit work. `store-assets/APP_STORE_GUIDE.md` covers store submission.

### Sanity CMS
Marketing copy for the landing and planners pages is editable at `/studio` (`sanity.config.ts`, schemas in `sanity/schemas/`). Pages fetch content client-side via `lib/sanity/useSanityContent.ts` and fall back to hardcoded copy when Sanity isn't configured — never make page rendering depend on Sanity being reachable.

### API routes
`app/api/` holds: Stripe endpoints, `send-reveal-email` (Resend), `download-gallery` (zip export), `reel` (AI highlight reel via Higgsfield API), `draft-mode` (Sanity preview), and `cron/expire-photos` — a Vercel cron (daily 03:00 UTC, see `vercel.json`) authenticated with `Bearer CRON_SECRET`.

## Design System (Non-Negotiable)

- Aesthetic: luxury minimal, editorial, cinematic. Dark UI on `#0a0a0a`, **Kodak yellow accent `#ffb800`**, Space Grotesk font.
- Styling is mostly **inline `style` objects using the CSS variables defined in `app/globals.css`** (`--bg`, `--surface`, `--accent`, `--safe-top`, ...). Tailwind 4 is imported but sparingly used — match the inline-style idiom of the file you're editing.
- Icons: Phosphor Icons only, re-exported with `Icon*` aliases from `components/icons.tsx` — import from there, never emoji or other icon sets in UI chrome.
- Motion: use the tokens/variants in `lib/motion.ts` (`motion/react`) — 150–300ms, ease-out enter / ease-in exit, transform+opacity only, respects reduced motion.
- Photos: real Unsplash images for previews, never placeholders.
- Mobile-first (375px base) with safe-area insets; this is primarily used on phones at events.
- RTL: `constants/languages.ts` defines 20+ languages with `dir` (`fa`, `ar`, `he` are RTL). Do not remove RTL support.

## Agents & Gates

- **Deploy gate (automatic):** a PreToolUse hook (`.claude/settings.json` → `.claude/hooks/deploy-gate.sh`) blocks any `git push` targeting `main` unless `npm run build` passes. Lint failures are reported as a warning but don't block (pre-existing lint debt). Pushes to feature branches are not gated.
- **`design-critic` agent:** spawn after any UI change — scores it against the design-system rubric (tokens, icons, a11y, RTL, motion) and returns PASS/FAIL with file:line fixes. The producer never grades its own design work.
- **`code-reviewer` agent:** spawn before pushing nontrivial changes — checks Flash's critical invariants (photo-mode id sync, schema/types sync, guest vs host auth, dual Stripe/StoreKit paths, service-role usage, RTL, subscription cleanup) and returns PASS/FAIL findings.

## Forbidden Shortcuts

- Do not break existing photo modes or rename mode ids.
- Do not change the Supabase schema without a migration (and update `types/database.ts`).
- Do not deploy without a passing `npm run build`.
- Do not remove RTL support.
- Do not use placeholder images in UI.

## Stale docs warning

`AGENTS.md` and `.claude/skills/flash-context.md` predate major refactors — they reference Next.js 14, a `src/` directory, next-intl, and file paths that no longer exist. Where they conflict with this file or the actual code, the code wins.
