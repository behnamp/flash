'use client'
import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { IconFlash, IconCheck, IconWarning } from '@/components/icons'

function PaymentSuccessInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const eventId = searchParams.get('event_id')

  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!sessionId) { setStatus('error'); setError('Missing session ID'); return }

    async function verify() {
      try {
        const res = await fetch('/api/stripe/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, eventId }),
        })
        const data = await res.json()
        if (data.error) throw new Error(data.error)
        setStatus('success')
        // Redirect to event dashboard after 2 seconds
        setTimeout(() => {
          router.push(`/host${data.eventId ? `/${data.eventId}` : ''}?payment=success`)
        }, 2000)
      } catch (e: any) {
        setError(e.message || 'Verification failed')
        setStatus('error')
      }
    }
    verify()
  }, [sessionId, eventId])

  return (
    <main style={{ height: '100dvh', background: '#0a0a0a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ width: 64, height: 64, background: '#ffb800', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <IconFlash size={32} color="#0a0a0a" />
        </div>
        <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 18, fontWeight: 700 }}>Flash</div>
      </div>

      {status === 'verifying' && (
        <div>
          <div style={{ width: 56, height: 56, border: '3px solid #1e1e1e', borderTop: '3px solid #ffb800', borderRadius: '50%', margin: '0 auto 20px', animation: 'spin 0.8s linear infinite' }} />
          <div style={{ fontSize: 16, fontWeight: 600, color: '#e0e0e0', marginBottom: 6 }}>Confirming payment...</div>
          <div style={{ fontSize: 13, color: '#555' }}>Activating your event</div>
        </div>
      )}

      {status === 'success' && (
        <div className="slide-up">
          <div style={{ width: 64, height: 64, background: 'rgba(46,213,115,0.1)', border: '1px solid rgba(46,213,115,0.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <IconCheck size={28} color="#2ed573" weight="bold" />
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.5, color: '#f0f0f0', marginBottom: 8 }}>Payment confirmed!</div>
          <div style={{ fontSize: 14, color: '#555', marginBottom: 4 }}>Your event is now live.</div>
          <div style={{ fontSize: 12, color: '#333' }}>Redirecting to your dashboard...</div>
        </div>
      )}

      {status === 'error' && (
        <div>
          <div style={{ width: 64, height: 64, background: 'rgba(255,71,87,0.1)', border: '1px solid rgba(255,71,87,0.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <IconWarning size={28} color="#ff4757" />
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#f0f0f0', marginBottom: 8 }}>Something went wrong</div>
          <div style={{ fontSize: 13, color: '#555', marginBottom: 24 }}>{error}</div>
          <button onClick={() => router.push('/host')} style={{ background: '#ffb800', color: '#0a0a0a', border: 'none', borderRadius: 12, padding: '12px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
            Go to Dashboard
          </button>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </main>
  )
}

export default function PaymentSuccess() {
  return <Suspense><PaymentSuccessInner /></Suspense>
}
