'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { REVEAL_MODES } from '@/constants/revealModes'
import { PHOTO_MODES } from '@/constants/photoModes'
import { MODE_PREVIEWS } from '@/lib/modePreviews'
import { LANGUAGES } from '@/constants/languages'
import {
  ArrowLeft, Check,
  Cake, Confetti, Airplane, Briefcase, MusicNote, Trophy, Moon, Question,
  Lightning, PlayCircle, ArrowsClockwise, SunHorizon, Star,
} from '@phosphor-icons/react'
import { IconFlash, IconCheck, IconMorning, IconBack, IconShutter, IconFilm, IconGuests, IconReel, IconStats, IconPrint, IconWedding, IconBirthday, IconParty, IconTrip, IconCorporate, IconFestival, IconSports, IconNightlife, IconQuestion, IconInstant, IconEndEvent, IconRolling, IconMilestone } from '@/components/icons'

const SCAVENGER_PROMPTS = [
  'Someone dancing', 'A toast happening', 'The funniest face', 'Something beautiful',
  'Two people meeting', 'The cake moment', 'The oldest guest', 'The youngest guest',
  'Best dance move', 'A love moment', 'The music setup', 'A night sky shot',
]

const MODE_CONTROLS = [
  { id: 'lock', label: 'Lock to one mode', desc: 'Everyone shoots in the same look' },
  { id: 'menu', label: 'Mode menu', desc: 'Guests choose from your approved selection' },
  { id: 'free', label: 'Free choice', desc: 'Guests pick any mode they want' },
  { id: 'random', label: 'Random assign', desc: 'Each guest gets a surprise mode' },
  { id: 'blind', label: 'Shoot blind', desc: 'Mode revealed only when gallery unlocks' },
]

const EVENT_TYPES = [
  { id: 'wedding', label: 'Wedding', Icon: IconWedding },
  { id: 'birthday', label: 'Birthday', Icon: Cake },
  { id: 'party', label: 'Party', Icon: Confetti },
  { id: 'trip', label: 'Trip', Icon: Airplane },
  { id: 'corporate', label: 'Corporate', Icon: Briefcase },
  { id: 'festival', label: 'Festival', Icon: MusicNote },
  { id: 'sports', label: 'Sports', Icon: Trophy },
  { id: 'club', label: 'Nightlife', Icon: Moon },
  { id: 'other', label: 'Other', Icon: Question },
]

const REVEAL_ICONS: Record<string, any> = {
  instant: Lightning,
  end: PlayCircle,
  rolling: ArrowsClockwise,
  morning: SunHorizon,
  milestone: Star,
}

const TOTAL = 7

const Label = ({ children }: { children: React.ReactNode }) => (
  <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 2.5, textTransform: 'uppercase', color: '#444', marginBottom: 10 }}>{children}</div>
)

const Inp = ({ label, ...props }: any) => (
  <div style={{ marginBottom: 16 }}>
    {label && <Label>{label}</Label>}
    <input {...props} style={{ background: '#141414', border: '1px solid #222', borderRadius: 12, padding: '14px 16px', color: '#f0f0f0', fontSize: 15, width: '100%', outline: 'none', fontFamily: 'inherit', ...props.style }} />
  </div>
)

