import KoreanLunarCalendar from 'korean-lunar-calendar'
import { describe, expect, test } from 'vitest'

import { calculateSaju, type SajuInput } from './engine'

const knownTimeInput: SajuInput = {
  calendarType: 'solar',
  year: 2026,
  month: 8,
  day: 1,
  birthTime: { hour: 14, minute: 30 },
}
const today = { year: 2026, month: 8, day: 29 }

describe('calculateSaju', () => {
  test('calculates six element points from the year, month, and day pillars', () => {
    const result = calculateSaju(knownTimeInput, today)

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(['목', '화', '토', '금', '수']).toContain(result.value.dominantElement)
    expect(Object.values(result.value.elementBalance).reduce((sum, count) => sum + count, 0)).toBe(6)
    expect(result.value).toMatchObject({
      isSimplified: true,
      timeProvided: true,
      calculationVersion: 'adr-0001-v1',
    })
  })

  test('is deterministic for the same input and injected today', () => {
    expect(calculateSaju(knownTimeInput, today)).toEqual(calculateSaju(knownTimeInput, today))
  })

  test('excludes the hour pillar when birth time is unknown', () => {
    const known = calculateSaju(knownTimeInput, today)
    const unknown = calculateSaju({ ...knownTimeInput, birthTime: 'unknown' }, today)

    expect(unknown.ok).toBe(true)
    if (!unknown.ok || !known.ok) return
    expect(unknown.value).toMatchObject({ timeProvided: false, isSimplified: true })
    expect(unknown.value.elementBalance).toEqual(known.value.elementBalance)
    expect(unknown.value.dominantElement).toBe(known.value.dominantElement)
  })

  test('rejects a lunar leap month that does not exist', () => {
    const result = calculateSaju(
      { calendarType: 'lunar', isLeapMonth: true, year: 2017, month: 3, day: 1, birthTime: 'unknown' },
      today,
    )

    expect(result).toMatchObject({ ok: false, error: { type: 'IMPOSSIBLE_LEAP_MONTH' } })
  })

  test('rejects an invalid calendar date', () => {
    const result = calculateSaju(
      { calendarType: 'solar', year: 2026, month: 13, day: 1, birthTime: 'unknown' },
      today,
    )

    expect(result).toMatchObject({ ok: false, error: { type: 'INVALID_DATE' } })
  })

  test('rejects a birth date after the injected today', () => {
    const result = calculateSaju(
      { calendarType: 'solar', year: 2026, month: 8, day: 30, birthTime: 'unknown' },
      today,
    )

    expect(result).toMatchObject({ ok: false, error: { type: 'FUTURE_DATE' } })
  })

  test('rejects a year outside the library range', () => {
    const result = calculateSaju(
      { calendarType: 'solar', year: 999, month: 12, day: 31, birthTime: 'unknown' },
      today,
    )

    expect(result).toMatchObject({ ok: false, error: { type: 'OUT_OF_RANGE' } })
  })

  test('matches the KASI solar, lunar, and GapJa fixture before deriving elements', () => {
    const calendar = new KoreanLunarCalendar()
    expect(calendar.setSolarDate(2026, 8, 1)).toBe(true)
    expect(calendar.getLunarCalendar()).toMatchObject({ year: 2026, month: 6, day: 19 })
    expect(calendar.getKoreanGapja()).toMatchObject({ year: '병오년', month: '을미월', day: '정미일' })
    expect(calendar.getChineseGapja()).toMatchObject({ year: '丙午年', month: '乙未月', day: '丁未日' })

    const result = calculateSaju(knownTimeInput, today)
    expect(result).toMatchObject({
      ok: true,
      value: { dominantElement: '화', elementBalance: { 목: 1, 화: 3, 토: 2, 금: 0, 수: 0 } },
    })
  })

  test('uses the day-stem element when multiple elements tie for the highest count', () => {
    const result = calculateSaju(
      { calendarType: 'solar', year: 2020, month: 1, day: 1, birthTime: 'unknown' },
      today,
    )

    expect(result).toMatchObject({
      ok: true,
      value: { dominantElement: '수', elementBalance: { 목: 1, 화: 1, 토: 2, 금: 0, 수: 2 } },
    })
  })
})
