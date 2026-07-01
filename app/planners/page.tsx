'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'

const E = [0.16, 1, 0.3, 1] as const
const VP = { once: true, margin: '-60px' } as const

const fu = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: E } },
}
const ci = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: E } },
}
const sg = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }

const PLANS = [
  {
    id: 'dj',
    name: 'DJ & Promoter',
    price: '$39',
    period: '/mo',
    tagline: 'For DJs, photographers, and party promoters.',
    events: '12 events / month',
    guests: '250 guests / event',
    highlight: false,
    badge: null,
    features: [
      'All 29 film modes',
      'Gallery reveal controls',
      'Per-event analytics',
      'Downloadable photo pack',
      'QR code for every event',
      'Email support',
    ],
  },
  {
    id: 'venue',
    name: 'Venue',
    price: '$89',
    period: '/mo',
    tagline: 'For clubs, restaurants, and wedding venues.',
    events: 'Unlimited events',
    guests: '500 guests / event',
    highlight: true,
    badge: 'Most Popular',
    features: [
      'Everything in DJ plan',
      'White-label (remove Flash branding)',
      'Embed gallery on your site',
      'Full analytics + CSV export',
      'Priority email & chat support',
      'Reusable event templates',
    ],
  },
  {
    id: 'agency',
    name: 'Agency',
    price: '$199',
    period: '/mo',
    tagline: 'For event agencies and festival operators.',
    events: 'Unlimited events',
    guests: 'Unlimited guests',
    highlight: false,
    badge: null,
    features: [
      'Everything in Venue plan',
      '5 staff accounts',
      'API access',
      'Dedicated account manager',
      'Phone support',
      'Custom integrations',
    ],
  },
]

const WHO = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#e8ff47" strokeWidth="1.4" strokeLinecap="round">
        <circle cx="12" cy="12" r="9"/><path d="M9 12l2 2 4-4"/>
        <path d="M8 6.8A5 5 0 0 1 17 10h1a2 2 0 0 1 0 4h-1a5 5 0 0 1-5 4.9"/>
      </svg>
    ),
    label: 'DJs',
    body: 'Drop a QR on your booth. Guests capture the night with film-mode cameras. Every set, documented automatically.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#e8ff47" strokeWidth="1.4" strokeLinecap="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
    label: 'Venues',
    body: 'Run Flash every weekend. Set up once, reuse your template, embed the gallery on your site — guests keep coming back.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#e8ff47" strokeWidth="1.4" strokeLinecap="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
    label: 'Promoters',
    body: 'Attach Flash to any event. The morning-after gallery reveal drives shares and social content without hiring a photographer.',
  },
]

const TESTIMONIALS = [
  {
    quote: "I've been using Flash at every club night since January. The Kodak Gold mode makes everything look like a 90s rave — guests post the photos everywhere. It's the best marketing I've ever done.",
    author: 'Marcus L.',
    role: 'DJ & Promoter, Toronto',
  },
  {
    quote: "We run Flash at every wedding reception now. Guests love it — they forget they're even taking photos. The morning reveal is incredible. We've stopped renting photo booths entirely.",
    author: 'Aria V.',
    role: 'Event Director, Vancouver',
  },
  {
    quote: "The white-label option is huge for us. Our venues see the branded gallery, not some third-party app. Looks completely seamless. Clients think we built it.",
    author: 'Theo K.',
    role: 'Agency Owner, Montreal',
  },
]

const PRO_FAQS = [
  {
    q: 'Is billing monthly or annual?',
    a: 'Monthly, cancel anytime. Annual billing (2 months free) is available — email us at hello@flashcam.app.',
  },
  {
    q: 'What counts as "one event"?',
    a: "Each event you create in your dashboard uses one slot. Unused slots don't roll over. Unlimited-events plans (Venue, Agency) have no cap.",
  },
  {
    q: 'Can my staff manage events too?',
    a: 'Agency plan includes 5 staff seats. DJ and Venue plans are single-account. Contact us if you need additional seats.',
  },
  {
    q: 'How does white-labeling work?',
    a: 'On the Venue plan, the Flash logo and branding are hidden throughout the guest experience. Guests see your event name and colours only.',
  },
  {
    q: 'Can I embed the gallery on my website?',
    a: 'Yes — all plans get an embed code. Paste it anywhere: Squarespace, WordPress, Wix. The live gallery appears in an iframe.',
  },
  {
    q: 'What happens when I hit my event limit?',
    a: "You're notified before you hit the cap. You can upgrade your plan instantly or purchase per-event top-ups at regular pricing.",
  },
]

