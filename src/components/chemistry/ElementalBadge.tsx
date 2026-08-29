import React from 'react';
import type { FiveElement } from '../../types/element';
import { ELEMENT_META } from '../../lib/chemistry/constants';

export interface ElementalBadgeProps {
  element: FiveElement;
  size?: 'sm' | 'md' | 'lg';
  showKeyword?: boolean;
  className?: string;
}

export const ElementalBadge: React.FC<ElementalBadgeProps> = ({
  element,
  size = 'md',
  showKeyword = false,
  className = '',
}) => {
  const meta = ELEMENT_META[element] || ELEMENT_META['土'];

  return (
    <span
      className={`elemental-badge elemental-badge--${size} ${className}`}
      style={{
        backgroundColor: meta.bgColor,
        color: meta.color,
        borderColor: meta.borderColor,
      }}
      role="status"
      aria-label={`오행 ${meta.nameKorean}, 상징 키워드: ${meta.keyword}`}
    >
      <span className="elemental-badge__hanja" aria-hidden="true">
        {meta.hanja}
      </span>
      <span className="elemental-badge__name">{meta.nameKorean}</span>
      {showKeyword && (
        <span className="elemental-badge__keyword" style={{ opacity: 0.85 }}>
          • {meta.keyword}
        </span>
      )}
    </span>
  );
};
