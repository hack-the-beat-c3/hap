import type { ParticipantProfile } from '../../types/element';
import type { SharedSajuPayload, SynergyMatchResult } from '../../types/match';
import { pickDeficientElement } from '../chemistry/pickDeficientElement';
import { classifyRelation } from '../chemistry/classifyRelation';
import { ELEMENT_META } from '../chemistry/constants';

/**
 * 나와 상대방의 사주 정보를 바탕으로 1:1 시너지 케미 점수, 분석, 대화 주제를 산출합니다.
 */
export function calculateSynergyMatch(
  me: ParticipantProfile,
  partner: SharedSajuPayload | ParticipantProfile
): SynergyMatchResult {
  const myDef = pickDeficientElement(me.elements);
  const partnerDef = pickDeficientElement(partner.elements);

  const relation = classifyRelation(
    me.primaryElement,
    myDef.deficientElement,
    partner.primaryElement
  );

  const partnerRelationToMe = classifyRelation(
    partner.primaryElement,
    partnerDef.deficientElement,
    me.primaryElement
  );

  const myMeta = ELEMENT_META[me.primaryElement];
  const partnerMeta = ELEMENT_META[partner.primaryElement];
  const myDefMeta = ELEMENT_META[myDef.deficientElement];

  // 1. 상호 보완성 점수 계산 (75 ~ 99점)
  let score = 82;
  let title = '새로운 영감을 나누는 케미 콤비';
  let tagline = '서로 다른 매력으로 신선한 시너지를 만듭니다.';
  let analysis = '';

  const isMutualComplement =
    relation.relationType === 'complement' && partnerRelationToMe.relationType === 'complement';

  if (isMutualComplement) {
    score = 98;
    title = '✨ 하늘이 맺어준 완벽한 상호 보완 콤비!';
    tagline = '서로에게 가장 필요한 기운을 완벽하게 맞바꿔 채워주는 최고의 인연입니다.';
    analysis = `${me.nickname}님의 부족한 [${myDefMeta.nameKorean}] 기운을 ${partner.nickname}님이 채워주고, 상대의 빈틈 또한 ${me.nickname}님이 정확히 메워주는 운명적 상호 보완 관계입니다.`;
  } else if (relation.relationType === 'complement') {
    score = 95;
    title = '🌟 내 부족한 기운을 채워주는 보물 같은 인연!';
    tagline = `${partner.nickname}님이 품은 기운이 나에게 가장 필요한 활력이 되어줍니다.`;
    analysis = `${me.nickname}님에게 부족한 [${myDefMeta.keyword}]의 에너지를 ${partner.nickname}님이 자연스럽게 불어넣어 주어, 함께 있을 때 편안함과 추진력을 얻게 됩니다.`;
  } else if (relation.relationType === 'generate') {
    score = 91;
    title = '🔥 무한한 지지와 성장을 북돋아 주는 시너지 관계!';
    tagline = '당신의 따뜻한 기운이 상대방의 잠재력을 힘차게 깨워줍니다.';
    analysis = `${me.nickname}님의 [${myMeta.nameKorean}] 기운이 ${partner.nickname}님의 [${partnerMeta.nameKorean}] 기운을 자연스럽게 생(生)해주어, 대화를 나눌수록 서로의 아이디어가 확장되는 생산적 케미입니다.`;
  } else if (relation.relationType === 'support') {
    score = 90;
    title = '🛡️ 나를 든든하게 받쳐주는 힐링 조력자!';
    tagline = '상대방의 여유와 배려가 나에게 깊은 안정감을 선물합니다.';
    analysis = `${partner.nickname}님의 [${partnerMeta.nameKorean}] 기운이 ${me.nickname}님을 따뜻하게 지지해주어, 파티의 피로를 잊고 진솔한 대화를 나눌 수 있는 편안한 사이입니다.`;
  } else if (relation.relationType === 'mirror') {
    score = 88;
    title = '🤝 말하지 않아도 통하는 영혼의 단짝!';
    tagline = '같은 오행의 결을 공유하여 첫 만남부터 오랜 친구처럼 통합니다.';
    analysis = `두 분 모두 [${myMeta.nameKorean}]의 기운을 중심으로 삼고 있어, 가치관과 유머 코드가 빠르게 일치하며 깊은 공감대를 형성할 수 있습니다.`;
  } else {
    score = 84;
    title = '🔮 신선한 자극과 새로운 시야를 여는 케미!';
    tagline = '서로 다른 관점을 교환하며 특별한 영감을 주고받는 관계입니다.';
    analysis = `서로 다른 오행의 개성이 만나 뻔하지 않은 신선한 대화를 이끌어낼 수 있는 흥미진진한 인연입니다.`;
  }

  // 2. 오행 특성 기반 대화 주제 생성
  const conversationTopics = [
    `🎯 "${myMeta.keyword}"을(를) 중요하게 생각하는 나와, "${partnerMeta.keyword}"의 매력을 가진 ${partner.nickname}님의 요즘 가장 몰입하는 관심사는?`,
    `💬 오늘 파티에서 가장 인상 깊었던 순간이나 좋아하는 휴식 스타일 나누기`,
  ];

  return {
    score,
    synergyTitle: title,
    synergyTagline: tagline,
    relationType: relation.relationType,
    relationLabel: relation.relationLabel,
    me: {
      nickname: me.nickname,
      primaryElement: me.primaryElement,
      deficientElement: myDef.deficientElement,
    },
    partner: {
      nickname: partner.nickname,
      primaryElement: partner.primaryElement,
      deficientElement: partnerDef.deficientElement,
    },
    synergyAnalysis: analysis,
    conversationTopics,
    matchedAt: Date.now(),
  };
}
