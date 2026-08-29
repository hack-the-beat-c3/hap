// 메이저 아르카나 22장 + 파티 하우스 룰 순위 + Web Crypto 공정 셔플.
// 순위는 전통 타로 서열이 아니라 우리 서비스의 파티 하우스 룰이다 (AGENTS.md §2.1).

export interface TarotCard {
  id: number // 0-21
  name: string
  rank: number // 파티 하우스 룰 순위 (높을수록 강함, 1-22)
  fortune: string // 개인화 문구
}

// rank는 "오늘 파티 운세"의 강함 순서. 낙인/불쾌감 없는 밝은 톤.
export const DECK: readonly TarotCard[] = [
  { id: 0, name: '광대', rank: 22, fortune: '겁 없이 뛰어드는 오늘, 판을 뒤집는 최강 운세!' },
  { id: 1, name: '마법사', rank: 21, fortune: '뭐든 뜻대로 — 오늘의 주도권은 당신 손에.' },
  { id: 19, name: '태양', rank: 20, fortune: '어디를 가도 스포트라이트. 분위기 메이커 당첨.' },
  { id: 10, name: '운명의 수레바퀴', rank: 19, fortune: '운이 크게 도는 날. 뭘 해도 타이밍이 맞는다.' },
  { id: 17, name: '별', rank: 18, fortune: '작은 소원이 이뤄지는 반짝이는 하루.' },
  { id: 3, name: '여황제', rank: 17, fortune: '풍요와 여유. 오늘은 대접받는 자리.' },
  { id: 4, name: '황제', rank: 16, fortune: '든든한 리더. 사람들이 당신을 따른다.' },
  { id: 6, name: '연인', rank: 15, fortune: '케미 폭발. 오늘 좋은 인연이 이어진다.' },
  { id: 8, name: '힘', rank: 14, fortune: '부드럽지만 강하게. 어떤 상황도 다스린다.' },
  { id: 11, name: '정의', rank: 13, fortune: '공정한 판단. 오늘의 심판은 당신 편.' },
  { id: 2, name: '여사제', rank: 12, fortune: '직감이 예리한 날. 눈치 100단.' },
  { id: 7, name: '전차', rank: 11, fortune: '거침없이 전진. 미룬 일을 해치운다.' },
  { id: 14, name: '절제', rank: 10, fortune: '균형 잡힌 하루. 무리 없이 딱 좋게.' },
  { id: 21, name: '세계', rank: 9, fortune: '완성의 기운. 마무리가 깔끔하다.' },
  { id: 9, name: '은둔자', rank: 8, fortune: '조용히 빛나는 날. 혼자만의 인사이트.' },
  { id: 5, name: '교황', rank: 7, fortune: '조언이 통하는 날. 사람들이 당신께 묻는다.' },
  { id: 20, name: '심판', rank: 6, fortune: '다시 시작하기 좋은 날. 리셋 버튼.' },
  { id: 18, name: '달', rank: 5, fortune: '몽환적인 하루. 감성이 풍부해진다.' },
  { id: 13, name: '죽음', rank: 4, fortune: '끝은 새 시작. 변화의 문이 열린다.' },
  { id: 15, name: '악마', rank: 3, fortune: '오늘의 유혹 담당. 재미는 확실히 챙긴다.' },
  { id: 12, name: '매달린 사람', rank: 2, fortune: '한 박자 쉬어가기. 여유가 필요한 날.' },
  { id: 16, name: '탑', rank: 1, fortune: '예상 밖의 반전. 오늘 이야깃거리는 당신 몫!' },
] as const

// Web Crypto 기반 Fisher–Yates. 편향 없는 정수 난수(rejection sampling)를 쓴다.
function randomInt(maxExclusive: number): number {
  if (maxExclusive <= 0) throw new Error('maxExclusive must be > 0')
  const limit = Math.floor(0x1_0000_0000 / maxExclusive) * maxExclusive
  const buf = new Uint32Array(1)
  let x: number
  do {
    crypto.getRandomValues(buf)
    x = buf[0]
  } while (x >= limit) // limit 이상은 버려 균등 분포 유지
  return x % maxExclusive
}

// 배열을 새 배열로 셔플해 반환(원본 불변).
export function shuffle<T>(items: readonly T[]): T[] {
  const out = items.slice()
  for (let i = out.length - 1; i > 0; i--) {
    const j = randomInt(i + 1)
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

// 참가자 수만큼 중복 없이 한 장씩 배분. 정원은 덱 크기(22)로 제한.
export function dealOneEach(participantIds: readonly string[]): Record<string, TarotCard> {
  if (participantIds.length > DECK.length)
    throw new Error(`정원 초과: 최대 ${DECK.length}명`)
  const shuffled = shuffle(DECK)
  const result: Record<string, TarotCard> = {}
  participantIds.forEach((pid, i) => {
    result[pid] = shuffled[i]
  })
  return result
}
