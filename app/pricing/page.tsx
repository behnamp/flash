'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { IconBack, IconCheck, IconFlash, IconFilm, IconGuests, IconShutter, IconTarget, IconReel, IconStats, IconPrint, IconWarning } from '@/components/icons'

const TIERS = [
  {
    id: 'mini',
    name: 'Starter',
    price: '$1.99',
    guests: '≤ 10 guests',
    desc: 'Small gathering or intimate dinner',
  },
  {
    id: 'standard',
    name: 'Small',
    price: '$4.99',
    guests: '≤ 25 guests',
    desc: 'Birthday party or brunch',
  },
  {
    id: 'medium',
    name: 'Medium',
    price: '$9.99',
    guests: '≤ 50 guests',
    desc: 'Engagement, shower, graduation',
    popular: true,
  },
  {
    id: 'large',
    name: 'Large',
    price: '$14.99',
    guests: '≤ 100 guests',
    desc: 'Wedding reception, corporate event',
  },
  {
    id: 'xl',
    name: 'XL',
    price: '$29.99',
    guests: '≤ 200 guests',
    desc: 'Big wedding, festival, gala',
  },
  {
    id: 'unlimited',
    name: 'Unlimited',
    price: '$99.99',
    guests: 'No guest limit',
    desc: 'Venue, agency, open events',
  },
]

const FEATURES = [
  { Icon: IconFilm, label: '29 photo modes' },
  { Icon: IconGuests, label: '20+ languages' },
  { Icon: IconShutter, label: '5 reveal modes' },
  { Icon: IconTarget, label: 'Scavenger hunt' },
  { Icon: IconReel, label: 'AI highlight reel' },
  { Icon: IconStats, label: 'Event analytics' },
  { Icon: IconPrint, label: 'Print integration' },
]

function PricingPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const eventId = searchParams.get('eventId')
  const cancelled = searchParams.get('cancelled')
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [promoCode, setPromoCode] = useState('')
  const [promoResult, setPromoResult] = useState<any>(null)
  const [promoLoading, setPromoLoading] = useState(false)
  const [promoError, setPromoError] = useState('')

  const validatePromo = async (tierId: string) => {
    if (!promoCode.trim()) return null
    setPromoLoading(true); setPromoError('')
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await supabase.rpc('validate_promo_code', {
        p_code: promoCode.trim().toUpperCase(),
        p_tier: tierId,
        p_user_id: user?.id,
      })
      if (error || !data?.valid) {
        setPromoError(data?.error || 'Invalid promo code')
        setPromoResult(null)
        return null
      }
      setPromoResult(data)
      return data
    } catch (e: any) {
      setPromoError('Could not validate code')
      return null
    } finally { setPromoLoading(false) }
  }

  const handlePurchase = async (tierId: string) => {
    setLoading(tierId)
    setError('')
    try {
      // Step 1: get session
      const { createClient: _cc } = await import('@/lib/supabase/client')
      const _sb = _cc()
      const { data: { session }, error: sessErr } = await _sb.auth.getSession()
      if (sessErr) { setError('Session error: ' + sessErr.message); setLoading(null); return }
      if (!session?.access_token) { setError('Not logged in — please refresh and try again'); setLoading(null); return }

      // Step 2: call checkout API
      setError('Connecting to payment...')
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ tier: tierId, eventId: eventId || '', promoCode: promoCode.trim().toUpperCase() || undefined }),
      })

      // Step 3: parse response
      const text = await res.text()
      let data: any
      try { data = JSON.parse(text) } catch { throw new Error(`Server error (${res.status}): ${text.slice(0, 200)}`) }
      if (!res.ok || data.error) throw new Error(data.error || `HTTP ${res.status}`)

      setError('')
      if (data.free) { window.location.href = data.redirectUrl; return }
      if (!data.url) throw new Error('No payment URL returned — check Stripe config')
      window.location.href = data.url
    } catch (e: any) {
      setError('Error: ' + (e.message || 'Unknown error'))
      setLoading(null)
    }
  }

  return (
    <main style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderBottom: '1px solid #161616', position: 'sticky', top: 0, zIndex: 10, background: 'rgba(10,10,10,0.96)', backdropFilter: 'blur(20px)' }}>
        <button onClick={() => router.back()} style={{ width: 38, height: 38, background: '#161616', border: 'none', borderRadius: 12, color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <IconBack size={18} />
        </button>
        <span style={{ fontSize: 15, fontWeight: 600, flex: 1, letterSpacing: -0.3 }}>
          {eventId ? 'Activate Your Event' : 'Plans & Pricing'}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <IconFlash size={18} />
          <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 13, fontWeight: 700 }}>Flash</span>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '28px 18px 60px' }}>

        {/* Cancelled notice */}
        {cancelled && (
          <div style={{ background: 'rgba(255,71,87,0.08)', border: '1px solid rgba(255,71,87,0.2)', borderRadius: 12, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
            <IconWarning size={16} color="#ff4757" />
            <span style={{ fontSize: 13, color: '#ff4757' }}>Payment cancelled. Choose a plan to activate your event.</span>
          </div>
        )}

        {/* Headline */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: '#444', marginBottom: 12 }}>
            {eventId ? 'One-time payment' : 'Pricing'}
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: -1, lineHeight: 1.1, marginBottom: 10 }}>
            {eventId ? 'Choose your\nevent size' : <>Simple,<br /><span style={{ color: '#e8ff47' }}>honest pricing</span></>}
          </h1>
          <p style={{ fontSize: 13, color: '#555', lineHeight: 1.6 }}>
            Pay once per event. No subscription, no hidden fees.
          </p>
        </div>

        {/* Tier cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
          {TIERS.map(t => (
            <div key={t.id} style={{
              background: t.popular ? 'rgba(232,255,71,0.05)' : '#111',
              border: `1px solid ${t.popular ? 'rgba(232,255,71,0.25)' : '#1e1e1e'}`,
              borderRadius: 16, padding: '18px 18px', position: 'relative',
            }}>
              {t.popular && (
                <div style={{ position: 'absolute', top: -10, left: 16, background: '#e8ff47', color: '#0a0a0a', borderRadius: 20, padding: '3px 12px', fontSize: 10, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase' }}>
                  Most Popular
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 26, fontWeight: 700, color: t.popular ? '#e8ff47' : '#f0f0f0', letterSpacing: -1 }}>{t.price}</span>
                    <span style={{ fontSize: 12, color: '#444' }}>CAD</span>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#ccc', marginBottom: 2 }}>{t.guests}</div>
                  <div style={{ fontSize: 12, color: '#444' }}>{t.desc}</div>
                </div>
                <button
                  onClick={() => handlePurchase(t.id)}
                  disabled={!!loading}
                  style={{
                    background: loading === t.id ? '#1a1a1a' : t.popular ? '#e8ff47' : '#1e1e1e',
                    color: loading === t.id ? '#333' : t.popular ? '#0a0a0a' : '#ccc',
                    border: `1px solid ${t.popular ? 'transparent' : '#2a2a2a'}`,
                    borderRadius: 11, padding: '10px 18px',
                    fontSize: 13, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                    fontFamily: 'inherit', whiteSpace: 'nowrap', flexShrink: 0, marginLeft: 14,
                    transition: 'all .15s',
                  }}
                >
                  {loading === t.id ? '...' : 'Buy'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Promo code */}
        <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 14, padding: '16px 18px', marginBottom: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#444', marginBottom: 10 }}>Promo Code</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={promoCode} onChange={e => { setPromoCode(e.target.value.toUpperCase()); setPromoResult(null); setPromoError('') }}
              placeholder="ENTER CODE"
              style={{ background: '#0e0e0e', border: `1px solid ${promoResult ? 'rgba(46,213,115,0.3)' : promoError ? 'rgba(255,71,87,0.3)' : '#222'}`, borderRadius: 9, padding: '11px 14px', color: '#f0f0f0', fontSize: 14, flex: 1, outline: 'none', fontFamily: 'Space Mono, monospace', letterSpacing: 2 }}
              maxLength={16}
            />
            <button onClick={() => validatePromo('all')} disabled={!promoCode.trim() || promoLoading} style={{ background: promoResult ? 'rgba(46,213,115,0.1)' : '#1a1a1a', border: `1px solid ${promoResult ? 'rgba(46,213,115,0.3)' : '#222'}`, borderRadius: 9, padding: '0 16px', color: promoResult ? '#2ed573' : '#666', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
              {promoLoading ? '...' : promoResult ? '✓ Applied' : 'Apply'}
            </button>
          </div>
          {promoResult && (
            <div style={{ marginTop: 8, fontSize: 12, color: '#2ed573', display: 'flex', alignItems: 'center', gap: 6 }}>
              ✓ {promoResult.type === 'free' ? '100% discount — this event is FREE!' : `${promoResult.discount_percent}% off applied`}
            </div>
          )}
          {promoError && <div style={{ marginTop: 8, fontSize: 12, color: '#ff4757' }}>{promoError}</div>}
        </div>

        {error && (
          <div style={{ color: '#ff4757', fontSize: 13, textAlign: 'center', marginBottom: 20, background: 'rgba(255,71,87,0.08)', borderRadius: 10, padding: '10px 14px' }}>
            {error}
          </div>
        )}

        {/* What's included */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2.5, textTransform: 'uppercase', color: '#333', marginBottom: 16, textAlign: 'center' }}>
            Everything included
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {FEATURES.map(({ Icon, label }) => (
              <div key={label} style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: 11, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Icon size={16} color="#444" />
                <span style={{ fontSize: 12, color: '#555', fontWeight: 500 }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Creator / Venue plans */}
        <div style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: 16, padding: '20px 18px', marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#444', marginBottom: 12 }}>Frequent use?</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#e0e0e0', marginBottom: 6, letterSpacing: -0.3 }}>Creator & Venue Plans</div>
          <div style={{ fontSize: 13, color: '#555', lineHeight: 1.6, marginBottom: 16 }}>
            Run multiple events per month? Get unlimited events at a flat rate.
          </div>
          {[
            { name: 'Creator', price: '$19.99/mo', desc: 'Up to 10 events/month · 200 guests each', color: '#888' },
            { name: 'Venue', price: '$49.99/mo', desc: 'Unlimited events · White-label · Priority support', color: '#e8ff47' },
          ].map(plan => (
            <div key={plan.name} style={{ background: '#0e0e0e', border: `1px solid ${plan.color === '#e8ff47' ? 'rgba(232,255,71,0.15)' : '#1a1a1a'}`, borderRadius: 12, padding: '14px 16px', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: plan.color, marginBottom: 3 }}>{plan.name}</div>
                <div style={{ fontSize: 12, color: '#444' }}>{plan.desc}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
                <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 13, fontWeight: 700, color: '#f0f0f0' }}>{plan.price}</div>
                <div style={{ fontSize: 10, color: '#333', marginTop: 2 }}>CAD</div>
              </div>
            </div>
          ))}
          <div style={{ fontSize: 12, color: '#333', marginTop: 10, textAlign: 'center' }}>
            Contact us at <a href="mailto:hello@flashcam.app" style={{ color: '#444', textDecoration: 'none' }}>hello@flashcam.app</a> to get set up
          </div>
        </div>

        <div style={{ textAlign: 'center', fontSize: 12, color: '#2a2a2a', lineHeight: 1.7 }}>
          Secure payment via Stripe · CAD pricing<br />
          No subscription · Cancel anytime
        </div>

        <div style={{ display:'flex', gap:24, justifyContent:'center', marginTop: 20 }}>
          <a href="/legal/privacy" style={{ fontSize:11, color:'#2a2a2a', textDecoration:'none' }}>Privacy Policy</a>
          <a href="/legal/terms" style={{ fontSize:11, color:'#2a2a2a', textDecoration:'none' }}>Terms of Service</a>
        </div>
      </div>
    </main>
  )
}

export default function PricingPage() {
  return <Suspense><PricingPageInner /></Suspense>
}
