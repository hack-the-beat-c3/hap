<<<<<<< HEAD
import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { derive } from './lib/ohaeng'
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
import { PartyChemistryPlayground } from './components/chemistry'

type AppMode = 'party' | 'solo_tarot' | 'chemistry_lab'
type Role = 'landing' | 'host' | 'guest'

// URL의 ?pin= 로 게스트 입장 여부 판단.
function readPin(): string | null {
  return new URLSearchParams(location.search).get('pin')
}

export default function App() {
  const [mode, setMode] = useState<AppMode>(() => (readPin() ? 'party' : 'party'))
  const [role, setRole] = useState<Role>(() => (readPin() ? 'guest' : 'landing'))
  const [pin, setPin] = useState<string>(() => readPin() ?? '')

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
              ⚡ 오행 케미 & 1:1 QR
            </button>
          </div>
        </div>
      </nav>

      {/* Mode Views */}
      {mode === 'solo_tarot' && <TarotSoloFlow />}

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
            <Party pin={pin} isHost={role === 'host'} onExit={() => setRole('landing')} />
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
        <span className="brand">🎋 HAP · 타로섯다 파티</span>
        <span className="tag">생년월일 미저장</span>
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
    const clean = pinInput.trim().toUpperCase()
    if (!/^[A-Z0-9]{6}$/.test(clean)) {
      setErr('PIN은 6자리 영문 대문자/숫자입니다.')
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
            placeholder="6자리 PIN 입력"
            maxLength={6}
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

function Party({ pin, isHost, onExit }: { pin: string; isHost: boolean; onExit?: () => void }) {
  const [state, setState] = useState<RoomState | null>(null)
  const [myId, setMyId] = useState<string>('')
  const [nickname, setNickname] = useState('')
  const [birth, setBirth] = useState('')
  const [time, setTime] = useState('')
  const [noTime, setNoTime] = useState(false)
  const [joined, setJoined] = useState(false)
  const [copied, setCopied] = useState(false)

  const chanRef = useRef<RoomChannel | null>(null)

  useEffect(() => {
    const ch = new RoomChannel(pin, (room) => {
      setState(room)
    })
    chanRef.current = ch

    // 호스트가 처음 만들 때 룸 초기화
    if (isHost) {
      newRoom(pin)
    }

    return () => {
      ch.close()
    }
  }, [pin, isHost])

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nickname.trim()) return

    const ohaeng = derive(birth, noTime ? null : time)
    const p: Participant = {
      id: crypto.randomUUID(),
      nickname: nickname.trim(),
      ohaeng,
      isHost,
      ready: true,
      card: null,
    }

    try {
      join(pin, p)
      setMyId(p.id)
      setJoined(true)
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : '입장 실패')
    }
  }

  const handleReveal = () => {
    reveal(pin)
  }

  const copyLink = () => {
    const url = `${location.origin}${location.pathname}?pin=${pin}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const me = state?.participants.find((p) => p.id === myId)
  const isAllReady = (state?.participants.length ?? 0) >= 2 && state?.participants.every((p) => p.ready)

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
          <p className="sub">생년월일은 오행 계산 후 저장 없이 폐기됩니다.</p>

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
              모름 (간이 해석)
            </label>
          </label>

          <button type="submit" className="cta">
            {isHost ? '방장으로 입장 & 대기' : '파티 참여하기'}
          </button>
        </form>
      ) : state?.phase === 'REVEALED' ? (
        <div className="revealed-wrap">
          <div className="card winner-hero">
            <span className="badge">👑 오늘 파티의 최강 운세</span>
            <h2>{state.winnerNickname}</h2>
            <p>메이저 타로 1장 단판 승부 최고 순위!</p>
          </div>

          <div className="card my-result-card">
            <h3>내 운세 카드</h3>
            {me?.card && (
              <div className="my-card-box">
                <span className="card-name">{me.card.name}</span>
                <span className="card-rank">하우스 룰 {me.card.rank}위</span>
              </div>
            )}
          </div>

          {/* 오행 케미 매트릭스 & 공유 */}
          <ChemistryMatrix participants={state.participants} myId={myId} />
          <ShareCard me={me} winnerNickname={state.winnerNickname} />
        </div>
      ) : (
        <div className="card waiting-room">
          <div className="waiting-head">
            <h3>참가자 목록 ({state?.participants.length ?? 0}/{MAX_PARTICIPANTS}명)</h3>
            <span className="phase-badge">대기 중</span>
          </div>

          <ul className="participant-list">
            {state?.participants.map((p) => (
              <li key={p.id} className={`participant-item ${p.id === myId ? 'me' : ''}`}>
                <span className="p-name">{p.nickname} {p.isHost && '👑'}</span>
                <span className="p-ohaeng" style={{ backgroundColor: p.ohaeng.color + '22', color: p.ohaeng.color }}>
                  {p.ohaeng.element} ({p.ohaeng.korean})
                </span>
                <span className="p-status">준비완료</span>
              </li>
            ))}
          </ul>

          {isHost ? (
            <button
              type="button"
              className="cta"
              disabled={!isAllReady}
              onClick={handleReveal}
            >
              {isAllReady ? '🃏 전원 카드 일괄 공개!' : '2명 이상 준비 시 공개 가능'}
            </button>
          ) : (
            <p className="waiting-msg">호스트가 카드를 일괄 공개할 때까지 대기해주세요...</p>
          )}
        </div>
      )}
    </div>
  )
}
=======
import { PartyChemistryPlayground } from './components/chemistry';
import './App.css';

function App() {
  return (
    <main className="app-main">
      <PartyChemistryPlayground />
    </main>
  );
}

export default App;
>>>>>>> feat/adr-0002-elemental-chemistry
