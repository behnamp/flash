import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(req: NextRequest) {
  const eventId = req.nextUrl.searchParams.get('eventId')
  if (!eventId) return NextResponse.json({ error: 'Missing eventId' }, { status: 400 })

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )

  // Get event (check it's revealed)
  const { data: event } = await supabase
    .from('events')
    .select('id, name, revealed, photos_expire_at, photos_deleted')
    .eq('id', eventId)
    .single()

  if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })
  if (!event.revealed) return NextResponse.json({ error: 'Gallery not revealed yet' }, { status: 403 })
  if (event.photos_deleted) return NextResponse.json({ error: 'Photos have been deleted' }, { status: 410 })

  // Get all shots
  const { data: shots } = await supabase
    .from('shots')
    .select('id, storage_path, storage_url, mode_name, taken_at, guests(nickname)')
    .eq('event_id', eventId)
    .eq('revealed', true)
    .order('taken_at', { ascending: true })

  if (!shots?.length) return NextResponse.json({ error: 'No photos found' }, { status: 404 })

  // Return download manifest
  return NextResponse.json({
    eventName: event.name,
    expiresAt: event.photos_expire_at,
    totalPhotos: shots.length,
    photos: shots.map(s => ({
      url: s.storage_url,
      filename: `${(s.guests as any)?.nickname || 'guest'}-${s.mode_name || 'photo'}-${new Date(s.taken_at).getTime()}.jpg`,
      takenAt: s.taken_at,
      by: (s.guests as any)?.nickname,
      mode: s.mode_name,
    }))
  })
}
