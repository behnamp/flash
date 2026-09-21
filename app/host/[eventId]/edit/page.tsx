'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { IconBack, IconCheck, IconInstant, IconReveal, IconRolling, IconMorning, IconMilestone } from '@/components/icons'
import { REVEAL_MODES } from '@/constants/revealModes'
import { PHOTO_MODES } from '@/constants/photoModes'
import { MODE_PREVIEWS } from '@/lib/modePreviews'
import { useRef } from 'react'
import { FEATURES } from '@/lib/features'

const MODE_CONTROLS = [
  { id: 'lock', label: 'Lock to one mode', desc: 'Everyone shoots in the same look' },
  { id: 'menu', label: 'Mode menu', desc: 'Guests choose from your approved selection' },
  { id: 'free', label: 'Free choice', desc: 'Guests pick any mode they want' },
  { id: 'random', label: 'Random assign', desc: 'Each guest gets a surprise mode' },
  { id: 'blind', label: 'Shoot blind', desc: 'Mode revealed only when gallery unlocks' },
]
const COVER_EMOJIS = ['⚡','💍','🎂','🎉','✈️','🏆','🎵','📷','🌅','🎬','🌿','🔥','🎊','🥂','🎈','❤️']

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
    name: '', venue: '', date: '', ends: '', shot_limit: 12,
    guest_cap: 50, reveal_mode: 'end', allow_captions: true,
    guest_book: false, live_slideshow: false, scavenger_hunt: false,
    ai_reel: false, print_enabled: false, stats_card_enabled: true,
    white_label: false, brand_name: '',
    mode_control: 'lock', selected_modes: ['kodak'] as string[], locked_mode: 'kodak',
    cover_emoji: '⚡', cover_image_url: '',
  })
  const coverInputRef = useRef<HTMLInputElement>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('events').select('*').eq('id', eventId).single()
      if (!data) { router.push('/host'); return }
      setForm({
        name: data.name || '', venue: data.venue || '', date: data.event_date || '', ends: toLocalInput(data.ends_at),
        shot_limit: data.shot_limit, guest_cap: data.guest_cap,
        reveal_mode: data.reveal_mode, allow_captions: data.allow_captions,
        guest_book: data.guest_book, live_slideshow: data.live_slideshow,
        scavenger_hunt: data.scavenger_hunt, ai_reel: data.ai_reel,
        print_enabled: data.print_enabled, stats_card_enabled: data.stats_card_enabled,
        white_label: data.white_label, brand_name: data.brand_name || '',
        mode_control: data.mode_control || 'lock',
        selected_modes: data.selected_modes?.length ? data.selected_modes : ['kodak'],
        locked_mode: data.locked_mode || 'kodak',
        cover_emoji: data.cover_emoji || '⚡', cover_image_url: data.cover_image_url || '',
      })
      setLoading(false)
    }
    load()
  }, [eventId])

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    setSaving(true)
    // Upload a newly chosen cover photo before saving
    let coverUrl = form.cover_image_url || null
    if (coverFile) {
      const user = (await supabase.auth.getSession()).data.session?.user ?? null
      const ext = (coverFile.name.split('.').pop() || 'jpg')
      const path = `covers/${user?.id}/${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage.from('shots').upload(path, coverFile, { contentType: coverFile.type, upsert: false })
      if (!upErr) coverUrl = supabase.storage.from('shots').getPublicUrl(path).data.publicUrl
    }
    const payload: Record<string, any> = {
      name: form.name, venue: form.venue || null,
      event_date: form.date || null, shot_limit: form.shot_limit,
      guest_cap: form.guest_cap, reveal_mode: form.reveal_mode as any,
      allow_captions: form.allow_captions, guest_book: form.guest_book,
      live_slideshow: form.live_slideshow, scavenger_hunt: form.scavenger_hunt,
      ai_reel: form.ai_reel, print_enabled: form.print_enabled,
      stats_card_enabled: form.stats_card_enabled, white_label: form.white_label,
      brand_name: form.white_label ? form.brand_name : null,
      mode_control: form.mode_control as any,
      selected_modes: form.selected_modes,
      locked_mode: form.locked_mode,
      cover_emoji: form.cover_emoji,
      cover_image_url: coverUrl,
      updated_at: new Date().toISOString(),
      ends_at: form.ends ? new Date(form.ends).toISOString() : null,
    }
    let { error } = await supabase.from('events').update(payload).eq('id', eventId)
    // Databases without the ends_at column yet: save everything else
    if (error && /ends_at/.test(error.message || '')) {
      delete payload.ends_at
      ;({ error } = await supabase.from('events').update(payload).eq('id', eventId))
    }

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
        {sub && <div style={{ fontSize: 12, color: '#8a8a8a', marginTop: 2 }}>{sub}</div>}
      </div>
      <div onClick={() => set(k, !(form as any)[k])} style={{ width: 44, height: 26, borderRadius: 13, background: (form as any)[k] ? '#ffb800' : '#1e1e1e', position: 'relative', cursor: 'pointer', transition: 'background .2s', flexShrink: 0 }}>
        <div style={{ position: 'absolute', width: 20, height: 20, borderRadius: '50%', background: (form as any)[k] ? '#0a0a0a' : '#333', top: 3, left: (form as any)[k] ? 21 : 3, transition: 'left .18s' }} />
      </div>
    </div>
  )

  const Label = ({ children }: any) => (
    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#8a8a8a', marginBottom: 8 }}>{children}</div>
  )

  if (loading) return (
    <main style={{ height: '100dvh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#ffb800', fontSize: 14 }}>Loading...</div>
    </main>
  )

  return (
    <main style={{ minHeight: '100dvh', background: '#0a0a0a', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 'max(14px, env(safe-area-inset-top))', paddingBottom: '14px', paddingLeft: 18, paddingRight: 18, background: 'rgba(10,10,10,0.96)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #161616', position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={() => router.push(`/host/${eventId}`)} style={{ width: 38, height: 38, background: '#161616', border: 'none', borderRadius: 12, color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <IconBack size={18} />
        </button>
        <span style={{ fontSize: 15, fontWeight: 600, flex: 1, letterSpacing: -0.3 }}>Edit Event</span>
        <button onClick={handleSave} disabled={saving} style={{ background: saving ? '#161616' : '#ffb800', color: '#0a0a0a', border: 'none', borderRadius: 10, padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
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
            <div>
              <div style={{ fontSize: 12, color: '#999', margin: '4px 2px 6px' }}>Event ends</div>
              <input type="datetime-local" value={form.ends} onChange={e => set('ends', e.target.value)} style={{ ...inp, colorScheme: 'dark' }} />
              <div style={{ fontSize: 12, color: '#777', margin: '6px 2px 0', lineHeight: 1.5 }}>
                {form.ends
                  ? 'The event closes and the gallery reveals at this time.'
                  : 'Leave empty: closes and reveals automatically at 9:00 AM the morning after the event date.'}
                {form.ends && <button onClick={() => set('ends', '')} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: 12, cursor: 'pointer', padding: '0 0 0 6px', fontFamily: 'inherit' }}>Use default</button>}
              </div>
            </div>
            <input value={form.venue} onChange={e => set('venue', e.target.value)} placeholder="Venue (optional)" style={inp} />
          </div>
        </div>

        {/* Shot limit */}
        <div style={{ marginBottom: 28 }}>
          <Label>Shots per Guest</Label>
          <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 14, padding: '18px' }}>
            <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 44, fontWeight: 700, color: '#ffb800', lineHeight: 1, marginBottom: 14 }}>{form.shot_limit}</div>
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
                <div key={r.id} onClick={() => set('reveal_mode', r.id)} style={{ background: sel ? 'rgba(255,184,0,0.06)' : '#111', border: `1px solid ${sel ? '#ffb800' : '#1e1e1e'}`, borderRadius: 12, padding: '13px 15px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, transition: 'all .15s' }}>
                  <div style={{ width: 32, height: 32, background: sel ? 'rgba(255,184,0,0.1)' : '#1a1a1a', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {(() => { const Icon = REVEAL_ICONS[r.icon] || IconReveal; return <Icon size={16} color={sel ? '#ffb800' : '#555'} /> })()}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: sel ? '#ffb800' : '#ccc' }}>{r.name}</div>
                    <div style={{ fontSize: 11, color: '#8a8a8a', marginTop: 1 }}>{r.desc}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Photo modes */}
        <div style={{ marginBottom: 28 }}>
          <Label>Film Modes</Label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 16 }}>
            {MODE_CONTROLS.map(mc => {
              const sel = form.mode_control === mc.id
              return (
                <div key={mc.id} onClick={() => { set('mode_control', mc.id); if (mc.id === 'lock') { const first = form.selected_modes[0] || 'kodak'; set('selected_modes', [first]); set('locked_mode', first) } }}
                  style={{ background: sel ? 'rgba(255,184,0,0.06)' : '#111', border: `1px solid ${sel ? '#ffb800' : '#1e1e1e'}`, borderRadius: 12, padding: '12px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', border: `1.5px solid ${sel ? '#ffb800' : '#333'}`, background: sel ? '#ffb800' : 'transparent', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: sel ? '#ffb800' : '#ccc' }}>{mc.label}</div>
                    <div style={{ fontSize: 11, color: '#8a8a8a', marginTop: 1 }}>{mc.desc}</div>
                  </div>
                </div>
              )
            })}
          </div>
          {Object.entries(PHOTO_MODES).map(([cat, modes]) => (
            <div key={cat} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#777', marginBottom: 8 }}>{cat}</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                {(modes as any[]).map((m: any) => {
                  const sel = form.selected_modes.includes(m.id)
                  return (
                    <div key={m.id} onClick={() => {
                        if (form.mode_control === 'lock') { set('selected_modes', [m.id]); set('locked_mode', m.id); return }
                        const cur = form.selected_modes
                        if (cur.includes(m.id)) { if (cur.length > 1) set('selected_modes', cur.filter((x: string) => x !== m.id)) }
                        else set('selected_modes', [...cur, m.id])
                      }}
                      style={{ background: '#0e0e0e', border: `1px solid ${sel ? '#ffb800' : '#1a1a1a'}`, borderRadius: 12, overflow: 'hidden', cursor: 'pointer', position: 'relative' }}>
                      <div style={{ height: 64, background: MODE_PREVIEWS[m.id]?.bg || '#111', filter: MODE_PREVIEWS[m.id]?.filter || 'none' }} />
                      <div style={{ padding: '6px 4px 8px', textAlign: 'center', fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: sel ? '#ffb800' : '#999' }}>{m.name}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Cover */}
        <div style={{ marginBottom: 28 }}>
          <Label>Cover</Label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
            {COVER_EMOJIS.map(em => (
              <div key={em} onClick={() => set('cover_emoji', em)}
                style={{ width: 34, height: 34, borderRadius: 9, background: form.cover_emoji === em ? 'rgba(255,184,0,0.2)' : '#141414', border: `1.5px solid ${form.cover_emoji === em ? '#ffb800' : '#222'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, cursor: 'pointer' }}>
                {em}
              </div>
            ))}
          </div>
          {form.cover_image_url && (
            <img src={form.cover_image_url} alt="cover" style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 12, marginBottom: 8, border: '1px solid #222' }} />
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => coverInputRef.current?.click()} style={{ flex: 1, background: '#141414', border: '1px solid #2a2a2a', borderRadius: 10, padding: '11px 0', color: '#ccc', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              {form.cover_image_url ? 'Change cover photo' : 'Upload cover photo'}
            </button>
            {form.cover_image_url && (
              <button onClick={() => { set('cover_image_url', ''); setCoverFile(null) }} style={{ background: 'transparent', border: '1px solid #2a2a2a', borderRadius: 10, padding: '11px 14px', color: '#888', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
                Remove
              </button>
            )}
          </div>
          <input ref={coverInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => {
            const f = e.target.files?.[0]; if (!f) return
            setCoverFile(f); set('cover_image_url', URL.createObjectURL(f)); e.target.value = ''
          }} />
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
          {FEATURES.aiReel && <Toggle k="ai_reel" label="AI Highlight Reel" />}
          {FEATURES.printIntegration && <Toggle k="print_enabled" label="Print Integration" />}
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
      <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: `translateX(-50%) translateY(${toast ? 0 : 12}px)`, background: '#161616', border: '1px solid #222', borderRadius: 24, padding: '11px 20px', fontSize: 13, fontWeight: 600, color: '#ffb800', zIndex: 999, opacity: toast ? 1 : 0, transition: 'all .25s', pointerEvents: 'none', whiteSpace: 'nowrap' }}>
        {toast}
      </div>
    </main>
  )
}


/** ISO timestamp -> value for <input type="datetime-local"> in the viewer's local time. */
function toLocalInput(iso?: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`
}
