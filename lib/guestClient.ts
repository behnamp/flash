import { createBrowserClient } from '@supabase/ssr'

/**
 * Guest identity for RLS.
 *
 * Guests are anonymous (no login), so the database can't use auth.uid() to
 * tell them apart. Each guest row has a secret `session_token`; we send it as
 * an `x-guest-token` request header, and RLS policies match it via
 * current_setting('request.headers')::json->>'x-guest-token'. That lets a
 * guest read/delete only their OWN unrevealed photos — nobody else's, and no
 * other event's.
 *
 * The token is stored per event under the join code (known on every guest
 * page from the URL), so the right client can be built synchronously.
 */

function tokenKey(code: string) {
  return `flash_gtok_${code.toUpperCase()}`
}

export function readGuestToken(code: string): string | undefined {
  try {
    return localStorage.getItem(tokenKey(code)) || undefined
  } catch {
    return undefined
  }
}

export function storeGuestToken(code: string, token: string | undefined | null) {
  if (!token) return
  try {
    localStorage.setItem(tokenKey(code), token)
  } catch {}
}

/** A Supabase browser client that carries the guest token (if we have one). */
export function createGuestClient(code: string) {
  const token = readGuestToken(code)
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    token ? { global: { headers: { 'x-guest-token': token } } } : undefined
  )
}

/**
 * Ensure the token is stored for this code. Older guests (joined before this
 * change) have a guest row in localStorage but no stored token; fetch it once
 * from their guest row (guest SELECT is open) so they keep seeing their own
 * in-progress photos after the policies tighten. Returns the token if known.
 */
export async function ensureGuestToken(
  code: string,
  guestId: string | undefined,
): Promise<string | undefined> {
  const existing = readGuestToken(code)
  if (existing || !guestId) return existing
  try {
    const plain = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
    const { data } = await plain.from('guests').select('session_token').eq('id', guestId).single()
    if (data?.session_token) {
      storeGuestToken(code, data.session_token)
      return data.session_token as string
    }
  } catch {}
  return undefined
}
