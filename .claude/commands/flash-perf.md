# /flash-perf

Run a full performance audit on Flash and generate an improvement plan.

Steps:
1. Load flash-context.md + headroom context
2. Spawn perf-analyst to audit: LCP, CLS, FID, bundle size, image optimization
3. Check: camera shutter latency < 200ms, photo upload < 3s
4. Spawn frontend-coder to implement top 3 improvements
5. Re-measure and compare
6. Print: before/after metrics, changed files, remaining risks

Targets: LCP < 2.5s, CLS < 0.1, upload < 3s on 4G
