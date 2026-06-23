'use client'
import { IconBack, IconLogout, IconPlus, IconQR, IconStats, IconGuests, IconGallery, IconLive, IconReveal } from '@/components/icons'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function HostDashboard() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)

      const { data } = await supabase
        .from('events')
        .select(`
          id, name, join_code, is_active, revealed, reveal_mode,
          shot_limit, created_at, event_type,
          guests(count),
          shots(count)
        `)
        .eq('host_id', user.id)
        .order('created_at', { ascending: false })
      setEvents(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) return (
    <main style={{ height: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: 32 }} className="spin">📷</div>
    </main>
  )

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', background: 'rgba(10,10,10,0.96)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ width: 34, height: 34, background: 'var(--accent)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>📷</div>
        <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 16, fontWeight: 700, flex: 1 }}>Flash</span>
        <button onClick={handleLogout} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 12px', color: 'var(--dim)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Log out</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '22px 18px' }}>
        <div style={{ fontSize: 11, color: 'var(--dim)', marginBottom: 4 }}>Welcome back</div>
        <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.6, marginBottom: 24 }}>
          {user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Host'} 👋
        </h1>

        {/* Create button */}
        <Link href="/create" style={{
          display: 'flex', alignItems: 'center', gap: 14,
          background: 'var(--accent)', borderRadius: 14, padding: '16px 18px',
          textDecoration: 'none', marginBottom: 28
        }}>
          <div style={{ width: 40, height: 40, background: 'rgba(0,0,0,0.15)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>+</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0a0a0a' }}>Create New Event</div>
            <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.5)', marginTop: 1 }}>Wedding, party, trip & more</div>
          </div>
        </Link>

        {/* Events list */}
        {events.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎞</div>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>No events yet</div>
            <div style={{ fontSize: 14, color: 'var(--dim)' }}>Create your first event to get started</div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--dim)', marginBottom: 12 }}>Your Events</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {events.map((ev: any) => (
                <Link key={ev.id} href={`/host/${ev.id}`} style={{ textDecoration: 'none' }}>
                  <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 12, padding: '15px 16px', display: 'flex', alignItems: 'center', gap: 13 }}>
                    <div style={{ width: 42, height: 42, background: ev.is_active ? 'var(--accent-dim)' : 'var(--surface3)', border: `1px solid ${ev.is_active ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                      {ev.revealed ? '🔓' : ev.is_active ? '🔴' : '📷'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--dim)' }}>
                        {(ev as any).guests?.[0]?.count || 0} guests · {(ev as any).shots?.[0]?.count || 0} shots
                        {ev.is_active && !ev.revealed && <span style={{ color: 'var(--accent)', marginLeft: 8 }}>● Live</span>}
                        {ev.revealed && <span style={{ color: 'var(--green)', marginLeft: 8 }}>✓ Revealed</span>}
                      </div>
                    </div>
                    <div style={{ fontSize: 11, fontFamily: 'Space Mono, monospace', color: 'var(--muted)', background: 'var(--surface3)', borderRadius: 6, padding: '3px 8px' }}>{ev.join_code}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
