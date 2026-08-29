import { describe, it, expect } from 'vitest'
import {
  findBestChemistryPair,
  getChemistry,
  matchParticipants,
  rankParticipants,
  type ParticipantResult,
} from '../src/partyMatch.ts'

describe('party-match logic test', () => {
  const people: ParticipantResult[] = [
    { id: 'a', nickname: '가람', element: 'WOOD', cardId: 'sun', cardName: '태양', cardRank: 2 },
    { id: 'b', nickname: '나래', element: 'FIRE', cardId: 'world', cardName: '세계', cardRank: 1 },
    { id: 'c', nickname: '다온', element: 'EARTH', cardId: 'star', cardName: '별', cardRank: 2 },
  ]

  it('참가자 순위를 올바르게 정렬한다', () => {
    expect(rankParticipants(people).map(({ id }) => id)).toEqual(['b', 'a', 'c'])
  })

  it('1:1 매칭 승자와 케미를 올바르게 계산한다', () => {
    expect(matchParticipants(people[0], people[1]).winnerId).toBe('b')
    expect(matchParticipants(people[0], people[2]).chemistry.label).toBe('상극')
    expect(getChemistry('FIRE', 'WOOD').label).toBe('상생')
    expect(getChemistry('WATER', 'WATER').label).toBe('동행')
  })

  it('최고 케미 쌍을 탐색한다', () => {
    expect(findBestChemistryPair(people, 'supportive')?.map(({ id }) => id)).toEqual(['a', 'b'])
    expect(() => matchParticipants(people[0], people[0])).toThrow()
  })
})