export default function PlannersPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [subError, setSubError] = useState('')
  const reduced = useReducedMotion()
  const router = useRouter()

  const f = reduced
    ? { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.2 } } }
    : fu
  const c = reduced
    ? { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.2 } } }
    : ci

  const handleSubscribe = async (planId: string) => {
    if (loadingPlan) return
    setLoadingPlan(planId)
    setSubError('')
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const sb = createClient()
      const { data: { session } } = await sb.auth.getSession()
      if (!session?.access_token) {
        router.push(`/login?next=/planners%23plans`)
        return
      }
      const res = await fetch('/api/stripe/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
        body: JSON.stringify({ plan: planId }),
      })
      const data = await res.json()
      if (!res.ok || data.error) { setSubError(data.error || `Error ${res.status}`); setLoadingPlan(null); return }
      window.location.assign(data.url)
    } catch (e: any) {
      setSubError(e.message || 'Something went wrong')
      setLoadingPlan(null)
    }
  }

  return (
    <div style={{ background: '#0a0a0a', color: '#f0f0f0', fontFamily: "'Space Grotesk', sans-serif", minHeight: '100dvh', overflowX: 'hidden' }}>
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />

      {/* ── NAV ── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(10,10,10,0.96)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #161616' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', height: 60, gap: 16 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginRight: 'auto' }}>
            <div style={{ width: 28, height: 28, background: '#e8ff47', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#0a0a0a"><path d="M13 2L4.5 13.5H11L10 22L20 10H13.5L13 2Z"/></svg>
            </div>
            <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 14, fontWeight: 700, color: '#f0f0f0', letterSpacing: -0.5 }}>Flash</span>
          </Link>
          <Link href="/planners/dashboard"
            style={{ fontSize: 12, fontWeight: 700, color: '#555', textDecoration: 'none', letterSpacing: 0.5 }}
            onMouseEnter={e => (e.currentTarget.style.color = '#f0f0f0')}
            onMouseLeave={e => (e.currentTarget.style.color = '#555')}>
            Dashboard
          </Link>
          <Link href="#plans"
            style={{ background: '#e8ff47', color: '#0a0a0a', borderRadius: 9, padding: '8px 18px', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
            Get started
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ padding: '100px 24px 80px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%,-50%)', width: 800, height: 500, background: 'radial-gradient(ellipse, rgba(232,255,71,0.06) 0%, transparent 65%)', pointerEvents: 'none' }} />

        <motion.div variants={f} initial="hidden" animate="visible"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(232,255,71,0.08)', border: '1px solid rgba(232,255,71,0.2)', borderRadius: 20, padding: '6px 14px', marginBottom: 32 }}>
          <div style={{ width: 6, height: 6, background: '#e8ff47', borderRadius: '50%' }} />
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#e8ff47' }}>Flash for Professionals</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 28, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.6, ease: E, delay: 0.1 }}
          style={{ fontSize: 'clamp(40px, 7vw, 82px)', fontWeight: 700, lineHeight: 1.0, letterSpacing: -2.5, margin: '0 auto 28px', maxWidth: 820 }}>
          Built for the people<br />
          <span style={{ color: '#e8ff47' }}>who run the night.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: E, delay: 0.25 }}
          style={{ fontSize: 'clamp(15px, 2vw, 19px)', color: '#555', lineHeight: 1.7, maxWidth: 520, margin: '0 auto 48px' }}>
          DJs, venues, and promoters use Flash to capture every event — no photographer, no app, no friction. Just a QR code and film.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: E, delay: 0.38 }}
          style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.15 }}>
            <a href="#plans" style={{ background: '#e8ff47', color: '#0a0a0a', borderRadius: 14, padding: '16px 36px', fontSize: 16, fontWeight: 700, textDecoration: 'none', display: 'block' }}>
              View plans →
            </a>
          </motion.div>
          <a href="#how" style={{ background: 'transparent', color: '#f0f0f0', borderRadius: 14, padding: '16px 32px', fontSize: 16, fontWeight: 700, textDecoration: 'none', border: '1px solid #222', display: 'block' }}>
            See how it works
          </a>
        </motion.div>
      </section>

      {/* ── WHO IT'S FOR ── */}
      <section id="how" style={{ padding: '80px 24px', borderTop: '1px solid #111' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <motion.div variants={f} initial="hidden" whileInView="visible" viewport={VP}
            style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: '#444', marginBottom: 16, textAlign: 'center' }}>
            Who it's for
          </motion.div>
          <motion.h2 variants={f} initial="hidden" whileInView="visible" viewport={VP}
            style={{ fontSize: 'clamp(26px, 4vw, 48px)', fontWeight: 700, letterSpacing: -1.5, textAlign: 'center', marginBottom: 56, lineHeight: 1.1 }}>
            Your events. Documented.<br />
            <span style={{ color: '#444' }}>Without lifting a camera.</span>
          </motion.h2>

          <motion.div variants={sg} initial="hidden" whileInView="visible" viewport={VP}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            {WHO.map((w, i) => (
              <motion.div key={i} variants={c}
                style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: 20, padding: '28px 24px' }}>
                <div style={{ width: 52, height: 52, background: 'rgba(232,255,71,0.08)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                  {w.icon}
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#f0f0f0', marginBottom: 10, letterSpacing: -0.4 }}>{w.label}</div>
                <div style={{ fontSize: 14, color: '#555', lineHeight: 1.7 }}>{w.body}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── NUMBERS ── */}
      <section style={{ padding: '64px 24px', background: '#0d0d0d', borderTop: '1px solid #111', borderBottom: '1px solid #111' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 0 }}>
          {[
            { n: '29', label: 'Film modes', sub: 'Kodak, Ilford, Polaroid & more' },
            { n: '0', label: 'Apps to download', sub: 'Browser-native, every device' },
            { n: '∞', label: 'Possible set lists', sub: 'Every night is different' },
            { n: '<1min', label: 'Setup per event', sub: 'Template → QR → done' },
          ].map((s, i) => (
            <motion.div key={i} variants={f} initial="hidden" whileInView="visible" viewport={VP}
              style={{ textAlign: 'center', padding: '32px 24px', borderRight: i < 3 ? '1px solid #1a1a1a' : 'none' }}>
              <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, color: '#e8ff47', marginBottom: 6 }}>{s.n}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#ccc', marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 11, color: '#444' }}>{s.sub}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── PLANS ── */}
      <section id="plans" style={{ padding: '100px 24px' }}>
        <div style={{ maxWidth: 1060, margin: '0 auto' }}>
          <motion.div variants={f} initial="hidden" whileInView="visible" viewport={VP}
            style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: '#444', marginBottom: 16, textAlign: 'center' }}>
            Professional Plans
          </motion.div>
          <motion.h2 variants={f} initial="hidden" whileInView="visible" viewport={VP}
            style={{ fontSize: 'clamp(28px, 5vw, 52px)', fontWeight: 700, letterSpacing: -1.5, textAlign: 'center', marginBottom: 12, lineHeight: 1.1 }}>
            One flat rate.<br />Every event covered.
          </motion.h2>
          <motion.p variants={f} initial="hidden" whileInView="visible" viewport={VP}
            style={{ fontSize: 15, color: '#555', textAlign: 'center', marginBottom: 60 }}>
            No per-event fees. No surprise charges. Cancel anytime.
          </motion.p>

          <motion.div variants={sg} initial="hidden" whileInView="visible" viewport={VP}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14, alignItems: 'start' }}>
            {PLANS.map((plan) => (
              <motion.div key={plan.id} variants={c}
                style={{
                  background: plan.highlight ? 'rgba(232,255,71,0.04)' : '#111',
                  border: `1px solid ${plan.highlight ? 'rgba(232,255,71,0.3)' : '#1a1a1a'}`,
                  borderRadius: 22,
                  padding: '32px 28px',
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                {plan.badge && (
                  <div style={{ position: 'absolute', top: 20, right: 20, background: '#e8ff47', color: '#0a0a0a', fontSize: 9, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', borderRadius: 7, padding: '4px 10px' }}>
                    {plan.badge}
                  </div>
                )}

                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: plan.highlight ? '#e8ff47' : '#555', marginBottom: 8 }}>
                  {plan.name}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
                  <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 44, fontWeight: 700, color: '#f0f0f0', lineHeight: 1 }}>{plan.price}</span>
                  <span style={{ fontSize: 14, color: '#444' }}>{plan.period}</span>
                  <span style={{ fontSize: 11, color: '#333', marginLeft: 2 }}>CAD</span>
                </div>
                <div style={{ fontSize: 13, color: '#555', marginBottom: 24, lineHeight: 1.5 }}>{plan.tagline}</div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 28, padding: '16px', background: plan.highlight ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.25)', borderRadius: 12 }}>
                  {[plan.events, plan.guests].map((l, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(232,255,71,0.12)', border: '1px solid rgba(232,255,71,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#e8ff47" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#ccc' }}>{l}</span>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
                  {plan.features.map((feat, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={plan.highlight ? '#e8ff47' : '#555'} strokeWidth="2.5" strokeLinecap="round" style={{ marginTop: 2, flexShrink: 0 }}>
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      <span style={{ fontSize: 13, color: '#666', lineHeight: 1.5 }}>{feat}</span>
                    </div>
                  ))}
                </div>

                {plan.id !== 'agency' ? (
                  <motion.button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={!!loadingPlan}
                    whileHover={loadingPlan ? {} : { opacity: 0.9 }}
                    whileTap={loadingPlan ? {} : { scale: 0.98 }}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: '100%', textAlign: 'center',
                      background: loadingPlan === plan.id ? '#222' : plan.highlight ? '#e8ff47' : '#1e1e1e',
                      color: loadingPlan === plan.id ? '#555' : plan.highlight ? '#0a0a0a' : '#ccc',
                      border: plan.highlight ? 'none' : '1px solid #333',
                      borderRadius: 12, padding: '15px 20px',
                      fontSize: 14, fontWeight: 700, cursor: loadingPlan ? 'default' : 'pointer',
                      fontFamily: 'inherit', height: 52,
                    }}>
                    {loadingPlan === plan.id
                      ? <div style={{ width: 18, height: 18, border: '2px solid #444', borderTop: `2px solid ${plan.highlight ? '#e8ff47' : '#888'}`, borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
                      : 'Get started →'}
                  </motion.button>
                ) : (
                  <a
                    href="mailto:hello@flashcam.app?subject=Agency Plan Inquiry"
                    style={{
                      display: 'block', textAlign: 'center',
                      background: '#1a1a1a', color: '#e8ff47',
                      border: '1px solid rgba(232,255,71,0.2)',
                      borderRadius: 12, padding: '15px 20px',
                      fontSize: 14, fontWeight: 700, textDecoration: 'none',
                    }}>
                    Contact us →
                  </a>
                )}
              </motion.div>
            ))}
          </motion.div>

          {subError && (
            <div style={{ marginTop: 20, background: 'rgba(255,71,87,0.1)', border: '1px solid rgba(255,71,87,0.3)', borderRadius: 12, padding: '12px 16px', fontSize: 14, color: '#ff4757', fontWeight: 600, textAlign: 'center' }}>
              {subError}
            </div>
          )}

          <motion.div variants={f} initial="hidden" whileInView="visible" viewport={VP}
            style={{ marginTop: 24, textAlign: 'center', padding: '20px 24px', background: '#0e0e0e', border: '1px solid #1a1a1a', borderRadius: 14 }}>
            <span style={{ fontSize: 13, color: '#444' }}>
              Not sure yet? Start with a{' '}
              <Link href="/pricing" style={{ color: '#666', textDecoration: 'none', borderBottom: '1px solid #333' }}>per-event plan</Link>
              {' '}— from $1.99 per event. Upgrade anytime.
            </span>
          </motion.div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ padding: '80px 24px', background: '#0d0d0d', borderTop: '1px solid #111', borderBottom: '1px solid #111' }}>
        <div style={{ maxWidth: 1060, margin: '0 auto' }}>
          <motion.div variants={f} initial="hidden" whileInView="visible" viewport={VP}
            style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: '#444', marginBottom: 16, textAlign: 'center' }}>
            From the pros
          </motion.div>
          <motion.h2 variants={f} initial="hidden" whileInView="visible" viewport={VP}
            style={{ fontSize: 'clamp(24px, 4vw, 42px)', fontWeight: 700, letterSpacing: -1.2, textAlign: 'center', marginBottom: 56, lineHeight: 1.1 }}>
            Real nights. Real results.
          </motion.h2>

          <motion.div variants={sg} initial="hidden" whileInView="visible" viewport={VP}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={i} variants={c}
                whileHover={{ y: -3 }} transition={{ duration: 0.2 }}
                style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: 20, padding: '28px 24px' }}>
                <div style={{ display: 'flex', gap: 2, marginBottom: 18 }}>
                  {[...Array(5)].map((_, j) => (
                    <svg key={j} width="13" height="13" viewBox="0 0 24 24" fill="#e8ff47" stroke="none">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                  ))}
                </div>
                <p style={{ fontSize: 14, color: '#888', lineHeight: 1.75, marginBottom: 20, fontStyle: 'italic' }}>"{t.quote}"</p>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#ccc' }}>{t.author}</div>
                <div style={{ fontSize: 11, color: '#444', marginTop: 3 }}>{t.role}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ padding: '100px 24px', maxWidth: 780, margin: '0 auto' }}>
        <motion.div variants={f} initial="hidden" whileInView="visible" viewport={VP}
          style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: '#444', marginBottom: 16, textAlign: 'center' }}>
          FAQ
        </motion.div>
        <motion.h2 variants={f} initial="hidden" whileInView="visible" viewport={VP}
          style={{ fontSize: 'clamp(26px, 4vw, 44px)', fontWeight: 700, letterSpacing: -1.2, textAlign: 'center', marginBottom: 60, lineHeight: 1.1 }}>
          Everything you need to know.
        </motion.h2>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {PRO_FAQS.map((faq, i) => (
            <div key={i} style={{ borderTop: '1px solid #161616' }}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{ width: '100%', background: 'none', border: 'none', padding: '22px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', gap: 16 }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: '#f0f0f0', lineHeight: 1.4 }}>{faq.q}</span>
                <motion.div
                  animate={{ rotate: openFaq === i ? 45 : 0 }}
                  transition={{ duration: 0.2, ease: E }}
                  style={{ width: 28, height: 28, background: '#161616', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                </motion.div>
              </button>
              <AnimatePresence initial={false}>
                {openFaq === i && (
                  <motion.div
                    key="answer"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.28, ease: E }}
                    style={{ overflow: 'hidden' }}>
                    <p style={{ fontSize: 15, color: '#555', lineHeight: 1.7, margin: '0 0 22px', paddingRight: 44 }}>{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
          <div style={{ borderTop: '1px solid #161616' }} />
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ padding: '80px 24px 100px', textAlign: 'center', borderTop: '1px solid #111', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 400, background: 'radial-gradient(ellipse, rgba(232,255,71,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <motion.p variants={f} initial="hidden" whileInView="visible" viewport={VP}
          style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: '#333', marginBottom: 24 }}>
          Ready to scale?
        </motion.p>
        <motion.h2 variants={f} initial="hidden" whileInView="visible" viewport={VP}
          style={{ fontSize: 'clamp(32px, 6vw, 68px)', fontWeight: 700, letterSpacing: -2, marginBottom: 40, lineHeight: 1.0, color: '#f0f0f0' }}>
          Your next event.<br />
          <span style={{ color: '#e8ff47' }}>Already covered.</span>
        </motion.h2>
        <motion.div variants={f} initial="hidden" whileInView="visible" viewport={VP}
          style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.15 }}>
            <a href="#plans" style={{ background: '#e8ff47', color: '#0a0a0a', borderRadius: 14, padding: '16px 40px', fontSize: 16, fontWeight: 700, textDecoration: 'none', display: 'block' }}>
              Choose a plan →
            </a>
          </motion.div>
          <a href="mailto:hello@flashcam.app" style={{ background: 'transparent', color: '#f0f0f0', borderRadius: 14, padding: '16px 32px', fontSize: 16, fontWeight: 700, textDecoration: 'none', border: '1px solid #222', display: 'block' }}>
            Talk to us
          </a>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid #161616', padding: '40px 24px 32px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 24, height: 24, background: '#e8ff47', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#0a0a0a"><path d="M13 2L4.5 13.5H11L10 22L20 10H13.5L13 2Z"/></svg>
            </div>
            <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 13, fontWeight: 700, color: '#f0f0f0' }}>Flash</span>
            <span style={{ fontSize: 12, color: '#2a2a2a', marginLeft: 12 }}>© 2026</span>
          </div>
          <div style={{ display: 'flex', gap: 24 }}>
            <Link href="/" style={{ fontSize: 12, color: '#444', textDecoration: 'none' }}>Home</Link>
            <Link href="/pricing" style={{ fontSize: 12, color: '#444', textDecoration: 'none' }}>Pricing</Link>
            <a href="mailto:hello@flashcam.app" style={{ fontSize: 12, color: '#444', textDecoration: 'none' }}>Contact</a>
            <Link href="/legal/privacy" style={{ fontSize: 12, color: '#444', textDecoration: 'none' }}>Privacy</Link>
          </div>
        </div>
      </footer>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes spin { to { transform: rotate(360deg) } }
        @media (prefers-reduced-motion: reduce) { * { animation-duration: 0.01ms !important; } }
      `}</style>
    </div>
  )
}
