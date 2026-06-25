'use client'
import Link from 'next/link'
import { IconFlash, IconShutter, IconFilm, IconGuests, IconGlobe } from '@/components/icons'

export default function Home() {
  return (
    <main style={{ minHeight:'100vh', background:'#0a0a0a', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'44px 22px', textAlign:'center' }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:52 }}>
        <div style={{ width:46, height:46, background:'#e8ff47', borderRadius:13, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <IconFlash size={24} color="#0a0a0a" />
        </div>
        <span style={{ fontFamily:'Space Mono,monospace', fontSize:24, fontWeight:700, letterSpacing:-0.5 }}>Flash</span>
      </div>

      <div style={{ fontSize:10, fontWeight:700, letterSpacing:3, textTransform:'uppercase', color:'#444', marginBottom:18 }}>
        Disposable camera · Any language · Any device
      </div>

      <h1 style={{ fontSize:'clamp(30px,7vw,52px)', fontWeight:700, letterSpacing:-2, lineHeight:1.05, marginBottom:18 }}>
        Every angle<br />of every <span style={{ color:'#e8ff47' }}>moment</span>
      </h1>

      <p style={{ fontSize:15, color:'#555', lineHeight:1.65, maxWidth:290, marginBottom:44 }}>
        Give everyone a camera. Set the rules. Reveal it all together — in your language, on any phone.
      </p>

      <div style={{ display:'flex', flexDirection:'column', gap:10, width:'100%', maxWidth:310 }}>
        <Link href="/create" style={{ background:'#e8ff47', color:'#0a0a0a', borderRadius:14, padding:'15px 20px', fontSize:14, fontWeight:700, textDecoration:'none', display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
          <IconFlash size={18} color="#0a0a0a" />
          Create an Event
        </Link>
        <Link href="/join" style={{ background:'transparent', color:'#f0f0f0', border:'1px solid #222', borderRadius:14, padding:'15px 20px', fontSize:14, fontWeight:700, textDecoration:'none', display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
          <IconShutter size={18} color="white" />
          Join as Guest
        </Link>
        <Link href="/pricing" style={{ color:'#444', borderRadius:14, padding:'10px 20px', fontSize:13, textDecoration:'none', display:'block', textAlign:'center' }}>
          View Plans & Pricing
        </Link>
      </div>

      <div style={{ marginTop: 32, display:'flex', gap:20, justifyContent:'center' }}>
        <Link href="/legal/privacy" style={{ fontSize:11, color:'#2a2a2a', textDecoration:'none' }}>Privacy Policy</Link>
        <Link href="/legal/terms" style={{ fontSize:11, color:'#2a2a2a', textDecoration:'none' }}>Terms of Service</Link>
      </div>

      <div style={{ display:'flex', gap:0, marginTop:52, paddingTop:26, borderTop:'1px solid #161616', width:'100%', maxWidth:310 }}>
        {[
          { Icon: IconGlobe, n:'20+', l:'Languages' },
          { Icon: IconFilm, n:'29', l:'Modes' },
          { Icon: IconShutter, n:'5', l:'Reveals' },
        ].map(({ Icon, n, l }) => (
          <div key={l} style={{ flex:1, textAlign:'center' }}>
            <div style={{ display:'flex', justifyContent:'center', marginBottom:6 }}><Icon size={18} color="#333" /></div>
            <div style={{ fontFamily:'Space Mono,monospace', fontSize:20, fontWeight:700, color:'#e8ff47' }}>{n}</div>
            <div style={{ fontSize:10, color:'#333', textTransform:'uppercase', letterSpacing:1, marginTop:2 }}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 28, display:'flex', gap:24, justifyContent:'center' }}>
        <Link href="/legal/privacy" style={{ fontSize:11, color:'#2a2a2a', textDecoration:'none' }}>Privacy Policy</Link>
        <Link href="/legal/terms" style={{ fontSize:11, color:'#2a2a2a', textDecoration:'none' }}>Terms of Service</Link>
      </div>
    </main>
  )
}
