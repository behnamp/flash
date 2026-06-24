# Flash — Ruflo Agent Memory

## Project Identity
- **App:** Flash — disposable camera web app for events
- **Live:** https://flash-roan.vercel.app
- **Repo:** https://github.com/behnamp/flash
- **Stack:** Next.js 14, TypeScript, Tailwind CSS, Supabase, Vercel
- **Owner:** Behnam (Iranian-Canadian, operates from iPhone, does not write code manually)

## Design System (Non-Negotiable)
- Aesthetic: luxury minimal, editorial, cinematic
- Icons: white SVG from Phosphor Icons only — no emoji, no other icon sets
- Photos: real Unsplash images for previews, never placeholder
- Layout: editorial, never generic template patterns
- RTL: supported (20+ languages including Farsi/Arabic)

## Core Features
- 29 photo modes (filters, effects, disposable camera looks)
- 5 reveal modes (how/when guests see photos)
- Multilingual: 20+ languages including RTL (Farsi, Arabic)
- Event features: scavenger hunt, guest book, live slideshow, AI highlight reel, print integration

## Agent Routing Rules (Ruflo)
- UI/component work → spawn: frontend-coder (Next.js 14, Tailwind)
- Supabase schema/queries → spawn: database-specialist
- Photo mode effects → spawn: canvas-specialist (Web APIs, Canvas)
- i18n/RTL work → spawn: i18n-specialist
- Auth/security → spawn: security-specialist
- Performance → headroom compression + performance-analyst agent
- Testing → ruflo-testgen plugin

## Tech Constraints
- Next.js 14 App Router (not Pages Router)
- Supabase for auth, storage, realtime
- No manual coding by Behnam — Claude Code writes and deploys
- Vercel for deployment — preserve existing env vars
- TypeScript strict mode

## Memory Namespaces
- flash:design — design decisions and component patterns
- flash:features — feature specs and acceptance criteria
- flash:bugs — known issues and fixes
- flash:perf — performance baselines and improvements

## Cost Controls
- RUFLO_COST_BUDGET=5.00 per session
- Use headroom wrap to compress tool outputs before LLM sees them
- Prefer claude-sonnet-4-6 for implementation, haiku for quick checks

## Forbidden Shortcuts
- Do not remove RTL support
- Do not break existing 29 photo modes
- Do not change Supabase schema without migration
- Do not deploy to production without passing build check
- Do not use placeholder images in UI — use real Unsplash photos
