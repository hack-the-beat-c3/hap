import type { ElementCounts, FiveElement } from '../../types/element';
import { ELEMENT_ORDER } from './constants';

export interface DeficientElementResult {
  deficientElement: FiveElement;
  isBalanced: boolean;
  minValue: number;
}

/**
 * 사주 오행 분포에서 부족한 오행 1개를 결정론적으로 산출합니다.
 * 
 * [규칙 - PRD §4.2]
 * 1. elements에서 값이 가장 작은 오행을 선택합니다.
 * 2. 동률이면 木 -> 火 -> 土 -> 金 -> 水 순서에서 앞선 것을 선택합니다.
 * 3. 5종이 모두 동일한 값이면 土를 선택하고 isBalanced를 true로 설정합니다.
 *
 * @param elements 각 오행별 수치 (예: { 木: 0, 火: 2, 土: 1, 金: 3, 水: 2 })
 * @returns 산출된 부족 오행 및 균형 여부
 */
export function pickDeficientElement(elements: ElementCounts): DeficientElementResult {
  const counts = ELEMENT_ORDER.map((el) => ({
    element: el,
    count: typeof elements[el] === 'number' && !Number.isNaN(elements[el]) ? elements[el] : 0,
  }));

  // 1. 모든 오행의 수치가 완전히 동일한지 확인
  const firstCount = counts[0].count;
  const isAllEqual = counts.every((c) => c.count === firstCount);

  if (isAllEqual) {
    return {
      deficientElement: '土',
      isBalanced: true,
      minValue: firstCount,
    };
  }

  // 2. 최솟값 탐색 (동률 시 ELEMENT_ORDER 기준 먼저 등장한 오행이 유지됨)
  let minElement: FiveElement = '木';
  let minCount = Infinity;

  for (const item of counts) {
    if (item.count < minCount) {
      minCount = item.count;
      minElement = item.element;
    }
  }

  return {
    deficientElement: minElement,
    isBalanced: false,
    minValue: minCount,
  };
}
