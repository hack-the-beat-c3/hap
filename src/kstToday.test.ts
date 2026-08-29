import { afterEach, describe, expect, it, vi } from 'vitest'

import { getTodayInKST } from './kstToday'

describe('getTodayInKST', () => {
  afterEach(() => vi.useRealTimers())

  it('returns the KST calendar date for a known UTC instant', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-08-29T03:15:00Z'))

    expect(getTodayInKST()).toEqual({ year: 2026, month: 8, day: 29 })
  })

  it('rolls a late UTC date into the next KST day', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-08-29T23:30:00Z'))

    expect(getTodayInKST()).toEqual({ year: 2026, month: 8, day: 30 })
  })
})
