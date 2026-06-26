'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { IconFlash, IconShutter, IconGuests } from '@/components/icons'

export default function JoinPage() {
  const params = useParams()
  const router = useRouter()
  const code = params.code as string
  const supabase = createClient()

  const [event, setEvent] = useState<any>(null)
  const [nickname, setNickname] = useState('')
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('events')
        .select('id, name, event_type, is_active, paid, join_code, shot_limit, guest_cap')
        .eq('join_code', code.toUpperCase())
        .single()
      if (!data) { setError('Event not found'); setLoading(false); return }
      if (!data.paid) { setError('This event is not active yet'); setLoading(false); return }
      if (!data.is_active) { setError('This event has ended'); setLoading(false); return }
      setEvent(data)
      setLoading(false)
    }
    load()
  }, [code])

  const handleJoin = async () => {
    if (!nickname.trim()) return
    setJoining(true)
    try {
      const { data: guest, error: err } = await supabase
        .from('guests')
        .insert({ event_id: event.id, nickname: nickname.trim(), language: 'en' })
        .select()
        .single()
      if (err) throw err
      localStorage.setItem(`flash_guest_${event.id}`, JSON.stringify({ id: guest.id, nickname: guest.nickname }))
      router.push(`/join/${code}/camera`)
    } catch (e: any) {
      setError(e.message || 'Failed to join')
      setJoining(false)
    }
  }

  if (loading) return (
    <main style={{ height: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 36, height: 36, background: '#e8ff47', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <IconFlash size={20} color="#0a0a0a" />
      </div>
    </main>
  )

  if (error && !event) return (
    <main style={{ height: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
      <div>
        <div style={{ fontSize: 16, fontWeight: 600, color: '#555', marginBottom: 8 }}>{error}</div>
        <div style={{ fontSize: 13, color: '#333' }}>Check the QR code and try again.</div>
      </div>
    </main>
  )

  return (
    <main style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 20px' }}>
      {/* Flash logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40 }}>
        <div style={{ width: 40, height: 40, background: '#e8ff47', borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <IconFlash size={22} color="#0a0a0a" />
        </div>
        <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 20, fontWeight: 700, color: '#f0f0f0' }}>Flash</span>
      </div>

      <div style={{ width: '100%', maxWidth: 320 }}>
        {/* Event name */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 11, color: '#444', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>You're invited to</div>
          <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.5, color: '#f0f0f0', lineHeight: 1.2 }}>{event?.name}</div>
        </div>

        {/* Name field */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#444', marginBottom: 8 }}>
            Your Name <span style={{ color: '#ff4757' }}>*</span>
          </div>
          <input
            value={nickname}
            onChange={e => setNickname(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && nickname.trim() && handleJoin()}
            placeholder="How should we call you?"
            maxLength={24}
            autoFocus
            style={{ background: '#111', border: `1px solid ${nickname.trim() ? '#333' : '#1e1e1e'}`, borderRadius: 12, padding: '14px 16px', color: '#f0f0f0', fontSize: 16, width: '100%', outline: 'none', fontFamily: 'inherit', transition: 'border .15s' }}
          />
          {!nickname.trim() && (
            <div style={{ fontSize: 11, color: '#333', marginTop: 6 }}>Required to join</div>
          )}
        </div>

        {error && (
          <div style={{ background: 'rgba(255,71,87,0.08)', border: '1px solid rgba(255,71,87,0.2)', borderRadius: 10, padding: '10px 14px', marginBottom: 14, fontSize: 13, color: '#ff4757' }}>
            {error}
          </div>
        )}

        {/* Join button */}
        <button
          onClick={handleJoin}
          disabled={!nickname.trim() || joining}
          style={{ background: nickname.trim() && !joining ? '#e8ff47' : '#161616', color: nickname.trim() && !joining ? '#0a0a0a' : '#333', border: 'none', borderRadius: 13, padding: '16px 20px', fontSize: 15, fontWeight: 700, cursor: nickname.trim() && !joining ? 'pointer' : 'not-allowed', width: '100%', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transition: 'all .15s' }}>
          <IconShutter size={18} color={nickname.trim() && !joining ? '#0a0a0a' : '#333'} />
          {joining ? 'Joining...' : 'Open Camera'}
        </button>

        {/* Event info */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 20 }}>
          <IconGuests size={13} color="#2a2a2a" />
          <span style={{ fontSize: 12, color: '#2a2a2a' }}>No account needed · Works in your browser</span>
        </div>
      </div>
    </main>
  )
}
