import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createBrowserClient } from '@supabase/ssr'

// Confirm the exact client-construction the app uses attaches x-guest-token.
let seen: Record<string, string> = {}
beforeEach(() => {
  seen = {}
  vi.stubGlobal('fetch', vi.fn(async (_url: string, opts: any = {}) => {
    const h = new Headers(opts.headers || {})
    h.forEach((v, k) => { seen[k] = v })
    return new Response('[]', { status: 200, headers: { 'content-type': 'application/json' } })
  }))
})

function mk(token?: string) {
  return createBrowserClient('https://x.supabase.co', 'anon',
    token ? { global: { headers: { 'x-guest-token': token } } } : undefined)
}

describe('guest token header', () => {
  it('rides on every request when a token is present', async () => {
    await mk('secret-token-123').from('shots').select('id')
    expect(seen['x-guest-token']).toBe('secret-token-123')
  })
  it('is absent when there is no token', async () => {
    await mk(undefined).from('shots').select('id')
    expect(seen['x-guest-token']).toBeUndefined()
  })
})
