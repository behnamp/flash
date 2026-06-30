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
  const [reelGenerating, setReelGenerating] = useState(false)
  const [reelUrl, setReelUrl] = useState<string | null>(null)
  const [reelStatus, setReelStatus] = useState('none')
  const [tab, setTab] = useState<'qr' | 'dashboard' | 'guests' | 'gallery'>('qr')
  const [selectedShot, setSelectedShot] = useState<any>(null)
  const [toast, setToast] = useState('')
  const toastRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const channelRef = useRef<any>(null)
  const reelPollRef = useRef<ReturnType<typeof setInterval> | null>(null)

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
      channelRef.current = channel
    }
    load()
    return () => {
      if (channelRef.current) { supabase.removeChannel(channelRef.current); channelRef.current = null }
      if (reelPollRef.current) { clearInterval(reelPollRef.current); reelPollRef.current = null }
    }
  }, [eventId])

  const handleDeleteShot = async (shotId: string, storagePath?: string) => {
    if (!confirm('Delete this photo?')) return
    try {
      // Fetch storage_path from shots table if not provided (shot_gallery view doesn't include it)
      let path = storagePath
      if (!path) {
        const { data } = await supabase.from('shots').select('storage_path').eq('id', shotId).single()
        path = data?.storage_path
      }
      if (path) await supabase.storage.from('shots').remove([path])
      await supabase.from('shots').delete().eq('id', shotId)
      setShots(prev => prev.filter((s: any) => s.id !== shotId))
      setSelectedShot(null)
      showToast('Photo deleted')
    } catch (e) { showToast('Failed to delete') }
  }

  const generateReel = async () => {
    if (!eventId || reelGenerating) return
    setReelGenerating(true); setReelStatus('generating')
    try {
      const res = await fetch('/api/reel', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ eventId }) })
      const data = await res.json()
      if (data.error) { showToast(data.error); setReelGenerating(false); setReelStatus('none'); return }
      const poll = setInterval(async () => {
        const r = await fetch(`/api/reel?jobId=${data.jobId}&eventId=${eventId}`)
        const s = await r.json()
        if (s.status === 'done' && s.url) { setReelUrl(s.url); setReelStatus('done'); setReelGenerating(false); clearInterval(poll); reelPollRef.current = null; showToast('AI Reel ready!') }
        else if (s.status === 'failed') { setReelStatus('failed'); setReelGenerating(false); clearInterval(poll); reelPollRef.current = null; showToast('Reel failed') }
      }, 10000)
      reelPollRef.current = poll
    } catch { showToast('Failed to start reel'); setReelGenerating(false); setReelStatus('none') }
  }

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
    <main style={{ height: '100dvh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="flash-loading"><IconFlash size={40} /></div>
    </main>
  )

  return (
    <main style={{ height: '100dvh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
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

            {/* Slideshow button — opens in-app (mirror to TV via AirPlay/screen-share) */}
            <button onClick={() => {
                const url = `/slideshow/${event?.join_code}`
                const isNative = !!(window as any).Capacitor?.isNativePlatform?.()
                if (isNative) { router.push(url); return }
                const w = window.open(url, '_blank')
                if (!w) router.push(url) // popup blocked → open in-app
              }}
              style={{ width: '100%', maxWidth: 300, background: 'rgba(232,255,71,0.08)', color: 'var(--accent)', border: '1px solid rgba(232,255,71,0.25)', borderRadius: 13, padding: '13px 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
              Open slideshow
            </button>

            {/* Copy slideshow link — open on a TV / laptop browser */}
            <button onClick={async () => {
                const link = `${window.location.origin}/slideshow/${event?.join_code}`
                try {
                  await navigator.clipboard.writeText(link)
                  showToast('Slideshow link copied — open it on your TV')
                } catch {
                  showToast(link)
                }
              }}
              style={{ width: '100%', maxWidth: 300, background: 'transparent', color: 'var(--dim)', border: 'none', borderRadius: 13, padding: '4px 20px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <IconCopy size={12} color="var(--dim)" />
              Copy link to open on a TV
            </button>

            {/* Scan poster button */}
            <button onClick={() => router.push(`/host/${eventId}/poster`)}
              style={{ width: '100%', maxWidth: 300, background: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 13, padding: '13px 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer', marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 7h4v4H7zM13 13h4v4h-4zM13 7h4M7 13v4"/>
              </svg>
              Scan poster / table tent
            </button>

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
                  <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 26, fontWeight: 700, color: '#f0f0f0' }}>{n}</div>
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
                <button onClick={handleReveal} disabled={revealing} style={{ width: '100%', background: 'var(--red)', color: 'white', border: 'none', borderRadius: 13, paddingBottom: '14px', paddingLeft: 20, paddingRight: 20, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                  {revealing ? 'Revealing...' : 'Reveal Gallery Now'}
                </button>
              </div>
            )}

            {/* AI Highlight Reel — shows after reveal */}
            {event?.revealed && (
              <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 14, padding: '16px', marginTop: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
                  <span style={{ fontSize: 14, fontWeight: 700 }}>AI Highlight Reel</span>
                  <span style={{ fontSize: 9, background: 'rgba(232,255,71,0.1)', color: 'var(--accent)', border: '1px solid rgba(232,255,71,0.2)', borderRadius: 5, padding: '2px 6px', fontWeight: 700, letterSpacing: 1 }}>BETA</span>
                </div>
                <div style={{ fontSize: 12, color: '#555', marginBottom: 12 }}>Cinematic 15-sec video from your best shots using Seedance 2.0.</div>

                {reelStatus === 'done' && reelUrl ? (
                  <div>
                    <video src={reelUrl} controls playsInline style={{ width: '100%', borderRadius: 10, marginBottom: 10, background: '#000' }} />
                    <div style={{ display: 'flex', gap: 8 }}>
                      <a href={reelUrl} download target="_blank"
                        style={{ flex: 1, background: 'var(--accent)', color: '#0a0a0a', borderRadius: 10, padding: '12px', fontSize: 13, fontWeight: 700, textAlign: 'center', textDecoration: 'none', display: 'block' }}>
                        Download
                      </a>
                      <button onClick={generateReel} style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 10, padding: '12px 14px', fontSize: 12, color: '#555', cursor: 'pointer', fontFamily: 'inherit' }}>
                        Regenerate
                      </button>
                    </div>
                  </div>
                ) : reelStatus === 'generating' ? (
                  <div style={{ textAlign: 'center', padding: '16px 0' }}>
                    <div style={{ display: 'flex', gap: 5, justifyContent: 'center', marginBottom: 8 }}>
                      {[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', animation: `bounce 1s ease ${i*0.15}s infinite` }} />)}
                    </div>
                    <div style={{ fontSize: 12, color: '#555' }}>Generating reel... (~3 min)</div>
                  </div>
                ) : (
                  <button onClick={generateReel}
                    style={{ width: '100%', background: 'rgba(232,255,71,0.07)', color: 'var(--accent)', border: '1px solid rgba(232,255,71,0.2)', borderRadius: 10, padding: '12px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    Generate AI Reel
                  </button>
                )}
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
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.2" strokeLinecap="round" style={{ marginBottom: 12, display: 'block', margin: '0 auto 12px' }}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3" fill="#333" stroke="none"/></svg>
                <div>No photos yet</div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 2, padding: 2 }}>
                {shots.map((s: any) => (
                  <div key={s.id} onClick={() => setSelectedShot(s)}
                    style={{ aspectRatio: '1', background: 'var(--surface2)', overflow: 'hidden', position: 'relative', cursor: 'pointer' }}>
                    {s.storage_url
                      ? <img src={s.thumbnail_url || s.storage_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ width: '100%', height: '100%', background: '#1a1a1a' }} />
                    }
                    {!s.revealed && (
                      <div style={{ position: 'absolute', top: 4, right: 4, width: 20, height: 20, background: 'rgba(0,0,0,0.65)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><path d="M18 8h-1V6A5 5 0 0 0 6 6v2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2zm-6 9a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm3.1-9H8.9V6a3.1 3.1 0 0 1 6.2 0v2z"/></svg>
                      </div>
                    )}
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 6px 4px', background: 'linear-gradient(to top,rgba(0,0,0,0.75),transparent)', fontSize: 9, color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>
                      {s.shooter_name}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* HOST PHOTO LIGHTBOX */}
        {selectedShot && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.96)', zIndex: 200, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '14px', paddingLeft: 16, paddingRight: 16, flexShrink: 0 }}>
              <button onClick={() => setSelectedShot(null)}
                style={{ width: 36, height: 36, background: '#161616', border: 'none', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#f0f0f0' }}>{selectedShot.shooter_name}</div>
                <div style={{ fontSize: 11, color: '#555' }}>{selectedShot.mode_name} · {new Date(selectedShot.taken_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
              </div>
              <button onClick={() => handleDeleteShot(selectedShot.id, selectedShot.storage_path)}
                style={{ width: 36, height: 36, background: '#1a0a0a', border: '1px solid rgba(255,71,87,0.3)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ff4757" strokeWidth="2" strokeLinecap="round">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                </svg>
              </button>
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 8px' }}>
              {selectedShot.storage_url
                ? <img src={selectedShot.storage_url} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 10 }} />
                : <div style={{ width: '80%', aspectRatio: '3/4', background: '#111', borderRadius: 10 }} />
              }
            </div>
            <div style={{ paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }} />
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
