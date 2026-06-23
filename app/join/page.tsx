'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function JoinPage() {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleJoin = () => {
    const clean = code.trim().toUpperCase().replace(/[^A-Z0-9]/g, '')
    if (clean.length < 6) { setError('Please enter a valid event code'); return; }
    router.push(`/join/${clean}`)
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 22px' }}>
      <div style={{ fontSize: 40, marginBottom: 20 }}>📷</div>
      <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.6, marginBottom: 8 }}>Join an Event</h1>
      <p style={{ fontSize: 14, color: 'var(--dim)', marginBottom: 32, textAlign: 'center' }}>Enter the code from your host or scan the QR code</p>
      <div style={{ width: '100%', maxWidth: 310 }}>
        <input
          value={code} onChange={e => { setCode(e.target.value.toUpperCase()); setError(''); }}
          placeholder="Enter event code" maxLength={10}
          onKeyDown={e => e.key === 'Enter' && handleJoin()}
          style={{ background: 'var(--surface2)', border: `1.5px solid ${error ? 'var(--red)' : 'var(--border)'}`, borderRadius: 10, padding: '14px 16px', color: 'var(--text)', fontSize: 18, width: '100%', outline: 'none', textAlign: 'center', fontFamily: 'var(--font-mono)', letterSpacing: 3, marginBottom: 10 }}
        />
        {error && <p style={{ color: 'var(--red)', fontSize: 12, marginBottom: 10, textAlign: 'center' }}>{error}</p>}
        <button onClick={handleJoin} style={{ background: 'var(--accent)', color: '#0a0a0a', border: 'none', borderRadius: 13, padding: '14px 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer', width: '100%' }}>
          Join Event →
        </button>
      </div>
    </main>
  )
}
