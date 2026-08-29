// 파티룸 공유 상태. MVP는 백엔드 없이 BroadcastChannel로 같은 기기의 탭 간 실시간 동기화한다.
// ponytail: 단일 기기 데모 한정(known ceiling). 다기기 실시간은 ADR로 서버 채택 시 교체.
// 서버 권위 상태는 room phase / participants / deal / result 로 제한 (AGENTS.md §6).
// 원본 생년월일은 저장/전송하지 않고 파생 오행(Element)만 공유한다 (AGENTS.md §2.2).

import type { Element } from './ohaeng'
import { dealOneEach, DECK, type TarotCard } from './tarot'

export const MAX_PARTICIPANTS = Math.min(15, DECK.length) // MVP 정원 2~15

export type RoomPhase = 'lobby' | 'revealed'

export interface Participant {
  id: string
  nickname: string
  element: Element // 파생 오행만
  ready: boolean
}

export interface RoomState {
  pin: string
  phase: RoomPhase
  participants: Participant[]
  deal: Record<string, TarotCard> // 공개 후에만 채워짐
  updatedAt: number
}

type Msg =
  | { t: 'sync'; state: RoomState }
  | { t: 'request-sync' }

const PREFIX = 'hap-room-'

function channelFor(pin: string) {
  return new BroadcastChannel(PREFIX + pin)
}

export function makePin(): string {
  return String(Math.floor(1000 + Math.random() * 9000)) // 4자리
}

export function newRoom(pin: string): RoomState {
  return { pin, phase: 'lobby', participants: [], deal: {}, updatedAt: Date.now() }
}

// 룸 하나에 대한 구독/발행 핸들. 호스트가 권위 상태를 들고, 게스트는 변경을 요청한다.
export class RoomChannel {
  private ch: BroadcastChannel
  private onState: (s: RoomState) => void
  public pin: string
  constructor(pin: string, onState: (s: RoomState) => void) {
    this.pin = pin
    this.onState = onState
    this.ch = channelFor(pin)
    this.ch.onmessage = (e: MessageEvent<Msg>) => {
      const msg = e.data
      if (msg.t === 'sync') this.onState(msg.state)
      else if (msg.t === 'request-sync' && this.authoritative)
        this.publish(this.authoritative)
    }
  }

  private authoritative: RoomState | null = null

  // 호스트: 권위 상태를 갱신하고 전 참가자에게 방송.
  publish(state: RoomState) {
    this.authoritative = state
    this.ch.postMessage({ t: 'sync', state } satisfies Msg)
  }

  // 게스트: 최신 상태를 요청(입장 직후 호출).
  requestSync() {
    this.ch.postMessage({ t: 'request-sync' } satisfies Msg)
  }

  close() {
    this.ch.close()
  }
}

// ── 순수 상태 전이 함수 (테스트 가능) ──────────────────────────

export function join(
  state: RoomState,
  p: Omit<Participant, 'ready'>,
): RoomState {
  if (state.phase !== 'lobby') throw new Error('이미 공개된 파티입니다')
  if (state.participants.length >= MAX_PARTICIPANTS)
    throw new Error(`만원입니다 (최대 ${MAX_PARTICIPANTS}명)`)
  if (state.participants.some((x) => x.nickname === p.nickname))
    throw new Error('이미 사용 중인 닉네임입니다')
  return {
    ...state,
    participants: [...state.participants, { ...p, ready: false }],
    updatedAt: Date.now(),
  }
}

export function setReady(state: RoomState, id: string, ready: boolean): RoomState {
  return {
    ...state,
    participants: state.participants.map((p) =>
      p.id === id ? { ...p, ready } : p,
    ),
    updatedAt: Date.now(),
  }
}

export function reveal(state: RoomState): RoomState {
  if (state.participants.length < 2) throw new Error('최소 2명이 필요합니다')
  const deal = dealOneEach(state.participants.map((p) => p.id))
  return { ...state, phase: 'revealed', deal, updatedAt: Date.now() }
}

// 우승자: 배분된 카드 중 파티 하우스 룰 rank 최고.
export function winner(state: RoomState): Participant | null {
  if (state.phase !== 'revealed') return null
  let best: Participant | null = null
  let bestRank = -1
  for (const p of state.participants) {
    const card = state.deal[p.id]
    if (card && card.rank > bestRank) {
      bestRank = card.rank
      best = p
    }
  }
  return best
}
