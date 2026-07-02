// Apply film-mode filter to a canvas frame using Canvas 2D API
// Runs 100% in the browser — free, instant, no API needed

export type FilterMode = {
  id: string
  name: string
  // Canvas filter string
  filter?: string
  // Post-processing fn for effects not possible with CSS filter
  fx?: (ctx: CanvasRenderingContext2D, w: number, h: number) => void
}

// Map our mode IDs to canvas filter strings + post-fx
export const CANVAS_FILTERS: Record<string, { filter: string; fx?: (ctx: CanvasRenderingContext2D, w: number, h: number) => void }> = {
  // Film Emulation
  kodak:     { filter: 'sepia(0.25) saturate(1.4) brightness(1.05) contrast(1.1) hue-rotate(5deg)' },
  fuji:      { filter: 'saturate(1.15) brightness(1.05) contrast(1.05) hue-rotate(-10deg)' },
  portra:    { filter: 'sepia(0.12) saturate(0.9) brightness(1.1) contrast(0.95)' },
  ilford:    { filter: 'grayscale(1) contrast(1.35) brightness(0.95)' },
  cinestill: { filter: 'saturate(0.75) brightness(0.82) contrast(1.2) hue-rotate(230deg)' },
  lomo:      { filter: 'saturate(1.6) contrast(1.5) brightness(0.88) hue-rotate(15deg)',
               fx: vignette(0.75) },

  // Era
  super8:    { filter: 'sepia(0.55) saturate(1.2) contrast(1.1) hue-rotate(10deg)' },
  vhs:       { filter: 'saturate(0.6) contrast(1.4) brightness(0.88) hue-rotate(210deg)' },
  nineties:  { filter: 'saturate(0.85) contrast(0.9) brightness(1.15) sepia(0.1)' },
  y2k:       { filter: 'saturate(1.3) contrast(1.25) brightness(1.05) hue-rotate(280deg)' },
  polaroid:  { filter: 'sepia(0.2) saturate(0.8) brightness(1.18) contrast(0.88)' },

  // Mood
  golden:    { filter: 'sepia(0.3) saturate(1.5) brightness(1.1) contrast(1.05) hue-rotate(15deg)' },
  bluehour:  { filter: 'saturate(1.1) brightness(0.78) contrast(1.15) hue-rotate(200deg)' },
  neonnoir:  { filter: 'saturate(1.8) brightness(0.65) contrast(1.5) hue-rotate(300deg)',
               fx: vignette(0.9) },
  softdream: { filter: 'saturate(0.75) brightness(1.2) contrast(0.82) blur(0.5px)' },
  harsh:     { filter: 'grayscale(0.4) contrast(1.6) brightness(0.88) saturate(0.5)' },
  desert:    { filter: 'sepia(0.4) saturate(0.9) brightness(1.12) contrast(1.05)' },

  // Event-specific
  weddingf:  { filter: 'saturate(0.7) brightness(1.18) contrast(0.9) sepia(0.08)' },
  nightclub: { filter: 'saturate(2.0) brightness(0.6) contrast(1.6) hue-rotate(280deg)',
               fx: vignette(0.85) },
  sportsf:   { filter: 'saturate(1.3) contrast(1.4) brightness(1.05)' },
  festivalf: { filter: 'saturate(1.5) contrast(1.2) hue-rotate(20deg)' },

  // Experimental
  doubleexp: { filter: 'saturate(0.5) brightness(1.3) contrast(1.2)',
               fx: grain(0.04) },
  lightleak: { filter: 'saturate(1.4) brightness(1.15) contrast(1.1) sepia(0.15)',
               fx: lightLeak() },
  cross:     { filter: 'saturate(2.5) contrast(1.5) hue-rotate(90deg) brightness(0.9)' },
  glitch:    { filter: 'saturate(3.0) contrast(1.8) hue-rotate(180deg) brightness(0.75)',
               fx: glitchFx() },
  infrared:  { filter: 'saturate(0.3) brightness(1.3) contrast(1.4) hue-rotate(90deg) invert(0.1)' },
}

// Post-processing effects
function vignette(strength: number) {
  return (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    const gradient = ctx.createRadialGradient(w/2, h/2, h*0.3, w/2, h/2, h*0.75)
    gradient.addColorStop(0, 'rgba(0,0,0,0)')
    gradient.addColorStop(1, `rgba(0,0,0,${strength})`)
    ctx.globalCompositeOperation = 'multiply'
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, w, h)
    ctx.globalCompositeOperation = 'source-over'
  }
}

