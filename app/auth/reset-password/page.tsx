'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { IconFlash } from '@/components/icons'

function ResetPasswordInner() {
  const router = useRouter()
  const supabase = createClient()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleReset = async () => {
    if (password !== confirm) { setError("Passwords don't match"); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true); setError('')
    const { error } = await supabase.auth.updateUser({ password })
    if (error) { setError(error.message); setLoading(false); return }
    setSuccess(true)
    setTimeout(() => router.push('/host'), 2000)
  }

  const inp = { background: '#111', border: '1px solid #222', borderRadius: 10, padding: '14px', color: '#f0f0f0', fontSize: 15, width: '100%', outline: 'none', fontFamily: 'inherit' } as any

  return (
    <main style={{ minHeight: '100dvh', background: '#0a0a0a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 22px' }}>
      <div style={{ width: 40, height: 40, background: '#ffb800', borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 44 }}>
        <IconFlash size={20} color="#0a0a0a" />
      </div>

      <div style={{ width: '100%', maxWidth: 320 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.5, marginBottom: 8, color: '#f0f0f0' }}>Set new password</h2>
        <p style={{ fontSize: 13, color: '#555', marginBottom: 24 }}>Choose a strong password for your Flash account.</p>

        {!success ? (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#444', marginBottom: 7 }}>New Password</div>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={inp} />
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#444', marginBottom: 7 }}>Confirm Password</div>
                <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === 'Enter' && handleReset()} style={inp} />
              </div>
            </div>
            {error && <div style={{ color: '#ff4757', fontSize: 13, marginTop: 14, background: 'rgba(255,71,87,0.08)', borderRadius: 8, padding: '10px 14px' }}>{error}</div>}
            <button onClick={handleReset} disabled={loading || !password || !confirm}
              style={{ width: '100%', marginTop: 20, background: password && confirm && !loading ? '#ffb800' : '#161616', color: password && confirm && !loading ? '#0a0a0a' : '#333', border: 'none', borderRadius: 13, padding: '16px 20px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              {loading ? '...' : 'Update Password'}
            </button>
          </>
        ) : (
          <div style={{ background: 'rgba(46,213,115,0.08)', border: '1px solid rgba(46,213,115,0.2)', borderRadius: 12, padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#2ed573', marginBottom: 4 }}>Password updated!</div>
            <div style={{ fontSize: 13, color: '#555' }}>Redirecting to your dashboard...</div>
          </div>
        )}
      </div>
    </main>
  )
}

export default function ResetPasswordPage() {
  return <Suspense><ResetPasswordInner /></Suspense>
}
