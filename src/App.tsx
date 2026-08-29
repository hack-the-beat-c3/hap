import { useEffect, useState, useRef, useMemo } from 'react'
import './App.css'
import { derive, type Element as OhaengElement } from './lib/ohaeng'
import {
  RoomChannel,
  join,
  makePin,
  newRoom,
  reveal,
  setReady,
  winner,
  MAX_PARTICIPANTS,
  type Participant,
  type RoomState,
} from './lib/room'
import { ChemistryMatrix, ShareCard } from './components/Recap'
import { TarotSoloFlow } from './components/TarotSoloFlow'
import { PartyChemistryPlayground, ElementalChemistryCard } from './components/chemistry'
import { MatchHubModal } from './components/match'
import { generatePartyMission } from './lib/chemistry'
import { PartyMatchDashboard } from './PartyMatchDashboard'
import type { ParticipantResult } from './partyMatch'
import type { FiveElement, ParticipantProfile } from './types/element'
import type { MatchedConnection } from './types/match'

type AppMode = 'party' | 'solo_tarot' | 'chemistry_lab' | 'party_match'
type Role = 'landing' | 'host' | 'guest'

const ELEMENT_COLORS: Record<OhaengElement, string> = {
  목: '#78a67d',
  화: '#d96c57',
  토: '#c69a59',
  금: '#b9a777',
  수: '#668dac',
}

const ELEMENT_MAP_TO_FIVE: Record<OhaengElement, FiveElement> = {
  목: '木',
  화: '火',
  토: '土',
  금: '金',
  수: '水',
}

function readPin(): string | null {
  return new URLSearchParams(location.search).get('pin')
}

