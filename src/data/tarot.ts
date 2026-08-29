export type TarotCard = Readonly<{
  id:
    | 'THE_FOOL'
    | 'THE_MAGICIAN'
    | 'THE_HIGH_PRIESTESS'
    | 'THE_EMPRESS'
    | 'THE_EMPEROR'
    | 'THE_HIEROPHANT'
    | 'THE_LOVERS'
    | 'THE_CHARIOT'
    | 'STRENGTH'
    | 'THE_HERMIT'
    | 'WHEEL_OF_FORTUNE'
    | 'JUSTICE'
    | 'THE_HANGED_MAN'
    | 'DEATH'
    | 'TEMPERANCE'
    | 'THE_DEVIL'
    | 'THE_TOWER'
    | 'THE_STAR'
    | 'THE_MOON'
    | 'THE_SUN'
    | 'JUDGEMENT'
    | 'THE_WORLD'
  arcanaNumber:
    | 0
    | 1
    | 2
    | 3
    | 4
    | 5
    | 6
    | 7
    | 8
    | 9
    | 10
    | 11
    | 12
    | 13
    | 14
    | 15
    | 16
    | 17
    | 18
    | 19
    | 20
    | 21
  nameKo: string
  nameEn: string
  imagePath: `/tarot/${string}.png`
  summary: string
  description: string
  partyMessage: string
}>

