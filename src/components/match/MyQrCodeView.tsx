import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import type { ParticipantProfile } from '../../types/element';
import { encodeSajuPayload } from '../../lib/match';
import { ElementalBadge } from '../chemistry/ElementalBadge';

export interface MyQrCodeViewProps {
  me: ParticipantProfile;
}

export const MyQrCodeView: React.FC<MyQrCodeViewProps> = ({ me }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState(false);
  const code = encodeSajuPayload(me);

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        code,
        {
          width: 220,
          margin: 1,
          color: {
            dark: '#0f172a',
            light: '#ffffff',
          },
        },
        (error) => {
          if (error) console.error('QR Code render error:', error);
        }
      );
    }
  }, [code]);

  const handleCopyCode = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.35rem' }}>
          {me.nickname}님의 파티 사주 QR
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
          <ElementalBadge element={me.primaryElement} size="sm" />
          <span style={{ fontSize: '0.8rem', color: 'var(--hap-text-secondary)' }}>
            상대방에게 이 QR을 보여주세요!
          </span>
        </div>
      </div>

      <div className="my-qr-box">
        <canvas ref={canvasRef} className="my-qr-canvas" />
      </div>

      <div style={{ marginTop: '0.75rem' }}>
        <button
          type="button"
          className="btn btn--outline btn--sm"
          onClick={handleCopyCode}
          style={{ width: '100%' }}
        >
          {copied ? '✅ 사주 교환 코드 복사 완료!' : '📋 사주 교환 코드 복사하기'}
        </button>
        <p style={{ fontSize: '0.75rem', color: 'var(--hap-text-muted)', marginTop: '0.5rem' }}>
          * 원본 생년월일은 포함되지 않으며 오행 정보만 안전하게 전달됩니다.
        </p>
      </div>
    </div>
  );
};
