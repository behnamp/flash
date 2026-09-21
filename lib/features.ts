/**
 * Feature switches.
 *
 * Paused features keep all their code (UI, API routes, DB columns) so they
 * can return by flipping one value here — nothing is deleted.
 *
 *  aiReel            — AI Highlight Reel (Seedance video from best shots).
 *                      UI: event page reel card, event settings toggle.
 *                      API: app/api/generate-reel, reel status polling.
 *  printIntegration  — guests order physical prints from the gallery.
 *                      UI: event settings toggle.
 */
export const FEATURES = {
  aiReel: false,
  printIntegration: false,
} as const
