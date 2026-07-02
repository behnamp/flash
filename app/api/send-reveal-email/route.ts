import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Resend } from 'resend'

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
      .select('id, name, photos_expire_at, join_code')
      .eq('id', eventId)
      .eq('host_id', user.id)
      .single()

    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })

    const { count: photoCount } = await supabase
      .from('shots')
      .select('id', { count: 'exact', head: true })
      .eq('event_id', eventId)
      .eq('revealed', true)

    const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://flashcam.app'
    const downloadUrl = `${APP_URL}/host/${eventId}/download`
    const galleryUrl = `${APP_URL}/host/${eventId}`
    const expiryDate = new Date(event.photos_expire_at)
    const expiryFormatted = expiryDate.toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    })

    const resend = new Resend(process.env.RESEND_API_KEY)

    const { data, error } = await resend.emails.send({
      from: 'Flash <noreply@flashcam.app>',
      to: [user.email!],
      subject: `⚡ ${event.name} — gallery revealed! Download within 14 days`,
      html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px;">

    <!-- Logo -->
    <div style="text-align:center;margin-bottom:36px;">
      <div style="display:inline-block;background:#ffb800;width:52px;height:52px;border-radius:14px;line-height:52px;font-size:26px;font-weight:900;color:#0a0a0a;">⚡</div>
      <div style="margin-top:10px;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#555;">Flash</div>
    </div>

    <!-- Main card -->
    <div style="background:#111;border:1px solid #1e1e1e;border-radius:20px;padding:32px;margin-bottom:16px;">
      <h1 style="font-size:26px;font-weight:700;color:#f0f0f0;margin:0 0 6px;letter-spacing:-0.5px;">Gallery revealed! 🎉</h1>
      <p style="font-size:15px;color:#666;margin:0 0 24px;line-height:1.6;">
        <strong style="color:#ccc;">${event.name}</strong> — ${photoCount ?? 0} photos are ready to view and download.
      </p>

      <!-- Expiry warning -->
      <div style="background:rgba(255,184,0,0.06);border:1px solid rgba(255,184,0,0.2);border-radius:12px;padding:18px;margin-bottom:24px;">
        <div style="font-size:13px;font-weight:700;color:#ffb800;margin-bottom:6px;">⏳ Download within 14 days</div>
        <div style="font-size:13px;color:#888;line-height:1.6;">
          Your photos will be <strong style="color:#ccc;">permanently deleted</strong> from Flash servers on<br>
          <strong style="color:#ffb800;">${expiryFormatted}</strong>
        </div>
      </div>

      <!-- CTA buttons -->
      <a href="${downloadUrl}" style="display:block;background:#ffb800;color:#0a0a0a;text-decoration:none;text-align:center;border-radius:12px;padding:15px 20px;font-size:15px;font-weight:700;margin-bottom:10px;">
        ⬇ Download All Photos
      </a>
      <a href="${galleryUrl}" style="display:block;background:transparent;color:#e0e0e0;text-decoration:none;text-align:center;border-radius:12px;padding:13px 20px;font-size:14px;font-weight:600;border:1px solid #222;">
        View Gallery Dashboard
      </a>
    </div>

    <!-- Tips -->
    <div style="background:#111;border:1px solid #1a1a1a;border-radius:14px;padding:20px;margin-bottom:16px;">
      <div style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#444;margin-bottom:14px;">After you download</div>
      ${[
        'Back up to iCloud or Google Photos',
        'Share the folder link with your guests',
        'Photos are yours — no Flash watermark',
        'Create a highlight album or slideshow',
      ].map(tip => `
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:9px;font-size:13px;color:#666;">
        <span style="color:#ffb800;flex-shrink:0;font-weight:700;">✓</span>${tip}
      </div>`).join('')}
    </div>

    <!-- Footer -->
    <div style="text-align:center;font-size:12px;color:#333;line-height:1.9;padding-top:16px;">
      Flash · Disposable camera for every event<br>
      <a href="${APP_URL}/legal/privacy" style="color:#444;text-decoration:none;">Privacy</a>
      &nbsp;·&nbsp;
      <a href="${APP_URL}/legal/terms" style="color:#444;text-decoration:none;">Terms</a>
    </div>

  </div>
</body>
</html>`,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log(`[Flash] Reveal email sent to ${user.email} for event ${event.name} — id: ${data?.id}`)
    return NextResponse.json({ success: true, emailId: data?.id })
  } catch (err: any) {
    console.error('Email error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
