'use client'
import React, { Suspense } from 'react'
import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import {
  IconFlash, IconBack, IconLogout, IconPlus, IconShutter,
  IconWedding, IconBirthday, IconParty, IconTrip, IconCorporate,
  IconFestival, IconSports, IconNightlife, IconQuestion,
  IconLive, IconReveal, IconClose, IconCheck, IconTarget,
  IconEdit, IconDelete, IconDuplicate, IconLink, IconStop, IconArrowRight, IconQR, IconSave, IconMenu
} from '@/components/icons'

const EVENT_TYPE_ICONS: Record<string, any> = {
  wedding: IconWedding, birthday: IconBirthday, party: IconParty,
  trip: IconTrip, corporate: IconCorporate, festival: IconFestival,
  sports: IconSports, club: IconNightlife, other: IconQuestion,
}

const STATUS = (ev: any) => {
  if (ev.revealed) return { label: 'Revealed', color: '#2ed573', dot: '#2ed573' }
  if (!ev.is_active) return { label: 'Ended', color: '#444', dot: '#333' }
  return { label: 'Live', color: '#e8ff47', dot: '#e8ff47' }
}

function HostDashboardInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const paymentSuccess = searchParams.get('payment') === 'success'
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [toast, setToast] = useState('')
  const toastRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const menuRef = useRef<HTMLDivElement>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    clearTimeout(toastRef.current)
    toastRef.current = setTimeout(() => setToast(''), 2400)
  }

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)
      await loadEvents(user.id)
      setLoading(false)
    }
    load()
  }, [])

  const loadEvents = async (userId: string) => {
    const { data } = await supabase
      .from('events')
      .select('id, name, event_type, join_code, is_active, revealed, paid, shot_limit, created_at, reveal_mode, guest_cap, cover_image_url, cover_color')
      .eq('host_id', userId)
      .order('created_at', { ascending: false })
    setEvents(data || [])
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('events').delete().eq('id', id)
    if (error) { showToast('Failed to delete'); return }
    setEvents(e => e.filter(ev => ev.id !== id))
    setDeleteConfirm(null)
    showToast('Event deleted')
  }

  const handleEnd = async (id: string) => {
    await supabase.from('events').update({ is_active: false, ended_at: new Date().toISOString() }).eq('id', id)
    setEvents(e => e.map(ev => ev.id === id ? { ...ev, is_active: false } : ev))
    setMenuOpen(null)
    showToast('Event ended')
  }

  const handleReveal = async (id: string) => {
    await supabase.rpc('reveal_event', { event_id_param: id })
    setEvents(e => e.map(ev => ev.id === id ? { ...ev, revealed: true } : ev))
    setMenuOpen(null)
    showToast('Gallery revealed ✓')
  }

  const handleDuplicate = async (ev: any) => {
    const { data: { user: u } } = await supabase.auth.getUser()
    if (!u) return
    const { data } = await supabase.from('events').insert({
      host_id: u.id, name: `${ev.name} (Copy)`,
      event_type: ev.event_type, shot_limit: ev.shot_limit,
      reveal_mode: ev.reveal_mode, guest_cap: ev.guest_cap,
      is_active: false,
    }).select().single()
    if (data) {
      setEvents(e => [data, ...e])
      showToast('Event duplicated ✓')
    }
    setMenuOpen(null)
  }

  const copyJoinLink = (code: string) => {
    const url = `${window.location.origin}/join/${code}`
    navigator.clipboard?.writeText(url)
    setMenuOpen(null)
    showToast('Join link copied ✓')
  }

  if (loading) return (
    <main style={{ height: '100dvh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="flash-loading"><IconFlash size={40} /></div>
    </main>
  )

  const liveEvents = events.filter(e => e.is_active && !e.revealed)
  const pastEvents = events.filter(e => !e.is_active || e.revealed)

  return (
    <main style={{ minHeight: '100dvh', background: '#0a0a0a', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', paddingTop: 'max(14px, env(safe-area-inset-top))', background: 'rgba(10,10,10,0.96)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #161616', position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ width: 36, height: 36, background: '#e8ff47', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <IconFlash size={20} color="#0a0a0a" />
        </div>
        <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 16, fontWeight: 700, flex: 1, letterSpacing: -0.5 }}>Flash</span>
        <button onClick={() => router.push('/scan')} style={{ width: 36, height: 36, background: '#161616', border: 'none', borderRadius: 10, color: '#e8ff47', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 4 }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/>
            <rect x="14" y="14" width="3" height="3" rx="0.5" fill="currentColor" stroke="none"/>
            <rect x="18" y="14" width="3" height="3" rx="0.5" fill="currentColor" stroke="none"/>
            <rect x="14" y="18" width="3" height="3" rx="0.5" fill="currentColor" stroke="none"/>
            <rect x="18" y="18" width="3" height="3" rx="0.5" fill="currentColor" stroke="none"/>
          </svg>
        </button>
<button onClick={handleLogout} style={{ width: 36, height: 36, background: '#161616', border: 'none', borderRadius: 10, color: '#555', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <IconLogout size={18} />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 18px 40px' }}>
        {/* Greeting */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 12, color: '#444', marginBottom: 4 }}>Welcome back</div>
          <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.8, color: '#f0f0f0' }}>
            {user?.user_metadata?.display_name || user?.email?.split('@')[0]}
          </h1>
        </div>

        {/* Payment success banner */}
        {paymentSuccess && (
          <div style={{ background: 'rgba(46,213,115,0.08)', border: '1px solid rgba(46,213,115,0.2)', borderRadius: 14, padding: '16px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, background: 'rgba(46,213,115,0.15)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <IconCheck size={18} color="#2ed573" weight="bold" />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#2ed573', marginBottom: 2 }}>Payment confirmed!</div>
              <div style={{ fontSize: 12, color: '#555' }}>Your event is now live. Share the QR code with your guests.</div>
            </div>
          </div>
        )}

        {/* Create button */}
        <Link href="/create" style={{ textDecoration: 'none', display: 'block', marginBottom: 32 }}>
          <div style={{ background: '#e8ff47', borderRadius: 16, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 42, height: 42, background: 'rgba(0,0,0,0.12)', borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IconPlus size={22} color="#0a0a0a" weight="bold" />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#0a0a0a', letterSpacing: -0.3 }}>Create New Event</div>
              <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)', marginTop: 1 }}>Wedding, party, trip & more</div>
            </div>
          </div>
        </Link>

        {/* Live Events */}
        {liveEvents.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#e8ff47' }} className="pulse" />
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2.5, textTransform: 'uppercase', color: '#555' }}>Live Now</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {liveEvents.map(ev => <EventCard key={ev.id} ev={ev} menuOpen={menuOpen} setMenuOpen={setMenuOpen} deleteConfirm={deleteConfirm} setDeleteConfirm={setDeleteConfirm} onEnd={handleEnd} onReveal={handleReveal} onDelete={handleDelete} onDuplicate={handleDuplicate} onCopyLink={copyJoinLink} />)}
            </div>
          </div>
        )}

        {/* All Events */}
        {events.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16, opacity: 0.15 }}>
              <IconShutter size={48} color="white" />
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#333', marginBottom: 6 }}>No events yet</div>
            <div style={{ fontSize: 14, color: '#2a2a2a' }}>Create your first event above</div>
          </div>
        ) : (
          <div>
            {pastEvents.length > 0 && (
              <>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2.5, textTransform: 'uppercase', color: '#333', marginBottom: 14 }}>
                  {liveEvents.length > 0 ? 'Past Events' : 'All Events'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {pastEvents.map(ev => <EventCard key={ev.id} ev={ev} menuOpen={menuOpen} setMenuOpen={setMenuOpen} deleteConfirm={deleteConfirm} setDeleteConfirm={setDeleteConfirm} onEnd={handleEnd} onReveal={handleReveal} onDelete={handleDelete} onDuplicate={handleDuplicate} onCopyLink={copyJoinLink} />)}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Toast */}
      <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: `translateX(-50%) translateY(${toast ? 0 : 12}px)`, background: '#161616', border: '1px solid #222', borderRadius: 24, padding: '11px 20px', fontSize: 13, fontWeight: 600, color: '#f0f0f0', zIndex: 999, opacity: toast ? 1 : 0, transition: 'all .25s', whiteSpace: 'nowrap', boxShadow: '0 8px 32px rgba(0,0,0,0.6)', pointerEvents: 'none' }}>
        {toast}
      </div>
    </main>
  )
}

