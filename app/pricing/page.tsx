'use client'
'use client'
import { useRouter } from 'next/navigation'
import { IconBack, IconCheck, IconFlash, IconShutter, IconGuests, IconFilm, IconReel, IconPrint, IconStats, IconTarget } from '@/components/icons'

const PLANS = [
  {
    id: 'event',
    name: 'Per Event',
    desc: 'Perfect for a one-off celebration',
    price: null,
    unit: '',
    accent: '#888',
    tiers: [
      { name: 'Mini', guests: '≤ 10 guests', price: '$3.99' },
      { name: 'Standard', guests: '≤ 50 guests', price: '$14.99' },
      { name: 'Large', guests: '≤ 150 guests', price: '$39.99' },
      { name: 'Unlimited', guests: 'No limit', price: '$99.99' },
    ],
    features: [
      'All photo modes',
      'All reveal modes',
      'Gallery download',
      '7-day gallery access',
      'Basic analytics',
    ],
  },
  {
    id: 'creator',
    name: 'Creator',
    desc: 'For photographers & event planners',
    price: '$29',
    priceAnnual: '$19',
    unit: '/ month',
    accent: '#e8ff47',
    badge: 'Most Popular',
    features: [
      'Unlimited events',
      'All photo modes',
      'AI Highlight Reel',
      'Full analytics dashboard',
      'Branded gallery link',
      'Priority support',
      'Guest book mode',
      'Live slideshow',
    ],
  },
  {
    id: 'venue',
    name: 'Venue',
    desc: 'White-label for venues & brands',
    price: '$199',
    priceAnnual: '$149',
    unit: '/ month',
    accent: '#fff',
    features: [
      'Everything in Creator',
      'Full white-label branding',
      'Custom domain',
      'Multi-event dashboard',
      'Print integration',
      'API access',
      'Dedicated account manager',
      'SLA guarantee',
    ],
  },
]

