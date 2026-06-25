'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'


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
  { label: 'FAQ', href: '#faq' },
]

const STATS = [
  { value: '4.9', label: 'APP RATING' },
  { value: '29', label: 'FILM MODES' },
  { value: '100%', label: 'NO DOWNLOAD' },
]

const STEPS = [
  {
    num: '01',
    title: 'Create your event',
    body: 'Name your event, set the shot limit, choose when the gallery reveals. Done in under a minute.',
    accent: 'Event name, date, rules — your call.',
  },
  {
    num: '02',
    title: 'Share the QR code',
    body: 'One QR code opens the camera on every guest\'s phone. No app download, no account, no friction.',
    accent: 'Works on any iPhone or Android.',
  },
  {
    num: '03',
    title: 'Everyone shoots',
    body: 'Guests pick a film mode, use their shot limit, upload from gallery too. Every photo goes into your shared roll.',
    accent: 'Kodak Gold, B&W, Portra, Polaroid, Golden Hour.',
  },
  {
    num: '04',
    title: 'Reveal together',
    body: 'Unlock the gallery when you\'re ready — instant, end of event, morning after, or milestone. Download forever for $4.99.',
    accent: 'Photos yours to keep.',
  },
]

const USE_CASES = [
  { label: 'Wedding', color: '#c4a882' },
  { label: 'Birthday', color: '#c87828' },
  { label: 'Party', color: '#e8ff47' },
  { label: 'Trip', color: '#4a8c6a' },
  { label: 'Corporate', color: '#555' },
]