export const TAROT_CARDS = [
  {
    id: 'THE_FOOL',
    arcanaNumber: 0,
    nameKo: '광대',
    nameEn: 'The Fool',
    imagePath: '/tarot/00-the-fool.png',
    summary: '새로운 시작을 즐길 용기',
    description: '익숙한 계획보다 호기심을 따라 가볍게 첫발을 내딛을 때예요.',
    partyMessage: '오늘은 먼저 인사하는 사람이 분위기를 엽니다.',
  },
  {
    id: 'THE_MAGICIAN',
    arcanaNumber: 1,
    nameKo: '마법사',
    nameEn: 'The Magician',
    imagePath: '/tarot/01-the-magician.png',
    summary: '가진 재능을 행동으로 바꿀 순간',
    description: '이미 가진 도구와 자신감을 모으면 바라던 흐름을 만들 수 있어요.',
    partyMessage: '당신의 한마디가 오늘의 재미를 시작합니다.',
  },
  {
    id: 'THE_HIGH_PRIESTESS',
    arcanaNumber: 2,
    nameKo: '여사제',
    nameEn: 'The High Priestess',
    imagePath: '/tarot/02-the-high-priestess.png',
    summary: '조용한 직감이 답을 알려주는 날',
    description: '서두르기보다 마음속 첫 느낌을 살피면 중요한 힌트를 찾을 수 있어요.',
    partyMessage: '말보다 눈빛이 통하는 사람을 찾아보세요.',
  },
  {
    id: 'THE_EMPRESS',
    arcanaNumber: 3,
    nameKo: '여황제',
    nameEn: 'The Empress',
    imagePath: '/tarot/03-the-empress.png',
    summary: '풍요와 다정함이 번지는 하루',
    description: '나와 주변을 넉넉하게 돌보는 태도가 좋은 기운을 키워줘요.',
    partyMessage: '따뜻한 칭찬 한마디가 행운을 부릅니다.',
  },
  {
    id: 'THE_EMPEROR',
    arcanaNumber: 4,
    nameKo: '황제',
    nameEn: 'The Emperor',
    imagePath: '/tarot/04-the-emperor.png',
    summary: '흔들림 없이 중심을 잡는 힘',
    description: '분명한 기준을 세우고 차근차근 움직이면 안정적인 결과가 따라와요.',
    partyMessage: '모두가 망설일 때 자연스럽게 방향을 잡아보세요.',
  },
  {
    id: 'THE_HIEROPHANT',
    arcanaNumber: 5,
    nameKo: '교황',
    nameEn: 'The Hierophant',
    imagePath: '/tarot/05-the-hierophant.png',
    summary: '좋은 조언과 연결되는 날',
    description: '검증된 지혜를 듣고 나만의 방식으로 받아들이면 길이 선명해져요.',
    partyMessage: '경험 많은 사람의 이야기에 뜻밖의 답이 있어요.',
  },
  {
    id: 'THE_LOVERS',
    arcanaNumber: 6,
    nameKo: '연인',
    nameEn: 'The Lovers',
    imagePath: '/tarot/06-the-lovers.png',
    summary: '마음이 맞는 선택과 만남',
    description: '솔직한 마음으로 선택할수록 관계와 기회가 자연스럽게 이어져요.',
    partyMessage: '취향이 닮은 사람과 대화를 시작해보세요.',
  },
  {
    id: 'THE_CHARIOT',
    arcanaNumber: 7,
    nameKo: '전차',
    nameEn: 'The Chariot',
    imagePath: '/tarot/07-the-chariot.png',
    summary: '목표를 향해 힘차게 전진',
    description: '흩어진 에너지를 한곳에 모으면 원하는 방향으로 빠르게 나아갈 수 있어요.',
    partyMessage: '오늘 하고 싶은 일을 먼저 제안해보세요.',
  },
  {
    id: 'STRENGTH',
    arcanaNumber: 8,
    nameKo: '힘',
    nameEn: 'Strength',
    imagePath: '/tarot/08-strength.png',
    summary: '부드러움 속에 숨은 단단한 용기',
    description: '억지로 밀어붙이기보다 침착함과 배려로 상황을 이끌어보세요.',
    partyMessage: '편안한 미소가 가장 강한 매력이 됩니다.',
  },
  {
    id: 'THE_HERMIT',
    arcanaNumber: 9,
    nameKo: '은둔자',
    nameEn: 'The Hermit',
    imagePath: '/tarot/09-the-hermit.png',
    summary: '잠시 멈춰 나만의 답을 찾는 시간',
    description: '주변의 소음에서 한걸음 물러나면 꼭 필요한 생각이 또렷해져요.',
    partyMessage: '깊은 대화 하나가 여러 인사보다 오래 남아요.',
  },
  {
    id: 'WHEEL_OF_FORTUNE',
    arcanaNumber: 10,
    nameKo: '운명의 수레바퀴',
    nameEn: 'Wheel of Fortune',
    imagePath: '/tarot/10-wheel-of-fortune.png',
    summary: '뜻밖의 변화가 기회가 되는 날',
    description: '새로운 흐름을 열린 마음으로 맞이하면 우연이 좋은 계기로 바뀔 수 있어요.',
    partyMessage: '예상 밖의 자리에서 반가운 인연을 만나보세요.',
  },
  {
    id: 'JUSTICE',
    arcanaNumber: 11,
    nameKo: '정의',
    nameEn: 'Justice',
    imagePath: '/tarot/11-justice.png',
    summary: '균형 잡힌 판단이 빛나는 순간',
    description: '감정과 사실을 함께 살피고 정직하게 선택하면 마음도 편안해져요.',
    partyMessage: '모두의 이야기를 고르게 들어주는 사람이 되어보세요.',
  },
  {
    id: 'THE_HANGED_MAN',
    arcanaNumber: 12,
    nameKo: '매달린 사람',
    nameEn: 'The Hanged Man',
    imagePath: '/tarot/12-the-hanged-man.png',
    summary: '다른 시선에서 발견하는 해답',
    description: '잠시 속도를 늦추고 관점을 바꾸면 막혔던 일이 새롭게 보여요.',
    partyMessage: '평소와 다른 사람 옆에 앉아 이야기를 나눠보세요.',
  },
  {
    id: 'DEATH',
    arcanaNumber: 13,
    nameKo: '죽음',
    nameEn: 'Death',
    imagePath: '/tarot/13-death.png',
    summary: '끝을 비워 새 출발을 맞는 변화',
    description: '낡은 습관이나 걱정을 내려놓을수록 새로운 가능성이 들어올 자리가 생겨요.',
    partyMessage: '오늘은 익숙한 패턴 하나를 유쾌하게 바꿔보세요.',
  },
  {
    id: 'TEMPERANCE',
    arcanaNumber: 14,
    nameKo: '절제',
    nameEn: 'Temperance',
    imagePath: '/tarot/14-temperance.png',
    summary: '서로 다른 기운을 조화시키는 날',
    description: '속도와 쉼, 내 생각과 상대의 의견 사이에서 알맞은 균형을 찾아보세요.',
    partyMessage: '서로 다른 취향을 이어주는 다리가 되어보세요.',
  },
  {
    id: 'THE_DEVIL',
    arcanaNumber: 15,
    nameKo: '악마',
    nameEn: 'The Devil',
    imagePath: '/tarot/15-the-devil.png',
    summary: '강한 끌림을 현명하게 다룰 때',
    description: '재미와 욕심에 휩쓸리지 않고 내가 선택권을 쥐고 있는지 살펴보세요.',
    partyMessage: '분위기는 즐기되 내 페이스는 지켜주세요.',
  },
  {
    id: 'THE_TOWER',
    arcanaNumber: 16,
    nameKo: '탑',
    nameEn: 'The Tower',
    imagePath: '/tarot/16-the-tower.png',
    summary: '갑작스러운 전환이 만드는 새 공간',
    description: '예상과 다른 일이 생겨도 고정관념을 내려놓으면 더 나은 선택지가 보여요.',
    partyMessage: '돌발 상황도 오늘의 재미로 바꾸는 순발력이 빛나요.',
  },
  {
    id: 'THE_STAR',
    arcanaNumber: 17,
    nameKo: '별',
    nameEn: 'The Star',
    imagePath: '/tarot/17-the-star.png',
    summary: '희망과 영감이 반짝이는 하루',
    description: '좋은 가능성을 믿고 작은 소망부터 표현하면 새로운 길이 열려요.',
    partyMessage: '당신의 기대를 나누면 함께할 사람이 나타납니다.',
  },
  {
    id: 'THE_MOON',
    arcanaNumber: 18,
    nameKo: '달',
    nameEn: 'The Moon',
    imagePath: '/tarot/18-the-moon.png',
    summary: '섬세한 감각으로 흐름을 읽는 밤',
    description: '모호한 상황에서는 결론을 서두르지 말고 느낌과 사실을 천천히 구분해보세요.',
    partyMessage: '은근한 분위기 속 진솔한 대화가 잘 어울려요.',
  },
  {
    id: 'THE_SUN',
    arcanaNumber: 19,
    nameKo: '태양',
    nameEn: 'The Sun',
    imagePath: '/tarot/19-the-sun.png',
    summary: '밝은 에너지와 자신감이 가득한 날',
    description: '기쁨을 숨기지 않고 솔직하게 표현할수록 주변에도 좋은 기운이 퍼져요.',
    partyMessage: '환한 리액션으로 오늘의 중심이 되어보세요.',
  },
  {
    id: 'JUDGEMENT',
    arcanaNumber: 20,
    nameKo: '심판',
    nameEn: 'Judgement',
    imagePath: '/tarot/20-judgement.png',
    summary: '지나온 경험이 답으로 돌아오는 순간',
    description: '과거의 선택을 솔직히 돌아보면 지금 꼭 필요한 결정을 내릴 수 있어요.',
    partyMessage: '오래 미뤄둔 인사나 제안을 오늘 건네보세요.',
  },
  {
    id: 'THE_WORLD',
    arcanaNumber: 21,
    nameKo: '세계',
    nameEn: 'The World',
    imagePath: '/tarot/21-the-world.png',
    summary: '완성과 연결의 기쁨을 누리는 날',
    description: '쌓아온 경험이 하나로 이어지며 만족스러운 마무리와 다음 시작을 준비해요.',
    partyMessage: '오늘 만난 사람들과 즐거운 순간을 완성해보세요.',
  },
] as const satisfies readonly TarotCard[]
