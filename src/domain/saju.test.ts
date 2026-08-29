import assert from 'node:assert/strict'
import test from 'node:test'
import { calculateTodaySaju } from './saju.ts'

const TODAY = new Date(2026, 7, 29, 12)

test('생년월일 형식·실제 날짜·미래 날짜를 검증한다', () => {
  for (const birthDate of ['', '2026/08/29', '2025-02-29', '2026-08-30']) {
    assert.throws(() => calculateTodaySaju({ birthDate }, TODAY), RangeError)
  }
})

test('같은 생년월일과 기준일은 같은 간이 해석을 만든다', () => {
  const first = calculateTodaySaju({ birthDate: '1994-07-16' }, TODAY)
  const second = calculateTodaySaju({ birthDate: '1994-07-16' }, TODAY)

  assert.deepEqual(first, second)
  assert.equal(first.calculatedFor, '2026-08-29')
  assert.match(first.disclaimer, /엔터테인먼트용/)
  assert.match(first.disclaimer, /전통 사주팔자 풀이가 아닙니다/)
  assert.equal('birthDate' in first, false)
})
