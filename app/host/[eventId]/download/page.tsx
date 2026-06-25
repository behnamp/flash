'use client'
import { useState, useEffect, Suspense } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { IconFlash, IconBack, IconSave, IconWarning, IconCheck, IconShutter, IconTimer, IconShare, IconCopy, IconFilm } from '@/components/icons'

function DownloadPageInner() {
  const { eventId } = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const keptParam = searchParams.get('kept')
  const supabase = createClient()

  const [event, setEvent] = useState<any>(null)
  const [photos, setPhotos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [downloaded, setDownloaded] = useState(0)
  const [daysLeft, setDaysLeft] = useState<number | null>(null)
  const [keepLoading, setKeepLoading] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [toast, setToast] = useState('')
  const [showEmbed, setShowEmbed] = useState(false)

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2500) }

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
      const revealed = (ev.shots || []).filter((s: any) => s.revealed !== false && s.storage_url)
      setPhotos(revealed)
      setLoading(false)

      // Verify keep forever if coming from Stripe success
      if (keptParam === '1') {
        const sessionId = new URLSearchParams(window.location.search).get('session_id')
        if (sessionId) {
          setVerifying(true)
          await fetch('/api/stripe/verify-keep-forever', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId }),
          })
          setVerifying(false)
          // Reload event
          const { data: fresh } = await supabase.from('events').select('*').eq('id', eventId).single()
          if (fresh) { setEvent(fresh); setDaysLeft(null) }
        }
      }
    }
    load()
  }, [eventId])

  const downloadAll = async () => {
    if (!photos.length) return
    setDownloading(true); setDownloaded(0)
    for (let i = 0; i < photos.length; i++) {
      const p = photos[i]
      try {
        const res = await fetch(p.storage_url)
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `flash-${event?.name?.replace(/\s+/g, '-')}-${i + 1}.jpg`
        document.body.appendChild(a); a.click(); document.body.removeChild(a)
        URL.revokeObjectURL(url)
        setDownloaded(i + 1)
        await new Promise(r => setTimeout(r, 300))
      } catch (e) { console.error(e) }
    }
    setDownloading(false)
  }

  const handleKeepForever = async () => {
    setKeepLoading(true)
    try {
      const res = await fetch('/api/stripe/keep-forever', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      window.location.href = data.url
    } catch (e: any) {
      showToast('Error: ' + e.message)
      setKeepLoading(false)
    }
  }

  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://flashcam.app'}/gallery/${event?.share_token}`
  const embedCode = `<iframe src="${shareUrl}/embed" width="100%" height="600" frameborder="0" allow="camera" style="border-radius:12px"></iframe>`

  const handleShareInstagram = () => {
    // Instagram doesn't support direct URL sharing — open download then guide user
    showToast('Download photos first, then share to Instagram')
  }

  const handleSharePinterest = (photoUrl: string) => {
    const url = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}&media=${encodeURIComponent(photoUrl)}&description=${encodeURIComponent(`Photos from ${event?.name} — captured with Flash`)}`
    window.open(url, '_blank')
  }

  const urgencyColor = event?.keep_forever ? '#2ed573'
    : daysLeft === null ? '#2ed573'
    : daysLeft <= 2 ? '#ff4757'
    : daysLeft <= 5 ? '#ffa502'
    : '#e8ff47'

  if (loading) return (
    <main style={{ height: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <IconFlash size={36} color="#e8ff47" />
    </main>
  )

  return (
    <main style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderBottom: '1px solid #161616', background: 'rgba(10,10,10,0.96)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={() => router.push(`/host/${eventId}`)} style={{ width: 36, height: 36, background: '#161616', border: 'none', borderRadius: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <IconBack size={17} />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>{event?.name}</div>
          <div style={{ fontSize: 10, color: '#444', textTransform: 'uppercase', letterSpacing: 1 }}>Download & Share</div>
        </div>
        <div style={{ width: 28, height: 28, background: '#e8ff47', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <IconFlash size={14} color="#0a0a0a" />
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '22px 18px 60px' }}>

        {/* Verifying state */}
        {verifying && (
          <div style={{ background: '#111', border: '1px solid #222', borderRadius: 14, padding: '16px', marginBottom: 16, textAlign: 'center', fontSize: 13, color: '#666' }}>
            Confirming payment...
          </div>
        )}

        {/* Status banner */}
        {event?.keep_forever ? (
          <div style={{ background: 'rgba(46,213,115,0.07)', border: '1px solid rgba(46,213,115,0.2)', borderRadius: 14, padding: '16px 18px', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, background: 'rgba(46,213,115,0.12)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <IconCheck size={18} color="#2ed573" weight="bold" />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#2ed573' }}>Stored Forever</div>
              <div style={{ fontSize: 12, color: '#555', marginTop: 2 }}>Your photos will never be deleted.</div>
            </div>
          </div>
        ) : daysLeft !== null && daysLeft > 0 ? (
          <div style={{ background: `rgba(${daysLeft <= 2 ? '255,71,87' : daysLeft <= 5 ? '255,165,2' : '232,255,71'},0.06)`, border: `1px solid ${urgencyColor}33`, borderRadius: 14, padding: '16px 18px', marginBottom: 18 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: urgencyColor, marginBottom: 4 }}>
              {daysLeft === 1 ? '⚠ Last day to download!' : `${daysLeft} days until photos are deleted`}
            </div>
            <div style={{ fontSize: 12, color: '#555', lineHeight: 1.6, marginBottom: 14 }}>
              Photos delete permanently on {new Date(event.photos_expire_at).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </div>
            {/* Keep Forever CTA */}
            <button onClick={handleKeepForever} disabled={keepLoading} style={{ width: '100%', background: '#1a1a1a', border: '1px solid #e8ff47', borderRadius: 10, padding: '12px 16px', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#e8ff47' }}>Keep Forever — $4.99 CAD</div>
                <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>Never expire · Unlimited downloads</div>
              </div>
              <div style={{ fontSize: 12, color: '#e8ff47', fontWeight: 700 }}>{keepLoading ? '...' : '→'}</div>
            </button>
          </div>
        ) : daysLeft !== null && daysLeft <= 0 ? (
          <div style={{ background: 'rgba(255,71,87,0.07)', border: '1px solid rgba(255,71,87,0.2)', borderRadius: 14, padding: '16px 18px', marginBottom: 18 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#ff4757', marginBottom: 4 }}>Photos expired</div>
            <div style={{ fontSize: 12, color: '#555' }}>These photos have been permanently deleted.</div>
          </div>
        ) : null}

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'Photos', value: photos.length, Icon: IconShutter },
            { label: event?.keep_forever ? 'Forever' : 'Days Left', value: event?.keep_forever ? '∞' : (daysLeft !== null ? Math.max(0, daysLeft) : '∞'), Icon: IconTimer },
          ].map(({ label, value, Icon }) => (
            <div key={label} style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 12, padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
                <Icon size={14} color="#444" />
                <span style={{ fontSize: 9, color: '#444', textTransform: 'uppercase', letterSpacing: 1 }}>{label}</span>
              </div>
              <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 28, fontWeight: 700, color: '#f0f0f0' }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Download button */}
        {photos.length > 0 && (daysLeft === null || daysLeft > 0 || event?.keep_forever) && (
          <>
            <button onClick={downloadAll} disabled={downloading} style={{ width: '100%', background: downloading ? '#161616' : '#e8ff47', color: downloading ? '#333' : '#0a0a0a', border: 'none', borderRadius: 13, padding: '15px 20px', fontSize: 15, fontWeight: 700, cursor: downloading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 10, transition: 'all .15s' }}>
              <IconSave size={18} color={downloading ? '#333' : '#0a0a0a'} weight="bold" />
              {downloading ? `Downloading ${downloaded} / ${photos.length}...` : `Download All ${photos.length} Photos`}
            </button>
            {downloading && (
              <div style={{ background: '#161616', borderRadius: 8, height: 5, marginBottom: 14, overflow: 'hidden' }}>
                <div style={{ height: '100%', background: '#e8ff47', width: `${(downloaded / photos.length) * 100}%`, transition: 'width .3s', borderRadius: 8 }} />
              </div>
            )}
            {!downloading && downloaded > 0 && (
              <div style={{ background: 'rgba(46,213,115,0.08)', border: '1px solid rgba(46,213,115,0.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
                <IconCheck size={16} color="#2ed573" weight="bold" />
                <span style={{ fontSize: 13, color: '#2ed573', fontWeight: 600 }}>All {downloaded} photos saved!</span>
              </div>
            )}
          </>
        )}

        {/* Share section */}
        <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 14, padding: '18px', marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#444', marginBottom: 14 }}>Share Gallery</div>

          {/* Share link */}
          <div style={{ background: '#0e0e0e', border: '1px solid #1a1a1a', borderRadius: 10, padding: '11px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, cursor: 'pointer' }}
            onClick={() => { navigator.clipboard?.writeText(shareUrl); showToast('Gallery link copied!') }}>
            <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, color: '#555', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{shareUrl}</span>
            <IconCopy size={14} color="#e8ff47" style={{ flexShrink: 0, marginLeft: 8 }} />
          </div>

          {/* Social share buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
            <button onClick={handleShareInstagram} style={{ background: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)', border: 'none', borderRadius: 10, padding: '11px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="white" strokeWidth="2"/><circle cx="12" cy="12" r="5" fill="none" stroke="white" strokeWidth="2"/><circle cx="17.5" cy="6.5" r="1.5" fill="white"/></svg>
              Instagram
            </button>
            <button onClick={() => photos[0]?.storage_url && handleSharePinterest(photos[0].storage_url)} style={{ background: '#E60023', border: 'none', borderRadius: 10, padding: '11px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12c0 4.24 2.65 7.87 6.39 9.29-.09-.78-.17-1.98.04-2.83.18-.77 1.22-5.17 1.22-5.17s-.31-.62-.31-1.54c0-1.45.84-2.53 1.88-2.53.89 0 1.32.67 1.32 1.47 0 .89-.57 2.24-.87 3.48-.25 1.04.52 1.88 1.54 1.88 1.84 0 3.08-2.37 3.08-5.17 0-2.14-1.45-3.64-3.52-3.64-2.39 0-3.8 1.79-3.8 3.64 0 .72.28 1.49.62 1.91.07.08.08.15.06.24-.06.26-.21.83-.23.95-.04.15-.13.18-.29.11-1.08-.5-1.76-2.1-1.76-3.38 0-2.75 2-5.27 5.76-5.27 3.02 0 5.37 2.15 5.37 5.02 0 2.99-1.88 5.4-4.5 5.4-.88 0-1.71-.46-1.99-1l-.54 2.02c-.2.75-.73 1.69-1.08 2.26.81.25 1.67.39 2.56.39 5.52 0 10-4.48 10-10S17.52 2 12 2z"/></svg>
              Pinterest
            </button>
          </div>

          {/* Embed option */}
          <button onClick={() => setShowEmbed(!showEmbed)} style={{ width: '100%', background: 'transparent', border: '1px solid #1e1e1e', borderRadius: 10, padding: '10px 14px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 600, color: '#555', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Embed on your website</span>
            <span style={{ color: '#444' }}>{showEmbed ? '↑' : '↓'}</span>
          </button>

          {showEmbed && (
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 11, color: '#555', marginBottom: 8, lineHeight: 1.6 }}>
                Add this code to your website or client's page to show the live gallery.
              </div>
              <div style={{ background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: 9, padding: '12px', cursor: 'pointer', position: 'relative' }}
                onClick={() => { navigator.clipboard?.writeText(embedCode); showToast('Embed code copied!') }}>
                <pre style={{ fontSize: 10, color: '#666', fontFamily: 'Space Mono, monospace', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all', lineHeight: 1.5 }}>{embedCode}</pre>
                <div style={{ position: 'absolute', top: 8, right: 8 }}>
                  <IconCopy size={12} color="#444" />
                </div>
              </div>
              <div style={{ fontSize: 11, color: '#2a2a2a', marginTop: 6 }}>Tap to copy · Works on any website</div>
            </div>
          )}
        </div>

        {/* Photo grid */}
        {photos.length > 0 && (
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#333', marginBottom: 10 }}>Preview</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 3, borderRadius: 12, overflow: 'hidden' }}>
              {photos.slice(0, 9).map((p, i) => (
                <div key={p.id} style={{ aspectRatio: '1', overflow: 'hidden', background: '#111', position: 'relative' }}>
                  {p.storage_url && <img src={p.storage_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                  {i === 8 && photos.length > 9 && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: 'white' }}>+{photos.length - 9}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Expiry notice */}
        {!event?.keep_forever && (
          <div style={{ marginTop: 18, background: '#111', border: '1px solid #1a1a1a', borderRadius: 12, padding: '14px 16px', fontSize: 12, color: '#444', lineHeight: 1.7 }}>
            Photos are stored for 14 days after reveal, then permanently deleted. Upgrade to Keep Forever ($4.99) to never lose them.
          </div>
        )}
      </div>

      {/* Toast */}
      <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: `translateX(-50%) translateY(${toast ? 0 : 12}px)`, background: '#161616', border: '1px solid #222', borderRadius: 24, padding: '11px 20px', fontSize: 13, fontWeight: 600, color: '#f0f0f0', zIndex: 999, opacity: toast ? 1 : 0, transition: 'all .25s', pointerEvents: 'none', whiteSpace: 'nowrap', boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}>
        {toast}
      </div>
    </main>
  )
}

export default function DownloadPage() {
  return <Suspense><DownloadPageInner /></Suspense>
}
