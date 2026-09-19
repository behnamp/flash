import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

// UGC moderation endpoint (Apple/Play requirement): a guest can report an
// objectionable photo. We email the admin with a direct link so it can be
// reviewed and removed via the host gallery delete control. The reporter also
// hides the photo on their own device immediately (client-side).
export async function POST(req: NextRequest) {
  try {
    const { shotId, eventId, reason } = await req.json()
    if (!shotId || !eventId) {
      return NextResponse.json({ error: 'Missing shotId or eventId' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://flashcam.app'
    const headers = { 'apikey': serviceKey, 'Authorization': `Bearer ${serviceKey}` }

    // Look up the shot + event so the review email is actionable
    const shotRes = await fetch(
      `${supabaseUrl}/rest/v1/shots?select=id,storage_url,event_id,mode_name&id=eq.${shotId}`,
      { headers }
    )
    const shots = await shotRes.json()
    const shot = Array.isArray(shots) ? shots[0] : null
    if (!shot) return NextResponse.json({ error: 'Photo not found' }, { status: 404 })

    const evRes = await fetch(
      `${supabaseUrl}/rest/v1/events?select=id,name,join_code,host_id&id=eq.${eventId}`,
      { headers }
    )
    const events = await evRes.json()
    const event = Array.isArray(events) ? events[0] : null

    const adminEmail = process.env.ADMIN_EMAIL || 'behnam.parvin.ca@gmail.com'
    const resend = new Resend(process.env.RESEND_API_KEY)

    await resend.emails.send({
      from: 'Flash Moderation <noreply@flashcam.app>',
      to: [adminEmail],
      subject: `🚩 Photo reported — ${event?.name || eventId}`,
      html: `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#0a0a0a;color:#f0f0f0;">
        <h2 style="color:#ffb800;">Photo reported for review</h2>
        <p style="color:#888;">A guest flagged a photo as objectionable. Review and remove it if needed.</p>
        <p><strong>Event:</strong> ${event?.name || '—'} (${event?.join_code || eventId})</p>
        <p><strong>Reason:</strong> ${reason || 'Not specified'}</p>
        <p><strong>Shot ID:</strong> ${shotId}</p>
        <p><a href="${shot.storage_url}" style="color:#ffb800;">View the reported photo</a></p>
        <p><a href="${APP_URL}/host/${eventId}" style="display:inline-block;background:#ffb800;color:#0a0a0a;text-decoration:none;padding:12px 20px;border-radius:10px;font-weight:700;margin-top:8px;">Open host gallery to remove</a></p>
      </div>`,
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Report error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
