import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://flashcam.app'
  const resend = new Resend(process.env.RESEND_API_KEY)
  const headers = {
    'Content-Type': 'application/json',
    'apikey': serviceKey,
    'Authorization': `Bearer ${serviceKey}`,
  }

  const now = new Date().toISOString()
  const results = { deleted: 0, warned7: 0, warned1: 0 }

  // 1. Delete expired photos
  const expiredRes = await fetch(
    `${supabaseUrl}/rest/v1/events?select=id,shots(storage_path)&photos_expire_at=lt.${now}&keep_forever=eq.false&photos_deleted=eq.false&revealed=eq.true`,
    { headers }
  )
  const expired = await expiredRes.json()
  for (const ev of expired || []) {
    const paths = (ev.shots || []).map((s: any) => s.storage_path).filter(Boolean)
    if (paths.length > 0) {
      await fetch(`${supabaseUrl}/storage/v1/object/shots`, {
        method: 'DELETE', headers,
        body: JSON.stringify({ prefixes: paths }),
      })
    }
    await fetch(`${supabaseUrl}/rest/v1/events?id=eq.${ev.id}`, {
      method: 'PATCH', headers: { ...headers, 'Prefer': 'return=minimal' },
      body: JSON.stringify({ photos_deleted: true }),
    })
    results.deleted++
  }

  // 2. 7-day warning
  const d7 = new Date(Date.now() + 7 * 86400000).toISOString()
  const d6 = new Date(Date.now() + 6 * 86400000).toISOString()
  const warn7 = await (await fetch(`${supabaseUrl}/rest/v1/events?select=id,name,host_id,photos_expire_at&photos_expire_at=lt.${d7}&photos_expire_at=gt.${d6}&keep_forever=eq.false&expiry_notified=eq.false&photos_deleted=eq.false`, { headers })).json()
  for (const ev of warn7 || []) {
    const user = await (await fetch(`${supabaseUrl}/auth/v1/admin/users/${ev.host_id}`, { headers })).json()
    if (!user?.email) continue
    const expiry = new Date(ev.photos_expire_at).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
    await resend.emails.send({
      from: 'Flash <noreply@flashcam.app>', to: [user.email],
      subject: `⚡ 7 days left — download your ${ev.name} photos`,
      html: buildReminderEmail(ev.name, expiry, 7, `${APP_URL}/host/${ev.id}/download`),
    })
    await fetch(`${supabaseUrl}/rest/v1/events?id=eq.${ev.id}`, { method: 'PATCH', headers: { ...headers, 'Prefer': 'return=minimal' }, body: JSON.stringify({ expiry_notified: true }) })
    results.warned7++
  }

  // 3. 1-day warning
  const d1 = new Date(Date.now() + 86400000).toISOString()
  const warn1 = await (await fetch(`${supabaseUrl}/rest/v1/events?select=id,name,host_id,photos_expire_at&photos_expire_at=lt.${d1}&photos_expire_at=gt.${now}&keep_forever=eq.false&photos_deleted=eq.false`, { headers })).json()
  for (const ev of warn1 || []) {
    const user = await (await fetch(`${supabaseUrl}/auth/v1/admin/users/${ev.host_id}`, { headers })).json()
    if (!user?.email) continue
    const expiry = new Date(ev.photos_expire_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
    await resend.emails.send({
      from: 'Flash <noreply@flashcam.app>', to: [user.email],
      subject: `🚨 Last day! ${ev.name} photos delete tomorrow`,
      html: buildReminderEmail(ev.name, expiry, 1, `${APP_URL}/host/${ev.id}/download`),
    })
    results.warned1++
  }

  return NextResponse.json(results)
}

function buildReminderEmail(name: string, expiry: string, days: number, url: string) {
  const color = days === 1 ? '#ff4757' : '#ffa502'
  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,sans-serif;"><div style="max-width:560px;margin:0 auto;padding:40px 20px;"><div style="text-align:center;margin-bottom:32px;"><div style="display:inline-block;background:#e8ff47;width:48px;height:48px;border-radius:13px;line-height:48px;font-size:24px;font-weight:900;color:#0a0a0a;">⚡</div><div style="margin-top:10px;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#555;">Flash</div></div><div style="background:#111;border:1px solid ${color}44;border-radius:20px;padding:32px;margin-bottom:16px;"><h1 style="font-size:24px;font-weight:700;color:#f0f0f0;margin:0 0 6px;">${days === 1 ? 'Last day to download!' : `${days} days left`}</h1><p style="font-size:15px;color:#666;margin:0 0 24px;line-height:1.6;"><strong style="color:#ccc;">${name}</strong> photos delete permanently on <strong style="color:${color};">${expiry}</strong>.</p><a href="${url}" style="display:block;background:#e8ff47;color:#0a0a0a;text-decoration:none;text-align:center;border-radius:12px;padding:15px 20px;font-size:15px;font-weight:700;margin-bottom:10px;">⬇ Download Now</a><a href="${url}" style="display:block;background:transparent;color:#e0e0e0;text-decoration:none;text-align:center;border-radius:12px;padding:13px 20px;font-size:13px;font-weight:600;border:1px solid #222;">Keep Forever — $4.99 CAD</a></div><div style="text-align:center;font-size:12px;color:#333;padding-top:16px;">Flash · flashcam.app</div></div></body></html>`
}
