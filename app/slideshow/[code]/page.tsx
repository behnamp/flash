'use client'
import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SlideshowPage() {
  const params = useParams()
  const code = (params.code as string).toUpperCase()
  const supabase = createClient()

  const [event, setEvent] = useState<any>(null)
  const [shots, setShots] = useState<any[]>([])
  const [current, setCurrent] = useState(0)
  const [loading, setLoading] = useState(true)
  const [newPhoto, setNewPhoto] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)
  const prevCountRef = useRef(0)

  useEffect(() => {
    async function load() {
      const { data: ev } = await supabase
        .from('events')
        .select('id, name, cover_color, cover_image_url, cover_emoji, reveal_mode, revealed')
        .eq('join_code', code)
        .single()
      if (!ev) return
      setEvent(ev)

      // Load existing shots
      const { data: s } = await supabase
        .from('shots')
        .select('id, storage_url, taken_at, shooter_name, mode_name')
        .eq('event_id', ev.id)
        .order('taken_at', { ascending: false })
      if (s) { setShots(s); prevCountRef.current = s.length }
      setLoading(false)

      // Realtime new shots
      const channel = supabase.channel(`slideshow-${ev.id}`)
        .on('postgres_changes', {
          event: 'INSERT', schema: 'public', table: 'shots',
          filter: `event_id=eq.${ev.id}`
        }, (payload) => {
          setShots(prev => {
            const next = [payload.new as any, ...prev]
            // Flash new photo indicator
            setNewPhoto(true)
            setTimeout(() => setNewPhoto(false), 3000)
            // Jump to newest
            setCurrent(0)
            return next
          })
        })
        .subscribe()

      return () => { supabase.removeChannel(channel) }
    }
    load()
  }, [code])

  // Auto-advance slideshow
  useEffect(() => {
    if (shots.length < 2) return
    intervalRef.current = setInterval(() => {
      setCurrent(c => (c + 1) % shots.length)
    }, 4000)
    return () => clearInterval(intervalRef.current)
  }, [shots.length])

  if (loading) return (
    <div style={{ height: '100dvh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 2, height: 40, background: '#e8ff47', animation: 'blink 1s infinite' }} />
      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:.1}}`}</style>
    </div>
  )

  const shot = shots[current]
  const total = shots.length

  return (
    <div style={{ height: '100dvh', width: '100vw', background: '#000', position: 'relative', overflow: 'hidden', fontFamily: "'Space Grotesk', sans-serif" }}>

      {/* BACKGROUND — blurred version of current photo */}
      {shot?.storage_url && (
        <div style={{
          position: 'absolute', inset: -40,
          backgroundImage: `url(${shot.storage_url})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          filter: 'blur(40px) brightness(0.25)',
          transition: 'background-image .8s ease',
        }} />
      )}

      {/* Empty state */}
      {total === 0 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
          <div style={{ fontSize: 64 }}>{event?.cover_emoji || '⚡'}</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#fff', textAlign: 'center', letterSpacing: -0.5 }}>{event?.name}</div>
          <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.4)' }}>Waiting for photos...</div>
          <div style={{ marginTop: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '14px 28px', fontSize: 18, color: 'rgba(255,255,255,0.5)', fontFamily: 'Space Mono, monospace', letterSpacing: 3 }}>
            {code}
          </div>
        </div>
      )}

      {/* MAIN PHOTO */}
      {shot?.storage_url && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 80px 100px' }}>
          <img
            key={shot.id}
            src={shot.storage_url}
            alt=""
            style={{
              maxWidth: '100%', maxHeight: '100%',
              objectFit: 'contain',
              borderRadius: 20,
              boxShadow: '0 40px 120px rgba(0,0,0,0.8)',
              animation: 'fadeIn .6s ease',
            }}
          />
        </div>
      )}

      {/* TOP BAR */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 'max(28px, calc(env(safe-area-inset-top) + 16px))', paddingBottom: 28, paddingLeft: 40, paddingRight: 40 }}>
        {/* Flash logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, background: '#e8ff47', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#0a0a0a"><path d="M13 2L4.5 13.5H11L10 22L20 10H13.5L13 2Z"/></svg>
          </div>
          <span style={{ fontSize: 16, fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>Flash</span>
        </div>

        {/* Event name */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#fff', letterSpacing: -0.5 }}>{event?.name}</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>Live Slideshow</div>
        </div>

        {/* Join code */}
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 4, letterSpacing: 1, textTransform: 'uppercase' }}>Join at flashcam.app</div>
          <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 20, fontWeight: 700, color: '#e8ff47', letterSpacing: 4 }}>{code}</div>
        </div>
      </div>

      {/* PHOTO INFO — bottom left */}
      {shot && (
        <div style={{ position: 'absolute', bottom: 'max(32px, calc(env(safe-area-inset-bottom) + 20px))', left: 40, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{shot.shooter_name}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>
              {shot.mode_name} · {new Date(shot.taken_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      )}

      {/* PHOTO COUNTER — bottom right */}
      {total > 0 && (
        <div style={{ position: 'absolute', bottom: 'max(32px, calc(env(safe-area-inset-bottom) + 20px))', right: 40, display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Dot indicators (max 12) */}
          <div style={{ display: 'flex', gap: 6 }}>
            {Array.from({ length: Math.min(total, 12) }).map((_, i) => (
              <div key={i} onClick={() => setCurrent(i)}
                style={{ width: i === current % 12 ? 20 : 6, height: 6, borderRadius: 3, background: i === current % 12 ? '#e8ff47' : 'rgba(255,255,255,0.2)', transition: 'all .3s', cursor: 'pointer' }} />
            ))}
          </div>
          <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
            {current + 1}/{total}
          </div>
        </div>
      )}

      {/* NEW PHOTO FLASH */}
      {newPhoto && (
        <div style={{ position: 'absolute', top: 'max(20px, calc(env(safe-area-inset-top) + 8px))', left: '50%', transform: 'translateX(-50%)', background: 'rgba(232,255,71,0.95)', borderRadius: 100, padding: '8px 20px', display: 'flex', alignItems: 'center', gap: 8, animation: 'slideDown .3s ease' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#0a0a0a', animation: 'pulse 1s infinite' }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: '#0a0a0a' }}>New photo!</span>
        </div>
      )}

      {/* Progress bar */}
      {total > 1 && (
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: 'rgba(255,255,255,0.08)' }}>
          <div style={{ height: '100%', background: '#e8ff47', animation: 'progress 4s linear infinite', transformOrigin: 'left' }} />
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: scale(1.02) } to { opacity: 1; transform: scale(1) } }
        @keyframes slideDown { from { opacity: 0; transform: translateX(-50%) translateY(-10px) } to { opacity: 1; transform: translateX(-50%) translateY(0) } }
        @keyframes progress { from { transform: scaleX(0) } to { transform: scaleX(1) } }
        @keyframes pulse { 0%,100% { opacity: 1 } 50% { opacity: .3 } }
        @keyframes blink { 0%,100% { opacity: 1 } 50% { opacity: .1 } }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  )
}
