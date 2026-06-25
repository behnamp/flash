import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const TIERS = {
  mini:      { price: 199,  name: 'Flash Starter',   guests: 10,   label: '≤ 10 guests' },
  standard:  { price: 499,  name: 'Flash Small',     guests: 25,   label: '≤ 25 guests' },
  medium:    { price: 999,  name: 'Flash Medium',    guests: 50,   label: '≤ 50 guests' },
  large:     { price: 1499, name: 'Flash Large',     guests: 100,  label: '≤ 100 guests' },
  xl:        { price: 2999, name: 'Flash XL',        guests: 200,  label: '≤ 200 guests' },
  unlimited: { price: 9999, name: 'Flash Unlimited', guests: 9999, label: 'Unlimited guests' },
}

export async function POST(req: NextRequest) {
  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey) {
    return NextResponse.json({ error: 'Payment not configured' }, { status: 500 })
  }

  try {
    // Lazy import Stripe so it doesn't crash at build time
    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(stripeKey, { apiVersion: '2025-04-30.basil' as any })

    const { tier, eventId, promoCode } = await req.json()
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

    let finalPrice = t.price
    let promoData: any = null
    let discountAmount = 0

    // Validate promo code if provided
    if (promoCode) {
      const { data: promo } = await supabase.rpc('validate_promo_code', {
        p_code: promoCode.toUpperCase(),
        p_tier: tier,
        p_user_id: user.id,
      })
      if (promo?.valid) {
        promoData = promo
        if (promo.type === 'free') {
          discountAmount = t.price
          finalPrice = 0
        } else {
          discountAmount = Math.floor(t.price * (promo.discount_percent / 100))
          finalPrice = t.price - discountAmount
        }
      }
    }

    // Free via promo — skip Stripe
    if (finalPrice === 0 && promoData) {
      await supabase.from('promo_codes')
        .update({ uses_count: (promoData.uses_count || 0) + 1 })
        .eq('id', promoData.id)

      if (eventId) {
        await supabase.from('events').update({
          paid: true, is_active: true, payment_tier: tier,
          guest_cap: t.guests, paid_at: new Date().toISOString(),
        }).eq('id', eventId).eq('host_id', user.id)

        await supabase.from('promo_redemptions').insert({
          promo_code_id: promoData.id, user_id: user.id, event_id: eventId,
          original_amount: t.price, discount_amount: discountAmount, final_amount: 0,
        })
      }
      return NextResponse.json({ free: true, eventId, redirectUrl: `/host/${eventId}?payment=success` })
    }

    // Stripe checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'cad',
          product_data: {
            name: t.name + (promoData ? ` (${promoData.discount_percent}% off)` : ''),
            description: `Flash disposable camera — ${t.label}`,
          },
          unit_amount: finalPrice,
        },
        quantity: 1,
      }],
      metadata: {
        user_id: user.id, event_id: eventId || '', tier,
        guest_cap: String(t.guests),
        promo_code_id: promoData?.id || '',
        original_amount: String(t.price),
        discount_amount: String(discountAmount),
      },
      customer_email: user.email!,
      success_url: `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}&event_id=${eventId}`,
      cancel_url: `${origin}/pricing${eventId ? `?eventId=${eventId}` : ''}?cancelled=true`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('Stripe error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
