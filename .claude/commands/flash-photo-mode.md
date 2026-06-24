# /flash-photo-mode

Add a new photo mode to Flash (joins the existing 29).

Usage: /flash-photo-mode [mode name] [description]

Steps:
1. Load flash-context.md
2. Spawn canvas-specialist to build CSS filter + optional canvas transform
3. Spawn frontend-coder to add mode to src/lib/photo-modes.ts and UI selector
4. Spawn i18n-specialist to add mode label to all 20+ locale files
5. Spawn test-engineer to add snapshot test for new mode
6. flash-reviewer verifies thumbnail matches luxury-minimal aesthetic
7. Print: mode ID, filter string, canvas transform (if any), all changed files

Constraints: Never modify or rename existing 29 modes. Mode ID must be kebab-case.
