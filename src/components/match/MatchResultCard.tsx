import React, { useState } from 'react';
import type { SynergyMatchResult } from '../../types/match';
import { ElementalBadge } from '../chemistry/ElementalBadge';

export interface MatchResultCardProps {
  matchResult: SynergyMatchResult;
  onSaveConnection: (result: SynergyMatchResult) => void;
  onReset: () => void;
}

export const MatchResultCard: React.FC<MatchResultCardProps> = ({
  matchResult,
  onSaveConnection,
  onReset,
}) => {
  const [saved, setSaved] = useState(false);

  const {
    score,
    synergyTitle,
    synergyTagline,
    relationLabel,
    me,
    partner,
    synergyAnalysis,
    conversationTopics,
  } = matchResult;

  const handleSave = () => {
    onSaveConnection(matchResult);
    setSaved(true);
  };

  return (
    <div className="synergy-card">
      {/* Versus / Chemistry Header */}
      <div className="synergy-versus">
        <div className="synergy-participant-pill">
          <span style={{ fontSize: '0.8rem', color: 'var(--hap-text-secondary)' }}>YOU</span>
          <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>{me.nickname}</span>
          <ElementalBadge element={me.primaryElement} size="sm" />
        </div>

        <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--hap-accent-gold)' }}>
          ⚡
        </div>

        <div className="synergy-participant-pill">
          <span style={{ fontSize: '0.8rem', color: 'var(--hap-text-secondary)' }}>PARTNER</span>
          <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>{partner.nickname}</span>
          <ElementalBadge element={partner.primaryElement} size="sm" />
        </div>
      </div>

      {/* Score */}
      <div className="synergy-score-wrap">
        <div className="synergy-score-number">{score}점</div>
        <div className="synergy-score-label">✨ {relationLabel} 케미 스코어</div>
      </div>

      <h3 className="synergy-title">{synergyTitle}</h3>
      <p className="synergy-tagline">{synergyTagline}</p>

      {/* Detailed Analysis */}
      <div className="synergy-analysis-box">
        <strong>🔍 사주 오행 케미 분석:</strong>
        <p style={{ margin: '0.4rem 0 0 0' }}>{synergyAnalysis}</p>
      </div>

      {/* Conversation Topics */}
      <div className="synergy-topics-box">
        <div className="synergy-topics-title">💬 추천 아이스브레이킹 대화 주제</div>
        {conversationTopics.map((topic, i) => (
          <div key={i} className="synergy-topic-item">
            • {topic}
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '1rem' }}>
        <button
          type="button"
          className="btn btn--accent"
          onClick={handleSave}
          disabled={saved}
        >
          {saved ? '✅ 인연 목록에 저장됨!' : '💾 오늘 만난 인연으로 저장'}
        </button>
        <button type="button" className="btn btn--outline" onClick={onReset}>
          다른 인연 찾기
        </button>
      </div>
    </div>
  );
};
