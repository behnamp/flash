# /flash-deploy

Safe deployment of the current work to production (push to main → Vercel auto-deploys).

Steps:
1. Run the `code-reviewer` agent on the diff vs main. Stop on any FAIL finding.
2. Run `npm run build` — must pass (the deploy-gate hook enforces this again at push time).
3. Push/merge to `main`.
4. Verify the deploy: check the latest Vercel deployment status and runtime errors (Vercel MCP tools), and confirm https://flashcam.app responds.
5. Print a receipt: commit pushed, build result, deploy status, live URL.

Stop if: any build error, any blocking review finding, or the Vercel deployment fails.