function grain(intensity: number) {
  return (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    const imageData = ctx.getImageData(0, 0, w, h)
    const data = imageData.data
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * intensity * 255
      data[i]     = Math.min(255, Math.max(0, data[i] + noise))
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise))
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise))
    }
    ctx.putImageData(imageData, 0, 0)
  }
}

function lightLeak() {
  return (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    // Orange/red glow in top-left corner
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, w * 0.6)
    g.addColorStop(0, 'rgba(255,140,0,0.35)')
    g.addColorStop(0.5, 'rgba(255,60,0,0.15)')
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.globalCompositeOperation = 'screen'
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
    ctx.globalCompositeOperation = 'source-over'
  }
}

function glitchFx() {
  return (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    // Shift red channel slightly
    const imageData = ctx.getImageData(0, 0, w, h)
    const data = imageData.data
    const shift = Math.floor(w * 0.008)
    for (let y = 0; y < h; y++) {
      for (let x = shift; x < w; x++) {
        const src = (y * w + x) * 4
        const dst = (y * w + (x - shift)) * 4
        data[dst] = data[src]  // shift red channel left
      }
    }
    ctx.putImageData(imageData, 0, 0)
  }
}

/**
 * Apply a filter mode to a canvas and return a Blob
 */
export async function applyFilterToCanvas(
  sourceCanvas: HTMLCanvasElement,
  modeId: string,
  quality = 0.88,
  watermark = false
): Promise<Blob> {
  const preset = CANVAS_FILTERS[modeId]

  // If no filter or it's the default mode, just return as-is
  if (!preset || modeId === 'kodak') {
    // Still apply kodak since it's our default
  }

  // Cap at 2048px on longest side to keep file sizes reasonable
  const MAX = 2048
  const srcW = sourceCanvas.width
  const srcH = sourceCanvas.height
  const scale = (srcW > MAX || srcH > MAX) ? Math.min(MAX / srcW, MAX / srcH) : 1
  const w = Math.round(srcW * scale)
  const h = Math.round(srcH * scale)

  // Create output canvas
  const out = document.createElement('canvas')
  out.width = w
  out.height = h
  const ctx = out.getContext('2d')!

  // Apply CSS filter via canvas filter property
  if (preset?.filter) {
    ctx.filter = preset.filter
  }

  // Draw source image with filter applied
  ctx.drawImage(sourceCanvas, 0, 0)

  // Reset filter before post-fx
  ctx.filter = 'none'

  // Apply post-processing effects (grain, vignette, light leaks, glitch)
  if (preset?.fx) {
    preset.fx(ctx, w, h)
  }

  // Watermark for free tier — baked into image before upload
  if (watermark) {
    const pad = Math.round(w * 0.03)
    const logoSize = Math.round(w * 0.055)
    const fontSize = Math.round(w * 0.032)
    const barH = logoSize + pad * 2

    // Frosted bar at bottom
    ctx.fillStyle = 'rgba(0,0,0,0.52)'
    ctx.fillRect(0, h - barH, w, barH)

    // Flash bolt SVG path drawn on canvas
    const bx = pad
    const by = h - barH + pad
    const bs = logoSize

    // Yellow circle background
    ctx.fillStyle = '#ffb800'
    ctx.beginPath()
    ctx.roundRect(bx, by, bs, bs, bs * 0.22)
    ctx.fill()

    // Bolt path (scaled to logoSize)
    const sx = bx / bs
    const sy = by / bs
    ctx.fillStyle = '#0a0a0a'
    ctx.save()
    ctx.translate(bx, by)
    ctx.scale(bs / 24, bs / 24)
    ctx.beginPath()
    ctx.moveTo(13, 2)
    ctx.lineTo(4.5, 13.5)
    ctx.lineTo(11, 13.5)
    ctx.lineTo(10, 22)
    ctx.lineTo(20, 10)
    ctx.lineTo(13.5, 10)
    ctx.lineTo(13, 2)
    ctx.closePath()
    ctx.fill()
    ctx.restore()

    // "flashcam.app" text
    ctx.fillStyle = 'rgba(255,255,255,0.85)'
    ctx.font = `700 ${fontSize}px "Space Mono", monospace`
    ctx.textBaseline = 'middle'
    ctx.fillText('flashcam.app', bx + bs + pad, h - barH / 2)
  }

  // Return as JPEG blob
  return new Promise<Blob>((resolve, reject) => {
    out.toBlob(
      (blob) => blob ? resolve(blob) : reject(new Error('Canvas toBlob failed')),
      'image/jpeg',
      quality
    )
  })
}
