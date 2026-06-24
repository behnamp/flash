'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { IconFlash, IconScan, IconArrowRight } from '@/components/icons'

export default function JoinPage() {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleJoin = () => {
    const clean = code.trim().toUpperCase().replace(/[^A-Z0-9]/g, '')
    if (clean.length < 6) { setError('Please enter a valid event code'); return }
    router.push(`/join/${clean}`)
  }

  return (
    <main style={{ minHeight:'100vh', background:'#0a0a0a', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'40px 22px' }}>
      <div style={{ marginBottom:24, display:'flex', justifyContent:'center' }}>
        <div style={{ width:64, height:64, background:'#111', border:'1px solid #1e1e1e', borderRadius:18, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <IconScan size={28} color="#666" />
        </div>
      </div>
      <h1 style={{ fontSize:24, fontWeight:700, letterSpacing:-0.6, marginBottom:8 }}>Join an Event</h1>
      <p style={{ fontSize:14, color:'#555', marginBottom:32, textAlign:'center', lineHeight:1.5 }}>
        Enter the code from your host<br />or scan their QR code
      </p>
      <div style={{ width:'100%', maxWidth:310 }}>
        <input
          value={code} onChange={e => { setCode(e.target.value.toUpperCase()); setError('') }}
          placeholder="EVENT CODE" maxLength={10}
          onKeyDown={e => e.key === 'Enter' && handleJoin()}
          style={{ background:'#111', border:`1px solid ${error ? '#ff4757' : '#1e1e1e'}`, borderRadius:12, padding:'16px', color:'#f0f0f0', fontSize:20, width:'100%', outline:'none', textAlign:'center', fontFamily:'Space Mono,monospace', letterSpacing:4, marginBottom:10 }}
        />
        {error && <p style={{ color:'#ff4757', fontSize:12, marginBottom:10, textAlign:'center' }}>{error}</p>}
        <button onClick={handleJoin} style={{ background:'#e8ff47', color:'#0a0a0a', border:'none', borderRadius:12, padding:'14px 20px', fontSize:14, fontWeight:700, cursor:'pointer', width:'100%', fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
          Join Event <IconArrowRight size={18} color="#0a0a0a" weight="bold" />
        </button>
      </div>
    </main>
  )
}
