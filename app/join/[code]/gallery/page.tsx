'use client'
import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function GuestGalleryPage() {
  const params = useParams()
  const router = useRouter()
  const code = params.code as string
  const supabase = createClient()

  const [event, setEvent] = useState<any>(null)
  const [shots, setShots] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<any>(null)
  const [secs, setSecs] = useState(0)
  const [guestId, setGuestId] = useState<string | null>(null)

  const loadShots = useCallback(async (eventId: string) => {
    const { data, error } = await supabase
      .from('shots')
      .select('*, guests(nickname, avatar_emoji)')
      .eq('event_id', eventId)
      .order('taken_at', { ascending: false })
    if (data) setShots(data)
  }, [supabase])

  useEffect(() => {
    async function load() {
      const eventId = localStorage.getItem('flash_event_id')
      const storedGuestId = localStorage.getItem(`flash_guest_id_${eventId}`)
      if (!eventId) { router.push(`/join/${code}`); return }
      setGuestId(storedGuestId)

      const { data: ev } = await supabase.from('events').select('*').eq('id', eventId).single()
      if (!ev) return
      setEvent(ev)

      if (ev.reveal_at) {
        const diff = Math.max(0, Math.floor((new Date(ev.reveal_at).getTime() - Date.now()) / 1000))
        setSecs(diff)
      }

      await loadShots(eventId)
      setLoading(false)

      // Realtime — reload shots on any new insert
      const channel = supabase.channel(`gallery-${eventId}`)
        .on('postgres_changes', {
          event: '*', schema: 'public', table: 'shots',
          filter: `event_id=eq.${eventId}`
        }, () => loadShots(eventId))
        .subscribe()

      return () => { supabase.removeChannel(channel) }
    }
    load()
  }, [code])

  useEffect(() => {
    const t = setInterval(() => setSecs(s => Math.max(0, s - 1)), 1000)
    return () => clearInterval(t)
  }, [])

  const fmt = (s: number) => {
    const h = Math.floor(s / 3600).toString().padStart(2, '0')
    const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0')
    const sec = (s % 60).toString().padStart(2, '0')
    return `${h}:${m}:${sec}`
  }

  // Shot is visible if: it's revealed OR it belongs to this guest
  const isVisible = (shot: any) => shot.revealed || shot.guest_id === guestId

  if (loading) return (
    <main style={{ height: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: 32 }} className="spin">📷</div>
    </main>
  )

  if (selected) {
    const shooterName = selected.guests?.nickname || 'Guest'
    return (
      <main style={{ height: '100vh', background: '#000', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', background: 'rgba(0,0,0,0.9)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <button onClick={() => setSelected(null)} style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 10, color: 'white', cursor: 'pointer', fontSize: 16 }}>←</button>
          <span style={{ color: 'white', fontWeight: 600, fontSize: 14 }}>by {shooterName}</span>
          {!selected.revealed && <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--accent)', background: 'var(--accent-dim)', border: '1px solid rgba(232,255,71,0.3)', borderRadius: 6, padding: '3px 8px' }}>Your shot · Not yet revealed</span>}
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          {selected.storage_url
            ? <img src={selected.storage_url} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
            : <div style={{ fontSize: 80, opacity: 0.5 }}>📷</div>
          }
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 18, background: 'linear-gradient(to top,rgba(0,0,0,0.85),transparent)' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>by {shooterName}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{selected.mode_name || 'Kodak Gold'} · {new Date(selected.taken_at).toLocaleTimeString()}</div>
            {selected.caption && <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 9, padding: '8px 12px', fontSize: 13, color: 'white', marginTop: 10 }}>"{selected.caption}"</div>}
          </div>
        </div>
      </main>
    )
  }

  const visibleShots = shots.filter(isVisible)
  const myShots = shots.filter(s => s.guest_id === guestId)
  const revealedShots = shots.filter(s => s.revealed)
  const developingShots = myShots.filter(s => !s.revealed)

  return (
    <main style={{ height: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '16px 18px 0', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: -0.4, marginBottom: 3 }}>{event?.name}</div>
        <div style={{ fontSize: 12, color: 'var(--dim)', marginBottom: 11 }}>
          {myShots.length} your shots · {revealedShots.length} revealed
        </div>

        {/* Countdown if not revealed */}
        {!event?.revealed && event?.reveal_mode !== 'instant' && (
          <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 11, marginBottom: 11 }}>
            <span style={{ fontSize: 18 }}>⏳</span>
            <div>
              <div style={{ fontSize: 11, color: 'var(--dim)' }}>
                {event?.reveal_mode === 'morning' ? 'Reveals tomorrow at 9am' :
                 event?.reveal_mode === 'milestone' ? 'Reveals when everyone\'s done' :
                 'Reveals at end of event'}
              </div>
              {secs > 0 && <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 15, fontWeight: 700, color: 'var(--accent)' }}>{fmt(secs)}</div>}
            </div>
          </div>
        )}

        {/* My shots developing notice */}
        {developingShots.length > 0 && (
          <div style={{ background: 'var(--accent-dim)', border: '1px solid rgba(232,255,71,0.3)', borderRadius: 10, padding: '10px 14px', marginBottom: 11, fontSize: 12, color: 'var(--accent)' }}>
            🎞 {developingShots.length} of your shots are developing — visible only to you until reveal
          </div>
        )}
      </div>

      {/* Grid */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {visibleShots.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 240, color: 'var(--muted)', fontSize: 14, textAlign: 'center', padding: 24 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📷</div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>No shots yet</div>
            <div style={{ fontSize: 13 }}>Go take some photos!</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 2, padding: 2 }}>
            {visibleShots.map((s) => {
              const isMyShot = s.guest_id === guestId
              const isDeveloping = isMyShot && !s.revealed
              return (
                <div key={s.id} onClick={() => setSelected(s)}
                  style={{ aspectRatio: '1', overflow: 'hidden', position: 'relative', background: 'var(--surface2)', cursor: 'pointer' }}>
                  {s.storage_url
                    ? <img src={s.storage_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: isDeveloping ? 'brightness(0.7)' : 'none' }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>📷</div>
                  }
                  {/* Developing badge */}
                  {isDeveloping && (
                    <div style={{ position: 'absolute', top: 4, left: 4, background: 'rgba(232,255,71,0.9)', borderRadius: 5, padding: '2px 6px', fontSize: 8, fontWeight: 700, color: '#000' }}>
                      YOURS
                    </div>
                  )}
                  {/* Shooter name */}
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '4px 5px', background: 'linear-gradient(to top,rgba(0,0,0,0.7),transparent)', fontSize: 8, color: 'white', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {s.guests?.nickname || 'Guest'}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <div style={{ display: 'flex', borderTop: '1px solid var(--border)', background: 'rgba(10,10,10,0.97)' }}>
        {[['📷', 'Camera', () => router.push(`/join/${code}/camera`)], ['🖼', 'Gallery', () => {}]].map(([icon, label, fn]: any) => (
          <button key={label as string} onClick={fn} style={{ flex: 1, padding: '12px 0', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 10, fontWeight: 700, color: (label as string) === 'Gallery' ? 'var(--accent)' : 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.8, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <span style={{ fontSize: 19 }}>{icon as string}</span>{label as string}
          </button>
        ))}
      </div>
    </main>
  )
}
