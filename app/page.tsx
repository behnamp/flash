'use client'
import Link from 'next/link'
import { IconFlash, IconShutter, IconFilm, IconGuests } from '@/components/icons'

export default function Home() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '44px 22px', textAlign: 'center' }}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 52 }}>
        <div style={{ width: 46, height: 46, background: 'var(--accent)', borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <IconFlash size={24} color="#0a0a0a" />
        </div>
        <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 24, fontWeight: 700, letterSpacing: -0.5, color: 'var(--text)' }}>Flash</span>
      </div>

      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 18 }}>
        Disposable camera · Any language · Any device
      </div>

      <h1 style={{ fontSize: 'clamp(32px,7vw,56px)', fontWeight: 700, letterSpacing: -2, lineHeight: 1.05, marginBottom: 18 }}>
        Every angle<br />of every{' '}
        <span style={{ color: 'var(--accent)' }}>moment</span>
      </h1>

      <p style={{ fontSize: 15, color: 'var(--dim)', lineHeight: 1.65, maxWidth: 300, marginBottom: 44 }}>
        Give everyone a camera. Set the rules. Reveal it all together — in your language, on any phone.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 310 }}>
        <Link href="/create" style={{ background: 'var(--accent)', color: '#0a0a0a', borderRadius: 13, padding: '15px 20px', fontSize: 14, fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <IconFlash size={18} color="#0a0a0a" /> Create an Event
        </Link>
        <Link href="/join" style={{ background: 'transparent', color: 'var(--text)', border: '1.5px solid var(--border)', borderRadius: 13, padding: '15px 20px', fontSize: 14, fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <IconShutter size={18} color="white" /> Join as Guest
        </Link>
        <Link href="/pricing" style={{ background: 'transparent', color: 'var(--dim)', borderRadius: 13, padding: '10px 20px', fontSize: 13, textDecoration: 'none', display: 'block', textAlign: 'center' }}>
          View Plans & Pricing
        </Link>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 0, marginTop: 52, paddingTop: 26, borderTop: '1px solid var(--border)', width: '100%', maxWidth: 310 }}>
        {[
          { icon: <IconGuests size={16} color="var(--accent)" />, n: '20+', l: 'Languages' },
          { icon: <IconFilm size={16} color="var(--accent)" />, n: '29', l: 'Modes' },
          { icon: <IconShutter size={16} color="var(--accent)" />, n: '5', l: 'Reveals' },
        ].map(({ icon, n, l }) => (
          <div key={l} style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, marginBottom: 4 }}>{icon}</div>
            <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 20, fontWeight: 700, color: 'var(--accent)' }}>{n}</div>
            <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1, marginTop: 2 }}>{l}</div>
          </div>
        ))}
      </div>
    </main>
  )
}
