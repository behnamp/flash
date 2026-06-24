'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { IconBack, IconCheck, IconFlash, IconFilm, IconGuests, IconShutter, IconTarget, IconReel, IconStats, IconPrint, IconWarning } from '@/components/icons'

const TIERS = [
  {
    id: 'mini',
    name: 'Mini',
    price: '$3.99',
    guests: '≤ 10 guests',
    desc: 'Small gathering, family dinner',
  },
  {
    id: 'standard',
    name: 'Standard',
    price: '$14.99',
    guests: '≤ 50 guests',
    desc: 'Birthday, engagement, graduation',
    popular: true,
  },
  {
    id: 'large',
    name: 'Large',
    price: '$39.99',
    guests: '≤ 150 guests',
    desc: 'Wedding, corporate, festival',
  },
  {
    id: 'unlimited',
    name: 'Unlimited',
    price: '$99.99',
    guests: 'No limit',
    desc: 'Venue, agency, big event',
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

  const handlePurchase = async (tierId: string) => {
    setLoading(tierId)
    setError('')
    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: tierId, eventId: eventId || '' }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      window.location.href = data.url
    } catch (e: any) {
      setError(e.message || 'Payment failed. Try again.')
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
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#444', marginBottom: 8 }}>Frequent use?</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#e0e0e0', marginBottom: 6, letterSpacing: -0.3 }}>Creator & Venue plans</div>
          <div style={{ fontSize: 13, color: '#555', lineHeight: 1.6, marginBottom: 14 }}>
            Unlimited events from $29/mo. White-label, analytics, priority support.
          </div>
          <button onClick={() => router.push('/pricing/plans')} style={{ background: 'transparent', color: '#e8ff47', border: '1px solid rgba(232,255,71,0.2)', borderRadius: 10, padding: '10px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            View subscription plans →
          </button>
        </div>

        <div style={{ textAlign: 'center', fontSize: 12, color: '#2a2a2a', lineHeight: 1.7 }}>
          Secure payment via Stripe · CAD pricing<br />
          No subscription · Cancel anytime
        </div>
      </div>
    </main>
  )
}

export default function PricingPage() {
  return <Suspense><PricingPageInner /></Suspense>
}
