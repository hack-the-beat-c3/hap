import assert from 'node:assert/strict'
import test from 'node:test'
import { drawOneCard } from './tarot.ts'
import type { SecureRandom, TarotCard } from './tarot.ts'

function makeCards(): TarotCard[] {
  return Array.from({ length: 22 }, (_, arcanaNumber) => ({
    id: `CARD_${arcanaNumber}`,
    arcanaNumber,
    nameKo: `카드 ${arcanaNumber}`,
    nameEn: `Card ${arcanaNumber}`,
    imagePath: `/cards/${arcanaNumber}.png`,
    summary: '한 줄 해석',
    description: '카드 해설',
    partyMessage: '오늘의 메시지',
  }))
}

function queuedRandom(...queue: number[]): {
  source: SecureRandom
  calls: () => number
} {
  let callCount = 0
  return {
    source: {
      getRandomValues(values) {
        const next = queue[callCount++]
        assert.notEqual(next, undefined)
        values[0] = next
        return values
      },
    },
    calls: () => callCount,
  }
}

test('22장·고유 ID·0~21 번호·필수 문구를 검증한다', () => {
  const cards = makeCards()
  const unused = queuedRandom(0).source

  assert.throws(() => drawOneCard(cards.slice(1), unused), /22장/)
  assert.throws(
    () => drawOneCard(cards.map((card, index) => (index === 1 ? { ...card, id: cards[0].id } : card)), unused),
    /ID/,
  )
  assert.throws(
    () =>
      drawOneCard(
        cards.map((card, index) => (index === 1 ? { ...card, arcanaNumber: 0 } : card)),
        unused,
      ),
    /번호/,
  )
})

test('수용 경계값은 첫 카드와 마지막 카드를 선택한다', () => {
  const cards = makeCards()
  const limit = Math.floor(2 ** 32 / 22) * 22

  assert.strictEqual(drawOneCard(cards, queuedRandom(0).source), cards[0])
  assert.strictEqual(drawOneCard(cards, queuedRandom(limit - 1).source), cards[21])
})

test('편향 구간을 거부하고 한 장만 반환한다', () => {
  const cards = makeCards()
  const limit = Math.floor(2 ** 32 / 22) * 22
  const random = queuedRandom(limit, 7)

  assert.strictEqual(drawOneCard(cards, random.source), cards[7])
  assert.equal(random.calls(), 2)
})
