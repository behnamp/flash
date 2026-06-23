'use client'
import { IconFlash } from '@/components/icons'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
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
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.push('/host')
      }
    } catch (e: any) {
      setError(e.message || 'Something went wrong')
    } finally { setLoading(false) }
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 22px' }}>
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 44, textDecoration: 'none' }}>
        <div style={{ width: 40, height: 40, background: 'var(--accent)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconFlash size={20} color="#0a0a0a" /></div>
        <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>Flash</span>
      </Link>

      <div style={{ width: '100%', maxWidth: 320 }}>
        {/* Tab toggle */}
        <div style={{ display: 'flex', background: 'var(--surface2)', borderRadius: 12, padding: 4, marginBottom: 28, gap: 4 }}>
          {(['login', 'signup'] as const).map(m => (
            <button key={m} onClick={() => { setMode(m); setError(''); setSuccess(''); }} style={{
              flex: 1, padding: '9px 0', borderRadius: 9, border: 'none',
              background: mode === m ? 'var(--surface3)' : 'transparent',
              color: mode === m ? 'var(--text)' : 'var(--dim)',
              fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all .15s',
              textTransform: 'capitalize'
            }}>{m === 'login' ? 'Log In' : 'Sign Up'}</button>
          ))}
        </div>

        <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.5, marginBottom: 24 }}>
          {mode === 'login' ? 'Welcome back' : 'Create your account'}
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {mode === 'signup' && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--dim)', marginBottom: 7 }}>Your Name</div>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Sarah Chen"
                style={{ background: 'var(--surface2)', border: '1.5px solid var(--border)', borderRadius: 10, padding: '13px 14px', color: 'var(--text)', fontSize: 14, width: '100%', outline: 'none' }} />
            </div>
          )}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--dim)', marginBottom: 7 }}>Email</div>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              style={{ background: 'var(--surface2)', border: '1.5px solid var(--border)', borderRadius: 10, padding: '13px 14px', color: 'var(--text)', fontSize: 14, width: '100%', outline: 'none' }} />
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--dim)', marginBottom: 7 }}>Password</div>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              style={{ background: 'var(--surface2)', border: '1.5px solid var(--border)', borderRadius: 10, padding: '13px 14px', color: 'var(--text)', fontSize: 14, width: '100%', outline: 'none' }} />
          </div>
        </div>

        {error && <div style={{ color: 'var(--red)', fontSize: 13, marginTop: 12, textAlign: 'center' }}>{error}</div>}
        {success && <div style={{ color: 'var(--green)', fontSize: 13, marginTop: 12, textAlign: 'center' }}>{success}</div>}

        <button onClick={handleSubmit} disabled={loading || !email || !password}
          style={{ width: '100%', marginTop: 20, background: email && password && !loading ? 'var(--accent)' : 'var(--surface3)', color: email && password && !loading ? '#0a0a0a' : 'var(--muted)', border: 'none', borderRadius: 13, padding: '15px 20px', fontSize: 14, fontWeight: 700, cursor: email && password && !loading ? 'pointer' : 'not-allowed', transition: 'all .15s' }}>
          {loading ? 'Please wait...' : mode === 'login' ? 'Log In →' : 'Create Account →'}
        </button>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--dim)' }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setSuccess(''); }}
            style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
            {mode === 'login' ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </div>
    </main>
  )
}
