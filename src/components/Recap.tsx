// 기능 3: 오행 궁합 매트릭스 + 공유용 리캡 카드(canvas → 이미지).
import { useRef } from 'react'
import { chemistry } from '../lib/ohaeng'
import type { Participant, RoomState } from '../lib/room'
import { winner } from '../lib/room'

export function ChemistryMatrix({ participants }: { participants: Participant[] }) {
  // 상생 최고 짝 찾기
  let bestPair: [Participant, Participant] | null = null
  let bestScore = -1
  let worstPair: [Participant, Participant] | null = null
  let worstScore = 101
  for (let i = 0; i < participants.length; i++) {
    for (let j = i + 1; j < participants.length; j++) {
      const c = chemistry(participants[i].element, participants[j].element)
      if (c.score > bestScore) {
        bestScore = c.score
        bestPair = [participants[i], participants[j]]
      }
      if (c.score < worstScore) {
        worstScore = c.score
        worstPair = [participants[i], participants[j]]
      }
    }
  }

  return (
    <div className="chemistry">
      <h3>오행 궁합</h3>
      {bestPair && (
        <p className="chem-highlight chem-best">
          💞 오늘 최고 케미: <b>{bestPair[0].nickname}</b> × <b>{bestPair[1].nickname}</b>
        </p>
      )}
      {worstPair && worstScore < 40 && (
        <p className="chem-highlight chem-worst">
          ⚡ 상극 주의: <b>{worstPair[0].nickname}</b> × <b>{worstPair[1].nickname}</b>
        </p>
      )}
      <table className="chem-table" aria-label="참가자 오행 궁합표">
        <thead>
          <tr>
            <th scope="col"></th>
            {participants.map((p) => (
              <th key={p.id} scope="col">
                {p.nickname}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {participants.map((a) => (
            <tr key={a.id}>
              <th scope="row">
                {a.nickname}
                <span className="el">{a.element}</span>
              </th>
              {participants.map((b) => {
                if (a.id === b.id) return <td key={b.id} className="chem-self">—</td>
                const c = chemistry(a.element, b.element)
                return (
                  <td key={b.id} className={`chem-${c.kind}`} title={c.label}>
                    {c.kind === '상생' ? '💞' : c.kind === '상극' ? '⚡' : c.kind === '동일' ? '🤝' : '·'}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// 공유용 리캡 카드. canvas에 그려 PNG로 내보내고 Web Share API로 공유(미지원 시 다운로드).
export function ShareCard({ state, roomUrl }: { state: RoomState; roomUrl: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  function draw(): HTMLCanvasElement | null {
    const canvas = canvasRef.current
    if (!canvas) return null
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    const W = 600
    const H = 800
    canvas.width = W
    canvas.height = H

    const grad = ctx.createLinearGradient(0, 0, W, H)
    grad.addColorStop(0, '#2a1245')
    grad.addColorStop(1, '#0d0618')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, W, H)

    const w = winner(state)
    ctx.textAlign = 'center'
    ctx.fillStyle = '#c084fc'
    ctx.font = '600 28px system-ui, sans-serif'
    ctx.fillText('오늘 파티의 최강 운세', W / 2, 90)

    if (w) {
      const card = state.deal[w.id]
      ctx.fillStyle = '#fff'
      ctx.font = '700 52px system-ui, sans-serif'
      ctx.fillText(`👑 ${w.nickname}`, W / 2, 170)
      ctx.fillStyle = '#f0d9ff'
      ctx.font = '600 32px system-ui, sans-serif'
      ctx.fillText(`「${card.name}」`, W / 2, 230)
      ctx.fillStyle = '#c9b8e0'
      ctx.font = '20px system-ui, sans-serif'
      wrap(ctx, card.fortune, W / 2, 285, 500, 28)
    }

    // 참가자 목록
    ctx.fillStyle = '#a78bc0'
    ctx.font = '18px system-ui, sans-serif'
    ctx.fillText(`함께한 ${state.participants.length}명`, W / 2, 400)
    ctx.fillStyle = '#e8ddf5'
    ctx.font = '20px system-ui, sans-serif'
    state.participants.forEach((p, i) => {
      ctx.fillText(`${p.nickname} · ${p.element}`, W / 2, 440 + i * 30)
    })

    ctx.fillStyle = '#8a7aa0'
    ctx.font = '16px system-ui, sans-serif'
    ctx.fillText('사주·궁합 파티 · 엔터테인먼트용', W / 2, H - 60)
    ctx.fillStyle = '#c084fc'
    ctx.font = '600 18px system-ui, sans-serif'
    ctx.fillText('다음 파티도 여기서 → hap', W / 2, H - 30)
    return canvas
  }

  async function share() {
    const canvas = draw()
    if (!canvas) return
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/png'))
    if (!blob) return
    const file = new File([blob], 'hap-party.png', { type: 'image/png' })
    const shareData = {
      title: '오늘 파티의 최강 운세',
      text: `우리 파티 결과 나왔어! 다음 파티도 같이 → ${roomUrl}`,
      files: [file],
    }
    // Web Share API(모바일) → 미지원 시 다운로드 폴백.
    if (navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData)
        return
      } catch {
        /* 사용자 취소 — 폴백 안 함 */
        return
      }
    }
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'hap-party.png'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="share-card">
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <button type="button" className="cta" onClick={share}>
        📸 결과 카드 공유하기
      </button>
      <p className="hint">공유 카드에 다음 파티 초대 링크가 담겨요</p>
    </div>
  )
}

function wrap(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  const words = text.split(' ')
  let line = ''
  let yy = y
  for (const word of words) {
    const test = line ? line + ' ' + word : word
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, yy)
      line = word
      yy += lineHeight
    } else {
      line = test
    }
  }
  ctx.fillText(line, x, yy)
}
