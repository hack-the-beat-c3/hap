import React from 'react';
import type { MatchedConnection } from '../../types/match';
import { ElementalBadge } from '../chemistry/ElementalBadge';

export interface ConnectionHistoryListProps {
  connections: MatchedConnection[];
  onSelectConnection?: (conn: MatchedConnection) => void;
}

export const ConnectionHistoryList: React.FC<ConnectionHistoryListProps> = ({
  connections,
}) => {
  return (
    <div>
      <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
        <h4 style={{ margin: '0 0 0.35rem 0', fontSize: '1.05rem', color: '#fff' }}>
          🎋 오늘 파티에서 맺은 인연 ({connections.length}명)
        </h4>
        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--hap-text-secondary)' }}>
          QR 궁합을 확인하고 저장한 파티원들의 케미 기록입니다.
        </p>
      </div>

      {connections.length > 0 ? (
        <div className="connection-list">
          {connections.map((conn) => (
            <div key={conn.partnerId} className="connection-item">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <ElementalBadge element={conn.partnerPrimaryElement} size="sm" />
                <div>
                  <div style={{ fontWeight: 700, color: '#fff' }}>{conn.partnerNickname}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--hap-text-muted)' }}>
                    {conn.synergyTitle}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span
                  style={{
                    fontSize: '1rem',
                    fontWeight: 800,
                    color: 'var(--hap-accent-gold)',
                  }}
                >
                  {conn.score}점
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          style={{
            padding: '2rem 1rem',
            textAlign: 'center',
            background: 'rgba(0, 0, 0, 0.2)',
            borderRadius: '12px',
            color: 'var(--hap-text-muted)',
            fontSize: '0.85rem',
          }}
        >
          아직 저장된 인연이 없습니다.<br />
          파티원들과 QR 코드를 스캔하고 1:1 케미를 기록해보세요!
        </div>
      )}
    </div>
  );
};
