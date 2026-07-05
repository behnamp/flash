# /flash-perf

Performance audit of Flash with measured (never estimated) numbers.

Steps:
1. Run `npm run build` and record the route-by-route bundle sizes it prints.
2. Check the live site: Vercel runtime errors/logs (Vercel MCP tools), and response times for `/`, `/join`, and a gallery page.
3. Identify the top 3 concrete improvements (bundle weight, image loading, blocking requests) with the evidence for each.
4. Implement them, re-run the build, and compare sizes before/after.
5. Print: before/after numbers, changed files, remaining risks.

Targets: LCP < 2.5s mobile, CLS < 0.1. Report real measurements only — if something can't be measured from here, say so instead of guessing.
