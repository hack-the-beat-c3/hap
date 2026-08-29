import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { TAROT_CARDS } from '../data/tarot.ts'
import { calculateTodaySaju } from '../domain/saju.ts'
import type { Element, SajuResult } from '../domain/saju.ts'
import { drawOneCard } from '../domain/tarot.ts'
import { downloadArtifact, renderResultPng } from '../downloadResult.ts'
import type { DrawResult } from '../downloadResult.ts'

type AppStep = 'HERO_INPUT' | 'SAJU_CONFIRM' | 'DRAWING' | 'RESULT'

const ELEMENTS: Record<Element, { ko: string; icon: string; color: string }> = {
  WOOD: { ko: '목', icon: '木', color: '#78a67d' },
  FIRE: { ko: '화', icon: '火', color: '#d96c57' },
  EARTH: { ko: '토', icon: '土', color: '#c69a59' },
  METAL: { ko: '금', icon: '金', color: '#b9a777' },
  WATER: { ko: '수', icon: '水', color: '#668dac' },
}

function localDateKey(date = new Date()): string {
  const year = String(date.getFullYear()).padStart(4, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function TarotSoloFlow() {
  const [step, setStep] = useState<AppStep>('HERO_INPUT')
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [entertainmentAccepted, setEntertainmentAccepted] = useState(false)
  const [birthDate, setBirthDate] = useState('')
  const [saju, setSaju] = useState<SajuResult | null>(null)
  const [draw, setDraw] = useState<DrawResult | null>(null)
  const [error, setError] = useState('')
  const [heroImageFailed, setHeroImageFailed] = useState(false)
  const [cardImageFailed, setCardImageFailed] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const dateInput = useRef<HTMLInputElement>(null)
  const drawingLock = useRef(false)

  const submitBirthDate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    if (!privacyAccepted || !entertainmentAccepted) {
      setError('필수 안내 두 항목에 동의해 주세요.')
      return
    }

    try {
      setSaju(calculateTodaySaju({ birthDate }))
      setStep('SAJU_CONFIRM')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '생년월일을 다시 확인해 주세요.')
      dateInput.current?.focus()
    }
  }

  const drawCard = async () => {
    if (!saju || draw || drawingLock.current) return
    drawingLock.current = true
    setError('')
    setStep('DRAWING')

    try {
      const card = drawOneCard(TAROT_CARDS, globalThis.crypto)
      const result: DrawResult = { card, saju, drawnAt: new Date().toISOString() }
      setDraw(result)
      setBirthDate('')
      const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches
      await new Promise((resolve) => setTimeout(resolve, reducedMotion ? 0 : 650))
      setStep('RESULT')
    } catch (cause) {
      drawingLock.current = false
      setStep('SAJU_CONFIRM')
      setError(cause instanceof Error ? cause.message : '카드를 뽑지 못했습니다. 다시 시도해 주세요.')
    }
  }

  const saveResult = async () => {
    if (!draw || cardImageFailed || downloading) return
    setDownloading(true)
    setError('')
    try {
      const artifact = await renderResultPng(document.createElement('canvas'), draw)
      downloadArtifact(artifact)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '결과 이미지를 저장하지 못했습니다.')
    } finally {
      setDownloading(false)
    }
  }

  const resetAll = () => {
    drawingLock.current = false
    setStep('HERO_INPUT')
    setSaju(null)
    setDraw(null)
    setBirthDate('')
    setPrivacyAccepted(false)
    setEntertainmentAccepted(false)
    setError('')
    setHeroImageFailed(false)
    setCardImageFailed(false)
  }

  return (
    <main className="tarot-app-shell">
      <header className="topbar">
        <span className="brand">HAP · 오늘의 타로 한 장</span>
        <span className="tag">2026 I/O Extended</span>
      </header>

      {step === 'HERO_INPUT' && (
        <section className="step-panel" aria-label="생년월일 입력">
          <div className="hero-box">
            {!heroImageFailed ? (
              <img
                src="/assets/hero.png"
                alt="사주와 타로 파티 일러스트"
                className="hero-art"
                onError={() => setHeroImageFailed(true)}
              />
            ) : (
              <div className="hero-fallback">🌌 생년월일 기반 오늘의 운세와 타로 한 장</div>
            )}
            <p className="hero-hook">생년월일로 오늘의 간이 사주를 읽고, 파티의 행운 타로를 한 장 뽑아보세요.</p>
          </div>

          <form onSubmit={submitBirthDate} className="form-grid">
            <label className="field-block" htmlFor="birth-date-input">
              <span className="field-title">생년월일 (YYYY-MM-DD)</span>
              <input
                id="birth-date-input"
                ref={dateInput}
                type="date"
                required
                min="1900-01-01"
                max={localDateKey()}
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="input-base"
              />
            </label>

            <fieldset className="consent-block">
              <legend className="field-title">필수 안내 동의</legend>
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={privacyAccepted}
                  onChange={(e) => setPrivacyAccepted(e.target.checked)}
                />
                <span>생년월일은 브라우저에서 계산 후 저장 없이 즉시 폐기됩니다. (필수)</span>
              </label>
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={entertainmentAccepted}
                  onChange={(e) => setEntertainmentAccepted(e.target.checked)}
                />
                <span>본 콘텐츠는 파티용 엔터테인먼트 결과입니다. (필수)</span>
              </label>
            </fieldset>

            {error && <p className="error-banner" role="alert">{error}</p>}

            <button type="submit" className="cta">오늘의 간이 사주 확인하기</button>
          </form>
        </section>
      )}

      {step === 'SAJU_CONFIRM' && saju && (
        <section className="step-panel" aria-label="사주 결과 확인">
          <div className="saju-card">
            <h2 className="step-title">오늘의 간이 사주</h2>
            <div className="saju-grid">
              <div>
                <span className="meta-label">기준일</span>
                <span className="meta-value">{saju.calculatedFor}</span>
              </div>
              <div>
                <span className="meta-label">중심 오행</span>
                <span className="element-chip" style={{ borderColor: ELEMENTS[saju.primaryElement].color }}>
                  {ELEMENTS[saju.primaryElement].icon} {ELEMENTS[saju.primaryElement].ko}
                </span>
              </div>
              <div>
                <span className="meta-label">오늘의 테마</span>
                <span className="meta-value">{saju.title}</span>
              </div>
            </div>
            <p className="saju-desc">{saju.summary} {saju.advice}</p>
          </div>

          {error && <p className="error-banner" role="alert">{error}</p>}

          <div className="button-cluster">
            <button type="button" onClick={drawCard} className="cta">행운의 타로 한 장 뽑기</button>
            <button type="button" onClick={resetAll} className="btn-sub">다시 입력하기</button>
          </div>
        </section>
      )}

      {step === 'DRAWING' && (
        <section className="step-panel drawing-panel" aria-label="타로 뽑는 중">
          <div className="card-flipper">
            <div className="card-back-art">HAP</div>
          </div>
          <p className="loading-copy">오늘의 행운을 섞어 한 장을 꺼내고 있습니다...</p>
        </section>
      )}

      {step === 'RESULT' && draw && (
        <section className="step-panel result-panel" aria-label="타로 및 사주 최종 결과">
          <div className="result-card">
            <div className="card-visual">
              {!cardImageFailed ? (
                <img
                  src={draw.card.imagePath}
                  alt={draw.card.nameKo}
                  className="tarot-art"
                  onError={() => setCardImageFailed(true)}
                />
              ) : (
                <div className="tarot-art-fallback">{draw.card.arcanaNumber}. {draw.card.nameKo}</div>
              )}
            </div>
            <div className="card-copy">
              <span className="card-badge">No.{draw.card.arcanaNumber}</span>
              <h2 className="card-name">{draw.card.nameKo} ({draw.card.nameEn})</h2>
              <p className="card-keyword"><strong>요약:</strong> {draw.card.summary}</p>
              <p className="card-message">{draw.card.description}</p>
              <p className="party-message" style={{ color: '#f59e0b', marginTop: '0.5rem', fontWeight: 600 }}>
                💬 {draw.card.partyMessage}
              </p>
            </div>
          </div>

          {error && <p className="error-banner" role="alert">{error}</p>}

          <div className="button-cluster">
            <button type="button" onClick={saveResult} disabled={downloading} className="cta">
              {downloading ? '결과 이미지 생성 중...' : '결과 이미지 다운로드 (PNG)'}
            </button>
            <button type="button" onClick={resetAll} className="btn-sub">처음부터 다시 하기</button>
          </div>
        </section>
      )}

      <footer className="foot">
        <p>생년월일 미저장 · 엔터테인먼트 목적 · 메이저 22장 공정 셔플</p>
      </footer>
    </main>
  )
}
