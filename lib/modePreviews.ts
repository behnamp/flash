// Photo mode previews — CSS gradient backgrounds only
// Reliable, instant, no external dependencies, no 403s

export const MODE_PREVIEWS: Record<string, { bg: string; filter: string; overlay?: string }> = {
  // ── Film Emulation ──────────────────────────────────────────
  kodak: {
    bg: 'linear-gradient(135deg, #d4a857 0%, #c17f3e 40%, #8b5e3c 100%)',
    filter: 'none',
  },
  fuji: {
    bg: 'linear-gradient(135deg, #7db88a 0%, #4a9068 40%, #2d6b4a 100%)',
    filter: 'none',
  },
  portra: {
    bg: 'linear-gradient(135deg, #e8d5c4 0%, #c4a882 40%, #a07d5a 100%)',
    filter: 'none',
  },
  ilford: {
    bg: 'linear-gradient(135deg, #e8e8e8 0%, #999 40%, #333 100%)',
    filter: 'none',
  },
  cinestill: {
    bg: 'linear-gradient(135deg, #1a0a2e 0%, #2d1b4e 40%, #0d0d1a 100%)',
    filter: 'none',
    overlay: 'radial-gradient(ellipse at 80% 20%, rgba(255,80,80,0.4) 0%, transparent 60%)',
  },
  lomo: {
    bg: 'linear-gradient(135deg, #ff6b35 0%, #c4273c 40%, #1a0a2e 100%)',
    filter: 'none',
  },

  // ── Era & Decade ────────────────────────────────────────────
  super8: {
    bg: 'linear-gradient(135deg, #c8a96e 0%, #9b7a3d 40%, #5c4422 100%)',
    filter: 'none',
  },
  vhs: {
    bg: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)',
    filter: 'none',
    overlay: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,0,0.03) 2px, rgba(0,255,0,0.03) 4px)',
  },
  nineties: {
    bg: 'linear-gradient(135deg, #e8e0d5 0%, #c4b89a 40%, #9a8c6e 100%)',
    filter: 'none',
  },
  y2k: {
    bg: 'linear-gradient(135deg, #ff00ff 0%, #00ffff 50%, #ff00aa 100%)',
    filter: 'none',
  },
  polaroid: {
    bg: 'linear-gradient(135deg, #f5f0e8 0%, #e8dcc8 40%, #d4c4a8 100%)',
    filter: 'none',
  },

  // ── Mood ────────────────────────────────────────────────────
  golden: {
    bg: 'linear-gradient(135deg, #ff9a00 0%, #e05e00 40%, #7a2800 100%)',
    filter: 'none',
  },
  bluehour: {
    bg: 'linear-gradient(135deg, #0a1628 0%, #1a2f5e 40%, #0d2040 100%)',
    filter: 'none',
    overlay: 'linear-gradient(180deg, rgba(100,150,255,0.3) 0%, transparent 100%)',
  },
  neonnoir: {
    bg: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a2e 50%, #0a0a0a 100%)',
    filter: 'none',
    overlay: 'radial-gradient(ellipse at 30% 50%, rgba(255,0,200,0.5) 0%, transparent 50%), radial-gradient(ellipse at 70% 30%, rgba(0,200,255,0.4) 0%, transparent 50%)',
  },
  softdream: {
    bg: 'linear-gradient(135deg, #f8e8f0 0%, #e8d0e8 40%, #d8c0e0 100%)',
    filter: 'blur(0.5px)',
  },
  harsh: {
    bg: 'linear-gradient(135deg, #ffffff 0%, #888 40%, #000 100%)',
    filter: 'none',
  },
  desert: {
    bg: 'linear-gradient(135deg, #e8c97a 0%, #c4943a 40%, #8b5e20 100%)',
    filter: 'none',
  },

  // ── Event-Specific ──────────────────────────────────────────
  weddingf: {
    bg: 'linear-gradient(135deg, #f8f4ef 0%, #e8ddd0 40%, #d4c4b0 100%)',
    filter: 'none',
  },
  nightclub: {
    bg: 'linear-gradient(135deg, #0a0a0a 0%, #1a0028 50%, #0a0a0a 100%)',
    filter: 'none',
    overlay: 'radial-gradient(ellipse at 50% 80%, rgba(180,0,255,0.6) 0%, transparent 60%)',
  },
  sportsf: {
    bg: 'linear-gradient(135deg, #1a3a5c 0%, #0d5c2e 40%, #1a3a0d 100%)',
    filter: 'none',
  },
  festivalf: {
    bg: 'linear-gradient(135deg, #ff6b6b 0%, #ffd700 30%, #7b68ee 60%, #ff6b6b 100%)',
    filter: 'none',
  },

  // ── Experimental ────────────────────────────────────────────
  doubleexp: {
    bg: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    filter: 'none',
    overlay: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'100\' height=\'100\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'25\' fill=\'rgba(255,255,255,0.08)\'/%3E%3Ccircle cx=\'70\' cy=\'60\' r=\'20\' fill=\'rgba(255,255,255,0.06)\'/%3E%3C/svg%3E")',
  },
  lightleak: {
    bg: 'linear-gradient(135deg, #1a0a00 0%, #3d1500 50%, #1a0a00 100%)',
    filter: 'none',
    overlay: 'radial-gradient(ellipse at 0% 0%, rgba(255,140,0,0.7) 0%, rgba(255,60,0,0.3) 30%, transparent 60%)',
  },
  cross: {
    bg: 'linear-gradient(135deg, #ff0080 0%, #00ff80 50%, #8000ff 100%)',
    filter: 'none',
  },
  glitch: {
    bg: 'linear-gradient(135deg, #000 0%, #0a0a0a 100%)',
    filter: 'none',
    overlay: 'repeating-linear-gradient(90deg, rgba(255,0,0,0.15) 0px, rgba(255,0,0,0.15) 2px, transparent 2px, transparent 8px), repeating-linear-gradient(90deg, rgba(0,255,255,0.1) 4px, rgba(0,255,255,0.1) 6px, transparent 6px, transparent 12px)',
  },
  infrared: {
    bg: 'linear-gradient(135deg, #ff9900 0%, #ff4400 40%, #990000 100%)',
    filter: 'hue-rotate(90deg) invert(0.1)',
  },
}
