'use client'
import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type Event = {
  id: string
  name: string
  event_type: string
  event_date: string | null
  join_code: string
  is_active: boolean
  revealed: boolean
  guest_count: number | null
  shot_count: number | null
  paid: boolean
  payment_tier: string | null
  created_at: string
}

const PLAN_LIMITS: Record<string, { events: number | null; guests: number }> = {
  dj:     { events: 12,   guests: 250 },
  venue:  { events: null, guests: 500 },
  agency: { events: null, guests: 9999 },
}

const PLAN_LABELS: Record<string, { name: string; color: string }> = {
  dj:     { name: 'DJ & Promoter', color: '#e8ff47' },
  venue:  { name: 'Venue',         color: '#60a5fa' },
  agency: { name: 'Agency',        color: '#c084fc' },
}

function StatusDot({ active }: { active: boolean }) {
  return (
    <span style={{
      display: 'inline-block', width: 7, height: 7, borderRadius: '50%',
      background: active ? '#2ed573' : '#333', marginRight: 6, flexShrink: 0,
    }} />
  )
}

function UsageBar({ used, max }: { used: number; max: number | null }) {
  const pct = max === null ? 0 : Math.min((used / max) * 100, 100)
  const warn = max !== null && pct > 80
  return (
    <div style={{ width: '100%', height: 4, background: '#1a1a1a', borderRadius: 2, overflow: 'hidden' }}>
      <div style={{
        height: '100%', borderRadius: 2,
        background: max === null ? '#2ed573' : warn ? '#ff4757' : '#e8ff47',
        width: max === null ? '100%' : `${pct}%`,
        transition: 'width .6s ease',
      }} />
    </div>
  )
}

function PlannerDashboardInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [planTier, setPlanTier] = useState<string | null>(null)
  const [toast, setToast] = useState('')
  const toastRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    if (toastRef.current) clearTimeout(toastRef.current)
    toastRef.current = setTimeout(() => setToast(''), 2400)
  }

  useEffect(() => {
    return () => { if (toastRef.current) clearTimeout(toastRef.current) }
  }, [])

  useEffect(() => {
    async function load() {
      const { data: { user: u } } = await supabase.auth.getUser()
      if (!u) { router.push('/login?next=/planners/dashboard'); return }
      setUser(u)

      // Load all events for this host
      const { data: evs } = await supabase
        .from('events')
        .select('id, name, event_type, event_date, join_code, is_active, revealed, paid, payment_tier, created_at')
        .eq('host_id', u.id)
        .order('created_at', { ascending: false })

      // Load shot + guest counts via summary view if available, else default to 0
      const eventList = (evs || []) as Event[]
      setEvents(eventList)

      const subTier = u.user_metadata?.planner_plan || null
      setPlanTier(subTier)

      if (searchParams.get('subscribed') === '1') {
        showToast('Subscription activated! Welcome to Flash Pro.')
        router.replace('/planners/dashboard')
      }

      setLoading(false)
    }
    load()
  }, [])

  const thisMonthStart = new Date()
  thisMonthStart.setDate(1); thisMonthStart.setHours(0, 0, 0, 0)
  const eventsThisMonth = events.filter(e => new Date(e.created_at) >= thisMonthStart).length
  const limits = planTier ? PLAN_LIMITS[planTier] : null
  const planInfo = planTier ? PLAN_LABELS[planTier] : null

  const totalGuests = events.reduce((sum, e) => sum + (e.guest_count ?? 0), 0)
  const totalShots  = events.reduce((sum, e) => sum + (e.shot_count  ?? 0), 0)
  const activeCount = events.filter(e => e.is_active).length

  if (loading) {
    return (
      <main style={{ height: '100dvh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 2, height: 36, background: '#e8ff47', animation: 'blink 1s ease-in-out infinite' }} />
        <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:.15}}`}</style>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100dvh', background: '#0a0a0a', color: '#f0f0f0', fontFamily: "'Space Grotesk', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />

      {/* ── TOP NAV ── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(10,10,10,0.96)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #161616', padding: '0 20px' }}>
        <div style={{ maxWidth: 1060, margin: '0 auto', display: 'flex', alignItems: 'center', height: 58, gap: 14 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginRight: 'auto' }}>
            <div style={{ width: 26, height: 26, background: '#e8ff47', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="#0a0a0a"><path d="M13 2L4.5 13.5H11L10 22L20 10H13.5L13 2Z"/></svg>
            </div>
            <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 13, fontWeight: 700, color: '#f0f0f0' }}>Flash</span>
          </Link>

          {planInfo && (
            <div style={{ background: 'rgba(232,255,71,0.08)', border: '1px solid rgba(232,255,71,0.2)', borderRadius: 8, padding: '4px 10px', fontSize: 11, fontWeight: 700, color: planInfo.color, letterSpacing: 1, textTransform: 'uppercase' }}>
              {planInfo.name}
            </div>
          )}

          <Link href="/host" style={{ fontSize: 13, fontWeight: 600, color: '#555', textDecoration: 'none' }}>All Events</Link>
          <Link href="/create" style={{ background: '#e8ff47', color: '#0a0a0a', borderRadius: 9, padding: '8px 16px', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
            + New Event
          </Link>
        </div>
      </nav>

      <div style={{ maxWidth: 1060, margin: '0 auto', padding: '32px 20px 80px' }}>

        {/* ── GREETING ── */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 11, color: '#444', fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>
            {new Date().toLocaleDateString('en-CA', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
          <h1 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 700, letterSpacing: -1, lineHeight: 1.1, marginBottom: 6 }}>
            {planInfo ? `${planInfo.name} Dashboard` : 'Pro Dashboard'}
          </h1>
          <div style={{ fontSize: 14, color: '#555' }}>
            {user?.email}
          </div>
        </div>

        {/* ── NO PLAN STATE ── */}
        {!planTier && (
          <div style={{ background: 'rgba(232,255,71,0.05)', border: '1px solid rgba(232,255,71,0.2)', borderRadius: 18, padding: '32px 28px', marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#e8ff47', marginBottom: 6 }}>No active plan</div>
              <div style={{ fontSize: 14, color: '#555', maxWidth: 420, lineHeight: 1.6 }}>
                Subscribe to a professional plan to unlock unlimited events, white-labeling, and the analytics dashboard.
              </div>
            </div>
            <Link href="/planners#plans"
              style={{ background: '#e8ff47', color: '#0a0a0a', borderRadius: 12, padding: '13px 28px', fontSize: 14, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' }}>
              Choose a plan →
            </Link>
          </div>
        )}

        {/* ── SUBSCRIPTION CARD (when plan active) ── */}
        {planTier && limits && (
          <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 18, padding: '24px 24px 20px', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#555', marginBottom: 8 }}>Active Plan</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: planInfo?.color || '#e8ff47', letterSpacing: -0.5 }}>{planInfo?.name}</div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <Link href="/planners#plans" style={{ fontSize: 13, fontWeight: 600, color: '#555', textDecoration: 'none', background: '#161616', border: '1px solid #222', borderRadius: 9, padding: '8px 14px' }}>
                  Change plan
                </Link>
                <a href="mailto:hello@flashcam.app?subject=Cancel Subscription" style={{ fontSize: 13, fontWeight: 600, color: '#444', textDecoration: 'none', background: '#161616', border: '1px solid #222', borderRadius: 9, padding: '8px 14px' }}>
                  Manage billing
                </a>
              </div>
            </div>

            {/* Usage */}
            {limits.events !== null && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: '#666', fontWeight: 500 }}>Events this month</span>
                  <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 13, color: eventsThisMonth >= limits.events ? '#ff4757' : '#ccc', fontWeight: 700 }}>
                    {eventsThisMonth} / {limits.events}
                  </span>
                </div>
                <UsageBar used={eventsThisMonth} max={limits.events} />
                {eventsThisMonth >= limits.events && (
                  <div style={{ fontSize: 12, color: '#ff4757', marginTop: 8 }}>
                    Monthly limit reached.{' '}
                    <Link href="/planners#plans" style={{ color: '#ff4757', textDecoration: 'underline' }}>Upgrade →</Link>
                  </div>
                )}
              </div>
            )}
            {limits.events === null && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#2ed573' }} />
                <span style={{ fontSize: 13, color: '#555' }}>Unlimited events — {eventsThisMonth} created this month</span>
              </div>
            )}
          </div>
        )}

        {/* ── STATS ROW ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 32 }}>
          {[
            { label: 'Total events', value: events.length, sub: 'all time', color: '#f0f0f0' },
            { label: 'Active now', value: activeCount, sub: 'live events', color: activeCount > 0 ? '#2ed573' : '#555' },
            { label: 'Total guests', value: totalGuests.toLocaleString(), sub: 'across all events', color: '#f0f0f0' },
            { label: 'Total shots', value: totalShots.toLocaleString(), sub: 'photos taken', color: '#f0f0f0' },
          ].map((s, i) => (
            <div key={i} style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: 16, padding: '20px 18px' }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: '#444', marginBottom: 8 }}>{s.label}</div>
              <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 28, fontWeight: 700, color: s.color, lineHeight: 1, marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: '#333' }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* ── EVENTS TABLE ── */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, letterSpacing: -0.5 }}>Your Events</h2>
            <Link href="/create" style={{ background: '#e8ff47', color: '#0a0a0a', borderRadius: 10, padding: '9px 18px', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
              + Create Event
            </Link>
          </div>

          {events.length === 0 ? (
            <div style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: 18, padding: '60px 24px', textAlign: 'center' }}>
              <div style={{ width: 56, height: 56, background: '#161616', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.5" strokeLinecap="round">
                  <rect x="3" y="6" width="18" height="13" rx="2"/><circle cx="12" cy="12.5" r="3.2"/><path d="M7 6V4h4v2"/>
                </svg>
              </div>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#444', marginBottom: 8 }}>No events yet</div>
              <div style={{ fontSize: 13, color: '#333', marginBottom: 24 }}>Create your first event to start capturing memories.</div>
              <Link href="/create" style={{ background: '#e8ff47', color: '#0a0a0a', borderRadius: 11, padding: '13px 28px', fontSize: 14, fontWeight: 700, textDecoration: 'none', display: 'inline-block' }}>
                Create event →
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {events.map(ev => (
                <Link key={ev.id} href={`/host/${ev.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                  <div style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: 14, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer', transition: 'border .15s' }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = '#2a2a2a')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = '#1a1a1a')}>

                    {/* Status dot */}
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: ev.is_active ? '#2ed573' : ev.revealed ? '#e8ff47' : '#333', flexShrink: 0 }} />

                    {/* Name + date */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#f0f0f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.name}</div>
                      <div style={{ fontSize: 11, color: '#444', marginTop: 2 }}>
                        {ev.event_date ? new Date(ev.event_date).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No date set'}
                      </div>
                    </div>

                    {/* Join code */}
                    <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, color: '#444', letterSpacing: 1, flexShrink: 0 }}>
                      {ev.join_code}
                    </div>

                    {/* Status badge */}
                    <div style={{
                      fontSize: 9, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase',
                      borderRadius: 6, padding: '3px 8px', flexShrink: 0,
                      background: ev.is_active ? 'rgba(46,213,115,0.12)' : ev.revealed ? 'rgba(232,255,71,0.1)' : 'rgba(255,255,255,0.05)',
                      color: ev.is_active ? '#2ed573' : ev.revealed ? '#e8ff47' : '#444',
                      border: ev.is_active ? '1px solid rgba(46,213,115,0.3)' : ev.revealed ? '1px solid rgba(232,255,71,0.2)' : '1px solid #1a1a1a',
                    }}>
                      {ev.is_active ? 'Live' : ev.revealed ? 'Revealed' : 'Draft'}
                    </div>

                    {/* Arrow */}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round">
                      <path d="M5 12h14M13 6l6 6-6 6"/>
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* ── QUICK LINKS ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, marginTop: 32 }}>
          {[
            { label: 'Create new event', href: '/create', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> },
            { label: 'View all events', href: '/host', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
            { label: 'Upgrade plan', href: '/planners#plans', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> },
            { label: 'Contact support', href: 'mailto:hello@flashcam.app', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> },
          ].map((ql, i) => (
            <Link key={i} href={ql.href}
              style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#111', border: '1px solid #1a1a1a', borderRadius: 12, padding: '14px 16px', textDecoration: 'none', color: '#666', fontSize: 13, fontWeight: 600, transition: 'all .15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.color = '#ccc' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#1a1a1a'; e.currentTarget.style.color = '#666' }}>
              <span style={{ opacity: 0.6 }}>{ql.icon}</span>
              {ql.label}
            </Link>
          ))}
        </div>
      </div>

      {/* ── TOAST ── */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(16px)', borderRadius: 24, padding: '10px 20px', fontSize: 14, fontWeight: 600, color: '#fff', zIndex: 200, whiteSpace: 'nowrap', border: '1px solid #222' }}>
          {toast}
        </div>
      )}
    </main>
  )
}

export default function PlannerDashboard() {
  return <Suspense><PlannerDashboardInner /></Suspense>
}
