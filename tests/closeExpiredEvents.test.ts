import { describe, it, expect, vi, beforeEach } from 'vitest'

const sent: any[] = []
vi.mock('resend', () => ({ Resend: class { emails = { send: async (m: any) => { sent.push(m) } } } }))

import { closeExpiredEvents } from '../lib/closeExpiredEvents'

const NOW = new Date('2026-09-21T15:00:00Z')
const events = [
  { id: 'june', name: 'Shiva Birthday', host_id: 'h1', event_date: '2026-06-26', is_active: true, paid: true },
  { id: 'lastnight', name: 'Sarah & Marco', host_id: 'h2', event_date: '2026-09-20', is_active: true, paid: true },
  { id: 'tonight', name: 'Tonight Party', host_id: 'h3', event_date: '2026-09-21', is_active: true, paid: true },
  { id: 'custom-future', name: 'Custom', host_id: 'h4', event_date: '2026-06-01', ends_at: '2026-09-30T02:00:00Z', is_active: true, paid: true },
]

let revealed: string[] = []
beforeEach(() => {
  revealed = []; sent.length = 0
  vi.useFakeTimers(); vi.setSystemTime(NOW)
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://db.test'
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'svc'
  process.env.RESEND_API_KEY = 're_test'
  vi.stubGlobal('fetch', vi.fn(async (url: string, init?: any) => {
    if (url.includes('/rest/v1/events')) return new Response(JSON.stringify(events.filter(e => e.is_active && !revealed.includes(e.id))))
    if (url.includes('/rpc/reveal_event')) { revealed.push(JSON.parse(init.body).event_id_param); return new Response(null, { status: 204 }) }
    if (url.includes('/auth/v1/admin/users/')) return new Response(JSON.stringify({ email: url.split('/').pop() + '@x.com' }))
    return new Response('not found', { status: 404 })
  }))
})

describe('closeExpiredEvents', () => {
  it('closes only events past their end time', async () => {
    const r = await closeExpiredEvents()
    expect(revealed.sort()).toEqual(['june', 'lastnight'])
    expect(r.closed.map(c => c.id).sort()).toEqual(['june', 'lastnight'])
  })
  it('respects a host-chosen end time over the default', async () => {
    await closeExpiredEvents()
    expect(revealed).not.toContain('custom-future')
  })
  it('emails only for recently ended events, not the June backlog', async () => {
    await closeExpiredEvents()
    expect(sent.map(m => m.to[0])).toEqual(['h2@x.com'])
  })
  it('is idempotent — a second run closes nothing', async () => {
    await closeExpiredEvents()
    const second = await closeExpiredEvents()
    expect(second.closed).toHaveLength(0)
  })
})
