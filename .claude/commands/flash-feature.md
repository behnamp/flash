# /flash-feature

Spawn a coordinated swarm to build a new Flash feature end-to-end.

Usage: /flash-feature [feature description]

Steps:
1. Load flash-context.md skill
2. Spawn flash-architect to review feasibility + Supabase impact
3. Spawn frontend-coder for UI components (Next.js 14, Tailwind, Phosphor Icons)
4. Spawn supabase-specialist if schema or RLS changes needed
5. Spawn i18n-specialist if any new strings added
6. Spawn test-engineer to write component + E2E tests
7. flash-reviewer checks design system compliance
8. Run: npx tsc --noEmit && npx next build
9. Print completion receipt with changed files

Anti-gaming: Do not fake passing tests. Do not skip RTL strings. Do not use placeholder images.
