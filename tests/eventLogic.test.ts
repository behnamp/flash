import { describe, it, expect } from 'vitest'
import {
  eventStatus,
  isGuestCapReached,
  shotsLeft,
  rollFullMessage,
  parseJoinCode,
  clampShotLimit,
  guestCapToNumber,
} from '@/lib/eventLogic'

describe('eventStatus', () => {
  it('labels an unpaid event as a draft regardless of other flags', () => {
    expect(eventStatus({ paid: false }).state).toBe('draft')
    // Even if is_active somehow got set, unpaid means draft — the bug we fixed
    expect(eventStatus({ paid: false, is_active: true }).state).toBe('draft')
    expect(eventStatus({ paid: false, is_active: false, revealed: false }).label).toBe('Draft — not activated')
  })

  it('labels a paid inactive event as ended, never a draft', () => {
    const s = eventStatus({ paid: true, is_active: false })
    expect(s.state).toBe('ended')
    expect(s.label).toBe('Ended')
  })

  it('labels a paid revealed event as revealed', () => {
    expect(eventStatus({ paid: true, is_active: true, revealed: true }).state).toBe('revealed')
    // revealed takes precedence even if still active
    expect(eventStatus({ paid: true, is_active: false, revealed: true }).state).toBe('revealed')
  })

  it('labels a paid active unrevealed event as live', () => {
    const s = eventStatus({ paid: true, is_active: true, revealed: false })
    expect(s.state).toBe('live')
    expect(s.color).toBe('#ffb800')
  })
})

describe('isGuestCapReached', () => {
  it('blocks joining once the cap is met or exceeded', () => {
    expect(isGuestCapReached(5, 5)).toBe(true)
    expect(isGuestCapReached(6, 5)).toBe(true)
  })
  it('allows joining below the cap', () => {
    expect(isGuestCapReached(4, 5)).toBe(false)
    expect(isGuestCapReached(0, 10)).toBe(false)
  })
  it('treats a missing/zero cap as unlimited', () => {
    expect(isGuestCapReached(1000, undefined)).toBe(false)
    expect(isGuestCapReached(1000, 0)).toBe(false)
    expect(isGuestCapReached(1000, null)).toBe(false)
  })
})

describe('shotsLeft', () => {
  it('never returns a negative number', () => {
    expect(shotsLeft(12, 10)).toBe(0)
    expect(shotsLeft(3, 10)).toBe(7)
    expect(shotsLeft(0, 10)).toBe(10)
  })
})

describe('rollFullMessage', () => {
  it('tailors the copy to each reveal mode', () => {
    expect(rollFullMessage('instant', 10)).toContain('already in the event gallery')
    expect(rollFullMessage('morning', 10)).toContain('tomorrow morning')
    expect(rollFullMessage('rolling', 10)).toContain('developing into the gallery')
    expect(rollFullMessage('milestone', 10)).toContain('every roll is used up')
  })
  it('falls back to the host-reveal copy for end mode and unknown modes', () => {
    expect(rollFullMessage('end', 10)).toContain('when the host opens the gallery')
    expect(rollFullMessage(undefined, 10)).toContain('when the host opens the gallery')
  })
  it('includes the actual shot count', () => {
    expect(rollFullMessage('end', 24)).toContain('All 24 of your photos are in')
  })
})

describe('parseJoinCode', () => {
  it('extracts a code from a full join URL', () => {
    expect(parseJoinCode('https://flashcam.app/join/AB12CD34')).toBe('AB12CD34')
    expect(parseJoinCode('flashcam.app/join/ab12cd34?x=1')).toBe('AB12CD34')
  })
  it('accepts a bare 8-char code and uppercases it', () => {
    expect(parseJoinCode('ab12cd34')).toBe('AB12CD34')
  })
  it('strips punctuation before validating length', () => {
    expect(parseJoinCode('AB12-CD34')).toBe('AB12CD34')
  })
  it('returns null for anything that cannot yield 8 chars', () => {
    expect(parseJoinCode('ABC')).toBeNull()
    expect(parseJoinCode('')).toBeNull()
    expect(parseJoinCode('ABCDEFGHIJ')).toBeNull() // 10 raw chars, not a valid 8-char code
  })
  it('rejects unrelated URLs instead of coercing them into a code', () => {
    expect(parseJoinCode('https://example.com/other')).toBeNull()
    expect(parseJoinCode('mailto:hi@flashcam.app')).toBeNull()
  })
})

describe('clampShotLimit', () => {
  it('caps the free tier at 10', () => {
    expect(clampShotLimit(40, true)).toBe(10)
    expect(clampShotLimit(8, true)).toBe(8)
  })
  it('caps the paid tiers at 40', () => {
    expect(clampShotLimit(100, false)).toBe(40)
    expect(clampShotLimit(25, false)).toBe(25)
  })
})

describe('guestCapToNumber', () => {
  it('maps the infinity option to 9999', () => {
    expect(guestCapToNumber('∞')).toBe(9999)
  })
  it('parses numeric strings', () => {
    expect(guestCapToNumber('50')).toBe(50)
    expect(guestCapToNumber('5')).toBe(5)
  })
  it('defaults junk to 5', () => {
    expect(guestCapToNumber('abc')).toBe(5)
  })
})

import { eventEndsAt, isPastEnd } from '../lib/eventLogic'

describe('event end time', () => {
  it('uses the host-chosen end time when set', () => {
    expect(eventEndsAt({ ends_at: '2026-09-20T02:00:00Z', event_date: '2026-09-19' })?.toISOString())
      .toBe('2026-09-20T02:00:00.000Z')
  })
  it('defaults to 9am Toronto (13:00 UTC) the morning after the event date', () => {
    expect(eventEndsAt({ event_date: '2026-09-19' })?.toISOString()).toBe('2026-09-20T13:00:00.000Z')
  })
  it('handles month rollover', () => {
    expect(eventEndsAt({ event_date: '2026-06-30' })?.toISOString()).toBe('2026-07-01T13:00:00.000Z')
  })
  it('falls back to 3 days after creation when there is no date', () => {
    expect(eventEndsAt({ created_at: '2026-06-01T10:00:00Z' })?.toISOString()).toBe('2026-06-04T10:00:00.000Z')
  })
  it('returns null with nothing to go on, and never counts as ended', () => {
    expect(eventEndsAt({})).toBeNull()
    expect(isPastEnd({})).toBe(false)
  })
  it('a June event is past its end in September', () => {
    expect(isPastEnd({ event_date: '2026-06-26' }, new Date('2026-09-21T12:00:00Z'))).toBe(true)
  })
  it('an event tonight is not past its end yet', () => {
    expect(isPastEnd({ event_date: '2026-09-21' }, new Date('2026-09-21T23:00:00Z'))).toBe(false)
  })
})

describe('eventStatus with end times', () => {
  it('a live-flagged event past its end shows as Ended', () => {
    expect(eventStatus({ paid: true, is_active: true, event_date: '2026-06-26' }, new Date('2026-09-21T12:00:00Z')).state).toBe('ended')
  })
  it('a live event before its end stays Live', () => {
    expect(eventStatus({ paid: true, is_active: true, event_date: '2026-09-21' }, new Date('2026-09-21T20:00:00Z')).state).toBe('live')
  })
})
