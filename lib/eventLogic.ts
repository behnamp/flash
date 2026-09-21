// Pure, framework-free business logic shared across the app and covered by
// unit tests. Keeping these here (instead of inline in 'use client' pages)
// means the rules that guests and hosts depend on can be verified in CI.

export type EventLike = {
  paid?: boolean
  is_active?: boolean
  revealed?: boolean
  /** Host-chosen end time (ISO). Column may not exist on older databases. */
  ends_at?: string | null
  /** Calendar date of the event, 'YYYY-MM-DD'. */
  event_date?: string | null
  created_at?: string | null
}

export type EventStatus = {
  label: string
  color: string
  dot: string
  /** Machine-readable state, handy for tests and conditional UI. */
  state: 'draft' | 'live' | 'revealed' | 'ended'
}

/**
 * The lifecycle of an event.
 *   unpaid                     -> draft (never activated)
 *   paid + active + revealed   -> revealed
 *   paid + inactive            -> ended
 *   paid + active              -> live
 *
 * An UNPAID event is always a draft, even if some other flag is set — paying
 * is what activates it. This is the bug that used to label drafts "Ended".
 */
export function eventStatus(ev: EventLike, now: Date = new Date()): EventStatus {
  if (!ev.paid) return { label: 'Draft — not activated', color: '#ff9500', dot: '#ff9500', state: 'draft' }
  if (ev.revealed) return { label: 'Revealed', color: '#2ed573', dot: '#2ed573', state: 'revealed' }
  if (!ev.is_active || isPastEnd(ev, now)) return { label: 'Ended', color: '#888', dot: '#555', state: 'ended' }
  return { label: 'Live', color: '#ffb800', dot: '#ffb800', state: 'live' }
}

/** Whether a new guest may still join, given the current headcount. */
export function isGuestCapReached(currentGuests: number, guestCap?: number | null): boolean {
  if (!guestCap || guestCap <= 0) return false // no cap configured
  return currentGuests >= guestCap
}

/** Remaining shots on a guest's roll, never negative. */
export function shotsLeft(shotsUsed: number, shotLimit: number): number {
  return Math.max(0, shotLimit - shotsUsed)
}

/**
 * Guest-facing copy shown when a roll is full, tailored to when the photos
 * will actually surface for that event's reveal mode.
 */
export function rollFullMessage(revealMode: string | undefined, shotLimit: number): string {
  const lead = `All ${shotLimit} of your photos are in.`
  switch (revealMode) {
    case 'instant':   return `${lead} They’re already in the event gallery.`
    case 'morning':   return `${lead} They’ll be revealed tomorrow morning.`
    case 'rolling':   return `${lead} They’re developing into the gallery now.`
    case 'milestone': return `${lead} They’ll be revealed once every roll is used up.`
    default:          return `${lead} They’ll be revealed when the host opens the gallery.`
  }
}

/**
 * Extract an 8-char join code from a scanned QR value. Accepts either a full
 * `/join/CODE` URL or a bare code, and normalizes to uppercase. Returns null
 * when no valid 8-character code can be recovered.
 */
export function parseJoinCode(value: string): string | null {
  if (!value) return null
  const match = value.match(/\/join\/([A-Z0-9]{8})/i)
  if (match) return match[1].toUpperCase()
  // Only treat the raw value as a bare code when it isn't some other URL/path —
  // otherwise an unrelated QR would be coerced into a bogus "code".
  if (/[/:?#]/.test(value)) return null
  const cleaned = value.replace(/[^A-Z0-9]/gi, '').toUpperCase()
  return cleaned.length === 8 ? cleaned : null
}

/**
 * Compute the shot limit actually stored for an event, honoring the free
 * plan's lower ceiling (10) and the paid ceiling (40).
 */
export function clampShotLimit(shotLimit: number, isFreeTier: boolean): number {
  return Math.min(shotLimit, isFreeTier ? 10 : 40)
}

/** Parse the guest-cap picker value ('10'..'200', '∞', '5') into a number. */
export function guestCapToNumber(cap: string): number {
  if (cap === '∞') return 9999
  return parseInt(cap, 10) || 5
}


/**
 * When an event closes on its own.
 *   1. The host's explicit end time (ends_at), if set.
 *   2. Otherwise 9:00 AM the morning after the event date. Stored dates carry
 *      no timezone, so this uses 13:00 UTC = 9:00 AM Toronto (EDT). This is
 *      also what delivers the advertised "Morning After" reveal.
 *   3. Otherwise (no date at all) 3 days after the event was created.
 * Returns null only when there is nothing to go on.
 */
export function eventEndsAt(ev: EventLike): Date | null {
  if (ev.ends_at) {
    const d = new Date(ev.ends_at)
    if (!isNaN(d.getTime())) return d
  }
  if (ev.event_date && /^\d{4}-\d{2}-\d{2}/.test(ev.event_date)) {
    const d = new Date(`${ev.event_date.slice(0, 10)}T13:00:00Z`)
    d.setUTCDate(d.getUTCDate() + 1)
    return d
  }
  if (ev.created_at) {
    const d = new Date(ev.created_at)
    if (!isNaN(d.getTime())) return new Date(d.getTime() + 3 * 24 * 60 * 60 * 1000)
  }
  return null
}

/** True once an event's end time has passed. */
export function isPastEnd(ev: EventLike, now: Date = new Date()): boolean {
  const end = eventEndsAt(ev)
  return !!end && now.getTime() >= end.getTime()
}
