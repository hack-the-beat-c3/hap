import KoreanLunarCalendar from 'korean-lunar-calendar'

import {
  BRANCH_ELEMENTS,
  FIVE_ELEMENTS,
  STEM_ELEMENTS,
  type FiveElement,
} from './elements'

export type { FiveElement } from './elements'

export interface SajuInput {
  calendarType: 'solar' | 'lunar'
  isLeapMonth?: boolean
  year: number
  month: number
  day: number
  birthTime: { hour: number; minute: number } | 'unknown'
}

export interface TodayDate {
  year: number
  month: number
  day: number
}

export interface SajuResult {
  dominantElement: FiveElement
  elementBalance: Record<FiveElement, number>
  todaySummary: string
  isSimplified: true
  timeProvided: boolean
  calculationVersion: 'adr-0001-v1'
}

export type SajuError =
  | { type: 'INVALID_DATE'; message: string }
  | { type: 'IMPOSSIBLE_LEAP_MONTH'; message: string }
  | { type: 'FUTURE_DATE'; message: string }
  | { type: 'OUT_OF_RANGE'; message: string }

export type SajuCalcResult =
  | { ok: true; value: SajuResult }
  | { ok: false; error: SajuError }

const CALCULATION_VERSION = 'adr-0001-v1' as const
const SOLAR_MIN = { year: 1000, month: 2, day: 13 }
const SOLAR_MAX = { year: 2050, month: 12, day: 31 }
const LUNAR_MIN = { year: 1000, month: 1, day: 1 }
const LUNAR_MAX = { year: 2050, month: 11, day: 18 }

function error(type: SajuError['type'], message: string): SajuCalcResult {
  return { ok: false, error: { type, message } as SajuError }
}

function compareDate(
  left: { year: number; month: number; day: number },
  right: { year: number; month: number; day: number },
): number {
  return left.year - right.year || left.month - right.month || left.day - right.day
}

function isValidSolarDate(date: TodayDate): boolean {
  if (![date.year, date.month, date.day].every(Number.isInteger)) return false
  if (date.month < 1 || date.month > 12 || date.day < 1) return false
  const leap = date.year % 4 === 0 && (date.year % 100 !== 0 || date.year % 400 === 0)
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  return date.day <= days[date.month - 1]
}

function validateTime(time: SajuInput['birthTime']): boolean {
  return (
    time === 'unknown' ||
    (Number.isInteger(time.hour) &&
      Number.isInteger(time.minute) &&
      time.hour >= 0 &&
      time.hour <= 23 &&
      time.minute >= 0 &&
      time.minute <= 59)
  )
}

function isWithinLibraryRange(input: SajuInput): boolean {
  const min = input.calendarType === 'solar' ? SOLAR_MIN : LUNAR_MIN
  const max = input.calendarType === 'solar' ? SOLAR_MAX : LUNAR_MAX
  return compareDate(input, min) >= 0 && compareDate(input, max) <= 0
}

function setBirthDate(calendar: KoreanLunarCalendar, input: SajuInput): SajuCalcResult | null {
  if (!Number.isInteger(input.year) || input.year < 1000 || input.year > 2050) {
    return error('OUT_OF_RANGE', '지원 범위(1000~2050년) 안의 연도를 입력해 주세요.')
  }
  if (!isWithinLibraryRange(input)) {
    return error('OUT_OF_RANGE', '선택한 달력의 지원 날짜 범위 안에서 입력해 주세요.')
  }
  if (!validateTime(input.birthTime)) {
    return error('INVALID_DATE', '출생시각은 올바른 시와 분으로 입력해 주세요.')
  }

  if (input.calendarType === 'solar') {
    if (!isValidSolarDate(input) || !calendar.setSolarDate(input.year, input.month, input.day)) {
      return error('INVALID_DATE', '존재하는 양력 날짜를 입력해 주세요.')
    }
    return null
  }

  if (
    ![input.month, input.day].every(Number.isInteger) ||
    input.month < 1 ||
    input.month > 12 ||
    input.day < 1 ||
    input.day > 30
  ) {
    return error('INVALID_DATE', '존재하는 음력 날짜를 입력해 주세요.')
  }

  const leapRequested = input.isLeapMonth === true
  if (calendar.setLunarDate(input.year, input.month, input.day, leapRequested)) return null
  if (leapRequested) {
    const regularCalendar = new KoreanLunarCalendar()
    if (regularCalendar.setLunarDate(input.year, input.month, input.day, false)) {
      return error('IMPOSSIBLE_LEAP_MONTH', '해당 연도와 월에는 선택한 윤달 날짜가 없습니다.')
    }
  }
  return error('INVALID_DATE', '존재하는 음력 날짜를 입력해 주세요.')
}

export function calculateSaju(input: SajuInput, today: TodayDate): SajuCalcResult {
  if (!isValidSolarDate(today)) {
    return error('INVALID_DATE', '오늘 날짜는 올바른 양력 날짜여야 합니다.')
  }

  const calendar = new KoreanLunarCalendar()
  const invalid = setBirthDate(calendar, input)
  if (invalid) return invalid

  const solarBirth = calendar.getSolarCalendar()
  if (compareDate(solarBirth, today) > 0) {
    return error('FUTURE_DATE', '오늘보다 이후인 출생일은 계산할 수 없습니다.')
  }

  const indices = calendar.getGapJaIndex()
  const balance: Record<FiveElement, number> = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 }
  for (const pillar of ['year', 'month', 'day'] as const) {
    balance[STEM_ELEMENTS[indices.cheongan[pillar]]] += 1
    balance[BRANCH_ELEMENTS[indices.ganji[pillar]]] += 1
  }

  const highestCount = Math.max(...Object.values(balance))
  const tiedElements = FIVE_ELEMENTS.filter((element) => balance[element] === highestCount)
  const dayStemElement = STEM_ELEMENTS[indices.cheongan.day]
  const dominantElement = tiedElements.length === 1 ? tiedElements[0] : dayStemElement

  return {
    ok: true,
    value: {
      dominantElement,
      elementBalance: balance,
      todaySummary: `오늘의 파티에서는 ${dominantElement} 기운을 가볍게 즐겨 보세요. 재미로만 보는 간이 해석이에요.`,
      isSimplified: true,
      timeProvided: input.birthTime !== 'unknown',
      calculationVersion: CALCULATION_VERSION,
    },
  }
}
