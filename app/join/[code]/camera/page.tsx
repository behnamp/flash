'use client'
import { useState, useRef, useCallback, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ALL_MODES } from '@/constants/photoModes'
import { applyFilterToCanvas, CANVAS_FILTERS } from '@/lib/filterCanvas'
import { IconFlash, IconBack, IconFlip, IconGallery, IconShutter, IconDelete, IconClose, IconCheck } from '@/components/icons'

export default function CameraPage() {
  const params = useParams()
  const router = useRouter()
  const code = params.code as string
  const supabase = createClient()

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const fbTimerRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [event, setEvent] = useState<any>(null)
  const [guest, setGuestData] = useState<any>(null)
  const [shotsUsed, setShotsUsed] = useState(0)
  const [shotLimit, setShotLimit] = useState(10)
  const [filter, setFilter] = useState(ALL_MODES[0])
  const [flashing, setFlashing] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [showFeedback, setShowFeedback] = useState(false)
  const [cameraReady, setCameraReady] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')
  const [uploading, setUploading] = useState(false)
  const [lastShotId, setLastShotId] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: ev } = await supabase.from('events')
        .select('*').eq('join_code', code.toUpperCase()).single()
      if (!ev) { router.push(`/join/${code}`); return }
      setEvent(ev)
      setShotLimit(ev.shot_limit || 10)

      const stored = localStorage.getItem(`flash_guest_${ev.id}`)
      if (!stored) { router.push(`/join/${code}`); return }
      const g = JSON.parse(stored)
      setGuestData(g)

      const { count } = await supabase.from('shots')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', ev.id).eq('guest_id', g.id)
      setShotsUsed(count || 0)
    }
    load()
  }, [code])

  const startCamera = useCallback(async (facing: 'user' | 'environment') => {
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 4096, min: 1280 },
          height: { ideal: 2160, min: 720 },
          aspectRatio: { ideal: 16/9 },
          frameRate: { ideal: 30 },
        },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => setCameraReady(true)
      }
    } catch (e) {
      setCameraError('Camera access denied. Please allow camera access.')
    }
  }, [])

  useEffect(() => {
    startCamera(facingMode)
    return () => { streamRef.current?.getTracks().forEach(t => t.stop()) }
  }, [facingMode])

  const showToast = (msg: string, duration = 2000) => {
    setFeedback(msg); setShowFeedback(true)
    clearTimeout(fbTimerRef.current)
    fbTimerRef.current = setTimeout(() => setShowFeedback(false), duration)
  }

  // Upload a blob (from camera or gallery)
  const uploadBlob = async (blob: Blob) => {
    if (!event || !guest) return
    setUploading(true)
    try {
      const fileName = `${event.id}/${guest.id}/${Date.now()}.jpg`
      const { error: uploadError } = await supabase.storage
        .from('shots').upload(fileName, blob, { contentType: 'image/jpeg', upsert: false })
      if (uploadError) throw uploadError

      const { data: shot, error: shotError } = await supabase.from('shots').insert({
        event_id: event.id, guest_id: guest.id, media_type: 'photo',
        storage_path: fileName, mode_id: filter.id, mode_name: filter.name,
        revealed: event.reveal_mode === 'instant',
      }).select().single()
      if (shotError) throw shotError

      const newUsed = shotsUsed + 1
      setShotsUsed(newUsed)
      setLastShotId(shot.id)
      const left = shotLimit - newUsed
      showToast(left === 0 ? 'Film used up!' : left === 1 ? 'Last shot!' : `${left} left`)
    } catch (e: any) {
      showToast('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  // Camera shoot
  const shoot = useCallback(async () => {
    if (shotsUsed >= shotLimit || !canvasRef.current || !videoRef.current || uploading) return
    setFlashing(true); setTimeout(() => setFlashing(false), 160)
    const canvas = canvasRef.current
    const video = videoRef.current
    // Use full native resolution of the camera feed
    canvas.width = video.videoWidth || 1920
    canvas.height = video.videoHeight || 1080
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(video, 0, 0)
    setUploading(true)
    try {
      const blob = await applyFilterToCanvas(canvas, filter.id, 0.88)
      await uploadBlob(blob)
    } finally {
      setUploading(false)
    }
  }, [shotsUsed, shotLimit, uploading, event, guest, filter])

  // Gallery upload from phone
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (shotsUsed >= shotLimit) { showToast('No shots left!'); return }

    setUploading(true)
    try {
      // Draw to canvas and apply filter
      const img = new Image()
      const url = URL.createObjectURL(file)
      img.onload = async () => {
        const canvas = canvasRef.current!
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0)
        URL.revokeObjectURL(url)
        const blob = await applyFilterToCanvas(canvas, filter.id, 0.9)
        await uploadBlob(blob)
      }
      img.src = url
    } catch (e) {
      showToast('Upload failed')
      setUploading(false)
    }
    // Reset input
    e.target.value = ''
  }

  // Delete last shot
  const deleteLastShot = async () => {
    if (!lastShotId) return
    setDeleting(true)
    try {
      const { data: shot } = await supabase.from('shots').select('storage_path').eq('id', lastShotId).single()
      if (shot?.storage_path) {
        await supabase.storage.from('shots').remove([shot.storage_path])
      }
      await supabase.from('shots').delete().eq('id', lastShotId)
      setShotsUsed(s => s - 1)
      setLastShotId(null)
      setShowDeleteConfirm(false)
      showToast('Photo deleted')
    } catch (e) {
      showToast('Delete failed')
    } finally {
      setDeleting(false)
    }
  }

  const flipCamera = () => {
    setCameraReady(false)
    setFacingMode(f => f === 'environment' ? 'user' : 'environment')
  }

  const left = shotLimit - shotsUsed
  const filmPct = (shotsUsed / shotLimit) * 100

  return (
    <main style={{ position: 'fixed', inset: 0, background: '#000', display: 'flex', flexDirection: 'column', overflow: 'hidden', touchAction: 'manipulation', userSelect: 'none', WebkitUserSelect: 'none' }}>
      {/* Camera viewfinder */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <video
          ref={videoRef} autoPlay playsInline muted
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: cameraReady ? 'block' : 'none', filter: CANVAS_FILTERS[filter.id]?.filter || 'none', transition: 'filter 0.3s' }}
        />
        {!cameraReady && !cameraError && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
            <div style={{ width: 32, height: 32, background: '#e8ff47', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IconFlash size={18} color="#0a0a0a" />
            </div>
          </div>
        )}
        {cameraError && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#000', padding: 24, textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>{cameraError}</div>
            <button onClick={() => startCamera(facingMode)} style={{ background: '#e8ff47', color: '#000', border: 'none', borderRadius: 10, padding: '10px 20px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Retry</button>
          </div>
        )}

        {/* Flash effect */}
        {flashing && <div style={{ position: 'absolute', inset: 0, background: 'white', opacity: 0.8, pointerEvents: 'none' }} />}

        {/* Top bar */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)' }}>
          <button onClick={() => router.push(`/join/${code}`)} style={{ width: 36, height: 36, background: 'rgba(0,0,0,0.4)', border: 'none', borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' }}>
            <IconBack size={17} color="white" />
          </button>

          {/* Shot counter */}
          <div style={{ background: 'rgba(0,0,0,0.5)', borderRadius: 20, padding: '6px 14px', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 48, height: 3, background: 'rgba(255,255,255,0.2)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: left <= 2 ? '#ff4757' : '#e8ff47', width: `${filmPct}%`, transition: 'width .3s' }} />
            </div>
            <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 13, fontWeight: 700, color: left <= 2 ? '#ff4757' : 'white' }}>{left}</span>
          </div>

          <button onClick={flipCamera} style={{ width: 36, height: 36, background: 'rgba(0,0,0,0.4)', border: 'none', borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' }}>
            <IconFlip size={17} color="white" />
          </button>
        </div>

        {/* Feedback toast */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: `translate(-50%,-50%) scale(${showFeedback ? 1 : 0.8})`, background: 'rgba(0,0,0,0.75)', borderRadius: 20, padding: '10px 20px', fontSize: 14, fontWeight: 700, color: 'white', opacity: showFeedback ? 1 : 0, transition: 'all .2s', pointerEvents: 'none', backdropFilter: 'blur(10px)', whiteSpace: 'nowrap' }}>
          {feedback}
        </div>

        {/* Delete last photo */}
        {lastShotId && !showDeleteConfirm && (
          <div style={{ position: 'absolute', bottom: 100, right: 16 }}>
            <button onClick={() => setShowDeleteConfirm(true)} style={{ width: 40, height: 40, background: 'rgba(255,71,87,0.2)', border: '1px solid rgba(255,71,87,0.4)', borderRadius: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' }}>
              <IconDelete size={17} color="#ff4757" />
            </button>
          </div>
        )}
      </div>

      {/* Delete confirm overlay */}
      {showDeleteConfirm && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: '#111', borderRadius: 18, padding: '24px 20px', width: '100%', maxWidth: 300, textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#f0f0f0', marginBottom: 8 }}>Delete last photo?</div>
            <div style={{ fontSize: 13, color: '#555', marginBottom: 24 }}>This will give you back 1 shot.</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowDeleteConfirm(false)} style={{ flex: 1, background: '#1a1a1a', border: '1px solid #222', borderRadius: 11, padding: '12px', color: '#666', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
              <button onClick={deleteLastShot} disabled={deleting} style={{ flex: 1, background: '#ff4757', border: 'none', borderRadius: 11, padding: '12px', color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                {deleting ? '...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom controls — fixed, never zoom */}
      <div style={{ background: '#0a0a0a', paddingBottom: 'env(safe-area-inset-bottom)', touchAction: 'none', flexShrink: 0, position: 'relative', zIndex: 10 }}>

        {/* Mode selector — 5 modes, scrollable, no zoom */}
        <div style={{ display: 'flex', gap: 8, padding: '10px 16px', overflowX: 'auto', scrollbarWidth: 'none', touchAction: 'pan-x', WebkitOverflowScrolling: 'touch' }}>
          {ALL_MODES.map(m => (
            <button key={m.id} onClick={() => setFilter(m)}
              style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 2px' }}>
              <div style={{ width: 52, height: 38, borderRadius: 9, background: m.bg, border: `2px solid ${filter.id === m.id ? '#e8ff47' : 'transparent'}`, transition: 'border .15s' }} />
              <span style={{ fontSize: 9, fontWeight: 700, color: filter.id === m.id ? '#e8ff47' : '#555', textTransform: 'uppercase', letterSpacing: 0.5, whiteSpace: 'nowrap' }}>{m.name}</span>
            </button>
          ))}
        </div>

        {/* Shutter row — upload left, shutter center, gallery right */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '10px 24px 16px' }}>

          {/* LEFT: Upload from phone gallery */}
          <button onClick={() => fileInputRef.current?.click()} disabled={shotsUsed >= shotLimit || uploading}
            style={{ width: 52, height: 52, background: '#161616', border: '1px solid #2a2a2a', borderRadius: 16, cursor: shotsUsed >= shotLimit ? 'not-allowed' : 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, opacity: shotsUsed >= shotLimit ? 0.25 : 1, transition: 'opacity .15s' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="3"/>
              <circle cx="8.5" cy="8.5" r="1.5" fill="#888" stroke="none"/>
              <polyline points="21,15 16,10 5,21"/>
            </svg>
            <span style={{ fontSize: 8, color: '#555', fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' }}>Upload</span>
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleGalleryUpload} style={{ display: 'none' }} />

          {/* CENTER: Shutter button */}
          <button onClick={shoot} disabled={shotsUsed >= shotLimit || uploading || !cameraReady}
            style={{ width: 80, height: 80, borderRadius: '50%', background: uploading ? '#222' : shotsUsed >= shotLimit ? '#1a1a1a' : '#f0f0f0', border: `4px solid ${shotsUsed >= shotLimit ? '#222' : '#e8ff47'}`, cursor: shotsUsed >= shotLimit || uploading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s', flexShrink: 0, boxShadow: shotsUsed >= shotLimit ? 'none' : '0 0 20px rgba(232,255,71,0.15)' }}>
            {uploading
              ? <div style={{ width: 28, height: 28, border: '3px solid #555', borderTop: '3px solid #e8ff47', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              : <IconShutter size={32} color={shotsUsed >= shotLimit ? '#333' : '#0a0a0a'} weight="fill" />
            }
          </button>

          {/* RIGHT: Review photos (folder icon) */}
          <button onClick={() => router.push(`/join/${code}/gallery`)}
            style={{ width: 52, height: 52, background: '#161616', border: '1px solid #2a2a2a', borderRadius: 16, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, transition: 'opacity .15s' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
            </svg>
            <span style={{ fontSize: 8, color: '#555', fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' }}>Gallery</span>
          </button>

        </div>
      </div>

      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } } * { -webkit-tap-highlight-color: transparent; }`}</style>
    </main>
  )
}