const REVIEWS = [
  {
    title: 'Used it for our wedding — everyone loved it',
    body: 'We placed the QR at every table. By the end of the night we had 340 photos from angles we never would have seen. The film modes made everything look incredible. Worth every cent.',
    author: 'Sarah M.',
    date: 'June 2026',
  },
  {
    title: 'Best birthday gift to myself',
    body: 'Set it up in 2 minutes for my 30th. Guests figured it out instantly — even my 70-year-old aunt. The reveal the next morning was genuinely emotional. Didn\'t expect that.',
    author: 'James K.',
    date: 'May 2026',
  },
  {
    title: 'We use Flash at every 777 event now',
    body: 'Run a sports venue. Been using Flash for every match party. Guests love the disposable camera vibe. The Kodak Gold filter makes everything look cinematic.',
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
  { q: 'What\'s the difference between plans?', a: 'Plans are per-event based on guest count: Starter (10 guests, $1.99) up to Unlimited ($99.99). You pay once per event, no subscriptions.' },
  { q: 'Can I embed the gallery on my website?', a: 'Yes. The download page gives you an embed code — paste it anywhere and the live gallery appears in an iframe.' },
]

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeUseCase, setActiveUseCase] = useState(0)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <div style={{ background: '#0a0a0a', color: '#f0f0f0', fontFamily: "'Space Grotesk', sans-serif", minHeight: '100vh', overflowX: 'hidden' }}>
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />

      {/* ── NAV ── */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, transition: 'background .3s, border .3s', background: scrolled ? 'rgba(10,10,10,0.92)' : 'transparent', backdropFilter: scrolled ? 'blur(20px)' : 'none', borderBottom: scrolled ? '1px solid #161616' : '1px solid transparent' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', height: 64 }}>
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginRight: 'auto' }}>
            <div style={{ width: 32, height: 32, background: '#e8ff47', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#0a0a0a"><path d="M13 2L4.5 13.5H11L10 22L20 10H13.5L13 2Z"/></svg>
            </div>
            <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 16, fontWeight: 700, color: '#f0f0f0', letterSpacing: -0.5 }}>Flash</span>
          </Link>

          {/* Desktop nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }} className="desktop-nav">
            {NAV_LINKS.map(l => (
              <Link key={l.label} href={l.href} style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: '#555', textDecoration: 'none', textTransform: 'uppercase', transition: 'color .15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#f0f0f0')}
                onMouseLeave={e => (e.currentTarget.style.color = '#555')}>
                {l.label}
              </Link>
            ))}
          </div>

          <Link href="/login" style={{ marginLeft: 32, background: '#e8ff47', color: '#0a0a0a', borderRadius: 10, padding: '9px 20px', fontSize: 13, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap', transition: 'opacity .15s' }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
            Create Event
          </Link>

          {/* Mobile hamburger */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="mobile-menu-btn" style={{ marginLeft: 16, background: 'none', border: 'none', cursor: 'pointer', padding: 8, color: '#f0f0f0' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {menuOpen ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></> : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div style={{ background: '#0a0a0a', borderTop: '1px solid #161616', padding: '16px 24px 24px' }}>
            {NAV_LINKS.map(l => (
              <Link key={l.label} href={l.href} onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '12px 0', fontSize: 13, fontWeight: 700, letterSpacing: 1.5, color: '#555', textDecoration: 'none', textTransform: 'uppercase', borderBottom: '1px solid #161616' }}>
                {l.label}
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section ref={heroRef} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '120px 24px 80px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        {/* Background glow */}
        <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 600, background: 'radial-gradient(circle, rgba(232,255,71,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(232,255,71,0.08)', border: '1px solid rgba(232,255,71,0.2)', borderRadius: 20, padding: '6px 14px', marginBottom: 32 }}>
          <div style={{ width: 6, height: 6, background: '#e8ff47', borderRadius: '50%' }} />
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#e8ff47' }}>No download needed</span>
        </div>

        <h1 style={{ fontSize: 'clamp(42px, 8vw, 88px)', fontWeight: 700, lineHeight: 1.0, letterSpacing: -2, margin: '0 0 24px', maxWidth: 900, color: '#f0f0f0' }}>
          Every guest.<br />
          <span style={{ color: '#e8ff47' }}>One roll.</span><br />
          Revealed together.
        </h1>

        <p style={{ fontSize: 'clamp(15px, 2vw, 19px)', color: '#666', lineHeight: 1.7, maxWidth: 520, margin: '0 0 44px' }}>
          Flash is a disposable camera for events. Guests join by QR, shoot with film modes, and the gallery unlocks when you say so.
        </p>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 80 }}>
          <Link href="/login" style={{ background: '#e8ff47', color: '#0a0a0a', borderRadius: 14, padding: '16px 32px', fontSize: 16, fontWeight: 700, textDecoration: 'none', transition: 'transform .15s, opacity .15s' }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'none')}>
            Create your event
          </Link>
          <a href="#how" style={{ background: 'transparent', color: '#f0f0f0', borderRadius: 14, padding: '16px 32px', fontSize: 16, fontWeight: 700, textDecoration: 'none', border: '1px solid #222', transition: 'border-color .15s' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = '#444')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = '#222')}>
            See how it works
          </a>
        </div>

        {/* Hero phone mockup */}
        <div style={{ position: 'relative', marginBottom: 56, width: 220, height: 'auto' }}>
          <div style={{ borderRadius: 28, overflow: 'hidden', border: '1px solid #1e1e1e', boxShadow: '0 40px 80px rgba(0,0,0,0.6)' }}>
            <img src={IMAGES.hero} alt="Flash camera UI" style={{ width: 220, height: 'auto', display: 'block' }} />
          </div>
          <div style={{ position: 'absolute', bottom: -16, right: -16, background: '#e8ff47', borderRadius: 14, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, background: '#0a0a0a', borderRadius: '50%' }} />
            <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, fontWeight: 700, color: '#0a0a0a' }}>Live</span>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 0, border: '1px solid #1a1a1a', borderRadius: 16, overflow: 'hidden', background: '#111' }}>
          {STATS.map((s, i) => (
            <div key={s.label} style={{ padding: '20px 32px', textAlign: 'center', borderRight: i < STATS.length - 1 ? '1px solid #1a1a1a' : 'none' }}>
              <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 28, fontWeight: 700, color: '#e8ff47', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#444', marginTop: 6 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── REVIEWS ── */}
      <section style={{ padding: '80px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: '#444', marginBottom: 40, textAlign: 'center' }}>What hosts say</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          {REVIEWS.map((r, i) => (
            <div key={i} style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: 18, padding: '28px 24px' }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#f0f0f0', marginBottom: 12, lineHeight: 1.3 }}>{r.title}</div>
              <p style={{ fontSize: 14, color: '#555', lineHeight: 1.7, margin: '0 0 20px' }}>{r.body}</p>
              <div style={{ fontSize: 11, color: '#333' }}>{r.author} · {r.date}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── USE CASES ── */}
      <section style={{ padding: '80px 24px', background: '#0d0d0d' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: '#444', marginBottom: 24, textAlign: 'center' }}>Use cases</div>
          <h2 style={{ fontSize: 'clamp(28px, 5vw, 52px)', fontWeight: 700, letterSpacing: -1.5, textAlign: 'center', marginBottom: 48, lineHeight: 1.1 }}>
            "Your guests captured<br />
            <span style={{ color: '#e8ff47' }}>moments you never saw.</span>"
          </h2>

          {/* Use case tabs */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 48 }}>
            {USE_CASES.map((uc, i) => (
              <button key={uc.label} onClick={() => setActiveUseCase(i)} style={{ background: activeUseCase === i ? 'rgba(232,255,71,0.08)' : 'transparent', border: `1px solid ${activeUseCase === i ? '#e8ff47' : '#222'}`, borderRadius: 20, padding: '8px 20px', fontSize: 13, fontWeight: 600, color: activeUseCase === i ? '#e8ff47' : '#555', cursor: 'pointer', transition: 'all .2s', fontFamily: 'inherit' }}>
                {uc.label}
              </button>
            ))}
          </div>

          {/* Use case content */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, maxWidth: 780, margin: '0 auto' }}>
            {/* Left: scene image */}
            <div style={{ borderRadius: 20, overflow: 'hidden', border: '1px solid #1e1e1e', maxHeight: 480, boxShadow: '0 24px 48px rgba(0,0,0,0.5)' }}>
              <img
                src={activeUseCase === 0 ? IMAGES.wedding : IMAGES.party}
                alt={USE_CASES[activeUseCase].label}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'opacity .3s' }}
              />
            </div>
            {/* Right: camera UI */}
            <div style={{ borderRadius: 20, overflow: 'hidden', border: '1px solid #1e1e1e', maxHeight: 480, boxShadow: '0 24px 48px rgba(0,0,0,0.5)' }}>
              <img
                src={IMAGES.hero}
                alt="Flash camera"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" style={{ padding: '100px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: '#444', marginBottom: 16, textAlign: 'center' }}>How it works</div>
        <h2 style={{ fontSize: 'clamp(28px, 5vw, 52px)', fontWeight: 700, letterSpacing: -1.5, textAlign: 'center', marginBottom: 80, lineHeight: 1.1 }}>
          How a night becomes a film.
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {STEPS.map((step, i) => (
            <div key={step.num} style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 32, paddingBottom: 60, borderLeft: i < STEPS.length - 1 ? '1px solid #161616' : 'none', marginLeft: 39, paddingLeft: 40, position: 'relative' }}>
              {/* Step dot */}
              <div style={{ position: 'absolute', left: -8, top: 4, width: 16, height: 16, borderRadius: '50%', background: '#e8ff47', border: '3px solid #0a0a0a' }} />
              {/* Step number */}
              <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, fontWeight: 700, color: '#e8ff47', letterSpacing: 2, paddingTop: 2 }}>{step.num}</div>
              {/* Content */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 32, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 240 }}>
                  <h3 style={{ fontSize: 22, fontWeight: 700, color: '#f0f0f0', marginBottom: 12, letterSpacing: -0.5 }}>{step.title}</h3>
                  <p style={{ fontSize: 15, color: '#555', lineHeight: 1.7, marginBottom: 12 }}>{step.body}</p>
                  <div style={{ fontSize: 12, color: '#333', fontStyle: 'italic' }}>{step.accent}</div>
                </div>
                {[IMAGES.step01, IMAGES.step02, IMAGES.step03, null][i] && (
                  <div style={{ borderRadius: 20, overflow: 'hidden', border: '1px solid #1e1e1e', flexShrink: 0, width: 140, boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
                    <img src={[IMAGES.step01, IMAGES.step02, IMAGES.step03, null][i] as string} alt={step.title} style={{ width: '100%', display: 'block' }} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section style={{ padding: '80px 24px', background: '#0d0d0d', textAlign: 'center' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(28px, 5vw, 52px)', fontWeight: 700, letterSpacing: -1.5, marginBottom: 16, lineHeight: 1.1 }}>
            Life happens once.<br />
            <span style={{ color: '#e8ff47' }}>Don't let it fade.</span>
          </h2>
          <p style={{ fontSize: 16, color: '#555', marginBottom: 40, lineHeight: 1.6 }}>
            Start free. Your first 10 guests are on us.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/login" style={{ background: '#e8ff47', color: '#0a0a0a', borderRadius: 14, padding: '16px 36px', fontSize: 16, fontWeight: 700, textDecoration: 'none' }}>
              Create your event
            </Link>
            <Link href="/pricing" style={{ background: 'transparent', color: '#f0f0f0', borderRadius: 14, padding: '16px 36px', fontSize: 16, fontWeight: 700, textDecoration: 'none', border: '1px solid #222' }}>
              See pricing
            </Link>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" style={{ padding: '100px 24px', maxWidth: 780, margin: '0 auto' }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: '#444', marginBottom: 16, textAlign: 'center' }}>FAQ</div>
        <h2 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 700, letterSpacing: -1.5, textAlign: 'center', marginBottom: 60, lineHeight: 1.1 }}>
          Frequently asked<br />questions.
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {FAQS.map((faq, i) => (
            <div key={i} style={{ borderTop: '1px solid #161616' }}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: '100%', background: 'none', border: 'none', padding: '22px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', gap: 16 }}>
                <span style={{ fontSize: 16, fontWeight: 600, color: '#f0f0f0', lineHeight: 1.4 }}>{faq.q}</span>
                <div style={{ width: 28, height: 28, background: '#161616', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'transform .2s', transform: openFaq === i ? 'rotate(45deg)' : 'none' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </div>
              </button>
              {openFaq === i && (
                <div style={{ paddingBottom: 22 }}>
                  <p style={{ fontSize: 15, color: '#555', lineHeight: 1.7, margin: 0 }}>{faq.a}</p>
                </div>
              )}
            </div>
          ))}
          <div style={{ borderTop: '1px solid #161616' }} />
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ padding: '100px 24px 60px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 700, height: 400, background: 'radial-gradient(ellipse, rgba(232,255,71,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ marginBottom: 48, borderRadius: 20, overflow: 'hidden', border: '1px solid #1a1a1a', maxWidth: 680, margin: '0 auto 48px', boxShadow: '0 32px 64px rgba(0,0,0,0.6)' }}>
          <img src={IMAGES.cta} alt="Flash gallery reveal" style={{ width: '100%', display: 'block' }} />
        </div>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: '#333', marginBottom: 24 }}>A single day becomes timeless</p>
        <h2 style={{ fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 700, letterSpacing: -2, marginBottom: 48, lineHeight: 1.0, color: '#f0f0f0' }}>
          when remembered<br />together.
        </h2>
        <Link href="/login" style={{ background: '#e8ff47', color: '#0a0a0a', borderRadius: 14, padding: '18px 44px', fontSize: 17, fontWeight: 700, textDecoration: 'none', display: 'inline-block' }}>
          Create your event →
        </Link>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid #161616', padding: '60px 24px 40px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40 }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ width: 28, height: 28, background: '#e8ff47', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#0a0a0a"><path d="M13 2L4.5 13.5H11L10 22L20 10H13.5L13 2Z"/></svg>
              </div>
              <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 14, fontWeight: 700, color: '#f0f0f0' }}>Flash</span>
            </div>
            <p style={{ fontSize: 13, color: '#333', lineHeight: 1.7, maxWidth: 240 }}>A disposable camera for events. Shoot together, reveal together.</p>
          </div>

          {/* Product */}
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#333', marginBottom: 16 }}>Product</div>
            {[{ l: 'How it works', h: '#how' }, { l: 'Pricing', h: '/pricing' }, { l: 'FAQ', h: '#faq' }].map(({ l, h }) => (
              <Link key={l} href={h} style={{ display: 'block', fontSize: 13, color: '#444', textDecoration: 'none', marginBottom: 10, transition: 'color .15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#f0f0f0')}
                onMouseLeave={e => (e.currentTarget.style.color = '#444')}>
                {l}
              </Link>
            ))}
          </div>

          {/* Events */}
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#333', marginBottom: 16 }}>Events</div>
            {['Wedding', 'Birthday', 'Party', 'Corporate', 'Trip'].map(l => (
              <div key={l} style={{ fontSize: 13, color: '#444', marginBottom: 10 }}>{l}</div>
            ))}
          </div>

          {/* Legal */}
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#333', marginBottom: 16 }}>Legal</div>
            {[{ l: 'Privacy', h: '/legal/privacy' }, { l: 'Terms', h: '/legal/terms' }].map(({ l, h }) => (
              <Link key={l} href={h} style={{ display: 'block', fontSize: 13, color: '#444', textDecoration: 'none', marginBottom: 10, transition: 'color .15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#f0f0f0')}
                onMouseLeave={e => (e.currentTarget.style.color = '#444')}>
                {l}
              </Link>
            ))}
            <a href="mailto:hello@flashcam.app" style={{ display: 'block', fontSize: 13, color: '#444', textDecoration: 'none', marginBottom: 10, transition: 'color .15s' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#f0f0f0')}
              onMouseLeave={e => (e.currentTarget.style.color = '#444')}>
              Contact
            </a>
          </div>
        </div>

        <div style={{ maxWidth: 1100, margin: '48px auto 0', paddingTop: 24, borderTop: '1px solid #111', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ fontSize: 12, color: '#2a2a2a' }}>© 2026 Flash. All rights reserved.</div>
          <div style={{ fontSize: 12, color: '#2a2a2a' }}>flashcam.app</div>
        </div>
      </footer>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
        }
        @media (min-width: 769px) {
          .mobile-menu-btn { display: none !important; }
        }
        @media (max-width: 640px) {
          footer > div > div { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  )
}
