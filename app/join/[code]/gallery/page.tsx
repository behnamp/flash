'use client'
import { useState, useEffect } from 'react'
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

  useEffect(() => {
    async function load() {
      const eventId = localStorage.getItem('flash_event_id')
      if (!eventId) { router.push(`/join/${code}`); return; }

      const { data: ev } = await supabase.from('events').select('*').eq('id', eventId).single()
      if (!ev) return
      setEvent(ev)

      // Calculate countdown
      if (ev.reveal_at) {
        const diff = Math.max(0, Math.floor((new Date(ev.reveal_at).getTime() - Date.now()) / 1000))
        setSecs(diff)
      }

      const { data: shotsData } = await supabase
        .from('shot_gallery')
        .select('*')
        .eq('event_id', eventId)
        .order('taken_at', { ascending: false })

      setShots(shotsData || [])
      setLoading(false)

      // Realtime subscription
      const channel = supabase.channel(`gallery-${eventId}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'shots', filter: `event_id=eq.${eventId}` },
          () => { supabase.from('shot_gallery').select('*').eq('event_id', eventId).order('taken_at', { ascending: false }).then(({ data }) => setShots(data || [])) })
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

  if (loading) return (
    <main style={{ height: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: 32 }} className="spin">📷</div>
    </main>
  )

  if (selected) return (
    <main style={{ height: '100vh', background: '#000', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', background: 'rgba(0,0,0,0.9)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <button onClick={() => setSelected(null)} style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 10, color: 'white', cursor: 'pointer', fontSize: 16 }}>←</button>
        <span style={{ color: 'white', fontWeight: 600, fontSize: 14 }}>by {selected.shooter_name}</span>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        {selected.storage_url
          ? <img src={selected.storage_url} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
          : <div style={{ fontSize: 80, opacity: 0.5 }}>📷</div>
        }
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 18, background: 'linear-gradient(to top,rgba(0,0,0,0.85),transparent)' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>by {selected.shooter_name}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{selected.mode_name} · {new Date(selected.taken_at).toLocaleTimeString()}</div>
          {selected.caption && <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 9, padding: '8px 12px', fontSize: 13, color: 'white', marginTop: 10 }}>"{selected.caption}"</div>}
        </div>
      </div>
    </main>
  )

  const revealed = shots.filter(s => s.revealed)
  const developing = shots.filter(s => !s.revealed)

  return (
    <main style={{ height: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '16px 18px 0', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: -0.4, marginBottom: 3 }}>{event?.name}</div>
        <div style={{ fontSize: 12, color: 'var(--dim)', marginBottom: 11 }}>{shots.length} shots · {revealed.length} revealed</div>

        {!event?.revealed && secs > 0 && (
          <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 11, marginBottom: 11 }}>
            <span style={{ fontSize: 18 }}>⏳</span>
            <div>
              <div style={{ fontSize: 11, color: 'var(--dim)' }}>Revealing in</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 700, color: 'var(--accent)' }}>{fmt(secs)}</div>
            </div>
          </div>
        )}
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {revealed.length === 0 && developing.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 200, color: 'var(--muted)', fontSize: 14 }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📷</div>
            No shots yet — go take some!
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 2, padding: 2 }}>
            {[...revealed, ...developing].map((s, i) => (
              <div key={s.id} onClick={() => s.revealed && setSelected(s)}
                style={{ aspectRatio: '1', overflow: 'hidden', position: 'relative', background: 'var(--surface2)', cursor: s.revealed ? 'pointer' : 'default' }}>
                {s.revealed ? (
                  s.storage_url
                    ? <img src={s.thumbnail_url || s.storage_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>📷</div>
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                    <span style={{ fontSize: 16, opacity: 0.3 }} className="pulse">⏳</span>
                    <span style={{ fontSize: 8, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Developing</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', borderTop: '1px solid var(--border)', background: 'rgba(10,10,10,0.97)' }}>
        {[['📷', 'Camera', () => router.push(`/join/${code}/camera`)], ['🖼', 'Gallery', () => {}]].map(([icon, label, fn]: any) => (
          <button key={label} onClick={fn} style={{ flex: 1, padding: '12px 0', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 10, fontWeight: 700, color: label === 'Gallery' ? 'var(--accent)' : 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.8, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <span style={{ fontSize: 19 }}>{icon as string}</span>{label as string}
          </button>
        ))}
      </div>
    </main>
  )
}
