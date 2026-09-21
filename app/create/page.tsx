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

const TOTAL = 3

const Label = ({ children }: { children: React.ReactNode }) => (
  <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 2.5, textTransform: 'uppercase', color: '#8a8a8a', marginBottom: 10 }}>{children}</div>
)

const Inp = ({ label, ...props }: any) => (
  <div style={{ marginBottom: 16 }}>
    {label && <Label>{label}</Label>}
    <input {...props} style={{ background: '#141414', border: '1px solid #222', borderRadius: 12, padding: '13px 16px', color: '#f0f0f0', fontSize: 15, width: '100%', outline: 'none', fontFamily: 'inherit', ...props.style }} />
  </div>
)

const Toggle = ({ on, onChange, label, sub }: { on: boolean; onChange: (v: boolean) => void; label: string; sub?: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #161616' }}>
    <div style={{ flex: 1, paddingRight: 20 }}>
      <div style={{ fontSize: 14, fontWeight: 500, color: '#ddd' }}>{label}</div>
      {sub && <div style={{ fontSize: 12, color: '#8a8a8a', marginTop: 3 }}>{sub}</div>}
    </div>
    <div onClick={() => onChange(!on)} style={{ width: 46, height: 26, borderRadius: 13, background: on ? '#ffb800' : '#222', position: 'relative', cursor: 'pointer', transition: 'background .2s', flexShrink: 0 }}>
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
    shotLimit: 10, guestCap: '50', language: 'en',
    revealMode: 'end', modeControl: 'lock', selectedModes: ['kodak'], lockedMode: 'kodak',
    scavengerHunt: false, scavengerPrompts: SCAVENGER_PROMPTS.slice(0, 6),
    guestBook: false, liveSlideshow: false, aiReel: false,
    printEnabled: false, allowCaptions: false, allowVoice: false,
    whiteLabel: false, brandName: '', brandLogoPreview: '', brandLogoFile: null as File | null, statsCard: false,
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
      const user = (await supabase.auth.getSession()).data.session?.user ?? null
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
        event_date: form.date || null, shot_limit: form.guestCap === '5' ? Math.min(form.shotLimit, 10) : Math.min(form.shotLimit, 40),
        guest_cap: form.guestCap === '∞' ? 9999 : parseInt(form.guestCap) || 5,
        primary_language: form.language, reveal_mode: form.revealMode as any,
        mode_control: form.modeControl as any, selected_modes: form.selectedModes,
        locked_mode: form.lockedMode, scavenger_hunt: form.scavengerHunt,
        scavenger_prompts: form.scavengerHunt ? form.scavengerPrompts : [],
        guest_book: form.guestBook, live_slideshow: form.liveSlideshow,
        ai_reel: form.aiReel, print_enabled: form.printEnabled,
        allow_captions: form.allowCaptions, allow_voice: form.allowVoice,
        white_label: form.whiteLabel, brand_name: form.whiteLabel ? form.brandName : null,
        brand_logo_url: null, stats_card_enabled: form.statsCard, is_active: false, paid: false,
        cover_color: form.coverColor, cover_emoji: form.coverEmoji,
        cover_image_url: coverImageUrl,
      }).select().single()
      if (err) throw err
      router.push(`/pricing?eventId=${event.id}${form.guestCap === '5' ? '&tier=free' : ''}`)
    } catch (e: any) {
      setError(e.message || 'Failed to create event')
      setSaving(false)
    }
  }

  const canContinue = () => {
    if (step === 1) return form.eventName.trim().length > 0 && form.date.length > 0
    return true
  }

  const TITLES = ["What's the occasion?", "Guests & plan", "Ready to create"]

  return (
    <main style={{ height: '100dvh', background: '#0a0a0a', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingTop: 'max(14px, env(safe-area-inset-top))', paddingBottom: '14px', paddingLeft: 18, paddingRight: 18, background: 'rgba(10,10,10,0.96)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #161616', position: 'sticky', top: 0, zIndex: 20 }}>
        <button onClick={() => step > 1 ? setStep(s => s - 1) : router.push('/host')} style={{ width: 38, height: 38, background: '#161616', border: 'none', borderRadius: 12, color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ArrowLeft size={18} weight="regular" />
        </button>
        <span style={{ fontSize: 15, fontWeight: 600, flex: 1, letterSpacing: -0.3 }}>Create Event</span>
        <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, color: '#333' }}>{step}/{TOTAL}</span>
      </div>
      <div style={{ height: 1, background: '#161616' }}>
        <div style={{ height: 1, background: '#ffb800', width: `${(step / TOTAL) * 100}%`, transition: 'width .5s cubic-bezier(.4,0,.2,1)' }} />
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
                  <div key={id} onClick={() => set('eventType', id)} style={{ background: sel ? 'rgba(255,184,0,0.07)' : '#111', border: `1px solid ${sel ? '#ffb800' : '#1e1e1e'}`, borderRadius: 16, padding: '26px 16px 20px', cursor: 'pointer', textAlign: 'center', transition: 'all .18s' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
                      <Icon size={34} color={sel ? '#ffb800' : '#3a3a3a'} weight={sel ? 'regular' : 'light'} />
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2.5, textTransform: 'uppercase', color: sel ? '#ffb800' : '#444' }}>{label}</div>
                  </div>
                )
              })}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
              {EVENT_TYPES.slice(2, 8).map(({ id, label, Icon }) => {
                const sel = form.eventType === id
                return (
                  <div key={id} onClick={() => set('eventType', id)} style={{ background: sel ? 'rgba(255,184,0,0.07)' : '#111', border: `1px solid ${sel ? '#ffb800' : '#1e1e1e'}`, borderRadius: 14, padding: '20px 8px 15px', cursor: 'pointer', textAlign: 'center', transition: 'all .18s' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 11 }}>
                      <Icon size={28} color={sel ? '#ffb800' : '#3a3a3a'} weight={sel ? 'regular' : 'light'} />
                    </div>
                    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: sel ? '#ffb800' : '#444' }}>{label}</div>
                  </div>
                )
              })}
            </div>
            {EVENT_TYPES.slice(8).map(({ id, label, Icon }) => {
              const sel = form.eventType === id
              return (
                <div key={id} onClick={() => set('eventType', id)} style={{ background: sel ? 'rgba(255,184,0,0.07)' : '#111', border: `1px solid ${sel ? '#ffb800' : '#1e1e1e'}`, borderRadius: 14, padding: '16px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, transition: 'all .18s' }}>
                  <Icon size={22} color={sel ? '#ffb800' : '#3a3a3a'} weight={sel ? 'regular' : 'light'} />
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2.5, textTransform: 'uppercase', color: sel ? '#ffb800' : '#444' }}>{label}</div>
                </div>
              )
            })}
            <div style={{ marginTop: 24 }}>
              <Inp label="Event Name *" placeholder="e.g. Sarah & Marco's Wedding" value={form.eventName} onChange={(e: any) => set('eventName', e.target.value)} />
              <Inp label="Event Date *" type="date" value={form.date} style={{ colorScheme: 'dark', width: '100%', boxSizing: 'border-box' }} onChange={(e: any) => set('date', e.target.value)} />
              <div style={{ fontSize: 12, color: '#888', marginTop: -4, lineHeight: 1.5 }}>Closes and reveals the gallery automatically at 9:00 AM the morning after. You can change this in event settings.</div>
              <Inp label="Venue (optional)" placeholder="e.g. Grand Ballroom, Toronto" value={form.venue} onChange={(e: any) => set('venue', e.target.value)} />
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div style={{ background: '#111', borderRadius: 16, padding: '20px 18px', marginBottom: 20, border: '1px solid #1e1e1e' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 18 }}>
                <div>
                  <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 52, fontWeight: 700, color: '#ffb800', lineHeight: 1 }}>{form.shotLimit}</div>
                  <div style={{ fontSize: 12, color: '#8a8a8a', marginTop: 5 }}>photos per guest</div>
                {form.guestCap === '5' && form.shotLimit >= 10 && (
                  <div style={{ fontSize: 10, color: '#2ed573', marginTop: 3 }}>Free plan max</div>
                )}
                </div>
                <div style={{ fontSize: 11, color: '#333' }}>{form.shotLimit <= 6 ? 'Ultra rare' : form.shotLimit <= 12 ? 'Classic film' : form.shotLimit <= 20 ? 'Generous' : 'Party mode'}</div>
              </div>
              <input type="range" min={3} max={form.guestCap === '5' ? 10 : 40} value={Math.min(form.shotLimit, form.guestCap === '5' ? 10 : 40)} onChange={e => set('shotLimit', +e.target.value)} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 10, color: '#333', fontFamily: 'Space Mono, monospace' }}>
                <span>3</span>
                <span style={{ color: form.guestCap === '5' ? '#2ed573' : '#333' }}>{form.guestCap === '5' ? '10 (free max)' : '40'}</span>
              </div>
            </div>
            <Label>Max Guests</Label>
            {/* Free tier callout */}
            <div onClick={() => { set('guestCap', '5'); if (form.shotLimit > 10) set('shotLimit', 10) }}
              style={{ background: form.guestCap === '5' ? 'rgba(46,213,115,0.08)' : '#111', border: `1px solid ${form.guestCap === '5' ? 'rgba(46,213,115,0.5)' : '#1e1e1e'}`, borderRadius: 12, paddingBottom: '14px', paddingLeft: 16, paddingRight: 16, marginBottom: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: form.guestCap === '5' ? '#2ed573' : '#ccc', marginBottom: 3 }}>≤ 5 guests — Free</div>
                <div style={{ fontSize: 12, color: '#8a8a8a' }}>No payment needed · Perfect for testing</div>
              </div>
              <div style={{ background: 'rgba(46,213,115,0.12)', border: '1px solid rgba(46,213,115,0.3)', borderRadius: 8, padding: '4px 10px', fontSize: 10, fontWeight: 800, color: '#2ed573', letterSpacing: 1, textTransform: 'uppercase' }}>
                Free
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 24 }}>
              {['10', '25', '50', '100', '200', '∞'].map(n => (
                <div key={n} onClick={() => set('guestCap', n)} style={{ background: form.guestCap === n ? 'rgba(255,184,0,0.08)' : '#111', border: `1px solid ${form.guestCap === n ? '#ffb800' : '#1e1e1e'}`, borderRadius: 10, padding: '8px 16px', fontSize: 13, fontFamily: 'Space Mono, monospace', color: form.guestCap === n ? '#ffb800' : '#444', cursor: 'pointer' }}>{n}</div>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 16, padding: '6px 18px', marginBottom: 16 }}>
              {[
                ['Occasion', EVENT_TYPES.find(t => t.id === form.eventType)?.label || 'Other'],
                ['Name', form.eventName || '—'],
                ['Date', form.date || '—'],
                ...(form.venue ? [['Venue', form.venue]] : []),
                ['Max guests', form.guestCap === '∞' ? 'Unlimited' : form.guestCap],
                ['Photos per guest', String(form.shotLimit)],
              ].map(([l, v]) => (
                <div key={l as string} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 0', borderBottom: '1px solid #1a1a1a' }}>
                  <span style={{ fontSize: 12, color: '#999' }}>{l}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#f0f0f0', textAlign: 'right', maxWidth: '60%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 0' }}>
                <span style={{ fontSize: 12, color: '#999' }}>Plan</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: form.guestCap === '5' ? '#2ed573' : '#ffb800' }}>
                  {form.guestCap === '5' ? 'Free' : 'Paid — choose on the next screen'}
                </span>
              </div>
            </div>

            <div style={{ background: 'rgba(255,184,0,0.04)', border: '1px solid rgba(255,184,0,0.15)', borderRadius: 14, padding: '14px 16px', marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#ffb800', marginBottom: 6 }}>Smart defaults applied</div>
              <div style={{ fontSize: 12, color: '#999', lineHeight: 1.7 }}>
                Film: Kodak Gold (locked) · Reveal: End of event · Classic cover.
                Customize film modes, reveal timing, cover and extras anytime from your event page.
              </div>
            </div>

            {error && <div style={{ color: '#ff4757', fontSize: 13, textAlign: 'center' }}>{error}</div>}
          </div>
        )}

      </div>

      <div style={{ paddingTop: 14, paddingLeft: 20, paddingRight: 20, paddingBottom: 'max(34px, calc(env(safe-area-inset-bottom) + 14px))', borderTop: '1px solid #161616', background: 'rgba(10,10,10,0.98)' }}>
        <button
          onClick={step < TOTAL ? () => { if (canContinue()) setStep(s => s + 1) } : handleCreate}
          disabled={saving || !canContinue()}
          style={{ width: '100%', background: saving || !canContinue() ? '#161616' : '#ffb800', color: saving || !canContinue() ? '#333' : '#0a0a0a', border: 'none', borderRadius: 14, padding: '16px 20px', fontSize: 15, fontWeight: 700, cursor: saving || !canContinue() ? 'not-allowed' : 'pointer', fontFamily: 'inherit', letterSpacing: -0.3, transition: 'all .2s' }}>
          {saving ? 'Creating...' : step < TOTAL ? 'Continue →' : form.guestCap === '5' ? 'Create Free Event →' : 'Create & Choose Plan →'}
        </button>
        {step === 1 && (!form.eventName.trim() || !form.date) && (
          <div style={{ textAlign: 'center', fontSize: 12, color: '#8a8a8a', marginTop: 10 }}>
            {!form.eventName.trim() && !form.date ? 'Event name and date required' : !form.eventName.trim() ? 'Event name required' : 'Event date required'}
          </div>
        )}
      </div>
    </main>
  )
}
