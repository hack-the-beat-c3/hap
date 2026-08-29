import type { FiveElement, ElementCounts, RelationType } from './element';

/**
 * QR 코드 및 P2P 교환용 경량 사주 프로필 페이로드
 * 원본 생년월일/시각은 포함되지 않음 (개인정보 보호 하드룰)
 */
export interface SharedSajuPayload {
  version: 1;
  id: string;
  nickname: string;
  primaryElement: FiveElement;
  elements: ElementCounts;
  timestamp: number;
}

export interface SynergyMatchResult {
  score: number; // 75 ~ 99점
  synergyTitle: string; // 예: "하늘이 맺어준 상호 보완 콤비"
  synergyTagline: string;
  relationType: RelationType;
  relationLabel: string;
  me: {
    nickname: string;
    primaryElement: FiveElement;
    deficientElement: FiveElement;
  };
  partner: {
    nickname: string;
    primaryElement: FiveElement;
    deficientElement: FiveElement;
  };
  synergyAnalysis: string; // 2줄 상세 해설
  conversationTopics: string[]; // 아이스브레이킹 대화 주제 2~3개
  matchedAt: number;
}

export interface MatchedConnection {
  partnerId: string;
  partnerNickname: string;
  partnerPrimaryElement: FiveElement;
  score: number;
  synergyTitle: string;
  matchedAt: number;
}
