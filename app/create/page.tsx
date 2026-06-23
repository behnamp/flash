'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { REVEAL_MODES } from '@/constants/revealModes'
import { PHOTO_MODES, ALL_MODES } from '@/constants/photoModes'
import { LANGUAGES } from '@/constants/languages'
import {
  IconBack, IconCheck, IconFilm, IconGuests, IconCalendar, IconLocation,
  IconWedding, IconBirthday, IconParty, IconTrip, IconCorporate,
  IconFestival, IconSports, IconNightlife, IconOther,
  IconShutter, IconVideo, IconMic, IconTarget,
  IconInstant, IconEndEvent, IconRolling, IconMorning, IconMilestone,
  IconReel, IconPrint, IconStats
} from '@/components/icons'

const SCAVENGER_PROMPTS = [
  'Someone dancing','A toast happening','The funniest face','Something beautiful',
  'Two people meeting','The cake moment','The oldest guest','The youngest guest',
  'Best dance move','A love moment','The music setup','A night sky shot',
]

const MODE_CONTROLS = [
  { id:'lock', label:'Lock to one mode', desc:'Everyone shoots in the same look' },
  { id:'menu', label:'Mode menu', desc:'Guests choose from your approved selection' },
  { id:'free', label:'Free choice', desc:'Guests pick any mode they want' },
  { id:'random', label:'Random assign', desc:'Each guest gets a surprise mode' },
  { id:'blind', label:'Shoot blind', desc:'Mode only revealed when gallery unlocks' },
]

const EVENT_TYPES = [
  { id:'wedding', label:'Wedding', Icon: IconWedding },
  { id:'birthday', label:'Birthday', Icon: IconBirthday },
  { id:'party', label:'Party', Icon: IconParty },
  { id:'trip', label:'Trip', Icon: IconTrip },
  { id:'corporate', label:'Corporate', Icon: IconCorporate },
  { id:'festival', label:'Festival', Icon: IconFestival },
  { id:'sports', label:'Sports', Icon: IconSports },
  { id:'club', label:'Nightlife', Icon: IconNightlife },
  { id:'other', label:'Other', Icon: IconOther },
]

const REVEAL_ICONS: Record<string, any> = {
  instant: IconInstant, end: IconEndEvent,
  rolling: IconRolling, morning: IconMorning, milestone: IconMilestone,
}

const TOTAL = 6

// Reusable components
const Label = ({ children }: { children: React.ReactNode }) => (
  <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 2.5, textTransform: 'uppercase', color: '#555', marginBottom: 10 }}>{children}</div>
)

const Input = ({ label, ...props }: any) => (
  <div style={{ marginBottom: 16 }}>
    {label && <Label>{label}</Label>}
    <input {...props} style={{ background: '#141414', border: '1px solid #222', borderRadius: 12, padding: '14px 16px', color: '#f0f0f0', fontSize: 15, width: '100%', outline: 'none', fontFamily: 'inherit', transition: 'border .15s', ...props.style }} />
  </div>
)

