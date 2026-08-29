import { describe, expect, test } from 'vitest'

import { buildParticipantPayload } from './allowlist'
import type { SajuResult } from '../saju/engine'

const result: SajuResult = {
  dominantElement: '화',
  elementBalance: { 목: 1, 화: 3, 토: 2, 금: 0, 수: 0 },
  todaySummary: '오늘의 파티에서는 화 기운을 가볍게 즐겨 보세요.',
  isSimplified: true,
  timeProvided: true,
  calculationVersion: 'adr-0001-v1',
}

describe('buildParticipantPayload', () => {
  test('contains exactly the allowlisted keys', () => {
    const payload = buildParticipantPayload('테스트', result)

    expect(Object.keys(payload).sort()).toEqual(
      ['calculationVersion', 'dominantElement', 'elementBalance', 'nickname'].sort(),
    )
  })

  test('carries through the nickname and derived values only', () => {
    const payload = buildParticipantPayload('테스트', result)

    expect(payload).toEqual({
      nickname: '테스트',
      dominantElement: '화',
      elementBalance: { 목: 1, 화: 3, 토: 2, 금: 0, 수: 0 },
      calculationVersion: 'adr-0001-v1',
    })
  })

  test('never exposes raw todaySummary, isSimplified, or timeProvided fields', () => {
    const payload = buildParticipantPayload('테스트', result) as unknown as Record<string, unknown>

    expect(payload.todaySummary).toBeUndefined()
    expect(payload.isSimplified).toBeUndefined()
    expect(payload.timeProvided).toBeUndefined()
  })
})
