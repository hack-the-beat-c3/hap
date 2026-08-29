export type Element = 'WOOD' | 'FIRE' | 'EARTH' | 'METAL' | 'WATER'

export type ParticipantResult = {
  id: string
  nickname: string
  element: Element
  cardId: string
  cardName: string
  cardRank: number
  cardImage?: string
}

export type Chemistry = {
  label: '상생' | '상극' | '동행'
  tone: 'supportive' | 'clash' | 'same'
  description: string
}

const generates = new Set(['WOOD:FIRE', 'FIRE:EARTH', 'EARTH:METAL', 'METAL:WATER', 'WATER:WOOD'])

const controls = new Set(['WOOD:EARTH', 'EARTH:WATER', 'WATER:FIRE', 'FIRE:METAL', 'METAL:WOOD'])

export const elementLabel: Record<Element, string> = {
  WOOD: '목',
  FIRE: '화',
  EARTH: '토',
  METAL: '금',
  WATER: '수',
}

export function rankParticipants(participants: readonly ParticipantResult[]) {
  return [...participants].sort((a, b) => a.cardRank - b.cardRank)
}

export function getChemistry(a: Element, b: Element): Chemistry {
  if (a === b) return { label: '동행', tone: 'same', description: '같은 기운으로 템포가 잘 맞아요.' }

  const forward = `${a}:${b}`
  const reverse = `${b}:${a}`
  if (generates.has(forward) || generates.has(reverse)) {
    return { label: '상생', tone: 'supportive', description: '서로의 기운을 살려주는 좋은 케미예요.' }
  }
  if (controls.has(forward) || controls.has(reverse)) {
    return { label: '상극', tone: 'clash', description: '다른 템포가 반전 재미를 만드는 케미예요.' }
  }

  throw new Error('지원하지 않는 오행 조합입니다.')
}

export function matchParticipants(a: ParticipantResult, b: ParticipantResult) {
  if (a.id === b.id) throw new Error('서로 다른 두 참가자를 선택해야 합니다.')

  return {
    winnerId: a.cardRank === b.cardRank ? null : a.cardRank < b.cardRank ? a.id : b.id,
    chemistry: getChemistry(a.element, b.element),
  }
}

export function findBestChemistryPair(
  participants: readonly ParticipantResult[],
  tone: Chemistry['tone'],
) {
  let best: readonly [ParticipantResult, ParticipantResult] | null = null
  let bestScore = Infinity

  // ponytail: O(n²) is simpler and bounded by the 15-person party limit.
  for (let i = 0; i < participants.length; i += 1) {
    for (let j = i + 1; j < participants.length; j += 1) {
      if (getChemistry(participants[i].element, participants[j].element).tone !== tone) continue
      const score = participants[i].cardRank + participants[j].cardRank
      if (score < bestScore) {
        best = [participants[i], participants[j]]
        bestScore = score
      }
    }
  }

  return best
}
