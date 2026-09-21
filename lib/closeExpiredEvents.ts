import { Resend } from 'resend'
import { eventEndsAt, isPastEnd } from './eventLogic'

/**
 * Close every live event whose end time has passed.
 *
 * "Close" = run the same reveal_event() the host's Reveal button runs:
 * gallery revealed, is_active=false, 14-day photo expiry started (skipped
 * for Keep Forever). Revealing on close guarantees no event ever ends with
 * its photos locked away, and delivers the "Morning After" reveal.
 *
 * Idempotent: a closed event is no longer is_active, so it is never touched
 * twice. Safe to call from a cron job and from page loads.
 *
 * Hosts are emailed only for events that ended in the last 48 hours, so the
 * one-time backlog of old test events doesn't flood inboxes.
 */
export async function closeExpiredEvents(opts: { email?: boolean; limit?: number } = {}) {
  const { email = true, limit = 50 } = opts
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://flashcam.app'
  const headers = { 'Content-Type': 'application/json', apikey: serviceKey, Authorization: `Bearer ${serviceKey}` }

  // select=* so this keeps working whether or not the ends_at column exists yet
  const res = await fetch(`${supabaseUrl}/rest/v1/events?select=*&is_active=eq.true&paid=eq.true&order=created_at.asc`, { headers })
  if (!res.ok) throw new Error(`events query failed: ${res.status}`)
  const live: any[] = await res.json()

  const now = new Date()
  const due = live.filter(ev => isPastEnd(ev, now)).slice(0, limit)
  const closed: { id: string; name: string; emailed: boolean }[] = []
  const resend = email && process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

  for (const ev of due) {
    const r = await fetch(`${supabaseUrl}/rest/v1/rpc/reveal_event`, {
      method: 'POST', headers, body: JSON.stringify({ event_id_param: ev.id }),
    })
    if (!r.ok) { console.error('reveal_event failed', ev.id, await r.text()); continue }

    let emailed = false
    const end = eventEndsAt(ev)
    const recent = !!end && now.getTime() - end.getTime() < 48 * 60 * 60 * 1000
    if (resend && recent && ev.host_id) {
      try {
        const user = await (await fetch(`${supabaseUrl}/auth/v1/admin/users/${ev.host_id}`, { headers })).json()
        if (user?.email) {
          await resend.emails.send({
            from: 'Flash <noreply@flashcam.app>',
            to: [user.email],
            subject: `📸 ${ev.name} — your gallery is revealed`,
            html: `<div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:28px;background:#0a0a0a;color:#f0f0f0;border-radius:16px">
              <h2 style="color:#ffb800;margin:0 0 12px">The roll is developed.</h2>
              <p style="color:#bbb;line-height:1.6">${ev.name} has wrapped up and every photo is now revealed to you and your guests.</p>
              <p style="color:#888;font-size:13px;line-height:1.6">Photos are kept for 14 days — download them or choose Keep Forever before then.</p>
              <a href="${APP_URL}/host/${ev.id}/download" style="display:inline-block;margin-top:14px;background:#ffb800;color:#0a0a0a;text-decoration:none;padding:13px 22px;border-radius:10px;font-weight:700">Open the gallery</a>
            </div>`,
          })
          emailed = true
        }
      } catch (e) { console.error('close email failed', ev.id, e) }
    }
    closed.push({ id: ev.id, name: ev.name, emailed })
  }
  return { checked: live.length, closed }
}
