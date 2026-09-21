import { NextRequest, NextResponse } from 'next/server'
import { closeExpiredEvents } from '@/lib/closeExpiredEvents'

// Daily safety net (see vercel.json). Page loads also trigger the sweep via
// /api/events/close-expired, so events normally close within minutes.
export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try { return NextResponse.json(await closeExpiredEvents()) }
  catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
