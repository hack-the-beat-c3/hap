/**
 * 오행(五行) 관련 핵심 타입 정의
 * PRD: PRD_ELEMENTAL_CHEMISTRY.md & AGENTS.md §2.2
 */

export type FiveElement = '木' | '火' | '土' | '金' | '水';

export interface ElementCounts {
  木: number;
  火: number;
  土: number;
  金: number;
  水: number;
}

/**
 * 관계 유형 4종
 * - complement: 채움 (상대가 내 부족 오행을 소유)
 * - generate: 밀어줌 (내 오행의 상생 다음이 상대 - 내가 생해주는 관계)
 * - support: 받음 (내 오행의 상생 이전이 상대 - 나를 생해주는 관계)
 * - mirror: 닮음 (동일한 주 오행)
 */
export type RelationType = 'complement' | 'generate' | 'support' | 'mirror';

export interface ParticipantProfile {
  id: string;
  nickname: string;
  primaryElement: FiveElement;
  elements: ElementCounts;
  isHost?: boolean;
  joinedOrder: number;
}

export interface MissionTarget {
  id: string;
  nickname: string;
  primaryElement: FiveElement;
  relationType: RelationType;
  relationLabel: string;
  explanation: string;
}

export interface ElementalMissionResult {
  myDeficientElement: FiveElement;
  isBalanced: boolean;
  elementNameKorean: string;
  elementHanja: FiveElement;
  elementKeyword: string;
  elementColor: string;
  elementBgColor: string;
  missionHeadline: string;
  missionDescription: string;
  targets: MissionTarget[];
  hasTargets: boolean;
  fallbackReason?: 'no_complement_in_room' | 'single_participant' | 'all_same_element';
}
