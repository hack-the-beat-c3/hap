export type TarotCard = {
  id: string
  arcanaNumber: number
  nameKo: string
  nameEn: string
  imagePath: string
  summary: string
  description: string
  partyMessage: string
}

export type SecureRandom = Pick<Crypto, 'getRandomValues'>

function assertValidCatalog(cards: readonly TarotCard[]): void {
  if (cards.length !== 22) {
    throw new RangeError('타로 카탈로그는 정확히 22장이어야 합니다.')
  }

  const ids = new Set<string>()
  const numbers = new Set<number>()
  for (const card of cards) {
    if (
      !card ||
      !card.id.trim() ||
      !card.nameKo.trim() ||
      !card.nameEn.trim() ||
      !card.imagePath.trim() ||
      !card.summary.trim() ||
      !card.description.trim() ||
      !card.partyMessage.trim() ||
      !Number.isInteger(card.arcanaNumber) ||
      card.arcanaNumber < 0 ||
      card.arcanaNumber > 21 ||
      ids.has(card.id) ||
      numbers.has(card.arcanaNumber)
    ) {
      throw new RangeError('타로 카탈로그의 ID, 번호, 이미지, 해설은 비어 있거나 중복될 수 없습니다.')
    }
    ids.add(card.id)
    numbers.add(card.arcanaNumber)
  }
}

export function drawOneCard<Card extends TarotCard>(
  cards: readonly Card[],
  randomSource: SecureRandom,
): Card {
  assertValidCatalog(cards)
  if (!randomSource || typeof randomSource.getRandomValues !== 'function') {
    throw new Error('안전한 난수 생성기를 사용할 수 없습니다.')
  }

  const range = 2 ** 32
  const limit = Math.floor(range / cards.length) * cards.length
  const value = new Uint32Array(1)
  do {
    randomSource.getRandomValues(value)
  } while (value[0] >= limit)

  return cards[value[0] % cards.length]
}
