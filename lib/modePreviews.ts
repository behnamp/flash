// Real photo previews for each photo mode
// Photos from Unsplash (free to use)
// CSS filters simulate the film look

export const MODE_PREVIEWS: Record<string, { photo: string; filter: string; credit: string }> = {
  // Film Emulation
  'kodak': {
    photo: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&q=80',
    filter: 'sepia(0.25) saturate(1.4) brightness(1.05) contrast(1.1) hue-rotate(5deg)',
    credit: 'Unsplash'
  },
  'fuji': {
    photo: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&q=80',
    filter: 'saturate(1.15) brightness(1.05) contrast(1.05) hue-rotate(-10deg)',
    credit: 'Unsplash'
  },
  'portra': {
    photo: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&q=80',
    filter: 'sepia(0.12) saturate(0.9) brightness(1.1) contrast(0.95)',
    credit: 'Unsplash'
  },
  'ilford': {
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
    filter: 'grayscale(1) contrast(1.3) brightness(0.95)',
    credit: 'Unsplash'
  },
  'cinestill': {
    photo: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&q=80',
    filter: 'saturate(0.75) brightness(0.82) contrast(1.2) hue-rotate(230deg)',
    credit: 'Unsplash'
  },
  'lomo': {
    photo: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&q=80',
    filter: 'saturate(1.6) contrast(1.5) brightness(0.88) hue-rotate(15deg)',
    credit: 'Unsplash'
  },
  // Era & Decade
  'super8': {
    photo: 'https://images.unsplash.com/photo-1511988617509-a57c8a288659?w=400&q=80',
    filter: 'sepia(0.55) saturate(1.2) brightness(1.0) contrast(1.1) hue-rotate(10deg)',
    credit: 'Unsplash'
  },
  'vhs': {
    photo: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&q=80',
    filter: 'saturate(0.6) contrast(1.4) brightness(0.88) hue-rotate(210deg)',
    credit: 'Unsplash'
  },
  'nineties': {
    photo: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80',
    filter: 'saturate(0.85) contrast(0.9) brightness(1.15) sepia(0.1)',
    credit: 'Unsplash'
  },
  'y2k': {
    photo: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80',
    filter: 'saturate(1.3) contrast(1.25) brightness(1.05) hue-rotate(280deg)',
    credit: 'Unsplash'
  },
  'polaroid': {
    photo: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&q=80',
    filter: 'sepia(0.2) saturate(0.8) brightness(1.18) contrast(0.88)',
    credit: 'Unsplash'
  },
  // Mood
  'golden': {
    photo: 'https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=400&q=80',
    filter: 'sepia(0.3) saturate(1.5) brightness(1.1) contrast(1.05) hue-rotate(15deg)',
    credit: 'Unsplash'
  },
  'bluehour': {
    photo: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=400&q=80',
    filter: 'saturate(1.1) brightness(0.78) contrast(1.15) hue-rotate(200deg)',
    credit: 'Unsplash'
  },
  'neonnoir': {
    photo: 'https://images.unsplash.com/photo-1542319630-dd4e9c4b7d3e?w=400&q=80',
    filter: 'saturate(1.8) brightness(0.65) contrast(1.5) hue-rotate(300deg)',
    credit: 'Unsplash'
  },
  'softdream': {
    photo: 'https://images.unsplash.com/photo-1490750967868-88df5691b9e3?w=400&q=80',
    filter: 'saturate(0.75) brightness(1.2) contrast(0.82) blur(0.4px)',
    credit: 'Unsplash'
  },
  'harsh': {
    photo: 'https://images.unsplash.com/photo-1504276048855-f3d60e69632f?w=400&q=80',
    filter: 'grayscale(0.4) contrast(1.6) brightness(0.88) saturate(0.5)',
    credit: 'Unsplash'
  },
  'desert': {
    photo: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=400&q=80',
    filter: 'sepia(0.4) saturate(0.9) brightness(1.12) contrast(1.05)',
    credit: 'Unsplash'
  },
  // Event-Specific
  'weddingf': {
    photo: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&q=80',
    filter: 'saturate(0.7) brightness(1.18) contrast(0.9) sepia(0.08)',
    credit: 'Unsplash'
  },
  'nightclub': {
    photo: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&q=80',
    filter: 'saturate(2.0) brightness(0.6) contrast(1.6) hue-rotate(280deg)',
    credit: 'Unsplash'
  },
  'sportsf': {
    photo: 'https://images.unsplash.com/photo-1471295253337-3ceaaedca402?w=400&q=80',
    filter: 'saturate(1.3) contrast(1.4) brightness(1.05)',
    credit: 'Unsplash'
  },
  'festivalf': {
    photo: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&q=80',
    filter: 'saturate(1.5) contrast(1.2) brightness(1.0) hue-rotate(20deg)',
    credit: 'Unsplash'
  },
  // Experimental
  'doubleexp': {
    photo: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=400&q=80',
    filter: 'saturate(0.5) brightness(1.3) contrast(1.2) opacity(0.85)',
    credit: 'Unsplash'
  },
  'lightleak': {
    photo: 'https://images.unsplash.com/photo-1527766833261-b09c3163a791?w=400&q=80',
    filter: 'saturate(1.4) brightness(1.15) contrast(1.1) sepia(0.15)',
    credit: 'Unsplash'
  },
  'cross': {
    photo: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=400&q=80',
    filter: 'saturate(2.5) contrast(1.5) hue-rotate(90deg) brightness(0.9)',
    credit: 'Unsplash'
  },
  'glitch': {
    photo: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&q=80',
    filter: 'saturate(3.0) contrast(1.8) hue-rotate(180deg) brightness(0.75)',
    credit: 'Unsplash'
  },
  'infrared': {
    photo: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&q=80',
    filter: 'saturate(0.3) brightness(1.3) contrast(1.4) hue-rotate(90deg) invert(0.15)',
    credit: 'Unsplash'
  },
}
