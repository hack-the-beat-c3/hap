import { describe, it, expect } from 'vitest';
import { encodeSajuPayload, decodeSajuPayload, calculateSynergyMatch } from '../index';
import type { ParticipantProfile } from '../../../types/element';

describe('1:1 사주 궁합 매칭 로직 테스트 (PRD_1ON1_CHEMISTRY_MATCH)', () => {
  const meProfile: ParticipantProfile = {
    id: 'me-1',
    nickname: '태양의목',
    primaryElement: '木',
    elements: { 木: 3, 火: 2, 土: 1, 金: 0, 水: 2 }, // 부족: 金
    isHost: true,
    joinedOrder: 1,
  };

  const partnerMetal: ParticipantProfile = {
    id: 'partner-1',
    nickname: '단단한금',
    primaryElement: '金',
    elements: { 木: 0, 火: 1, 土: 2, 金: 4, 水: 1 }, // 부족: 木
    joinedOrder: 2,
  };

  const partnerSameWood: ParticipantProfile = {
    id: 'partner-2',
    nickname: '푸른나무',
    primaryElement: '木',
    elements: { 木: 4, 火: 1, 土: 1, 金: 1, 水: 1 },
    joinedOrder: 3,
  };

  describe('1. encodeSajuPayload & decodeSajuPayload', () => {
    it('프로필을 안전하게 직렬화하고 디코딩하여 동일 데이터를 복원해야 한다', () => {
      const code = encodeSajuPayload(meProfile);
      expect(code.startsWith('HAP:')).toBe(true);

      const decoded = decodeSajuPayload(code);
      expect(decoded).not.toBeNull();
      expect(decoded?.nickname).toBe('태양의목');
      expect(decoded?.primaryElement).toBe('木');
      expect(decoded?.elements).toEqual(meProfile.elements);
      // PII 생년월일이 없음을 확인
      expect((decoded as unknown as Record<string, unknown>).birthDate).toBeUndefined();
    });

    it('잘못되거나 오염된 문자열은 null을 반환해야 한다', () => {
      expect(decodeSajuPayload('invalid_code')).toBeNull();
      expect(decodeSajuPayload('')).toBeNull();
      expect(decodeSajuPayload('HAP:12345')).toBeNull();
    });
  });

  describe('2. calculateSynergyMatch', () => {
    it('서로의 부족 오행을 채워주는 상호 보완 관계는 최고점(98점)과 특별 타이틀을 반환해야 한다', () => {
      // me(주: 木, 부족: 金) <-> partner(주: 金, 부족: 木)
      const match = calculateSynergyMatch(meProfile, partnerMetal);

      expect(match.score).toBeGreaterThanOrEqual(95);
      expect(match.synergyTitle).toContain('완벽한 상호 보완');
      expect(match.me.deficientElement).toBe('金');
      expect(match.partner.deficientElement).toBe('木');
      expect(match.conversationTopics.length).toBeGreaterThanOrEqual(2);
    });

    it('주 오행이 같은 파티원은 닮음(mirror) 관계와 88점을 반환해야 한다', () => {
      const match = calculateSynergyMatch(meProfile, partnerSameWood);

      expect(match.relationType).toBe('mirror');
      expect(match.score).toBe(88);
      expect(match.synergyTitle).toContain('영혼의 단짝');
    });

    it('어떤 조합이든 긍정적인 점수(75점 이상)와 대화 주제를 제공해야 한다 (부정 판정 방지)', () => {
      const match = calculateSynergyMatch(meProfile, partnerMetal);
      expect(match.score).toBeGreaterThanOrEqual(75);
      expect(match.synergyAnalysis).toBeTruthy();
      expect(match.conversationTopics.every((t) => typeof t === 'string' && t.length > 0)).toBe(
        true
      );
    });
  });
});
