'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { IconFlash, IconPlus, IconClose, IconCheck, IconDelete, IconCopy, IconGuests, IconShutter, IconTimer } from '@/components/icons'

// Hardcoded admin emails — server-verified
const ADMIN_EMAILS = ['behnam.parvin.ca@gmail.com']

type PromoCode = {
  id: string
  code: string
  description: string
  type: 'percent' | 'free'
  discount_percent: number | null
  applies_to: string
  max_uses: number
  uses_count: number
  assigned_to_email: string | null
  expires_at: string | null
  is_active: boolean
  notes: string | null
  created_at: string
}

const TIERS = ['all', 'mini', 'standard', 'medium', 'large', 'xl', 'unlimited']
const TIER_LABELS: Record<string, string> = {
  all: 'All tiers', mini: 'Starter $1.99', standard: 'Small $4.99',
  medium: 'Medium $9.99', large: 'Large $14.99', xl: 'XL $29.99', unlimited: 'Unlimited $99.99'
}

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export default function AdminPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const [promos, setPromos] = useState<PromoCode[]>([])
  const [stats, setStats] = useState({ total: 0, active: 0, redeemed: 0 })
  const [showCreate, setShowCreate] = useState(false)
  const [toast, setToast] = useState('')

  const [form, setForm] = useState({
    code: generateCode(),
    description: '',
    type: 'free' as 'percent' | 'free',
    discount_percent: 50,
    applies_to: 'all',
    max_uses: 1,
    assigned_to_email: '',
    expires_at: '',
    notes: '',
  })

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2500) }
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  useEffect(() => {
    async function check() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !ADMIN_EMAILS.includes(user.email!)) {
        router.replace('/')
        return
      }
      setAuthorized(true)
      await loadData()
      setLoading(false)
    }
    check()
  }, [])

  const loadData = async () => {
    const { data } = await supabase.from('promo_codes').select('*').order('created_at', { ascending: false })
    if (data) setPromos(data)
    const [{ count: total }, { count: active }, { data: redemptions }] = await Promise.all([
      supabase.from('promo_codes').select('*', { count: 'exact', head: true }),
      supabase.from('promo_codes').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('promo_redemptions').select('id'),
    ])
    setStats({ total: total || 0, active: active || 0, redeemed: redemptions?.length || 0 })
  }

  const handleCreate = async () => {
    if (!form.description.trim()) { showToast('Add a description'); return }
    const { error } = await supabase.from('promo_codes').insert({
      code: form.code.toUpperCase(),
      description: form.description,
      type: form.type,
      discount_percent: form.type === 'free' ? 100 : form.discount_percent,
      applies_to: form.applies_to,
      max_uses: form.max_uses,
      assigned_to_email: form.assigned_to_email || null,
      expires_at: form.expires_at || null,
      notes: form.notes || null,
      is_active: true,
    })
    if (error) { showToast('Error: ' + error.message); return }
    showToast('✓ Code created')
    setShowCreate(false)
    setForm({ code: generateCode(), description: '', type: 'free', discount_percent: 50, applies_to: 'all', max_uses: 1, assigned_to_email: '', expires_at: '', notes: '' })
    await loadData()
  }

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from('promo_codes').update({ is_active: !current }).eq('id', id)
    setPromos(p => p.map(x => x.id === id ? { ...x, is_active: !current } : x))
    showToast(current ? 'Deactivated' : 'Activated')
  }

  const deletePromo = async (id: string) => {
    if (!confirm('Delete this promo code?')) return
    await supabase.from('promo_codes').delete().eq('id', id)
    setPromos(p => p.filter(x => x.id !== id))
    showToast('Deleted')
  }

  const copyCode = (code: string) => {
    navigator.clipboard?.writeText(code)
    showToast(`Copied: ${code}`)
  }

  if (loading) return (
    <main style={{ height: '100dvh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#444', fontSize: 13 }}>Verifying access...</div>
    </main>
  )

  if (!authorized) return null

  const inp = { background: '#111', border: '1px solid #222', borderRadius: 10, padding: '12px 14px', color: '#f0f0f0', fontSize: 14, width: '100%', outline: 'none', fontFamily: 'inherit' } as any

  return (
    <main style={{ minHeight: '100dvh', background: '#0a0a0a', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 'max(14px, env(safe-area-inset-top))', paddingBottom: '14px', paddingLeft: 18, paddingRight: 18, background: 'rgba(10,10,10,0.96)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #161616', position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ width: 32, height: 32, background: '#ffb800', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <IconFlash size={18} color="#0a0a0a" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>Flash Admin</div>
          <div style={{ fontSize: 10, color: '#444', letterSpacing: 1.5, textTransform: 'uppercase' }}>Promo Codes</div>
        </div>
        <button onClick={() => router.push('/host')} style={{ background: '#161616', border: 'none', borderRadius: 9, padding: '7px 14px', color: '#555', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
          ← Dashboard
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1, background: '#161616', borderBottom: '1px solid #161616' }}>
        {[
          { label: 'Total', value: stats.total, Icon: IconShutter },
          { label: 'Active', value: stats.active, Icon: IconCheck },
          { label: 'Used', value: stats.redeemed, Icon: IconGuests },
        ].map(({ label, value, Icon }) => (
          <div key={label} style={{ background: '#0a0a0a', padding: '14px 12px', textAlign: 'center' }}>
            <Icon size={14} color="#333" style={{ marginBottom: 4 }} />
            <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 22, fontWeight: 700, color: '#ffb800' }}>{value}</div>
            <div style={{ fontSize: 9, color: '#333', textTransform: 'uppercase', letterSpacing: 1, marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 18px 60px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ fontSize: 15, fontWeight: 700 }}>Promo Codes</div>
          <button onClick={() => setShowCreate(true)} style={{ background: '#ffb800', color: '#0a0a0a', border: 'none', borderRadius: 10, padding: '9px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}>
            <IconPlus size={14} color="#0a0a0a" weight="bold" /> New Code
          </button>
        </div>

        {/* Promo list */}
        {promos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#333' }}>
            <div style={{ fontSize: 13, marginBottom: 4 }}>No promo codes yet</div>
            <div style={{ fontSize: 12, color: '#2a2a2a' }}>Create codes for promoters, organizers, or gifts</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {promos.map(p => (
              <div key={p.id} style={{ background: '#111', border: `1px solid ${p.is_active ? '#1e1e1e' : '#141414'}`, borderRadius: 14, padding: '14px 16px', opacity: p.is_active ? 1 : 0.45 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <button onClick={() => copyCode(p.code)} style={{ fontFamily: 'Space Mono, monospace', fontSize: 15, fontWeight: 700, color: '#ffb800', background: 'rgba(255,184,0,0.07)', border: '1px solid rgba(255,184,0,0.15)', borderRadius: 8, padding: '4px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                      {p.code} <IconCopy size={11} color="#ffb800" />
                    </button>
                    <div style={{ background: p.type === 'free' ? 'rgba(46,213,115,0.1)' : 'rgba(255,184,0,0.08)', border: `1px solid ${p.type === 'free' ? 'rgba(46,213,115,0.25)' : 'rgba(255,184,0,0.15)'}`, borderRadius: 6, padding: '3px 9px', fontSize: 11, fontWeight: 800, color: p.type === 'free' ? '#2ed573' : '#ffb800', fontFamily: 'Space Mono, monospace' }}>
                      {p.type === 'free' ? 'FREE' : `${p.discount_percent}% OFF`}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button onClick={() => toggleActive(p.id, p.is_active)} style={{ width: 28, height: 28, background: '#1a1a1a', border: 'none', borderRadius: 7, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title={p.is_active ? 'Deactivate' : 'Activate'}>
                      {p.is_active ? <IconClose size={12} color="#555" /> : <IconCheck size={12} color="#555" />}
                    </button>
                    <button onClick={() => deletePromo(p.id)} style={{ width: 28, height: 28, background: '#1a1a1a', border: 'none', borderRadius: 7, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <IconDelete size={12} color="#553333" />
                    </button>
                  </div>
                </div>

                <div style={{ fontSize: 13, color: '#bbb', marginBottom: 8 }}>{p.description}</div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {[
                    { l: 'Uses', v: `${p.uses_count}/${p.max_uses}` },
                    { l: 'Tier', v: TIER_LABELS[p.applies_to] || p.applies_to },
                    p.assigned_to_email && { l: 'For', v: p.assigned_to_email },
                    p.expires_at && { l: 'Expires', v: new Date(p.expires_at).toLocaleDateString() },
                  ].filter(Boolean).map((m: any) => (
                    <div key={m.l} style={{ background: '#161616', borderRadius: 6, padding: '3px 8px', display: 'flex', gap: 5 }}>
                      <span style={{ fontSize: 9, color: '#333', textTransform: 'uppercase', letterSpacing: 0.8 }}>{m.l}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#555', fontFamily: 'Space Mono, monospace' }}>{m.v}</span>
                    </div>
                  ))}
                </div>

                {p.notes && (
                  <div style={{ marginTop: 8, fontSize: 11, color: '#444', fontStyle: 'italic', borderTop: '1px solid #1a1a1a', paddingTop: 8 }}>
                    {p.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create modal */}
      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 100, display: 'flex', alignItems: 'flex-end' }} onClick={e => e.target === e.currentTarget && setShowCreate(false)}>
          <div style={{ background: '#0f0f0f', borderRadius: '20px 20px 0 0', padding: '22px 18px 44px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ fontSize: 17, fontWeight: 700 }}>New Promo Code</div>
              <button onClick={() => setShowCreate(false)} style={{ width: 30, height: 30, background: '#1a1a1a', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconClose size={15} color="#555" />
              </button>
            </div>

            {/* Code */}
            <Label>Code</Label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              <input value={form.code} onChange={e => set('code', e.target.value.toUpperCase())} style={{ ...inp, fontFamily: 'Space Mono, monospace', fontSize: 16, letterSpacing: 2, flex: 1 }} maxLength={16} />
              <button onClick={() => set('code', generateCode())} style={{ background: '#1a1a1a', border: '1px solid #222', borderRadius: 10, padding: '0 14px', color: '#666', cursor: 'pointer', fontSize: 11, fontFamily: 'inherit', whiteSpace: 'nowrap' }}>New</button>
            </div>

            {/* Description */}
            <Label>Description</Label>
            <input value={form.description} onChange={e => set('description', e.target.value)} placeholder="e.g. Gift for Ahmed's wedding" style={{ ...inp, marginBottom: 14 }} />

            {/* Type */}
            <Label>Type</Label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
              {(['free', 'percent'] as const).map(t => (
                <div key={t} onClick={() => set('type', t)} style={{ background: form.type === t ? 'rgba(255,184,0,0.06)' : '#111', border: `1px solid ${form.type === t ? '#ffb800' : '#222'}`, borderRadius: 10, padding: '14px', cursor: 'pointer', textAlign: 'center', transition: 'all .15s' }}>
                  <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 20, fontWeight: 900, color: form.type === t ? (t === 'free' ? '#2ed573' : '#ffb800') : '#444', marginBottom: 4 }}>
                    {t === 'free' ? 'FREE' : '%'}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: form.type === t ? '#ccc' : '#555' }}>
                    {t === 'free' ? '100% Free' : 'Percentage Off'}
                  </div>
                </div>
              ))}
            </div>

            {/* Percent slider */}
            {form.type === 'percent' && (
              <>
                <Label>Discount</Label>
                <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 12, padding: '16px', marginBottom: 14 }}>
                  <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 36, fontWeight: 700, color: '#ffb800', marginBottom: 10 }}>{form.discount_percent}%</div>
                  <input type="range" min={5} max={95} step={5} value={form.discount_percent} onChange={e => set('discount_percent', +e.target.value)} style={{ width: '100%' }} />
                </div>
              </>
            )}

            {/* Applies to */}
            <Label>Applies To</Label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
              {TIERS.map(t => (
                <div key={t} onClick={() => set('applies_to', t)} style={{ background: form.applies_to === t ? 'rgba(255,184,0,0.08)' : '#111', border: `1px solid ${form.applies_to === t ? '#ffb800' : '#222'}`, borderRadius: 8, padding: '6px 12px', fontSize: 11, fontWeight: 600, color: form.applies_to === t ? '#ffb800' : '#555', cursor: 'pointer', transition: 'all .15s' }}>
                  {t === 'all' ? 'All Tiers' : TIER_LABELS[t].split(' ')[0]}
                </div>
              ))}
            </div>

            {/* Max uses */}
            <Label>Max Uses</Label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
              {[1, 2, 5, 10, 25, 50, 100].map(n => (
                <div key={n} onClick={() => set('max_uses', n)} style={{ background: form.max_uses === n ? 'rgba(255,184,0,0.08)' : '#111', border: `1px solid ${form.max_uses === n ? '#ffb800' : '#222'}`, borderRadius: 8, padding: '6px 14px', fontSize: 13, fontFamily: 'Space Mono, monospace', fontWeight: 700, color: form.max_uses === n ? '#ffb800' : '#555', cursor: 'pointer', transition: 'all .15s' }}>
                  {n}
                </div>
              ))}
            </div>

            {/* Assign to */}
            <Label>Assign to Email (optional — locks to one person)</Label>
            <input value={form.assigned_to_email} onChange={e => set('assigned_to_email', e.target.value)} placeholder="sarah@email.com" style={{ ...inp, marginBottom: 14 }} type="email" />

            {/* Expiry */}
            <Label>Expiry Date (optional)</Label>
            <input value={form.expires_at} onChange={e => set('expires_at', e.target.value)} style={{ ...inp, marginBottom: 14 }} type="date" />

            {/* Notes */}
            <Label>Internal Notes (optional)</Label>
            <input value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="e.g. Promoter at 777 Game Club" style={{ ...inp, marginBottom: 22 }} />

            <button onClick={handleCreate} style={{ width: '100%', background: '#ffb800', color: '#0a0a0a', border: 'none', borderRadius: 13, padding: '15px 20px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              Create Promo Code
            </button>
          </div>
        </div>
      )}

      {/* Toast */}
      <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: `translateX(-50%) translateY(${toast ? 0 : 12}px)`, background: '#161616', border: '1px solid #222', borderRadius: 24, padding: '11px 20px', fontSize: 13, fontWeight: 600, color: '#f0f0f0', zIndex: 999, opacity: toast ? 1 : 0, transition: 'all .25s', pointerEvents: 'none', whiteSpace: 'nowrap', boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}>
        {toast}
      </div>
    </main>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#444', marginBottom: 8 }}>{children}</div>
}
