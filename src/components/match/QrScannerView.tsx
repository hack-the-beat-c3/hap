import React, { useState } from 'react';
import type { ParticipantProfile } from '../../types/element';
import type { SharedSajuPayload } from '../../types/match';
import { decodeSajuPayload } from '../../lib/match';
import { ElementalBadge } from '../chemistry/ElementalBadge';

export interface QrScannerViewProps {
  me: ParticipantProfile;
  roomParticipants: ParticipantProfile[];
  onMatchPartner: (partner: SharedSajuPayload | ParticipantProfile) => void;
}

export const QrScannerView: React.FC<QrScannerViewProps> = ({
  me,
  roomParticipants,
  onMatchPartner,
}) => {
  const [inputCode, setInputCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const others = roomParticipants.filter((p) => p.id !== me.id);

  const handleManualCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const decoded = decodeSajuPayload(inputCode.trim());
    if (!decoded) {
      setErrorMsg('유효하지 않은 HAP 사주 코드입니다. 다시 확인해주세요.');
      return;
    }

    if (decoded.id === me.id) {
      setErrorMsg('나 자신과의 궁합은 100점! 다른 파티원의 코드를 입력해주세요 😊');
      return;
    }

    onMatchPartner(decoded);
  };

  const handleSelectRoomParticipant = (partner: ParticipantProfile) => {
    onMatchPartner(partner);
  };

  return (
    <div>
      <div style={{ marginBottom: '1.25rem' }}>
        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: '#fff' }}>
          👥 파티 참가자 원클릭 궁합 맞추기
        </h4>
        <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.8rem', color: 'var(--hap-text-secondary)' }}>
          같은 룸의 참가자를 클릭하면 즉시 1:1 케미 분석이 시작됩니다.
        </p>

        {others.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {others.map((p) => (
              <button
                key={p.id}
                type="button"
                className="btn btn--outline"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.6rem 0.8rem',
                  textAlign: 'left',
                }}
                onClick={() => handleSelectRoomParticipant(p)}
              >
                <span style={{ fontWeight: 700 }}>{p.nickname}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ElementalBadge element={p.primaryElement} size="sm" />
                  <span style={{ fontSize: '0.8rem', color: 'var(--hap-accent-gold)' }}>궁합 보기 ➔</span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--hap-text-muted)', fontSize: '0.85rem' }}>
            아직 룸에 다른 참가자가 없습니다.
          </div>
        )}
      </div>

      <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '1rem' }}>
        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem', color: '#fff' }}>
          ⌨️ 상대방의 사주 코드 붙여넣기
        </h4>
        <form onSubmit={handleManualCodeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <input
            type="text"
            placeholder="상대방이 복사해준 HAP:... 코드를 입력하세요"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            style={{
              padding: '0.6rem',
              borderRadius: '8px',
              background: 'var(--hap-bg-subcard)',
              color: '#fff',
              border: '1px solid var(--hap-border)',
              fontSize: '0.85rem',
            }}
          />
          {errorMsg && (
            <div style={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: 600 }}>
              ⚠️ {errorMsg}
            </div>
          )}
          <button type="submit" className="btn btn--accent">
            1:1 오행 궁합 확인하기
          </button>
        </form>
      </div>
    </div>
  );
};
