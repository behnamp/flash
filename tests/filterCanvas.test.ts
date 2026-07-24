// @vitest-environment jsdom
import { describe, it, expect, beforeAll } from 'vitest'
import { CANVAS_FILTERS, applyFilterToCanvas } from '@/lib/filterCanvas'
import { ALL_MODES } from '@/constants/photoModes'

describe('CANVAS_FILTERS', () => {
  it('defines a filter string for every active photo mode', () => {
    for (const mode of ALL_MODES) {
      const preset = CANVAS_FILTERS[mode.id]
      expect(preset, `missing filter preset for mode "${mode.id}"`).toBeDefined()
      expect(typeof preset.filter).toBe('string')
      expect(preset.filter.length).toBeGreaterThan(0)
    }
  })

  it('only ever attaches a function for post-processing fx', () => {
    for (const [id, preset] of Object.entries(CANVAS_FILTERS)) {
      if (preset.fx !== undefined) {
        expect(typeof preset.fx, `fx for "${id}" must be a function`).toBe('function')
      }
    }
  })
})

describe('applyFilterToCanvas', () => {
  // jsdom's canvas lacks a real 2D backend; provide a minimal stub so the
  // resize/draw math can be exercised without a headless browser.
  beforeAll(() => {
    const proto = HTMLCanvasElement.prototype as any
    proto.getContext = function () {
      return {
        filter: 'none',
        drawImage: () => {},
        getImageData: (_x: number, _y: number, w: number, h: number) => ({
          data: new Uint8ClampedArray(w * h * 4), width: w, height: h,
        }),
        putImageData: () => {},
        createRadialGradient: () => ({ addColorStop: () => {} }),
        fillRect: () => {}, fillText: () => {}, beginPath: () => {},
        moveTo: () => {}, lineTo: () => {}, closePath: () => {}, fill: () => {},
        save: () => {}, restore: () => {}, translate: () => {}, scale: () => {},
        roundRect: () => {},
        set globalCompositeOperation(_v: string) {}, get globalCompositeOperation() { return 'source-over' },
        set fillStyle(_v: any) {}, get fillStyle() { return '#000' },
        set font(_v: string) {}, get font() { return '' },
        set textBaseline(_v: string) {}, get textBaseline() { return 'alphabetic' },
      }
    }
    proto.toBlob = function (cb: (b: Blob | null) => void) {
      cb(new Blob(['x'], { type: 'image/jpeg' }))
    }
  })

  it('caps output dimensions at 2048px on the long side, preserving aspect ratio', async () => {
    const src = document.createElement('canvas')
    src.width = 4096
    src.height = 2048
    // Spy on the output canvas the function creates internally
    const created: HTMLCanvasElement[] = []
    const realCreate = document.createElement.bind(document)
    ;(document as any).createElement = (tag: string) => {
      const el = realCreate(tag)
      if (tag === 'canvas') created.push(el as HTMLCanvasElement)
      return el
    }
    try {
      const blob = await applyFilterToCanvas(src, 'kodak', 0.9)
      expect(blob).toBeInstanceOf(Blob)
      const out = created[created.length - 1]
      // 4096x2048 scaled so long side = 2048 → 2048x1024
      expect(out.width).toBe(2048)
      expect(out.height).toBe(1024)
    } finally {
      ;(document as any).createElement = realCreate
    }
  })

  it('leaves already-small images unscaled', async () => {
    const src = document.createElement('canvas')
    src.width = 800
    src.height = 600
    const created: HTMLCanvasElement[] = []
    const realCreate = document.createElement.bind(document)
    ;(document as any).createElement = (tag: string) => {
      const el = realCreate(tag)
      if (tag === 'canvas') created.push(el as HTMLCanvasElement)
      return el
    }
    try {
      await applyFilterToCanvas(src, 'ilford', 0.9)
      const out = created[created.length - 1]
      expect(out.width).toBe(800)
      expect(out.height).toBe(600)
    } finally {
      ;(document as any).createElement = realCreate
    }
  })
})
