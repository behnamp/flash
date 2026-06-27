'use client'
import { Suspense } from 'react'
import { IconFlash } from '@/components/icons'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

function LoginPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/host'
  const supabase = createClient()

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async () => {
    setError(''); setLoading(true)
    try {
      if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        })
        if (error) throw error
        setSuccess('Check your email for a password reset link.')
        setLoading(false)
        return
      }

      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { data: { display_name: name } }
        })
        if (error) throw error
        setSuccess('Check your email to confirm your account, then log in.')
        setLoading(false)
        return
      }

      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      router.refresh()
      await new Promise(r => setTimeout(r, 300))
      router.push(next)
    } catch (e: any) {
      setError(e.message || 'Something went wrong')
      setLoading(false)
    }
  }

  const inp = {
    background: '#111', border: '1px solid #222', borderRadius: 10,
    padding: '14px', color: '#f0f0f0', fontSize: 15, width: '100%',
    outline: 'none', fontFamily: 'inherit',
  } as React.CSSProperties

  const canSubmit = mode === 'forgot' ? !!email : (!!email && !!password)

  return (
    <main style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px 22px', paddingTop: 'max(60px, env(safe-area-inset-top))' }}>
      <Link href="/" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, marginBottom: 40, textDecoration: 'none' }}>
        <div style={{ width: 72, height: 72, background: '#e8ff47', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
          <IconFlash size={36} color="#0a0a0a" />
        </div>
        <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 26, fontWeight: 700, color: '#f0f0f0', marginBottom: 6 }}>Flash</span>
        <span style={{ fontSize: 13, color: '#444' }}>Disposable camera for events</span>
      </Link>

      <div style={{ width: '100%', maxWidth: 320 }}>

        {/* Tabs — only login/signup, not forgot */}
        {mode !== 'forgot' && (
          <div style={{ display: 'flex', background: '#111', borderRadius: 12, padding: 4, marginBottom: 28, gap: 4, border: '1px solid #1e1e1e' }}>
            {(['login', 'signup'] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setError(''); setSuccess('') }} style={{
                flex: 1, padding: '10px 0', borderRadius: 9, border: 'none',
                background: mode === m ? '#1e1e1e' : 'transparent',
                color: mode === m ? '#f0f0f0' : '#444',
                fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all .15s',
              }}>{m === 'login' ? 'Log In' : 'Sign Up'}</button>
            ))}
          </div>
        )}

        {/* Heading */}
        <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.5, marginBottom: 24, color: '#f0f0f0' }}>
          {mode === 'login' ? 'Welcome back' : mode === 'signup' ? 'Create your account' : 'Reset password'}
        </h2>

        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {mode === 'signup' && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#444', marginBottom: 7 }}>Your Name</div>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Sarah Chen" style={inp} />
            </div>
          )}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#444', marginBottom: 7 }}>Email</div>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com" onKeyDown={e => e.key === 'Enter' && handleSubmit()} style={inp} />
          </div>
          {mode !== 'forgot' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#444' }}>Password</div>
                {mode === 'login' && (
                  <button onClick={() => { setMode('forgot'); setError(''); setSuccess('') }}
                    style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: 11, fontFamily: 'inherit', padding: 0 }}>
                    Forgot password?
                  </button>
                )}
              </div>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" onKeyDown={e => e.key === 'Enter' && handleSubmit()} style={inp} />
            </div>
          )}
        </div>

        {mode === 'forgot' && (
          <p style={{ fontSize: 13, color: '#555', lineHeight: 1.6, marginTop: 12 }}>
            Enter your email and we'll send you a link to reset your password.
          </p>
        )}

        {error && <div style={{ color: '#ff4757', fontSize: 13, marginTop: 14, textAlign: 'center', background: 'rgba(255,71,87,0.08)', borderRadius: 8, padding: '10px 14px' }}>{error}</div>}
        {success && <div style={{ color: '#2ed573', fontSize: 13, marginTop: 14, textAlign: 'center', background: 'rgba(46,213,115,0.08)', borderRadius: 8, padding: '10px 14px' }}>{success}</div>}

        <button onClick={handleSubmit} disabled={loading || !canSubmit}
          style={{ width: '100%', marginTop: 20, background: canSubmit && !loading ? '#e8ff47' : '#161616', color: canSubmit && !loading ? '#0a0a0a' : '#333', border: 'none', borderRadius: 13, padding: '16px 20px', fontSize: 15, fontWeight: 700, cursor: canSubmit && !loading ? 'pointer' : 'not-allowed', transition: 'all .15s', fontFamily: 'inherit' }}>
          {loading ? '...' : mode === 'login' ? 'Log In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}
        </button>

        {/* Footer links */}
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          {mode === 'forgot' ? (
            <button onClick={() => { setMode('login'); setError(''); setSuccess('') }}
              style={{ background: 'none', border: 'none', color: '#e8ff47', cursor: 'pointer', fontWeight: 600, fontSize: 13, fontFamily: 'inherit' }}>
              ← Back to log in
            </button>
          ) : (
            <p style={{ fontSize: 13, color: '#444' }}>
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setSuccess('') }}
                style={{ background: 'none', border: 'none', color: '#e8ff47', cursor: 'pointer', fontWeight: 600, fontSize: 13, fontFamily: 'inherit' }}>
                {mode === 'login' ? 'Sign up' : 'Log in'}
              </button>
            </p>
          )}
        </div>
      </div>
    </main>
  )
}

export default function LoginPage() {
  return <Suspense><LoginPageInner /></Suspense>
}
