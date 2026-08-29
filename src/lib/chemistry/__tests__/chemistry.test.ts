import { describe, it, expect } from 'vitest';
import {
  pickDeficientElement,
  classifyRelation,
  generatePartyMission,
  ELEMENT_ORDER,
  GENERATING_CYCLE,
  SUPPORTING_CYCLE,
} from '../index';
import type { ElementCounts, ParticipantProfile } from '../../../types/element';

describe('오행 케미 순수 로직 테스트 (PRD_ELEMENTAL_CHEMISTRY)', () => {
  describe('1. pickDeficientElement (부족 오행 산출)', () => {
    it('가장 적은 개수의 오행을 정확히 선택해야 한다', () => {
      const counts: ElementCounts = { 木: 3, 火: 2, 土: 1, 金: 0, 水: 2 };
      const result = pickDeficientElement(counts);

      expect(result.deficientElement).toBe('金');
      expect(result.minValue).toBe(0);
      expect(result.isBalanced).toBe(false);
    });

    it('동률 최솟값인 경우 木 -> 火 -> 土 -> 金 -> 水 우선순위를 따라야 한다 (木과 火가 0일 때 -> 木)', () => {
      const counts: ElementCounts = { 木: 0, 火: 0, 土: 2, 金: 3, 水: 3 };
      const result = pickDeficientElement(counts);

      expect(result.deficientElement).toBe('木');
      expect(result.minValue).toBe(0);
    });

    it('동률 최솟값이 土와 金일 때 -> 土가 선택되어야 한다', () => {
      const counts: ElementCounts = { 木: 2, 火: 2, 土: 1, 金: 1, 水: 2 };
      const result = pickDeficientElement(counts);

      expect(result.deficientElement).toBe('土');
      expect(result.minValue).toBe(1);
    });

    it('5종 오행이 모두 동일한 수치이면 土를 선택하고 isBalanced가 true여야 한다', () => {
      const counts: ElementCounts = { 木: 1, 火: 1, 土: 1, 金: 1, 水: 1 };
      const result = pickDeficientElement(counts);

      expect(result.deficientElement).toBe('土');
      expect(result.isBalanced).toBe(true);
      expect(result.minValue).toBe(1);
    });

    it('동일한 입력에 대해 항상 동일한 결과를 반환해야 한다 (결정론적)', () => {
      const counts: ElementCounts = { 木: 2, 火: 1, 土: 0, 金: 3, 水: 2 };
      const run1 = pickDeficientElement(counts);
      const run2 = pickDeficientElement(counts);

      expect(run1).toEqual(run2);
    });
  });

  describe('2. classifyRelation (관계 유형 분류)', () => {
    it('상대가 내 부족 오행을 가진 경우 -> complement (기운 채움)', () => {
      const result = classifyRelation('木', '金', '金');
      expect(result.relationType).toBe('complement');
      expect(result.relationLabel).toContain('채움');
    });

    it('상대와 내 주 오행이 동일한 경우 -> mirror (결이 닮음)', () => {
      const result = classifyRelation('火', '金', '火');
      expect(result.relationType).toBe('mirror');
      expect(result.relationLabel).toContain('닮음');
    });

    it('내 주 오행이 상대를 생하는 경우 -> generate (힘 북돋움)', () => {
      // 木 -> 火
      const result = classifyRelation('木', '水', '火');
      expect(result.relationType).toBe('generate');
      expect(result.relationLabel).toContain('북돋움');
    });

    it('상대가 내 주 오행을 생하는 경우 -> support (기운 받음)', () => {
      // 水 -> 木 (상대가 水, 내가 木)
      const result = classifyRelation('木', '土', '水');
      expect(result.relationType).toBe('support');
      expect(result.relationLabel).toContain('받음');
    });

    it('모든 5행 상생 순환이 정확해야 한다', () => {
      for (const el of ELEMENT_ORDER) {
        const next = GENERATING_CYCLE[el];
        const prev = SUPPORTING_CYCLE[el];
        expect(GENERATING_CYCLE[prev]).toBe(el);
        expect(SUPPORTING_CYCLE[next]).toBe(el);
      }
    });
  });

  describe('3. generatePartyMission (파티 지목 및 미션 생성)', () => {
    const mockParticipants: ParticipantProfile[] = [
      {
        id: 'user-1',
        nickname: '호스트목',
        primaryElement: '木',
        elements: { 木: 3, 火: 2, 土: 1, 金: 0, 水: 2 }, // 부족: 金
        isHost: true,
        joinedOrder: 1,
      },
      {
        id: 'user-2',
        nickname: '게스트금1',
        primaryElement: '金',
        elements: { 木: 1, 火: 1, 土: 1, 金: 3, 水: 2 },
        joinedOrder: 2,
      },
      {
        id: 'user-3',
        nickname: '게스트금2',
        primaryElement: '金',
        elements: { 木: 0, 火: 2, 土: 1, 金: 4, 水: 1 },
        joinedOrder: 3,
      },
      {
        id: 'user-4',
        nickname: '게스트금3',
        primaryElement: '金',
        elements: { 木: 1, 火: 1, 土: 1, 金: 3, 水: 2 },
        joinedOrder: 4,
      },
      {
        id: 'user-5',
        nickname: '게스트금4',
        primaryElement: '金',
        elements: { 木: 1, 火: 1, 土: 1, 金: 3, 水: 2 },
        joinedOrder: 5,
      },
      {
        id: 'user-6',
        nickname: '게스트화',
        primaryElement: '火',
        elements: { 木: 1, 火: 4, 土: 1, 金: 1, 水: 1 },
        joinedOrder: 6,
      },
    ];

    it('부족 오행 보유자가 다수일 때 최대 3명까지만 입장 순서대로 지목해야 한다', () => {
      const mission = generatePartyMission({
        myId: 'user-1',
        participants: mockParticipants,
      });

      expect(mission.myDeficientElement).toBe('金');
      expect(mission.targets.length).toBe(3);
      expect(mission.targets[0].nickname).toBe('게스트금1');
      expect(mission.targets[1].nickname).toBe('게스트금2');
      expect(mission.targets[2].nickname).toBe('게스트금3');
      expect(mission.targets.some((t) => t.nickname === '게스트금4')).toBe(false);
    });

    it('2인 룸에서 부족 오행 보유자가 1명일 때 1명을 정확히 지목해야 한다', () => {
      const room2p = [mockParticipants[0], mockParticipants[1]];
      const mission = generatePartyMission({
        myId: 'user-1',
        participants: room2p,
      });

      expect(mission.targets.length).toBe(1);
      expect(mission.targets[0].nickname).toBe('게스트금1');
      expect(mission.fallbackReason).toBeUndefined();
    });

    it('룸에 내 부족 오행 보유자가 0명일 때 fallback으로 상생/닮음 관계 참가자를 지목해야 한다 (빈 화면 방지)', () => {
      const noMetalRoom: ParticipantProfile[] = [
        mockParticipants[0], // 부족: 金, 주: 木
        mockParticipants[5], // 주: 火 (목생화 -> generate)
      ];

      const mission = generatePartyMission({
        myId: 'user-1',
        participants: noMetalRoom,
      });

      expect(mission.targets.length).toBe(1);
      expect(mission.targets[0].nickname).toBe('게스트화');
      expect(mission.fallbackReason).toBe('no_complement_in_room');
      expect(mission.missionHeadline).toBeTruthy();
    });

    it('15인 룸에서도 오류 없이 최대 3인 상한이 지켜져야 한다', () => {
      const largeRoom: ParticipantProfile[] = Array.from({ length: 15 }, (_, i) => ({
        id: `user-${i + 1}`,
        nickname: `참가자_${i + 1}`,
        primaryElement: ELEMENT_ORDER[i % 5],
        elements: {
          木: (i * 2) % 4,
          火: (i + 1) % 4,
          土: (i + 2) % 4,
          金: (i + 3) % 4,
          水: (i + 4) % 4,
        },
        joinedOrder: i + 1,
      }));

      const mission = generatePartyMission({
        myId: 'user-1',
        participants: largeRoom,
      });

      expect(mission.targets.length).toBeLessThanOrEqual(3);
      expect(mission.targets.length).toBeGreaterThan(0);
    });
  });
});
