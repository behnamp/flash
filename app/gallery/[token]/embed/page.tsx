'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function EmbedGalleryPage() {
  const { token } = useParams()
  const supabase = createClient()
  const [photos, setPhotos] = useState<any[]>([])
  const [eventName, setEventName] = useState('')
  const [selected, setSelected] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: ev } = await supabase.from('events').select('id, name, revealed').eq('share_token', token).single()
      if (!ev?.revealed) { setLoading(false); return }
      setEventName(ev.name)
      const { data: shots } = await supabase.from('shots').select('id, storage_url, mode_name, guests(nickname)').eq('event_id', ev.id).eq('revealed', true).order('taken_at')
      setPhotos(shots || [])
      setLoading(false)
    }
    load()
  }, [token])

  if (loading) return <div style={{ background: '#0a0a0a', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#444', fontSize: 13 }}>Loading gallery...</div>

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100%', fontFamily: '-apple-system, sans-serif' }}>
      <div style={{ padding: '12px 14px 8px', borderBottom: '1px solid #161616', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#f0f0f0' }}>{eventName}</div>
        <a href="https://flashcam.app" target="_blank" rel="noopener" style={{ fontSize: 11, color: '#444', textDecoration: 'none' }}>⚡ Flash</a>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 2, padding: 2 }}>
        {photos.map(p => (
          <div key={p.id} onClick={() => setSelected(p)} style={{ aspectRatio: '1', overflow: 'hidden', background: '#111', cursor: 'pointer' }}>
            {p.storage_url && <img src={p.storage_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
          </div>
        ))}
      </div>
      {selected && (
        <div onClick={() => setSelected(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <img src={selected.storage_url} alt="" style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain', borderRadius: 6 }} />
          <div style={{ position: 'absolute', top: 12, right: 12, fontSize: 20, color: '#666', cursor: 'pointer' }}>✕</div>
        </div>
      )}
    </div>
  )
}
