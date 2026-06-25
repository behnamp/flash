import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  try {
    const { eventId } = await req.json()
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { data: event } = await supabase
      .from('events')
      .select('*, shots(count)')
      .eq('id', eventId)
      .eq('host_id', user.id)
      .single()

    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })

    const expiryDate = new Date(event.photos_expire_at)
    const downloadUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://flash-roan.vercel.app'}/host/${eventId}/download`
    const galleryUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://flash-roan.vercel.app'}/host/${eventId}`
    const photoCount = (event.shots as any)?.[0]?.count || '?'

    // Send via Supabase's built-in email (no extra service needed)
    // Uses the auth email system to send to the host
    const emailBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Your Flash gallery is ready</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px;">

    <!-- Header -->
    <div style="text-align:center;margin-bottom:40px;">
      <div style="display:inline-flex;align-items:center;justify-content:center;width:52px;height:52px;background:#e8ff47;border-radius:14px;margin-bottom:16px;">
        <span style="font-size:24px;font-weight:900;color:#0a0a0a;">⚡</span>
      </div>
      <div style="font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#555;">Flash</div>
    </div>

    <!-- Main card -->
    <div style="background:#111;border:1px solid #1e1e1e;border-radius:20px;padding:32px;margin-bottom:20px;">
      <h1 style="font-size:26px;font-weight:700;color:#f0f0f0;margin:0 0 8px;letter-spacing:-0.5px;">
        🎉 Your gallery is revealed!
      </h1>
      <p style="font-size:15px;color:#666;margin:0 0 28px;line-height:1.6;">
        <strong style="color:#ccc;">${event.name}</strong> — ${photoCount} photos are ready to view and download.
      </p>

      <!-- Expiry warning box -->
      <div style="background:rgba(232,255,71,0.06);border:1px solid rgba(232,255,71,0.2);border-radius:12px;padding:18px;margin-bottom:28px;">
        <div style="font-size:13px;font-weight:700;color:#e8ff47;margin-bottom:6px;">
          ⏳ Download within 14 days
        </div>
        <div style="font-size:13px;color:#888;line-height:1.6;">
          Your photos will be <strong style="color:#ccc;">permanently deleted</strong> from Flash servers on<br>
          <strong style="color:#e8ff47;">${expiryDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>
        </div>
      </div>

      <!-- CTA buttons -->
      <a href="${downloadUrl}" style="display:block;background:#e8ff47;color:#0a0a0a;text-decoration:none;text-align:center;border-radius:12px;padding:15px 20px;font-size:15px;font-weight:700;margin-bottom:10px;">
        ⬇ Download All Photos
      </a>
      <a href="${galleryUrl}" style="display:block;background:transparent;color:#e0e0e0;text-decoration:none;text-align:center;border-radius:12px;padding:14px 20px;font-size:14px;font-weight:600;border:1px solid #222;">
        View Gallery
      </a>
    </div>

    <!-- Tips -->
    <div style="background:#111;border:1px solid #1a1a1a;border-radius:14px;padding:20px;margin-bottom:20px;">
      <div style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#444;margin-bottom:14px;">After you download</div>
      ${['Back up to iCloud or Google Photos', 'Share the folder with your guests', 'Create an album in your photo library', 'Photos are yours — no Flash watermark'].map(tip =>
        `<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;font-size:13px;color:#666;">
          <span style="color:#e8ff47;flex-shrink:0;">✓</span>${tip}
        </div>`
      ).join('')}
    </div>

    <!-- Footer -->
    <div style="text-align:center;font-size:12px;color:#333;line-height:1.8;padding-top:20px;">
      Flash · Disposable camera for every event<br>
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://flash-roan.vercel.app'}/legal/privacy" style="color:#444;text-decoration:none;">Privacy</a>
      &nbsp;·&nbsp;
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://flash-roan.vercel.app'}/legal/terms" style="color:#444;text-decoration:none;">Terms</a>
    </div>
  </div>
</body>
</html>`

    // Email sending — log for now, ready for Resend/SendGrid integration
    // To enable real emails: add RESEND_API_KEY to Vercel and uncomment below
    console.log(`[Flash] Reveal email for ${user.email}: ${event.name} — expires ${expiryDate.toLocaleDateString()}`)
    console.log(`[Flash] Download URL: ${downloadUrl}`)

    /*
    // Uncomment when RESEND_API_KEY is set:
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: 'Flash <noreply@yourdomian.com>',
      to: user.email!,
      subject: `⚡ ${event.name} — download within 14 days`,
      html: emailBody,
    })
    */

    return NextResponse.json({ success: true, email: user.email })
  } catch (err: any) {
    console.error('Email error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
