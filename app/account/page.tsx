'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AccountPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setEmail(user.email || '')
      setLoading(false)
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const logout = async () => { await supabase.auth.signOut(); router.push('/login') }

  const deleteAccount = async () => {
    if (confirmText !== 'DELETE') { setError('Type DELETE to confirm'); return }
    setDeleting(true); setError('')
    try {
      const res = await fetch('/api/delete-account', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      await supabase.auth.signOut()
      router.push('/login?deleted=1')
    } catch (e: any) {
      setError(e.message || 'Failed to delete account')
      setDeleting(false)
    }
  }

  if (loading) return (
    <main style={{ height: '100dvh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 2, height: 30, background: '#ffb800', animation: 'b 1s ease-in-out infinite' }} />
      <style>{`@keyframes b{0%,100%{opacity:1}50%{opacity:.15}}`}</style>
    </main>
  )

  return (
    <main style={{ minHeight: '100dvh', background: '#0a0a0a', color: '#f0f0f0', fontFamily: "'Space Grotesk', sans-serif" }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 'max(14px, env(safe-area-inset-top))', paddingBottom: 14, paddingLeft: 16, paddingRight: 16, borderBottom: '1px solid #161616', position: 'sticky', top: 0, background: 'rgba(10,10,10,0.96)', backdropFilter: 'blur(20px)', zIndex: 20 }}>
        <button onClick={() => router.push('/host')} aria-label="Back" style={{ width: 38, height: 38, background: '#161616', border: 'none', borderRadius: 11, color: '#f0f0f0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <div style={{ fontSize: 16, fontWeight: 700 }}>Account</div>
      </div>

      <div style={{ padding: 20, maxWidth: 480, margin: '0 auto' }}>
        <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 16, padding: 20, marginBottom: 16 }}>
          <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: '#666', marginBottom: 6 }}>Signed in as</div>
          <div style={{ fontSize: 16, fontWeight: 600 }}>{email}</div>
        </div>

        <button onClick={logout}
          style={{ width: '100%', background: '#161616', color: '#f0f0f0', border: '1px solid #2a2a2a', borderRadius: 13, padding: '15px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', marginBottom: 28 }}>
          Log out
        </button>

        {/* Danger zone */}
        <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: '#ff4757', marginBottom: 10 }}>Danger zone</div>
        <div style={{ background: '#140a0a', border: '1px solid rgba(255,71,87,0.25)', borderRadius: 16, padding: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>Delete account</div>
          <div style={{ fontSize: 13, color: '#999', lineHeight: 1.6, marginBottom: 16 }}>
            Permanently deletes your account, all your events, and every photo in them. This cannot be undone.
          </div>

          {!showConfirm ? (
            <button onClick={() => setShowConfirm(true)}
              style={{ width: '100%', background: 'transparent', color: '#ff4757', border: '1px solid rgba(255,71,87,0.4)', borderRadius: 12, padding: '14px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              Delete my account
            </button>
          ) : (
            <div>
              <div style={{ fontSize: 13, color: '#ccc', marginBottom: 8 }}>Type <strong>DELETE</strong> to confirm:</div>
              <input value={confirmText} onChange={e => setConfirmText(e.target.value)} placeholder="DELETE"
                style={{ width: '100%', background: '#0a0a0a', border: '1px solid #2a2a2a', borderRadius: 10, padding: '12px 14px', color: '#f0f0f0', fontSize: 15, fontFamily: 'inherit', outline: 'none', marginBottom: 12, boxSizing: 'border-box' }} />
              {error && <div style={{ fontSize: 12, color: '#ff4757', marginBottom: 10 }}>{error}</div>}
              <button onClick={deleteAccount} disabled={deleting}
                style={{ width: '100%', background: '#ff4757', color: '#fff', border: 'none', borderRadius: 12, padding: '14px', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', marginBottom: 8, opacity: deleting ? 0.6 : 1 }}>
                {deleting ? 'Deleting…' : 'Permanently delete account'}
              </button>
              <button onClick={() => { setShowConfirm(false); setConfirmText(''); setError('') }}
                style={{ width: '100%', background: 'transparent', color: '#888', border: 'none', borderRadius: 12, padding: '10px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