export default function App() {
  const [mode, setMode] = useState<AppMode>(() => (readPin() ? 'party' : 'party'))
  const [role, setRole] = useState<Role>(() => (readPin() ? 'guest' : 'landing'))
  const [pin, setPin] = useState<string>(() => readPin() ?? '')

  // 1:1 매칭 모달 및 연결 히스토리 상태
  const [matchModalOpen, setMatchModalOpen] = useState(false)
  const [currentMyProfile, setCurrentMyProfile] = useState<ParticipantProfile | null>(null)
  const [roomParticipantsForMatch, setRoomParticipantsForMatch] = useState<ParticipantProfile[]>([])
  const [connections, setConnections] = useState<MatchedConnection[]>([])

  // 매칭 대시보드용 샘플
  const sampleParticipants: ParticipantResult[] = [
    { id: '1', nickname: '가람 (나무)', element: 'WOOD', cardId: 'THE_SUN', cardName: '태양', cardRank: 19 },
    { id: '2', nickname: '나래 (불꽃)', element: 'FIRE', cardId: 'THE_WORLD', cardName: '세계', cardRank: 21 },
    { id: '3', nickname: '다온 (흙)', element: 'EARTH', cardId: 'THE_STAR', cardName: '별', cardRank: 17 },
    { id: '4', nickname: '라온 (바위)', element: 'METAL', cardId: 'THE_MAGICIAN', cardName: '마법사', cardRank: 1 },
    { id: '5', nickname: '마루 (물결)', element: 'WATER', cardId: 'THE_FOOL', cardName: '광대', cardRank: 0 },
  ]

  const openMatchHub = (myProfile: ParticipantProfile, allProfiles: ParticipantProfile[]) => {
    setCurrentMyProfile(myProfile)
    setRoomParticipantsForMatch(allProfiles)
    setMatchModalOpen(true)
  }

  const handleAddConnection = (conn: MatchedConnection) => {
    setConnections((prev) => {
      const filtered = prev.filter((c) => c.partnerNickname !== conn.partnerNickname)
      return [conn, ...filtered]
    })
  }

  return (
    <div className="global-app-container">
      {/* Top Global Mode Navigation Bar */}
      <nav className="global-nav" aria-label="메인 모드 선택">
        <div className="global-nav__inner">
          <div className="global-nav__brand">🎋 HAP (합)</div>
          <div className="global-nav__tabs">
            <button
              type="button"
              className={`global-nav__tab ${mode === 'party' ? 'global-nav__tab--active' : ''}`}
              onClick={() => setMode('party')}
            >
              🎉 멀티 파티 룸
            </button>
            <button
              type="button"
              className={`global-nav__tab ${mode === 'solo_tarot' ? 'global-nav__tab--active' : ''}`}
              onClick={() => setMode('solo_tarot')}
            >
              🃏 오늘의 타로 한 장
            </button>
            <button
              type="button"
              className={`global-nav__tab ${mode === 'chemistry_lab' ? 'global-nav__tab--active' : ''}`}
              onClick={() => setMode('chemistry_lab')}
            >
              ⚡ 오행 케미 연구소
            </button>
            <button
              type="button"
              className={`global-nav__tab ${mode === 'party_match' ? 'global-nav__tab--active' : ''}`}
              onClick={() => setMode('party_match')}
            >
              📊 운빨 매칭 대시보드
            </button>
          </div>
        </div>
      </nav>

      {/* 1:1 현장 QR 매칭 모달 */}
      {matchModalOpen && currentMyProfile && (
        <MatchHubModal
          me={currentMyProfile}
          roomParticipants={roomParticipantsForMatch}
          connections={connections}
          onAddConnection={handleAddConnection}
          onClose={() => setMatchModalOpen(false)}
        />
      )}

      {/* Mode Views */}
      {mode === 'solo_tarot' && <TarotSoloFlow />}

      {mode === 'party_match' && (
        <main className="app-main">
          <PartyMatchDashboard participants={sampleParticipants} />
        </main>
      )}

      {mode === 'chemistry_lab' && (
        <main className="app-main">
          <PartyChemistryPlayground />
        </main>
      )}

      {mode === 'party' && (
        <Shell>
          {role === 'landing' ? (
            <Landing
              onHost={() => {
                const p = makePin()
                setPin(p)
                setRole('host')
              }}
              onJoin={(p) => {
                setPin(p)
                setRole('guest')
              }}
            />
          ) : (
            <Party
              pin={pin}
              isHost={role === 'host'}
              onExit={() => setRole('landing')}
              onOpenMatchHub={openMatchHub}
            />
          )}
        </Shell>
      )}
    </div>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app">
      <header className="topbar">
        <span className="brand">🎋 HAP · 사주 & 타로 파티</span>
        <span className="tag">🔒 생년월일 미저장</span>
      </header>
      {children}
      <footer className="foot">
        파티용 엔터테인먼트 · 원본 생년월일 서버 미전송 · Web Crypto 공정 셔플
      </footer>
    </div>
  )
}

function Landing({
  onHost,
  onJoin,
}: {
  onHost: () => void
  onJoin: (pin: string) => void
}) {
  const [pinInput, setPinInput] = useState('')
  const [err, setErr] = useState('')

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault()
    const clean = pinInput.trim()
    if (!/^\d{4}$/.test(clean)) {
      setErr('PIN은 4자리 숫자입니다.')
      return
    }
    onJoin(clean)
  }

  return (
    <main className="landing">
      <div className="hero">
        <h1>오늘 파티의<br />최강 운세를 가린다</h1>
        <p className="sub">생년월일로 오행 케미를 보고, 1인 1장 타로로 승부!</p>
      </div>

      <div className="card action-card">
        <button type="button" className="cta" onClick={onHost}>
          🎉 파티 룸 만들기 (호스트)
        </button>

        <div className="divider">또는 PIN으로 참여</div>

        <form onSubmit={handleJoin} className="join-form">
          <input
            type="text"
            className="input-pin"
            placeholder="4자리 PIN"
            maxLength={4}
            value={pinInput}
            onChange={(e) => {
              setPinInput(e.target.value)
              setErr('')
            }}
          />
          <button type="submit" className="btn-join">입장</button>
        </form>
        {err && <p className="err-text" role="alert">{err}</p>}
      </div>
    </main>
  )
}

