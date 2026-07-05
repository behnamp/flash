# /flash-photo-mode

Add a new photo mode to Flash.

Usage: /flash-photo-mode [mode name] [look description]

Steps:
1. Pick a kebab-case mode id. Never modify or rename existing mode ids — they are persisted in `shots.mode_id`.
2. Add the CSS filter string (plus optional `fx` post-processing like vignette/grain) to `CANVAS_FILTERS` in `lib/filterCanvas.ts`.
3. Add the mode to the appropriate category in `constants/photoModes.ts` with a preview gradient `bg`.
4. Add preview imagery in `lib/modePreviews.ts` if the pattern there requires it.
5. Verify the id is identical in both files — an id mismatch means the camera silently applies no filter.
6. Run the `design-critic` agent on the mode's preview presentation, then `npm run build`.
7. Print: mode id, filter string, changed files.