export default function PricingPage() {
  const router = useRouter()
  const [billing, setBilling] = [
    'monthly',
    () => {},
  ]

  return (
    <main style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderBottom: '1px solid #161616', position: 'sticky', top: 0, zIndex: 10, background: 'rgba(10,10,10,0.96)', backdropFilter: 'blur(20px)' }}>
        <button onClick={() => router.push('/')} style={{ width: 38, height: 38, background: '#161616', border: 'none', borderRadius: 12, color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <IconBack size={18} />
        </button>
        <span style={{ fontSize: 15, fontWeight: 600, flex: 1, letterSpacing: -0.3 }}>Plans & Pricing</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <IconFlash size={20} />
          <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 13, fontWeight: 700 }}>Flash</span>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '32px 18px 60px' }}>
        {/* Headline */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: '#444', marginBottom: 12 }}>Pricing</div>
          <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: -1.2, lineHeight: 1.1, marginBottom: 12 }}>
            Simple,<br /><span style={{ color: '#e8ff47' }}>honest pricing</span>
          </h1>
          <p style={{ fontSize: 14, color: '#555', lineHeight: 1.6, maxWidth: 280, margin: '0 auto' }}>
            Pay per event, or go unlimited for serious creators and venues.
          </p>
        </div>

        {/* Per Event */}
        <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 20, padding: '24px 20px', marginBottom: 12 }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#444', marginBottom: 6 }}>Per Event</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#e0e0e0', letterSpacing: -0.5, marginBottom: 4 }}>Pay as you go</div>
            <div style={{ fontSize: 13, color: '#555' }}>Perfect for a one-off celebration</div>
          </div>

          {/* Tier table */}
          <div style={{ background: '#0e0e0e', borderRadius: 12, overflow: 'hidden', marginBottom: 20 }}>
            {PLANS[0].tiers!.map((t, i) => (
              <div key={t.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 16px', borderBottom: i < PLANS[0].tiers!.length - 1 ? '1px solid #161616' : 'none' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#ccc' }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: '#444', marginTop: 2 }}>{t.guests}</div>
                </div>
                <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 15, fontWeight: 700, color: '#e8ff47' }}>{t.price}</div>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: 20 }}>
            {PLANS[0].features.map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', fontSize: 13, color: '#555' }}>
                <IconCheck size={14} color="#333" />
                {f}
              </div>
            ))}
          </div>

          <button onClick={() => router.push('/create')} style={{ width: '100%', background: 'transparent', color: '#e0e0e0', border: '1px solid #2a2a2a', borderRadius: 12, padding: '14px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            Create a Free Event
          </button>
        </div>

        {/* Creator */}
        <div style={{ background: 'rgba(232,255,71,0.05)', border: '1px solid rgba(232,255,71,0.2)', borderRadius: 20, padding: '24px 20px', marginBottom: 12, position: 'relative' }}>
          <div style={{ position: 'absolute', top: -10, left: 20, background: '#e8ff47', color: '#0a0a0a', borderRadius: 20, padding: '3px 12px', fontSize: 10, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase' }}>Most Popular</div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#e8ff47', marginBottom: 6 }}>Creator</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4 }}>
              <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 36, fontWeight: 700, color: '#e8ff47', letterSpacing: -1 }}>$29</span>
              <span style={{ fontSize: 13, color: '#666' }}>/ month</span>
            </div>
            <div style={{ fontSize: 13, color: '#555' }}>For photographers & event planners</div>
          </div>

          <div style={{ marginBottom: 20 }}>
            {PLANS[1].features.map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', fontSize: 13, color: '#999' }}>
                <IconCheck size={14} color="#e8ff47" strokeWidth={2} />
                {f}
              </div>
            ))}
          </div>

          <button onClick={() => router.push('/login')} style={{ width: '100%', background: '#e8ff47', color: '#0a0a0a', border: 'none', borderRadius: 12, padding: '15px 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', letterSpacing: -0.2 }}>
            Start 7-Day Free Trial
          </button>
        </div>

        {/* Venue */}
        <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 20, padding: '24px 20px', marginBottom: 32 }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#666', marginBottom: 6 }}>Venue License</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4 }}>
              <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 36, fontWeight: 700, color: '#f0f0f0', letterSpacing: -1 }}>$199</span>
              <span style={{ fontSize: 13, color: '#666' }}>/ month</span>
            </div>
            <div style={{ fontSize: 13, color: '#555' }}>White-label for venues & brands</div>
          </div>

          <div style={{ marginBottom: 20 }}>
            {PLANS[2].features.map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', fontSize: 13, color: '#666' }}>
                <IconCheck size={14} color="#555" />
                {f}
              </div>
            ))}
          </div>

          <button onClick={() => {}} style={{ width: '100%', background: 'transparent', color: '#e0e0e0', border: '1px solid #2a2a2a', borderRadius: 12, padding: '14px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            Contact Sales
          </button>
        </div>

        {/* Features comparison */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: '#333', marginBottom: 20, textAlign: 'center' }}>What's included in every plan</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { Icon: IconFilm, label: '29 photo modes' },
              { Icon: IconGuests, label: '20+ languages' },
              { Icon: IconShutter, label: 'Real camera' },
              { Icon: IconTarget, label: 'Scavenger hunt' },
              { Icon: IconReel, label: 'AI reel' },
              { Icon: IconStats, label: 'Analytics' },
            ].map(({ Icon, label }) => (
              <div key={label} style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: 12, padding: '14px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Icon size={18} color="#444" />
                <span style={{ fontSize: 12, color: '#555', fontWeight: 500 }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ note */}
        <div style={{ textAlign: 'center', fontSize: 13, color: '#333', lineHeight: 1.7 }}>
          All plans include Supabase-backed storage,<br />
          realtime sync, and PWA install support.<br />
          <span style={{ color: '#444' }}>No hidden fees. Cancel anytime.</span>
        </div>
      </div>
    </main>
  )
}
