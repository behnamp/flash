# /flash-deploy

Safe deployment pipeline for Flash to Vercel.

Steps:
1. Load flash-context.md
2. Spawn security-specialist: check for exposed secrets, validate RLS policies
3. Run: npx tsc --noEmit (must pass — stop if fails)
4. Run: npx next build (must pass — stop if fails)
5. Run: npx playwright test (must pass — stop if fails)
6. Confirm: all 29 photo modes render, all 5 reveal modes functional
7. Confirm: RTL layout intact for fa/ar/he locales
8. Push to main → Vercel auto-deploys
9. Verify live at flash-roan.vercel.app
10. Print receipt: build time, bundle sizes, test results, deploy URL

Stop if: any TypeScript error, any build error, any test failure, any RLS policy missing.
