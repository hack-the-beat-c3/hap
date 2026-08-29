import type { FiveElement, RelationType } from '../../types/element';
import { GENERATING_CYCLE, SUPPORTING_CYCLE, RELATION_LABELS } from './constants';

export interface RelationClassification {
  relationType: RelationType;
  relationLabel: string;
  explanation: string;
}

/**
 * 나와 상대방의 오행 관계를 4종(채움, 밀어줌, 받음, 닮음) 중 하나로 분류합니다.
 * 
 * [규칙 - PRD §4.3]
 * 1. 채움 (complement): 상대방의 주 오행이 나의 부족 오행과 일치
 * 2. 닮음 (mirror): 나의 주 오행과 상대방의 주 오행이 동일
 * 3. 밀어줌 (generate): 나의 주 오행이 상대방의 주 오행을 생함 (내가 밀어주는 관계)
 * 4. 받음 (support): 상대방의 주 오행이 나의 주 오행을 생함 (상대가 나를 생해주는 관계)
 * 5. 기타: 상극 조합도 배제하지 않고 상생 순환선상에서 조화로운 지원 관계로 분류
 *
 * @param myPrimary 내 주 오행
 * @param myDeficient 내 부족 오행
 * @param theirPrimary 상대방 주 오행
 */
export function classifyRelation(
  myPrimary: FiveElement,
  myDeficient: FiveElement,
  theirPrimary: FiveElement
): RelationClassification {
  // 1. 상대가 내 부족 오행을 가진 경우 -> '채움'
  if (theirPrimary === myDeficient) {
    return {
      relationType: 'complement',
      relationLabel: RELATION_LABELS.complement,
      explanation: '나에게 부족한 기운을 가득 품고 있어 완벽한 밸런스를 맞춰주는 인연입니다.',
    };
  }

  // 2. 주 오행이 완전히 같은 경우 -> '닮음'
  if (theirPrimary === myPrimary) {
    return {
      relationType: 'mirror',
      relationLabel: RELATION_LABELS.mirror,
      explanation: '생각의 흐름과 기운의 결이 같아 말을 섞을수록 깊은 공감이 형성되는 인연입니다.',
    };
  }

  // 3. 내 주 오행이 상대방을 생하는 경우 -> '밀어줌'
  if (GENERATING_CYCLE[myPrimary] === theirPrimary) {
    return {
      relationType: 'generate',
      relationLabel: RELATION_LABELS.generate,
      explanation: '나의 따뜻한 기운이 상대의 재능과 행동을 힘차게 북돋아 주는 든든한 조력 관계입니다.',
    };
  }

  // 4. 상대방이 내 주 오행을 생하는 경우 -> '받음'
  if (SUPPORTING_CYCLE[myPrimary] === theirPrimary) {
    return {
      relationType: 'support',
      relationLabel: RELATION_LABELS.support,
      explanation: '상대의 여유로운 에너지가 나의 빈틈을 편안하게 지지해주고 품어주는 인연입니다.',
    };
  }

  // 5. 그 외 조합(상극 등)도 상생 연결고리로 긍정 해석하여 '밀어줌/기운 공유'로 조화롭게 매핑
  return {
    relationType: 'generate',
    relationLabel: '기운 조화',
    explanation: '서로 다른 개성과 시선으로 신선한 자극과 새로운 영감을 나누는 흥미로운 인연입니다.',
  };
}
