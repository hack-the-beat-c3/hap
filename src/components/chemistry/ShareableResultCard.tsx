import React, { useState } from 'react';
import type { ElementalMissionResult } from '../../types/element';
import { ElementalBadge } from './ElementalBadge';
import './chemistry.css';

export interface ShareableResultCardProps {
  mission: ElementalMissionResult;
  onClose?: () => void;
  className?: string;
}

export const ShareableResultCard: React.FC<ShareableResultCardProps> = ({
  mission,
  onClose,
  className = '',
}) => {
  const [copied, setCopied] = useState(false);

  const {
    myDeficientElement,
    isBalanced,
    elementNameKorean,
    elementHanja,
    elementKeyword,
    elementColor,
    elementBgColor,
  } = mission;

  const shareText = `[합(HAP) 오늘 파티의 사주 오행]
오늘 내가 채워야 할 기운: ${elementHanja} (${elementNameKorean})
핵심 에너지: ${elementKeyword}
${isBalanced ? '오행 완전 조화 균형형!' : '나의 부족한 기운을 채워줄 인연을 파티에서 찾는 중!'}
#합 #HAP #파티네트워킹 #사주오행케미`;

  const handleCopy = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      // fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className={`share-modal-overlay ${className}`} style={{ textAlign: 'center' }}>
      <div className="share-card" role="dialog" aria-modal="true" aria-label="결과 공유 카드">
        <div className="share-card__branding">✨ HAP • PARTY NETWORKING ✨</div>

        <div className="share-card__badge-wrap">
          <ElementalBadge element={myDeficientElement} size="lg" showKeyword />
        </div>

        <h3 className="share-card__headline">
          오늘 나의 보완 기운은 <span style={{ color: 'var(--hap-accent-gold)' }}>{elementNameKorean}</span>
        </h3>

        <div
          style={{
            background: elementBgColor,
            color: elementColor,
            padding: '1rem',
            borderRadius: '12px',
            margin: '1rem 0',
            fontWeight: '600',
            fontSize: '0.95rem',
          }}
        >
          {isBalanced
            ? '모든 기운이 조화로운 균형형! 파티의 중심을 든든하게 잡아줍니다.'
            : `[${elementKeyword}] 에너지를 가진 파티원을 만나면 시너지가 폭발합니다!`}
        </div>

        <p className="share-card__desc">
          * 개인정보 보호를 위해 파티원의 닉네임은 외부 공유 카드에서 제외됩니다.
        </p>

        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
          <button type="button" className="btn btn--accent" onClick={handleCopy}>
            {copied ? '✅ 공유 문구 복사 완료!' : '📋 공유 텍스트 복사하기'}
          </button>
          {onClose && (
            <button type="button" className="btn btn--outline" onClick={onClose}>
              닫기
            </button>
          )}
        </div>

        <div className="share-card__watermark" style={{ marginTop: '1.25rem' }}>
          합(HAP) 파티 오행 케미 • 2026 Hack the Beat
        </div>
      </div>
    </div>
  );
};
