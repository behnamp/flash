'use client'
import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { IconFlash, IconShutter, IconGallery, IconBack, IconSave, IconHourglass, IconHeart, IconFire, IconLaugh, IconStar, IconWarningCircle } from '@/components/icons'

export default function GuestGalleryPage() {
  const params = useParams()
  const router = useRouter()
  const code = params.code as string
  const supabase = createClient()
  const [guestId, setGuestId] = useState<string | null>(null)

  const [event, setEvent] = useState<any>(null)
  const [shots, setShots] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<any>(null)
  const [secs, setSecs] = useState(0)
  const [reactions, setReactions] = useState<Record<string, Record<string, boolean>>>({})

  const loadShots = useCallback(async (eventId: string) => {
    const { data } = await supabase.from('shots').select('*, guests(nickname, avatar_emoji)').eq('event_id', eventId).order('taken_at', { ascending: false })
    if (data) setShots(data)
  }, [supabase])

  const handleDeleteMyShot = async (shotId: string, storagePath: string) => {
    if (!confirm('Delete your photo?')) return
    try {
      if (storagePath) await supabase.storage.from('shots').remove([storagePath])
      await supabase.from('shots').delete().eq('id', shotId)
    } catch (e) { console.error(e) }
  }

  useEffect(() => {
    async function load() {
      // Resolve event from code in URL (reliable — avoids stale localStorage key)
      const { data: ev } = await supabase.from('events').select('*').eq('join_code', code.toUpperCase()).single()
      if (!ev) { router.push(`/join/${code}`); return }
      const eventId = ev.id
      const storedGuest = localStorage.getItem(`flash_guest_${eventId}`)
      if (!storedGuest) { router.push(`/join/${code}`); return }
      const storedGuestId = JSON.parse(storedGuest).id
      setGuestId(storedGuestId)
      setEvent(ev)
      if (ev.reveal_at) setSecs(Math.max(0, Math.floor((new Date(ev.reveal_at).getTime() - Date.now()) / 1000)))
      await loadShots(eventId)
      setLoading(false)
      const channel = supabase.channel(`gallery-${eventId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'shots', filter: `event_id=eq.${eventId}` }, () => loadShots(eventId))
        .subscribe()
      return () => { supabase.removeChannel(channel) }
    }
    load()
  }, [code])

  useEffect(() => { const t = setInterval(() => setSecs(s => Math.max(0, s - 1)), 1000); return () => clearInterval(t) }, [])

  const fmt = (s: number) => `${Math.floor(s/3600).toString().padStart(2,'0')}:${Math.floor((s%3600)/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`
  const isVisible = (s: any) => s.revealed || s.guest_id === guestId
  const visibleShots = shots.filter(isVisible)
  const myShots = shots.filter(s => s.guest_id === guestId)
  const developingShots = myShots.filter(s => !s.revealed)

  const REACTIONS = [
    { key: 'heart', Icon: IconHeart, label: '12' },
    { key: 'fire', Icon: IconFire, label: '7' },
    { key: 'laugh', Icon: IconLaugh, label: '3' },
    { key: 'wow', Icon: IconStar, label: '2' },
  ]

  if (loading) return (
    <main style={{ height:'100vh', background:'#0a0a0a', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div className="flash-loading"><IconFlash size={40} /></div>
    </main>
  )

  if (selected) {
    const isMyShot = selected.guest_id === guestId
    const isDev = isMyShot && !selected.revealed
    return (
      <main style={{ height:'100vh', background:'#000', display:'flex', flexDirection:'column' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, padding:'13px 16px', background:'rgba(0,0,0,0.9)', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
          <button onClick={() => setSelected(null)} style={{ width:36, height:36, background:'rgba(255,255,255,0.08)', border:'none', borderRadius:10, color:'white', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <IconBack size={18} />
          </button>
          <span style={{ color:'white', fontWeight:600, fontSize:14, flex:1 }}>by {selected.guests?.nickname || 'Guest'}</span>
          {isDev && <div style={{ background:'rgba(232,255,71,0.1)', border:'1px solid rgba(232,255,71,0.2)', borderRadius:8, padding:'4px 10px', fontSize:10, color:'#e8ff47', fontWeight:600, letterSpacing:0.5 }}>DEVELOPING</div>}
          <button onClick={() => alert('Saved!')} style={{ width:36, height:36, background:'rgba(255,255,255,0.08)', border:'none', borderRadius:10, color:'white', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <IconSave size={16} />
          </button>
        </div>
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
          {selected.storage_url
            ? <img src={selected.storage_url} alt="" style={{ maxWidth:'100%', maxHeight:'100%', objectFit:'contain' }} />
            : <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:12, opacity:0.3 }}><IconShutter size={64} /><span style={{ fontSize:13, color:'white' }}>Processing...</span></div>
          }
          <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:18, background:'linear-gradient(to top,rgba(0,0,0,0.88),transparent)' }}>
            <div style={{ fontSize:13, fontWeight:600, color:'white', marginBottom:2 }}>by {selected.guests?.nickname}</div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginBottom:12 }}>{selected.mode_name || 'Kodak Gold'} · {new Date(selected.taken_at).toLocaleTimeString()}</div>
            {selected.caption && <div style={{ background:'rgba(255,255,255,0.07)', borderRadius:9, padding:'9px 12px', fontSize:13, color:'rgba(255,255,255,0.8)', marginBottom:12, fontStyle:'italic' }}>"{selected.caption}"</div>}
            <div style={{ display:'flex', gap:8 }}>
              {REACTIONS.map(({ key, Icon, label }) => (
                <button key={key} onClick={() => {}} style={{ background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:20, padding:'7px 13px', cursor:'pointer', color:'rgba(255,255,255,0.7)', fontFamily:'inherit', fontSize:12, display:'flex', alignItems:'center', gap:6, fontWeight:600 }}>
                  <Icon size={14} color="rgba(255,255,255,0.6)" />{label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main style={{ height:'100vh', background:'#0a0a0a', display:'flex', flexDirection:'column' }}>
      <div style={{ padding:'16px 18px 0', borderBottom:'1px solid #161616' }}>
        <div style={{ fontSize:18, fontWeight:700, letterSpacing:-0.4, marginBottom:3 }}>{event?.name}</div>
        <div style={{ fontSize:12, color:'#444', marginBottom:11 }}>{myShots.length} your shots · {shots.filter(s=>s.revealed).length} revealed</div>

        {!event?.revealed && event?.reveal_mode !== 'instant' && (
          <div style={{ background:'#111', border:'1px solid #1a1a1a', borderRadius:10, padding:'11px 14px', display:'flex', alignItems:'center', gap:11, marginBottom:11 }}>
            <IconHourglass size={18} color="#444" />
            <div>
              <div style={{ fontSize:11, color:'#555' }}>{event?.reveal_mode === 'morning' ? 'Reveals tomorrow at 9am' : event?.reveal_mode === 'milestone' ? "Reveals when everyone's done" : 'Reveals at end of event'}</div>
              {secs > 0 && <div style={{ fontFamily:'Space Mono,monospace', fontSize:15, fontWeight:700, color:'#e8ff47', marginTop:2 }}>{fmt(secs)}</div>}
            </div>
          </div>
        )}

        {developingShots.length > 0 && (
          <div style={{ background:'rgba(232,255,71,0.04)', border:'1px solid rgba(232,255,71,0.12)', borderRadius:10, padding:'10px 14px', marginBottom:11, fontSize:12, color:'#e8ff47', display:'flex', alignItems:'center', gap:8 }}>
            <IconWarningCircle size={14} color="#e8ff47" />
            {developingShots.length} of your shots are developing — visible only to you until reveal
          </div>
        )}

        <div style={{ display:'flex' }}>
          <button onClick={() => router.push(`/join/${code}/camera`)} style={{ flex:1, padding:'10px 0', background:'none', border:'none', borderBottom:'2px solid transparent', cursor:'pointer', fontFamily:'inherit', fontSize:11, fontWeight:700, color:'#333', textTransform:'uppercase', letterSpacing:0.8, display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3" fill="#333" stroke="none"/></svg>
            Camera
          </button>
          <button style={{ flex:1, padding:'10px 0', background:'none', border:'none', borderBottom:'2px solid #e8ff47', cursor:'default', fontFamily:'inherit', fontSize:11, fontWeight:700, color:'#e8ff47', textTransform:'uppercase', letterSpacing:0.8, display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#e8ff47" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5" fill="#e8ff47" stroke="none"/><polyline points="21,15 16,10 5,21" stroke="#e8ff47"/></svg>
            Gallery
          </button>
        </div>
      </div>

      <div style={{ flex:1, overflowY:'auto' }}>
        {visibleShots.length === 0
          ? <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:240, gap:12 }}>
              <IconShutter size={40} color="#222" />
              <div style={{ fontSize:14, color:'#333', fontWeight:500 }}>No shots yet — go take some!</div>
            </div>
          : <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:2, padding:2 }}>
              {visibleShots.map(s => {
                const isDev = s.guest_id === guestId && !s.revealed
                return (
                  <div key={s.id} onClick={() => setSelected(s)} style={{ aspectRatio:'1', overflow:'hidden', position:'relative', background:'#111', cursor:'pointer' }}>
                    {s.storage_url
                      ? <img src={s.storage_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', filter: isDev ? 'brightness(0.6)' : 'none' }} />
                      : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}><IconShutter size={24} color="#222" /></div>
                    }
                    {isDev && <div style={{ position:'absolute', top:5, left:5, background:'rgba(232,255,71,0.9)', borderRadius:5, padding:'2px 7px', fontSize:8, fontWeight:800, color:'#000', letterSpacing:0.5 }}>YOURS</div>}
                    {!s.revealed && !isDev && (
                      <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'#111', gap:4 }}>
                        <IconHourglass size={18} color="#2a2a2a" className="pulse" />
                        <span style={{ fontSize:8, color:'#2a2a2a', textTransform:'uppercase', letterSpacing:1 }}>Developing</span>
                      </div>
                    )}
                    <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'4px 5px', background:'linear-gradient(to top,rgba(0,0,0,0.7),transparent)', fontSize:8, color:'rgba(255,255,255,0.7)', fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {s.guests?.nickname}
                    </div>
                  </div>
                )
              })}
            </div>
        }
      </div>

      <div style={{ display:'flex', borderTop:'1px solid #161616', background:'rgba(10,10,10,0.97)' }}>
        {[
          { Icon: IconShutter, label:'Camera', fn: () => router.push(`/join/${code}/camera`), active: false },
          { Icon: IconGallery, label:'Gallery', fn: () => {}, active: true },
        ].map(({ Icon, label, fn, active }) => (
          <button key={label} onClick={fn} style={{ flex:1, padding:'12px 0', background:'none', border:'none', cursor:'pointer', fontFamily:'inherit', fontSize:10, fontWeight:700, color: active ? '#e8ff47' : '#333', textTransform:'uppercase', letterSpacing:0.8, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
            <Icon size={20} color={active ? '#e8ff47' : '#333'} />
            {label}
          </button>
        ))}
      </div>
    </main>
  )
}