function Party({
  pin,
  isHost,
  onExit,
  onOpenMatchHub,
}: {
  pin: string
  isHost: boolean
  onExit?: () => void
  onOpenMatchHub: (myProfile: ParticipantProfile, allProfiles: ParticipantProfile[]) => void
}) {
  const [state, setState] = useState<RoomState>(() => newRoom(pin))
  const [myId, setMyId] = useState<string>('')
  const [nickname, setNickname] = useState('')
  const [birth, setBirth] = useState('1998-03-21')
  const [time, setTime] = useState('')
  const [noTime, setNoTime] = useState(true)
  const [joined, setJoined] = useState(false)
  const [copied, setCopied] = useState(false)

  const chanRef = useRef<RoomChannel | null>(null)

  useEffect(() => {
    const ch = new RoomChannel(pin, (room) => {
      setState(room)
    })
    chanRef.current = ch

    if (isHost) {
      const init = newRoom(pin)
      setState(init)
      ch.publish(init)
    } else {
      ch.requestSync()
    }

    return () => {
      ch.close()
    }
  }, [pin, isHost])

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nickname.trim()) return

    const [y, m, d] = birth.split('-').map(Number)
    const h = noTime || !time ? undefined : Number(time.split(':')[0])
    const profile = derive({ year: y, month: m, day: d, hour: h })

    const p: Omit<Participant, 'ready'> = {
      id: crypto.randomUUID(),
      nickname: nickname.trim(),
      element: profile.yearElement,
    }

    try {
      const next = join(state, p)
      const readyNext = setReady(next, p.id, true)
      setState(readyNext)
      chanRef.current?.publish(readyNext)
      setMyId(p.id)
      setJoined(true)
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : '입장 실패')
    }
  }

  // 데모/시연용 가상 파티원 추가 (혼자서도 즉시 테스트 가능)
  const addBots = () => {
    const botPresets: Array<{ name: string; el: OhaengElement }> = [
      { name: '🔥 불꽃남자', el: '화' },
      { name: '🌲 푸른숲', el: '목' },
      { name: '🌊 바다사람', el: '수' },
      { name: '⛰️ 든든바위', el: '토' },
    ]

    let curr = state
    for (const b of botPresets) {
      if (curr.participants.length >= MAX_PARTICIPANTS) break
      if (curr.participants.some((p) => p.nickname === b.name)) continue
      const botId = crypto.randomUUID()
      curr = join(curr, { id: botId, nickname: b.name, element: b.el })
      curr = setReady(curr, botId, true)
    }
    setState(curr)
    chanRef.current?.publish(curr)
  }

  const handleReveal = () => {
    try {
      const next = reveal(state)
      setState(next)
      chanRef.current?.publish(next)
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : '공개 실패')
    }
  }

  const copyLink = () => {
    const url = `${location.origin}${location.pathname}?pin=${pin}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const me = state.participants.find((p) => p.id === myId)
  const myCard = me ? state.deal[me.id] : undefined
  const winningParticipant = winner(state)
  const roomUrl = `${location.origin}${location.pathname}?pin=${pin}`

  // 참가자들을 ParticipantProfile 형식으로 변환 (오행 케미 & 1:1 QR 연동)
  const profiles: ParticipantProfile[] = useMemo(() => {
    return state.participants.map((p, idx) => {
      const fiveEl = ELEMENT_MAP_TO_FIVE[p.element] || '木'
      return {
        id: p.id,
        nickname: p.nickname,
        primaryElement: fiveEl,
        joinedOrder: idx + 1,
        elements: {
          木: fiveEl === '木' ? 3 : 1,
          火: fiveEl === '火' ? 3 : 1,
          土: fiveEl === '土' ? 3 : 1,
          金: fiveEl === '金' ? 3 : 1,
          水: fiveEl === '水' ? 3 : 1,
        },
      }
    })
  }, [state.participants])

  const myProfile = useMemo(() => {
    return profiles.find((p) => p.id === myId) ?? profiles[0]
  }, [profiles, myId])

  const mission = useMemo(() => {
    if (!myProfile || profiles.length === 0) return null
    return generatePartyMission({ myId: myProfile.id, participants: profiles })
  }, [myProfile, profiles])

  return (
    <div className="party-room">
      <div className="room-header">
        <div>
          <span className="room-label">ROOM PIN</span>
          <span className="room-pin">{pin}</span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="button" className="btn-sub btn-sm" onClick={copyLink}>
            {copied ? '✅ 링크 복사됨' : '🔗 초대 링크'}
          </button>
          {onExit && (
            <button type="button" className="btn-sub btn-sm" onClick={onExit}>
              나가기
            </button>
          )}
        </div>
      </div>

      {!joined ? (
        <form onSubmit={handleJoin} className="card join-profile-form">
          <h3>파티 프로필 설정</h3>
          <p className="sub">생년월일은 오행 계산 후 저장 없이 즉시 폐기됩니다.</p>

          <label>
            <span>닉네임</span>
            <input
              type="text"
              required
              placeholder="예: 불꽃남자, 럭키비키"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
          </label>

          <label>
            <span>생년월일</span>
            <input
              type="date"
              required
              value={birth}
              onChange={(e) => setBirth(e.target.value)}
            />
          </label>

          <label className="time-row">
            <span>태어난 시각 (선택)</span>
            <input
              type="time"
              disabled={noTime}
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
            <label className="check-label">
              <input
                type="checkbox"
                checked={noTime}
                onChange={(e) => setNoTime(e.target.checked)}
              />
              모름 (시간주 제외 간이 해석)
            </label>
          </label>

          <button type="submit" className="cta">
            {isHost ? '방장으로 입장 & 대기실 열기' : '파티 참여하기'}
          </button>
        </form>
      ) : state.phase === 'revealed' ? (
        <div className="revealed-wrap">
          {winningParticipant && (
            <div className="card winner-hero">
              <span className="badge">👑 오늘 파티의 최강 운세</span>
              <h2>{winningParticipant.nickname}</h2>
              <p>메이저 타로 1장 단판 승부 최고 순위 달성!</p>
            </div>
          )}

          {/* 내 카드 결과 */}
          <div className="card my-result-card">
            <h3>내 운세 카드</h3>
            {myCard ? (
              <div className="my-card-box">
                <div>
                  <div className="card-name">「{myCard.name}」</div>
                  <div style={{ color: '#cbd5e1', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                    {myCard.fortune}
                  </div>
                </div>
                <span className="card-rank">하우스 룰 {myCard.rank}위</span>
              </div>
            ) : (
              <p className="sub">배분된 카드를 확인하는 중입니다.</p>
            )}
          </div>

          {/* ⚡ 오행 보완 케미 미션 카드 (핵심 기능) */}
          {mission && (
            <div className="mission-section">
              <ElementalChemistryCard mission={mission} />
            </div>
          )}

          {/* 1:1 현장 QR 매칭 진입 배너 */}
          <div className="card match-cta-card" style={{ background: 'linear-gradient(135deg, #1e1b4b, #312e81)', border: '1px solid #6366f1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h4 style={{ margin: '0 0 0.3rem 0', color: '#a5b4fc', fontSize: '1.1rem' }}>
                  🤝 1:1 현장 QR 사주 궁합 매칭
                </h4>
                <p style={{ margin: 0, color: '#e0e7ff', fontSize: '0.85rem' }}>
                  마주친 파티원과 QR을 찍고 둘만의 시너지 점수 & 대화 카드를 확인하세요!
                </p>
              </div>
              <button
                type="button"
                className="cta"
                style={{ width: 'auto', background: '#4f46e5', padding: '0.6rem 1.2rem' }}
                onClick={() => myProfile && onOpenMatchHub(myProfile, profiles)}
              >
                ⚡ 1:1 QR 궁합 열기
              </button>
            </div>
          </div>

          {/* 전원 결과 그리드 */}
          <div className="card">
            <h3>파티원 전원 카드</h3>
            <div className="grid-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.75rem', marginTop: '0.75rem' }}>
              {state.participants.map((p) => {
                const c = state.deal[p.id]
                return (
                  <div
                    key={p.id}
                    className={`mini-card ${p.id === myId ? 'me' : ''} ${p.id === winningParticipant?.id ? 'win' : ''}`}
                    style={{
                      background: 'rgba(0,0,0,0.25)',
                      border: p.id === myId ? '2px solid #3b82f6' : '1px solid var(--border)',
                      borderRadius: '10px',
                      padding: '0.75rem',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 800 }}>
                      #{c ? 22 - c.rank + 1 : '-'}
                    </div>
                    <div style={{ fontWeight: 700, margin: '0.2rem 0', color: '#fff' }}>
                      {c ? c.name : '대기'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {p.nickname} · {p.element}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 오행 케미 매트릭스 & 공유 */}
          <ChemistryMatrix participants={state.participants} />
          <ShareCard state={state} roomUrl={roomUrl} />

          <button
            type="button"
            className="btn-sub"
            style={{ width: '100%', marginTop: '1rem' }}
            onClick={onExit}
          >
            🔄 메인 화면으로 돌아가기
          </button>
        </div>
      ) : (
        /* 대기실 (Lobby) */
        <div className="card waiting-room">
          <div className="waiting-head">
            <h3>대기실 참가자 ({state.participants.length}/{MAX_PARTICIPANTS}명)</h3>
            <span className="phase-badge">대기 중</span>
          </div>

          <p className="join-hint" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            친구들에게 PIN <strong style={{ color: '#f59e0b' }}>{pin}</strong> 또는 초대 링크를 공유하세요!
          </p>

          <ul className="participant-list">
            {state.participants.map((p) => (
              <li key={p.id} className={`participant-item ${p.id === myId ? 'me' : ''}`}>
                <span className="p-name">
                  {p.nickname} {p.id === state.participants[0]?.id && '👑'} {p.id === myId && '(나)'}
                </span>
                <span
                  className="p-ohaeng"
                  style={{
                    backgroundColor: ELEMENT_COLORS[p.element] + '22',
                    color: ELEMENT_COLORS[p.element],
                    borderColor: ELEMENT_COLORS[p.element],
                    borderWidth: 1,
                    borderStyle: 'solid',
                  }}
                >
                  {p.element} ({ELEMENT_MAP_TO_FIVE[p.element]})
                </span>
                <span className="p-status">✅ 준비완료</span>
              </li>
            ))}
          </ul>

          {/* 대기실 빠른 액션 바 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
            {/* 1:1 현장 QR 매칭 버튼 (대기 중에도 즉시 매칭 가능!) */}
            {myProfile && (
              <button
                type="button"
                className="btn-sub"
                style={{
                  borderColor: '#6366f1',
                  color: '#a5b4fc',
                  background: 'rgba(99, 102, 241, 0.1)',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                }}
                onClick={() => onOpenMatchHub(myProfile, profiles)}
              >
                ⚡ 대기실에서 1:1 현장 QR 궁합 맞추기
              </button>
            )}

            {/* 시연용 봇 파티원 추가 버튼 (혼자서도 즉시 테스트 가능) */}
            {state.participants.length < 2 && (
              <button
                type="button"
                className="btn-sub"
                style={{ borderColor: '#f59e0b', color: '#f59e0b', background: 'rgba(245, 158, 11, 0.08)' }}
                onClick={addBots}
              >
                🤖 시연용 가상 파티원 4명 자동 추가하기
              </button>
            )}

            {/* 카드 일괄 공개 버튼 */}
            {isHost ? (
              <button
                type="button"
                className="cta"
                disabled={state.participants.length < 2}
                onClick={handleReveal}
                style={{
                  background: state.participants.length >= 2 ? 'linear-gradient(135deg, #aa3bff, #ff5db1)' : undefined,
                  fontSize: '1.05rem',
                  padding: '0.9rem',
                }}
              >
                {state.participants.length >= 2
                  ? '🎴 전원 타로 카드 일괄 공개!'
                  : '최소 2명 이상 모이면 공개 가능합니다'}
              </button>
            ) : (
              <div style={{ textAlign: 'center', padding: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                ⏳ 호스트가 카드를 일괄 공개할 때까지 대기 중입니다...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
