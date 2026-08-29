import { useRef, useState } from 'react'
import type { CSSProperties, FormEvent } from 'react'
import './App.css'
import { TAROT_CARDS } from './data/tarot.ts'
import { calculateTodaySaju } from './domain/saju.ts'
import type { Element, SajuResult } from './domain/saju.ts'
import { drawOneCard } from './domain/tarot.ts'
import { downloadArtifact, renderResultPng } from './downloadResult.ts'
import type { DrawResult } from './downloadResult.ts'

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

function displayDate(value: string): string {
  const [year, month, day] = value.split('-')
  return `${year}년 ${Number(month)}월 ${Number(day)}일`
}

function App() {
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

  const currentStage = step === 'HERO_INPUT' ? 1 : step === 'SAJU_CONFIRM' ? 2 : 3

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="HAP 타로섯다 처음으로">
          HAP <span>· TAROT</span>
        </a>
        <ol className="progress" aria-label={`진행 단계 ${currentStage} / 3`}>
          {[1, 2, 3].map((stage) => (
            <li
              key={stage}
              className={stage <= currentStage ? 'active' : ''}
              aria-current={stage === currentStage ? 'step' : undefined}
            >
              <span>{stage}</span>
            </li>
          ))}
        </ol>
      </header>

      {step === 'HERO_INPUT' && (
        <section className="screen hero-screen" aria-labelledby="hero-title">
          <div className="hero-visual" aria-hidden="true">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="hero-card-back">福</div>
            <div className="hero-card-face">
              {heroImageFailed ? (
                <span className="hero-fallback">☀</span>
              ) : (
                <img src="/tarot/19-the-sun.png" alt="" onError={() => setHeroImageFailed(true)} />
              )}
            </div>
          </div>

          <div className="hero-copy">
            <p className="eyebrow">ONE CARD PARTY FORTUNE</p>
            <h1 id="hero-title">오늘의 기운을<br />한 장에 담다</h1>
            <p className="lead">생년월일로 오늘의 간이 사주를 확인하고, 당신을 기다리는 타로 한 장을 만나보세요.</p>
          </div>

          <form className="birth-form" onSubmit={submitBirthDate}>
            <label className="field-label" htmlFor="birth-date">생년월일</label>
            <input
              ref={dateInput}
              id="birth-date"
              name="birthDate"
              type="date"
              value={birthDate}
              max={localDateKey()}
              onChange={(event) => {
                setBirthDate(event.target.value)
                setError('')
              }}
              required
              aria-describedby="birth-help form-error"
            />
            <p id="birth-help" className="field-help">입력값은 이 브라우저에서만 계산되며 저장하거나 전송하지 않습니다.</p>

            <div className="consents">
              <label>
                <input
                  type="checkbox"
                  checked={privacyAccepted}
                  onChange={(event) => setPrivacyAccepted(event.target.checked)}
                  required
                />
                <span>생년월일의 로컬 처리 및 즉시 폐기에 동의합니다.</span>
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={entertainmentAccepted}
                  onChange={(event) => setEntertainmentAccepted(event.target.checked)}
                  required
                />
                <span>결과는 엔터테인먼트용이며 중요한 결정의 근거가 아님을 확인했습니다.</span>
              </label>
            </div>

            {error && <p id="form-error" className="error" role="alert">{error}</p>}
            <button className="primary-button" type="submit">오늘의 사주 확인하기 <span aria-hidden="true">→</span></button>
          </form>
        </section>
      )}

      {step === 'SAJU_CONFIRM' && saju && (
        <section className="screen confirm-screen" aria-labelledby="saju-title">
          <p className="eyebrow">TODAY'S FIVE ELEMENTS</p>
          <div
            className="element-seal"
            style={{ '--element-color': ELEMENTS[saju.primaryElement].color } as CSSProperties}
            aria-hidden="true"
          >
            {ELEMENTS[saju.primaryElement].icon}
          </div>
          <p className="element-name">오늘의 오행 · {ELEMENTS[saju.primaryElement].ko}</p>
          <h1 id="saju-title">{saju.title}</h1>
          <p className="saju-summary">{saju.summary}</p>
          <p className="saju-advice">{saju.advice}</p>

          <dl className="confirmation">
            <div><dt>입력 정보</dt><dd>{displayDate(birthDate)}</dd></div>
            <div><dt>해석 기준</dt><dd>{saju.calculatedFor}</dd></div>
          </dl>

          <p className="disclaimer">{saju.disclaimer}</p>
          {error && <p className="error" role="alert">{error}</p>}
          <div className="actions">
            <button
              className="secondary-button"
              type="button"
              onClick={() => {
                setError('')
                setStep('HERO_INPUT')
              }}
            >
              다시 입력
            </button>
            <button className="primary-button" type="button" onClick={drawCard}>
              타로카드로 오늘의 행운 1장 뽑아보기
            </button>
          </div>
        </section>
      )}

      {step === 'DRAWING' && (
        <section className="screen drawing-screen" aria-live="polite" aria-busy="true">
          <p className="eyebrow">YOUR CARD IS COMING</p>
          <div className="drawing-card" aria-hidden="true"><span>福</span></div>
          <h1>오늘의 한 장을<br />열고 있어요</h1>
          <p>22장의 카드 중 당신의 카드가 정해졌습니다.</p>
        </section>
      )}

      {step === 'RESULT' && draw && (
        <section className="screen result-screen" aria-labelledby="result-title">
          <p className="eyebrow">YOUR ONE CARD</p>
          <div className="result-layout">
            <figure className={`tarot-card ${cardImageFailed ? 'image-error' : ''}`}>
              {cardImageFailed ? (
                <div className="card-fallback" role="img" aria-label={`${draw.card.nameKo} 카드 이미지를 불러오지 못함`}>
                  <span>{String(draw.card.arcanaNumber).padStart(2, '0')}</span>
                  <strong>{draw.card.nameKo}</strong>
                </div>
              ) : (
                <img
                  src={draw.card.imagePath}
                  alt={`${draw.card.nameKo}, ${draw.card.summary}`}
                  onError={() => setCardImageFailed(true)}
                />
              )}
            </figure>

            <article className="result-copy">
              <p className="card-number">ARCANA {String(draw.card.arcanaNumber).padStart(2, '0')}</p>
              <h1 id="result-title">{draw.card.nameKo}</h1>
              <p className="card-name-en">{draw.card.nameEn}</p>
              <h2>{draw.card.summary}</h2>
              <p>{draw.card.description}</p>
              <blockquote>{draw.card.partyMessage}</blockquote>
              <div className="saju-recap">
                <span>{ELEMENTS[draw.saju.primaryElement].icon}</span>
                <div>
                  <small>오늘의 오행 · {ELEMENTS[draw.saju.primaryElement].ko}</small>
                  <strong>{draw.saju.title}</strong>
                </div>
              </div>
            </article>
          </div>

          <p className="disclaimer">생년월일 기반 엔터테인먼트용 간이 해석입니다. 중요한 결정을 위한 예측이나 조언이 아닙니다.</p>
          {cardImageFailed && <p className="error" role="alert">카드 이미지가 준비되지 않아 PNG 저장을 사용할 수 없습니다.</p>}
          {error && <p className="error" role="alert">{error}</p>}
          <button
            className="primary-button download-button"
            type="button"
            onClick={saveResult}
            disabled={downloading || cardImageFailed}
          >
            {downloading ? '결과 이미지 만드는 중…' : '사주 + 타로 결과 PNG로 저장'}
          </button>
        </section>
      )}

      <footer>HAP · TAROT SEOTDA <span>오직 오늘을 위한 한 장</span></footer>
    </main>
  )
}

export default App
