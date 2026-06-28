'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { IconFlash } from '@/components/icons'

export default function PublicGalleryPage() {
  const { token } = useParams()
  const supabase = createClient()
  const [event, setEvent] = useState<any>(null)
  const [photos, setPhotos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<any>(null)

  useEffect(() => {
    async function load() {
      const { data: ev } = await supabase
        .from('events')
        .select('id, name, event_type, revealed, photos_deleted')
        .eq('share_token', token)
        .single()
      if (!ev || !ev.revealed || ev.photos_deleted) { setLoading(false); return }
      setEvent(ev)
      const { data: shots } = await supabase
        .from('shots')
        .select('id, storage_url, mode_name, taken_at, guests(nickname)')
        .eq('event_id', ev.id)
        .eq('revealed', true)
        .order('taken_at', { ascending: true })
      setPhotos(shots || [])
      setLoading(false)
    }
    load()
  }, [token])

  if (loading) return (
    <main style={{ height: '100dvh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <IconFlash size={36} color="#e8ff47" />
    </main>
  )

  if (!event) return (
    <main style={{ height: '100dvh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 24 }}>
      <div>
        <div style={{ fontSize: 16, fontWeight: 600, color: '#555', marginBottom: 8 }}>Gallery not found</div>
        <div style={{ fontSize: 13, color: '#333' }}>This gallery may not exist or hasn't been revealed yet.</div>
      </div>
    </main>
  )

  return (
    <main style={{ minHeight: '100dvh', background: '#0a0a0a' }}>
      {/* Header */}
      <div style={{ paddingTop: 'max(20px, env(safe-area-inset-top))', paddingBottom: 16, paddingLeft: 18, paddingRight: 18, borderBottom: '1px solid #161616', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 30, height: 30, background: '#e8ff47', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <IconFlash size={16} color="#0a0a0a" />
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#f0f0f0' }}>{event.name}</div>
          <div style={{ fontSize: 11, color: '#444' }}>{photos.length} photos · via Flash</div>
        </div>
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 2, padding: 2 }}>
        {photos.map(p => (
          <div key={p.id} onClick={() => setSelected(p)} style={{ aspectRatio: '1', overflow: 'hidden', background: '#111', cursor: 'pointer' }}>
            {p.storage_url && <img src={p.storage_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .2s' }} />}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selected && (
        <div onClick={() => setSelected(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <img src={selected.storage_url} alt="" style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain', borderRadius: 8 }} />
          <div style={{ marginTop: 14, textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: '#888' }}>{(selected.guests as any)?.nickname || 'Guest'} · {selected.mode_name}</div>
          </div>
          <div onClick={() => setSelected(null)} style={{ position: 'absolute', top: 16, right: 16, width: 32, height: 32, background: 'rgba(0,0,0,0.5)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </div>
        </div>
      )}

      {/* Powered by */}
      <div style={{ textAlign: 'center', padding: '24px 0 40px', fontSize: 12, color: '#2a2a2a' }}>
        Captured with <a href="https://flashcam.app" target="_blank" rel="noopener" style={{ color: '#444', textDecoration: 'none', fontWeight: 600 }}>Flash</a>
      </div>
    </main>
  )
}
