import React from 'react';
import type { ElementalMissionResult } from '../../types/element';
import { ElementalBadge } from './ElementalBadge';
import './chemistry.css';

export interface ElementalChemistryCardProps {
  mission: ElementalMissionResult;
  onOpenShareModal?: () => void;
  className?: string;
}

export const ElementalChemistryCard: React.FC<ElementalChemistryCardProps> = ({
  mission,
  onOpenShareModal,
  className = '',
}) => {
  const {
    isBalanced,
    elementNameKorean,
    elementHanja,
    elementKeyword,
    elementColor,
    elementBgColor,
    missionHeadline,
    missionDescription,
    targets,
    fallbackReason,
  } = mission;

  return (
    <article
      className={`chemistry-card ${className}`}
      aria-labelledby="chemistry-mission-title"
    >
      {/* Header */}
      <header className="chemistry-card__header">
        <div className="chemistry-card__title-wrap">
          <span style={{ fontSize: '1.5rem' }} role="img" aria-label="오행 케미 아이콘">
            ✨
          </span>
          <div>
            <h2 id="chemistry-mission-title" className="chemistry-card__title">
              오늘 파티의 오행 보완 케미
            </h2>
            <p className="chemistry-card__subtitle">
              나의 사주 기운을 채워줄 파티원과의 특별한 아이스브레이킹 미션
            </p>
          </div>
        </div>

        {onOpenShareModal && (
          <button
            type="button"
            className="btn btn--outline btn--sm"
            onClick={onOpenShareModal}
            aria-label="결과 카드 공유 모드 열기"
          >
            결과 공유 📤
          </button>
        )}
      </header>

      {/* Hero: 내 부족 오행 (또는 균형형 안내) */}
      <div
        className="chemistry-hero"
        style={{
          backgroundColor: elementBgColor,
          color: elementColor,
        }}
      >
        <div
          className="chemistry-hero__icon"
          style={{
            backgroundColor: '#ffffff',
            color: elementColor,
            border: `2px solid ${elementColor}`,
          }}
          aria-hidden="true"
        >
          <span>{elementHanja}</span>
        </div>
        <div className="chemistry-hero__info">
          <div className="chemistry-hero__label">
            {isBalanced ? '오행 완전 조화 (균형형)' : '오늘 내가 채워야 할 기운'}
          </div>
          <h3 className="chemistry-hero__name">
            {elementNameKorean} ({elementHanja})
          </h3>
          <p className="chemistry-hero__desc">
            <strong>핵심 에너지:</strong> {elementKeyword}
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <section className="chemistry-mission" aria-label="네트워킹 미션">
        <span className="chemistry-mission__tag">PARTY MISSION</span>
        <h4 className="chemistry-mission__headline">{missionHeadline}</h4>
        <p className="chemistry-mission__desc">{missionDescription}</p>
      </section>

      {/* Target Participants List */}
      <section className="chemistry-targets" aria-label="지목된 파티원 목록">
        <div className="chemistry-targets__heading">
          <span>말을 걸어볼 추천 파티원 ({targets.length}명)</span>
          {fallbackReason === 'no_complement_in_room' && (
            <span style={{ fontSize: '0.75rem', color: 'var(--hap-text-muted)' }}>
              *보완 오행 보유자 부재로 상생 파티원으로 대체 매칭됨
            </span>
          )}
        </div>

        {targets.length > 0 ? (
          <div className="chemistry-targets__grid">
            {targets.map((target) => (
              <div key={target.id} className="chemistry-target-card">
                <div className="chemistry-target-card__top">
                  <span className="chemistry-target-card__nickname">{target.nickname}</span>
                  <ElementalBadge element={target.primaryElement} size="sm" />
                </div>
                <div className="chemistry-target-card__relation">
                  ✨ {target.relationLabel}
                </div>
                <p className="chemistry-target-card__explanation">{target.explanation}</p>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--hap-text-muted)' }}>
            아직 룸에 입장한 다른 파티원이 없습니다. 게스트가 입장하면 추천 인연이 표시됩니다!
          </div>
        )}
      </section>

      {/* Notice */}
      <footer className="chemistry-card__notice">
        💡 본 서비스는 파티의 즐거운 네트워킹과 아이스브레이킹을 돕는 엔터테인먼트 콘텐츠입니다.
        생년월일 및 출생시각은 서버에 저장되지 않습니다.
      </footer>
    </article>
  );
};
