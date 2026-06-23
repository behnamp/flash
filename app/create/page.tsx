'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { EVENT_TYPES } from '@/constants/eventTypes'
import { REVEAL_MODES } from '@/constants/revealModes'
import { PHOTO_MODES, ALL_MODES } from '@/constants/photoModes'
import { LANGUAGES } from '@/constants/languages'

const SCAVENGER_PROMPTS = [
  '💃 Someone dancing','🥂 A toast happening','😂 The funniest face',
  '🌹 Something beautiful','🤝 Two people meeting','🎂 The cake moment',
  '👴 The oldest guest','👶 The youngest guest','🕺 Best dance move',
  '❤️ A love moment','🎵 The music setup','🌙 A night sky shot',
]

const MODE_CONTROLS = [
  { id:'lock', icon:'🔒', name:'Lock to one mode', desc:'Everyone shoots in the same look' },
  { id:'menu', icon:'📋', name:'Mode menu', desc:'Guests pick from modes you approve' },
  { id:'free', icon:'🎨', name:'Free choice', desc:'Guests pick any mode they want' },
  { id:'random', icon:'🎲', name:'Random assign', desc:'Each guest gets a surprise mode' },
  { id:'blind', icon:'🎭', name:'Shoot blind', desc:'Mode revealed only when gallery unlocks' },
]

