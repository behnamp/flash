'use client'
import { useState, useEffect, Suspense } from 'react'
import { isNativeIOS, purchaseWithStoreKit, TIER_TO_PRODUCT_ID } from '@/lib/storekit'
import { useRouter, useSearchParams } from 'next/navigation'
import { IconBack, IconCheck, IconFlash } from '@/components/icons'

const TIERS = [
  { id: 'free',      name: 'Free',      price: 'Free',   guests: '≤ 5 guests',    desc: 'Try it out — no credit card needed', popular: false, free: true },
  { id: 'mini',      name: 'Starter',   price: '$1.99',  guests: '≤ 10 guests',   desc: 'Intimate dinner or small gathering', popular: false, free: false },
  { id: 'standard',  name: 'Small',     price: '$4.99',  guests: '≤ 25 guests',   desc: 'Birthday party or brunch',           popular: false, free: false },
  { id: 'medium',    name: 'Medium',    price: '$9.99',  guests: '≤ 50 guests',   desc: 'Engagement, shower, graduation',     popular: true,  free: false },
  { id: 'large',     name: 'Large',     price: '$14.99', guests: '≤ 100 guests',  desc: 'Wedding or corporate event',         popular: false, free: false },
  { id: 'xl',        name: 'XL',        price: '$29.99', guests: '≤ 200 guests',  desc: 'Big venue or festival',              popular: false, free: false },
  { id: 'unlimited', name: 'Unlimited', price: '$99.99', guests: 'Unlimited',     desc: 'No guest cap, ever',                 popular: false, free: false },
]

function PricingPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const eventId = searchParams.get('eventId') || ''
  const cancelled = searchParams.get('cancelled')
  const tierParam = searchParams.get('tier')

  // Auto-trigger free tier activation if redirected with tier=free
  useEffect(() => {
    if (tierParam === 'free' && eventId) {
      handleBuy('free')
    }
  }, [])

  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [promoCode, setPromoCode] = useState('')
  const [nativeIOS, setNativeIOS] = useState(false)

  useEffect(() => {
    isNativeIOS().then(setNativeIOS)
  }, [])

  const handleBuy = async (tierId: string) => {
    if (loading) return
    setLoading(tierId)
    setError('')

    try {
      // Native iOS — use StoreKit instead of Stripe
      if (nativeIOS && tierId !== 'free') {
        const productId = TIER_TO_PRODUCT_ID[tierId]
        if (!productId) { setError('Product not found'); setLoading(null); return }
        const result = await purchaseWithStoreKit(productId, eventId)
        if (result.success) {
          router.push(`/host/${result.eventId}?payment=success`)
        } else {
          setError(result.error || 'Purchase failed')
          setLoading(null)
        }
        return
      }

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

      // Free tier — activate directly without Stripe
      if (tierId === 'free') {
        const supabaseUrl = 'https://onvdddlkrlwaxwufgodq.supabase.co'
        if (eventId) {
          await fetch(`${supabaseUrl}/rest/v1/events?id=eq.${eventId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9udmRkZGxrcmx3YXh3dWZnb2RxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxNTg0NDcsImV4cCI6MjA5NzczNDQ0N30.VZEZZPw4RaIJPtDenxavL8DyrgGaVDwT2x6Og_FPbaE',
              'Authorization': `Bearer ${session.access_token}`,
              'Prefer': 'return=minimal',
            },
            body: JSON.stringify({ paid: true, is_active: true, payment_tier: 'free', guest_cap: 5, paid_at: new Date().toISOString() }),
          })
        }
        router.push(eventId ? `/host/${eventId}?payment=success` : '/host')
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
    <main style={{ minHeight: '100dvh', background: '#0a0a0a', color: '#f0f0f0', fontFamily: "'Space Grotesk', sans-serif" }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingTop: 'max(14px, env(safe-area-inset-top))', paddingBottom: '14px', paddingLeft: 18, paddingRight: 18, borderBottom: '1px solid #161616', position: 'sticky', top: 0, zIndex: 10, background: 'rgba(10,10,10,0.96)', backdropFilter: 'blur(20px)' }}>
        <button onClick={() => router.back()} style={{ width: 38, height: 38, background: '#161616', border: 'none', borderRadius: 12, color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <IconBack size={18} />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700 }}>Choose a plan</div>
          {eventId && <div style={{ fontSize: 11, color: '#444' }}>Event ID: {eventId.slice(0, 8)}...</div>}
        </div>
        <div style={{ width: 32, height: 32, background: '#ffb800', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
            <div key={t.id} style={{ background: t.popular ? 'rgba(255,184,0,0.04)' : '#111', border: `1px solid ${t.popular ? 'rgba(255,184,0,0.25)' : '#1e1e1e'}`, borderRadius: 16, padding: '16px 18px', position: 'relative', overflow: 'hidden' }}>
              {t.popular && (
                <div style={{ position: 'absolute', top: 12, right: 12, background: '#ffb800', color: '#0a0a0a', fontSize: 9, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', borderRadius: 6, padding: '3px 8px' }}>
                  Popular
                </div>
              )}
              {(t as any).free && (
                <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(46,213,115,0.15)', color: '#2ed573', fontSize: 9, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', borderRadius: 6, padding: '3px 8px', border: '1px solid rgba(46,213,115,0.3)' }}>
                  No card needed
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ flex: 1, paddingRight: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 3 }}>
                    <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 22, fontWeight: 700, color: t.popular ? '#ffb800' : '#f0f0f0' }}>{t.price}</span>
                    <span style={{ fontSize: 11, color: '#444' }}>CAD</span>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#ccc', marginBottom: 2 }}>{t.guests}</div>
                  <div style={{ fontSize: 12, color: '#444' }}>{t.desc}</div>
                </div>
                <button
                  onClick={() => handleBuy(t.id)}
                  disabled={!!loading}
                  style={{
                    background: loading === t.id ? '#222' : (t as any).free ? '#1a2a1a' : t.popular ? '#ffb800' : '#1e1e1e',
                    color: loading === t.id ? '#555' : (t as any).free ? '#2ed573' : t.popular ? '#0a0a0a' : '#ccc',
                    border: (t as any).free ? '1px solid rgba(46,213,115,0.4)' : t.popular ? 'none' : '1px solid #333',
                    borderRadius: 12, padding: '0 20px', height: 44, minWidth: 76,
                    fontSize: 14, fontWeight: 700, cursor: loading ? 'default' : 'pointer',
                    fontFamily: 'inherit', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  {loading === t.id ? (
                    <div style={{ width: 18, height: 18, border: '2px solid #444', borderTop: '2px solid #ffb800', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
                  ) : (t as any).free ? 'Get Free' : 'Buy'}
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

        {/* Flash for Planners */}
        <a href="/planners" style={{ display: 'block', textDecoration: 'none', marginBottom: 20 }}>
          <div style={{ background: 'linear-gradient(135deg, #111 0%, #141410 100%)', border: '1px solid rgba(255,184,0,0.18)', borderRadius: 16, padding: '20px 18px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', right: -20, top: -20, width: 140, height: 140, background: 'radial-gradient(circle, rgba(255,184,0,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#555', marginBottom: 10 }}>DJ · Venue · Promoter</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#f0f0f0', marginBottom: 6, letterSpacing: -0.3 }}>Flash for Planners</div>
            <div style={{ fontSize: 13, color: '#555', lineHeight: 1.6, marginBottom: 16 }}>Run multiple events per month? Flat monthly rate — no per-event fees, ever.</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              {[
                { name: 'DJ & Promoter', price: '$39/mo', desc: '12 events · 250 guests each', color: '#888' },
                { name: 'Venue',         price: '$89/mo', desc: 'Unlimited events · White-label · 500 guests', color: '#ffb800' },
                { name: 'Agency',        price: '$199/mo', desc: 'Unlimited · 5 seats · API access', color: '#c084fc' },
              ].map(plan => (
                <div key={plan.name} style={{ background: '#0e0e0e', border: `1px solid ${plan.color === '#ffb800' ? 'rgba(255,184,0,0.15)' : plan.color === '#c084fc' ? 'rgba(192,132,252,0.15)' : '#1a1a1a'}`, borderRadius: 10, padding: '11px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: plan.color, marginBottom: 2 }}>{plan.name}</div>
                    <div style={{ fontSize: 11, color: '#444' }}>{plan.desc}</div>
                  </div>
                  <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 12, fontWeight: 700, color: '#f0f0f0', flexShrink: 0, marginLeft: 12 }}>{plan.price}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: '#ffb800' }}>
              View professional plans
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffb800" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </div>
          </div>
        </a>

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
