'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { useSanityContent } from '@/lib/sanity/useSanityContent'

const IMAGES = {
  hero:    'https://d8j0ntlcm91z4.cloudfront.net/user_2y6wAIlmwDKTK54POxKgzxeDouA/hf_20260625_151843_1d70550d-dee8-4aac-b906-8a9d7b971f33.png',
  step01:  'https://d8j0ntlcm91z4.cloudfront.net/user_2y6wAIlmwDKTK54POxKgzxeDouA/hf_20260625_151848_63990bf8-33ba-4ed6-982a-6d862d6fd979.png',
  step02:  'https://d8j0ntlcm91z4.cloudfront.net/user_2y6wAIlmwDKTK54POxKgzxeDouA/hf_20260625_151855_2d252e04-d611-4746-9877-433b8c279875.png',
  step03:  'https://d8j0ntlcm91z4.cloudfront.net/user_2y6wAIlmwDKTK54POxKgzxeDouA/hf_20260625_151901_9de72663-526a-4abe-90b6-5bbfbf3aa131.png',
  wedding: 'https://d8j0ntlcm91z4.cloudfront.net/user_2y6wAIlmwDKTK54POxKgzxeDouA/hf_20260625_151913_580f4ccf-2c8d-4468-be84-fd47373234e8.png',
  party:   'https://d8j0ntlcm91z4.cloudfront.net/user_2y6wAIlmwDKTK54POxKgzxeDouA/hf_20260625_151917_573ede0f-5606-481a-90e2-84fee61db9f6.png',
  cta:     'https://d8j0ntlcm91z4.cloudfront.net/user_2y6wAIlmwDKTK54POxKgzxeDouA/hf_20260625_151923_814f5d57-75b2-4dd2-ab6d-30244103d604.png',
}

const NAV_LINKS = [
  { label: 'HOW IT WORKS', href: '#how' },
  { label: 'PRICING', href: '/pricing' },
  { label: 'FOR PROS', href: '/planners' },
  { label: 'FAQ', href: '#faq' },
]

const STATS = [
  { value: '4.9', label: 'App rating' },
  { value: '29', label: 'Film modes' },
  { value: '0', label: 'Downloads needed' },
]

const STEPS = [
  {
    num: '01',
    title: 'Create your event',
    body: 'Name your event, set the shot limit, choose when the gallery reveals.',
    accent: 'We timed it. Under a minute.',
    img: 'step01' as const,
  },
  {
    num: '02',
    title: 'Share the QR code',
    body: "One code opens the camera on every guest's phone. No app, no account, no friction.",
    accent: 'Works on any iPhone or Android. Yes, even that old one.',
    img: 'step02' as const,
  },
  {
    num: '03',
    title: 'Everyone shoots',
    body: "Guests pick a film mode, use their shots, upload from gallery too. Everything goes into your shared roll.",
    accent: "They'll fight over who picked the best filter.",
    img: 'step03' as const,
  },
  {
    num: '04',
    title: 'Reveal together',
    body: "Unlock the gallery when you're ready — instantly, end of event, morning after, or when every shot is used.",
    accent: 'The morning-after reveal hits differently. Just saying.',
    img: null,
  },
]

const USE_CASES = [
  { label: 'Wedding', color: '#c4a882' },
  { label: 'Birthday', color: '#c87828' },
  { label: 'Party', color: '#ffb800' },
  { label: 'Trip', color: '#4a8c6a' },
  { label: 'Corporate', color: '#8a8a8a' },
]

const REVIEWS = [
  {
    title: 'Used it for our wedding — everyone loved it',
    body: "We placed the QR at every table. By end of night we had 340 photos from angles we'd never have seen ourselves. The film modes made everything look incredible.",
    author: 'Sarah M.',
    date: 'June 2026',
  },
  {
    title: 'The morning reveal made me cry (good tears)',
    body: "Set it up in 2 minutes for my 30th. Guests figured it out instantly — even my 70-year-old aunt. The reveal the next morning was genuinely emotional. Didn't expect that.",
    author: 'James K.',
    date: 'May 2026',
  },
  {
    title: 'We use Flash at every event now',
    body: "Run a sports venue. Been using Flash for every match party. Guests love the disposable camera vibe. The Kodak Gold filter makes everything look cinematic.",
    author: 'Ahmed R.',
    date: 'June 2026',
  },
]

