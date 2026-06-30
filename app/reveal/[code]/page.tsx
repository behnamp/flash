'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CinematicReveal } from '@/components/CinematicReveal'

type Stage = 'loading' | 'intro' | 'developing' | 'revealing' | 'finale'

export default function RevealPage() {
  const params = useParams()
  const router = useRouter()
  const code = (params.code as string)?.toUpperCase()
  const supabase = createClient()

  const [stage, setStage] = useState<Stage>('loading')
  const [event, setEvent] = useState<any>(null)
  const [shots, setShots] = useState<any[]>([])
  const [revealedCount, setRevealedCount] = useState(0)
  const [skipReady, setSkipReady] = useState(false)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = [] }
  const after = (ms: number, fn: () => void) => { timers.current.push(setTimeout(fn, ms)) }

  // Load event + revealed shots
  useEffect(() => {
    let cancelled = false
    async function load() {
      const { data: ev } = await supabase
        .from('events')
        .select('id, name, revealed, cover_emoji')
        .eq('join_code', code)
        .single()
      if (!ev) { router.push(`/join/${code}`); return }
      if (cancelled) return
      setEvent(ev)

      // If not yet revealed, wait for it via realtime, show a holding screen
      if (!ev.revealed) {
        const channel = supabase.channel(`reveal-wait-${ev.id}`)
          .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'events', filter: `id=eq.${ev.id}` },
            (payload: any) => { if (payload.new?.revealed) { supabase.removeChannel(channel); fetchAndStart(ev) } })
          .subscribe()
        return
      }
      fetchAndStart(ev)
    }
    load()
    return () => { cancelled = true; clearTimers() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code])

  const fetchAndStart = useCallback(async (ev: any) => {
    const { data } = await supabase
      .from('shots')
      .select('id, storage_url, mode_name, taken_at')
      .eq('event_id', ev.id)
      .eq('revealed', true)
      .order('taken_at', { ascending: true })
    const list = (data || []).filter((s: any) => s.storage_url)
    setShots(list)
    runSequence(list.length)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Orchestrate the cinematic timeline
  const runSequence = (count: number) => {
    clearTimers()
    setStage('intro')
    after(2600, () => setStage('developing'))
    after(2600, () => setSkipReady(true))

    // During developing, count up the photo counter for drama
    const devStart = 3200
    const countDuration = 2400
    const steps = Math.min(count, 40) || 1
    for (let i = 1; i <= steps; i++) {
      after(devStart + (countDuration / steps) * i, () => setRevealedCount(Math.round((count / steps) * i)))
    }

    after(6400, () => setStage('revealing'))
    // CinematicReveal handles its own stagger; wait for the grid to settle then show finale
    const revealDuration = Math.min(count, 20) * 50 + 1400
    after(6400 + revealDuration, () => setStage('finale'))
  }

  const goGallery = () => {
    if (event?.id) localStorage.setItem(`flash_reveal_seen_${event.id}`, '1')
    router.push(`/join/${code}/gallery`)
  }

  const skip = () => { clearTimers(); setRevealedCount(shots.length); setStage('finale') }


  // ── WAITING (not yet revealed) ──
  if (stage === 'loading' && event && !event.revealed) {
    return (
      <Shell>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
          <Bolt size={56} glow />
          <div style={{ fontSize: 13, letterSpacing: 3, textTransform: 'uppercase', color: '#555', fontFamily: 'Space Mono, monospace' }}>The roll isn't ready yet</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#f0f0f0', maxWidth: 280, lineHeight: 1.3 }}>Hang tight — {event.name?.trim() || 'the host'} hasn't revealed the gallery</div>
          <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
            {[0,1,2].map(i => <Dot key={i} delay={i * 0.25} />)}
          </div>
        </div>
      </Shell>
    )
  }

  if (stage === 'loading') {
    return <Shell><div style={{ width: 2, height: 36, background: '#e8ff47', animation: 'flashBlink 1s ease-in-out infinite' }} /><GlobalCSS /></Shell>
  }

  return (
    <Shell red={stage === 'developing'}>
      {/* Film grain overlay */}
      <Grain intense={stage === 'developing'} />

      {/* ── INTRO ── */}
      {stage === 'intro' && (
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, animation: 'revealFadeIn .8s ease both' }}>
          <Bolt size={64} glow />
          <div style={{ fontSize: 11, letterSpacing: 5, textTransform: 'uppercase', color: '#666', fontFamily: 'Space Mono, monospace', animation: 'revealFadeIn 1s ease .3s both' }}>Flash</div>
          <div style={{ fontSize: 30, fontWeight: 800, color: '#f0f0f0', letterSpacing: -0.5, animation: 'revealRise .9s cubic-bezier(.2,.7,.2,1) .5s both' }}>The roll is ready.</div>
        </div>
      )}

      {/* ── DEVELOPING ── */}
      {stage === 'developing' && (
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26, animation: 'revealFadeIn .6s ease both' }}>
          {/* Film canister */}
          <div style={{ position: 'relative', width: 90, height: 90, animation: 'devShake 0.18s ease-in-out infinite' }}>
            <div style={{ position: 'absolute', inset: 0, borderRadius: 20, background: 'linear-gradient(145deg,#1a1a1a,#2a2a2a)', border: '1px solid rgba(255,45,45,0.25)', boxShadow: '0 0 40px rgba(255,45,45,0.35)' }} />
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ff5d5d" strokeWidth="1.4">
                <rect x="3" y="6" width="18" height="13" rx="2"/><circle cx="12" cy="12.5" r="3.2"/><path d="M7 6V4h4v2"/>
              </svg>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', color: 'rgba(255,93,93,0.85)', fontFamily: 'Space Mono, monospace', marginBottom: 10 }}>Developing</div>
            <div style={{ fontSize: 44, fontWeight: 800, color: '#fff', fontFamily: 'Space Mono, monospace', letterSpacing: -1, lineHeight: 1 }}>
              {revealedCount}
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 8 }}>{revealedCount === 1 ? 'photo' : 'photos'} from the night</div>
          </div>
          {/* Progress shimmer bar */}
          <div style={{ width: 200, height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: 'linear-gradient(90deg,#ff2d2d,#ff8a3d)', animation: 'devFill 3.6s cubic-bezier(.3,.1,.3,1) both' }} />
          </div>
        </div>
      )}

      {/* ── REVEALING (photos develop in) ── */}
      {(stage === 'revealing' || stage === 'finale') && (
        <div style={{ position: 'absolute', inset: 0, overflowY: 'auto', overflowX: 'hidden' }}>
          {shots.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center' }}>
              <div>
                <div style={{ fontSize: 48, marginBottom: 16 }}>{event?.cover_emoji || '📸'}</div>
                <div style={{ fontSize: 18, color: '#888', fontWeight: 600 }}>No photos this time</div>
              </div>
            </div>
          ) : (
            <CinematicReveal
              photos={shots.map(s => ({ id: s.id, url: s.storage_url, mode: s.mode_name }))}
              className="px-3 pt-6 pb-48"
            />
          )}
        </div>
      )}

      {/* ── FINALE overlay ── */}
      {stage === 'finale' && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 'max(48px, calc(env(safe-area-inset-bottom) + 40px))', background: 'linear-gradient(to bottom, transparent 40%, rgba(10,10,10,0.5) 70%, rgba(10,10,10,0.96))', animation: 'revealFadeIn 1s ease both' }}>
          <div style={{ textAlign: 'center', padding: '0 28px', animation: 'revealRise .8s cubic-bezier(.2,.7,.2,1) .2s both' }}>
            <div style={{ fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', color: '#e8ff47', fontFamily: 'Space Mono, monospace', marginBottom: 12 }}>
              {shots.length > 0 ? `${shots.length} ${shots.length === 1 ? 'moment' : 'moments'}, revealed` : 'The reveal'}
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#fff', letterSpacing: -0.5, marginBottom: 4, lineHeight: 1.2 }}>{event?.name?.trim() || 'Your event'}</div>
            <button onClick={goGallery}
              style={{ marginTop: 22, background: '#e8ff47', color: '#0a0a0a', border: 'none', borderRadius: 16, padding: '17px 40px', fontSize: 16, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 10, boxShadow: '0 8px 32px rgba(232,255,71,0.25)' }}>
              Open the gallery
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </button>
          </div>
        </div>
      )}

      {/* Skip button */}
      {skipReady && stage !== 'finale' && (
        <button onClick={skip}
          style={{ position: 'absolute', top: 'max(18px, calc(env(safe-area-inset-top) + 6px))', right: 18, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 100, padding: '8px 16px', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontFamily: 'inherit', zIndex: 50 }}>
          Skip ›
        </button>
      )}

      <GlobalCSS />
    </Shell>
  )
}

