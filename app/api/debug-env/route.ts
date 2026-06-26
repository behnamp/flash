import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ? 
      `set (starts: ${process.env.STRIPE_SECRET_KEY.slice(0,15)})` : 'NOT SET',
    SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'set' : 'NOT SET',
    SERVICE_ROLE: process.env.SUPABASE_SERVICE_ROLE_KEY ?
      `set (${process.env.SUPABASE_SERVICE_ROLE_KEY.length} chars)` : 'NOT SET',
    RESEND: process.env.RESEND_API_KEY ? 'set' : 'NOT SET',
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV || 'not on vercel',
  })
}
