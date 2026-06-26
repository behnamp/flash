import { NextRequest, NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const HIGGSFIELD_TOKEN = process.env.HIGGSFIELD_API_KEY!

const svcHeaders = {
  'Content-Type': 'application/json',
  'apikey': SERVICE_KEY,
  'Authorization': `Bearer ${SERVICE_KEY}`,
}

export async function POST(req: NextRequest) {
  try {
    const { eventId } = await req.json()
    if (!eventId) return NextResponse.json({ error: 'Missing eventId' }, { status: 400 })

    if (!HIGGSFIELD_TOKEN) return NextResponse.json({ error: 'Higgsfield not configured' }, { status: 500 })

    // Fetch event + best shots (up to 8, prefer revealed)
    const shotsRes = await fetch(
      `${SUPABASE_URL}/rest/v1/shots?event_id=eq.${eventId}&select=id,storage_url,taken_at&order=taken_at.desc&limit=8`,
      { headers: svcHeaders }
    )
    const shots = await shotsRes.json()
    if (!shots?.length) return NextResponse.json({ error: 'No photos to make reel from' }, { status: 400 })

    // Pick up to 6 best shots spread across the event
    const picked = shots.length <= 6 ? shots : [
      shots[0], shots[Math.floor(shots.length * 0.2)],
      shots[Math.floor(shots.length * 0.4)], shots[Math.floor(shots.length * 0.6)],
      shots[Math.floor(shots.length * 0.8)], shots[shots.length - 1]
    ]

    // Import each photo URL into Higgsfield
    const mediaIds: string[] = []
    for (const shot of picked) {
      if (!shot.storage_url) continue
      try {
        const importRes = await fetch('https://api.higgsfield.ai/v1/media/import-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${HIGGSFIELD_TOKEN}` },
          body: JSON.stringify({ url: shot.storage_url, type: 'image' })
        })
        const imp = await importRes.json()
        if (imp?.media_id) mediaIds.push(imp.media_id)
      } catch {}
    }

    if (mediaIds.length === 0) return NextResponse.json({ error: 'Could not import photos' }, { status: 500 })

    // Generate video with Seedance 2.0
    const genRes = await fetch('https://api.higgsfield.ai/v1/video/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${HIGGSFIELD_TOKEN}` },
      body: JSON.stringify({
        model: 'seedance_2_0',
        prompt: 'Cinematic highlight reel. Smooth elegant transitions between moments. Warm film aesthetic. Emotional and beautiful.',
        aspect_ratio: '9:16',
        resolution: '720p',
        mode: 'std',
        genre: 'drama',
        generate_audio: true,
        medias: mediaIds.map(id => ({ value: id, role: 'image' }))
      })
    })
    const gen = await genRes.json()
    const jobId = gen?.job_id || gen?.id

    if (!jobId) return NextResponse.json({ error: gen?.error || 'Generation failed' }, { status: 500 })

    // Save job ID to event
    await fetch(`${SUPABASE_URL}/rest/v1/events?id=eq.${eventId}`, {
      method: 'PATCH', headers: { ...svcHeaders, 'Prefer': 'return=minimal' },
      body: JSON.stringify({ reel_job_id: jobId, reel_status: 'generating' })
    })

    return NextResponse.json({ jobId, status: 'generating' })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// Poll for reel status
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const jobId = searchParams.get('jobId')
  const eventId = searchParams.get('eventId')
  if (!jobId || !eventId) return NextResponse.json({ error: 'Missing params' }, { status: 400 })

  try {
    const statusRes = await fetch(`https://api.higgsfield.ai/v1/video/job/${jobId}`, {
      headers: { 'Authorization': `Bearer ${HIGGSFIELD_TOKEN}` }
    })
    const status = await statusRes.json()
    const videoUrl = status?.results?.[0]?.url || status?.result_url || status?.output_url

    if (videoUrl) {
      // Save completed reel URL
      await fetch(`${SUPABASE_URL}/rest/v1/events?id=eq.${eventId}`, {
        method: 'PATCH', headers: { ...svcHeaders, 'Prefer': 'return=minimal' },
        body: JSON.stringify({ reel_url: videoUrl, reel_status: 'done' })
      })
      return NextResponse.json({ status: 'done', url: videoUrl })
    }

    if (status?.status === 'failed') {
      await fetch(`${SUPABASE_URL}/rest/v1/events?id=eq.${eventId}`, {
        method: 'PATCH', headers: { ...svcHeaders, 'Prefer': 'return=minimal' },
        body: JSON.stringify({ reel_status: 'failed' })
      })
      return NextResponse.json({ status: 'failed' })
    }

    return NextResponse.json({ status: status?.status || 'generating' })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
