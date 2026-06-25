'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { IconFlash, IconBack, IconSave, IconWarning, IconCheck, IconShutter, IconTimer } from '@/components/icons'

export default function DownloadGalleryPage() {
  const { eventId } = useParams()
  const router = useRouter()
  const supabase = createClient()

  const [event, setEvent] = useState<any>(null)
  const [photos, setPhotos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [downloaded, setDownloaded] = useState(0)
  const [daysLeft, setDaysLeft] = useState<number | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      const { data: ev } = await supabase
        .from('events')
        .select('*, shots(id, storage_url, storage_path, mode_name, taken_at, guests(nickname))')
        .eq('id', eventId)
        .single()

      if (!ev) { router.push('/host'); return }
      setEvent(ev)

      if (ev.photos_expire_at) {
        const days = Math.ceil((new Date(ev.photos_expire_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        setDaysLeft(days)
      }

      const revealedShots = (ev.shots || []).filter((s: any) => s.revealed !== false && s.storage_url)
      setPhotos(revealedShots)
      setLoading(false)
    }
    load()
  }, [eventId])

  const downloadAll = async () => {
    if (!photos.length) return
    setDownloading(true)
    setDownloaded(0)

    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i]
      try {
        const res = await fetch(photo.storage_url)
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        const guestName = photo.guests?.nickname || 'guest'
        a.href = url
        a.download = `flash-${event.name.replace(/\s+/g, '-')}-${guestName}-${i + 1}.jpg`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        setDownloaded(i + 1)
        // Small delay between downloads so browser doesn't block
        await new Promise(r => setTimeout(r, 300))
      } catch (e) {
        console.error('Failed to download photo', i, e)
      }
    }
    setDownloading(false)
  }

  const urgencyColor = daysLeft !== null
    ? daysLeft <= 2 ? '#ff4757'
    : daysLeft <= 5 ? '#ffa502'
    : '#e8ff47'
    : '#e8ff47'

  if (loading) return (
    <main style={{ height: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="flash-loading"><IconFlash size={40} /></div>
    </main>
  )

  return (
    <main style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderBottom: '1px solid #161616', background: 'rgba(10,10,10,0.96)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={() => router.push(`/host/${eventId}`)} style={{ width: 38, height: 38, background: '#161616', border: 'none', borderRadius: 12, color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <IconBack size={18} />
        </button>
        <span style={{ fontSize: 15, fontWeight: 600, flex: 1 }}>Download Gallery</span>
        <div style={{ width: 28, height: 28, background: '#e8ff47', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <IconFlash size={14} color="#0a0a0a" />
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 18px 48px' }}>
        {/* Event name */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, color: '#444', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>Event</div>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.5 }}>{event?.name}</div>
        </div>

        {/* Expiry warning */}
        {daysLeft !== null && (
          <div style={{ background: `rgba(${urgencyColor === '#ff4757' ? '255,71,87' : urgencyColor === '#ffa502' ? '255,165,2' : '232,255,71'},0.07)`, border: `1px solid ${urgencyColor}33`, borderRadius: 14, padding: '16px 18px', marginBottom: 20, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <div style={{ width: 38, height: 38, background: `${urgencyColor}18`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {daysLeft <= 3 ? <IconWarning size={20} color={urgencyColor} /> : <IconTimer size={20} color={urgencyColor} />}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: urgencyColor, marginBottom: 4 }}>
                {daysLeft <= 0 ? 'Photos expired' : daysLeft === 1 ? 'Last day to download!' : `${daysLeft} days left to download`}
              </div>
              <div style={{ fontSize: 12, color: '#555', lineHeight: 1.6 }}>
                {daysLeft <= 0
                  ? 'These photos have been permanently deleted from our servers.'
                  : `Photos will be permanently deleted from Flash servers on ${new Date(event.photos_expire_at).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}. Download now to keep them forever.`
                }
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
          {[
            { label: 'Total photos', value: photos.length, Icon: IconShutter },
            { label: 'Days remaining', value: daysLeft !== null ? Math.max(0, daysLeft) : '—', Icon: IconTimer },
          ].map(({ label, value, Icon }) => (
            <div key={label} style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 12, padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
                <Icon size={15} color="#444" />
                <span style={{ fontSize: 10, color: '#444', textTransform: 'uppercase', letterSpacing: 1 }}>{label}</span>
              </div>
              <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 28, fontWeight: 700, color: '#e8ff47' }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Download button */}
        {photos.length > 0 && daysLeft !== null && daysLeft > 0 && (
          <button onClick={downloadAll} disabled={downloading} style={{ width: '100%', background: downloading ? '#161616' : '#e8ff47', color: downloading ? '#333' : '#0a0a0a', border: 'none', borderRadius: 14, padding: '16px 20px', fontSize: 15, fontWeight: 700, cursor: downloading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 14, transition: 'all .15s' }}>
            <IconSave size={20} color={downloading ? '#333' : '#0a0a0a'} weight="bold" />
            {downloading ? `Downloading ${downloaded} / ${photos.length}...` : `Download All ${photos.length} Photos`}
          </button>
        )}

        {/* Progress bar when downloading */}
        {downloading && (
          <div style={{ background: '#161616', borderRadius: 8, height: 6, marginBottom: 20, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: '#e8ff47', width: `${(downloaded / photos.length) * 100}%`, transition: 'width .3s', borderRadius: 8 }} />
          </div>
        )}

        {/* Download complete */}
        {!downloading && downloaded > 0 && (
          <div style={{ background: 'rgba(46,213,115,0.08)', border: '1px solid rgba(46,213,115,0.2)', borderRadius: 12, padding: '14px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
            <IconCheck size={18} color="#2ed573" weight="bold" />
            <span style={{ fontSize: 13, color: '#2ed573', fontWeight: 600 }}>All {downloaded} photos saved to your device</span>
          </div>
        )}

        {/* Photo grid preview */}
        {photos.length > 0 && (
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#333', marginBottom: 12 }}>Preview</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 3, borderRadius: 12, overflow: 'hidden' }}>
              {photos.slice(0, 9).map((p, i) => (
                <div key={p.id} style={{ aspectRatio: '1', overflow: 'hidden', background: '#111', position: 'relative' }}>
                  {p.storage_url && <img src={p.storage_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                  {i === 8 && photos.length > 9 && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: 'white' }}>
                      +{photos.length - 9}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Expired state */}
        {daysLeft !== null && daysLeft <= 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#333' }}>
            <IconWarning size={40} color="#333" style={{ margin: '0 auto 12px', display: 'block' }} />
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Photos permanently deleted</div>
            <div style={{ fontSize: 13, color: '#444' }}>These photos were deleted 14 days after the gallery was revealed.</div>
          </div>
        )}

        {/* Notice */}
        <div style={{ marginTop: 24, background: '#111', border: '1px solid #1a1a1a', borderRadius: 12, padding: '14px 16px', fontSize: 12, color: '#444', lineHeight: 1.7 }}>
          <strong style={{ color: '#666', display: 'block', marginBottom: 4 }}>Important</strong>
          Photos are stored on Flash servers for 14 days after reveal, then permanently deleted. We cannot recover deleted photos. Download your gallery now and back up to iCloud, Google Photos, or your computer.
        </div>
      </div>
    </main>
  )
}
