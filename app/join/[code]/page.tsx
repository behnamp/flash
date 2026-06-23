'use client'
import { IconFlash } from '@/components/icons'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LANGUAGES } from '@/constants/languages'

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
      const { data, error } = await supabase
        .rpc('get_event_by_code', { code })
      if (error || !data) { setError('Event not found. Check your code and try again.'); }
      else setEvent(data)
      setLoading(false)
    }
    fetchEvent()
  }, [code])

  const handleJoin = async () => {
    if (!nickname.trim()) return
    setJoining(true)
    try {
      const { data: guest, error } = await supabase
        .from('guests')
        .insert({
          event_id: event.id,
          nickname: nickname.trim(),
          language: lang,
          device_type: /iPhone|iPad|iPod/i.test(navigator.userAgent) ? 'ios' : /Android/i.test(navigator.userAgent) ? 'android' : 'desktop',
        })
        .select()
        .single()

      if (error) throw error
      // Store session token in localStorage
      localStorage.setItem(`flash_guest_${event.id}`, guest.session_token)
      localStorage.setItem(`flash_guest_id_${event.id}`, guest.id)
      localStorage.setItem(`flash_event_id`, event.id)
      router.push(`/join/${code}/camera`)
    } catch (e) {
      setError('Failed to join. Please try again.')
      setJoining(false)
    }
  }

  if (loading) return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="flash-loading"><IconFlash size={40} /></div>
    </main>
  )

  if (error && !event) return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
      <div style={{ fontSize: 40, marginBottom: 16 }}>😕</div>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Event not found</h2>
      <p style={{ color: 'var(--dim)', marginBottom: 24 }}>{error}</p>
      <button onClick={() => router.push('/join')} style={{ background: 'var(--accent)', color: '#000', border: 'none', borderRadius: 12, padding: '12px 24px', fontWeight: 700, cursor: 'pointer' }}>
        Try Again
      </button>
    </main>
  )

  const selectedLang = LANGUAGES.find(l => l.code === lang) ?? LANGUAGES[0]

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Hero */}
      <div style={{ background: 'var(--surface)', padding: '32px 20px 24px', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
        {event?.white_label && event?.brand_name && (
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', marginBottom: 6 }}>🏛 {event.brand_name}</div>
        )}
        <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.5, marginBottom: 6 }}>{event?.name}</div>
        <div style={{ fontSize: 13, color: 'var(--dim)', marginBottom: 18 }}>You're invited to shoot</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 7, flexWrap: 'wrap' }}>
          <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 20, padding: '5px 12px', fontSize: 11, color: 'var(--dim)' }}>
            📷 {event?.shot_limit} shots each
          </div>
          <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 20, padding: '5px 12px', fontSize: 11, color: 'var(--dim)' }}>
            🌍 {LANGUAGES.length} languages
          </div>
          {event?.scavenger_hunt && (
            <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 20, padding: '5px 12px', fontSize: 11, color: 'var(--dim)' }}>
              🎯 Hunt active
            </div>
          )}
        </div>
      </div>

      {/* Form */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px' }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 5 }}>What's your name?</h2>
        <p style={{ fontSize: 13, color: 'var(--dim)', marginBottom: 20 }}>So your shots know who took them.</p>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--dim)', marginBottom: 8 }}>Nickname</div>
          <input
            value={nickname} onChange={e => setNickname(e.target.value)} maxLength={24}
            placeholder="e.g. Marco's cousin 🎉"
            onKeyDown={e => e.key === 'Enter' && handleJoin()}
            style={{ background: 'var(--surface2)', border: '1.5px solid var(--border)', borderRadius: 10, padding: '13px 14px', color: 'var(--text)', fontSize: 15, width: '100%', outline: 'none' }}
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--dim)', marginBottom: 10 }}>Your Language</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7, maxHeight: 240, overflowY: 'auto' }}>
            {LANGUAGES.map(l => (
              <div key={l.code} onClick={() => setLang(l.code)} style={{
                background: lang === l.code ? 'var(--accent-dim)' : 'var(--surface2)',
                border: `1.5px solid ${lang === l.code ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: 9, padding: '10px 12px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8, transition: 'all .15s',
                direction: l.dir as any
              }}>
                <span style={{ fontSize: 17, flexShrink: 0 }}>{l.flag}</span>
                <span style={{ fontSize: 12, fontWeight: 500, color: lang === l.code ? 'var(--accent)' : 'var(--text)' }}>{l.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, padding: '13px 15px', fontSize: 13, color: 'var(--dim)', lineHeight: 1.55, marginBottom: 20 }}>
          🎞 You have <strong style={{ color: 'var(--text)' }}>{event?.shot_limit} shots</strong>. Make them count.
          {event?.reveal_mode === 'instant' ? ' Photos appear live.' :
           event?.reveal_mode === 'morning' ? ' Photos reveal tomorrow morning.' :
           ' Photos reveal at the end of the event.'}
        </div>

        {error && <p style={{ color: 'var(--red)', fontSize: 13, marginBottom: 12, textAlign: 'center' }}>{error}</p>}

        <button
          onClick={handleJoin}
          disabled={!nickname.trim() || joining}
          style={{
            background: nickname.trim() && !joining ? 'var(--accent)' : 'var(--surface3)',
            color: nickname.trim() && !joining ? '#0a0a0a' : 'var(--muted)',
            border: 'none', borderRadius: 13, padding: '15px 20px',
            fontSize: 14, fontWeight: 700, cursor: nickname.trim() && !joining ? 'pointer' : 'not-allowed',
            width: '100%', transition: 'all .15s'
          }}>
          {joining ? 'Joining...' : 'Open Camera →'}
        </button>
      </div>
    </main>
  )
}
