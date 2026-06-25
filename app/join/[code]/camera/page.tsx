'use client'
import { useState, useRef, useCallback, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ALL_MODES } from '@/constants/photoModes'
import { applyFilterToCanvas, CANVAS_FILTERS } from '@/lib/filterCanvas'

export default function CameraPage() {
  const params = useParams()
  const router = useRouter()
  const code = params.code as string
  const supabase = createClient()

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const toastRef = useRef<NodeJS.Timeout | undefined>(undefined)

  const [event, setEvent] = useState<any>(null)
  const [guest, setGuestData] = useState<any>(null)
  const [shotsUsed, setShotsUsed] = useState(0)
  const [shotLimit, setShotLimit] = useState(10)
  const [flashing, setFlashing] = useState(false)
  const [cameraReady, setCameraReady] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')
  const [uploading, setUploading] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [torchOn, setTorchOn] = useState(false)
  const [torchSupported, setTorchSupported] = useState(false)
  const [toast, setToast] = useState('')
  const [showToast, setShowToast] = useState(false)

  const filter = ALL_MODES[0] // Kodak Gold always

  useEffect(() => {
    async function load() {
      const { data: ev } = await supabase.from('events').select('*').eq('join_code', code.toUpperCase()).single()
      if (!ev) { router.push(`/join/${code}`); return }
      setEvent(ev); setShotLimit(ev.shot_limit || 10)
      const stored = localStorage.getItem(`flash_guest_${ev.id}`)
      if (!stored) { router.push(`/join/${code}`); return }
      const g = JSON.parse(stored); setGuestData(g)
      const { count } = await supabase.from('shots')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', ev.id).eq('guest_id', g.id)
      setShotsUsed(count || 0)
    }
    load()
  }, [code])

  const startCamera = async (facing: 'user' | 'environment') => {
    // Stop any existing stream first
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => { try { t.stop() } catch {} })
      streamRef.current = null
    }
    if (videoRef.current) videoRef.current.srcObject = null
    setCameraReady(false)
    setCameraError('')

    // Try progressively simpler constraints — Safari is strict about what it accepts
    const attempts = [
      { facingMode: { exact: facing }, width: { ideal: 3840 }, height: { ideal: 2160 } },
      { facingMode: facing, width: { ideal: 1920 }, height: { ideal: 1080 } },
      { facingMode: facing },
      {},
    ]

    for (const videoConstraints of attempts) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: videoConstraints, audio: false })
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await new Promise<void>(resolve => {
            videoRef.current!.onloadedmetadata = () => resolve()
          })
          videoRef.current.play().catch(() => {})
          setCameraReady(true)
          // Check torch support
          const track = stream.getVideoTracks()[0]
          const caps = track.getCapabilities?.() as any
          setTorchSupported(!!(caps?.torch))
          setTorchOn(false) // reset on camera switch
        }
        return // success
      } catch (e) {
        // try next constraint set
      }
    }
    setCameraError('Camera unavailable. Please allow camera access and reload.')
  }

  useEffect(() => {
    startCamera(facingMode)
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => { try { t.stop() } catch {} })
        streamRef.current = null
      }
    }
  }, [facingMode])

  const showMsg = (msg: string) => {
    setToast(msg); setShowToast(true)
    clearTimeout(toastRef.current)
    toastRef.current = setTimeout(() => setShowToast(false), 1800)
  }

  const applyZoom = async (level: number) => {
    setZoom(level)
    const track = streamRef.current?.getVideoTracks()[0]
    if (!track) return
    const caps = track.getCapabilities?.() as any
    if (caps?.zoom) {
      const clamped = Math.max(caps.zoom.min, Math.min(level, caps.zoom.max))
      track.applyConstraints({ advanced: [{ zoom: clamped }] } as any).catch(() => {})
    } else if (videoRef.current) {
      videoRef.current.style.transform = `scale(${level})`
      videoRef.current.style.transformOrigin = 'center center'
    }
  }

  const uploadBlob = async (blob: Blob) => {
    if (!event || !guest) return
    setUploading(true)
    try {
      const fileName = `${event.id}/${guest.id}/${Date.now()}.jpg`
      const { error: upErr } = await supabase.storage.from('shots').upload(fileName, blob, { contentType: 'image/jpeg', upsert: false })
      if (upErr) throw upErr
      const { error: sErr } = await supabase.from('shots').insert({
        event_id: event.id, guest_id: guest.id, media_type: 'photo',
        storage_path: fileName, mode_id: filter.id, mode_name: filter.name,
        revealed: event.reveal_mode === 'instant',
      })
      if (sErr) throw sErr
      const newUsed = shotsUsed + 1; setShotsUsed(newUsed)
      const left = shotLimit - newUsed
      showMsg(left === 0 ? 'Film used up!' : left === 1 ? '1 shot left' : `${left} shots left`)
    } catch { showMsg('Upload failed') } finally { setUploading(false) }
  }

  const shoot = useCallback(async () => {
    if (shotsUsed >= shotLimit || !canvasRef.current || !videoRef.current || uploading || !cameraReady) return
    setFlashing(true); setTimeout(() => setFlashing(false), 100)
    const canvas = canvasRef.current; const video = videoRef.current
    // Cap at 2048px to keep file sizes reasonable while keeping detail
    const MAX = 2048
    const vw = video.videoWidth || 1920; const vh = video.videoHeight || 1080
    const scale = (vw > MAX || vh > MAX) ? Math.min(MAX / vw, MAX / vh) : 1
    canvas.width = Math.round(vw * scale); canvas.height = Math.round(vh * scale)
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const blob = await applyFilterToCanvas(canvas, filter.id, 0.88)
    await uploadBlob(blob)
  }, [shotsUsed, shotLimit, uploading, cameraReady, filter, event, guest])

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    if (shotsUsed >= shotLimit) { showMsg('No shots left!'); return }
    if (!file.type.startsWith('image/')) { showMsg('Please select an image'); return }

    setUploading(true)
    try {
      // Max dimension — keeps quality high while staying under upload limits
      const MAX_DIM = 2048

      await new Promise<void>((resolve, reject) => {
        const img = new Image()
        const url = URL.createObjectURL(file)
        img.onload = async () => {
          try {
            URL.revokeObjectURL(url)
            const canvas = canvasRef.current!

            // Scale down if larger than MAX_DIM
            let w = img.naturalWidth, h = img.naturalHeight
            if (w > MAX_DIM || h > MAX_DIM) {
              const ratio = Math.min(MAX_DIM / w, MAX_DIM / h)
              w = Math.round(w * ratio)
              h = Math.round(h * ratio)
            }
            canvas.width = w; canvas.height = h
            const ctx = canvas.getContext('2d')!
            ctx.drawImage(img, 0, 0, w, h)
            const blob = await applyFilterToCanvas(canvas, filter.id, 0.88)
            await uploadBlob(blob)
            resolve()
          } catch (err) { reject(err) }
        }
        img.onerror = () => {
          URL.revokeObjectURL(url)
          reject(new Error('Could not read image'))
        }
        // Set crossOrigin before src for HEIC compatibility
        img.crossOrigin = 'anonymous'
        img.src = url
      })
    } catch (err: any) {
      showMsg(err?.message || 'Upload failed')
      setUploading(false)
    }
    e.target.value = ''
  }

  const outOfShots = shotsUsed >= shotLimit
  const toggleTorch = async () => {
    const track = streamRef.current?.getVideoTracks()[0]
    if (!track) return
    const next = !torchOn
    try {
      await track.applyConstraints({ advanced: [{ torch: next } as any] })
      setTorchOn(next)
    } catch {
      showMsg('Torch not available')
    }
  }

  const left = Math.max(0, shotLimit - shotsUsed)
  const cssFilter = CANVAS_FILTERS[filter.id]?.filter || 'none'

  // Shots remaining display

  const ZOOM_LEVELS = [
    { label: '0.5×', value: 0.5 },
    { label: '1×', value: 1 },
    { label: '2×', value: 2 },
    { label: '3×', value: 3 },
  ]

  return (
    <main style={{
      position: 'fixed', inset: 0, background: '#000',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden', touchAction: 'manipulation',
      WebkitUserSelect: 'none', userSelect: 'none',
    }}>

      {/* ── VIEWFINDER ── */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <video ref={videoRef} autoPlay playsInline muted
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: cameraReady ? 'block' : 'none', filter: cssFilter, transition: 'filter .25s' }} />

        {/* Loading */}
        {!cameraReady && !cameraError && (
          <div style={{ position: 'absolute', inset: 0, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 2, height: 36, background: '#e8ff47', animation: 'blink 1s ease-in-out infinite' }} />
          </div>
        )}

        {/* Error */}
        {cameraError && (
          <div style={{ position: 'absolute', inset: 0, background: '#0a0a0a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, gap: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: '#555', lineHeight: 1.7 }}>{cameraError}</div>
            <button onClick={() => startCamera(facingMode)} style={{ background: '#e8ff47', color: '#000', border: 'none', borderRadius: 10, padding: '11px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Try Again</button>
          </div>
        )}

        {/* Flash */}
        {flashing && <div style={{ position: 'absolute', inset: 0, background: '#fff', opacity: 0.8, pointerEvents: 'none' }} />}

        {/* ── TOP BAR — matches Once exactly ── */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 16px', paddingTop: 'max(14px, env(safe-area-inset-top))',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.5), transparent)',
        }}>
          {/* Flash bolt icon — top left */}
          <div style={{ width: 38, height: 38, background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(12px)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.08)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#e8ff47"><path d="M13 2L4.5 13.5H11L10 22L20 10H13.5L13 2Z"/></svg>
          </div>

          {/* Event name + timer — center */}
          <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', textAlign: 'center', pointerEvents: 'none' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'white', lineHeight: 1.2 }}>{event?.name || 'Flash'}</div>
            {event?.photos_expire_at && (
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
                {Math.ceil((new Date(event.photos_expire_at).getTime() - Date.now()) / 3600000)}h left
              </div>
            )}
          </div>

          {/* QR / gallery icon — top right */}
          <button onClick={() => router.push(`/join/${code}/gallery`)}
            style={{ width: 38, height: 38, background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(12px)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer' } as any}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
            </svg>
          </button>
        </div>

        {/* Toast */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: `translate(-50%,-50%) scale(${showToast ? 1 : 0.85})`, background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(16px)', borderRadius: 20, padding: '10px 20px', fontSize: 14, fontWeight: 700, color: 'white', opacity: showToast ? 1 : 0, transition: 'all .2s', pointerEvents: 'none', whiteSpace: 'nowrap', border: '1px solid rgba(255,255,255,0.08)' }}>
          {toast}
        </div>
      </div>

      {/* ── BOTTOM CONTROLS — matches Once layout exactly ── */}
      <div style={{ background: '#0a0a0a', paddingBottom: 'max(20px, env(safe-area-inset-bottom))', flexShrink: 0, touchAction: 'none' }}>

        {/* ZOOM PILL — centered, above shutter row */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 14, paddingBottom: 4 }}>
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.07)', borderRadius: 24, padding: '3px', gap: 1 }}>
            {ZOOM_LEVELS.map(z => {
              const active = zoom === z.value
              return (
                <button key={z.value} onClick={() => applyZoom(z.value)} style={{ minWidth: 46, height: 30, borderRadius: 18, border: 'none', background: active ? '#e8ff47' : 'transparent', cursor: 'pointer', fontFamily: 'Space Mono, monospace', fontSize: 12, fontWeight: 700, color: active ? '#0a0a0a' : 'rgba(255,255,255,0.5)', transition: 'all .15s', letterSpacing: -0.3, padding: '0 10px' }}>
                  {z.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* SHUTTER ROW */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 40px 0' }}>

          {/* LEFT: Flash torch + Upload stacked */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            {/* Torch toggle */}
            <button onClick={toggleTorch}
              style={{ width: 50, height: 50, background: torchOn ? 'rgba(232,255,71,0.15)' : 'transparent', border: torchOn ? '1px solid rgba(232,255,71,0.4)' : 'none', borderRadius: 14, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, opacity: torchSupported ? 1 : 0.3, transition: 'all .2s' }}>
              {torchOn ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="#e8ff47">
                  <path d="M13 2L4.5 13.5H11L10 22L20 10H13.5L13 2Z"/>
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M13 2L4.5 13.5H11L10 22L20 10H13.5L13 2Z"/>
                </svg>
              )}
              <span style={{ fontSize: 9, color: torchOn ? '#e8ff47' : 'rgba(255,255,255,0.4)', fontFamily: 'Space Mono, monospace', fontWeight: 700, letterSpacing: 0.5 }}>
                {torchOn ? 'ON' : 'FLASH'}
              </span>
            </button>
            {/* Upload from gallery */}
            <button onClick={() => fileInputRef.current?.click()} disabled={outOfShots || uploading}
              style={{ width: 36, height: 36, background: 'transparent', border: 'none', cursor: outOfShots ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: outOfShots ? 0.2 : 0.6 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round">
                <rect x="3" y="3" width="18" height="18" rx="3"/>
                <circle cx="8.5" cy="8.5" r="1.5" fill="white" stroke="none"/>
                <polyline points="21,15 16,10 5,21"/>
              </svg>
            </button>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleGalleryUpload} style={{ display: 'none' }} />

          {/* CENTER: Shot number scroll + Shutter */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            {/* Shots remaining — clean single number */}
            <div style={{ height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 13, fontWeight: 700, color: outOfShots ? '#ff4757' : left <= 2 ? '#ffa502' : 'rgba(255,255,255,0.5)', letterSpacing: 1, textTransform: 'uppercase' }}>
                {outOfShots ? 'FULL' : `${left} LEFT`}
              </span>
            </div>

            {/* Shutter */}
            <button onClick={shoot} disabled={outOfShots || uploading || !cameraReady}
              style={{ width: 78, height: 78, borderRadius: '50%', cursor: outOfShots || uploading ? 'not-allowed' : 'pointer', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', WebkitTapHighlightColor: 'transparent' }}
              onTouchStart={e => { if (!outOfShots && !uploading) (e.currentTarget.style.transform = 'scale(0.93)') }}
              onTouchEnd={e => { (e.currentTarget.style.transform = 'scale(1)') }}>
              {/* Outer ring */}
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `3px solid ${outOfShots ? '#2a2a2a' : 'white'}`, transition: 'border-color .2s', opacity: 0.8 }} />
              {/* Inner disc */}
              <div style={{ width: 62, height: 62, borderRadius: '50%', background: outOfShots ? '#1a1a1a' : uploading ? '#222' : 'white', transition: 'background .2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {uploading && <div style={{ width: 22, height: 22, border: '2.5px solid #333', borderTop: '2.5px solid #e8ff47', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />}
              </div>
            </button>
          </div>

          {/* RIGHT: Flip camera (like Once) */}
          <button onClick={() => setFacingMode(f => f === 'environment' ? 'user' : 'environment')}
            style={{ width: 50, height: 50, background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.7" strokeLinecap="round">
              <path d="M1 4v6h6"/><path d="M23 20v-6h-6"/>
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 0 1 3.51 15"/>
            </svg>
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', fontFamily: 'Space Mono, monospace', fontWeight: 700, letterSpacing: 0.5 }}>FLIP</span>
          </button>
        </div>
      </div>

      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.15} }
        * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
      `}</style>
    </main>
  )
}