/* ── Sub-components ── */

function Shell({ children, red }: { children: React.ReactNode; red?: boolean }) {
  return (
    <main style={{ position: 'fixed', inset: 0, height: '100dvh', width: '100vw', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', fontFamily: "'Space Grotesk', sans-serif" }}>
      {/* Darkroom red wash */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 45%, rgba(255,45,45,0.18), transparent 65%)', opacity: red ? 1 : 0, transition: 'opacity 1s ease', pointerEvents: 'none' }} />
      {children}
    </main>
  )
}

function Bolt({ size = 48, glow }: { size?: number; glow?: boolean }) {
  return (
    <div style={{ width: size, height: size, background: '#e8ff47', borderRadius: size * 0.28, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: glow ? '0 0 50px rgba(232,255,71,0.45)' : 'none', animation: glow ? 'boltPulse 2s ease-in-out infinite' : 'none' }}>
      <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="#0a0a0a"><path d="M13 2L4.5 13.5H11L10 22L20 10H13.5L13 2Z"/></svg>
    </div>
  )
}

function Dot({ delay }: { delay: number }) {
  return <div style={{ width: 7, height: 7, borderRadius: 4, background: '#e8ff47', animation: `dotPulse 1.2s ease-in-out ${delay}s infinite` }} />
}

function Grain({ intense }: { intense?: boolean }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none', opacity: intense ? 0.12 : 0.05, mixBlendMode: 'overlay',
      backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
      animation: 'grainShift .4s steps(2) infinite',
    }} />
  )
}

function GlobalCSS() {
  return <style>{`
    @keyframes flashBlink { 0%,100%{opacity:1} 50%{opacity:.15} }
    @keyframes boltPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.06)} }
    @keyframes dotPulse { 0%,100%{opacity:.2;transform:scale(.8)} 50%{opacity:1;transform:scale(1)} }
    @keyframes revealFadeIn { from{opacity:0} to{opacity:1} }
    @keyframes revealRise { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
    @keyframes devShake { 0%,100%{transform:rotate(-1.5deg)} 50%{transform:rotate(1.5deg)} }
    @keyframes devFill { from{width:0%} to{width:100%} }
    @keyframes grainShift { 0%{transform:translate(0,0)} 100%{transform:translate(-6px,4px)} }
    @keyframes devPrint {
      0%{opacity:0;transform:translate(var(--dx,0),40px) rotate(0deg) scale(.85)}
      100%{opacity:1}
    }
    @keyframes chemBath {
      0%{filter:brightness(.1) contrast(2) sepia(.8) blur(8px)}
      40%{filter:brightness(.5) contrast(1.4) sepia(.5) blur(3px)}
      100%{filter:brightness(1) contrast(1) sepia(0) blur(0)}
    }
    * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
  `}</style>
}
