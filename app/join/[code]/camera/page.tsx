'use client'
import { useState, useRef, useCallback, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ALL_MODES } from '@/constants/photoModes'

export default function CameraPage() {
  const params = useParams()
  const router = useRouter()
  const code = params.code as string
  const supabase = createClient()

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const fbTimerRef = useRef<NodeJS.Timeout | null>(null)

  const [event, setEvent] = useState<any>(null)
  const [guest, setGuestData] = useState<any>(null)
  const [shotsUsed, setShotsUsed] = useState(0)
  const [shotLimit, setShotLimit] = useState(12)
  const [filter, setFilter] = useState(ALL_MODES[0])
  const [flashing, setFlashing] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [showFeedback, setShowFeedback] = useState(false)
  const [cameraReady, setCameraReady] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')
  const [uploading, setUploading] = useState(false)
  const [showCaption, setShowCaption] = useState(false)
  const [caption, setCaption] = useState('')
  const [lastShotId, setLastShotId] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      const eventId = localStorage.getItem('flash_event_id')
      const guestId = localStorage.getItem(`flash_guest_id_${eventId}`)
      if (!eventId || !guestId) { router.push(`/join/${code}`); return; }

      const [{ data: ev }, { data: gu }] = await Promise.all([
        supabase.from('events').select('*').eq('id', eventId).single(),
        supabase.from('guests').select('*').eq('id', guestId).single(),
      ])
      if (!ev || !gu) { router.push(`/join/${code}`); return; }
      setEvent(ev)
      setGuestData(gu)
      setShotsUsed(gu.shots_taken)
      setShotLimit(ev.shot_limit)

      // Set available modes
      if (ev.mode_control === 'lock') {
        const m = ALL_MODES.find(m => m.id === ev.locked_mode) ?? ALL_MODES[0]
        setFilter(m)
      }
    }
    loadData()
  }, [code])

  useEffect(() => {
    startCamera()
    return () => { streamRef.current?.getTracks().forEach(t => t.stop()) }
  }, [facingMode])

  const startCamera = async () => {
    try {
      streamRef.current?.getTracks().forEach(t => t.stop())
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) { videoRef.current.srcObject = stream; setCameraReady(true); }
    } catch (e: any) {
      setCameraError(e.name === 'NotAllowedError'
        ? 'Camera access denied. Please allow camera access and refresh.'
        : 'Camera not available on this device.')
    }
  }

  const takeShot = useCallback(async () => {
    if (shotsUsed >= shotLimit || !canvasRef.current || !videoRef.current || uploading) return

    // Flash effect
    setFlashing(true)
    setTimeout(() => setFlashing(false), 160)

    const canvas = canvasRef.current
    const video = videoRef.current
    canvas.width = video.videoWidth || 1280
    canvas.height = video.videoHeight || 720
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(video, 0, 0)

    // Convert to blob
    canvas.toBlob(async (blob) => {
      if (!blob || !event || !guest) return
      setUploading(true)

      try {
        const fileName = `${event.id}/${guest.id}/${Date.now()}.jpg`
        const { error: uploadError } = await supabase.storage
          .from('shots')
          .upload(fileName, blob, { contentType: 'image/jpeg', upsert: false })

        if (uploadError) throw uploadError

        const { data: shot, error: shotError } = await supabase
          .from('shots')
          .insert({
            event_id: event.id,
            guest_id: guest.id,
            media_type: 'photo',
            storage_path: fileName,
            mode_id: filter.id,
            mode_name: filter.name,
            revealed: event.reveal_mode === 'instant',
          })
          .select()
          .single()

        if (shotError) throw shotError

        const newUsed = shotsUsed + 1
        setShotsUsed(newUsed)
        setLastShotId(shot.id)

        const left = shotLimit - newUsed
        const msg = left === 0 ? 'Film used up! 🎞' : left === 1 ? 'Last shot!' : `${left} left ✓`
        setFeedback(msg)
        setShowFeedback(true)
        clearTimeout(fbTimerRef.current!)
        fbTimerRef.current = setTimeout(() => setShowFeedback(false), 1800)

        if (event.allow_captions) setShowCaption(true)
      } catch (e) {
        setFeedback('Upload failed, try again')
        setShowFeedback(true)
      } finally {
        setUploading(false)
      }
    }, 'image/jpeg', 0.88)
  }, [shotsUsed, shotLimit, uploading, event, guest, filter])

  const saveCaption = async () => {
    if (!lastShotId || !caption.trim()) { setShowCaption(false); setCaption(''); return; }
    await supabase.from('shots').update({ caption: caption.trim() }).eq('id', lastShotId)
    setShowCaption(false)
    setCaption('')
  }

  const availModes = event?.mode_control === 'lock'
    ? [ALL_MODES.find(m => m.id === event.locked_mode) ?? ALL_MODES[0]]
    : event?.mode_control === 'menu'
    ? ALL_MODES.filter(m => event.selected_modes?.includes(m.id))
    : ALL_MODES.slice(0, 12)

  if (cameraError) return (
    <main style={{ height: '100vh', background: '#000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
      <div style={{ fontSize: 40, marginBottom: 16 }}>📵</div>
      <h2 style={{ color: 'white', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Camera unavailable</h2>
      <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 24, fontSize: 14 }}>{cameraError}</p>
      <button onClick={() => router.push(`/join/${code}`)} style={{ background: 'var(--accent)', color: '#000', border: 'none', borderRadius: 12, padding: '12px 24px', fontWeight: 700, cursor: 'pointer' }}>
        Go Back
      </button>
    </main>
  )

  return (
    <main style={{ height: '100vh', background: '#000', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Viewfinder */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <video ref={videoRef} autoPlay playsInline muted
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: cameraReady ? 'block' : 'none' }} />
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {!cameraReady && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: 32 }} className="spin">📷</div>
          </div>
        )}

        {/* Flash overlay */}
        {flashing && <div style={{ position: 'absolute', inset: 0, background: 'white', zIndex: 20 }} className="flash-anim" />}

        {/* Corner guides */}
        {[[0,0],[0,1],[1,0],[1,1]].map(([r,c],i) => (
          <div key={i} style={{
            position: 'absolute', width: 20, height: 20,
            [r ? 'bottom' : 'top']: 18, [c ? 'right' : 'left']: 18,
            [r ? 'borderBottom' : 'borderTop']: '2px solid rgba(255,255,255,0.3)',
            [c ? 'borderRight' : 'borderLeft']: '2px solid rgba(255,255,255,0.3)',
          }} />
        ))}

        {/* HUD */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '14px 16px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', background: 'linear-gradient(to bottom,rgba(0,0,0,0.65),transparent)' }}>
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.55)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 5 }}>
              {guest?.nickname || 'Guest'}
            </div>
            <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', maxWidth: 140 }}>
              {Array.from({ length: Math.min(shotLimit, 18) }).map((_, i) => (
                <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: i < shotsUsed ? 'var(--accent)' : 'rgba(255,255,255,0.2)', transition: 'background .18s' }} />
              ))}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: 'var(--accent)', marginBottom: 4 }}>
              {shotLimit - shotsUsed} left
            </div>
            <div style={{ background: 'rgba(232,255,71,0.13)', border: '1px solid rgba(232,255,71,0.28)', borderRadius: 6, padding: '2px 8px', fontSize: 9, fontWeight: 700, color: 'var(--accent)', letterSpacing: 1.5, textTransform: 'uppercase' }}>
              {filter.name.slice(0, 12)}
            </div>
          </div>
        </div>

        {/* Mode strip */}
        {availModes.length > 1 && (
          <div style={{ position: 'absolute', bottom: 90, left: 0, right: 0, overflowX: 'auto', display: 'flex', gap: 7, padding: '0 16px', scrollbarWidth: 'none' }}>
            {availModes.map(m => m && (
              <div key={m.id} onClick={() => setFilter(m)} style={{
                flexShrink: 0,
                background: filter.id === m.id ? 'var(--accent)' : 'rgba(255,255,255,0.08)',
                border: `1px solid ${filter.id === m.id ? 'var(--accent)' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: 20, padding: '5px 12px', fontSize: 10, fontWeight: 700,
                color: filter.id === m.id ? '#000' : 'rgba(255,255,255,0.6)',
                cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all .13s'
              }}>
                {m.icon} {m.name}
              </div>
            ))}
          </div>
        )}

        {/* Feedback toast */}
        <div style={{
          position: 'absolute', bottom: 84, left: '50%', transform: 'translateX(-50%)',
          background: shotsUsed >= shotLimit ? 'rgba(255,71,87,0.92)' : 'rgba(232,255,71,0.93)',
          color: shotsUsed >= shotLimit ? 'white' : '#000',
          borderRadius: 20, padding: '7px 18px', fontSize: 12, fontWeight: 700,
          whiteSpace: 'nowrap', pointerEvents: 'none',
          opacity: showFeedback ? 1 : 0, transition: 'opacity .2s'
        }}>{feedback}</div>

        {uploading && (
          <div style={{ position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.6)', borderRadius: 20, padding: '4px 12px', fontSize: 11, color: 'white' }}>
            Saving...
          </div>
        )}
      </div>

      {/* Controls */}
      <div style={{ background: 'rgba(0,0,0,0.88)', padding: '17px 22px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <button onClick={() => router.push(`/join/${code}/gallery`)} style={{ width: 50, height: 50, background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: 14, cursor: 'pointer', fontSize: 20, color: 'white' }}>🖼</button>

        <button onClick={takeShot} disabled={shotsUsed >= shotLimit || uploading} style={{
          width: 72, height: 72,
          background: shotsUsed >= shotLimit ? 'rgba(255,71,87,0.25)' : 'white',
          border: `4px solid ${shotsUsed >= shotLimit ? 'rgba(255,71,87,0.4)' : 'rgba(255,255,255,0.28)'}`,
          borderRadius: '50%', cursor: shotsUsed >= shotLimit ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s'
        }}>
          <div style={{ width: 54, height: 54, background: shotsUsed >= shotLimit ? 'var(--red)' : 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
            {uploading ? '⏳' : shotsUsed >= shotLimit ? '🚫' : '📷'}
          </div>
        </button>

        <button onClick={() => setFacingMode(f => f === 'environment' ? 'user' : 'environment')} style={{ width: 50, height: 50, background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: 14, cursor: 'pointer', fontSize: 20, color: 'white' }}>🔄</button>
      </div>

      {/* Caption modal */}
      {showCaption && event?.allow_captions && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 50, display: 'flex', alignItems: 'flex-end' }}>
          <div style={{ background: 'var(--surface)', borderRadius: '20px 20px 0 0', padding: '20px 18px 40px', width: '100%' }} className="slide-up">
            <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--border)', margin: '0 auto 18px' }} />
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 5 }}>Add a caption</div>
            <div style={{ fontSize: 13, color: 'var(--dim)', marginBottom: 14 }}>Auto-translated for all guests</div>
            <textarea value={caption} onChange={e => setCaption(e.target.value)} placeholder="What's happening here? 🎉"
              rows={3} maxLength={120}
              style={{ background: 'var(--surface2)', border: '1.5px solid var(--border)', borderRadius: 10, padding: '12px 14px', color: 'var(--text)', fontSize: 14, width: '100%', outline: 'none', resize: 'none', marginBottom: 14 }} />
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setShowCaption(false); setCaption(''); }} style={{ flex: 1, background: 'transparent', color: 'var(--text)', border: '1.5px solid var(--border)', borderRadius: 12, padding: '13px 0', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>Skip</button>
              <button onClick={saveCaption} style={{ flex: 1, background: 'var(--accent)', color: '#000', border: 'none', borderRadius: 12, padding: '13px 0', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>Save ✓</button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
