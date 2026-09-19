import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Account deletion (Apple/Play requirement for apps with accounts).
// Deletes the host's events, their shots + guests + storage files, then the
// auth user itself. Irreversible.
export async function POST(_req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    )
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const headers = { 'apikey': serviceKey, 'Authorization': `Bearer ${serviceKey}`, 'Content-Type': 'application/json' }

    // 1. Find the host's events + their shots (for storage cleanup)
    const evRes = await fetch(
      `${supabaseUrl}/rest/v1/events?select=id,shots(storage_path)&host_id=eq.${user.id}`,
      { headers }
    )
    const events = await evRes.json()
    const eventIds: string[] = (events || []).map((e: any) => e.id)

    // 2. Remove storage files
    const paths: string[] = (events || []).flatMap((e: any) => (e.shots || []).map((s: any) => s.storage_path)).filter(Boolean)
    if (paths.length) {
      await fetch(`${supabaseUrl}/storage/v1/object/shots`, {
        method: 'DELETE', headers, body: JSON.stringify({ prefixes: paths }),
      }).catch(() => {})
    }

    // 3. Delete shots + guests for each event, then the events
    for (const id of eventIds) {
      await fetch(`${supabaseUrl}/rest/v1/shots?event_id=eq.${id}`, { method: 'DELETE', headers }).catch(() => {})
      await fetch(`${supabaseUrl}/rest/v1/guests?event_id=eq.${id}`, { method: 'DELETE', headers }).catch(() => {})
    }
    if (eventIds.length) {
      await fetch(`${supabaseUrl}/rest/v1/events?host_id=eq.${user.id}`, { method: 'DELETE', headers }).catch(() => {})
    }

    // 4. Delete the auth user (GoTrue admin endpoint)
    const delRes = await fetch(`${supabaseUrl}/auth/v1/admin/users/${user.id}`, {
      method: 'DELETE', headers,
    })
    if (!delRes.ok) {
      const t = await delRes.text()
      console.error('Auth user delete failed:', t)
      return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Delete account error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
