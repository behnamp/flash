// Photo mode previews using picsum.photos stable IDs
// Format: https://picsum.photos/id/{number}/300/200 — no redirects, direct CDN

export const MODE_PREVIEWS: Record<string, { photo: string; filter: string }> = {
  // ── Film Emulation ──────────────────────────────────────────
  kodak:     { photo: 'https://picsum.photos/id/10/300/200',  filter: 'sepia(0.3) saturate(1.4) brightness(1.05) contrast(1.1) hue-rotate(5deg)' },
  fuji:      { photo: 'https://picsum.photos/id/15/300/200',  filter: 'saturate(1.15) brightness(1.05) contrast(1.05) hue-rotate(-10deg)' },
  portra:    { photo: 'https://picsum.photos/id/20/300/200',  filter: 'sepia(0.12) saturate(0.85) brightness(1.12) contrast(0.93)' },
  ilford:    { photo: 'https://picsum.photos/id/25/300/200',  filter: 'grayscale(1) contrast(1.35) brightness(0.95)' },
  cinestill: { photo: 'https://picsum.photos/id/30/300/200',  filter: 'saturate(0.7) brightness(0.78) contrast(1.25) hue-rotate(220deg)' },
  lomo:      { photo: 'https://picsum.photos/id/35/300/200',  filter: 'saturate(1.7) contrast(1.5) brightness(0.85) hue-rotate(15deg)' },

  // ── Era & Decade ────────────────────────────────────────────
  super8:    { photo: 'https://picsum.photos/id/40/300/200',  filter: 'sepia(0.55) saturate(1.2) contrast(1.1) hue-rotate(10deg)' },
  vhs:       { photo: 'https://picsum.photos/id/45/300/200',  filter: 'saturate(0.6) contrast(1.4) brightness(0.85) hue-rotate(210deg)' },
  nineties:  { photo: 'https://picsum.photos/id/50/300/200',  filter: 'saturate(0.85) contrast(0.9) brightness(1.15) sepia(0.1)' },
  y2k:       { photo: 'https://picsum.photos/id/55/300/200',  filter: 'saturate(1.4) contrast(1.3) brightness(1.05) hue-rotate(280deg)' },
  polaroid:  { photo: 'https://picsum.photos/id/60/300/200',  filter: 'sepia(0.2) saturate(0.8) brightness(1.2) contrast(0.88)' },

  // ── Mood ────────────────────────────────────────────────────
  golden:    { photo: 'https://picsum.photos/id/65/300/200',  filter: 'sepia(0.35) saturate(1.6) brightness(1.1) contrast(1.05) hue-rotate(15deg)' },
  bluehour:  { photo: 'https://picsum.photos/id/70/300/200',  filter: 'saturate(1.1) brightness(0.75) contrast(1.2) hue-rotate(200deg)' },
  neonnoir:  { photo: 'https://picsum.photos/id/75/300/200',  filter: 'saturate(2.0) brightness(0.6) contrast(1.6) hue-rotate(300deg)' },
  softdream: { photo: 'https://picsum.photos/id/80/300/200',  filter: 'saturate(0.7) brightness(1.22) contrast(0.82) blur(0.5px)' },
  harsh:     { photo: 'https://picsum.photos/id/85/300/200',  filter: 'grayscale(0.4) contrast(1.7) brightness(0.85) saturate(0.5)' },
  desert:    { photo: 'https://picsum.photos/id/90/300/200',  filter: 'sepia(0.45) saturate(0.9) brightness(1.12) contrast(1.05)' },

  // ── Event-Specific ──────────────────────────────────────────
  weddingf:  { photo: 'https://picsum.photos/id/95/300/200',  filter: 'saturate(0.65) brightness(1.2) contrast(0.88) sepia(0.1)' },
  nightclub: { photo: 'https://picsum.photos/id/100/300/200', filter: 'saturate(2.2) brightness(0.55) contrast(1.7) hue-rotate(280deg)' },
  sportsf:   { photo: 'https://picsum.photos/id/105/300/200', filter: 'saturate(1.4) contrast(1.45) brightness(1.05)' },
  festivalf: { photo: 'https://picsum.photos/id/110/300/200', filter: 'saturate(1.6) contrast(1.25) hue-rotate(20deg)' },

  // ── Experimental ────────────────────────────────────────────
  doubleexp: { photo: 'https://picsum.photos/id/115/300/200', filter: 'saturate(0.5) brightness(1.3) contrast(1.2) opacity(0.85)' },
  lightleak: { photo: 'https://picsum.photos/id/120/300/200', filter: 'saturate(1.5) brightness(1.2) contrast(1.1) sepia(0.2)' },
  cross:     { photo: 'https://picsum.photos/id/125/300/200', filter: 'saturate(2.8) contrast(1.6) hue-rotate(90deg) brightness(0.88)' },
  glitch:    { photo: 'https://picsum.photos/id/130/300/200', filter: 'saturate(3.0) contrast(1.9) hue-rotate(180deg) brightness(0.72)' },
  infrared:  { photo: 'https://picsum.photos/id/135/300/200', filter: 'saturate(0.3) brightness(1.35) contrast(1.45) hue-rotate(90deg) invert(0.1)' },
}
