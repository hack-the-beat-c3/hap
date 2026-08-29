import type {
  ElementalMissionResult,
  MissionTarget,
  ParticipantProfile,
} from '../../types/element';
import { ELEMENT_META } from './constants';
import { pickDeficientElement } from './pickDeficientElement';
import { classifyRelation } from './classifyRelation';

export interface GenerateMissionOptions {
  /** 현재 내 참가자 ID */
  myId: string;
  /** 룸의 전체 참가자 목록 (나 포함) */
  participants: ParticipantProfile[];
}

/**
 * 룸 참가자 목록과 내 사주 오행을 기반으로 부족한 오행을 찾고,
 * 말을 걸어야 할 파티원(1~3명) 및 아이스브레이킹 미션을 생성합니다.
 *
 * [수용 기준 & 예외 처리 - PRD §4.4, §7]
 * 1. 내 부족 오행 1개 결정론적 산출
 * 2. 룸 참가자 중 부족 오행을 가진 사람 최대 3명 선별 (입장 순서 기준 앞선 3명)
 * 3. 부족 오행 보유자 0명 시: 상생(밀어줌/받음) -> 동일 오행(닮음) 순으로 fallback 하여 빈 화면 방지
 * 4. 2인 룸 ~ 15인 룸 모두 완벽 대응
 */
export function generatePartyMission(options: GenerateMissionOptions): ElementalMissionResult {
  const { myId, participants } = options;

  const me = participants.find((p) => p.id === myId) || participants[0];

  // 내 사주 오행 분포가 비었거나 기본값 처리
  const myElements = me?.elements || { 木: 1, 火: 1, 土: 1, 金: 1, 水: 1 };
  const { deficientElement, isBalanced } = pickDeficientElement(myElements);
  const myPrimary = me?.primaryElement || '土';

  const meta = ELEMENT_META[deficientElement];

  // 나를 제외한 다른 참가자 목록 (입장 순서 순 정렬)
  const others = participants
    .filter((p) => p.id !== me?.id)
    .sort((a, b) => (a.joinedOrder ?? 0) - (b.joinedOrder ?? 0));

  // 1인 룸인 경우 (예외 케이스)
  if (others.length === 0) {
    return {
      myDeficientElement: deficientElement,
      isBalanced,
      elementNameKorean: meta.nameKorean,
      elementHanja: meta.hanja,
      elementKeyword: meta.keyword,
      elementColor: meta.color,
      elementBgColor: meta.bgColor,
      missionHeadline: `오늘 파티에서 [${meta.hanja} ${meta.nameKorean}] 기운을 채워보세요!`,
      missionDescription: `당신에게 가장 보완이 필요한 기운은 ${meta.nameKorean}입니다. 파티원들이 입장하면 ${meta.keyword}의 기운을 가진 인연을 찾아 연결해 드릴게요!`,
      targets: [],
      hasTargets: false,
      fallbackReason: 'single_participant',
    };
  }

  // 1. 내 부족 오행을 주 오행으로 가진 참가자들(채움) 우선 선별
  const complementOthers = others.filter((p) => p.primaryElement === deficientElement);

  let selectedTargets: MissionTarget[] = [];
  let fallbackReason: ElementalMissionResult['fallbackReason'];

  if (complementOthers.length > 0) {
    // 최대 3명 선택
    selectedTargets = complementOthers.slice(0, 3).map((target) => {
      const rel = classifyRelation(myPrimary, deficientElement, target.primaryElement);
      return {
        id: target.id,
        nickname: target.nickname,
        primaryElement: target.primaryElement,
        relationType: rel.relationType,
        relationLabel: rel.relationLabel,
        explanation: rel.explanation,
      };
    });
  } else {
    // 2. 방에 내 부족 오행을 가진 참가자가 0명인 경우 fallback 처리
    fallbackReason = 'no_complement_in_room';

    // (1) 상생으로 나를 도와주거나 내가 도와줄 수 있는 참가자 탐색
    const supportiveOthers = others.filter((p) => {
      const rel = classifyRelation(myPrimary, deficientElement, p.primaryElement);
      return rel.relationType === 'generate' || rel.relationType === 'support';
    });

    const candidatePool = supportiveOthers.length > 0 ? supportiveOthers : others;

    selectedTargets = candidatePool.slice(0, Math.min(3, candidatePool.length)).map((target) => {
      const rel = classifyRelation(myPrimary, deficientElement, target.primaryElement);
      return {
        id: target.id,
        nickname: target.nickname,
        primaryElement: target.primaryElement,
        relationType: rel.relationType,
        relationLabel: rel.relationLabel,
        explanation: rel.explanation,
      };
    });
  }

  // 미션 헤드라인 및 설명 구성
  const targetNames = selectedTargets.map((t) => t.nickname).join(', ');
  let headline = '';
  let description = '';

  if (isBalanced) {
    headline = `오행이 조화로운 균형형! [${meta.hanja} ${meta.nameKorean}] 중심의 조율 미션`;
    description = `모든 기운이 고루 갖춰져 있습니다. 오늘 파티에서는 ${targetNames}님과 대화를 나누며 전체 분위기를 든든하게 이끌어보세요!`;
  } else if (!fallbackReason) {
    headline = `[${meta.hanja} ${meta.nameKorean}]의 기운을 가진 ${targetNames}님을 찾아가세요!`;
    description = `당신에게 부족한 [${meta.keyword}]의 에너지를 ${targetNames}님이 가득 채워줄 수 있습니다. 오늘 파티에서 가볍게 인사를 건네보세요.`;
  } else {
    headline = `[${meta.hanja} ${meta.nameKorean}] 기운을 깨워줄 ${targetNames}님과의 케미 미션!`;
    description = `비록 딱 맞는 보완 오행 보유자는 없지만, ${targetNames}님과의 특별한 기운 교류를 통해 새로운 시너지를 만들 수 있습니다.`;
  }

  return {
    myDeficientElement: deficientElement,
    isBalanced,
    elementNameKorean: meta.nameKorean,
    elementHanja: meta.hanja,
    elementKeyword: meta.keyword,
    elementColor: meta.color,
    elementBgColor: meta.bgColor,
    missionHeadline: headline,
    missionDescription: description,
    targets: selectedTargets,
    hasTargets: selectedTargets.length > 0,
    fallbackReason,
  };
}
