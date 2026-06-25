'use client'
import { IconFlash, IconBack, IconQR, IconStats, IconGuests, IconGallery, IconReveal, IconCopy, IconClose, IconShutter, IconHourglass, IconEdit, IconDelete, IconArrowRight, IconCheck, IconWarning, IconLive, IconStar, IconSave, IconWedding, IconBirthday, IconParty, IconTrip, IconCorporate, IconFestival, IconSports, IconNightlife, IconQuestion, IconStop, IconFilm } from '@/components/icons'

const EVENT_TYPE_ICONS: Record<string, any> = {
  wedding: IconWedding, birthday: IconBirthday, party: IconParty,
  trip: IconTrip, corporate: IconCorporate, festival: IconFestival,
  sports: IconSports, club: IconNightlife, other: IconQuestion,
}
import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import QRCode from 'react-qr-code'

export default function EventDashboard() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.eventId as string
  const supabase = createClient()

  const [event, setEvent] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [guests, setGuests] = useState<any[]>([])
  const [shots, setShots] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [revealing, setRevealing] = useState(false)
  const [tab, setTab] = useState<'qr' | 'dashboard' | 'guests' | 'gallery'>('qr')
  const [toast, setToast] = useState('')
  const toastRef = useRef<NodeJS.Timeout | undefined>(undefined)

  const showToast = (msg: string) => {
    setToast(msg)
    clearTimeout(toastRef.current)
    toastRef.current = setTimeout(() => setToast(''), 2200)
  }

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const [{ data: ev }, { data: st }, { data: gu }, { data: sh }] = await Promise.all([
        supabase.from('events').select('*').eq('id', eventId).single(),
        supabase.from('event_summary').select('*').eq('id', eventId).single(),
        supabase.from('guests').select('*').eq('event_id', eventId).order('joined_at'),
        supabase.from('shot_gallery').select('*').eq('event_id', eventId).order('taken_at', { ascending: false }),
      ])

      if (!ev) { router.push('/host'); return }
      setEvent(ev); setStats(st); setGuests(gu || []); setShots(sh || [])
      setLoading(false)

      // Realtime
      const channel = supabase.channel(`event-${eventId}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'guests', filter: `event_id=eq.${eventId}` },
          payload => setGuests(g => [...g, payload.new]))
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'shots', filter: `event_id=eq.${eventId}` },
          () => supabase.from('shot_gallery').select('*').eq('event_id', eventId).order('taken_at', { ascending: false }).then(({ data }) => { if (data) setShots(data) }))
        .subscribe()

      return () => { supabase.removeChannel(channel) }
    }
    load()
  }, [eventId])

  const handleReveal = async () => {
    if (!confirm('Reveal all photos to guests now?')) return
    setRevealing(true)
    const { error } = await supabase.rpc('reveal_event', { event_id_param: eventId })
    if (error) { showToast('Error revealing event'); setRevealing(false); return }
    setEvent((e: any) => ({ ...e, revealed: true }))
    showToast('Gallery revealed!')
    setRevealing(false)
  }

  const handleEnd = async () => {
    if (!confirm('End this event? Guests will no longer be able to join or take shots.')) return
    await supabase.from('events').update({ is_active: false, ended_at: new Date().toISOString() }).eq('id', eventId)
    setEvent((e: any) => ({ ...e, is_active: false }))
    showToast('Event ended')
  }

  const joinUrl = typeof window !== 'undefined' ? `${window.location.origin}/join/${event?.join_code}` : ''

  if (loading) return (
    <main style={{ height: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="flash-loading"><IconFlash size={40} /></div>
    </main>
  )

  return (
    <main style={{ height: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', background: 'rgba(10,10,10,0.96)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={() => router.push('/host')} style={{ width: 36, height: 36, background: 'var(--surface2)', border: 'none', borderRadius: 10, color: 'var(--text)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconBack size={18} /></button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, flex: 1, minWidth: 0 }}>
          {event?.event_type && (() => { const Icon = EVENT_TYPE_ICONS[event.event_type] || IconQuestion; return <div style={{ width: 30, height: 30, background: 'var(--surface3)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon size={16} color="#e8ff47" /></div> })()}
          <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{event?.name}</div>
          <div style={{ fontSize: 10, color: event?.is_active ? 'var(--accent)' : 'var(--muted)', fontWeight: 600 }}>
            {event?.revealed ? 'Revealed' : event?.is_active ? 'Live' : 'Ended'} · {guests.length} guests · {shots.length} shots
          </div>
          </div>
        </div>
        <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, color: 'var(--accent)', background: 'var(--accent-dim)', border: '1px solid rgba(232,255,71,0.3)', borderRadius: 7, padding: '4px 9px' }}>{event?.join_code}</div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
        {[['qr', 'QR'], ['dashboard', 'Live'], ['guests', 'Guests'], ['gallery', 'Gallery']].map(([t, l]) => (
          <button key={t} onClick={() => setTab(t as any)} style={{ flex: 1, padding: '11px 0', background: 'none', border: 'none', borderBottom: `2px solid ${tab === t ? 'var(--accent)' : 'transparent'}`, fontFamily: 'inherit', fontSize: 11, fontWeight: 700, color: tab === t ? 'var(--accent)' : 'var(--muted)', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: 0.8, transition: 'all .14s' }}>
            {l}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>

        {/* QR TAB */}
        {tab === 'qr' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '28px 20px', textAlign: 'center' }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Scan to join</h2>
            <p style={{ fontSize: 13, color: 'var(--dim)', marginBottom: 24 }}>Works in any browser — no app needed</p>

            <div style={{ background: 'white', padding: 16, borderRadius: 18, marginBottom: 22, boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
              <QRCode value={joinUrl || `https://flash.app/join/${event?.join_code}`} size={180} fgColor="#0a0a0a" bgColor="white" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 9, width: '100%', maxWidth: 300, marginBottom: 18 }}>
              {[[guests.length, 'Guests'], [shots.length, 'Shots'], [event?.shot_limit, 'Limit']].map(([n, l]) => (
                <div key={l as string} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 8px', textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 20, fontWeight: 700, color: 'var(--accent)' }}>{n}</div>
                  <div style={{ fontSize: 9, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1, marginTop: 3 }}>{l}</div>
                </div>
              ))}
            </div>

            <div onClick={() => { navigator.clipboard?.writeText(joinUrl); showToast('Link copied! ✓') }}
              style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 11, padding: '12px 15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: 300, cursor: 'pointer', marginBottom: 16 }}>
              <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, color: 'var(--dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{joinUrl}</span>
              <IconCopy size={14} color="var(--accent)" />
            </div>

            {!event?.revealed && event?.is_active && (
              <button onClick={handleReveal} disabled={revealing} style={{ width: '100%', maxWidth: 300, background: 'var(--red)', color: 'white', border: 'none', borderRadius: 13, padding: '14px 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer', marginBottom: 10 }}>
                {revealing ? 'Revealing...' : 'Reveal Gallery Now'}
              </button>
            )}
            {event?.is_active && (
              <button onClick={handleEnd} style={{ width: '100%', maxWidth: 300, background: 'transparent', color: 'var(--muted)', border: '1px solid var(--border)', borderRadius: 13, padding: '12px 20px', fontSize: 13, cursor: 'pointer' }}>
                End Event
              </button>
            )}
          </div>
        )}

        {/* DASHBOARD TAB */}
        {tab === 'dashboard' && (
          <div style={{ padding: 18 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
              {[
                { n: guests.length, l: 'Guests', Icon: IconGuests },
                { n: shots.length, l: 'Shots', Icon: IconShutter },
                { n: Math.round((shots.length / Math.max(1, guests.length * (event?.shot_limit||1))) * 100) + '%', l: 'Film Used', Icon: IconFilm },
                { n: shots.filter((s: any) => s.revealed).length, l: 'Revealed', Icon: IconReveal },
              ].map(({ n, l, Icon }) => (
                <div key={l} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
                  <div style={{ display: 'flex', marginBottom: 7 }}><Icon size={20} color="var(--accent)" /></div>
                  <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 26, fontWeight: 700, color: 'var(--accent)' }}>{n}</div>
                  <div style={{ fontSize: 9, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 }}>{l}</div>
                </div>
              ))}
            </div>

            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--dim)', marginBottom: 10 }}>Top Shooters</div>
            {[...guests].sort((a, b) => b.shots_taken - a.shots_taken).slice(0, 5).map((g, i) => (
              <div key={g.id} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 11, marginBottom: 7 }}>
                <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, color: i === 0 ? '#f4c542' : i === 1 ? '#aaa' : i === 2 ? '#c87941' : 'var(--muted)', width: 22 }}>{`#${i + 1}`}</div>
                <div style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{g.nickname}</div>
                <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 13, color: 'var(--accent)', fontWeight: 700 }}>{g.shots_taken}/{event?.shot_limit}</div>
              </div>
            ))}

            {!event?.revealed && event?.is_active && (
              <div style={{ marginTop: 20 }}>
                <button onClick={handleReveal} disabled={revealing} style={{ width: '100%', background: 'var(--red)', color: 'white', border: 'none', borderRadius: 13, padding: '14px 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                  {revealing ? 'Revealing...' : 'Reveal Gallery Now'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* GUESTS TAB */}
        {tab === 'guests' && (
          <div style={{ padding: 18 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--dim)', marginBottom: 12 }}>All Guests ({guests.length})</div>
            {guests.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--muted)', fontSize: 14 }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}></div>
                Waiting for guests to scan the QR...
              </div>
            ) : guests.map(g => (
              <div key={g.id} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, padding: '13px 14px', display: 'flex', alignItems: 'center', gap: 11, marginBottom: 8 }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--surface3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{g.avatar_emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{g.nickname}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 1 }}>{g.language.toUpperCase()} · {g.device_type || 'unknown'}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 13, color: 'var(--accent)', fontWeight: 700 }}>{g.shots_taken}</div>
                  <div style={{ width: `${(g.shots_taken / event?.shot_limit) * 40}px`, height: 3, background: 'var(--accent)', borderRadius: 2, marginTop: 4, transition: 'width .3s' }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* GALLERY TAB */}
        {tab === 'gallery' && (
          <div>
            {shots.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)', fontSize: 14 }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}></div>
                No shots yet
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 2, padding: 2 }}>
                {shots.map((s: any) => (
                  <div key={s.id} style={{ aspectRatio: '1', background: 'var(--surface2)', overflow: 'hidden', position: 'relative' }}>
                    {s.storage_url
                      ? <img src={s.thumbnail_url || s.storage_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                          <span style={{ fontSize: 16, opacity: 0.3 }}></span>
                          <span style={{ fontSize: 8, color: 'var(--muted)' }}>Processing</span>
                        </div>
                    }
                    {!s.revealed && <div style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.6)', borderRadius: 5, padding: '2px 5px', fontSize: 8, color: 'var(--muted)' }}>⏳</div>}
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '4px 6px', background: 'linear-gradient(to top,rgba(0,0,0,0.7),transparent)', fontSize: 9, color: 'white', fontWeight: 600 }}>{s.shooter_name}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Toast */}
      <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: `translateX(-50%) translateY(${toast ? 0 : 12}px)`, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 24, padding: '11px 20px', fontSize: 13, fontWeight: 600, color: 'var(--text)', zIndex: 999, opacity: toast ? 1 : 0, transition: 'all .25s', whiteSpace: 'nowrap', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', pointerEvents: 'none' }}>
        {toast}
      </div>
    </main>
  )
}
