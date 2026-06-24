'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LANGUAGES } from '@/constants/languages'
import { IconFlash, IconBack, IconShutter, IconGlobe, IconWarning, IconArrowRight, IconTarget, IconHourglass, IconStar } from '@/components/icons'

const REVEAL_LABELS: Record<string, string> = {
  instant: 'Photos appear live', end: 'Reveal at end of event',
  rolling: 'Rolling reveals', morning: 'Tomorrow at 9am', milestone: 'When everyone is done',
}

export default function JoinEventPage() {
  const params = useParams()
  const router = useRouter()
  const code = (params.code as string).toUpperCase()
  const supabase = createClient()

  const [event, setEvent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [nickname, setNickname] = useState('')
  const [lang, setLang] = useState('en')
  const [joining, setJoining] = useState(false)

  useEffect(() => {
    async function fetchEvent() {
      const { data, error } = await supabase.rpc('get_event_by_code', { code })
      if (error || !data) setError('Event not found. Check your code and try again.')
      else setEvent(data)
      setLoading(false)
    }
    fetchEvent()
  }, [code])

  const handleJoin = async () => {
    if (!nickname.trim()) return
    setJoining(true)
    try {
      const { data: guest, error } = await supabase.from('guests').insert({
        event_id: event.id, nickname: nickname.trim(), language: lang,
        device_type: /iPhone|iPad|iPod/i.test(navigator.userAgent) ? 'ios' : /Android/i.test(navigator.userAgent) ? 'android' : 'desktop',
      }).select().single()
      if (error) throw error
      localStorage.setItem(`flash_guest_${event.id}`, guest.session_token)
      localStorage.setItem(`flash_guest_id_${event.id}`, guest.id)
      localStorage.setItem('flash_event_id', event.id)
      router.push(`/join/${code}/camera`)
    } catch (e) {
      setError('Failed to join. Please try again.')
      setJoining(false)
    }
  }

  if (loading) return (
    <main style={{ height:'100vh', background:'#0a0a0a', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div className="flash-loading"><IconFlash size={40} /></div>
    </main>
  )

  if (error && !event) return (
    <main style={{ height:'100vh', background:'#0a0a0a', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:24, textAlign:'center' }}>
      <div style={{ width:64, height:64, background:'#1a1a1a', borderRadius:18, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:20 }}>
        <IconWarning size={28} color="#ff4757" />
      </div>
      <h2 style={{ fontSize:20, fontWeight:700, marginBottom:8 }}>Event not found</h2>
      <p style={{ color:'#555', marginBottom:24, fontSize:14 }}>{error}</p>
      <button onClick={() => router.push('/join')} style={{ background:'#e8ff47', color:'#000', border:'none', borderRadius:12, padding:'12px 24px', fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
        Try Again
      </button>
    </main>
  )

  return (
    <main style={{ minHeight:'100vh', background:'#0a0a0a', display:'flex', flexDirection:'column' }}>
      {/* Header */}
      <div style={{ background:'#111', padding:'28px 20px 22px', borderBottom:'1px solid #161616', textAlign:'center' }}>
        {event?.white_label && event?.brand_name && (
          <div style={{ fontSize:11, fontWeight:700, color:'#e8ff47', marginBottom:8, letterSpacing:1 }}>{event.brand_name}</div>
        )}
        <div style={{ fontSize:26, fontWeight:700, letterSpacing:-0.6, marginBottom:6, color:'#f0f0f0' }}>{event?.name}</div>
        <div style={{ fontSize:13, color:'#555', marginBottom:18 }}>You're invited to shoot</div>
        <div style={{ display:'flex', justifyContent:'center', gap:8, flexWrap:'wrap' }}>
          {[
            { Icon: IconShutter, text: `${event?.shot_limit} shots each` },
            { Icon: event?.scavenger_hunt ? IconTarget : IconGlobe, text: event?.scavenger_hunt ? 'Hunt active' : `${LANGUAGES.length} languages` },
            { Icon: IconHourglass, text: REVEAL_LABELS[event?.reveal_mode] || 'End of event' },
          ].map(({ Icon, text }) => (
            <div key={text} style={{ background:'#161616', border:'1px solid #1e1e1e', borderRadius:20, padding:'6px 12px', fontSize:11, color:'#666', display:'flex', alignItems:'center', gap:6 }}>
              <Icon size={13} color="#444" />
              {text}
            </div>
          ))}
        </div>
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:'24px 20px' }}>
        <h2 style={{ fontSize:20, fontWeight:700, letterSpacing:-0.4, marginBottom:5 }}>What's your name?</h2>
        <p style={{ fontSize:13, color:'#555', marginBottom:20, lineHeight:1.5 }}>So your shots know who took them.</p>

        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:10, fontWeight:700, letterSpacing:2, textTransform:'uppercase', color:'#444', marginBottom:8 }}>Nickname</div>
          <input value={nickname} onChange={e => setNickname(e.target.value)} maxLength={24}
            placeholder="e.g. Sarah's cousin" onKeyDown={e => e.key === 'Enter' && handleJoin()}
            style={{ background:'#111', border:'1px solid #1e1e1e', borderRadius:12, padding:'14px 16px', color:'#f0f0f0', fontSize:15, width:'100%', outline:'none', fontFamily:'inherit' }} />
        </div>

        <div style={{ marginBottom:24 }}>
          <div style={{ fontSize:10, fontWeight:700, letterSpacing:2, textTransform:'uppercase', color:'#444', marginBottom:10 }}>Language</div>
          <div style={{ display:'flex', flexDirection:'column', gap:6, maxHeight:240, overflowY:'auto' }}>
            {LANGUAGES.map(l => (
              <div key={l.code} onClick={() => setLang(l.code)} style={{
                background: lang === l.code ? 'rgba(232,255,71,0.06)' : '#111',
                border:`1px solid ${lang === l.code ? '#e8ff47' : '#1a1a1a'}`,
                borderRadius:10, padding:'11px 14px', cursor:'pointer',
                display:'flex', alignItems:'center', gap:12, transition:'all .15s'
              }}>
                <span style={{ fontSize:20, flexShrink:0, lineHeight:1 }}>{l.flag}</span>
                <span style={{ fontSize:14, fontWeight:500, color: lang === l.code ? '#e8ff47' : '#888', flex:1 }}>{l.name}</span>
                {l.dir === 'rtl' && <span style={{ fontSize:9, color:'#333', letterSpacing:0.5, fontFamily:'Space Mono,monospace' }}>RTL</span>}
                {lang === l.code && <div style={{ width:6, height:6, borderRadius:'50%', background:'#e8ff47', flexShrink:0 }} />}
              </div>
            ))}
          </div>
        </div>

        <div style={{ background:'#111', border:'1px solid #1a1a1a', borderRadius:12, padding:'14px 16px', fontSize:13, color:'#555', lineHeight:1.6, marginBottom:20 }}>
          <IconShutter size={14} color="#333" style={{ display:'inline', marginRight:6, verticalAlign:'middle' }} />
          You have <strong style={{ color:'#ccc' }}>{event?.shot_limit} shots</strong>. {REVEAL_LABELS[event?.reveal_mode] || 'Reveals at end of event'}.
        </div>

        {error && <p style={{ color:'#ff4757', fontSize:13, marginBottom:12, textAlign:'center' }}>{error}</p>}

        <button onClick={handleJoin} disabled={!nickname.trim() || joining}
          style={{ background: nickname.trim() && !joining ? '#e8ff47' : '#161616', color: nickname.trim() && !joining ? '#0a0a0a' : '#333', border:'none', borderRadius:13, padding:'15px 20px', fontSize:14, fontWeight:700, cursor: nickname.trim() && !joining ? 'pointer' : 'not-allowed', width:'100%', fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:8, transition:'all .15s' }}>
          {joining ? 'Joining...' : <><IconShutter size={18} color={nickname.trim() ? '#0a0a0a' : '#333'} /> Open Camera</>}
        </button>
      </div>
    </main>
  )
}
