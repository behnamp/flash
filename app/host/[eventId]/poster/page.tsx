'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import QRCode from 'qrcode'

type Template = 'dark' | 'light' | 'tent'

const TEMPLATES: { id: Template; label: string; sub: string }[] = [
  { id: 'dark', label: 'Poster', sub: 'Dark · luxe' },
  { id: 'light', label: 'Minimal', sub: 'White · clean' },
  { id: 'tent', label: 'Table tent', sub: 'Foldable' },
]

export default function PosterPage() {
  const params = useParams()
  const router = useRouter()
  const code = (params.eventId as string)
  const supabase = createClient()

  const [event, setEvent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [template, setTemplate] = useState<Template>('dark')
  const [qrDataUrl, setQrDataUrl] = useState<string>('')
  const [downloading, setDownloading] = useState(false)
  const [toast, setToast] = useState('')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const joinUrl = typeof window !== 'undefined' && event ? `${window.location.origin}/join/${event.join_code}` : ''

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data: ev } = await supabase.from('events').select('id, name, join_code, venue, event_date, cover_emoji, brand_color').eq('id', code).single()
      if (!ev) { router.push('/host'); return }
      setEvent(ev)
      setLoading(false)
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code])

  // Generate QR whenever event ready
  useEffect(() => {
    if (!event) return
    const url = `${window.location.origin}/join/${event.join_code}`
    QRCode.toDataURL(url, { errorCorrectionLevel: 'H', margin: 1, width: 600, color: { dark: '#0a0a0aff', light: '#ffffffff' } })
      .then(setQrDataUrl).catch(() => {})
  }, [event])

  const showMsg = (m: string) => { setToast(m); setTimeout(() => setToast(''), 2200) }

  // ── Draw poster onto a high-res canvas ──
  const draw = useCallback(async (tpl: Template): Promise<HTMLCanvasElement | null> => {
    if (!event || !qrDataUrl) return null
    await (document as any).fonts?.ready

    const W = 1080, H = tpl === 'tent' ? 1528 : 1350
    const S = 2 // supersample for print
    const canvas = document.createElement('canvas')
    canvas.width = W * S; canvas.height = H * S
    const ctx = canvas.getContext('2d')!
    ctx.scale(S, S)

    const accent = event.brand_color || '#e8ff47'
    const dark = tpl === 'light' ? '#ffffff' : '#0a0a0a'
    const ink = tpl === 'light' ? '#0a0a0a' : '#f0f0f0'
    const dim = tpl === 'light' ? '#888' : '#666'

    const qrImg = await loadImg(qrDataUrl)

    const drawPanel = (oy: number, ph: number, flip = false) => {
      ctx.save()
      if (flip) { ctx.translate(W, oy + ph); ctx.rotate(Math.PI) ; ctx.translate(0, -oy) }
      // bg
      ctx.fillStyle = dark
      ctx.fillRect(0, oy, W, ph)

      const cx = W / 2
      let y = oy + (tpl === 'tent' ? 70 : 120)

      // Flash bolt + wordmark
      const boltSize = 56
      roundRect(ctx, cx - boltSize / 2 - 70, y, boltSize, boltSize, 16)
      ctx.fillStyle = accent; ctx.fill()
      // bolt glyph
      ctx.save()
      ctx.translate(cx - boltSize / 2 - 70 + boltSize / 2, y + boltSize / 2)
      ctx.fillStyle = '#0a0a0a'
      boltPath(ctx, boltSize * 0.5)
      ctx.fill()
      ctx.restore()
      ctx.fillStyle = ink
      ctx.font = '700 40px "Space Grotesk", sans-serif'
      ctx.textBaseline = 'middle'; ctx.textAlign = 'left'
      ctx.fillText('Flash', cx - boltSize / 2 - 70 + boltSize + 16, y + boltSize / 2 + 2)

      y += boltSize + (tpl === 'tent' ? 44 : 70)

      // Headline
      ctx.textAlign = 'center'
      ctx.fillStyle = ink
      ctx.font = `800 ${tpl === 'tent' ? 66 : 84}px "Space Grotesk", sans-serif`
      ctx.fillText('SCAN TO JOIN', cx, y)
      y += (tpl === 'tent' ? 50 : 64)
      ctx.fillStyle = accent
      ctx.font = '700 26px "Space Mono", monospace'
      ctx.fillText('THE DISPOSABLE CAMERA', cx, y)
      y += (tpl === 'tent' ? 56 : 80)

      // QR white card
      const qrCard = tpl === 'tent' ? 360 : 480
      const cardPad = 36
      const cardX = cx - (qrCard + cardPad * 2) / 2
      roundRect(ctx, cardX, y, qrCard + cardPad * 2, qrCard + cardPad * 2, 28)
      ctx.fillStyle = '#ffffff'; ctx.shadowColor = 'rgba(0,0,0,0.4)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 12
      ctx.fill(); ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0
      ctx.drawImage(qrImg, cardX + cardPad, y + cardPad, qrCard, qrCard)
      y += qrCard + cardPad * 2 + (tpl === 'tent' ? 40 : 60)

      // Join code
      ctx.fillStyle = dim
      ctx.font = '700 20px "Space Mono", monospace'
      ctx.fillText('OR ENTER CODE', cx, y)
      y += (tpl === 'tent' ? 38 : 46)
      ctx.fillStyle = ink
      ctx.font = `700 ${tpl === 'tent' ? 52 : 64}px "Space Mono", monospace`
      // letter-spaced code
      drawSpaced(ctx, event.join_code, cx, y, tpl === 'tent' ? 8 : 12)
      y += (tpl === 'tent' ? 56 : 76)

      // Event name
      if (event.name?.trim()) {
        ctx.fillStyle = ink
        ctx.font = `600 ${tpl === 'tent' ? 30 : 38}px "Space Grotesk", sans-serif`
        ctx.fillText(truncate(ctx, event.name.trim(), W - 160), cx, y)
        y += (tpl === 'tent' ? 38 : 48)
      }
      // Footer
      ctx.fillStyle = dim
      ctx.font = '500 22px "Space Grotesk", sans-serif'
      ctx.fillText('No app needed · flashcam.app', cx, y)

      // accent divider line
      ctx.fillStyle = accent
      ctx.fillRect(cx - 30, oy + ph - 60, 60, 4)
      ctx.restore()
    }

    if (tpl === 'tent') {
      // Two mirrored panels for a fold-in-half table tent
      drawPanel(0, H / 2, true)         // top (upside-down)
      drawPanel(H / 2, H / 2, false)    // bottom (upright)
      // fold line
      ctx.strokeStyle = tpl === 'tent' ? 'rgba(255,255,255,0.15)' : '#ccc'
      ctx.setLineDash([8, 8]); ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2); ctx.stroke(); ctx.setLineDash([])
    } else {
      drawPanel(0, H, false)
    }
    return canvas
  }, [event, qrDataUrl])

  // Re-render preview when template or data changes
  useEffect(() => {
    if (!event || !qrDataUrl) return
    draw(template).then(c => {
      if (!c || !canvasRef.current) return
      const prev = canvasRef.current
      prev.width = c.width; prev.height = c.height
      prev.getContext('2d')!.drawImage(c, 0, 0)
    })
  }, [template, event, qrDataUrl, draw])

  const download = async () => {
    setDownloading(true)
    try {
      const c = await draw(template)
      if (!c) return
      const a = document.createElement('a')
      a.href = c.toDataURL('image/png')
      a.download = `flash-${event.join_code}-${template}.png`
      a.click()
      showMsg('Poster downloaded ✓')
    } finally { setDownloading(false) }
  }

  const printPoster = async () => {
    const c = await draw(template)
    if (!c) return
    const url = c.toDataURL('image/png')
    const w = window.open('', '_blank')
    if (!w) return
    w.document.write(`<html><head><title>Flash Poster</title><style>@page{margin:0}body{margin:0;display:flex;align-items:center;justify-content:center;height:100vh}img{max-width:100%;max-height:100%}</style></head><body><img src="${url}" onload="window.print()"/></body></html>`)
    w.document.close()
  }

  if (loading) return (
    <main style={{ height: '100dvh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 2, height: 32, background: '#e8ff47', animation: 'blink 1s ease-in-out infinite' }} />
      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:.15}}`}</style>
    </main>
  )

  return (
    <main style={{ minHeight: '100dvh', background: '#0a0a0a', display: 'flex', flexDirection: 'column', fontFamily: "'Space Grotesk', sans-serif" }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 'max(14px, env(safe-area-inset-top))', paddingBottom: 14, paddingLeft: 16, paddingRight: 16, borderBottom: '1px solid #161616', position: 'sticky', top: 0, background: 'rgba(10,10,10,0.96)', backdropFilter: 'blur(20px)', zIndex: 20 }}>
        <button onClick={() => router.push(`/host/${code}`)} style={{ width: 38, height: 38, background: '#161616', border: 'none', borderRadius: 11, color: '#f0f0f0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#f0f0f0' }}>Scan poster</div>
      </div>

      {/* Preview */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 16px 12px' }}>
        <div style={{ width: '100%', maxWidth: 360, borderRadius: 16, overflow: 'hidden', boxShadow: '0 12px 48px rgba(0,0,0,0.5)', border: '1px solid #1a1a1a' }}>
          <canvas ref={canvasRef} style={{ width: '100%', height: 'auto', display: 'block' }} />
        </div>

        {/* Template picker */}
        <div style={{ display: 'flex', gap: 8, marginTop: 18, width: '100%', maxWidth: 360 }}>
          {TEMPLATES.map(t => (
            <button key={t.id} onClick={() => setTemplate(t.id)}
              style={{ flex: 1, background: template === t.id ? 'rgba(232,255,71,0.1)' : '#141414', border: `1px solid ${template === t.id ? '#e8ff47' : '#222'}`, borderRadius: 12, padding: '12px 6px', cursor: 'pointer', fontFamily: 'inherit' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: template === t.id ? '#e8ff47' : '#f0f0f0' }}>{t.label}</div>
              <div style={{ fontSize: 10, color: '#555', marginTop: 2 }}>{t.sub}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div style={{ padding: '12px 16px', paddingBottom: 'max(16px, calc(env(safe-area-inset-bottom) + 12px))', borderTop: '1px solid #161616', background: '#0a0a0a', display: 'flex', gap: 10 }}>
        <button onClick={printPoster}
          style={{ flex: 1, background: '#161616', color: '#f0f0f0', border: '1px solid #2a2a2a', borderRadius: 14, padding: '16px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z"/></svg>
          Print
        </button>
        <button onClick={download} disabled={downloading}
          style={{ flex: 2, background: '#e8ff47', color: '#0a0a0a', border: 'none', borderRadius: 14, padding: '16px', fontSize: 15, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
          {downloading ? 'Saving...' : 'Download PNG'}
        </button>
      </div>

      {toast && (
        <div style={{ position: 'fixed', bottom: 100, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)', borderRadius: 20, padding: '10px 20px', fontSize: 13, fontWeight: 600, color: '#fff', zIndex: 200, whiteSpace: 'nowrap' }}>{toast}</div>
      )}
    </main>
  )
}

/* ── canvas helpers ── */
function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src })
}
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}
function boltPath(ctx: CanvasRenderingContext2D, size: number) {
  // Centered lightning bolt, roughly within [-size/2, size/2]
  const s = size / 24
  ctx.beginPath()
  const pts = [[13,2],[4.5,13.5],[11,13.5],[10,22],[20,10],[13.5,10],[13,2]]
  pts.forEach(([px, py], i) => {
    const x = (px - 12) * s, y = (py - 12) * s
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
  })
  ctx.closePath()
}
function drawSpaced(ctx: CanvasRenderingContext2D, text: string, cx: number, y: number, gap: number) {
  const widths = [...text].map(ch => ctx.measureText(ch).width)
  const total = widths.reduce((a, b) => a + b, 0) + gap * (text.length - 1)
  let x = cx - total / 2
  ctx.textAlign = 'left'
  for (let i = 0; i < text.length; i++) { ctx.fillText(text[i], x, y); x += widths[i] + gap }
  ctx.textAlign = 'center'
}
function truncate(ctx: CanvasRenderingContext2D, text: string, maxW: number): string {
  if (ctx.measureText(text).width <= maxW) return text
  let t = text
  while (t.length > 1 && ctx.measureText(t + '…').width > maxW) t = t.slice(0, -1)
  return t + '…'
}