const FAQS = [
  { q: 'Do guests need to download anything?', a: 'No. Guests scan a QR code and the camera opens in their browser. No account, no app, no friction.' },
  { q: 'How does the reveal work?', a: 'You choose: instant (photos show as taken), end of event (you tap Reveal), morning after (9am next day), or milestone (when everyone uses all their shots).' },
  { q: 'What happens to photos after 14 days?', a: 'Photos are permanently deleted after 14 days. Upgrade to Keep Forever ($4.99 CAD) to store them indefinitely with unlimited downloads.' },
  { q: 'Can guests upload from their phone gallery?', a: 'Yes. The upload icon in the camera lets guests pick any photo — the same film filter is applied.' },
  { q: 'What film modes are available?', a: 'Five: Kodak Gold, Black & White (Ilford), Portra 400, Polaroid, and Golden Hour. Each is baked into the photo before upload — no post-processing needed.' },
  { q: 'Can I delete individual photos as host?', a: 'Yes. In your event dashboard, tap any photo to delete it from the gallery.' },
  { q: "What's the difference between plans?", a: 'Plans are per-event based on guest count: Starter (10 guests, $1.99) up to Unlimited ($99.99). You pay once per event, no subscriptions.' },
  { q: 'Can I embed the gallery on my website?', a: 'Yes. The download page gives you an embed code — paste it anywhere and the live gallery appears in an iframe.' },
]

const TICKER = [
  'Kodak Gold', '·', 'Ilford B&W', '·', 'Portra 400', '·', 'Polaroid', '·', 'Golden Hour',
  '·', 'No download', '·', 'Just a QR code', '·', 'Weddings', '·', 'Birthdays', '·',
  'Parties', '·', 'Trips', '·', '29 film modes', '·', 'Reveal together', '·',
]

// ── Shared animation presets ──────────────────────────────────────
const E = [0.16, 1, 0.3, 1] as const   // ease-out for entering

const heroContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
}
const heroItem = {
  hidden: { opacity: 0, y: 24, filter: 'blur(4px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.55, ease: E } },
}
const fadeUp = {
  hidden: { opacity: 0, y: 28, filter: 'blur(6px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: E } },
}
const staggerGrid = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
}
const cardItem = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: E } },
}
const popIn = {
  hidden: { opacity: 0, scale: 0 },
  visible: { opacity: 1, scale: 1, transition: { type: 'spring' as const, stiffness: 320, damping: 18 } },
}
const slideIn = {
  hidden: { opacity: 0, x: 32 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.55, ease: E } },
}

