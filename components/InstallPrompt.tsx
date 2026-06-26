'use client'
import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function InstallPrompt() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [show, setShow] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Don't show if already installed or dismissed
    const isDismissed = localStorage.getItem('flash_install_dismissed')
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as any).standalone === true
    if (isDismissed || isStandalone) return

    // iOS Safari — custom instruction sheet (no beforeinstallprompt support)
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !(window as any).MSStream
    const safari = /safari/i.test(navigator.userAgent) && !/chrome|crios|fxios/i.test(navigator.userAgent)
    if (ios && safari) {
      setIsIOS(true)
      // Show after 8 seconds of camera use
      const t = setTimeout(() => setShow(true), 8000)
      return () => clearTimeout(t)
    }

    // Android / Chrome — native install prompt
    const handler = (e: Event) => {
      e.preventDefault()
      setPrompt(e as BeforeInstallPromptEvent)
      // Show after 5 seconds
      setTimeout(() => setShow(true), 5000)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const dismiss = () => {
    setShow(false)
    setDismissed(true)
    localStorage.setItem('flash_install_dismissed', '1')
  }

  const install = async () => {
    if (!prompt) return
    await prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') localStorage.setItem('flash_install_dismissed', '1')
    setShow(false)
    setPrompt(null)
  }

  if (!show || dismissed) return null

  // iOS manual instruction sheet
  if (isIOS) return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 999,
      background: '#111', borderTop: '1px solid #222',
      borderRadius: '20px 20px 0 0',
      padding: '20px 20px 36px',
      animation: 'slideUp .3s ease',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, background: '#e8ff47', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#0a0a0a"><path d="M13 2L4.5 13.5H11L10 22L20 10H13.5L13 2Z"/></svg>
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#f0f0f0' }}>Add Flash to Home Screen</div>
            <div style={{ fontSize: 12, color: '#555', marginTop: 2 }}>Install for the best camera experience</div>
          </div>
        </div>
        <button onClick={dismiss} style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer', padding: 4, fontSize: 20, lineHeight: 1 }}>×</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[
          { step: '1', text: 'Tap the Share button', icon: '⬆️', sub: 'at the bottom of Safari' },
          { step: '2', text: 'Tap "Add to Home Screen"', icon: '➕', sub: 'scroll down in the share sheet' },
          { step: '3', text: 'Tap "Add"', icon: '✓', sub: 'Flash will appear on your home screen' },
        ].map(s => (
          <div key={s.step} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: '#1a1a1a', border: '1px solid #2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>
              {s.icon}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#e0e0e0' }}>{s.text}</div>
              <div style={{ fontSize: 11, color: '#444' }}>{s.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <style>{`@keyframes slideUp { from { transform: translateY(100%) } to { transform: translateY(0) } }`}</style>
    </div>
  )

  // Android / Chrome native prompt
  return (
    <div style={{
      position: 'fixed', bottom: 16, left: 16, right: 16, zIndex: 999,
      background: '#111', border: '1px solid #222', borderRadius: 18,
      padding: '16px 18px',
      display: 'flex', alignItems: 'center', gap: 14,
      boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
      animation: 'slideUp .3s ease',
    }}>
      <div style={{ width: 44, height: 44, background: '#e8ff47', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="#0a0a0a"><path d="M13 2L4.5 13.5H11L10 22L20 10H13.5L13 2Z"/></svg>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#f0f0f0' }}>Install Flash</div>
        <div style={{ fontSize: 12, color: '#555' }}>Add to home screen for quick access</div>
      </div>
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <button onClick={dismiss} style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 10, padding: '8px 14px', color: '#555', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
          Not now
        </button>
        <button onClick={install} style={{ background: '#e8ff47', border: 'none', borderRadius: 10, padding: '8px 16px', color: '#0a0a0a', fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>
          Install
        </button>
      </div>
      <style>{`@keyframes slideUp { from { transform: translateY(20px); opacity:0 } to { transform: translateY(0); opacity:1 } }`}</style>
    </div>
  )
}
