import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey) return NextResponse.json({ error: 'Not configured' }, { status: 500 })

  try {
    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(stripeKey, { apiVersion: '2025-04-30.basil' as any })

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
      .select('id, name, keep_forever')
      .eq('id', eventId)
      .eq('host_id', user.id)
      .single()

    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    if (event.keep_forever) return NextResponse.json({ error: 'Already keeping forever' }, { status: 400 })

    const origin = req.headers.get('origin') || 'https://flashcam.app'

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'cad',
          product_data: {
            name: 'Flash — Keep Forever',
            description: `Keep "${event.name}" photos forever — no expiry`,
          },
          unit_amount: 499, // $4.99 CAD
        },
        quantity: 1,
      }],
      metadata: { user_id: user.id, event_id: eventId, type: 'keep_forever' },
      customer_email: user.email!,
      success_url: `${origin}/host/${eventId}/download?kept=1`,
      cancel_url: `${origin}/host/${eventId}/download`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