const Toggle = ({ on, onChange, label, sub }: { on: boolean; onChange: (v: boolean) => void; label: string; sub?: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #161616' }}>
    <div style={{ flex: 1, paddingRight: 20 }}>
      <div style={{ fontSize: 14, fontWeight: 500, color: '#ddd' }}>{label}</div>
      {sub && <div style={{ fontSize: 12, color: '#444', marginTop: 3 }}>{sub}</div>}
    </div>
    <div onClick={() => onChange(!on)} style={{ width: 46, height: 26, borderRadius: 13, background: on ? '#e8ff47' : '#222', position: 'relative', cursor: 'pointer', transition: 'background .2s', flexShrink: 0 }}>
      <div style={{ position: 'absolute', width: 20, height: 20, borderRadius: '50%', background: on ? '#0a0a0a' : '#444', top: 3, left: on ? 23 : 3, transition: 'left .18s' }} />
    </div>
  </div>
)

export default function CreateEvent() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const coverInputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    eventType: 'wedding', eventName: '', date: '', venue: '',
    shotLimit: 12, guestCap: '50', language: 'en',
    revealMode: 'end', modeControl: 'lock', selectedModes: ['kodak'], lockedMode: 'kodak',
    scavengerHunt: false, scavengerPrompts: SCAVENGER_PROMPTS.slice(0, 6),
    guestBook: false, liveSlideshow: false, aiReel: true,
    printEnabled: false, allowCaptions: true, allowVoice: false,
    whiteLabel: false, brandName: '', brandLogoPreview: '', brandLogoFile: null as File | null, statsCard: true,
    coverColor: '#0a0a0a', coverEmoji: '⚡', coverImageUrl: '', coverImageFile: null as File | null, coverOverlay: 'none',
  })

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  const toggleMode = (id: string) => {
    if (form.modeControl === 'lock') {
      // Lock = single select only, tap switches the mode
      set('selectedModes', [id])
      set('lockedMode', id)
      return
    }
    const cur = form.selectedModes
    if (cur.includes(id)) { if (cur.length > 1) set('selectedModes', cur.filter((m: string) => m !== id)) }
    else set('selectedModes', [...cur, id])
  }

  const handleCreate = async () => {
    setSaving(true); setError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      // Upload cover image if selected
      let coverImageUrl: string | null = null
      if (form.coverImageFile) {
        const ext = (form.coverImageFile.name.split('.').pop() || 'jpg')
        const path = `covers/${user.id}/${Date.now()}.${ext}`
        const { error: upErr } = await supabase.storage
          .from('shots').upload(path, form.coverImageFile, { contentType: form.coverImageFile.type, upsert: false })
        if (!upErr) {
          const { data: pub } = supabase.storage.from('shots').getPublicUrl(path)
          coverImageUrl = pub.publicUrl
        }
      }

      const { data: event, error: err } = await supabase.from('events').insert({
        host_id: user.id, name: form.eventName || 'My Event',
        event_type: form.eventType, venue: form.venue || null,
        event_date: form.date || null, shot_limit: form.shotLimit,
        guest_cap: form.guestCap === '\u221e' ? 9999 : parseInt(form.guestCap),
        primary_language: form.language, reveal_mode: form.revealMode as any,
        mode_control: form.modeControl as any, selected_modes: form.selectedModes,
        locked_mode: form.lockedMode, scavenger_hunt: form.scavengerHunt,
        scavenger_prompts: form.scavengerHunt ? form.scavengerPrompts : [],
        guest_book: form.guestBook, live_slideshow: form.liveSlideshow,
        ai_reel: form.aiReel, print_enabled: form.printEnabled,
        allow_captions: form.allowCaptions, allow_voice: form.allowVoice,
        white_label: form.whiteLabel, brand_name: form.whiteLabel ? form.brandName : null,
        brand_logo_url: null, stats_card_enabled: form.statsCard, is_active: true,
        cover_color: form.coverColor, cover_emoji: form.coverEmoji,
        cover_image_url: coverImageUrl,
      }).select().single()
      if (err) throw err
      router.push(`/pricing?eventId=${event.id}`)
    } catch (e: any) {
      setError(e.message || 'Failed to create event')
      setSaving(false)
    }
  }

  const canContinue = () => {
    if (step === 2) return form.eventName.trim().length > 0 && form.date.length > 0
    return true
  }

  const TITLES = ["What's the occasion?", "Name your event", "Set the rules", "Photo modes", "When to reveal?", "Design your cover", "Final settings"]

  return (
    <main style={{ height: '100vh', background: '#0a0a0a', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', background: 'rgba(10,10,10,0.96)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #161616', position: 'sticky', top: 0, zIndex: 20 }}>
        <button onClick={() => step > 1 ? setStep(s => s - 1) : router.push('/host')} style={{ width: 38, height: 38, background: '#161616', border: 'none', borderRadius: 12, color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ArrowLeft size={18} weight="regular" />
        </button>
        <span style={{ fontSize: 15, fontWeight: 600, flex: 1, letterSpacing: -0.3 }}>Create Event</span>
        <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, color: '#333' }}>{step}/{TOTAL}</span>
      </div>
      <div style={{ height: 1, background: '#161616' }}>
        <div style={{ height: 1, background: '#e8ff47', width: `${(step / TOTAL) * 100}%`, transition: 'width .5s cubic-bezier(.4,0,.2,1)' }} />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '28px 20px 20px' }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: '#333', marginBottom: 10 }}>Step {step}</div>
        <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.8, marginBottom: 28, color: '#f0f0f0' }}>{TITLES[step - 1]}</h2>

        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {EVENT_TYPES.slice(0, 2).map(({ id, label, Icon }) => {
                const sel = form.eventType === id
                return (
                  <div key={id} onClick={() => set('eventType', id)} style={{ background: sel ? 'rgba(232,255,71,0.07)' : '#111', border: `1px solid ${sel ? '#e8ff47' : '#1e1e1e'}`, borderRadius: 16, padding: '26px 16px 20px', cursor: 'pointer', textAlign: 'center', transition: 'all .18s' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
                      <Icon size={34} color={sel ? '#e8ff47' : '#3a3a3a'} weight={sel ? 'regular' : 'light'} />
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2.5, textTransform: 'uppercase', color: sel ? '#e8ff47' : '#444' }}>{label}</div>
                  </div>
                )
              })}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
              {EVENT_TYPES.slice(2, 8).map(({ id, label, Icon }) => {
                const sel = form.eventType === id
                return (
                  <div key={id} onClick={() => set('eventType', id)} style={{ background: sel ? 'rgba(232,255,71,0.07)' : '#111', border: `1px solid ${sel ? '#e8ff47' : '#1e1e1e'}`, borderRadius: 14, padding: '20px 8px 15px', cursor: 'pointer', textAlign: 'center', transition: 'all .18s' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 11 }}>
                      <Icon size={28} color={sel ? '#e8ff47' : '#3a3a3a'} weight={sel ? 'regular' : 'light'} />
                    </div>
                    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: sel ? '#e8ff47' : '#444' }}>{label}</div>
                  </div>
                )
              })}
            </div>
            {EVENT_TYPES.slice(8).map(({ id, label, Icon }) => {
              const sel = form.eventType === id
              return (
                <div key={id} onClick={() => set('eventType', id)} style={{ background: sel ? 'rgba(232,255,71,0.07)' : '#111', border: `1px solid ${sel ? '#e8ff47' : '#1e1e1e'}`, borderRadius: 14, padding: '16px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, transition: 'all .18s' }}>
                  <Icon size={22} color={sel ? '#e8ff47' : '#3a3a3a'} weight={sel ? 'regular' : 'light'} />
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2.5, textTransform: 'uppercase', color: sel ? '#e8ff47' : '#444' }}>{label}</div>
                </div>
              )
            })}
          </div>
        )}

        {step === 2 && (
          <div>
            <Inp label="Event Name *" placeholder="e.g. Sarah & Marco's Wedding" value={form.eventName} onChange={(e: any) => set('eventName', e.target.value)} />
            {step === 2 && !form.eventName.trim() && <div style={{ fontSize: 11, color: '#ff4757', marginTop: -8, marginBottom: 8 }}>Required</div>}
            <Inp label="Event Date *" type="date" value={form.date} onChange={(e: any) => set('date', e.target.value)} />
            {step === 2 && !form.date && <div style={{ fontSize: 11, color: '#ff4757', marginTop: -8, marginBottom: 8 }}>Required</div>}
            <Inp label="Venue (optional)" placeholder="e.g. Grand Ballroom, Toronto" value={form.venue} onChange={(e: any) => set('venue', e.target.value)} />
          </div>
        )}

        {step === 3 && (
          <div>
            <div style={{ background: '#111', borderRadius: 16, padding: '20px 18px', marginBottom: 20, border: '1px solid #1e1e1e' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 18 }}>
                <div>
                  <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 52, fontWeight: 700, color: '#e8ff47', lineHeight: 1 }}>{form.shotLimit}</div>
                  <div style={{ fontSize: 12, color: '#444', marginTop: 5 }}>shots per guest</div>
                </div>
                <div style={{ fontSize: 11, color: '#333' }}>{form.shotLimit <= 6 ? 'Ultra rare' : form.shotLimit <= 12 ? 'Classic film' : form.shotLimit <= 20 ? 'Generous' : 'Party mode'}</div>
              </div>
              <input type="range" min={3} max={36} value={form.shotLimit} onChange={e => set('shotLimit', +e.target.value)} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 10, color: '#333', fontFamily: 'Space Mono, monospace' }}><span>3</span><span>36</span></div>
            </div>
            <Label>Guest Cap</Label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 24 }}>
              {['10', '25', '50', '100', '200', '∞'].map(n => (
                <div key={n} onClick={() => set('guestCap', n)} style={{ background: form.guestCap === n ? 'rgba(232,255,71,0.08)' : '#111', border: `1px solid ${form.guestCap === n ? '#e8ff47' : '#1e1e1e'}`, borderRadius: 10, padding: '8px 16px', fontSize: 13, fontFamily: 'Space Mono, monospace', color: form.guestCap === n ? '#e8ff47' : '#444', cursor: 'pointer' }}>{n}</div>
              ))}
            </div>
            <Toggle on={form.allowCaptions} onChange={v => set('allowCaptions', v)} label="Photo Captions" sub="Guests add text — auto-translated for all" />
            <Toggle on={form.guestBook} onChange={v => set('guestBook', v)} label="Guest Book" sub="15-sec video messages from front camera" />
            <Toggle on={form.liveSlideshow} onChange={v => set('liveSlideshow', v)} label="Live Slideshow" sub="Cast gallery to a TV or projector in real-time" />
            <Toggle on={form.scavengerHunt} onChange={v => set('scavengerHunt', v)} label="Scavenger Hunt" sub="Give guests photo prompts to complete" />
            {form.scavengerHunt && (
              <div style={{ marginTop: 16 }}>
                <Label>Prompts — {form.scavengerPrompts.length} selected</Label>
                {SCAVENGER_PROMPTS.map(p => {
                  const on = form.scavengerPrompts.includes(p)
                  return (
                    <div key={p} onClick={() => {
                      const cur = form.scavengerPrompts
                      set('scavengerPrompts', cur.includes(p) ? cur.filter((x: string) => x !== p) : [...cur, p])
                    }} style={{ background: on ? 'rgba(232,255,71,0.06)' : '#111', border: `1px solid ${on ? '#e8ff47' : '#1e1e1e'}`, borderRadius: 10, padding: '11px 14px', marginBottom: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 18, height: 18, borderRadius: '50%', border: `1.5px solid ${on ? '#e8ff47' : '#333'}`, background: on ? '#e8ff47' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {on && <Check size={10} color="#000" weight="bold" />}
                      </div>
                      <span style={{ fontSize: 13, color: on ? '#ddd' : '#555' }}>{p}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {step === 4 && (
          <div>
            <Label>Guest Mode Control</Label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 28 }}>
              {MODE_CONTROLS.map(mc => {
                const sel = form.modeControl === mc.id
                return (
                  <div key={mc.id} onClick={() => { set('modeControl', mc.id); if (mc.id === 'lock') { const first = form.selectedModes[0] || 'kodak'; set('selectedModes', [first]); set('lockedMode', first) } }} style={{ background: sel ? 'rgba(232,255,71,0.06)' : '#111', border: `1px solid ${sel ? '#e8ff47' : '#1e1e1e'}`, borderRadius: 12, padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', border: `1.5px solid ${sel ? '#e8ff47' : '#333'}`, background: sel ? '#e8ff47' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {sel && <Check size={10} color="#000" weight="bold" />}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: sel ? '#e8ff47' : '#ccc' }}>{mc.label}</div>
                      <div style={{ fontSize: 12, color: '#444', marginTop: 2 }}>{mc.desc}</div>
                    </div>
                  </div>
                )
              })}
            </div>
            {Object.entries(PHOTO_MODES).map(([cat, modes]) => (
              <div key={cat} style={{ marginBottom: 24 }}>
                <Label>{cat}</Label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                  {(modes as any[]).map((m: any) => {
                    const sel = form.selectedModes.includes(m.id)
                    return (
                      <div key={m.id} onClick={() => toggleMode(m.id)} style={{ background: '#0e0e0e', border: `1px solid ${sel ? '#e8ff47' : '#1a1a1a'}`, borderRadius: 14, overflow: 'hidden', cursor: 'pointer', position: 'relative', transition: 'border .15s' }}>
                        {sel && <div style={{ position: 'absolute', top: 7, right: 7, width: 17, height: 17, background: '#e8ff47', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}><Check size={9} color="#000" weight="bold" /></div>}
                        {/* CSS gradient preview — no external images, always loads */}
                        <div style={{ height: 90, position: 'relative', overflow: 'hidden' }}>
                          {/* Base gradient */}
                          <div style={{
                            position: 'absolute', inset: 0,
                            background: MODE_PREVIEWS[m.id]?.bg || '#111',
                            filter: MODE_PREVIEWS[m.id]?.filter || 'none',
                          }} />
                          {/* Overlay (neon glow, grain, light leak effects) */}
                          {MODE_PREVIEWS[m.id]?.overlay && (
                            <div style={{ position: 'absolute', inset: 0, background: MODE_PREVIEWS[m.id].overlay }} />
                          )}
                          {/* Vignette */}
                          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)', pointerEvents: 'none' }} />
                          {/* Selected border */}
                          {sel && <div style={{ position: 'absolute', inset: 0, border: '2px solid #e8ff47', borderRadius: 14, pointerEvents: 'none' }} />}
                        </div>
                        <div style={{ padding: '7px 6px 9px', textAlign: 'center' }}>
                          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: sel ? '#e8ff47' : '#555' }}>{m.name}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {step === 5 && (
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 28 }}>
              {(REVEAL_MODES as unknown as any[]).map((r: any) => {
                const sel = form.revealMode === r.id
                const Icon = REVEAL_ICONS[r.id]
                return (
                  <div key={r.id} onClick={() => set('revealMode', r.id)} style={{ background: sel ? 'rgba(232,255,71,0.06)' : '#111', border: `1px solid ${sel ? '#e8ff47' : '#1e1e1e'}`, borderRadius: 14, padding: '16px', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: sel ? 'rgba(232,255,71,0.12)' : '#161616', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {Icon && <Icon size={18} color={sel ? '#e8ff47' : '#555'} />}
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 600, color: sel ? '#e8ff47' : '#ccc', marginBottom: 4 }}>{r.name}</div>
                      <div style={{ fontSize: 12, color: '#444', lineHeight: 1.5 }}>{r.desc}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {step === 6 && (
          <div>
            {/* ── COVER CARD ── full width, 9:16 */}
            <div style={{ borderRadius: 20, overflow: 'hidden', width: '100%', aspectRatio: '9/16', background: form.coverColor, position: 'relative', marginBottom: 14 }}>

              {/* Background photo */}
              {form.coverImageUrl && (
                <img src={form.coverImageUrl} alt="cover" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              )}

              {/* Color overlay */}
              {form.coverOverlay && form.coverOverlay !== 'none' && (
                <div style={{ position: 'absolute', inset: 0, background: form.coverOverlay, mixBlendMode: 'multiply' }} />
              )}

              {/* Gradient — stronger at top and bottom */}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.1) 60%, rgba(0,0,0,0.72) 100%)' }} />

              {/* ── TOP: Event name + Upload button ── */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '18px 16px 0' }}>
                {/* Event name */}
                <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.45)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Event</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'white', lineHeight: 1.2, marginBottom: 14 }}>
                  {form.eventName || <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 400, fontSize: 15 }}>Your event name</span>}
                </div>
                {/* Upload button */}
                <button onClick={() => coverInputRef.current?.click()}
                  style={{ width: '100%', background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(14px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12, padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', color: 'white', fontSize: 13, fontWeight: 700, fontFamily: 'inherit' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                    <rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5" fill="white" stroke="none"/><polyline points="21,15 16,10 5,21"/>
                  </svg>
                  {form.coverImageUrl ? 'Change Cover Photo' : 'Upload Your Photo'}
                </button>
                {/* Remove */}
                {form.coverImageUrl && (
                  <button onClick={() => { set('coverImageUrl', ''); set('coverImageFile', null) }}
                    style={{ width: '100%', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.35)', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit', marginTop: 6, paddingBottom: 0 }}>
                    Remove photo
                  </button>
                )}
              </div>

              {/* ── BOTTOM: Overlays + Emojis ── */}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 16px 18px' }}>
                {/* Overlay colors */}
                <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.45)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Overlay</div>
                <div style={{ display: 'flex', gap: 7, marginBottom: 14 }}>
                  {[
                    { v: 'none',                    bg: 'transparent',  border: '1.5px solid rgba(255,255,255,0.4)' },
                    { v: 'rgba(0,0,0,0.5)',         bg: '#000' },
                    { v: 'rgba(180,80,0,0.5)',      bg: '#b45000' },
                    { v: 'rgba(0,40,160,0.5)',      bg: '#0028a0' },
                    { v: 'rgba(160,0,80,0.5)',      bg: '#a00050' },
                    { v: 'rgba(0,80,40,0.5)',       bg: '#005028' },
                    { v: 'rgba(160,120,0,0.5)',     bg: '#a07800' },
                  ].map(ov => (
                    <div key={ov.v} onClick={() => set('coverOverlay', ov.v)}
                      style={{ width: 30, height: 30, borderRadius: 9, background: ov.bg || 'transparent', border: form.coverOverlay === ov.v ? '2.5px solid #e8ff47' : (ov.border || '2px solid transparent'), cursor: 'pointer', flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.5)', transition: 'border .15s' }} />
                  ))}
                </div>
                {/* Emoji icons */}
                <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.45)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Icon</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {['⚡','💍','🎂','🎉','✈️','🏆','🎵','📷','🌅','🎬','🌿','🔥','🎊','🥂','🎈','❤️'].map(em => (
                    <div key={em} onClick={() => set('coverEmoji', em)}
                      style={{ width: 34, height: 34, borderRadius: 9, background: form.coverEmoji === em ? 'rgba(232,255,71,0.25)' : 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)', border: `1.5px solid ${form.coverEmoji === em ? '#e8ff47' : 'rgba(255,255,255,0.15)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, cursor: 'pointer', transition: 'all .15s' }}>
                      {em}
                    </div>
                  ))}
                </div>
              </div>

            </div>

            <input ref={coverInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => {
              const file = e.target.files?.[0]; if (!file) return
              set('coverImageUrl', URL.createObjectURL(file))
              set('coverImageFile', file)
              e.target.value = ''
            }} />
          </div>
        )}

        {step === 7 && (
          <div>
            <Toggle on={form.aiReel} onChange={v => set('aiReel', v)} label="AI Highlight Reel" sub="Auto-generate a cinematic 30-sec video of the best shots" />
            <Toggle on={form.printEnabled} onChange={v => set('printEnabled', v)} label="Print Integration" sub="Guests can order physical prints from the gallery" />
            <Toggle on={form.statsCard} onChange={v => set('statsCard', v)} label="Event Stats Card" sub="Shareable recap card shown after the reveal" />
            {error && <div style={{ color: '#ff4757', fontSize: 13, marginTop: 16, textAlign: 'center' }}>{error}</div>}
          </div>
        )}

      </div>

      <div style={{ padding: '14px 20px 34px', borderTop: '1px solid #161616', background: 'rgba(10,10,10,0.98)' }}>
        <button
          onClick={step < TOTAL ? () => { if (canContinue()) setStep(s => s + 1) } : handleCreate}
          disabled={saving || !canContinue()}
          style={{ width: '100%', background: saving || !canContinue() ? '#161616' : '#e8ff47', color: saving || !canContinue() ? '#333' : '#0a0a0a', border: 'none', borderRadius: 14, padding: '16px 20px', fontSize: 15, fontWeight: 700, cursor: saving || !canContinue() ? 'not-allowed' : 'pointer', fontFamily: 'inherit', letterSpacing: -0.3, transition: 'all .2s' }}>
          {saving ? 'Creating...' : step < TOTAL ? 'Continue →' : 'Continue to Payment →'}
        </button>
        {step === 2 && (!form.eventName.trim() || !form.date) && (
          <div style={{ textAlign: 'center', fontSize: 12, color: '#444', marginTop: 10 }}>
            {!form.eventName.trim() && !form.date ? 'Event name and date required' : !form.eventName.trim() ? 'Event name required' : 'Event date required'}
          </div>
        )}
      </div>
    </main>
  )
}