const TOTAL = 6

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
    whiteLabel: false, brandName: '',
    aiReel2: true, statsCard: true,
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
        host_id: user.id,
        name: form.eventName || 'My Event',
        event_type: form.eventType,
        venue: form.venue || null,
        event_date: form.date || null,
        shot_limit: form.shotLimit,
        guest_cap: form.guestCap === '∞' ? 9999 : parseInt(form.guestCap),
        primary_language: form.language,
        reveal_mode: form.revealMode as any,
        mode_control: form.modeControl as any,
        selected_modes: form.selectedModes,
        locked_mode: form.lockedMode,
        scavenger_hunt: form.scavengerHunt,
        scavenger_prompts: form.scavengerHunt ? form.scavengerPrompts : [],
        guest_book: form.guestBook,
        live_slideshow: form.liveSlideshow,
        ai_reel: form.aiReel,
        print_enabled: form.printEnabled,
        allow_captions: form.allowCaptions,
        allow_voice: form.allowVoice,
        white_label: form.whiteLabel,
        brand_name: form.whiteLabel ? form.brandName : null,
        stats_card_enabled: form.statsCard,
        is_active: true,
      }).select().single()

      if (err) throw err
      router.push(`/host/${event.id}`)
    } catch (e: any) {
      setError(e.message || 'Failed to create event')
      setSaving(false)
    }
  }

  const inp = (style = {}) => ({
    background: 'var(--surface2)', border: '1.5px solid var(--border)',
    borderRadius: 10, padding: '13px 14px', color: 'var(--text)',
    fontSize: 14, width: '100%', outline: 'none', ...style
  } as any)

  const TITLES = ['What\'s the occasion?','Name your event','Set the rules','Photo modes','Language & branding','Reveal mode']
  const DESCS = [
    'Choose a type to unlock smart defaults.',
    'Appears on the guest join screen and gallery.',
    'Shots per guest, limits, and features.',
    'Visual styles guests can shoot in.',
    'Language, translation, and branding.',
    'When and how photos unlock.',
  ]

  return (
    <main style={{ height: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', background: 'rgba(10,10,10,0.96)', backdropFilter: 'blur(14px)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 20 }}>
        <button onClick={() => step > 1 ? setStep(s => s - 1) : router.push('/host')} style={{ width: 36, height: 36, background: 'var(--surface2)', border: 'none', borderRadius: 10, color: 'var(--text)', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>←</button>
        <span style={{ fontSize: 15, fontWeight: 600, flex: 1 }}>Create Event</span>
        <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, color: 'var(--muted)' }}>{step}/{TOTAL}</span>
      </div>

      {/* Progress */}
      <div style={{ height: 2, background: 'var(--border)' }}>
        <div style={{ height: 2, background: 'var(--accent)', width: `${(step / TOTAL) * 100}%`, transition: 'width .4s' }} />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '22px 18px 16px' }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2.5, textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 6 }}>Step {step}</div>
        <h2 style={{ fontSize: 23, fontWeight: 700, letterSpacing: -0.6, marginBottom: 5 }}>{TITLES[step - 1]}</h2>
        <p style={{ fontSize: 13, color: 'var(--dim)', marginBottom: 22, lineHeight: 1.5 }}>{DESCS[step - 1]}</p>

        {/* STEP 1 — Event type */}
        {step === 1 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 9 }}>
            {EVENT_TYPES.map(et => (
              <div key={et.id} onClick={() => set('eventType', et.id)} style={{ background: form.eventType === et.id ? 'var(--accent-dim)' : 'var(--surface2)', border: `1.5px solid ${form.eventType === et.id ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 12, padding: '13px 6px', cursor: 'pointer', textAlign: 'center', transition: 'all .15s' }}>
                <div style={{ fontSize: 22, marginBottom: 5 }}>{et.icon}</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: form.eventType === et.id ? 'var(--accent)' : 'var(--dim)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{et.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* STEP 2 — Name */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[{ label: 'Event Name', ph: `e.g. ${EVENT_TYPES.find(e => e.id === form.eventType)?.icon} Sarah & Marco's Wedding`, k: 'eventName' },
              { label: 'Date', type: 'date', k: 'date' },
              { label: 'Venue / Location (optional)', ph: 'e.g. Grand Ballroom, Toronto', k: 'venue' }].map(f => (
              <div key={f.k}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--dim)', marginBottom: 7 }}>{f.label}</div>
                <input type={f.type || 'text'} placeholder={f.ph} value={(form as any)[f.k] || ''}
                  onChange={e => set(f.k, e.target.value)} style={inp()} />
              </div>
            ))}
          </div>
        )}

        {/* STEP 3 — Rules */}
        {step === 3 && (
          <div>
            <div style={{ background: 'var(--surface2)', borderRadius: 12, padding: 18, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 14 }}>
                <div>
                  <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 46, fontWeight: 700, color: 'var(--accent)', lineHeight: 1 }}>{form.shotLimit}</div>
                  <div style={{ fontSize: 12, color: 'var(--dim)', marginTop: 3 }}>shots per guest</div>
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'right' }}>
                  {form.shotLimit <= 6 ? 'Very rare' : form.shotLimit <= 12 ? 'Classic film' : form.shotLimit <= 20 ? 'Generous' : 'Party mode'}
                </div>
              </div>
              <input type="range" min={3} max={36} value={form.shotLimit} onChange={e => set('shotLimit', +e.target.value)} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 10, color: 'var(--muted)' }}>
                <span>3 min</span><span>36 max</span>
              </div>
            </div>

            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--dim)', marginBottom: 10 }}>Guest Cap</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 18 }}>
              {['10', '25', '50', '100', '200', '∞'].map(n => (
                <div key={n} onClick={() => set('guestCap', n)} style={{ background: form.guestCap === n ? 'var(--accent-dim)' : 'var(--surface2)', border: `1.5px solid ${form.guestCap === n ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 20, padding: '7px 15px', fontSize: 13, color: form.guestCap === n ? 'var(--accent)' : 'var(--dim)', cursor: 'pointer', transition: 'all .15s' }}>
                  {n === '∞' ? '∞ Unlimited' : n}
                </div>
              ))}
            </div>

            {[
              { k: 'allowCaptions', label: 'Photo Captions', sub: 'Guests add text — auto-translated for everyone' },
              { k: 'allowVoice', label: 'Voice Memos', sub: 'Guests record a 10-sec audio message per shot' },
              { k: 'guestBook', label: 'Guest Book Mode', sub: 'Guests record a 15-sec video message (front camera)' },
              { k: 'liveSlideshow', label: 'Live Slideshow', sub: 'Cast gallery to a TV or projector in real-time' },
              { k: 'scavengerHunt', label: 'Scavenger Hunt', sub: 'Give guests photo prompts to check off' },
            ].map(({ k, label, sub }) => (
              <div key={k} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{label}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{sub}</div>
                </div>
                <div onClick={() => set(k, !(form as any)[k])} style={{ width: 44, height: 26, borderRadius: 13, background: (form as any)[k] ? 'var(--accent)' : 'var(--surface3)', position: 'relative', cursor: 'pointer', transition: 'background .2s', flexShrink: 0 }}>
                  <div style={{ position: 'absolute', width: 20, height: 20, borderRadius: '50%', background: 'white', top: 3, left: (form as any)[k] ? 21 : 3, transition: 'left .18s', boxShadow: '0 1px 4px rgba(0,0,0,.3)' }} />
                </div>
              </div>
            ))}

            {form.scavengerHunt && (
              <div style={{ marginTop: 14 }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--dim)', marginBottom: 10 }}>Select Prompts ({form.scavengerPrompts.length} active)</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {SCAVENGER_PROMPTS.map(p => {
                    const on = form.scavengerPrompts.includes(p)
                    return (
                      <div key={p} onClick={() => togglePrompt(p)} style={{ background: on ? 'var(--accent-dim)' : 'var(--surface2)', border: `1.5px solid ${on ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 9, padding: '10px 14px', cursor: 'pointer', fontSize: 13, color: on ? 'var(--accent)' : 'var(--dim)', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 12 }}>{on ? '✓' : '○'}</span>{p}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 4 — Photo modes */}
        {step === 4 && (
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--dim)', marginBottom: 10 }}>Guest Mode Control</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 20 }}>
              {MODE_CONTROLS.map(mc => (
                <div key={mc.id} onClick={() => set('modeControl', mc.id)} style={{ background: form.modeControl === mc.id ? 'var(--accent-dim)' : 'var(--surface2)', border: `1.5px solid ${form.modeControl === mc.id ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 10, padding: '13px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, transition: 'all .15s' }}>
                  <span style={{ fontSize: 17 }}>{mc.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: form.modeControl === mc.id ? 'var(--accent)' : 'var(--text)' }}>{mc.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 1 }}>{mc.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {form.modeControl === 'lock' && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--dim)', marginBottom: 10 }}>Locked Mode</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 7 }}>
                  {ALL_MODES.slice(0, 9).map(m => (
                    <div key={m.id} onClick={() => set('lockedMode', m.id)} style={{ background: 'var(--surface2)', border: `1.5px solid ${form.lockedMode === m.id ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 9, overflow: 'hidden', cursor: 'pointer' }}>
                      <div style={{ height: 48, background: m.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{m.icon}</div>
                      <div style={{ padding: '5px 4px', textAlign: 'center', fontSize: 9, fontWeight: 600, color: form.lockedMode === m.id ? 'var(--accent)' : 'var(--dim)' }}>{m.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {form.modeControl !== 'lock' && form.modeControl !== 'free' && form.modeControl !== 'random' && (
              <>
                {Object.entries(PHOTO_MODES).map(([cat, modes]) => (
                  <div key={cat}>
                    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--muted)', margin: '14px 0 8px' }}>{cat}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 7 }}>
                      {modes.map(m => {
                        const sel = form.selectedModes.includes(m.id)
                        return (
                          <div key={m.id} onClick={() => toggleMode(m.id)} style={{ background: 'var(--surface2)', border: `1.5px solid ${sel ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 9, overflow: 'hidden', cursor: 'pointer', position: 'relative' }}>
                            {sel && <div style={{ position: 'absolute', top: 4, right: 4, width: 15, height: 15, background: 'var(--accent)', color: '#000', borderRadius: '50%', fontSize: 8, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>✓</div>}
                            <div style={{ height: 50, background: m.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{m.icon}</div>
                            <div style={{ padding: '5px 4px', textAlign: 'center', fontSize: 9, fontWeight: 600, color: sel ? 'var(--accent)' : 'var(--dim)' }}>{m.name}</div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* STEP 5 — Language & branding */}
        {step === 5 && (
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--dim)', marginBottom: 10 }}>Primary Language</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7, maxHeight: 260, overflowY: 'auto', marginBottom: 18 }}>
              {LANGUAGES.map(l => (
                <div key={l.code} onClick={() => set('language', l.code)} style={{ background: form.language === l.code ? 'var(--accent-dim)' : 'var(--surface2)', border: `1.5px solid ${form.language === l.code ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 9, padding: '10px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, direction: l.dir as any }}>
                  <span style={{ fontSize: 17, flexShrink: 0 }}>{l.flag}</span>
                  <span style={{ fontSize: 12, fontWeight: 500, color: form.language === l.code ? 'var(--accent)' : 'var(--text)' }}>{l.name}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>White-label Branding</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>Add your venue/brand to the guest experience</div>
              </div>
              <div onClick={() => set('whiteLabel', !form.whiteLabel)} style={{ width: 44, height: 26, borderRadius: 13, background: form.whiteLabel ? 'var(--accent)' : 'var(--surface3)', position: 'relative', cursor: 'pointer', transition: 'background .2s', flexShrink: 0 }}>
                <div style={{ position: 'absolute', width: 20, height: 20, borderRadius: '50%', background: 'white', top: 3, left: form.whiteLabel ? 21 : 3, transition: 'left .18s' }} />
              </div>
            </div>

            {form.whiteLabel && (
              <div style={{ marginTop: 14 }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--dim)', marginBottom: 7 }}>Brand / Venue Name</div>
                <input value={form.brandName} onChange={e => set('brandName', e.target.value)} placeholder="e.g. 777 Game Club" style={inp()} />
              </div>
            )}
          </div>
        )}

        {/* STEP 6 — Reveal */}
        {step === 6 && (
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
              {REVEAL_MODES.map(r => (
                <div key={r.id} onClick={() => set('revealMode', r.id)} style={{ background: form.revealMode === r.id ? 'var(--accent-dim)' : 'var(--surface2)', border: `1.5px solid ${form.revealMode === r.id ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 10, padding: '14px 15px', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: 13, transition: 'all .15s' }}>
                  <span style={{ fontSize: 20, marginTop: 1, flexShrink: 0 }}>{r.icon}</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: form.revealMode === r.id ? 'var(--accent)' : 'var(--text)', marginBottom: 3 }}>{r.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--dim)', lineHeight: 1.4 }}>{r.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ height: 1, background: 'var(--border)', marginBottom: 16 }} />
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--dim)', marginBottom: 4 }}>Post-Event</div>

            {[
              { k: 'aiReel', label: 'AI Highlight Reel', sub: 'Auto-generate a 30-sec video of the best shots' },
              { k: 'printEnabled', label: 'Print Integration', sub: 'Guests can order physical prints from the gallery' },
              { k: 'statsCard', label: 'Event Stats Card', sub: 'Shareable recap card after reveal' },
            ].map(({ k, label, sub }) => (
              <div key={k} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{label}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{sub}</div>
                </div>
                <div onClick={() => set(k, !(form as any)[k])} style={{ width: 44, height: 26, borderRadius: 13, background: (form as any)[k] ? 'var(--accent)' : 'var(--surface3)', position: 'relative', cursor: 'pointer', transition: 'background .2s', flexShrink: 0 }}>
                  <div style={{ position: 'absolute', width: 20, height: 20, borderRadius: '50%', background: 'white', top: 3, left: (form as any)[k] ? 21 : 3, transition: 'left .18s' }} />
                </div>
              </div>
            ))}

            {error && <div style={{ color: 'var(--red)', fontSize: 13, marginTop: 14, textAlign: 'center' }}>{error}</div>}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: '13px 18px', borderTop: '1px solid var(--border)', background: 'rgba(10,10,10,0.97)' }}>
        <button onClick={step < TOTAL ? () => setStep(s => s + 1) : handleCreate}
          disabled={saving}
          style={{ width: '100%', background: saving ? 'var(--surface3)' : 'var(--accent)', color: saving ? 'var(--muted)' : '#0a0a0a', border: 'none', borderRadius: 13, padding: '15px 20px', fontSize: 14, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', transition: 'all .15s' }}>
          {saving ? 'Creating...' : step < TOTAL ? 'Continue →' : 'Create Event 🎉'}
        </button>
      </div>
    </main>
  )
}
