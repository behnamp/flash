'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { IconBack, IconCheck, IconInstant, IconReveal, IconRolling, IconMorning, IconMilestone } from '@/components/icons'
import { REVEAL_MODES } from '@/constants/revealModes'

const REVEAL_ICONS: Record<string, any> = {
  lightning: IconInstant,
  reveal: IconReveal,
  rolling: IconRolling,
  morning: IconMorning,
  milestone: IconMilestone,
}

export default function EditEvent() {
  const { eventId } = useParams()
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')
  const [form, setForm] = useState({
    name: '', venue: '', date: '', shot_limit: 12,
    guest_cap: 50, reveal_mode: 'end', allow_captions: true,
    guest_book: false, live_slideshow: false, scavenger_hunt: false,
    ai_reel: true, print_enabled: false, stats_card_enabled: true,
    white_label: false, brand_name: '',
  })

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('events').select('*').eq('id', eventId).single()
      if (!data) { router.push('/host'); return }
      setForm({
        name: data.name || '', venue: data.venue || '', date: data.event_date || '',
        shot_limit: data.shot_limit, guest_cap: data.guest_cap,
        reveal_mode: data.reveal_mode, allow_captions: data.allow_captions,
        guest_book: data.guest_book, live_slideshow: data.live_slideshow,
        scavenger_hunt: data.scavenger_hunt, ai_reel: data.ai_reel,
        print_enabled: data.print_enabled, stats_card_enabled: data.stats_card_enabled,
        white_label: data.white_label, brand_name: data.brand_name || '',
      })
      setLoading(false)
    }
    load()
  }, [eventId])

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    setSaving(true)
    const { error } = await supabase.from('events').update({
      name: form.name, venue: form.venue || null,
      event_date: form.date || null, shot_limit: form.shot_limit,
      guest_cap: form.guest_cap, reveal_mode: form.reveal_mode as any,
      allow_captions: form.allow_captions, guest_book: form.guest_book,
      live_slideshow: form.live_slideshow, scavenger_hunt: form.scavenger_hunt,
      ai_reel: form.ai_reel, print_enabled: form.print_enabled,
      stats_card_enabled: form.stats_card_enabled, white_label: form.white_label,
      brand_name: form.white_label ? form.brand_name : null,
      updated_at: new Date().toISOString(),
    }).eq('id', eventId)

    setSaving(false)
    if (error) { setToast('Failed to save'); return }
    setToast('Changes saved ✓')
    setTimeout(() => router.push(`/host/${eventId}`), 1200)
  }

  const inp = { background: '#111', border: '1px solid #1e1e1e', borderRadius: 12, padding: '13px 14px', color: '#f0f0f0', fontSize: 14, width: '100%', outline: 'none', fontFamily: 'inherit' } as any

  const Toggle = ({ k, label, sub }: { k: string; label: string; sub?: string }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #161616' }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 500, color: '#e0e0e0' }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color: '#444', marginTop: 2 }}>{sub}</div>}
      </div>
      <div onClick={() => set(k, !(form as any)[k])} style={{ width: 44, height: 26, borderRadius: 13, background: (form as any)[k] ? '#e8ff47' : '#1e1e1e', position: 'relative', cursor: 'pointer', transition: 'background .2s', flexShrink: 0 }}>
        <div style={{ position: 'absolute', width: 20, height: 20, borderRadius: '50%', background: (form as any)[k] ? '#0a0a0a' : '#333', top: 3, left: (form as any)[k] ? 21 : 3, transition: 'left .18s' }} />
      </div>
    </div>
  )

  const Label = ({ children }: any) => (
    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#444', marginBottom: 8 }}>{children}</div>
  )

  if (loading) return (
    <main style={{ height: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#e8ff47', fontSize: 14 }}>Loading...</div>
    </main>
  )

  return (
    <main style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 'max(14px, env(safe-area-inset-top))', paddingBottom: '14px', paddingLeft: 18, paddingRight: 18, background: 'rgba(10,10,10,0.96)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #161616', position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={() => router.push(`/host/${eventId}`)} style={{ width: 38, height: 38, background: '#161616', border: 'none', borderRadius: 12, color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <IconBack size={18} />
        </button>
        <span style={{ fontSize: 15, fontWeight: 600, flex: 1, letterSpacing: -0.3 }}>Edit Event</span>
        <button onClick={handleSave} disabled={saving} style={{ background: saving ? '#161616' : '#e8ff47', color: '#0a0a0a', border: 'none', borderRadius: 10, padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 18px 40px' }}>

        {/* Basic info */}
        <div style={{ marginBottom: 28 }}>
          <Label>Event Details</Label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Event Name" style={inp} />
            <input type="date" value={form.date} onChange={e => set('date', e.target.value)} style={inp} />
            <input value={form.venue} onChange={e => set('venue', e.target.value)} placeholder="Venue (optional)" style={inp} />
          </div>
        </div>

        {/* Shot limit */}
        <div style={{ marginBottom: 28 }}>
          <Label>Shots per Guest</Label>
          <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 14, padding: '18px' }}>
            <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 44, fontWeight: 700, color: '#e8ff47', lineHeight: 1, marginBottom: 14 }}>{form.shot_limit}</div>
            <input type="range" min={3} max={36} value={form.shot_limit} onChange={e => set('shot_limit', +e.target.value)} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 10, color: '#333', fontFamily: 'Space Mono, monospace' }}>
              <span>3</span><span>36</span>
            </div>
          </div>
        </div>

        {/* Reveal mode */}
        <div style={{ marginBottom: 28 }}>
          <Label>Reveal Mode</Label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {([...REVEAL_MODES] as any[]).map((r: any) => {
              const sel = form.reveal_mode === r.id
              return (
                <div key={r.id} onClick={() => set('reveal_mode', r.id)} style={{ background: sel ? 'rgba(232,255,71,0.06)' : '#111', border: `1px solid ${sel ? '#e8ff47' : '#1e1e1e'}`, borderRadius: 12, padding: '13px 15px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, transition: 'all .15s' }}>
                  <div style={{ width: 32, height: 32, background: sel ? 'rgba(232,255,71,0.1)' : '#1a1a1a', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {(() => { const Icon = REVEAL_ICONS[r.icon] || IconReveal; return <Icon size={16} color={sel ? '#e8ff47' : '#555'} /> })()}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: sel ? '#e8ff47' : '#ccc' }}>{r.name}</div>
                    <div style={{ fontSize: 11, color: '#444', marginTop: 1 }}>{r.desc}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Features */}
        <div style={{ marginBottom: 28 }}>
          <Label>Features</Label>
          <Toggle k="allow_captions" label="Photo Captions" sub="Auto-translated for all guests" />
          <Toggle k="guest_book" label="Guest Book" sub="15-sec video messages" />
          <Toggle k="live_slideshow" label="Live Slideshow" sub="Cast to TV or projector" />
          <Toggle k="scavenger_hunt" label="Scavenger Hunt" sub="Photo prompts for guests" />
        </div>

        {/* Post event */}
        <div style={{ marginBottom: 28 }}>
          <Label>Post-Event</Label>
          <Toggle k="ai_reel" label="AI Highlight Reel" />
          <Toggle k="print_enabled" label="Print Integration" />
          <Toggle k="stats_card_enabled" label="Stats Card" />
        </div>

        {/* Branding */}
        <div style={{ marginBottom: 28 }}>
          <Label>Branding</Label>
          <Toggle k="white_label" label="White-label" sub="Add your brand to the guest experience" />
          {form.white_label && (
            <div style={{ marginTop: 12 }}>
              <input value={form.brand_name} onChange={e => set('brand_name', e.target.value)} placeholder="Brand / Venue Name" style={inp} />
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: `translateX(-50%) translateY(${toast ? 0 : 12}px)`, background: '#161616', border: '1px solid #222', borderRadius: 24, padding: '11px 20px', fontSize: 13, fontWeight: 600, color: '#e8ff47', zIndex: 999, opacity: toast ? 1 : 0, transition: 'all .25s', pointerEvents: 'none', whiteSpace: 'nowrap' }}>
        {toast}
      </div>
    </main>
  )
}
