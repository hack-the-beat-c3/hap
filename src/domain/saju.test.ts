import { describe, it, expect } from 'vitest'
import { calculateTodaySaju } from './saju.ts'

const TODAY = new Date(2026, 7, 29, 12)

describe('saju domain test', () => {
  it('생년월일 형식·실제 날짜·미래 날짜를 검증한다', () => {
    for (const birthDate of ['', '2026/08/29', '2025-02-29', '2026-08-30']) {
      expect(() => calculateTodaySaju({ birthDate }, TODAY)).toThrow(RangeError)
    }
  })

  it('같은 생년월일과 기준일은 같은 간이 해석을 만든다', () => {
    const first = calculateTodaySaju({ birthDate: '1994-07-16' }, TODAY)
    const second = calculateTodaySaju({ birthDate: '1994-07-16' }, TODAY)

    expect(first).toEqual(second)
    expect(first.calculatedFor).toBe('2026-08-29')
    expect(first.disclaimer).toMatch(/엔터테인먼트용/)
    expect(first.disclaimer).toMatch(/전통 사주팔자 풀이가 아닙니다/)
    expect('birthDate' in first).toBe(false)
  })
})
