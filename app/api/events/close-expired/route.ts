import { NextResponse } from 'next/server'
import { closeExpiredEvents } from '@/lib/closeExpiredEvents'

// Called on dashboard / admin loads so events close promptly without an
// hourly cron. Idempotent and only ever acts on events whose end time has
// already passed, so it is safe to expose.
export async function POST() {
  try {
    const r = await closeExpiredEvents()
    return NextResponse.json({ closed: r.closed.length })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
