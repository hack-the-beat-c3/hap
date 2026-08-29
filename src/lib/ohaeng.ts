// 오행(五行) + 사주 간이 엔진.
// 원본 생년월일은 브라우저에서만 다루고, 서버/타 참가자에게는 파생 오행만 노출한다 (AGENTS.md §2.2).
// 결과는 엔터테인먼트용이며 과학적 예측이 아니다.

export type Element = '목' | '화' | '토' | '금' | '수'

export const ELEMENTS: readonly Element[] = ['목', '화', '토', '금', '수'] as const

// 천간(天干) 10개 → 오행. 서기 4년 = 갑자년 기준으로 (year - 4) % 10 → 천간 index (0=갑).
// 0갑 1을(목) · 2병 3정(화) · 4무 5기(토) · 6경 7신(금) · 8임 9계(수)
const STEM_ELEMENT_BY_GANJI: readonly Element[] = ['목', '목', '화', '화', '토', '토', '금', '금', '수', '수']

export interface BirthInput {
  year: number
  month: number // 1-12
  day: number // 1-31
  hour?: number // 0-23, 모름이면 undefined
}

export interface DerivedProfile {
  yearElement: Element // 연간(年干) 오행 — 주 오행
  dayElement: Element // 일진 근사 오행 — 보조
  hourKnown: boolean
  // 표시용 요약. 원본 생년월일은 포함하지 않는다.
  summary: string
}

// 연도 → 연간 오행. ponytail: 자정/입춘 경계는 미반영한 간이식(known ceiling).
// 정밀 절기 경계는 ADR로 KASI 라이브러리 채택 시 교체. 승부에는 영향 없음(공정 셔플).
export function yearElement(year: number): Element {
  const idx = ((year - 4) % 10 + 10) % 10
  return STEM_ELEMENT_BY_GANJI[idx]
}

// 일(day) → 오행 근사. 연속 일수 기반 간이 회전(정밀 만세력 아님).
export function dayElement(year: number, month: number, day: number): Element {
  // 그레고리력 → 대략적 일련번호. 정밀도보다 안정적 분산이 목적.
  const serial = Math.floor(new Date(Date.UTC(year, month - 1, day)).getTime() / 86_400_000)
  const idx = ((serial % 10) + 10) % 10
  return STEM_ELEMENT_BY_GANJI[idx]
}

export function derive(input: BirthInput): DerivedProfile {
  const ye = yearElement(input.year)
  const de = dayElement(input.year, input.month, input.day)
  const hourKnown = typeof input.hour === 'number'
  const summary = hourKnown
    ? `주 오행 ${ye}, 보조 ${de}`
    : `주 오행 ${ye}, 보조 ${de} (시간주 제외 간이 해석)`
  return { yearElement: ye, dayElement: de, hourKnown, summary }
}

// 상생(生): 목→화→토→금→수→목. 각 원소가 "낳는" 다음 원소.
const GENERATES: Record<Element, Element> = {
  목: '화',
  화: '토',
  토: '금',
  금: '수',
  수: '목',
}

// 상극(克): 목→토→수→화→금→목. 각 원소가 "이기는" 원소.
const OVERCOMES: Record<Element, Element> = {
  목: '토',
  토: '수',
  수: '화',
  화: '금',
  금: '목',
}

export type ChemistryKind = '상생' | '상극' | '동일' | '중립'

export interface Chemistry {
  kind: ChemistryKind
  score: number // 0-100, 높을수록 케미 좋음
  label: string
}

// 두 오행 사이 궁합. 대칭이 아니다(A가 B를 생/극).
export function chemistry(a: Element, b: Element): Chemistry {
  if (a === b) return { kind: '동일', score: 70, label: '같은 오행 — 편안한 짝' }
  if (GENERATES[a] === b || GENERATES[b] === a)
    return { kind: '상생', score: 95, label: '상생 — 오늘 최고의 케미' }
  if (OVERCOMES[a] === b || OVERCOMES[b] === a)
    return { kind: '상극', score: 25, label: '상극 — 티격태격 주의' }
  return { kind: '중립', score: 55, label: '무난한 사이' }
}
