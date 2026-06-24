'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { IconFlash, IconCheck, IconArrowRight } from '@/components/icons'

function SuccessPageInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClient()
  const sessionId = searchParams.get('session_id')
  const eventId = searchParams.get('event_id')
  const [status, setStatus] = useState<'loading' | 'done'>('loading')

  useEffect(() => {
    async function activate() {
      if (!eventId) { setStatus('done'); return }
      await supabase.from('events').update({
        is_active: true,
        paid: true,
        stripe_session_id: sessionId || '',
        paid_at: new Date().toISOString(),
      }).eq('id', eventId)
      setStatus('done')
    }
    activate()
  }, [eventId])

  return (
    <main style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
      <div style={{ width: 72, height: 72, background: status === 'done' ? 'rgba(46,213,115,0.1)' : 'rgba(232,255,71,0.08)', border: `1px solid ${status === 'done' ? 'rgba(46,213,115,0.25)' : 'rgba(232,255,71,0.2)'}`, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, transition: 'all .4s' }}>
        {status === 'loading'
          ? <div className="flash-loading"><IconFlash size={32} /></div>
          : <IconCheck size={32} color="#2ed573" weight="bold" />}
      </div>

      <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.8, marginBottom: 10, color: '#f0f0f0' }}>
        {status === 'loading' ? 'Activating...' : 'Payment confirmed!'}
      </h1>
      <p style={{ fontSize: 14, color: '#555', marginBottom: 36, lineHeight: 1.6 }}>
        {status === 'loading' ? 'Setting up your event...' : 'Your event is live. Share the QR code with your guests.'}
      </p>

      {status === 'done' && (
        <button onClick={() => router.push(eventId ? `/host/${eventId}` : '/host')}
          style={{ background: '#e8ff47', color: '#0a0a0a', border: 'none', borderRadius: 13, padding: '15px 28px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 10 }}>
          Open Event Dashboard <IconArrowRight size={18} color="#0a0a0a" />
        </button>
      )}
    </main>
  )
}

export default function SuccessPage() {
  return <Suspense><SuccessPageInner /></Suspense>
}
