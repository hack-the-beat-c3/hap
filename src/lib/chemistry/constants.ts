import type { FiveElement, RelationType } from '../../types/element';

export const ELEMENT_ORDER: readonly FiveElement[] = ['木', '火', '土', '金', '水'] as const;

/**
 * 상생 순환표: A가 B를 생함 (A -> B)
 * 木 -> 火 -> 土 -> 金 -> 水 -> 木
 */
export const GENERATING_CYCLE: Record<FiveElement, FiveElement> = {
  木: '火',
  火: '土',
  土: '金',
  金: '水',
  水: '木',
};

/**
 * 상생 역순: A가 B로부터 생을 받음 (B -> A)
 */
export const SUPPORTING_CYCLE: Record<FiveElement, FiveElement> = {
  木: '水',
  火: '木',
  土: '火',
  金: '土',
  水: '金',
};

export interface ElementMeta {
  hanja: FiveElement;
  nameKorean: string;
  nameEnglish: string;
  symbol: string;
  keyword: string;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
}

export const ELEMENT_META: Record<FiveElement, ElementMeta> = {
  木: {
    hanja: '木',
    nameKorean: '목 (나무)',
    nameEnglish: 'Wood',
    symbol: '🌲',
    keyword: '성장과 유연성',
    color: '#15803d',
    bgColor: '#f0fdf4',
    borderColor: '#86efac',
    description: '새로운 시작을 열고 따뜻하게 뻗어나가는 생명력',
  },
  火: {
    hanja: '火',
    nameKorean: '화 (불)',
    nameEnglish: 'Fire',
    symbol: '🔥',
    keyword: '열정과 표현력',
    color: '#b91c1c',
    bgColor: '#fef2f2',
    borderColor: '#fca5a5',
    description: '주변을 환하게 밝히고 에너지를 전파하는 직관과 온기',
  },
  土: {
    hanja: '土',
    nameKorean: '토 (흙)',
    nameEnglish: 'Earth',
    symbol: '⛰️',
    keyword: '안정과 포용력',
    color: '#b45309',
    bgColor: '#fffbeb',
    borderColor: '#fde68a',
    description: '서로 다른 기운을 부드럽게 조율하고 품어주는 든든함',
  },
  金: {
    hanja: '金',
    nameKorean: '금 (쇠)',
    nameEnglish: 'Metal',
    symbol: '⚔️',
    keyword: '결단과 완성도',
    color: '#334155',
    bgColor: '#f8fafc',
    borderColor: '#cbd5e1',
    description: '군더더기를 덜어내고 핵심을 명확하게 꿰뚫는 통찰',
  },
  水: {
    hanja: '水',
    nameKorean: '수 (물)',
    nameEnglish: 'Water',
    symbol: '🌊',
    keyword: '지혜와 융통성',
    color: '#1d4ed8',
    bgColor: '#eff6ff',
    borderColor: '#93c5fd',
    description: '어떤 그릇에도 유연하게 맞춰 흐르며 깊이를 더하는 지혜',
  },
};

export const RELATION_LABELS: Record<RelationType, string> = {
  complement: '기운 채움',
  generate: '힘 북돋움',
  support: '기운 받음',
  mirror: '결이 닮음',
};
