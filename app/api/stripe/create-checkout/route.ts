import { NextRequest, NextResponse } from 'next/server'

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
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  if (!stripeKey) return NextResponse.json({ error: 'Payment not configured' }, { status: 500 })

  try {
    const { tier, eventId, promoCode } = await req.json()
    if (!TIERS[tier as keyof typeof TIERS]) return NextResponse.json({ error: 'Invalid tier' }, { status: 400 })

    // Get user from Bearer token sent by client
    const authHeader = req.headers.get('authorization') || ''
    const token = authHeader.replace('Bearer ', '').trim()
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { 'apikey': anonKey, 'Authorization': `Bearer ${token}` }
    })
    if (!userRes.ok) return NextResponse.json({ error: 'Invalid session — please log in again' }, { status: 401 })
    const user = await userRes.json()
    const userId = user.id
    const userEmail = user.email

    const t = TIERS[tier as keyof typeof TIERS]
    const origin = req.headers.get('origin') || 'https://flashcam.app'
    let finalPrice = t.price
    let promoData: any = null
    let discountAmount = 0
    const svcHeaders = { 'Content-Type': 'application/json', 'apikey': serviceKey, 'Authorization': `Bearer ${serviceKey}`, 'Prefer': 'return=minimal' }

    // Promo code
    if (promoCode) {
      const r = await fetch(`${supabaseUrl}/rest/v1/rpc/validate_promo_code`, {
        method: 'POST', headers: { 'apikey': serviceKey, 'Authorization': `Bearer ${serviceKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ p_code: promoCode.toUpperCase(), p_tier: tier, p_user_id: userId })
      })
      if (r.ok) {
        const promo = await r.json()
        if (promo?.valid) {
          promoData = promo
          if (promo.type === 'free') { discountAmount = t.price; finalPrice = 0 }
          else { discountAmount = Math.floor(t.price * (promo.discount_percent / 100)); finalPrice = t.price - discountAmount }
        }
      }
    }

    // Free via promo
    if (finalPrice === 0 && promoData && eventId) {
      await fetch(`${supabaseUrl}/rest/v1/promo_codes?id=eq.${promoData.id}`, { method: 'PATCH', headers: svcHeaders, body: JSON.stringify({ uses_count: (promoData.uses_count || 0) + 1 }) })
      await fetch(`${supabaseUrl}/rest/v1/events?id=eq.${eventId}`, { method: 'PATCH', headers: svcHeaders, body: JSON.stringify({ paid: true, is_active: true, payment_tier: tier, guest_cap: t.guests, paid_at: new Date().toISOString() }) })
      return NextResponse.json({ free: true, eventId, redirectUrl: `/host/${eventId}?payment=success` })
    }

    // Stripe
    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(stripeKey, { apiVersion: '2025-04-30.basil' as any })
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{ price_data: { currency: 'cad', product_data: { name: t.name, description: `Flash — ${t.label}` }, unit_amount: finalPrice }, quantity: 1 }],
      metadata: { user_id: userId, event_id: eventId || '', tier, guest_cap: String(t.guests), original_amount: String(t.price), discount_amount: String(discountAmount) },
      customer_email: userEmail,
      success_url: `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}&event_id=${eventId}`,
      cancel_url: `${origin}/pricing${eventId ? `?eventId=${eventId}` : ''}`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('Checkout error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
