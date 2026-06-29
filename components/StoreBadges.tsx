'use client'
import { useState } from 'react'

/**
 * App Store / Google Play install badges.
 * Both are currently "Coming soon" — they show a tooltip/toast on click
 * instead of linking out. Flip `live` + `href` per store when listings go live.
 */

const STORES = {
  ios: { live: false, href: '', label: 'App Store', top: 'Download on the' },
  android: { live: false, href: '', label: 'Google Play', top: 'Get it on' },
}

function AppleGlyph({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.05 12.04c-.03-2.6 2.12-3.85 2.22-3.91-1.21-1.77-3.09-2.01-3.76-2.04-1.6-.16-3.12.94-3.93.94-.81 0-2.06-.92-3.39-.9-1.74.03-3.35 1.01-4.25 2.57-1.81 3.14-.46 7.79 1.3 10.34.86 1.25 1.89 2.65 3.23 2.6 1.3-.05 1.79-.84 3.36-.84 1.57 0 2.01.84 3.39.81 1.4-.02 2.29-1.27 3.15-2.53.99-1.45 1.4-2.85 1.42-2.93-.03-.01-2.72-1.04-2.75-4.13M14.5 4.5c.72-.87 1.2-2.08 1.07-3.28-1.03.04-2.28.69-3.02 1.56-.66.77-1.24 2-1.08 3.18 1.15.09 2.32-.59 3.03-1.46"/>
    </svg>
  )
}
function PlayGlyph({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path d="M3.6 2.3c-.3.3-.5.7-.5 1.3v16.8c0 .6.2 1 .5 1.3l.1.1L13 12.1v-.2L3.7 2.2z" fill="#00d2ff"/>
      <path d="M16.3 15.3 13 12.1v-.2l3.3-3.3.1.1 3.9 2.2c1.1.6 1.1 1.7 0 2.4z" fill="#ffce00"/>
      <path d="M16.4 15.2 13 12 3.6 21.7c.4.4 1 .4 1.7.1l11.1-6.6" fill="#ff3d47"/>
      <path d="M16.4 8.8 5.3 2.2C4.6 1.8 4 1.9 3.6 2.3L13 12z" fill="#00e676"/>
    </svg>
  )
}

function Badge({ store, size = 'md' }: { store: 'ios' | 'android'; size?: 'sm' | 'md' }) {
  const s = STORES[store]
  const [poke, setPoke] = useState(false)
  const padY = size === 'sm' ? 8 : 11
  const padX = size === 'sm' ? 12 : 16
  const glyph = size === 'sm' ? 18 : 22

  const onClick = () => {
    if (s.live && s.href) { window.open(s.href, '_blank'); return }
    setPoke(true); setTimeout(() => setPoke(false), 1600)
  }

  return (
    <button onClick={onClick}
      style={{
        position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 10,
        background: '#0a0a0a', border: '1px solid #2a2a2a', borderRadius: 12,
        padding: `${padY}px ${padX}px`, cursor: 'pointer', fontFamily: 'inherit',
        color: '#f0f0f0', transition: 'border-color .2s, transform .1s',
      }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = '#444')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = '#2a2a2a')}>
      {store === 'ios' ? <AppleGlyph size={glyph} /> : <PlayGlyph size={glyph} />}
      <span style={{ textAlign: 'left', lineHeight: 1.15 }}>
        <span style={{ display: 'block', fontSize: size === 'sm' ? 8 : 9, letterSpacing: 0.5, color: '#888', textTransform: 'uppercase' }}>{s.top}</span>
        <span style={{ display: 'block', fontSize: size === 'sm' ? 13 : 15, fontWeight: 700 }}>{s.label}</span>
      </span>
      {/* Coming soon ribbon */}
      {!s.live && (
        <span style={{ position: 'absolute', top: -8, right: -8, background: '#e8ff47', color: '#0a0a0a', fontSize: 8, fontWeight: 800, letterSpacing: 0.5, textTransform: 'uppercase', padding: '2px 6px', borderRadius: 6, whiteSpace: 'nowrap' }}>Soon</span>
      )}
      {/* Click toast */}
      {poke && (
        <span style={{ position: 'absolute', bottom: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.92)', border: '1px solid #2a2a2a', color: '#f0f0f0', fontSize: 11, fontWeight: 600, padding: '7px 12px', borderRadius: 8, whiteSpace: 'nowrap', zIndex: 5, animation: 'badgePop .2s ease' }}>
          Launching soon — use the web app meanwhile
        </span>
      )}
      <style>{`@keyframes badgePop{from{opacity:0;transform:translateX(-50%) translateY(4px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
    </button>
  )
}

export default function StoreBadges({ size = 'md', center = false }: { size?: 'sm' | 'md'; center?: boolean }) {
  return (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: center ? 'center' : 'flex-start' }}>
      <Badge store="ios" size={size} />
      <Badge store="android" size={size} />
    </div>
  )
}
