import { describe, it, expect } from 'vitest'
import { PHOTO_MODES, ALL_MODES } from '@/constants/photoModes'
import { REVEAL_MODES } from '@/constants/revealModes'
import { TIERS } from '@/app/api/stripe/create-checkout/route'

describe('photo modes', () => {
  it('every mode has a unique id and a name', () => {
    const ids = ALL_MODES.map(m => m.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const m of ALL_MODES) {
      expect(m.id).toBeTruthy()
      expect(m.name).toBeTruthy()
    }
  })

  it('ALL_MODES is the flattened view of PHOTO_MODES', () => {
    const flat = Object.values(PHOTO_MODES).flat()
    expect(ALL_MODES.length).toBe(flat.length)
  })
})

describe('reveal modes', () => {
  const IDS = ['instant', 'end', 'rolling', 'morning', 'milestone']
  it('exposes the five supported reveal ids', () => {
    expect(REVEAL_MODES.map(r => r.id).sort()).toEqual([...IDS].sort())
  })
  it('every reveal mode has a name and description', () => {
    for (const r of REVEAL_MODES) {
      expect(r.name).toBeTruthy()
      expect(r.desc).toBeTruthy()
    }
  })
})

describe('pricing tiers', () => {
  it('prices increase monotonically with guest capacity', () => {
    const order = ['mini', 'standard', 'medium', 'large', 'xl', 'unlimited'] as const
    for (let i = 1; i < order.length; i++) {
      const prev = TIERS[order[i - 1]]
      const cur = TIERS[order[i]]
      expect(cur.price).toBeGreaterThan(prev.price)
      expect(cur.guests).toBeGreaterThanOrEqual(prev.guests)
    }
  })

  it('stores prices in integer cents', () => {
    for (const t of Object.values(TIERS)) {
      expect(Number.isInteger(t.price)).toBe(true)
      expect(t.price).toBeGreaterThan(0)
    }
  })

  it('every tier has a human label and a guest count', () => {
    for (const t of Object.values(TIERS)) {
      expect(t.name).toBeTruthy()
      expect(t.label).toBeTruthy()
      expect(t.guests).toBeGreaterThan(0)
    }
  })
})
