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

type Role = 'landing' | 'host' | 'guest'

// URL의 ?pin= 로 게스트 입장 여부 판단.
function readPin(): string | null {
  return new URLSearchParams(location.search).get('pin')
}

export default function App() {
  const [role, setRole] = useState<Role>(() => (readPin() ? 'guest' : 'landing'))
  const [pin, setPin] = useState<string>(() => readPin() ?? '')

  if (role === 'landing')
    return (
      <Shell>
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
      </Shell>
    )

  return (
    <Shell>
      <Party pin={pin} isHost={role === 'host'} />
    </Shell>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="app">
      <header className="topbar">
        <span className="brand">🔮 사주·궁합 파티</span>
        <span className="tag">1인 1장 · 오늘의 최강 운세</span>
      </header>
      {children}
      <footer className="foot">결과는 재미로 즐기는 엔터테인먼트예요 · 원본 생년월일은 이 기기 밖으로 나가지 않아요</footer>
    </main>
  )
}

function Landing({
  onHost,
  onJoin,
}: {
  onHost: () => void
  onJoin: (pin: string) => void
}) {
  const [pin, setPin] = useState('')
  return (
    <section className="landing">
      <h1>오늘 파티, 누가 최강 운세?</h1>
      <p className="lede">생년월일로 사주 오행을 뽑고, 다 같이 타로 한 장씩 — 현장에서 바로 겨뤄요.</p>
      <div className="cards">
        <div className="panel">
          <h2>파티 열기</h2>
          <p>호스트가 되어 PIN·QR로 친구를 초대해요.</p>
          <button type="button" className="cta" onClick={onHost}>
            파티 만들기
          </button>
        </div>
        <div className="panel">
          <h2>파티 참여</h2>
          <p>호스트가 알려준 4자리 PIN을 입력하세요.</p>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (/^\d{4}$/.test(pin)) onJoin(pin)
            }}
          >
            <input
              inputMode="numeric"
              pattern="\d{4}"
              maxLength={4}
              placeholder="0000"
              aria-label="파티 PIN 4자리"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
            />
            <button type="submit" className="cta" disabled={!/^\d{4}$/.test(pin)}>
              입장
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}

function Party({ pin, isHost }: { pin: string; isHost: boolean }) {
  const [state, setState] = useState<RoomState>(() => newRoom(pin))
  const [me, setMe] = useState<Participant | null>(null)
  const [error, setError] = useState('')
  const chanRef = useRef<RoomChannel | null>(null)

  const roomUrl = useMemo(
    () => `${location.origin}${location.pathname}?pin=${pin}`,
    [pin],
  )

  useEffect(() => {
    const chan = new RoomChannel(pin, (s) => setState(s))
    chanRef.current = chan
    // 게스트는 최신 상태를 요청. 호스트는 초기 권위 상태를 방송.
    if (isHost) chan.publish(newRoom(pin))
    else chan.requestSync()
    return () => chan.close()
  }, [pin, isHost])

  // 내 ready/입장 여부를 항상 최신 state에서 재확인(재연결 안전).
  const myId = me?.id
  const meInState = myId ? state.participants.find((p) => p.id === myId) ?? null : null

  function submitBirth(form: BirthForm) {
    setError('')
    const prof = derive(form.birth)
    const p: Participant = {
      id: crypto.randomUUID(),
      nickname: form.nickname.trim(),
      element: prof.yearElement,
      ready: false,
    }
    try {
      const next = join(state, { id: p.id, nickname: p.nickname, element: p.element })
      setMe(p)
      publish(next)
    } catch (e) {
      setError((e as Error).message)
    }
  }

  // 게스트는 호스트에게 상태 변경을 반영시켜야 하지만, MVP 단일-기기 데모에서는
  // BroadcastChannel로 모두가 같은 채널을 보므로 마지막 발행이 권위가 된다.
  // ponytail: 진짜 다기기라면 서버 권위 필요(known ceiling, ADR 대상).
  function publish(next: RoomState) {
    setState(next)
    chanRef.current?.publish(next)
  }

  function toggleReady() {
    if (!meInState) return
    publish(setReady(state, meInState.id, !meInState.ready))
  }

  function doReveal() {
    setError('')
    try {
      publish(reveal(state))
    } catch (e) {
      setError((e as Error).message)
    }
  }

  const allReady =
    state.participants.length >= 2 && state.participants.every((p) => p.ready)

  // 아직 입장 전 → 생년월일 입력
  if (!meInState && state.phase === 'lobby')
    return (
      <BirthEntry pin={pin} isHost={isHost} onSubmit={submitBirth} error={error} />
    )

  if (state.phase === 'revealed')
    return <Reveal state={state} roomUrl={roomUrl} myId={myId} />

  // 로비
  return (
    <section className="lobby">
      <div className="pin-row">
        <div>
          <span className="pin-label">PIN</span>
          <span className="pin-big">{pin}</span>
        </div>
        {isHost && <Qr url={roomUrl} />}
      </div>
      <p className="join-hint">
        친구는 이 링크로 입장: <code className="url">{roomUrl}</code>
      </p>

      <h2>대기실 ({state.participants.length}/{MAX_PARTICIPANTS})</h2>
      <ul className="players">
        {state.participants.map((p) => (
          <li key={p.id} className={p.ready ? 'ready' : ''}>
            <span>{p.nickname}</span>
            <span className="el">{p.element}</span>
            <span className="status">{p.ready ? '✅ 준비' : '⏳ 대기'}</span>
          </li>
        ))}
      </ul>

      {meInState && (
        <button type="button" className="cta" onClick={toggleReady}>
          {meInState.ready ? '준비 취소' : '준비 완료'}
        </button>
      )}

      {isHost && (
        <button
          type="button"
          className="cta reveal"
          onClick={doReveal}
          disabled={state.participants.length < 2}
          title={allReady ? '' : '전원 준비되면 공개하는 걸 추천해요'}
        >
          🎴 카드 공개! {!allReady && state.participants.length >= 2 ? '(아직 준비 안 된 사람 있음)' : ''}
        </button>
      )}
      {error && <p className="err">{error}</p>}
    </section>
  )
}

