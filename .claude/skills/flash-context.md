---
name: flash-context
description: >
  Flash app project context. Load for ALL Flash tasks. Contains stack details,
  design system rules, feature map, and Supabase schema patterns. Use when
  working on flash-roan.vercel.app or github.com/behnamp/flash.
---

# Flash App — Agent Context

## Stack (Strict — Do Not Deviate)
- Framework: Next.js 14 App Router (src/app/ directory)
- Language: TypeScript (strict mode)
- Styling: Tailwind CSS utility classes only
- Database: Supabase (PostgreSQL + RLS + Realtime + Storage)
- Deployment: Vercel (auto-deploy on push to main)
- Icons: Phosphor Icons (white SVG only)
- Images: Unsplash API for previews

## Key Routes (App Router)
```
src/app/
  page.tsx              — Landing / event creation
  [eventId]/
    page.tsx            — Guest camera view
    reveal/page.tsx     — Photo reveal experience
    gallery/page.tsx    — Event gallery
  admin/
    page.tsx            — Host dashboard
    events/[id]/page.tsx
  api/
    upload/route.ts     — Photo upload handler
    reveal/route.ts     — Reveal logic
```

## Supabase Schema (Core Tables)
```sql
events (id, host_id, name, slug, settings jsonb, created_at)
photos (id, event_id, guest_name, storage_path, mode, revealed_at, metadata jsonb)
guests (id, event_id, name, session_token, created_at)
```

## Photo Modes (29 total — never remove or rename)
Stored in: src/lib/photo-modes.ts
Pattern: { id, name, label, filter: string, canvasTransform?: fn, thumbnail: string }
Categories: Disposable, Vintage, Film, B&W, Creative, Color

## Reveal Modes (5 total)
- instant: show immediately after upload
- countdown: reveal at specific date/time
- threshold: reveal when N photos uploaded
- host-approved: host manually reveals each
- collective: all revealed simultaneously at event end

## i18n Pattern
- Library: next-intl
- Files: src/messages/[locale].json
- RTL locales: fa, ar, he
- 20+ languages total

## Supabase Storage
- Bucket: event-photos
- Path pattern: {eventId}/{guestId}/{timestamp}.{ext}
- Max size: 10MB per photo
- Allowed types: image/jpeg, image/png, image/webp, image/heic

## Performance Targets
- LCP < 2.5s on mobile
- CLS < 0.1
- Camera shutter < 200ms latency
- Photo upload < 3s on 4G

## Design Rules (Non-Negotiable)
1. Background: always deep dark (#0A0A0F or equivalent)
2. Accent: single gold or white — never both at once in same component
3. Icons: Phosphor Icons, white SVG only, no emoji
4. Typography: editorial, generous spacing
5. Borders: hairline (1px) or none
6. Animations: 150–300ms, ease-out enters, ease-in exits
7. Mobile-first: 375px base, scales up

## Headroom Integration
```bash
# Start compressed Claude Code session for Flash
pip install "headroom-ai[all]"
headroom proxy
ANTHROPIC_BASE_URL=http://localhost:8787 claude --project flash
```
