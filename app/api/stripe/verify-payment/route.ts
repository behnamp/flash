import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey) {
    return NextResponse.json({ error: 'Payment not configured' }, { status: 500 })
  }

  try {
    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(stripeKey, { apiVersion: '2025-04-30.basil' as any })

    const { sessionId, eventId } = await req.json()

    const session = await stripe.checkout.sessions.retrieve(sessionId)
    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 })
    }

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    )
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const meta = session.metadata as any
    const targetEventId = eventId || meta?.event_id

    if (targetEventId) {
      await supabase.from('events').update({
        paid: true, is_active: true,
        payment_tier: meta?.tier || 'standard',
        guest_cap: parseInt(meta?.guest_cap || '50'),
        stripe_session_id: session.id,
        paid_at: new Date().toISOString(),
      }).eq('id', targetEventId).eq('host_id', user.id)

      await supabase.from('payments').insert({
        user_id: user.id, event_id: targetEventId,
        stripe_session_id: session.id,
        amount: session.amount_total,
        currency: session.currency,
        tier: meta?.tier || 'standard',
        status: 'completed',
      })
    }

    return NextResponse.json({ success: true, eventId: targetEventId })
  } catch (err: any) {
    console.error('Verify error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
