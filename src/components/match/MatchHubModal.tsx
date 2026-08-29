import React, { useState } from 'react';
import type { ParticipantProfile } from '../../types/element';
import type { MatchedConnection, SharedSajuPayload, SynergyMatchResult } from '../../types/match';
import { calculateSynergyMatch } from '../../lib/match';
import { MyQrCodeView } from './MyQrCodeView';
import { QrScannerView } from './QrScannerView';
import { MatchResultCard } from './MatchResultCard';
import { ConnectionHistoryList } from './ConnectionHistoryList';
import './match.css';

export interface MatchHubModalProps {
  me: ParticipantProfile;
  roomParticipants: ParticipantProfile[];
  connections: MatchedConnection[];
  onAddConnection: (conn: MatchedConnection) => void;
  onClose: () => void;
}

type TabType = 'my_qr' | 'scan_match' | 'history';

export const MatchHubModal: React.FC<MatchHubModalProps> = ({
  me,
  roomParticipants,
  connections,
  onAddConnection,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('my_qr');
  const [currentMatchResult, setCurrentMatchResult] = useState<SynergyMatchResult | null>(null);

  const handleMatchPartner = (partner: SharedSajuPayload | ParticipantProfile) => {
    const result = calculateSynergyMatch(me, partner);
    setCurrentMatchResult(result);
  };

  const handleSaveConnection = (result: SynergyMatchResult) => {
    const newConn: MatchedConnection = {
      partnerId: result.partner.nickname,
      partnerNickname: result.partner.nickname,
      partnerPrimaryElement: result.partner.primaryElement,
      score: result.score,
      synergyTitle: result.synergyTitle,
      matchedAt: result.matchedAt,
    };
    onAddConnection(newConn);
  };

  return (
    <div className="match-modal-overlay" role="dialog" aria-modal="true">
      <div className="match-modal-container">
        {/* Header */}
        <div className="match-modal-header">
          <h3 className="match-modal-title">⚡ 1:1 사주 케미 매칭</h3>
          <button
            type="button"
            className="btn btn--outline btn--sm"
            onClick={onClose}
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        {/* Match Result Display or Tabs */}
        {currentMatchResult ? (
          <MatchResultCard
            matchResult={currentMatchResult}
            onSaveConnection={handleSaveConnection}
            onReset={() => setCurrentMatchResult(null)}
          />
        ) : (
          <>
            {/* Tabs */}
            <div className="match-tabs">
              <button
                type="button"
                className={`match-tab-btn ${activeTab === 'my_qr' ? 'match-tab-btn--active' : ''}`}
                onClick={() => setActiveTab('my_qr')}
              >
                내 QR 코드
              </button>
              <button
                type="button"
                className={`match-tab-btn ${activeTab === 'scan_match' ? 'match-tab-btn--active' : ''}`}
                onClick={() => setActiveTab('scan_match')}
              >
                상대방 스캔/선택
              </button>
              <button
                type="button"
                className={`match-tab-btn ${activeTab === 'history' ? 'match-tab-btn--active' : ''}`}
                onClick={() => setActiveTab('history')}
              >
                만난 인연 ({connections.length})
              </button>
            </div>

            {/* Tab Contents */}
            {activeTab === 'my_qr' && <MyQrCodeView me={me} />}

            {activeTab === 'scan_match' && (
              <QrScannerView
                me={me}
                roomParticipants={roomParticipants}
                onMatchPartner={handleMatchPartner}
              />
            )}

            {activeTab === 'history' && (
              <ConnectionHistoryList connections={connections} />
            )}
          </>
        )}
      </div>
    </div>
  );
};
