import { useMemo, useState } from 'react'
import {
  elementLabel,
  findBestChemistryPair,
  matchParticipants,
  rankParticipants,
  type ParticipantResult,
} from './partyMatch.ts'
import './party-match.css'

type Props = {
  participants: readonly ParticipantResult[]
  title?: string
}

export function PartyMatchDashboard({ participants, title = '오늘의 운빨 매치' }: Props) {
  const ranked = useMemo(() => rankParticipants(participants), [participants])
  const [leftId, setLeftId] = useState('')
  const [rightId, setRightId] = useState('')
  const left = ranked.find(({ id }) => id === leftId) ?? ranked[0]
  const right = ranked.find(({ id }) => id === rightId && id !== left?.id) ?? ranked.find(({ id }) => id !== left?.id)
  const match = left && right ? matchParticipants(left, right) : null
  const supportivePair = findBestChemistryPair(ranked, 'supportive')
  const clashPair = findBestChemistryPair(ranked, 'clash')
  const leaders = ranked.length ? ranked.filter(({ cardRank }) => cardRank === ranked[0].cardRank) : []

  return (
    <section className="party-match" aria-labelledby="party-match-title">
      <header className="party-match__header">
        <p>선택형 재미 기능 · 파티 하우스 룰</p>
        <h2 id="party-match-title">{title}</h2>
        <span>카드는 운빨, 오행은 케미로 따로 봐요.</span>
      </header>

      {!ranked.length ? (
        <p className="party-match__empty">첫 번째 참가자의 운세 결과를 기다리고 있어요.</p>
      ) : (
        <>
          <div className="party-match__highlights" aria-label="파티 하이라이트">
            <Highlight label="최강 운세" value={leaders.map(({ nickname }) => nickname).join(' · ')} />
            <Highlight label="최강 케미" value={pairName(supportivePair)} />
            <Highlight label="상극 케미" value={pairName(clashPair)} />
          </div>

          <ol className="party-match__ranking" aria-label="타로 하우스 순위">
            {ranked.map((participant) => (
              <li key={participant.id}>
                <strong>{participant.cardRank}위</strong>
                {participant.cardImage ? <img src={participant.cardImage} alt="" /> : null}
                <span className="party-match__person">
                  <b>{participant.nickname}</b>
                  <small>{elementLabel[participant.element]} 기운</small>
                </span>
                <span className="party-match__card">{participant.cardName}</span>
              </li>
            ))}
          </ol>

          {left && right ? (
            <fieldset className="party-match__versus">
              <legend>1:1 운빨 매치</legend>
              <div className="party-match__selectors">
                <ParticipantSelect label="첫 번째 참가자" value={left.id} participants={ranked} onChange={setLeftId} />
                <b aria-hidden="true">VS</b>
                <ParticipantSelect label="두 번째 참가자" value={right.id} participants={ranked} onChange={setRightId} />
              </div>
              <p className="party-match__result">
                <strong>{match?.winnerId ? `${participantName(ranked, match.winnerId)} 승` : '오늘은 같은 운빨'}</strong>
                <span className={`party-match__chemistry party-match__chemistry--${match?.chemistry.tone}`}>
                  {match?.chemistry.label}
                </span>
                <small>{match?.chemistry.description}</small>
              </p>
            </fieldset>
          ) : null}
        </>
      )}

      <footer>전통 타로의 공식 서열이 아닌 엔터테인먼트용 하우스 룰이며 베팅과 무관합니다.</footer>
    </section>
  )
}

function Highlight({ label, value }: { label: string; value: string }) {
  return <article><small>{label}</small><strong>{value || '아직 없음'}</strong></article>
}

function ParticipantSelect({
  label,
  value,
  participants,
  onChange,
}: {
  label: string
  value: string
  participants: readonly ParticipantResult[]
  onChange: (id: string) => void
}) {
  return (
    <label>
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {participants.map(({ id, nickname }) => <option key={id} value={id}>{nickname}</option>)}
      </select>
    </label>
  )
}

function participantName(participants: readonly ParticipantResult[], id: string) {
  return participants.find((participant) => participant.id === id)?.nickname ?? ''
}

function pairName(pair: readonly [ParticipantResult, ParticipantResult] | null) {
  return pair ? `${pair[0].nickname} × ${pair[1].nickname}` : ''
}
