import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-05-27.dahlia',
})

export const TIERS = {
  mini:      { price: 399,  name: 'Flash Mini',     guests: 10,   label: '≤ 10 guests' },
  standard:  { price: 1499, name: 'Flash Standard', guests: 50,   label: '≤ 50 guests' },
  large:     { price: 3999, name: 'Flash Large',    guests: 150,  label: '≤ 150 guests' },
  unlimited: { price: 9999, name: 'Flash Unlimited',guests: 9999, label: 'Unlimited guests' },
}

export async function POST(req: NextRequest) {
  try {
    const { tier, eventId } = await req.json()
    if (!TIERS[tier as keyof typeof TIERS]) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 })
    }

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    )
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const t = TIERS[tier as keyof typeof TIERS]
    const origin = req.headers.get('origin') || 'https://flash-roan.vercel.app'

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'cad',
          product_data: {
            name: t.name,
            description: `Flash disposable camera — ${t.label}`,
          },
          unit_amount: t.price,
        },
        quantity: 1,
      }],
      metadata: {
        user_id: user.id,
        event_id: eventId || '',
        tier,
        guest_cap: String(t.guests),
      },
      customer_email: user.email!,
      success_url: `${origin}/host${eventId ? `/${eventId}` : ''}?payment=success`,
      cancel_url: `${origin}/pricing?cancelled=true`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('Stripe error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
