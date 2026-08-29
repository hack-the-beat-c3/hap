// 자체 검증(프레임워크 없음). 실행: `npx tsx src/lib/selfcheck.ts`
// 비자명 로직(공정 셔플, 오행 궁합, 룸 전이)이 깨지면 여기서 실패한다.

import { chemistry, ELEMENTS } from './ohaeng'
import { DECK, dealOneEach, shuffle } from './tarot'
import { join, newRoom, reveal, setReady, winner, MAX_PARTICIPANTS } from './room'

let failed = 0
function ok(cond: boolean, msg: string) {
  if (!cond) {
    failed++
    console.error('  ✗', msg)
  } else {
    console.log('  ✓', msg)
  }
}

console.log('shuffle:')
{
  const s = shuffle(DECK)
  ok(s.length === DECK.length, '길이 보존')
  ok(new Set(s.map((c) => c.id)).size === DECK.length, '중복 없음 / 누락 없음')
  // 분포 스모크: 여러 번 섞으면 0번 카드가 여러 위치에 나타난다(고정 아님).
  const positions = new Set<number>()
  for (let i = 0; i < 50; i++) positions.add(shuffle(DECK).findIndex((c) => c.id === 0))
  ok(positions.size > 1, '셔플이 실제로 섞임(고정 아님)')
}

console.log('deal:')
{
  const ids = ['a', 'b', 'c', 'd']
  const deal = dealOneEach(ids)
  ok(Object.keys(deal).length === 4, '참가자당 1장')
  ok(new Set(Object.values(deal).map((c) => c.id)).size === 4, '배분 카드 중복 없음')
  let threw = false
  try {
    dealOneEach(Array.from({ length: DECK.length + 1 }, (_, i) => String(i)))
  } catch {
    threw = true
  }
  ok(threw, '덱 크기 초과 배분은 거부')
}

console.log('chemistry:')
{
  ok(chemistry('목', '화').kind === '상생', '목→화 상생')
  ok(chemistry('화', '목').kind === '상생', '화→목 상생(대칭)')
  ok(chemistry('목', '토').kind === '상극', '목→토 상극')
  ok(chemistry('토', '목').kind === '상극', '토→목 상극(대칭)')
  ok(chemistry('목', '목').kind === '동일', '같은 오행 동일')
  ok(chemistry('목', '금').kind === '상극', '목-금 상극')
  ok(chemistry('목', '수').kind === '상생', '목-수 상생')
  // 모든 쌍이 예외 없이 판정되는지
  let all = true
  for (const a of ELEMENTS) for (const b of ELEMENTS) if (!chemistry(a, b).kind) all = false
  ok(all, '25개 조합 전부 판정됨')
}

console.log('room transitions:')
{
  let r = newRoom('1234')
  ok(r.phase === 'lobby', '초기 phase lobby')
  r = join(r, { id: 'h', nickname: '호스트', element: '목' })
  r = join(r, { id: 'g', nickname: '게스트', element: '화' })
  ok(r.participants.length === 2, '2명 입장')

  let dupThrew = false
  try {
    join(r, { id: 'x', nickname: '호스트', element: '수' })
  } catch {
    dupThrew = true
  }
  ok(dupThrew, '중복 닉네임 거부')

  r = setReady(r, 'g', true)
  ok(r.participants.find((p) => p.id === 'g')!.ready, 'ready 반영')

  r = reveal(r)
  ok(r.phase === 'revealed', '공개 후 phase revealed')
  ok(Object.keys(r.deal).length === 2, '공개 시 전원 배분')
  const w = winner(r)
  ok(w !== null, '우승자 존재')
  const wCard = r.deal[w!.id]
  ok(
    Object.values(r.deal).every((c) => c.rank <= wCard.rank),
    '우승자가 최고 rank',
  )

  let joinAfterThrew = false
  try {
    join(r, { id: 'late', nickname: '지각', element: '토' })
  } catch {
    joinAfterThrew = true
  }
  ok(joinAfterThrew, '공개 후 입장 거부')

  // 만원 룸
  let full = newRoom('9999')
  for (let i = 0; i < MAX_PARTICIPANTS; i++)
    full = join(full, { id: 'p' + i, nickname: 'p' + i, element: '목' })
  let fullThrew = false
  try {
    join(full, { id: 'over', nickname: 'over', element: '목' })
  } catch {
    fullThrew = true
  }
  ok(fullThrew, '만원 룸 입장 거부')
}

if (failed > 0) {
  console.error(`\n${failed} check(s) FAILED`)
  process.exit(1)
} else {
  console.log('\nall checks passed ✓')
}
