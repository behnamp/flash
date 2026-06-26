import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const stripeKey = process.env.STRIPE_SECRET_KEY
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!stripeKey) return NextResponse.json({ error: 'Payment not configured' }, { status: 500 })

  try {
    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(stripeKey, { apiVersion: '2025-04-30.basil' as any })

    const { sessionId, eventId } = await req.json()
    if (!sessionId) return NextResponse.json({ error: 'Missing session ID' }, { status: 400 })

    const session = await stripe.checkout.sessions.retrieve(sessionId)
    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 })
    }

    const meta = session.metadata as any
    const targetEventId = eventId || meta?.event_id
    if (!targetEventId) return NextResponse.json({ error: 'No event ID' }, { status: 400 })

    const headers = {
      'Content-Type': 'application/json',
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Prefer': 'return=minimal',
    }

    // Update event using service role — bypasses RLS, works after Stripe redirect
    await fetch(`${supabaseUrl}/rest/v1/events?id=eq.${targetEventId}`, {
      method: 'PATCH', headers,
      body: JSON.stringify({
        paid: true,
        is_active: true,
        payment_tier: meta?.tier || 'standard',
        guest_cap: parseInt(meta?.guest_cap || '50'),
        stripe_session_id: session.id,
        paid_at: new Date().toISOString(),
      }),
    })

    // Record payment
    await fetch(`${supabaseUrl}/rest/v1/payments`, {
      method: 'POST', headers,
      body: JSON.stringify({
        user_id: meta?.user_id,
        event_id: targetEventId,
        stripe_session_id: session.id,
        amount: session.amount_total,
        currency: session.currency,
        tier: meta?.tier || 'standard',
        status: 'completed',
      }),
    })

    return NextResponse.json({ success: true, eventId: targetEventId })
  } catch (err: any) {
    console.error('Verify error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
