// Photo mode preview images + CSS filters
// Using Unsplash Source API — reliable, free, no auth needed
// Format: https://images.unsplash.com/photo-ID?w=300&q=70&fit=crop&auto=format

export const MODE_PREVIEWS: Record<string, { photo: string; filter: string }> = {
  // ── Film Emulation ──────────────────────────────────────────
  kodak: {
    photo: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&q=70&fit=crop&auto=format',
    filter: 'sepia(0.3) saturate(1.4) brightness(1.05) contrast(1.1) hue-rotate(5deg)',
  },
  fuji: {
    photo: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=300&q=70&fit=crop&auto=format',
    filter: 'saturate(1.15) brightness(1.05) contrast(1.05) hue-rotate(-10deg)',
  },
  portra: {
    photo: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=300&q=70&fit=crop&auto=format',
    filter: 'sepia(0.12) saturate(0.85) brightness(1.12) contrast(0.93)',
  },
  ilford: {
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=70&fit=crop&auto=format',
    filter: 'grayscale(1) contrast(1.35) brightness(0.95)',
  },
  cinestill: {
    photo: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=300&q=70&fit=crop&auto=format',
    filter: 'saturate(0.7) brightness(0.78) contrast(1.25) hue-rotate(220deg)',
  },
  lomo: {
    photo: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=300&q=70&fit=crop&auto=format',
    filter: 'saturate(1.7) contrast(1.5) brightness(0.85) hue-rotate(15deg)',
  },

  // ── Era & Decade ────────────────────────────────────────────
  super8: {
    photo: 'https://images.unsplash.com/photo-1511988617509-a57c8a288659?w=300&q=70&fit=crop&auto=format',
    filter: 'sepia(0.5) saturate(1.2) contrast(1.1) brightness(1.0) hue-rotate(10deg)',
  },
  vhs: {
    photo: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&q=70&fit=crop&auto=format',
    filter: 'saturate(0.55) contrast(1.4) brightness(0.85) hue-rotate(210deg)',
  },
  nineties: {
    photo: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&q=70&fit=crop&auto=format',
    filter: 'saturate(0.8) contrast(0.9) brightness(1.18) sepia(0.12)',
  },
  y2k: {
    photo: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=300&q=70&fit=crop&auto=format',
    filter: 'saturate(1.4) contrast(1.3) brightness(1.05) hue-rotate(270deg)',
  },
  polaroid: {
    photo: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=300&q=70&fit=crop&auto=format',
    filter: 'sepia(0.2) saturate(0.75) brightness(1.2) contrast(0.85)',
  },

  // ── Mood & Light ────────────────────────────────────────────
  golden: {
    photo: 'https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=300&q=70&fit=crop&auto=format',
    filter: 'sepia(0.35) saturate(1.6) brightness(1.1) contrast(1.05) hue-rotate(15deg)',
  },
  bluehour: {
    photo: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=300&q=70&fit=crop&auto=format',
    filter: 'saturate(1.1) brightness(0.72) contrast(1.2) hue-rotate(205deg)',
  },
  neonnoir: {
    photo: 'https://images.unsplash.com/photo-1542319630-dd4e9c4b7d3e?w=300&q=70&fit=crop&auto=format',
    filter: 'saturate(2.0) brightness(0.6) contrast(1.6) hue-rotate(300deg)',
  },
  softdream: {
    photo: 'https://images.unsplash.com/photo-1490750967868-88df5691b9e3?w=300&q=70&fit=crop&auto=format',
    filter: 'saturate(0.7) brightness(1.25) contrast(0.8) blur(0.4px)',
  },
  harsh: {
    photo: 'https://images.unsplash.com/photo-1504276048855-f3d60e69632f?w=300&q=70&fit=crop&auto=format',
    filter: 'grayscale(0.5) contrast(1.7) brightness(0.85) saturate(0.4)',
  },
  desert: {
    photo: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=300&q=70&fit=crop&auto=format',
    filter: 'sepia(0.4) saturate(0.85) brightness(1.15) contrast(1.05)',
  },

  // ── Event-Specific ──────────────────────────────────────────
  weddingf: {
    photo: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=300&q=70&fit=crop&auto=format',
    filter: 'saturate(0.65) brightness(1.22) contrast(0.88) sepia(0.1)',
  },
  nightclub: {
    photo: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300&q=70&fit=crop&auto=format',
    filter: 'saturate(2.2) brightness(0.55) contrast(1.7) hue-rotate(280deg)',
  },
  sportsf: {
    photo: 'https://images.unsplash.com/photo-1471295253337-3ceaaedca402?w=300&q=70&fit=crop&auto=format',
    filter: 'saturate(1.4) contrast(1.45) brightness(1.05)',
  },
  festivalf: {
    photo: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=300&q=70&fit=crop&auto=format',
    filter: 'saturate(1.6) contrast(1.2) brightness(1.0) hue-rotate(20deg)',
  },

  // ── Experimental ────────────────────────────────────────────
  doubleexp: {
    photo: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=300&q=70&fit=crop&auto=format',
    filter: 'saturate(0.4) brightness(1.35) contrast(1.2) opacity(0.85)',
  },
  lightleak: {
    photo: 'https://images.unsplash.com/photo-1527766833261-b09c3163a791?w=300&q=70&fit=crop&auto=format',
    filter: 'saturate(1.5) brightness(1.2) contrast(1.1) sepia(0.2)',
  },
  cross: {
    photo: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=300&q=70&fit=crop&auto=format',
    filter: 'saturate(2.8) contrast(1.6) hue-rotate(90deg) brightness(0.88)',
  },
  glitch: {
    photo: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=300&q=70&fit=crop&auto=format',
    filter: 'saturate(3.0) contrast(1.9) hue-rotate(180deg) brightness(0.7)',
  },
  infrared: {
    photo: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=300&q=70&fit=crop&auto=format',
    filter: 'saturate(0.2) brightness(1.35) contrast(1.5) hue-rotate(90deg) invert(0.12)',
  },
}
