'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { IconFlash, IconPlus, IconClose, IconCheck, IconDelete, IconEdit, IconGuests, IconStats, IconShutter, IconCopy } from '@/components/icons'

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

const TIERS = ['all', 'mini', 'standard', 'large', 'unlimited']
const TIER_PRICES: Record<string, string> = {
  all: 'Any event', mini: '$3.99', standard: '$14.99', large: '$39.99', unlimited: '$99.99'
}

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export default function AdminPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [promos, setPromos] = useState<PromoCode[]>([])
  const [stats, setStats] = useState({ totalPromos: 0, activePromos: 0, totalRedemptions: 0, totalRevenue: 0 })
  const [showCreate, setShowCreate] = useState(false)
  const [toast, setToast] = useState('')
  const [tab, setTab] = useState<'promos' | 'stats'>('promos')

  const [form, setForm] = useState({
    code: generateCode(),
    description: '',
    type: 'percent' as 'percent' | 'free',
    discount_percent: 20,
    applies_to: 'all',
    max_uses: 1,
    assigned_to_email: '',
    expires_at: '',
    notes: '',
  })

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      // Check admin
      const { data: admin } = await supabase.from('admins').select('id').eq('user_id', user.id).single()
      if (!admin) { router.push('/host'); return }
      setIsAdmin(true)

      await loadPromos()
      await loadStats()
      setLoading(false)
    }
    load()
  }, [])

  const loadPromos = async () => {
    const { data } = await supabase
      .from('promo_codes')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setPromos(data)
  }

  const loadStats = async () => {
    const [{ count: total }, { count: active }, { data: redemptions }] = await Promise.all([
      supabase.from('promo_codes').select('*', { count: 'exact', head: true }),
      supabase.from('promo_codes').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('promo_redemptions').select('discount_amount'),
    ])
    setStats({
      totalPromos: total || 0,
      activePromos: active || 0,
      totalRedemptions: redemptions?.length || 0,
      totalRevenue: (redemptions || []).reduce((s, r) => s + (r.discount_amount || 0), 0),
    })
  }

  const handleCreate = async () => {
    if (!form.description) { showToast('Add a description'); return }

    const { error } = await supabase.from('promo_codes').insert({
      code: form.code.toUpperCase(),
      description: form.description,
      type: form.type,
      discount_percent: form.type === 'percent' ? form.discount_percent : 100,
      applies_to: form.applies_to,
      max_uses: form.max_uses,
      assigned_to_email: form.assigned_to_email || null,
      expires_at: form.expires_at || null,
      notes: form.notes || null,
      is_active: true,
    })

    if (error) { showToast('Error: ' + error.message); return }
    showToast('✓ Promo code created')
    setShowCreate(false)
    setForm({ code: generateCode(), description: '', type: 'percent', discount_percent: 20, applies_to: 'all', max_uses: 1, assigned_to_email: '', expires_at: '', notes: '' })
    await loadPromos()
    await loadStats()
  }

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from('promo_codes').update({ is_active: !current }).eq('id', id)
    setPromos(p => p.map(x => x.id === id ? { ...x, is_active: !current } : x))
    showToast(current ? 'Promo deactivated' : 'Promo activated')
  }

  const deletePromo = async (id: string) => {
    await supabase.from('promo_codes').delete().eq('id', id)
    setPromos(p => p.filter(x => x.id !== id))
    showToast('Deleted')
  }

  const copyCode = (code: string) => {
    navigator.clipboard?.writeText(code)
    showToast(`Copied: ${code}`)
  }

  if (loading) return (
    <main style={{ height: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="flash-loading"><IconFlash size={40} /></div>
    </main>
  )

  if (!isAdmin) return null

  const inp = { background: '#111', border: '1px solid #222', borderRadius: 10, padding: '12px 14px', color: '#f0f0f0', fontSize: 14, width: '100%', outline: 'none', fontFamily: 'inherit' } as any

  return (
    <main style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', background: 'rgba(10,10,10,0.96)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #161616', position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ width: 36, height: 36, background: '#e8ff47', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <IconFlash size={20} color="#0a0a0a" />
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: -0.3 }}>Flash Admin</div>
          <div style={{ fontSize: 10, color: '#444', letterSpacing: 1, textTransform: 'uppercase' }}>Promo & Settings</div>
        </div>
        <button onClick={() => router.push('/host')} style={{ marginLeft: 'auto', background: '#161616', border: 'none', borderRadius: 9, padding: '7px 14px', color: '#555', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
          ← Dashboard
        </button>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 1, borderBottom: '1px solid #161616', background: '#161616' }}>
        {[
          { label: 'Total Codes', value: stats.totalPromos, Icon: IconShutter },
          { label: 'Active', value: stats.activePromos, Icon: IconCheck },
          { label: 'Redeemed', value: stats.totalRedemptions, Icon: IconGuests },
          { label: 'Discounted', value: `$${((stats.totalRevenue || 0) / 100).toFixed(0)}`, Icon: IconStats },
        ].map(({ label, value, Icon }) => (
          <div key={label} style={{ background: '#0a0a0a', padding: '16px 12px', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}><Icon size={16} color="#333" /></div>
            <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 18, fontWeight: 700, color: '#e8ff47' }}>{value}</div>
            <div style={{ fontSize: 9, color: '#333', textTransform: 'uppercase', letterSpacing: 1, marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 18px 40px' }}>
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: -0.3 }}>Promo Codes</div>
          <button onClick={() => setShowCreate(true)} style={{ background: '#e8ff47', color: '#0a0a0a', border: 'none', borderRadius: 10, padding: '9px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}>
            <IconPlus size={15} color="#0a0a0a" weight="bold" /> New Code
          </button>
        </div>

        {/* Promo list */}
        {promos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#333' }}>
            <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.3 }}>🎟</div>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>No promo codes yet</div>
            <div style={{ fontSize: 13 }}>Create one for a promoter, organizer, or as a gift</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {promos.map(p => (
              <div key={p.id} style={{ background: '#111', border: `1px solid ${p.is_active ? '#1e1e1e' : '#141414'}`, borderRadius: 14, padding: '14px 16px', opacity: p.is_active ? 1 : 0.5 }}>
                {/* Code + badge row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <button onClick={() => copyCode(p.code)} style={{ fontFamily: 'Space Mono, monospace', fontSize: 16, fontWeight: 700, color: '#e8ff47', background: 'rgba(232,255,71,0.07)', border: '1px solid rgba(232,255,71,0.15)', borderRadius: 8, padding: '4px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                      {p.code} <IconCopy size={12} color="#e8ff47" />
                    </button>
                    <div style={{ background: p.type === 'free' ? 'rgba(46,213,115,0.1)' : 'rgba(232,255,71,0.08)', border: `1px solid ${p.type === 'free' ? 'rgba(46,213,115,0.2)' : 'rgba(232,255,71,0.15)'}`, borderRadius: 6, padding: '3px 8px', fontSize: 11, fontWeight: 700, color: p.type === 'free' ? '#2ed573' : '#e8ff47' }}>
                      {p.type === 'free' ? 'FREE' : `${p.discount_percent}% OFF`}
                    </div>
                  </div>
                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => toggleActive(p.id, p.is_active)} style={{ width: 30, height: 30, background: '#1a1a1a', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {p.is_active ? <IconClose size={13} color="#555" /> : <IconCheck size={13} color="#555" />}
                    </button>
                    <button onClick={() => deletePromo(p.id)} style={{ width: 30, height: 30, background: '#1a1a1a', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <IconDelete size={13} color="#553333" />
                    </button>
                  </div>
                </div>

                {/* Description */}
                <div style={{ fontSize: 13, color: '#ccc', marginBottom: 8 }}>{p.description}</div>

                {/* Meta row */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  <MetaTag label="Uses" value={`${p.uses_count} / ${p.max_uses}`} />
                  <MetaTag label="Tier" value={TIER_PRICES[p.applies_to] || p.applies_to} />
                  {p.assigned_to_email && <MetaTag label="For" value={p.assigned_to_email} />}
                  {p.expires_at && <MetaTag label="Expires" value={new Date(p.expires_at).toLocaleDateString()} />}
                  {!p.is_active && <MetaTag label="Status" value="Inactive" color="#ff4757" />}
                </div>

                {p.notes && (
                  <div style={{ marginTop: 8, fontSize: 12, color: '#444', fontStyle: 'italic', borderTop: '1px solid #1a1a1a', paddingTop: 8 }}>
                    📝 {p.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create modal */}
      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 100, display: 'flex', alignItems: 'flex-end' }} onClick={e => e.target === e.currentTarget && setShowCreate(false)}>
          <div style={{ background: '#0f0f0f', borderRadius: '20px 20px 0 0', padding: '20px 18px 40px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }} className="slide-up">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: -0.4 }}>New Promo Code</div>
              <button onClick={() => setShowCreate(false)} style={{ width: 32, height: 32, background: '#1a1a1a', border: 'none', borderRadius: 9, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconClose size={16} color="#555" />
              </button>
            </div>

            {/* Code */}
            <div style={{ marginBottom: 14 }}>
              <Label>Code</Label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input value={form.code} onChange={e => set('code', e.target.value.toUpperCase())} style={{ ...inp, fontFamily: 'Space Mono, monospace', fontSize: 16, letterSpacing: 2, flex: 1 }} maxLength={16} />
                <button onClick={() => set('code', generateCode())} style={{ background: '#1a1a1a', border: '1px solid #222', borderRadius: 10, padding: '0 14px', color: '#666', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                  Regenerate
                </button>
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: 14 }}>
              <Label>Description (internal)</Label>
              <input value={form.description} onChange={e => set('description', e.target.value)} placeholder="e.g. Gift for Sarah's wedding" style={inp} />
            </div>

            {/* Type */}
            <div style={{ marginBottom: 14 }}>
              <Label>Discount Type</Label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {(['percent', 'free'] as const).map(t => (
                  <div key={t} onClick={() => set('type', t)} style={{ background: form.type === t ? 'rgba(232,255,71,0.07)' : '#111', border: `1px solid ${form.type === t ? '#e8ff47' : '#222'}`, borderRadius: 10, padding: '12px 14px', cursor: 'pointer', textAlign: 'center', transition: 'all .15s' }}>
                    <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 4, color: t === 'free' ? '#2ed573' : '#e8ff47', fontFamily: 'Space Mono, monospace' }}>{t === 'free' ? 'FREE' : '%'}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: form.type === t ? '#e8ff47' : '#888' }}>
                      {t === 'free' ? '100% Free' : 'Percentage Off'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Percent slider */}
            {form.type === 'percent' && (
              <div style={{ marginBottom: 14 }}>
                <Label>Discount Amount</Label>
                <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 12, padding: '16px' }}>
                  <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 40, fontWeight: 700, color: '#e8ff47', marginBottom: 12 }}>{form.discount_percent}%</div>
                  <input type="range" min={5} max={100} step={5} value={form.discount_percent} onChange={e => set('discount_percent', +e.target.value)} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 10, color: '#333', fontFamily: 'Space Mono, monospace' }}>
                    <span>5%</span><span>50%</span><span>100%</span>
                  </div>
                </div>
              </div>
            )}

            {/* Applies to */}
            <div style={{ marginBottom: 14 }}>
              <Label>Applies To</Label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {TIERS.map(t => (
                  <div key={t} onClick={() => set('applies_to', t)} style={{ background: form.applies_to === t ? 'rgba(232,255,71,0.08)' : '#111', border: `1px solid ${form.applies_to === t ? '#e8ff47' : '#222'}`, borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 600, color: form.applies_to === t ? '#e8ff47' : '#555', cursor: 'pointer', transition: 'all .15s' }}>
                    {t === 'all' ? 'All Tiers' : t.charAt(0).toUpperCase() + t.slice(1)}
                    {t !== 'all' && <span style={{ fontSize: 10, color: '#333', marginLeft: 4 }}>{TIER_PRICES[t]}</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Max uses */}
            <div style={{ marginBottom: 14 }}>
              <Label>Max Uses</Label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {[1, 2, 5, 10, 25, 50, 100].map(n => (
                  <div key={n} onClick={() => set('max_uses', n)} style={{ background: form.max_uses === n ? 'rgba(232,255,71,0.08)' : '#111', border: `1px solid ${form.max_uses === n ? '#e8ff47' : '#222'}`, borderRadius: 8, padding: '6px 14px', fontSize: 13, fontFamily: 'Space Mono, monospace', fontWeight: 700, color: form.max_uses === n ? '#e8ff47' : '#555', cursor: 'pointer', transition: 'all .15s' }}>
                    {n}
                  </div>
                ))}
              </div>
            </div>

            {/* Assign to */}
            <div style={{ marginBottom: 14 }}>
              <Label>Assign to Email (optional)</Label>
              <input value={form.assigned_to_email} onChange={e => set('assigned_to_email', e.target.value)} placeholder="promoter@email.com — only they can use it" style={inp} type="email" />
            </div>

            {/* Expiry */}
            <div style={{ marginBottom: 14 }}>
              <Label>Expiry Date (optional)</Label>
              <input value={form.expires_at} onChange={e => set('expires_at', e.target.value)} style={inp} type="date" />
            </div>

            {/* Notes */}
            <div style={{ marginBottom: 20 }}>
              <Label>Internal Notes (optional)</Label>
              <input value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="e.g. Given to Ahmed for promoting at his venue" style={inp} />
            </div>

            <button onClick={handleCreate} style={{ width: '100%', background: '#e8ff47', color: '#0a0a0a', border: 'none', borderRadius: 13, padding: '15px 20px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
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

function MetaTag({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ background: '#161616', borderRadius: 6, padding: '3px 8px', display: 'flex', alignItems: 'center', gap: 5 }}>
      <span style={{ fontSize: 9, color: '#333', textTransform: 'uppercase', letterSpacing: 0.8 }}>{label}</span>
      <span style={{ fontSize: 11, fontWeight: 600, color: color || '#666', fontFamily: 'Space Mono, monospace' }}>{value}</span>
    </div>
  )
}