// ── 생년월일 입력 ────────────────────────────────
interface BirthForm {
  nickname: string
  birth: { year: number; month: number; day: number; hour?: number }
}

function BirthEntry({
  pin,
  isHost,
  onSubmit,
  error,
}: {
  pin: string
  isHost: boolean
  onSubmit: (f: BirthForm) => void
  error: string
}) {
  const [nickname, setNick] = useState('')
  const [year, setYear] = useState('')
  const [month, setMonth] = useState('')
  const [day, setDay] = useState('')
  const [hour, setHour] = useState('')
  const [hourUnknown, setHourUnknown] = useState(false)

  const valid =
    nickname.trim().length > 0 &&
    +year >= 1900 &&
    +year <= 2100 &&
    +month >= 1 &&
    +month <= 12 &&
    +day >= 1 &&
    +day <= 31 &&
    (hourUnknown || (+hour >= 0 && +hour <= 23 && hour !== ''))

  return (
    <section className="entry">
      <h2>{isHost ? '파티 개설' : `파티 참여 · PIN ${pin}`}</h2>
      <p className="lede">생년월일로 오늘의 사주 오행을 뽑아요. 원본 날짜는 이 기기 밖으로 나가지 않아요.</p>
      <form
        className="birth-form"
        onSubmit={(e) => {
          e.preventDefault()
          if (!valid) return
          onSubmit({
            nickname,
            birth: {
              year: +year,
              month: +month,
              day: +day,
              hour: hourUnknown ? undefined : +hour,
            },
          })
        }}
      >
        <label>
          닉네임
          <input value={nickname} maxLength={12} onChange={(e) => setNick(e.target.value)} placeholder="파티에서 보일 이름" />
        </label>
        <div className="row3">
          <label>
            연
            <input inputMode="numeric" value={year} onChange={(e) => setYear(e.target.value.replace(/\D/g, ''))} placeholder="1998" maxLength={4} />
          </label>
          <label>
            월
            <input inputMode="numeric" value={month} onChange={(e) => setMonth(e.target.value.replace(/\D/g, ''))} placeholder="3" maxLength={2} />
          </label>
          <label>
            일
            <input inputMode="numeric" value={day} onChange={(e) => setDay(e.target.value.replace(/\D/g, ''))} placeholder="21" maxLength={2} />
          </label>
        </div>
        <label className={hourUnknown ? 'muted' : ''}>
          출생 시각 (0-23시)
          <input inputMode="numeric" value={hour} disabled={hourUnknown} onChange={(e) => setHour(e.target.value.replace(/\D/g, ''))} placeholder="14" maxLength={2} />
        </label>
        <label className="checkbox">
          <input type="checkbox" checked={hourUnknown} onChange={(e) => setHourUnknown(e.target.checked)} />
          출생 시각 모름 (시간주 제외 간이 해석)
        </label>
        <button type="submit" className="cta" disabled={!valid}>
          {isHost ? '파티 열기' : '입장하기'}
        </button>
      </form>
      {error && <p className="err">{error}</p>}
    </section>
  )
}

// ── 공개·리캡 ────────────────────────────────
function Reveal({
  state,
  roomUrl,
  myId,
}: {
  state: RoomState
  roomUrl: string
  myId?: string
}) {
  const w = winner(state)
  return (
    <section className="reveal-view">
      <h1>🎉 오늘 파티의 최강 운세</h1>
      {w && (
        <div className="crown">
          <div className="crown-name">👑 {w.nickname}</div>
          <div className="crown-card">「{state.deal[w.id].name}」</div>
          <p className="crown-fortune">{state.deal[w.id].fortune}</p>
        </div>
      )}

      <div className="grid-cards">
        {state.participants.map((p) => {
          const c = state.deal[p.id]
          return (
            <div key={p.id} className={`mini-card${p.id === myId ? ' me' : ''}${p.id === w?.id ? ' win' : ''}`}>
              <div className="mc-rank">#{22 - c.rank + 1}</div>
              <div className="mc-name">{c.name}</div>
              <div className="mc-who">{p.nickname} · {p.element}</div>
            </div>
          )
        })}
      </div>

      <ChemistryMatrix participants={state.participants} />
      <ShareCard state={state} roomUrl={roomUrl} />
    </section>
  )
}

// QR: 외부 이미지 API 없이 카나리 링크만 크게 표시 + 브라우저 네이티브 복사.
// ponytail: 로컬 QR 인코더는 의존성이 필요 → MVP는 링크 공유로 충분(known ceiling).
function Qr({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      className="qr-copy"
      onClick={async () => {
        await navigator.clipboard?.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      }}
    >
      {copied ? '✅ 링크 복사됨' : '🔗 초대 링크 복사'}
    </button>
  )
}
