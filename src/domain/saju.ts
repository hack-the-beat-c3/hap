export type Element = 'WOOD' | 'FIRE' | 'EARTH' | 'METAL' | 'WATER'

export type BirthInput = {
  birthDate: string
}

export type SajuResult = {
  calculatedFor: string
  primaryElement: Element
  title: string
  summary: string
  advice: string
  disclaimer: string
}

const READINGS = [
  {
    primaryElement: 'WOOD',
    title: '새로운 흐름이 자라나는 날',
    summary: '목의 기운처럼 호기심과 성장의 흐름이 돋보여요.',
    advice: '작은 시작 하나를 골라 부담 없이 실행해 보세요.',
  },
  {
    primaryElement: 'FIRE',
    title: '반짝이는 에너지가 피어나는 날',
    summary: '화의 기운처럼 활기와 표현력이 돋보여요.',
    advice: '마음에 담아 둔 말을 따뜻하고 솔직하게 전해 보세요.',
  },
  {
    primaryElement: 'EARTH',
    title: '차분함이 행운을 부르는 날',
    summary: '토의 기운처럼 안정감과 균형 감각이 돋보여요.',
    advice: '급하게 결정하기보다 순서를 정하고 한 가지씩 정리해 보세요.',
  },
  {
    primaryElement: 'METAL',
    title: '선명한 선택이 힘이 되는 날',
    summary: '금의 기운처럼 결단력과 집중력이 돋보여요.',
    advice: '오늘 꼭 필요한 일과 놓아줄 일을 하나씩 골라 보세요.',
  },
  {
    primaryElement: 'WATER',
    title: '유연한 감각이 길을 여는 날',
    summary: '수의 기운처럼 직관과 적응력이 돋보여요.',
    advice: '예상과 다른 흐름이 와도 잠시 관찰한 뒤 유연하게 움직여 보세요.',
  },
] as const

const DISCLAIMER =
  '생년월일과 오늘 날짜를 조합한 엔터테인먼트용 간이 해석으로, 전통 사주팔자 풀이가 아닙니다.'

function localDateKey(date: Date): string {
  if (!Number.isFinite(date.getTime())) {
    throw new RangeError('기준 날짜가 유효하지 않습니다.')
  }

  const year = String(date.getFullYear()).padStart(4, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function assertValidBirthDate(birthDate: string, todayKey: string): void {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birthDate)
  if (!match) {
    throw new RangeError('생년월일은 YYYY-MM-DD 형식이어야 합니다.')
  }

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
  const daysInMonth = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

  if (
    year < 1 ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > daysInMonth[month - 1] ||
    birthDate > todayKey
  ) {
    throw new RangeError('유효한 과거 또는 오늘의 생년월일을 입력해 주세요.')
  }
}

export function calculateTodaySaju(
  birthInput: Readonly<BirthInput>,
  today: Date = new Date(),
): SajuResult {
  const calculatedFor = localDateKey(today)
  assertValidBirthDate(birthInput.birthDate, calculatedFor)

  let hash = 0
  for (const character of `${birthInput.birthDate}|${calculatedFor}`) {
    hash = (Math.imul(hash, 31) + character.charCodeAt(0)) >>> 0
  }

  const reading = READINGS[hash % READINGS.length]
  return { calculatedFor, ...reading, disclaimer: DISCLAIMER }
}
