import { useState, type FormEvent } from 'react'

import { getTodayInKST } from '../kstToday'
import { calculateSaju, type SajuInput } from '../saju/engine'
import { buildParticipantPayload, type ParticipantDerivedPayload } from './allowlist'
import './consent.css'

export const CONSENT_VERSION = 'consent-v1-2026-08-29'

type Step = 'consent' | 'input' | 'confirm' | 'done'
type CalendarType = SajuInput['calendarType']

export function ConsentFlow() {
  const [step, setStep] = useState<Step>('consent')
  const [requiredConsent, setRequiredConsent] = useState(false)
  const [optionalShareConsent, setOptionalShareConsent] = useState(false)
  const [consentBlockedReason, setConsentBlockedReason] = useState<string | null>(null)

  const [nickname, setNickname] = useState('')
  const [calendarType, setCalendarType] = useState<CalendarType>('solar')
  const [solarDate, setSolarDate] = useState('')
  const [lunarYear, setLunarYear] = useState('')
  const [lunarMonth, setLunarMonth] = useState('')
  const [lunarDay, setLunarDay] = useState('')
  const [isLeapMonth, setIsLeapMonth] = useState(false)
  const [birthTime, setBirthTime] = useState('')
  const [isTimeUnknown, setIsTimeUnknown] = useState(false)

  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [payload, setPayload] = useState<ParticipantDerivedPayload | null>(null)

  function resetAll() {
    setRequiredConsent(false)
    setOptionalShareConsent(false)
    setConsentBlockedReason(null)
    setNickname('')
    setCalendarType('solar')
    setSolarDate('')
    setLunarYear('')
    setLunarMonth('')
    setLunarDay('')
    setIsLeapMonth(false)
    setBirthTime('')
    setIsTimeUnknown(false)
    setErrorMessage(null)
    setIsSubmitting(false)
    setPayload(null)
    setStep('consent')
  }

  function clearInput() {
    setNickname('')
    setSolarDate('')
    setLunarYear('')
    setLunarMonth('')
    setLunarDay('')
    setIsLeapMonth(false)
    setBirthTime('')
    setIsTimeUnknown(false)
    setErrorMessage(null)
  }

  function handleConsentNext() {
    if (!requiredConsent) {
      setConsentBlockedReason('필수 동의를 체크해야 다음 단계로 진행할 수 있어요.')
      return
    }
    setConsentBlockedReason(null)
    setStep('input')
  }

  function handleBackToConsent() {
    clearInput()
    setStep('consent')
  }

  function handleCancel() {
    resetAll()
  }

  function handleInputSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage(null)
    setStep('confirm')
  }

  function handleEdit() {
    setErrorMessage(null)
    setStep('input')
  }

  function buildSajuInput(): SajuInput {
    const [year, month, day] =
      calendarType === 'solar'
        ? solarDate.split('-').map(Number)
        : [Number(lunarYear), Number(lunarMonth), Number(lunarDay)]
    const [hour, minute] = birthTime.split(':').map(Number)

    return {
      calendarType,
      ...(calendarType === 'lunar' && { isLeapMonth }),
      year,
      month,
      day,
      birthTime: isTimeUnknown ? 'unknown' : { hour, minute },
    }
  }

  function handleSubmit() {
    if (isSubmitting || payload) return
    setIsSubmitting(true)

    const calculation = calculateSaju(buildSajuInput(), getTodayInKST())

    if (!calculation.ok) {
      setErrorMessage(calculation.error.message)
      setIsSubmitting(false)
      return
    }

    setPayload(buildParticipantPayload(nickname.trim(), calculation.value))
    setStep('done')
  }

  if (step === 'done' && payload) {
    return (
      <main className="consent-page">
        <section className="consent-card" aria-labelledby="done-title">
          <p className="eyebrow">제출 완료</p>
          <h1 id="done-title">제출이 완료되었습니다</h1>
          <p className="intro">
            {payload.nickname}님, 중심 오행 <strong>{payload.dominantElement}</strong> 정보가
            준비되었어요. 원본 생년월일·출생시각은 이 화면을 벗어나지 않습니다.
          </p>
          <button type="button" className="primary-button" onClick={resetAll}>
            새로 시작
          </button>
        </section>
      </main>
    )
  }

  if (step === 'confirm') {
    return (
      <main className="consent-page">
        <section className="consent-card" aria-labelledby="confirm-title">
          <p className="eyebrow">확인</p>
          <h1 id="confirm-title">입력 내용을 확인해 주세요</h1>
          <dl className="confirm-list">
            <dt>닉네임</dt>
            <dd>{nickname}</dd>
            <dt>달력 종류</dt>
            <dd>{calendarType === 'solar' ? '양력' : '음력'}</dd>
            <dt>생년월일</dt>
            <dd>
              {calendarType === 'solar'
                ? solarDate
                : `${lunarYear}-${lunarMonth}-${lunarDay}${isLeapMonth ? ' (윤달)' : ''}`}
            </dd>
            <dt>출생시각</dt>
            <dd>{isTimeUnknown ? '모름' : birthTime}</dd>
          </dl>
          {errorMessage && (
            <div className="error-message" role="alert">
              <strong>오류:</strong> {errorMessage}
            </div>
          )}
          <div className="button-row">
            <button type="button" className="secondary-button" onClick={handleEdit}>
              수정
            </button>
            <button
              type="button"
              className="primary-button"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              제출
            </button>
          </div>
        </section>
      </main>
    )
  }

  if (step === 'input') {
    return (
      <main className="consent-page">
        <section className="consent-card" aria-labelledby="input-title">
          <p className="eyebrow">정보 입력</p>
          <h1 id="input-title">정보 입력</h1>
          <form onSubmit={handleInputSubmit}>
            <div className="field">
              <label htmlFor="c-nickname">닉네임</label>
              <input
                id="c-nickname"
                type="text"
                required
                maxLength={20}
                value={nickname}
                onChange={(event) => setNickname(event.target.value)}
                autoComplete="off"
              />
            </div>
            <fieldset>
              <legend>달력 종류</legend>
              <div className="choice-row">
                <label htmlFor="c-calendar-solar">
                  <input
                    id="c-calendar-solar"
                    type="radio"
                    name="c-calendar-type"
                    value="solar"
                    checked={calendarType === 'solar'}
                    onChange={() => setCalendarType('solar')}
                  />
                  양력
                </label>
                <label htmlFor="c-calendar-lunar">
                  <input
                    id="c-calendar-lunar"
                    type="radio"
                    name="c-calendar-type"
                    value="lunar"
                    checked={calendarType === 'lunar'}
                    onChange={() => setCalendarType('lunar')}
                  />
                  음력
                </label>
              </div>
            </fieldset>
            {calendarType === 'solar' ? (
              <div className="field">
                <label htmlFor="c-solar-date">생년월일</label>
                <input
                  id="c-solar-date"
                  type="date"
                  required
                  value={solarDate}
                  onChange={(event) => setSolarDate(event.target.value)}
                />
              </div>
            ) : (
              <fieldset>
                <legend>음력 생년월일</legend>
                <div className="lunar-date-row">
                  <div className="field">
                    <label htmlFor="c-lunar-year">연도</label>
                    <input
                      id="c-lunar-year"
                      type="number"
                      required
                      min="1000"
                      max="2050"
                      inputMode="numeric"
                      value={lunarYear}
                      onChange={(event) => setLunarYear(event.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="c-lunar-month">월</label>
                    <input
                      id="c-lunar-month"
                      type="number"
                      required
                      min="1"
                      max="12"
                      inputMode="numeric"
                      value={lunarMonth}
                      onChange={(event) => setLunarMonth(event.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="c-lunar-day">일</label>
                    <input
                      id="c-lunar-day"
                      type="number"
                      required
                      min="1"
                      max="30"
                      inputMode="numeric"
                      value={lunarDay}
                      onChange={(event) => setLunarDay(event.target.value)}
                    />
                  </div>
                </div>
                <label className="check-label" htmlFor="c-leap-month">
                  <input
                    id="c-leap-month"
                    type="checkbox"
                    checked={isLeapMonth}
                    onChange={(event) => setIsLeapMonth(event.target.checked)}
                  />
                  윤달입니다
                </label>
              </fieldset>
            )}
            <div className="field">
              <label htmlFor="c-birth-time">출생시각</label>
              <input
                id="c-birth-time"
                type="time"
                required={!isTimeUnknown}
                disabled={isTimeUnknown}
                value={birthTime}
                onChange={(event) => setBirthTime(event.target.value)}
              />
            </div>
            <label className="check-label" htmlFor="c-unknown-time">
              <input
                id="c-unknown-time"
                type="checkbox"
                checked={isTimeUnknown}
                onChange={(event) => setIsTimeUnknown(event.target.checked)}
              />
              출생시각 모름
            </label>
            <div className="button-row">
              <button type="button" className="secondary-button" onClick={handleBackToConsent}>
                뒤로
              </button>
              <button type="submit" className="primary-button">
                확인하기
              </button>
            </div>
          </form>
        </section>
      </main>
    )
  }

  return (
    <main className="consent-page">
      <section className="consent-card" aria-labelledby="consent-title">
        <p className="eyebrow">개인정보 안내 및 동의</p>
        <h1 id="consent-title">시작 전 확인해 주세요</h1>
        <p className="intro">
          입력하신 생년월일·출생시각은 이 브라우저 안에서만 사주·오행 계산에 사용되고 계산 직후
          사라집니다. 서버나 다른 참가자에게 원본 값을 보내지 않습니다.
        </p>
        <div className="consent-item">
          <label className="check-label" htmlFor="c-required-consent">
            <input
              id="c-required-consent"
              type="checkbox"
              checked={requiredConsent}
              onChange={(event) => {
                setRequiredConsent(event.target.checked)
                if (event.target.checked) setConsentBlockedReason(null)
              }}
            />
            (필수) 사주·오행 계산을 위해 생년월일·출생시각을 브라우저에서 일시적으로 처리하는 데
            동의합니다.
          </label>
          <p className="consent-detail">
            목적: 오늘의 오행 결과 계산. 처리 방식: 이 브라우저 메모리에서만 계산 직후 폐기.
            거부 시 영향: 동의하지 않으면 입력·계산 단계로 진행할 수 없습니다.
          </p>
        </div>
        <div className="consent-item">
          <label className="check-label" htmlFor="c-optional-consent">
            <input
              id="c-optional-consent"
              type="checkbox"
              checked={optionalShareConsent}
              onChange={(event) => setOptionalShareConsent(event.target.checked)}
            />
            (선택) 결과 공유 이미지 생성 기능에 동의합니다.
          </label>
          <p className="consent-detail">
            현재 이 기능은 아직 제공되지 않습니다. 동의 여부와 관계없이 입력·계산 단계는 그대로
            진행됩니다.
          </p>
        </div>
        {consentBlockedReason && (
          <div className="error-message" role="alert">
            <strong>오류:</strong> {consentBlockedReason}
          </div>
        )}
        <div className="button-row">
          <button type="button" className="secondary-button" onClick={handleCancel}>
            취소
          </button>
          <button type="button" className="primary-button" onClick={handleConsentNext}>
            다음
          </button>
        </div>
      </section>
    </main>
  )
}