// viewport config reused across sections
const VP = { once: true, margin: '-60px' } as const

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeUseCase, setActiveUseCase] = useState(0)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const reduced = useReducedMotion()
  const cms = useSanityContent('landingPage')

  useEffect(() => {
    const isNative = !!(window as any).Capacitor?.isNativePlatform?.()
    if (isNative) { window.location.replace('/login'); return }
    const handler = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // Strip transform from variants when reduced motion is on
  const hi = reduced
    ? { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.2 } } }
    : heroItem
  const fu = reduced
    ? { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.2 } } }
    : fadeUp
  const ci = reduced
    ? { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.2 } } }
    : cardItem
  const pp = reduced
    ? { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.2 } } }
    : popIn
  const si = reduced
    ? { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.2 } } }
    : slideIn

  return (
    <div style={{ background: '#0a0a0a', color: '#f0f0f0', fontFamily: "'Space Grotesk', sans-serif", minHeight: '100dvh', overflowX: 'hidden' }}>
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />

      {/* ── NAV ── */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(10,10,10,0.96)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid #1e1e1e', boxShadow: scrolled ? '0 8px 24px rgba(0,0,0,0.45)' : 'none', transition: 'box-shadow .3s' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', height: 64 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginRight: 'auto' }}>
            <div style={{ width: 34, height: 34, background: '#ffb800', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#0a0a0a"><path d="M13 2L4.5 13.5H11L10 22L20 10H13.5L13 2Z"/></svg>
            </div>
            <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 17, fontWeight: 700, color: '#fff', letterSpacing: -0.5 }}>Flash</span>
          </Link>

          <div className="desktop-nav">
            {NAV_LINKS.map(l => (
              <Link key={l.label} href={l.href}
                style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: '#999', textDecoration: 'none', textTransform: 'uppercase', transition: 'color .15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = '#999')}>
                {l.label}
              </Link>
            ))}
          </div>

          <Link href="/login" className="nav-cta"
            style={{ background: '#ffb800', color: '#0a0a0a', borderRadius: 10, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap', transition: 'opacity .15s' }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
            Create Event
          </Link>

          <button onClick={() => setMenuOpen(!menuOpen)} className="mobile-menu-btn" aria-label="Menu"
            style={{ marginLeft: 12, background: '#161616', border: '1px solid #2a2a2a', borderRadius: 10, cursor: 'pointer', padding: 9, color: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {menuOpen
                ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>}
            </svg>
          </button>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: E }}
              style={{ background: '#0c0c0c', borderTop: '1px solid #1e1e1e', padding: '8px 20px 24px', boxShadow: '0 24px 48px rgba(0,0,0,0.6)' }}>
              {NAV_LINKS.map(l => (
                <Link key={l.label} href={l.href} onClick={() => setMenuOpen(false)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', fontSize: 15, fontWeight: 700, letterSpacing: 1.2, color: '#f0f0f0', textDecoration: 'none', textTransform: 'uppercase', borderBottom: '1px solid #1a1a1a' }}>
                  {l.label}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#858585" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                </Link>
              ))}
              <Link href="/login" onClick={() => setMenuOpen(false)}
                style={{ display: 'block', marginTop: 20, background: '#ffb800', color: '#0a0a0a', textAlign: 'center', borderRadius: 12, padding: '15px 0', fontSize: 15, fontWeight: 700, textDecoration: 'none' }}>
                Create Event
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ── HERO ── */}
      <section style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '108px 20px 56px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        {/* Background glow */}
        <motion.div
          animate={reduced ? undefined : { opacity: [0.6, 1, 0.6], scale: [1, 1.08, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%,-50%)', width: 700, height: 700, background: 'radial-gradient(circle, rgba(255,184,0,0.07) 0%, transparent 65%)', pointerEvents: 'none' }} />

        <motion.div variants={heroContainer} initial="hidden" animate="visible"
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>

          {/* Badge */}
          <motion.div variants={hi} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,184,0,0.08)', border: '1px solid rgba(255,184,0,0.2)', borderRadius: 20, padding: '6px 14px', marginBottom: 24 }}>
            <motion.div
              animate={{ scale: [1, 1.4, 1] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              style={{ width: 6, height: 6, background: '#ffb800', borderRadius: '50%' }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#ffb800' }}>No download needed</span>
          </motion.div>

          {/* Headline */}
          <motion.h1 variants={hi}
            style={{ fontSize: 'clamp(42px, 8vw, 88px)', fontWeight: 700, lineHeight: 1.0, letterSpacing: -2, margin: '0 0 24px', maxWidth: 900, color: '#f0f0f0' }}>
            Every guest.<br />
            <span style={{ color: '#ffb800' }}>One roll.</span><br />
            Revealed together.
          </motion.h1>

          {/* Sub */}
          <motion.p variants={hi}
            style={{ fontSize: 'clamp(15px, 2vw, 19px)', color: '#8a8a8a', lineHeight: 1.7, maxWidth: 520, margin: '0 0 36px' }}>
            {cms?.heroSub || 'Flash is a disposable camera for events. Guests join by QR, shoot with film modes, and the gallery unlocks when you say so.'}
          </motion.p>

          {/* CTAs */}
          <motion.div variants={hi} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 48 }}>
            <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.15 }}>
              <Link href="/login"
                style={{ background: '#ffb800', color: '#0a0a0a', borderRadius: 14, padding: '16px 32px', fontSize: 16, fontWeight: 700, textDecoration: 'none', display: 'block' }}>
                Create your event
              </Link>
            </motion.div>
            <motion.div whileHover={{ borderColor: '#444' }} transition={{ duration: 0.15 }}>
              <a href="#how"
                style={{ background: 'transparent', color: '#f0f0f0', borderRadius: 14, padding: '16px 32px', fontSize: 16, fontWeight: 700, textDecoration: 'none', border: '1px solid #222', display: 'block' }}>
                See how it works
              </a>
            </motion.div>
          </motion.div>

          {/* Phone mockup */}
          <motion.div variants={hi} style={{ position: 'relative', marginBottom: 40, width: 220 }}
            whileHover={{ y: -4 }} transition={{ duration: 0.3, ease: E }}>
            <motion.div
              animate={reduced ? undefined : { y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              style={{ borderRadius: 28, overflow: 'hidden', border: '1px solid #1e1e1e', boxShadow: '0 40px 80px rgba(0,0,0,0.6)' }}>
              <img src={IMAGES.hero} alt="Flash camera UI" style={{ width: 220, height: 'auto', display: 'block' }} />
            </motion.div>
            {/* Annotation */}
            <motion.div className="hero-annotation"
              initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.1, duration: 0.4, ease: E }}
              style={{ position: 'absolute', top: 20, right: -88, background: '#161616', border: '1px solid #222', borderRadius: 10, padding: '6px 10px', whiteSpace: 'nowrap' }}>
              <span style={{ fontSize: 10, color: '#909090', fontFamily: 'Space Mono, monospace' }}>← your guests use this</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9, duration: 0.35, ease: E }}
              style={{ position: 'absolute', bottom: -16, right: -16, background: '#ffb800', borderRadius: 14, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.6, repeat: Infinity }}
                style={{ width: 8, height: 8, background: '#0a0a0a', borderRadius: '50%' }} />
              <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, fontWeight: 700, color: '#0a0a0a' }}>Live</span>
            </motion.div>
          </motion.div>

          {/* Stats */}
          <motion.div variants={hi}
            style={{ display: 'flex', gap: 0, border: '1px solid #1a1a1a', borderRadius: 16, overflow: 'hidden', background: '#111' }}>
            {STATS.map((s, i) => (
              <motion.div key={s.label} className="stat-cell" whileHover={{ y: -3, background: 'rgba(255,184,0,0.04)' }} transition={{ duration: 0.2 }}
                style={{ textAlign: 'center', borderRight: i < STATS.length - 1 ? '1px solid #1a1a1a' : 'none' }}>
                <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 28, fontWeight: 700, color: '#ffb800', lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#858585', marginTop: 6 }}>{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ── TICKER STRIP ── */}
      <div style={{ borderTop: '1px solid #161616', borderBottom: '1px solid #161616', overflow: 'hidden', background: '#080808', padding: '14px 0' }}>
        <div style={{ display: 'flex', gap: 32, animation: 'ticker 22s linear infinite', whiteSpace: 'nowrap', width: 'max-content' }}>
          {[...TICKER, ...TICKER].map((t, i) => (
            <span key={i} style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: t === '·' ? '#ffb800' : '#909090' }}>{t}</span>
          ))}
        </div>
      </div>

      {/* ── REVIEWS ── */}
      <section style={{ padding: '64px 20px', maxWidth: 1100, margin: '0 auto' }}>
        <motion.div variants={fu} initial="hidden" whileInView="visible" viewport={VP}
          style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: '#858585', marginBottom: 12, textAlign: 'center' }}>
          What hosts say
        </motion.div>
        <motion.p variants={fu} initial="hidden" whileInView="visible" viewport={VP}
          style={{ fontSize: 'clamp(22px, 4vw, 36px)', fontWeight: 700, letterSpacing: -1, textAlign: 'center', marginBottom: 56, lineHeight: 1.2, color: '#f0f0f0', maxWidth: 600, margin: '0 auto 40px' }}>
          Real people. Real events.<br />
          <span style={{ color: '#8a8a8a' }}>Real happy.</span>
        </motion.p>
        <motion.div variants={staggerGrid} initial="hidden" whileInView="visible" viewport={VP}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          {(cms?.reviews ?? REVIEWS).map((r: typeof REVIEWS[0], i: number) => (
            <motion.div key={i} variants={ci}
              whileHover={{ y: -4, borderColor: '#2a2a2a' }}
              transition={{ duration: 0.2 }}
              style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: 18, padding: '28px 24px', cursor: 'default' }}>
              {/* Stars */}
              <div style={{ display: 'flex', gap: 3, marginBottom: 14 }}>
                {Array.from({ length: 5 }).map((_, si) => (
                  <svg key={si} width="12" height="12" viewBox="0 0 24 24" fill="#ffb800"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                ))}
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#f0f0f0', marginBottom: 12, lineHeight: 1.35 }}>{r.title}</div>
              <p style={{ fontSize: 14, color: '#8a8a8a', lineHeight: 1.75, margin: '0 0 20px' }}>{r.body}</p>
              <div style={{ fontSize: 11, color: '#8a8a8a', fontFamily: 'Space Mono, monospace' }}>{r.author} · {r.date}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── USE CASES ── */}
      <section style={{ padding: '56px 20px', background: '#0d0d0d' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <motion.div variants={fu} initial="hidden" whileInView="visible" viewport={VP}
            style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: '#858585', marginBottom: 16, textAlign: 'center' }}>
            Use cases
          </motion.div>
          <motion.h2 variants={fu} initial="hidden" whileInView="visible" viewport={VP}
            style={{ fontSize: 'clamp(28px, 5vw, 52px)', fontWeight: 700, letterSpacing: -1.5, textAlign: 'center', marginBottom: 36, lineHeight: 1.1 }}>
            "Your guests captured<br />
            <span style={{ color: '#ffb800' }}>moments you never saw."</span>
          </motion.h2>

          <motion.div variants={staggerGrid} initial="hidden" whileInView="visible" viewport={VP}
            style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 36 }}>
            {USE_CASES.map((uc, i) => (
              <motion.button key={uc.label} variants={ci}
                onClick={() => setActiveUseCase(i)}
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                style={{ background: activeUseCase === i ? 'rgba(255,184,0,0.08)' : 'transparent', border: `1px solid ${activeUseCase === i ? '#ffb800' : '#222'}`, borderRadius: 20, padding: '8px 20px', fontSize: 13, fontWeight: 600, color: activeUseCase === i ? '#ffb800' : '#8a8a8a', cursor: 'pointer', transition: 'color .2s, background .2s, border-color .2s', fontFamily: 'inherit' }}>
                {uc.label}
              </motion.button>
            ))}
          </motion.div>

          <motion.div variants={fu} initial="hidden" whileInView="visible" viewport={VP} className="usecase-grid"
            style={{ display: 'grid', gap: 16, maxWidth: 780, margin: '0 auto' }}>
            <motion.div whileHover={{ scale: 1.015 }} transition={{ duration: 0.25, ease: E }}
              style={{ borderRadius: 20, overflow: 'hidden', border: '1px solid #1e1e1e', maxHeight: 480, boxShadow: '0 24px 48px rgba(0,0,0,0.5)' }}>
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeUseCase}
                  src={activeUseCase === 0 ? IMAGES.wedding : IMAGES.party}
                  alt={USE_CASES[activeUseCase].label}
                  initial={{ opacity: 0, scale: 1.08, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.45, ease: E }}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </AnimatePresence>
            </motion.div>
            <motion.div variants={si} whileHover={{ scale: 1.015 }} transition={{ duration: 0.25, ease: E }}
              style={{ borderRadius: 20, overflow: 'hidden', border: '1px solid #1e1e1e', maxHeight: 480, boxShadow: '0 24px 48px rgba(0,0,0,0.5)' }}>
              <img src={IMAGES.hero} alt="Flash camera" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" style={{ padding: '64px 20px', maxWidth: 1100, margin: '0 auto' }}>
        <motion.div variants={fu} initial="hidden" whileInView="visible" viewport={VP}
          style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: '#858585', marginBottom: 16, textAlign: 'center' }}>
          How it works
        </motion.div>
        <motion.h2 variants={fu} initial="hidden" whileInView="visible" viewport={VP}
          style={{ fontSize: 'clamp(28px, 5vw, 52px)', fontWeight: 700, letterSpacing: -1.5, textAlign: 'center', marginBottom: 36, lineHeight: 1.1 }}>
          How a night becomes a film.
        </motion.h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {STEPS.map((step, i) => (
            <motion.div key={step.num} className="step-row"
              variants={fu} initial="hidden" whileInView="visible" viewport={VP}
              style={{ paddingBottom: 44, borderLeft: i < STEPS.length - 1 ? '1px solid #161616' : 'none', position: 'relative' }}>
              <motion.div variants={pp}
                style={{ position: 'absolute', left: -8, top: 4, width: 16, height: 16, borderRadius: '50%', background: '#ffb800', border: '3px solid #0a0a0a' }} />
              <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, fontWeight: 700, color: '#ffb800', letterSpacing: 2, paddingTop: 2 }}>{step.num}</div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 32, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 240 }}>
                  <h3 style={{ fontSize: 22, fontWeight: 700, color: '#f0f0f0', marginBottom: 12, letterSpacing: -0.5 }}>{step.title}</h3>
                  <p style={{ fontSize: 15, color: '#8a8a8a', lineHeight: 1.7, marginBottom: 10 }}>{step.body}</p>
                  <div style={{ fontSize: 12, color: '#787878', fontStyle: 'italic' }}>{step.accent}</div>
                </div>
                {step.img && (
                  <motion.div variants={si} whileHover={{ y: -4, rotate: -1.5 }} transition={{ duration: 0.25 }}
                    style={{ borderRadius: 20, overflow: 'hidden', border: '1px solid #1e1e1e', flexShrink: 0, width: 140, boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
                    <img src={IMAGES[step.img]} alt={step.title} style={{ width: '100%', display: 'block' }} />
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section style={{ padding: '56px 20px', background: '#0d0d0d', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <motion.div
          animate={reduced ? undefined : { opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 320, background: 'radial-gradient(ellipse, rgba(255,184,0,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 640, margin: '0 auto', position: 'relative' }}>
          <motion.h2 variants={fu} initial="hidden" whileInView="visible" viewport={VP}
            style={{ fontSize: 'clamp(28px, 5vw, 52px)', fontWeight: 700, letterSpacing: -1.5, marginBottom: 16, lineHeight: 1.1 }}>
            Life happens once.<br />
            <span style={{ color: '#ffb800' }}>Don't let it fade.</span>
          </motion.h2>
          <motion.p variants={fu} initial="hidden" whileInView="visible" viewport={VP}
            style={{ fontSize: 16, color: '#8a8a8a', marginBottom: 40, lineHeight: 1.6 }}>
            Start free. Your first 10 guests are on us.
          </motion.p>
          <motion.div variants={fu} initial="hidden" whileInView="visible" viewport={VP}
            style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.15 }}>
              <Link href="/login" style={{ background: '#ffb800', color: '#0a0a0a', borderRadius: 14, padding: '16px 36px', fontSize: 16, fontWeight: 700, textDecoration: 'none', display: 'block' }}>
                Create your event
              </Link>
            </motion.div>
            <Link href="/pricing" style={{ background: 'transparent', color: '#f0f0f0', borderRadius: 14, padding: '16px 36px', fontSize: 16, fontWeight: 700, textDecoration: 'none', border: '1px solid #222', display: 'block' }}>
              See pricing
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" style={{ padding: '64px 20px', maxWidth: 780, margin: '0 auto' }}>
        <motion.div variants={fu} initial="hidden" whileInView="visible" viewport={VP}
          style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: '#858585', marginBottom: 16, textAlign: 'center' }}>
          FAQ
        </motion.div>
        <motion.h2 variants={fu} initial="hidden" whileInView="visible" viewport={VP}
          style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 700, letterSpacing: -1.5, textAlign: 'center', marginBottom: 40, lineHeight: 1.1 }}>
          Got questions?<br />
          <span style={{ color: '#858585' }}>We've got answers.</span>
        </motion.h2>

        <motion.div variants={staggerGrid} initial="hidden" whileInView="visible" viewport={VP}
          style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {(cms?.faq ?? FAQS).map((faq: typeof FAQS[0], i: number) => (
            <motion.div key={i} variants={ci} style={{ borderTop: '1px solid #161616' }}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{ width: '100%', background: 'none', border: 'none', padding: '22px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', gap: 16 }}>
                <span style={{ fontSize: 16, fontWeight: 600, color: '#f0f0f0', lineHeight: 1.4 }}>{faq.q}</span>
                <motion.div
                  animate={{ rotate: openFaq === i ? 45 : 0 }}
                  transition={{ duration: 0.2, ease: E }}
                  style={{ width: 28, height: 28, background: '#161616', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#8a8a8a" strokeWidth="2.5" strokeLinecap="round">
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
                    <p style={{ fontSize: 15, color: '#8a8a8a', lineHeight: 1.7, margin: '0 0 22px', paddingRight: 44 }}>{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
          <div style={{ borderTop: '1px solid #161616' }} />
        </motion.div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ padding: '64px 20px 48px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <motion.div
          animate={reduced ? undefined : { opacity: [0.5, 1, 0.5], scale: [1, 1.06, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 700, height: 400, background: 'radial-gradient(ellipse, rgba(255,184,0,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <motion.div variants={fu} initial="hidden" whileInView="visible" viewport={VP}
          style={{ marginBottom: 36, borderRadius: 20, overflow: 'hidden', border: '1px solid #1a1a1a', maxWidth: 680, margin: '0 auto 36px', boxShadow: '0 32px 64px rgba(0,0,0,0.6)' }}
          whileHover={{ scale: 1.01 }} transition={{ duration: 0.3, ease: E }}>
          <img src={IMAGES.cta} alt="Flash gallery reveal" style={{ width: '100%', display: 'block' }} />
        </motion.div>

        <motion.p variants={fu} initial="hidden" whileInView="visible" viewport={VP}
          style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: '#787878', marginBottom: 24 }}>
          A single day becomes timeless
        </motion.p>
        <motion.h2 variants={fu} initial="hidden" whileInView="visible" viewport={VP}
          style={{ fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 700, letterSpacing: -2, marginBottom: 36, lineHeight: 1.0, color: '#f0f0f0' }}>
          when remembered<br />together.
        </motion.h2>
        <motion.div variants={fu} initial="hidden" whileInView="visible" viewport={VP}
          whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.15 }}
          style={{ display: 'inline-block' }}>
          <Link href="/login"
            style={{ background: '#ffb800', color: '#0a0a0a', borderRadius: 14, padding: '18px 44px', fontSize: 17, fontWeight: 700, textDecoration: 'none', display: 'inline-block' }}>
            Create your event →
          </Link>
        </motion.div>
      </section>

      {/* ── FOR PLANNERS ── */}
      <section id="planners" style={{ padding: '64px 20px', background: '#0d0d0d', borderTop: '1px solid #111', borderBottom: '1px solid #111' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>

          {/* Header */}
          <motion.div variants={fu} initial="hidden" whileInView="visible" viewport={VP}
            style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: '#858585', marginBottom: 16, textAlign: 'center' }}>
            Flash for Professionals
          </motion.div>
          <motion.h2 variants={fu} initial="hidden" whileInView="visible" viewport={VP}
            style={{ fontSize: 'clamp(32px, 5vw, 60px)', fontWeight: 700, letterSpacing: -2, lineHeight: 1.0, textAlign: 'center', marginBottom: 20 }}>
            Built for the people<br />
            <span style={{ color: '#ffb800' }}>who run the night.</span>
          </motion.h2>
          <motion.p variants={fu} initial="hidden" whileInView="visible" viewport={VP}
            style={{ fontSize: 16, color: '#8a8a8a', textAlign: 'center', lineHeight: 1.7, maxWidth: 480, margin: '0 auto 36px' }}>
            DJs, venues, and promoters run Flash every weekend. One flat monthly rate — no per-event fees, no surprise charges.
          </motion.p>

          {/* Audience cards */}
          <motion.div variants={staggerGrid} initial="hidden" whileInView="visible" viewport={VP}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14, marginBottom: 40 }}>
            {[
              {
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffb800" strokeWidth="1.6" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><path d="M8 6.8A5 5 0 0 1 17 10h1a2 2 0 0 1 0 4h-1a5 5 0 0 1-5 4.9"/><circle cx="9.5" cy="14.5" r="1"/></svg>,
                label: 'DJs & Photographers',
                body: 'Drop a QR on your booth. Guests capture the night with 29 film-mode cameras. Every set, documented.',
              },
              {
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffb800" strokeWidth="1.6" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
                label: 'Venues & Clubs',
                body: 'Run Flash every weekend. Set up once, reuse your template, embed the gallery on your site — guests keep coming back.',
              },
              {
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffb800" strokeWidth="1.6" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
                label: 'Promoters & Agencies',
                body: 'Attach Flash to any event. The morning-after gallery reveal drives social content without hiring a photographer.',
              },
            ].map((w, i) => (
              <motion.div key={i} variants={ci}
                style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: 20, padding: '28px 24px' }}>
                <div style={{ width: 48, height: 48, background: 'rgba(255,184,0,0.08)', borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                  {w.icon}
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#f0f0f0', marginBottom: 10, letterSpacing: -0.3 }}>{w.label}</div>
                <div style={{ fontSize: 13, color: '#8a8a8a', lineHeight: 1.7 }}>{w.body}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Plan tiers */}
          <motion.div variants={staggerGrid} initial="hidden" whileInView="visible" viewport={VP}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10, marginBottom: 40 }}>
            {[
              { name: 'DJ & Promoter', price: '$39', period: '/mo', desc: '12 events · 250 guests each', color: '#888', highlight: false },
              { name: 'Venue',         price: '$89', period: '/mo', desc: 'Unlimited events · White-label · 500 guests', color: '#ffb800', highlight: true },
              { name: 'Agency',        price: '$199', period: '/mo', desc: 'Unlimited · 5 seats · API access', color: '#c084fc', highlight: false },
            ].map((plan) => (
              <motion.div key={plan.name} variants={ci}
                style={{
                  background: plan.highlight ? 'rgba(255,184,0,0.04)' : '#111',
                  border: `1px solid ${plan.highlight ? 'rgba(255,184,0,0.25)' : '#1a1a1a'}`,
                  borderRadius: 16,
                  padding: '20px 22px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: plan.color, marginBottom: 4, letterSpacing: 0.3 }}>{plan.name}</div>
                  <div style={{ fontSize: 11, color: '#858585', lineHeight: 1.5 }}>{plan.desc}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 18, fontWeight: 700, color: plan.highlight ? '#ffb800' : '#f0f0f0' }}>{plan.price}</span>
                  <span style={{ fontSize: 11, color: '#858585' }}>{plan.period} CAD</span>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA */}
          <motion.div variants={fu} initial="hidden" whileInView="visible" viewport={VP}
            style={{ textAlign: 'center' }}>
            <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.15 }} style={{ display: 'inline-block' }}>
              <Link href="/planners"
                style={{ display: 'inline-block', background: '#ffb800', color: '#0a0a0a', borderRadius: 14, padding: '16px 44px', fontSize: 16, fontWeight: 700, textDecoration: 'none' }}>
                See professional plans →
              </Link>
            </motion.div>
            <div style={{ fontSize: 12, color: '#787878', marginTop: 14 }}>Monthly billing · Cancel anytime · No setup fees</div>
          </motion.div>

        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="site-footer" style={{ borderTop: '1px solid #1e1e1e', background: '#0c0c0c' }}>
        <div className="footer-grid" style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="footer-brand">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 32, height: 32, background: '#ffb800', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#0a0a0a"><path d="M13 2L4.5 13.5H11L10 22L20 10H13.5L13 2Z"/></svg>
              </div>
              <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 16, fontWeight: 700, color: '#fff' }}>Flash</span>
            </div>
            <p style={{ fontSize: 13, color: '#9a9a9a', lineHeight: 1.6, maxWidth: 280 }}>A disposable camera for events. Shoot together, reveal together.</p>
          </div>

          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#909090', marginBottom: 14 }}>Product</div>
            {[{ l: 'How it works', h: '#how' }, { l: 'Pricing', h: '/pricing' }, { l: 'For Planners', h: '/planners' }, { l: 'FAQ', h: '#faq' }].map(({ l, h }) => (
              <Link key={l} href={h} style={{ display: 'block', fontSize: 14, color: '#999', textDecoration: 'none', marginBottom: 10, transition: 'color .15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = '#999')}>
                {l}
              </Link>
            ))}
          </div>

          <div className="footer-events">
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#909090', marginBottom: 14 }}>Events</div>
            {['Wedding', 'Birthday', 'Party', 'Corporate', 'Trip'].map(l => (
              <div key={l} style={{ fontSize: 14, color: '#999', marginBottom: 10 }}>{l}</div>
            ))}
          </div>

          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#909090', marginBottom: 14 }}>Legal</div>
            {[{ l: 'Privacy', h: '/legal/privacy' }, { l: 'Terms', h: '/legal/terms' }].map(({ l, h }) => (
              <Link key={l} href={h} style={{ display: 'block', fontSize: 14, color: '#999', textDecoration: 'none', marginBottom: 10, transition: 'color .15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = '#999')}>
                {l}
              </Link>
            ))}
            <a href="mailto:hello@flashcam.app" style={{ display: 'block', fontSize: 14, color: '#999', textDecoration: 'none', marginBottom: 10, transition: 'color .15s' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={e => (e.currentTarget.style.color = '#999')}>
              Contact
            </a>
          </div>
        </div>

        <div className="footer-bottom" style={{ maxWidth: 1100, margin: '0 auto', paddingTop: 20, borderTop: '1px solid #1a1a1a', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ fontSize: 13, color: '#8a8a8a' }}>© 2026 Flash. All rights reserved.</div>
          <div style={{ fontSize: 13, color: '#8a8a8a' }}>flashcam.app</div>
        </div>
      </footer>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes ticker { from { transform: translateX(0) } to { transform: translateX(-50%) } }

        /* ── Mobile-first defaults ── */
        .desktop-nav { display: none !important; align-items: center; gap: 32px; }
        .nav-cta { margin-left: 10px; padding: 8px 14px; font-size: 12px; }
        .hero-annotation { display: none; }
        .stat-cell { padding: 16px 18px; }
        .usecase-grid { grid-template-columns: 1fr; }
        .step-row { display: grid; grid-template-columns: 40px 1fr; gap: 12px; margin-left: 10px; padding-left: 22px; }
        .site-footer { padding: 36px 20px 24px; }
        .footer-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px 20px; }
        .footer-brand { grid-column: 1 / -1; }
        .footer-events { display: none; }
        .footer-bottom { margin-top: 28px !important; }

        /* ── Tablet / desktop ── */
        @media (min-width: 768px) {
          .desktop-nav { display: flex !important; }
          .mobile-menu-btn { display: none !important; }
          .nav-cta { margin-left: 32px; padding: 9px 20px; font-size: 13px; }
          .hero-annotation { display: block; }
          .stat-cell { padding: 20px 32px; }
          .usecase-grid { grid-template-columns: 1fr 1fr; }
          .step-row { grid-template-columns: 80px 1fr; gap: 32px; margin-left: 39px; padding-left: 40px; }
          .site-footer { padding: 56px 24px 36px; }
          .footer-grid { grid-template-columns: 2fr 1fr 1fr 1fr; gap: 40px; }
          .footer-brand { grid-column: auto; }
          .footer-events { display: block; }
          .footer-bottom { margin-top: 44px !important; }
        }

        @media (prefers-reduced-motion: reduce) { * { animation-duration: 0.01ms !important; } .ticker { animation: none !important; } }
      `}</style>
    </div>
  )
}
