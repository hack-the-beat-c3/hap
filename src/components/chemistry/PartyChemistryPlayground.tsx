import React, { useState, useMemo } from 'react';
import type { ElementCounts, FiveElement, ParticipantProfile } from '../../types/element';
import { ELEMENT_ORDER, ELEMENT_META } from '../../lib/chemistry/constants';
import { generatePartyMission } from '../../lib/chemistry/generatePartyMission';
import { ElementalChemistryCard } from './ElementalChemistryCard';
import { ShareableResultCard } from './ShareableResultCard';
import { ElementalBadge } from './ElementalBadge';
import { MatchHubModal } from '../match';
import type { MatchedConnection } from '../../types/match';
import './chemistry.css';

// 룸 프리셋 데이터
const PRESET_ROOMS: Record<string, { label: string; participants: ParticipantProfile[] }> = {
  standard_4p: {
    label: '✨ 기본 4인 룸 (금/화/토/목 골고루)',
    participants: [
      {
        id: 'me',
        nickname: '나 (호스트)',
        primaryElement: '木',
        elements: { 木: 3, 火: 2, 土: 1, 金: 0, 水: 2 }, // 부족: 金
        isHost: true,
        joinedOrder: 1,
      },
      {
        id: 'user-2',
        nickname: '민우',
        primaryElement: '金',
        elements: { 木: 1, 火: 1, 土: 1, 金: 3, 水: 2 },
        joinedOrder: 2,
      },
      {
        id: 'user-3',
        nickname: '지수',
        primaryElement: '金',
        elements: { 木: 0, 火: 2, 土: 1, 金: 4, 水: 1 },
        joinedOrder: 3,
      },
      {
        id: 'user-4',
        nickname: '태환',
        primaryElement: '火',
        elements: { 木: 1, 火: 4, 土: 1, 金: 1, 水: 1 },
        joinedOrder: 4,
      },
    ],
  },
  minimal_2p: {
    label: '👥 2인 룸 (최소 인원 케미)',
    participants: [
      {
        id: 'me',
        nickname: '나 (호스트)',
        primaryElement: '木',
        elements: { 木: 3, 火: 2, 土: 1, 金: 0, 水: 2 }, // 부족: 金
        isHost: true,
        joinedOrder: 1,
      },
      {
        id: 'user-2',
        nickname: '경민',
        primaryElement: '金',
        elements: { 木: 1, 火: 1, 土: 1, 金: 3, 水: 2 },
        joinedOrder: 2,
      },
    ],
  },
  no_complement_room: {
    label: '🔄 부족 오행 0명 룸 (상생 Fallback)',
    participants: [
      {
        id: 'me',
        nickname: '나 (호스트)',
        primaryElement: '木',
        elements: { 木: 3, 火: 2, 土: 1, 金: 0, 水: 2 }, // 부족: 金 (룸에 金 없음)
        isHost: true,
        joinedOrder: 1,
      },
      {
        id: 'user-2',
        nickname: '형준',
        primaryElement: '火', // 목생화 (generate)
        elements: { 木: 1, 火: 4, 土: 1, 金: 0, 水: 2 },
        joinedOrder: 2,
      },
      {
        id: 'user-3',
        nickname: '종한',
        primaryElement: '水', // 수생목 (support)
        elements: { 木: 2, 火: 0, 土: 1, 金: 0, 水: 5 },
        joinedOrder: 3,
      },
    ],
  },
  max_15p: {
    label: '🎉 15인 만원 룸 (최대 3명 상한 테스트)',
    participants: Array.from({ length: 15 }, (_, i) => ({
      id: i === 0 ? 'me' : `user-${i + 1}`,
      nickname: i === 0 ? '나 (호스트)' : `게스트_${i + 1}`,
      primaryElement: i === 0 ? '木' : (['金', '金', '金', '金', '火', '水', '土'][i % 7] as FiveElement),
      elements:
        i === 0
          ? { 木: 3, 火: 2, 土: 1, 金: 0, 水: 2 }
          : {
              木: (i * 2) % 4,
              火: (i + 1) % 4,
              土: (i + 2) % 4,
              金: (i + 3) % 4,
              水: (i + 4) % 4,
            },
      isHost: i === 0,
      joinedOrder: i + 1,
    })),
  },
  balanced_case: {
    label: '⚖️ 완전 균형형 사주 (오행 골고루)',
    participants: [
      {
        id: 'me',
        nickname: '나 (호스트)',
        primaryElement: '土',
        elements: { 木: 2, 火: 2, 土: 2, 金: 2, 水: 2 }, // 균형형 -> 土
        isHost: true,
        joinedOrder: 1,
      },
      {
        id: 'user-2',
        nickname: '다혜',
        primaryElement: '土',
        elements: { 木: 1, 火: 1, 土: 3, 金: 1, 水: 2 },
        joinedOrder: 2,
      },
      {
        id: 'user-3',
        nickname: '선우',
        primaryElement: '金',
        elements: { 木: 0, 火: 2, 土: 1, 金: 4, 水: 1 },
        joinedOrder: 3,
      },
    ],
  },
};