function EventCard({ ev, menuOpen, setMenuOpen, deleteConfirm, setDeleteConfirm, onEnd, onReveal, onDelete, onDuplicate, onCopyLink }: any) {
  const router = useRouter()
  const Icon = EVENT_TYPE_ICONS[ev.event_type] || IconQuestion
  const status = STATUS(ev)
  const isMenuOpen = menuOpen === ev.id
  const isDeleteConfirm = deleteConfirm === ev.id

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ background: '#111', border: `1px solid ${ev.is_active && !ev.revealed ? '#1e1e1e' : '#161616'}`, borderRadius: 14, overflow: 'hidden' }}>

        {/* Main row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px' }}>
          {/* Cover thumbnail */}
          <div style={{ width: 52, height: 52, borderRadius: 12, overflow: 'hidden', flexShrink: 0, cursor: 'pointer', position: 'relative', background: ev.cover_color || '#161616', border: `1px solid ${ev.is_active && !ev.revealed ? 'rgba(232,255,71,0.2)' : '#1e1e1e'}` }} onClick={() => router.push(`/host/${ev.id}`)}>
            {ev.cover_image_url
              ? <img src={ev.cover_image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1a1a1a, #222)' }}>
                  <Icon size={22} color={ev.is_active && !ev.revealed ? '#e8ff47' : '#333'} />
                </div>
              )
            }
            {/* Status dot overlay */}
            {ev.is_active && !ev.revealed && (
              <div style={{ position: 'absolute', bottom: 4, right: 4, width: 8, height: 8, borderRadius: '50%', background: '#2ed573', border: '2px solid #111', animation: 'pulse-fade 2s infinite' }} />
            )}
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => router.push(`/host/${ev.id}`)}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#e0e0e0', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.name}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: status.dot, ...(ev.is_active && !ev.revealed ? { animation: 'pulse-fade 2s infinite' } : {}) }} />
                <span style={{ fontSize: 11, color: status.color, fontWeight: 600 }}>{status.label}</span>
              </div>
              <span style={{ fontSize: 11, color: '#333' }}>·</span>
              <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, color: '#333', letterSpacing: 1 }}>{ev.join_code}</span>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            {/* Quick go to dashboard */}
            <button onClick={() => router.push(`/host/${ev.id}`)} style={{ width: 32, height: 32, background: '#1a1a1a', border: 'none', borderRadius: 9, color: '#555', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IconArrowRight size={15} color="#555" />
            </button>
            {/* 3-dot menu */}
            <button onClick={e => { e.stopPropagation(); setMenuOpen(isMenuOpen ? null : ev.id) }} style={{ width: 32, height: 32, background: isMenuOpen ? '#222' : '#1a1a1a', border: `1px solid ${isMenuOpen ? '#333' : 'transparent'}`, borderRadius: 9, color: '#555', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>
              ···
            </button>
          </div>
        </div>

        {/* Download banner for revealed events */}
        {!ev.paid && (
          <div style={{ borderTop: '1px solid #1a1a1a', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,149,0,0.05)' }}>
            <span style={{ fontSize: 12, color: '#ff9500' }}>Payment required to activate</span>
            <button onClick={() => router.push(`/pricing?eventId=${ev.id}`)}
              style={{ background: '#ff9500', color: '#000', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              Pay Now
            </button>
          </div>
        )}
        {ev.revealed && (
          <div style={{ borderTop: '1px solid #161616', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(46,213,115,0.04)' }}>
            <div style={{ fontSize: 12, color: '#555' }}>Gallery revealed — download before photos expire</div>
            <button onClick={() => router.push(`/host/${ev.id}/download`)} style={{ background: 'rgba(46,213,115,0.1)', border: '1px solid rgba(46,213,115,0.2)', borderRadius: 8, padding: '6px 12px', fontSize: 11, fontWeight: 700, color: '#2ed573', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' }}>
              <IconSave size={13} color="#2ed573" /> Download
            </button>
          </div>
        )}
        {/* Stats bar */}
        <div style={{ display: 'flex', borderTop: '1px solid #161616', padding: '10px 16px', gap: 20 }}>
          {[
            { label: 'Shot limit', value: ev.shot_limit },
            { label: 'Reveal', value: ev.reveal_mode === 'instant' ? 'Instant' : ev.reveal_mode === 'end' ? 'End' : ev.reveal_mode === 'morning' ? 'Morning' : ev.reveal_mode === 'rolling' ? 'Rolling' : 'Milestone' },
            { label: 'Created', value: new Date(ev.created_at).toLocaleDateString('en', { month: 'short', day: 'numeric' }) },
          ].map(({ label, value }) => (
            <div key={label}>
              <div style={{ fontSize: 9, color: '#333', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>{label}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#555', fontFamily: 'Space Mono, monospace' }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Dropdown menu */}
      {isMenuOpen && (
        <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: 6, background: '#161616', border: '1px solid #222', borderRadius: 14, padding: '6px', zIndex: 50, width: 220, boxShadow: '0 16px 48px rgba(0,0,0,0.7)' }}>
          <MenuItem icon={<IconArrowRight size={15} color="#666" />} label="Open Dashboard" onClick={() => { setMenuOpen(null); router.push(`/host/${ev.id}`) }} />
          <MenuItem icon={<IconQR size={15} color="#666" />} label="Copy Join Link" onClick={() => onCopyLink(ev.join_code)} />
          <MenuItem icon={<IconEdit size={15} color="#666" />} label="Edit Event" onClick={() => { setMenuOpen(null); router.push(`/host/${ev.id}/edit`) }} />
          <MenuItem icon={<IconDuplicate size={15} color="#666" />} label="Duplicate" onClick={() => onDuplicate(ev)} />
          {ev.is_active && !ev.revealed && <>
            <div style={{ height: 1, background: '#222', margin: '6px 0' }} />
            <MenuItem icon={<IconReveal size={15} color="#e8ff47" />} label="Reveal Gallery" onClick={() => onReveal(ev.id)} accent="#e8ff47" />
            <MenuItem icon={<IconStop size={15} color="#666" />} label="End Event" onClick={() => onEnd(ev.id)} />
          </>}
          <div style={{ height: 1, background: '#222', margin: '6px 0' }} />
          <MenuItem icon={<IconDelete size={15} color="#ff4757" />} label="Delete Event" onClick={() => { setMenuOpen(null); setDeleteConfirm(ev.id) }} danger />
        </div>
      )}

      {/* Delete confirm */}
      {isDeleteConfirm && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,10,10,0.95)', borderRadius: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 20, zIndex: 40 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#e0e0e0', textAlign: 'center' }}>Delete "{ev.name}"?</div>
          <div style={{ fontSize: 12, color: '#444', textAlign: 'center' }}>All photos and guests will be permanently removed.</div>
          <div style={{ display: 'flex', gap: 8, width: '100%' }}>
            <button onClick={() => setDeleteConfirm(null)} style={{ flex: 1, background: '#1a1a1a', border: '1px solid #222', borderRadius: 10, padding: '10px 0', color: '#666', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
            <button onClick={() => onDelete(ev.id)} style={{ flex: 1, background: '#ff4757', border: 'none', borderRadius: 10, padding: '10px 0', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Delete</button>
          </div>
        </div>
      )}
    </div>
  )
}

function MenuItem({ icon, label, onClick, danger, accent }: { icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean; accent?: string }) {
  return (
    <button onClick={onClick} style={{ width: '100%', background: 'transparent', border: 'none', borderRadius: 9, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontFamily: 'inherit', transition: 'background .12s', textAlign: 'left' }}
      onMouseEnter={e => (e.currentTarget.style.background = '#1e1e1e')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
      <span style={{ width: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', color: danger ? '#ff4757' : accent || '#666' }}>{icon}</span>
      <span style={{ fontSize: 13, fontWeight: 500, color: danger ? '#ff4757' : accent || '#aaa' }}>{label}</span>
    </button>
  )
}


export default function HostDashboard() {
  return <Suspense><HostDashboardInner /></Suspense>
}
