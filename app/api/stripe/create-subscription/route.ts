import { NextRequest, NextResponse } from 'next/server'

export const PLANNER_PLANS = {
  dj: {
    name: 'Flash DJ & Promoter',
    description: '12 events/month · 250 guests per event',
    amount: 3900,
    currency: 'cad',
    interval: 'month' as const,
    plan_id: 'dj',
  },
  venue: {
    name: 'Flash Venue',
    description: 'Unlimited events · 500 guests per event',
    amount: 8900,
    currency: 'cad',
    interval: 'month' as const,
    plan_id: 'venue',
  },
  agency: {
    name: 'Flash Agency',
    description: 'Unlimited events · Unlimited guests · 5 seats',
    amount: 19900,
    currency: 'cad',
    interval: 'month' as const,
    plan_id: 'agency',
  },
} as const

export async function POST(req: NextRequest) {
  const stripeKey = process.env.STRIPE_SECRET_KEY
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  if (!stripeKey) return NextResponse.json({ error: 'Payment not configured' }, { status: 500 })

  try {
    const { plan } = await req.json()
    if (!PLANNER_PLANS[plan as keyof typeof PLANNER_PLANS]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const authHeader = req.headers.get('authorization') || ''
    const token = authHeader.replace('Bearer ', '').trim()
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { 'apikey': anonKey, 'Authorization': `Bearer ${token}` }
    })
    if (!userRes.ok) return NextResponse.json({ error: 'Invalid session — please log in again' }, { status: 401 })
    const user = await userRes.json()

    const p = PLANNER_PLANS[plan as keyof typeof PLANNER_PLANS]
    const origin = req.headers.get('origin') || 'https://flashcam.app'

    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(stripeKey, { apiVersion: '2025-04-30.basil' as any })

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{
        price_data: {
          currency: p.currency,
          product_data: { name: p.name, description: p.description },
          unit_amount: p.amount,
          recurring: { interval: p.interval },
        },
        quantity: 1,
      }],
      subscription_data: {
        metadata: { user_id: user.id, plan_id: p.plan_id },
      },
      metadata: { user_id: user.id, plan_id: p.plan_id },
      customer_email: user.email,
      success_url: `${origin}/planners/dashboard?subscribed=1`,
      cancel_url: `${origin}/planners#plans`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('Subscription checkout error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
