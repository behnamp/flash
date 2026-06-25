'use client'
import { useState, useRef, useCallback, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ALL_MODES } from '@/constants/photoModes'
import { applyFilterToCanvas, CANVAS_FILTERS } from '@/lib/filterCanvas'
import { IconFlip } from '@/components/icons'

export default function CameraPage() {
  const params = useParams()
  const router = useRouter()
  const code = params.code as string
  const supabase = createClient()

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const flashRef = useRef<NodeJS.Timeout | undefined>(undefined)

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
  const [lastShotId, setLastShotId] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [toast, setToast] = useState('')
  const [showToastVal, setShowToastVal] = useState(false)

  const filter = ALL_MODES[0] // Always Kodak Gold filter applied

  useEffect(() => {
    async function load() {
      const { data: ev } = await supabase.from('events').select('*').eq('join_code', code.toUpperCase()).single()
      if (!ev) { router.push(`/join/${code}`); return }
      setEvent(ev); setShotLimit(ev.shot_limit || 10)
      const stored = localStorage.getItem(`flash_guest_${ev.id}`)
      if (!stored) { router.push(`/join/${code}`); return }
      const g = JSON.parse(stored); setGuestData(g)
      const { count } = await supabase.from('shots').select('*', { count: 'exact', head: true }).eq('event_id', ev.id).eq('guest_id', g.id)
      setShotsUsed(count || 0)
    }
    load()
  }, [code])

  const startCamera = useCallback(async (facing: 'user' | 'environment') => {
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
    setCameraReady(false)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 4096, min: 1280 }, height: { ideal: 2160, min: 720 }, frameRate: { ideal: 30 } },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => setCameraReady(true)
      }
      // Apply current zoom if camera supports it
      const track = stream.getVideoTracks()[0]
      const caps = track.getCapabilities?.() as any
      if (caps?.zoom) {
        track.applyConstraints({ advanced: [{ zoom: caps.zoom.min }] } as any).catch(() => {})
      }
    } catch { setCameraError('Camera access denied — please allow camera access and reload.') }
  }, [])

  useEffect(() => { startCamera(facingMode); return () => streamRef.current?.getTracks().forEach(t => t.stop()) }, [facingMode])

  const showToast = (msg: string) => {
    setToast(msg); setShowToastVal(true)
    clearTimeout(flashRef.current)
    flashRef.current = setTimeout(() => setShowToastVal(false), 1800)
  }

  const uploadBlob = async (blob: Blob) => {
    if (!event || !guest) return
    setUploading(true)
    try {
      const fileName = `${event.id}/${guest.id}/${Date.now()}.jpg`
      const { error: upErr } = await supabase.storage.from('shots').upload(fileName, blob, { contentType: 'image/jpeg', upsert: false })
      if (upErr) throw upErr
      const { data: shot, error: sErr } = await supabase.from('shots').insert({
        event_id: event.id, guest_id: guest.id, media_type: 'photo',
        storage_path: fileName, mode_id: filter.id, mode_name: filter.name,
        revealed: event.reveal_mode === 'instant',
      }).select().single()
      if (sErr) throw sErr
      const newUsed = shotsUsed + 1; setShotsUsed(newUsed); setLastShotId(shot.id)
      const left = shotLimit - newUsed
      showToast(left === 0 ? 'Film used up!' : left === 1 ? '1 shot left' : `${left} shots left`)
    } catch { showToast('Upload failed — check connection') } finally { setUploading(false) }
  }

  const shoot = useCallback(async () => {
    if (shotsUsed >= shotLimit || !canvasRef.current || !videoRef.current || uploading || !cameraReady) return
    setFlashing(true); setTimeout(() => setFlashing(false), 120)
    const canvas = canvasRef.current; const video = videoRef.current
    canvas.width = video.videoWidth || 1920; canvas.height = video.videoHeight || 1080
    const ctx = canvas.getContext('2d')!; ctx.drawImage(video, 0, 0)
    const blob = await applyFilterToCanvas(canvas, filter.id, 0.9)
    await uploadBlob(blob)
  }, [shotsUsed, shotLimit, uploading, cameraReady, filter, event, guest])

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    if (shotsUsed >= shotLimit) { showToast('No shots left!'); return }
    const img = new Image(); const url = URL.createObjectURL(file)
    img.onload = async () => {
      const canvas = canvasRef.current!
      canvas.width = img.naturalWidth; canvas.height = img.naturalHeight
      canvas.getContext('2d')!.drawImage(img, 0, 0); URL.revokeObjectURL(url)
      const blob = await applyFilterToCanvas(canvas, filter.id, 0.9)
      await uploadBlob(blob)
    }
    img.src = url; e.target.value = ''
  }

  const deleteLastShot = async () => {
    if (!lastShotId) return; setDeleting(true)
    try {
      const { data: shot } = await supabase.from('shots').select('storage_path').eq('id', lastShotId).single()
      if (shot?.storage_path) await supabase.storage.from('shots').remove([shot.storage_path])
      await supabase.from('shots').delete().eq('id', lastShotId)
      setShotsUsed(s => s - 1); setLastShotId(null); setShowDeleteConfirm(false)
      showToast('Shot deleted')
    } catch { showToast('Delete failed') } finally { setDeleting(false) }
  }

  const applyZoom = async (level: number) => {
    setZoom(level)
    const track = streamRef.current?.getVideoTracks()[0]
    if (!track) return
    const caps = track.getCapabilities?.() as any
    if (caps?.zoom) {
      // Native zoom via camera API
      const maxZoom = Math.min(caps.zoom.max, 5)
      const targetZoom = Math.max(caps.zoom.min, Math.min(level, maxZoom))
      track.applyConstraints({ advanced: [{ zoom: targetZoom }] } as any).catch(() => {})
    } else {
      // CSS transform fallback on the video element
      if (videoRef.current) {
        videoRef.current.style.transform = `scale(${level})`
        videoRef.current.style.transformOrigin = 'center center'
      }
    }
  }

  const left = Math.max(0, shotLimit - shotsUsed)
  const outOfShots = shotsUsed >= shotLimit
  const cssFilter = CANVAS_FILTERS[filter.id]?.filter || 'none'

  return (
    <main style={{ position: 'fixed', inset: 0, background: '#000', display: 'flex', flexDirection: 'column', overflow: 'hidden', touchAction: 'manipulation', WebkitUserSelect: 'none', userSelect: 'none' }}>

      {/* ── VIEWFINDER ── */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <video ref={videoRef} autoPlay playsInline muted
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: cameraReady ? 'block' : 'none', filter: cssFilter, transition: 'filter .25s' }} />

        {/* Loading state */}
        {!cameraReady && !cameraError && (
          <div style={{ position: 'absolute', inset: 0, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 2, height: 40, background: '#e8ff47', animation: 'blink 1s ease-in-out infinite' }} />
          </div>
        )}

        {/* Error state */}
        {cameraError && (
          <div style={{ position: 'absolute', inset: 0, background: '#0a0a0a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, gap: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: '#555', lineHeight: 1.7 }}>{cameraError}</div>
            <button onClick={() => startCamera(facingMode)} style={{ background: '#e8ff47', color: '#000', border: 'none', borderRadius: 10, padding: '11px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Try Again</button>
          </div>
        )}

        {/* White flash */}
        {flashing && <div style={{ position: 'absolute', inset: 0, background: '#fff', opacity: 0.85, pointerEvents: 'none' }} />}

        {/* ── TOP BAR ── */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', paddingTop: 'max(14px, env(safe-area-inset-top))', background: 'linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, transparent 100%)', pointerEvents: 'none' }}>

          {/* Back button */}
          <button onClick={() => router.push(`/join/${code}`)} style={{ width: 38, height: 38, background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(12px)', border: 'none', borderRadius: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'all' }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>

          {/* Shot counter — centered pill */}
          <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(14px)', borderRadius: 20, padding: '7px 16px', display: 'flex', alignItems: 'center', gap: 8, border: '1px solid rgba(255,255,255,0.08)' }}>
            {/* Film dots */}
            <div style={{ display: 'flex', gap: 3 }}>
              {Array.from({ length: shotLimit }, (_, i) => (
                <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: i < shotsUsed ? 'rgba(255,255,255,0.2)' : i === shotsUsed ? '#e8ff47' : 'rgba(255,255,255,0.55)', flexShrink: 0 }} />
              )).slice(0, Math.min(shotLimit, 10))}
              {shotLimit > 10 && <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', marginLeft: 2 }}>+{shotLimit - 10}</div>}
            </div>
            <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 13, fontWeight: 700, color: outOfShots ? '#ff4757' : left <= 2 ? '#ffa502' : '#fff', lineHeight: 1 }}>{left}</span>
          </div>

          {/* Flip camera */}
          <button onClick={() => setFacingMode(f => f === 'environment' ? 'user' : 'environment')} style={{ width: 38, height: 38, background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(12px)', border: 'none', borderRadius: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'all' }}>
            <IconFlip size={17} color="white" />
          </button>
        </div>

        {/* Delete last shot — bottom-right of viewfinder */}
        {lastShotId && !showDeleteConfirm && (
          <button onClick={() => setShowDeleteConfirm(true)} style={{ position: 'absolute', bottom: 16, right: 16, width: 36, height: 36, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,71,87,0.4)', borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'all' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ff4757" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
          </button>
        )}

        {/* Toast */}
        <div style={{ position: 'absolute', bottom: 70, left: '50%', transform: `translateX(-50%) translateY(${showToastVal ? 0 : 8}px)`, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(16px)', borderRadius: 20, padding: '9px 18px', fontSize: 13, fontWeight: 600, color: '#fff', opacity: showToastVal ? 1 : 0, transition: 'all .2s', pointerEvents: 'none', whiteSpace: 'nowrap', border: '1px solid rgba(255,255,255,0.1)' }}>
          {toast}
        </div>
      </div>

      {/* ── DELETE CONFIRM ── */}
      {showDeleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)', zIndex: 50, display: 'flex', alignItems: 'flex-end', padding: '0 0 env(safe-area-inset-bottom)' }}>
          <div style={{ background: '#0f0f0f', borderRadius: '20px 20px 0 0', padding: '24px 20px 32px', width: '100%', textAlign: 'center' }}>
            <div style={{ width: 44, height: 4, background: '#222', borderRadius: 2, margin: '0 auto 20px' }} />
            <div style={{ fontSize: 16, fontWeight: 700, color: '#f0f0f0', marginBottom: 6 }}>Delete last photo?</div>
            <div style={{ fontSize: 13, color: '#555', marginBottom: 24 }}>You'll get the shot back.</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowDeleteConfirm(false)} style={{ flex: 1, background: '#1a1a1a', border: '1px solid #222', borderRadius: 13, padding: '14px', color: '#666', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
              <button onClick={deleteLastShot} disabled={deleting} style={{ flex: 1, background: '#ff4757', border: 'none', borderRadius: 13, padding: '14px', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                {deleting ? '...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── BOTTOM CONTROLS ── */}
      <div style={{ background: '#0a0a0a', paddingBottom: 'max(16px, env(safe-area-inset-bottom))', touchAction: 'none', flexShrink: 0 }}>

        {/* Zoom controls — pill above shutter, like Once */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 14, paddingBottom: 6 }}>
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(16px)', borderRadius: 24, padding: '4px', gap: 2, border: '1px solid rgba(255,255,255,0.08)' }}>
            {[{ label: '.5x', value: 0.5 }, { label: '1x', value: 1 }, { label: '2x', value: 2 }, { label: '3x', value: 3 }].map(z => {
              const active = zoom === z.value
              return (
                <button key={z.value} onClick={() => applyZoom(z.value)}
                  style={{ width: 44, height: 32, borderRadius: 20, border: 'none', background: active ? '#e8ff47' : 'transparent', cursor: 'pointer', fontFamily: 'Space Mono, monospace', fontSize: 12, fontWeight: 700, color: active ? '#0a0a0a' : 'rgba(255,255,255,0.6)', transition: 'all .15s', letterSpacing: -0.3 }}>
                  {z.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Shutter row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 36px 4px' }}>

          {/* Upload from gallery */}
          <button onClick={() => fileInputRef.current?.click()} disabled={outOfShots || uploading}
            style={{ width: 50, height: 50, background: '#161616', border: '1px solid #222', borderRadius: 14, cursor: outOfShots ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: outOfShots ? 0.25 : 1, transition: 'opacity .15s', flexShrink: 0 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="3"/>
              <circle cx="8.5" cy="8.5" r="1.5" fill="#555" stroke="none"/>
              <polyline points="21,15 16,10 5,21"/>
            </svg>
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleGalleryUpload} style={{ display: 'none' }} />

          {/* Shutter — the hero */}
          <button onClick={shoot} disabled={outOfShots || uploading || !cameraReady}
            style={{ width: 82, height: 82, borderRadius: '50%', flexShrink: 0, cursor: outOfShots || uploading ? 'not-allowed' : 'pointer', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform .1s', WebkitTapHighlightColor: 'transparent' }}
            onTouchStart={e => { if (!outOfShots && !uploading) (e.currentTarget.style.transform = 'scale(0.94)') }}
            onTouchEnd={e => { (e.currentTarget.style.transform = 'scale(1)') }}>
            {/* Outer ring */}
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `3px solid ${outOfShots ? '#2a2a2a' : '#e8ff47'}`, transition: 'border-color .2s' }} />
            {/* Inner circle */}
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: outOfShots ? '#1a1a1a' : uploading ? '#1a1a1a' : '#fff', transition: 'background .2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {uploading && (
                <div style={{ width: 22, height: 22, border: '2.5px solid #333', borderTop: '2.5px solid #e8ff47', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
              )}
            </div>
          </button>

          {/* View gallery */}
          <button onClick={() => router.push(`/join/${code}/gallery`)}
            style={{ width: 50, height: 50, background: '#161616', border: '1px solid #222', borderRadius: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
            </svg>
          </button>

        </div>
      </div>

      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.2} }
        * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
        ::-webkit-scrollbar { display: none; }
      `}</style>
    </main>
  )
}
