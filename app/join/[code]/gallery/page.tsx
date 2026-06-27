'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function GuestGalleryPage() {
  const params = useParams()
  const router = useRouter()
  const code = params.code as string
  const supabase = createClient()

  const [shots, setShots] = useState<any[]>([])
  const [guestId, setGuestId] = useState<string | null>(null)
  const [eventId, setEventId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<any>(null)
  const [deleting, setDeleting] = useState(false)
  const [toast, setToast] = useState('')
  const [showToast, setShowToast] = useState(false)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const showMsg = (msg: string) => {
    setToast(msg); setShowToast(true)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setShowToast(false), 2000)
  }

  const loadShots = useCallback(async (evId: string) => {
    const { data } = await supabase
      .from('shots')
      .select('id, storage_url, storage_path, mode_name, taken_at, guest_id, revealed')
      .eq('event_id', evId)
      .order('taken_at', { ascending: false })
    if (data) setShots(data)
  }, [supabase])

  useEffect(() => {
    async function load() {
      const { data: ev } = await supabase.from('events').select('id, name').eq('join_code', code.toUpperCase()).single()
      if (!ev) { router.push(`/join/${code}`); return }
      setEventId(ev.id)
      const stored = localStorage.getItem(`flash_guest_${ev.id}`)
      if (!stored) { router.push(`/join/${code}`); return }
      setGuestId(JSON.parse(stored).id)
      await loadShots(ev.id)
      setLoading(false)

      // Realtime updates
      const channel = supabase.channel(`gallery-${ev.id}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'shots', filter: `event_id=eq.${ev.id}` }, () => loadShots(ev.id))
        .subscribe()
      return () => { supabase.removeChannel(channel) }
    }
    load()
  }, [code])

  const deleteShot = async (shot: any) => {
    if (!confirm('Delete this photo?')) return
    setDeleting(true)
    try {
      if (shot.storage_path) await supabase.storage.from('shots').remove([shot.storage_path])
      await supabase.from('shots').delete().eq('id', shot.id)
      setShots(s => s.filter(x => x.id !== shot.id))
      setSelected(null)
      showMsg('Photo deleted')
    } catch { showMsg('Delete failed') }
    finally { setDeleting(false) }
  }

  const myShots = shots.filter(s => s.guest_id === guestId)
  const otherShots = shots.filter(s => s.guest_id !== guestId && s.revealed)
  const allVisible = [...myShots, ...otherShots]

  if (loading) return (
    <main style={{ height: '100dvh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 2, height: 32, background: '#e8ff47', animation: 'blink 1s ease-in-out infinite' }} />
      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:.15}}`}</style>
    </main>
  )

  return (
    <main style={{ height: '100dvh', background: '#0a0a0a', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'fixed', inset: 0 }}>

      {/* HEADER */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 'max(14px, env(safe-area-inset-top))', paddingBottom: '14px', paddingLeft: 16, paddingRight: 16, borderBottom: '1px solid #111', flexShrink: 0, background: '#0a0a0a' }}>
        <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 13, fontWeight: 700, color: '#f0f0f0' }}>
          {myShots.length} {myShots.length === 1 ? 'photo' : 'photos'}
        </div>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#333' }}>Gallery</div>
        <div style={{ width: 40 }} />
      </div>

      {/* PHOTO GRID */}
      <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
        {allVisible.length === 0 ? (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="1.2" strokeLinecap="round">
              <circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3" fill="#222" stroke="none"/>
            </svg>
            <div style={{ fontSize: 14, color: '#333', fontWeight: 600 }}>No photos yet</div>
            <div style={{ fontSize: 12, color: '#222' }}>Go take some shots!</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, padding: 2 }}>
            {allVisible.map(s => {
              const isMe = s.guest_id === guestId
              const isDev = isMe && !s.revealed
              return (
                <div key={s.id} onClick={() => setSelected(s)}
                  style={{ aspectRatio: '1', background: '#111', position: 'relative', cursor: 'pointer', overflow: 'hidden' }}>
                  {s.storage_url
                    ? <img src={s.storage_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: isDev ? 'brightness(0.5)' : 'none' }} />
                    : <div style={{ width: '100%', height: '100%', background: '#1a1a1a' }} />
                  }
                  {isDev && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: 20, height: 20, borderRadius: 10, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><path d="M18 8h-1V6A5 5 0 0 0 6 6v2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2zm-6 9a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm3.1-9H8.9V6a3.1 3.1 0 0 1 6.2 0v2z"/></svg>
                      </div>
                    </div>
                  )}
                  {isMe && !isDev && (
                    <div style={{ position: 'absolute', top: 4, right: 4, width: 18, height: 18, borderRadius: 5, background: '#e8ff47', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="#0a0a0a"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* BACK TO CAMERA BUTTON */}
      <div style={{ padding: '12px 16px', paddingBottom: 'max(12px, env(safe-area-inset-bottom))', background: '#0a0a0a', borderTop: '1px solid #111', flexShrink: 0 }}>
        <button onClick={() => router.push(`/join/${code}/camera`)}
          style={{ width: '100%', background: '#e8ff47', color: '#0a0a0a', border: 'none', borderRadius: 14, padding: '16px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2.2" strokeLinecap="round">
            <circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3" fill="#0a0a0a" stroke="none"/>
          </svg>
          Back to Camera
        </button>
      </div>

      {/* LIGHTBOX */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.96)', zIndex: 100, display: 'flex', flexDirection: 'column' }}>
          {/* Lightbox header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 'max(14px, env(safe-area-inset-top))', paddingBottom: '14px', paddingLeft: 16, paddingRight: 16, paddingTop: 'max(14px, env(safe-area-inset-top))', flexShrink: 0 }}>
            <button onClick={() => setSelected(null)}
              style={{ background: '#161616', border: 'none', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
            <div style={{ fontSize: 12, color: '#555' }}>{selected.mode_name}</div>
            {/* Delete — only own photos */}
            {selected.guest_id === guestId ? (
              <button onClick={() => deleteShot(selected)} disabled={deleting}
                style={{ background: '#1a0a0a', border: '1px solid rgba(255,71,87,0.3)', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ff4757" strokeWidth="2" strokeLinecap="round">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                </svg>
              </button>
            ) : <div style={{ width: 36 }} />}
          </div>

          {/* Photo */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 8px' }}>
            {selected.storage_url
              ? <img src={selected.storage_url} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 12 }} />
              : <div style={{ width: '80%', aspectRatio: '3/4', background: '#111', borderRadius: 12 }} />
            }
          </div>

          {/* Photo info */}
          <div style={{ padding: '16px', paddingBottom: 'max(16px, env(safe-area-inset-bottom))', textAlign: 'center', flexShrink: 0 }}>
            <div style={{ fontSize: 12, color: '#444' }}>
              {selected.guest_id === guestId ? 'Your photo' : 'Guest photo'} · {new Date(selected.taken_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      <div style={{ position: 'fixed', bottom: 100, left: '50%', transform: `translateX(-50%) translateY(${showToast ? 0 : 8}px)`, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(16px)', borderRadius: 20, padding: '9px 18px', fontSize: 13, fontWeight: 600, color: '#fff', opacity: showToast ? 1 : 0, transition: 'all .2s', pointerEvents: 'none', whiteSpace: 'nowrap', zIndex: 200 }}>
        {toast}
      </div>

      <style>{`* { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }`}</style>
    </main>
  )
}
