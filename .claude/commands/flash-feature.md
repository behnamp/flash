# /flash-feature

Build a new Flash feature end-to-end.

Usage: /flash-feature [feature description]

Steps:
1. Plan against CLAUDE.md (architecture, design system, constraints). Flag any Supabase schema impact — schema changes need a migration and a `types/database.ts` update.
2. Implement the feature (mobile-first, inline styles + CSS variables from `app/globals.css`, icons from `components/icons.tsx`, motion tokens from `lib/motion.ts`).
3. Run the `design-critic` agent on any UI changes — revise until PASS (max 3 rounds, then surface the disagreement).
4. Run the `code-reviewer` agent on the full diff — fix blocking findings.
5. Run `npm run build` — must pass.
6. Print a receipt: changed files, review verdicts, build result.

Do not use placeholder images. Do not break RTL. Do not fake verification.