const Toggle = ({ on, onChange, label, sub }: { on: boolean; onChange: (v: boolean) => void; label: string; sub?: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #1a1a1a' }}>
    <div style={{ flex: 1, paddingRight: 20 }}>
      <div style={{ fontSize: 14, fontWeight: 500, color: '#e0e0e0' }}>{label}</div>
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
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    eventType: 'wedding', eventName: '', date: '', venue: '',
    shotLimit: 12, guestCap: '50',
    language: 'en', revealMode: 'end', modeControl: 'lock',
    selectedModes: ['kodak'], lockedMode: 'kodak',
    scavengerHunt: false, scavengerPrompts: SCAVENGER_PROMPTS.slice(0, 6),
    guestBook: false, liveSlideshow: false, aiReel: true,
    printEnabled: false, allowCaptions: true, allowVoice: false,
    whiteLabel: false, brandName: '', statsCard: true,
  })

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  const toggleMode = (id: string) => {
    const cur = form.selectedModes
    if (cur.includes(id)) { if (cur.length > 1) set('selectedModes', cur.filter(m => m !== id)) }
    else set('selectedModes', [...cur, id])
  }

  const togglePrompt = (p: string) => {
    const cur = form.scavengerPrompts
    if (cur.includes(p)) set('scavengerPrompts', cur.filter(x => x !== p))
    else set('scavengerPrompts', [...cur, p])
  }

  const handleCreate = async () => {
    setSaving(true); setError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data: event, error: err } = await supabase.from('events').insert({
        host_id: user.id, name: form.eventName || 'My Event',
        event_type: form.eventType, venue: form.venue || null,
        event_date: form.date || null, shot_limit: form.shotLimit,
        guest_cap: form.guestCap === '∞' ? 9999 : parseInt(form.guestCap),
        primary_language: form.language, reveal_mode: form.revealMode as any,
        mode_control: form.modeControl as any, selected_modes: form.selectedModes,
        locked_mode: form.lockedMode, scavenger_hunt: form.scavengerHunt,
        scavenger_prompts: form.scavengerHunt ? form.scavengerPrompts : [],
        guest_book: form.guestBook, live_slideshow: form.liveSlideshow,
        ai_reel: form.aiReel, print_enabled: form.printEnabled,
        allow_captions: form.allowCaptions, allow_voice: form.allowVoice,
        white_label: form.whiteLabel, brand_name: form.whiteLabel ? form.brandName : null,
        stats_card_enabled: form.statsCard, is_active: true,
      }).select().single()
      if (err) throw err
      router.push(`/host/${event.id}`)
    } catch (e: any) {
      setError(e.message || 'Failed to create event')
      setSaving(false)
    }
  }

  const TITLES = ["What's the occasion?", "Name your event", "Set the rules", "Photo modes", "Language & branding", "Reveal mode"]

  return (
    <main style={{ height: '100vh', background: '#0a0a0a', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', background: 'rgba(10,10,10,0.96)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #161616', position: 'sticky', top: 0, zIndex: 20 }}>
        <button onClick={() => step > 1 ? setStep(s => s - 1) : router.push('/host')} style={{ width: 38, height: 38, background: '#161616', border: 'none', borderRadius: 12, color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <IconBack size={18} />
        </button>
        <span style={{ fontSize: 15, fontWeight: 600, flex: 1, letterSpacing: -0.3 }}>Create Event</span>
        <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, color: '#333' }}>{step}/{TOTAL}</span>
      </div>

      {/* Progress */}
      <div style={{ height: 1, background: '#161616' }}>
        <div style={{ height: 1, background: '#e8ff47', width: `${(step / TOTAL) * 100}%`, transition: 'width .5s cubic-bezier(.4,0,.2,1)' }} />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '28px 20px 20px' }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: '#333', marginBottom: 10 }}>Step {step}</div>
        <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.8, marginBottom: 28, color: '#f0f0f0' }}>{TITLES[step - 1]}</h2>

        {/* STEP 1 — Event Type */}
        {step === 1 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
            {EVENT_TYPES.map(({ id, label, Icon }) => {
              const sel = form.eventType === id
              return (
                <div key={id} onClick={() => set('eventType', id)} style={{
                  background: sel ? 'rgba(232,255,71,0.06)' : '#111',
                  border: `1px solid ${sel ? '#e8ff47' : '#1e1e1e'}`,
                  borderRadius: 14, padding: '20px 8px 16px', cursor: 'pointer',
                  textAlign: 'center', transition: 'all .15s',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
                    <Icon size={22} color={sel ? '#e8ff47' : '#555'} />
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: sel ? '#e8ff47' : '#444' }}>{label}</div>
                </div>
              )
            })}
          </div>
        )}

        {/* STEP 2 — Name */}
        {step === 2 && (
          <div>
            <Input label="Event Name" placeholder={`e.g. ${EVENT_TYPES.find(e => e.id === form.eventType)?.label} Event`} value={form.eventName} onChange={(e: any) => set('eventName', e.target.value)} />
            <Input label="Date" type="date" value={form.date} onChange={(e: any) => set('date', e.target.value)} />
            <Input label="Venue (optional)" placeholder="e.g. Grand Ballroom, Toronto" value={form.venue} onChange={(e: any) => set('venue', e.target.value)} />
          </div>
        )}

        {/* STEP 3 — Rules */}
        {step === 3 && (
          <div>
            {/* Shot limit */}
            <div style={{ background: '#111', borderRadius: 16, padding: '20px 18px', marginBottom: 20, border: '1px solid #1e1e1e' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 18 }}>
                <div>
                  <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 52, fontWeight: 700, color: '#e8ff47', lineHeight: 1 }}>{form.shotLimit}</div>
                  <div style={{ fontSize: 12, color: '#444', marginTop: 5, letterSpacing: 0.5 }}>shots per guest</div>
                </div>
                <div style={{ fontSize: 11, color: '#333', textAlign: 'right' }}>
                  {form.shotLimit <= 6 ? 'Ultra rare' : form.shotLimit <= 12 ? 'Classic film' : form.shotLimit <= 20 ? 'Generous' : 'Party mode'}
                </div>
              </div>
              <input type="range" min={3} max={36} value={form.shotLimit} onChange={e => set('shotLimit', +e.target.value)} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 10, color: '#333', fontFamily: 'Space Mono, monospace' }}>
                <span>3</span><span>36</span>
              </div>
            </div>

            <Label>Guest Cap</Label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 24 }}>
              {['10', '25', '50', '100', '200', '∞'].map(n => (
                <div key={n} onClick={() => set('guestCap', n)} style={{
                  background: form.guestCap === n ? 'rgba(232,255,71,0.08)' : '#111',
                  border: `1px solid ${form.guestCap === n ? '#e8ff47' : '#1e1e1e'}`,
                  borderRadius: 10, padding: '8px 16px', fontSize: 13, fontFamily: 'Space Mono, monospace',
                  color: form.guestCap === n ? '#e8ff47' : '#444', cursor: 'pointer', transition: 'all .15s',
                }}>{n === '∞' ? '∞' : n}</div>
              ))}
            </div>

            <Toggle on={form.allowCaptions} onChange={v => set('allowCaptions', v)} label="Photo Captions" sub="Guests add text — auto-translated for all" />
            <Toggle on={form.guestBook} onChange={v => set('guestBook', v)} label="Guest Book" sub="15-sec video messages from the front camera" />
            <Toggle on={form.liveSlideshow} onChange={v => set('liveSlideshow', v)} label="Live Slideshow" sub="Cast gallery to a TV or projector in real-time" />
            <Toggle on={form.scavengerHunt} onChange={v => set('scavengerHunt', v)} label="Scavenger Hunt" sub="Give guests photo prompts to complete" />

            {form.scavengerHunt && (
              <div style={{ marginTop: 16 }}>
                <Label>Prompts — {form.scavengerPrompts.length} selected</Label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {SCAVENGER_PROMPTS.map(p => {
                    const on = form.scavengerPrompts.includes(p)
                    return (
                      <div key={p} onClick={() => togglePrompt(p)} style={{ background: on ? 'rgba(232,255,71,0.06)' : '#111', border: `1px solid ${on ? '#e8ff47' : '#1e1e1e'}`, borderRadius: 10, padding: '11px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, transition: 'all .15s' }}>
                        <div style={{ width: 18, height: 18, borderRadius: '50%', border: `1.5px solid ${on ? '#e8ff47' : '#333'}`, background: on ? '#e8ff47' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {on && <IconCheck size={10} color="#000" />}
                        </div>
                        <span style={{ fontSize: 13, color: on ? '#e0e0e0' : '#555' }}>{p}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 4 — Photo Modes */}
        {step === 4 && (
          <div>
            <Label>Guest Mode Control</Label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 28 }}>
              {MODE_CONTROLS.map(mc => {
                const sel = form.modeControl === mc.id
                return (
                  <div key={mc.id} onClick={() => set('modeControl', mc.id)} style={{ background: sel ? 'rgba(232,255,71,0.06)' : '#111', border: `1px solid ${sel ? '#e8ff47' : '#1e1e1e'}`, borderRadius: 12, padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, transition: 'all .15s' }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', border: `1.5px solid ${sel ? '#e8ff47' : '#333'}`, background: sel ? '#e8ff47' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {sel && <IconCheck size={10} color="#000" />}
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
              <div key={cat} style={{ marginBottom: 20 }}>
                <Label>{cat}</Label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 7 }}>
                  {modes.map(m => {
                    const sel = form.selectedModes.includes(m.id)
                    return (
                      <div key={m.id} onClick={() => toggleMode(m.id)} style={{ background: '#111', border: `1px solid ${sel ? '#e8ff47' : '#1e1e1e'}`, borderRadius: 12, overflow: 'hidden', cursor: 'pointer', position: 'relative', transition: 'border .15s' }}>
                        {sel && <div style={{ position: 'absolute', top: 6, right: 6, width: 16, height: 16, background: '#e8ff47', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}><IconCheck size={8} color="#000" /></div>}
                        <div style={{ height: 52, background: m.bg }} />
                        <div style={{ padding: '7px 6px', textAlign: 'center', fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: sel ? '#e8ff47' : '#444' }}>{m.name}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* STEP 5 — Language */}
        {step === 5 && (
          <div>
            <Label>Primary Language</Label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7, maxHeight: 280, overflowY: 'auto', marginBottom: 24 }}>
              {LANGUAGES.map(l => {
                const sel = form.language === l.code
                return (
                  <div key={l.code} onClick={() => set('language', l.code)} style={{ background: sel ? 'rgba(232,255,71,0.06)' : '#111', border: `1px solid ${sel ? '#e8ff47' : '#1e1e1e'}`, borderRadius: 11, padding: '12px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, transition: 'all .15s', direction: l.dir as any }}>
                    <span style={{ fontSize: 18, flexShrink: 0 }}>{l.flag}</span>
                    <span style={{ fontSize: 13, fontWeight: 500, color: sel ? '#e8ff47' : '#888' }}>{l.name}</span>
                  </div>
                )
              })}
            </div>

            <Toggle on={form.whiteLabel} onChange={v => set('whiteLabel', v)} label="White-label Branding" sub="Add your venue or brand name to the guest experience" />
            {form.whiteLabel && (
              <div style={{ marginTop: 14 }}>
                <Input label="Brand / Venue Name" placeholder="e.g. 777 Game Club" value={form.brandName} onChange={(e: any) => set('brandName', e.target.value)} />
              </div>
            )}
          </div>
        )}

        {/* STEP 6 — Reveal */}
        {step === 6 && (
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 28 }}>
              {REVEAL_MODES.map((r: any) => {
                const sel = form.revealMode === r.id
                const Icon = REVEAL_ICONS[r.id]
                return (
                  <div key={r.id} onClick={() => set('revealMode', r.id)} style={{ background: sel ? 'rgba(232,255,71,0.06)' : '#111', border: `1px solid ${sel ? '#e8ff47' : '#1e1e1e'}`, borderRadius: 14, padding: '16px', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: 14, transition: 'all .15s' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: sel ? 'rgba(232,255,71,0.12)' : '#161616', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
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

            <div style={{ height: 1, background: '#161616', marginBottom: 20 }} />
            <Label>Post-Event</Label>
            <Toggle on={form.aiReel} onChange={v => set('aiReel', v)} label="AI Highlight Reel" sub="Auto-generate a 30-sec video of the best shots" />
            <Toggle on={form.printEnabled} onChange={v => set('printEnabled', v)} label="Print Integration" sub="Guests can order physical prints from the gallery" />
            <Toggle on={form.statsCard} onChange={v => set('statsCard', v)} label="Event Stats Card" sub="Shareable recap card after reveal" />

            {error && <div style={{ color: '#ff4757', fontSize: 13, marginTop: 16, textAlign: 'center' }}>{error}</div>}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: '14px 20px 34px', borderTop: '1px solid #161616', background: 'rgba(10,10,10,0.98)' }}>
        <button onClick={step < TOTAL ? () => setStep(s => s + 1) : handleCreate} disabled={saving}
          style={{ width: '100%', background: saving ? '#1a1a1a' : '#e8ff47', color: saving ? '#333' : '#0a0a0a', border: 'none', borderRadius: 14, padding: '16px 20px', fontSize: 15, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', transition: 'all .15s', letterSpacing: -0.3, fontFamily: 'inherit' }}>
          {saving ? 'Creating...' : step < TOTAL ? 'Continue' : 'Create Event'}
        </button>
      </div>
    </main>
  )
}