export const PartyChemistryPlayground: React.FC = () => {
  const [selectedPreset, setSelectedPreset] = useState<string>('standard_4p');
  const [participants, setParticipants] = useState<ParticipantProfile[]>(
    PRESET_ROOMS['standard_4p'].participants
  );
  const [myElements, setMyElements] = useState<ElementCounts>({
    木: 3,
    火: 2,
    土: 1,
    金: 0,
    水: 2,
  });
  const [myPrimary, setMyPrimary] = useState<FiveElement>('木');
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [showMatchModal, setShowMatchModal] = useState<boolean>(false);
  const [connections, setConnections] = useState<MatchedConnection[]>([]);
  const [newGuestNickname, setNewGuestNickname] = useState<string>('');
  const [newGuestElement, setNewGuestElement] = useState<FiveElement>('金');

  const handleAddConnection = (newConn: MatchedConnection) => {
    setConnections((prev) => {
      const filtered = prev.filter((c) => c.partnerNickname !== newConn.partnerNickname);
      return [newConn, ...filtered];
    });
  };

  // 프리셋 변경 핸들러
  const handleSelectPreset = (key: string) => {
    setSelectedPreset(key);
    const preset = PRESET_ROOMS[key];
    if (preset) {
      setParticipants(preset.participants);
      const me = preset.participants.find((p) => p.id === 'me');
      if (me) {
        setMyElements(me.elements);
        setMyPrimary(me.primaryElement);
      }
    }
  };

  // 내 오행 수치 변경
  const handleElementCountChange = (el: FiveElement, val: number) => {
    const updated = { ...myElements, [el]: Math.max(0, val) };
    setMyElements(updated);
    setParticipants((prev) =>
      prev.map((p) => (p.id === 'me' ? { ...p, elements: updated, primaryElement: myPrimary } : p))
    );
  };

  // 게스트 추가
  const handleAddGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuestNickname.trim()) return;

    const newGuest: ParticipantProfile = {
      id: `user-${Date.now()}`,
      nickname: newGuestNickname.trim(),
      primaryElement: newGuestElement,
      elements: { 木: 1, 火: 1, 土: 1, 金: 1, 水: 1 },
      joinedOrder: participants.length + 1,
    };

    setParticipants((prev) => [...prev, newGuest]);
    setNewGuestNickname('');
  };

  // 게스트 제거
  const handleRemoveGuest = (id: string) => {
    if (id === 'me') return;
    setParticipants((prev) => prev.filter((p) => p.id !== id));
  };

  // 현재 참가자 목록과 내 사주를 결합하여 미션 결과 산출
  const updatedParticipants = useMemo(() => {
    return participants.map((p) =>
      p.id === 'me' ? { ...p, elements: myElements, primaryElement: myPrimary } : p
    );
  }, [participants, myElements, myPrimary]);

  const mission = useMemo(() => {
    return generatePartyMission({
      myId: 'me',
      participants: updatedParticipants,
    });
  }, [updatedParticipants]);

  return (
    <div className="chemistry-container">
      {/* 타이틀 & 1:1 매칭 액션 바 */}
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>
          🎋 합(HAP) • 부족한 오행 찾기 미션
        </h1>
        <p style={{ color: 'var(--hap-text-secondary)', margin: '0 0 1rem 0' }}>
          사주 팔자 기반 파티 네트워킹 & 아이스브레이킹 오행 보완 케미 시스템
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn--accent"
            style={{ fontSize: '1rem', padding: '0.6rem 1.25rem', boxShadow: '0 4px 14px rgba(245, 158, 11, 0.4)' }}
            onClick={() => setShowMatchModal(true)}
          >
            ⚡ 1:1 현장 QR 사주 궁합 맞추기 {connections.length > 0 && `(${connections.length}명 만남)`}
          </button>
        </div>
      </div>

      {/* 리캡 미션 카드 */}
      <ElementalChemistryCard
        mission={mission}
        onOpenShareModal={() => setShowShareModal(true)}
      />

      {/* 1:1 QR 매칭 모달 */}
      {showMatchModal && (
        <MatchHubModal
          me={{
            id: 'me',
            nickname: '나 (호스트)',
            primaryElement: myPrimary,
            elements: myElements,
            joinedOrder: 1,
            isHost: true,
          }}
          roomParticipants={updatedParticipants}
          connections={connections}
          onAddConnection={handleAddConnection}
          onClose={() => setShowMatchModal(false)}
        />
      )}

      {/* 공유 모달 */}
      {showShareModal && (
        <div style={{ marginTop: '1.5rem' }}>
          <ShareableResultCard mission={mission} onClose={() => setShowShareModal(false)} />
        </div>
      )}

      {/* 해커톤 검증 및 시뮬레이션 플레이그라운드 컨트롤 */}
      <section className="playground-section">
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.15rem' }}>
          🛠️ 파티 룸 & 사주 시뮬레이션 플레이그라운드
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--hap-text-secondary)' }}>
          다른 팀원이 개발 중인 룸 소켓/사주 엔진과 무관하게 2~15인 룸 엣지 케이스를 즉시 검증할 수 있습니다.
        </p>

        {/* 룸 프리셋 버튼 */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            룸 시나리오 프리셋 선택:
          </div>
          <div className="playground-preset-buttons">
            {Object.entries(PRESET_ROOMS).map(([key, item]) => (
              <button
                key={key}
                type="button"
                className={`btn ${selectedPreset === key ? 'btn--accent' : 'btn--outline'}`}
                onClick={() => handleSelectPreset(key)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="playground-grid">
          {/* 내 사주 오행 수치 조절 */}
          <div className="playground-controls">
            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>내 사주 오행 분포 조절</h4>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem' }}>내 주 오행:</span>
              <select
                value={myPrimary}
                onChange={(e) => setMyPrimary(e.target.value as FiveElement)}
                style={{
                  padding: '0.3rem 0.6rem',
                  borderRadius: '6px',
                  background: 'var(--hap-bg-subcard)',
                  color: '#fff',
                  border: '1px solid var(--hap-border)',
                }}
              >
                {ELEMENT_ORDER.map((el) => (
                  <option key={el} value={el}>
                    {ELEMENT_META[el].hanja} {ELEMENT_META[el].nameKorean}
                  </option>
                ))}
              </select>
            </div>

            {ELEMENT_ORDER.map((el) => {
              const meta = ELEMENT_META[el];
              const val = myElements[el] ?? 0;
              return (
                <div
                  key={el}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                  }}
                >
                  <span style={{ minWidth: '70px', fontSize: '0.85rem' }}>
                    {meta.hanja} ({meta.nameKorean})
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    value={val}
                    onChange={(e) => handleElementCountChange(el, parseInt(e.target.value, 10))}
                    style={{ flex: 1 }}
                  />
                  <span style={{ minWidth: '24px', textAlign: 'right', fontWeight: 'bold' }}>
                    {val}개
                  </span>
                </div>
              );
            })}
          </div>

          {/* 파티 룸 참가자 관리 */}
          <div className="playground-controls">
            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>
              현재 파티 참가자 ({participants.length}명)
            </h4>

            {/* 게스트 추가 폼 */}
            <form onSubmit={handleAddGuest} style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                placeholder="게스트 닉네임"
                value={newGuestNickname}
                onChange={(e) => setNewGuestNickname(e.target.value)}
                style={{
                  flex: 1,
                  padding: '0.4rem 0.6rem',
                  borderRadius: '6px',
                  background: 'var(--hap-bg-subcard)',
                  color: '#fff',
                  border: '1px solid var(--hap-border)',
                  fontSize: '0.85rem',
                }}
              />
              <select
                value={newGuestElement}
                onChange={(e) => setNewGuestElement(e.target.value as FiveElement)}
                style={{
                  padding: '0.4rem 0.6rem',
                  borderRadius: '6px',
                  background: 'var(--hap-bg-subcard)',
                  color: '#fff',
                  border: '1px solid var(--hap-border)',
                  fontSize: '0.85rem',
                }}
              >
                {ELEMENT_ORDER.map((el) => (
                  <option key={el} value={el}>
                    {el}
                  </option>
                ))}
              </select>
              <button type="submit" className="btn btn--sm">
                + 추가
              </button>
            </form>

            {/* 참가자 리스트 */}
            <div
              style={{
                maxHeight: '220px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem',
              }}
            >
              {participants.map((p) => (
                <div
                  key={p.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.4rem 0.6rem',
                    background: 'var(--hap-bg-subcard)',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 600 }}>{p.nickname}</span>
                    {p.id === 'me' && (
                      <span
                        style={{
                          fontSize: '0.7rem',
                          background: '#3b82f6',
                          color: '#fff',
                          padding: '0.1rem 0.3rem',
                          borderRadius: '4px',
                        }}
                      >
                        YOU
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ElementalBadge element={p.primaryElement} size="sm" />
                    {p.id !== 'me' && (
                      <button
                        type="button"
                        onClick={() => handleRemoveGuest(p.id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#ef4444',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                        }}
                        aria-label={`${p.nickname} 삭제`}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
