import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const stripeKey = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!stripeKey || !webhookSecret) {
    return NextResponse.json({ error: 'Not configured' }, { status: 400 })
  }

  try {
    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(stripeKey, { apiVersion: '2025-04-30.basil' as any })

    const body = await req.text()
    const sig = req.headers.get('stripe-signature')!
    const event = stripe.webhooks.constructEvent(body, sig, webhookSecret)

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any
      const { user_id, event_id, tier, guest_cap } = session.metadata || {}
      if (event_id && user_id) {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
        if (serviceKey) {
          await fetch(`${supabaseUrl}/rest/v1/events?id=eq.${event_id}&host_id=eq.${user_id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'apikey': serviceKey, 'Authorization': `Bearer ${serviceKey}`, 'Prefer': 'return=minimal' },
            body: JSON.stringify({ paid: true, is_active: true, payment_tier: tier, guest_cap: parseInt(guest_cap || '50'), stripe_session_id: session.id, paid_at: new Date().toISOString() }),
          })
        }
      }
    }
    return NextResponse.json({ received: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
