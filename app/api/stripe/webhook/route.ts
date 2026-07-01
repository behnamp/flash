import { NextRequest, NextResponse } from 'next/server'

async function updateUserPlannerPlan(userId: string, plan: string | null) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  if (!serviceKey) return
  await fetch(`${supabaseUrl}/auth/v1/admin/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
    },
    body: JSON.stringify({ user_metadata: { planner_plan: plan } }),
  })
}

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

      // Per-event payment (existing flow)
      if (event_id && user_id && tier) {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
        if (serviceKey) {
          await fetch(`${supabaseUrl}/rest/v1/events?id=eq.${event_id}&host_id=eq.${user_id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'apikey': serviceKey,
              'Authorization': `Bearer ${serviceKey}`,
              'Prefer': 'return=minimal',
            },
            body: JSON.stringify({
              paid: true, is_active: true, payment_tier: tier,
              guest_cap: parseInt(guest_cap || '50'),
              stripe_session_id: session.id,
              paid_at: new Date().toISOString(),
            }),
          })
        }
      }
    }

    if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated') {
      const sub = event.data.object as any
      const { user_id, plan_id } = sub.metadata || {}
      if (user_id && plan_id) {
        const isActive = sub.status === 'active' || sub.status === 'trialing'
        await updateUserPlannerPlan(user_id, isActive ? plan_id : null)
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object as any
      const { user_id } = sub.metadata || {}
      if (user_id) {
        await updateUserPlannerPlan(user_id, null)
      }
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
