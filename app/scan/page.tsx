'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ScanPage() {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [error, setError] = useState('')
  const [scanning, setScanning] = useState(true)
  const [manualCode, setManualCode] = useState('')
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number>()
  const scanningRef = useRef(true)

  useEffect(() => {
    startCamera()
    return () => stopCamera()
  }, [])

  const stopCamera = () => {
    scanningRef.current = false
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    streamRef.current?.getTracks().forEach(t => { try { t.stop() } catch {} })
    streamRef.current = null
  }

  const startCamera = async () => {
    scanningRef.current = true
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        videoRef.current.onloadedmetadata = () => scanLoop()
      }
    } catch {
      setError('Camera access denied')
    }
  }

  const scanLoop = async () => {
    if (!scanningRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(scanLoop)
      return
    }
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d')!.drawImage(video, 0, 0)

    if ('BarcodeDetector' in window) {
      try {
        const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] })
        const codes = await detector.detect(canvas)
        if (codes.length > 0) { handleResult(codes[0].rawValue); return }
      } catch {}
    }
    rafRef.current = requestAnimationFrame(scanLoop)
  }

  const handleResult = (value: string) => {
    scanningRef.current = false
    stopCamera()
    const match = value.match(/\/join\/([A-Z0-9]{8})/i)
    const code = match ? match[1].toUpperCase() : value.replace(/[^A-Z0-9]/gi, '').slice(0, 8).toUpperCase()
    if (code.length === 8) {
      router.push(`/join/${code}`)
    } else {
      setError('Invalid QR code — scan a Flash event QR')
      setTimeout(() => { setError(''); setScanning(true); startCamera() }, 2500)
    }
  }

  const handleManual = (val: string) => {
    const clean = val.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 8)
    setManualCode(clean)
    if (clean.length === 8) { stopCamera(); router.push(`/join/${clean}`) }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000', display: 'flex', flexDirection: 'column', fontFamily: "'Space Grotesk', sans-serif" }}>
      {/* Header */}
      <div style={{ paddingTop: 'max(14px, env(safe-area-inset-top))', paddingBottom: 14, paddingLeft: 16, paddingRight: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, zIndex: 20 }}>
        <button onClick={() => { stopCamera(); router.back() }}
          style={{ width: 38, height: 38, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 12, color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
        <div style={{ fontSize: 15, fontWeight: 700, color: 'white' }}>Scan QR Code</div>
        <div style={{ width: 38 }} />
      </div>

      {/* Camera */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <video ref={videoRef} autoPlay playsInline muted style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {/* Dark overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)' }} />

        {/* Scan frame */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'relative', width: 220, height: 220 }}>
            {/* Clear window */}
            <div style={{ position: 'absolute', inset: 0, background: 'transparent', boxShadow: '0 0 0 1000px rgba(0,0,0,0.45)', borderRadius: 16 }} />
            {/* Corners */}
            {([['top','left'],['top','right'],['bottom','left'],['bottom','right']] as const).map(([v,h],i) => (
              <div key={i} style={{ position: 'absolute', width: 26, height: 26, [v]: -1, [h]: -1,
                borderTop: v === 'top' ? '3px solid #e8ff47' : 'none',
                borderBottom: v === 'bottom' ? '3px solid #e8ff47' : 'none',
                borderLeft: h === 'left' ? '3px solid #e8ff47' : 'none',
                borderRight: h === 'right' ? '3px solid #e8ff47' : 'none',
                borderRadius: h === 'left' && v === 'top' ? '4px 0 0 0' : h === 'right' && v === 'top' ? '0 4px 0 0' : h === 'left' ? '0 0 0 4px' : '0 0 4px 0'
              }} />
            ))}
            {/* Scan line */}
            <div style={{ position: 'absolute', left: 8, right: 8, height: 2, background: '#e8ff47', borderRadius: 1, animation: 'scan 2s ease-in-out infinite', opacity: 0.9 }} />
          </div>
        </div>

        {/* Hint */}
        <div style={{ position: 'absolute', bottom: 24, left: 0, right: 0, textAlign: 'center' }}>
          {error
            ? <div style={{ background: 'rgba(255,71,87,0.9)', borderRadius: 20, padding: '8px 20px', display: 'inline-block', fontSize: 13, fontWeight: 600, color: 'white' }}>{error}</div>
            : <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)' }}>Point at a Flash event QR code</div>
          }
        </div>
      </div>

      {/* Manual entry */}
      <div style={{ padding: '16px 20px', background: '#0a0a0a', borderTop: '1px solid #161616', flexShrink: 0 }}>
        <div style={{ fontSize: 11, color: '#333', textAlign: 'center', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 700 }}>Or enter join code</div>
        <input type="text" placeholder="e.g. AB12CD34" value={manualCode}
          onChange={e => handleManual(e.target.value)} maxLength={8}
          style={{ width: '100%', background: '#111', border: '1px solid #222', borderRadius: 12, padding: '13px 16px', color: '#f0f0f0', fontSize: 18, fontFamily: 'Space Mono, monospace', letterSpacing: 4, textAlign: 'center', textTransform: 'uppercase', outline: 'none', boxSizing: 'border-box' }} />
      </div>

      {/* Download banner */}
      <div style={{ background: '#e8ff47', padding: '12px 20px', paddingBottom: 'max(12px, env(safe-area-inset-bottom))', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#0a0a0a' }}>Get the Flash app</div>
          <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.45)' }}>Better camera · install free</div>
        </div>
        <a href="https://apps.apple.com" target="_blank" style={{ background: '#0a0a0a', color: '#e8ff47', borderRadius: 10, padding: '9px 16px', fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>
          Download ↗
        </a>
      </div>

      <style>{`@keyframes scan { 0%{top:8px} 50%{top:calc(100% - 10px)} 100%{top:8px} }`}</style>
    </div>
  )
}
