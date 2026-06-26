'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { IconBack, IconCheck, IconFlash } from '@/components/icons'

const TIERS = [
  { id: 'mini',      name: 'Starter',   price: '$1.99',  guests: '≤ 10 guests',   desc: 'Intimate dinner or small gathering', popular: false },
  { id: 'standard',  name: 'Small',     price: '$4.99',  guests: '≤ 25 guests',   desc: 'Birthday party or brunch',           popular: false },
  { id: 'medium',    name: 'Medium',    price: '$9.99',  guests: '≤ 50 guests',   desc: 'Engagement, shower, graduation',     popular: true  },
  { id: 'large',     name: 'Large',     price: '$14.99', guests: '≤ 100 guests',  desc: 'Wedding or corporate event',         popular: false },
  { id: 'xl',        name: 'XL',        price: '$29.99', guests: '≤ 200 guests',  desc: 'Big venue or festival',              popular: false },
  { id: 'unlimited', name: 'Unlimited', price: '$99.99', guests: 'Unlimited',     desc: 'No guest cap, ever',                 popular: false },
]

function PricingPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const eventId = searchParams.get('eventId') || ''
  const cancelled = searchParams.get('cancelled')

  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [promoCode, setPromoCode] = useState('')

  const handleBuy = async (tierId: string) => {
    if (loading) return
    setLoading(tierId)
    setError('')

    try {
      // Get auth token client-side
      const { createClient } = await import('@/lib/supabase/client')
      const sb = createClient()
      const { data: { session } } = await sb.auth.getSession()

      if (!session?.access_token) {
        setError('Please log in first')
        setLoading(null)
        router.push('/login?next=/pricing' + (eventId ? `?eventId=${eventId}` : ''))
        return
      }

      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ tier: tierId, eventId, promoCode: promoCode.trim().toUpperCase() || undefined }),
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        setError(data.error || `Error ${res.status}`)
        setLoading(null)
        return
      }

      if (data.free) {
        router.push(data.redirectUrl)
        return
      }

      // Open Stripe in same tab
      window.location.assign(data.url)

    } catch (e: any) {
      setError(e.message || 'Something went wrong')
      setLoading(null)
    }
  }

  return (
    <main style={{ minHeight: '100vh', background: '#0a0a0a', color: '#f0f0f0', fontFamily: "'Space Grotesk', sans-serif" }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderBottom: '1px solid #161616', position: 'sticky', top: 0, zIndex: 10, background: 'rgba(10,10,10,0.96)', backdropFilter: 'blur(20px)' }}>
        <button onClick={() => router.back()} style={{ width: 38, height: 38, background: '#161616', border: 'none', borderRadius: 12, color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <IconBack size={18} />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700 }}>Choose a plan</div>
          {eventId && <div style={{ fontSize: 11, color: '#444' }}>Event ID: {eventId.slice(0, 8)}...</div>}
        </div>
        <div style={{ width: 32, height: 32, background: '#e8ff47', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <IconFlash size={16} color="#0a0a0a" />
        </div>
      </div>

      <div style={{ padding: '24px 18px 60px', maxWidth: 480, margin: '0 auto' }}>

        {/* Cancelled notice */}
        {cancelled && (
          <div style={{ background: 'rgba(255,149,0,0.08)', border: '1px solid rgba(255,149,0,0.2)', borderRadius: 12, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#ff9500' }}>
            Payment cancelled. Select a plan to activate your event.
          </div>
        )}

        <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.5, marginBottom: 6 }}>Pay once, keep forever.</h2>
        <p style={{ fontSize: 14, color: '#555', marginBottom: 28, lineHeight: 1.6 }}>No subscriptions. One payment per event.</p>

        {/* Error */}
        {error && (
          <div style={{ background: 'rgba(255,71,87,0.1)', border: '1px solid rgba(255,71,87,0.3)', borderRadius: 12, padding: '12px 16px', marginBottom: 20, fontSize: 14, color: '#ff4757', fontWeight: 600 }}>
            {error}
          </div>
        )}

        {/* Tier cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
          {TIERS.map(t => (
            <div key={t.id} style={{ background: t.popular ? 'rgba(232,255,71,0.04)' : '#111', border: `1px solid ${t.popular ? 'rgba(232,255,71,0.25)' : '#1e1e1e'}`, borderRadius: 16, padding: '16px 18px', position: 'relative', overflow: 'hidden' }}>
              {t.popular && (
                <div style={{ position: 'absolute', top: 12, right: 12, background: '#e8ff47', color: '#0a0a0a', fontSize: 9, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', borderRadius: 6, padding: '3px 8px' }}>
                  Popular
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ flex: 1, paddingRight: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 3 }}>
                    <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 22, fontWeight: 700, color: t.popular ? '#e8ff47' : '#f0f0f0' }}>{t.price}</span>
                    <span style={{ fontSize: 11, color: '#444' }}>CAD</span>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#ccc', marginBottom: 2 }}>{t.guests}</div>
                  <div style={{ fontSize: 12, color: '#444' }}>{t.desc}</div>
                </div>
                <button
                  onClick={() => handleBuy(t.id)}
                  disabled={!!loading}
                  style={{
                    background: loading === t.id ? '#222' : t.popular ? '#e8ff47' : '#1e1e1e',
                    color: loading === t.id ? '#555' : t.popular ? '#0a0a0a' : '#ccc',
                    border: t.popular ? 'none' : '1px solid #333',
                    borderRadius: 12, padding: '0 20px', height: 44, minWidth: 76,
                    fontSize: 14, fontWeight: 700, cursor: loading ? 'default' : 'pointer',
                    fontFamily: 'inherit', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  {loading === t.id ? (
                    <div style={{ width: 18, height: 18, border: '2px solid #444', borderTop: '2px solid #e8ff47', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
                  ) : 'Buy'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Promo code */}
        <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 14, padding: '16px 18px', marginBottom: 28 }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#444', marginBottom: 10 }}>Promo Code</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={promoCode}
              onChange={e => setPromoCode(e.target.value.toUpperCase())}
              placeholder="ENTER CODE"
              maxLength={20}
              style={{ flex: 1, background: '#0e0e0e', border: '1px solid #222', borderRadius: 10, padding: '11px 14px', color: '#f0f0f0', fontSize: 14, fontFamily: 'Space Mono, monospace', outline: 'none', letterSpacing: 2 }}
            />
          </div>
          <div style={{ fontSize: 11, color: '#333', marginTop: 8 }}>Apply at checkout or enter above for free events</div>
        </div>

        {/* Creator & Venue plans */}
        <div style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: 16, padding: '20px 18px', marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#444', marginBottom: 12 }}>Frequent use?</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#e0e0e0', marginBottom: 6, letterSpacing: -0.3 }}>Creator & Venue Plans</div>
          <div style={{ fontSize: 13, color: '#555', lineHeight: 1.6, marginBottom: 16 }}>Run multiple events per month? Get unlimited events at a flat rate.</div>
          {[
            { name: 'Creator', price: '$19.99/mo', desc: 'Up to 10 events/month · 200 guests each', color: '#888' },
            { name: 'Venue',   price: '$49.99/mo', desc: 'Unlimited events · White-label · Priority support', color: '#e8ff47' },
          ].map(plan => (
            <div key={plan.name} style={{ background: '#0e0e0e', border: `1px solid ${plan.color === '#e8ff47' ? 'rgba(232,255,71,0.15)' : '#1a1a1a'}`, borderRadius: 12, padding: '14px 16px', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: plan.color, marginBottom: 3 }}>{plan.name}</div>
                <div style={{ fontSize: 12, color: '#444' }}>{plan.desc}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
                <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 13, fontWeight: 700, color: '#f0f0f0' }}>{plan.price}</div>
              </div>
            </div>
          ))}
          <div style={{ fontSize: 12, color: '#333', marginTop: 10, textAlign: 'center' }}>
            Contact <a href="mailto:hello@flashcam.app" style={{ color: '#444', textDecoration: 'none' }}>hello@flashcam.app</a>
          </div>
        </div>

        <div style={{ fontSize: 12, color: '#2a2a2a', textAlign: 'center', lineHeight: 1.6 }}>
          Secure payment via Stripe · CAD · No recurring charges
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </main>
  )
}

export default function PricingPage() {
  return <Suspense><PricingPageInner /></Suspense>
}
