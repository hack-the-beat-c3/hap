import assert from 'node:assert/strict'
import {
  findBestChemistryPair,
  getChemistry,
  matchParticipants,
  rankParticipants,
  type ParticipantResult,
} from '../src/partyMatch.ts'

const people: ParticipantResult[] = [
  { id: 'a', nickname: '가람', element: 'WOOD', cardId: 'sun', cardName: '태양', cardRank: 2 },
  { id: 'b', nickname: '나래', element: 'FIRE', cardId: 'world', cardName: '세계', cardRank: 1 },
  { id: 'c', nickname: '다온', element: 'EARTH', cardId: 'star', cardName: '별', cardRank: 2 },
]

assert.deepEqual(rankParticipants(people).map(({ id }) => id), ['b', 'a', 'c'])
assert.equal(matchParticipants(people[0], people[1]).winnerId, 'b')
assert.equal(matchParticipants(people[0], people[2]).chemistry.label, '상극')
assert.equal(getChemistry('FIRE', 'WOOD').label, '상생')
assert.equal(getChemistry('WATER', 'WATER').label, '동행')
assert.deepEqual(findBestChemistryPair(people, 'supportive')?.map(({ id }) => id), ['a', 'b'])
assert.throws(() => matchParticipants(people[0], people[0]))

console.log('party-match self-check: PASS')
