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
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async () => {
    setError(''); setLoading(true)
    try {
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

      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error

      // Session is set in the browser. Refresh server state then navigate.
      router.refresh()

      // Small delay to let the middleware see the new cookie
      await new Promise(r => setTimeout(r, 300))
      router.push(next)

    } catch (e: any) {
      setError(e.message || 'Something went wrong')
      setLoading(false)
    }
  }

  const inp = {
    background: '#111',
    border: '1px solid #222',
    borderRadius: 10,
    padding: '14px',
    color: '#f0f0f0',
    fontSize: 15,
    width: '100%',
    outline: 'none',
    fontFamily: 'inherit',
  } as React.CSSProperties

  return (
    <main style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 22px' }}>
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 44, textDecoration: 'none' }}>
        <div style={{ width: 40, height: 40, background: '#e8ff47', borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <IconFlash size={20} color="#0a0a0a" />
        </div>
        <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 20, fontWeight: 700, color: '#f0f0f0' }}>Flash</span>
      </Link>

      <div style={{ width: '100%', maxWidth: 320 }}>
        {/* Tab toggle */}
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

        <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.5, marginBottom: 24, color: '#f0f0f0' }}>
          {mode === 'login' ? 'Welcome back' : 'Create your account'}
        </h2>

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
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#444', marginBottom: 7 }}>Password</div>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" onKeyDown={e => e.key === 'Enter' && handleSubmit()} style={inp} />
          </div>
        </div>

        {error && <div style={{ color: '#ff4757', fontSize: 13, marginTop: 14, textAlign: 'center', background: 'rgba(255,71,87,0.08)', borderRadius: 8, padding: '10px 14px' }}>{error}</div>}
        {success && <div style={{ color: '#2ed573', fontSize: 13, marginTop: 14, textAlign: 'center', background: 'rgba(46,213,115,0.08)', borderRadius: 8, padding: '10px 14px' }}>{success}</div>}

        <button onClick={handleSubmit} disabled={loading || !email || !password}
          style={{ width: '100%', marginTop: 20, background: email && password && !loading ? '#e8ff47' : '#161616', color: email && password && !loading ? '#0a0a0a' : '#333', border: 'none', borderRadius: 13, padding: '16px 20px', fontSize: 15, fontWeight: 700, cursor: email && password && !loading ? 'pointer' : 'not-allowed', transition: 'all .15s', fontFamily: 'inherit' }}>
          {loading ? 'Signing in...' : mode === 'login' ? 'Log In' : 'Create Account'}
        </button>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#444' }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setSuccess('') }}
            style={{ background: 'none', border: 'none', color: '#e8ff47', cursor: 'pointer', fontWeight: 600, fontSize: 13, fontFamily: 'inherit' }}>
            {mode === 'login' ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </div>
    </main>
  )
}

export default function LoginPage() {
  return <Suspense><LoginPageInner /></Suspense>
}
