import { useState, type FormEvent } from 'react'

import { getTodayInKST } from '../kstToday'
import { FIVE_ELEMENTS } from './elements'
import { calculateSaju, type SajuInput, type SajuResult } from './engine'

type CalendarType = SajuInput['calendarType']

export function SajuForm() {
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
  const [result, setResult] = useState<SajuResult | null>(null)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const [year, month, day] =
      calendarType === 'solar'
        ? solarDate.split('-').map(Number)
        : [Number(lunarYear), Number(lunarMonth), Number(lunarDay)]
    const [hour, minute] = birthTime.split(':').map(Number)
    const input: SajuInput = {
      calendarType,
      ...(calendarType === 'lunar' && { isLeapMonth }),
      year,
      month,
      day,
      birthTime: isTimeUnknown ? 'unknown' : { hour, minute },
    }
    const calculation = calculateSaju(input, getTodayInKST())

    if (!calculation.ok) {
      setResult(null)
      setErrorMessage(calculation.error.message)
      return
    }
    setErrorMessage(null)
    setResult(calculation.value)
  }

  function returnToEditing() {
    setErrorMessage(null)
    setResult(null)
  }

  if (result) {
    return (
      <main className="saju-page">
        <section className="saju-card result-card" aria-labelledby="result-title">
          <p className="eyebrow">간이 사주·오행 결과</p>
          <h1 id="result-title">{nickname.trim()}님의 오늘 기운</h1>
          <p className="dominant-element">
            중심 오행 <strong>{result.dominantElement}</strong>
          </p>
          <div className="balance" aria-labelledby="balance-title">
            <h2 id="balance-title">오행 균형</h2>
            <ul>
              {FIVE_ELEMENTS.map((element) => (
                <li key={element}>
                  <span className="element-name">{element}</span>
                  <span className="bar-track" aria-hidden="true">
                    <span
                      className="bar-fill"
                      style={{ width: `${(result.elementBalance[element] / 6) * 100}%` }}
                    />
                  </span>
                  <span className="element-count">{result.elementBalance[element]}점</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="summary">{result.todaySummary}</p>
          <div className="disclaimer" aria-label="결과 안내">
            <p>엔터테인먼트용 결과이며 실제 중요한 결정의 근거로 사용하지 마세요.</p>
            <p>시간주를 제외한 간이 해석입니다.</p>
          </div>
          <button type="button" className="secondary-button" onClick={returnToEditing}>
            다시 입력
          </button>
        </section>
      </main>
    )
  }

  return (
    <main className="saju-page">
      <section className="saju-card" aria-labelledby="form-title">
        <p className="eyebrow">오늘의 가벼운 오행 리딩</p>
        <h1 id="form-title">사주 정보 입력</h1>
        <p className="intro">입력 정보는 이 화면에서 계산할 때만 사용됩니다.</p>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="nickname">닉네임</label>
            <input id="nickname" type="text" required maxLength={20} value={nickname} onChange={(event) => setNickname(event.target.value)} autoComplete="off" />
          </div>
          <fieldset>
            <legend>달력 종류</legend>
            <div className="choice-row">
              <label htmlFor="calendar-solar">
                <input id="calendar-solar" type="radio" name="calendar-type" value="solar" checked={calendarType === 'solar'} onChange={() => setCalendarType('solar')} />
                양력
              </label>
              <label htmlFor="calendar-lunar">
                <input id="calendar-lunar" type="radio" name="calendar-type" value="lunar" checked={calendarType === 'lunar'} onChange={() => setCalendarType('lunar')} />
                음력
              </label>
            </div>
          </fieldset>
          {calendarType === 'solar' ? (
            <div className="field">
              <label htmlFor="solar-date">생년월일</label>
              <input id="solar-date" type="date" required value={solarDate} onChange={(event) => setSolarDate(event.target.value)} />
            </div>
          ) : (
            <fieldset>
              <legend>음력 생년월일</legend>
              <div className="lunar-date-row">
                <div className="field">
                  <label htmlFor="lunar-year">연도</label>
                  <input id="lunar-year" type="number" required min="1000" max="2050" inputMode="numeric" value={lunarYear} onChange={(event) => setLunarYear(event.target.value)} />
                </div>
                <div className="field">
                  <label htmlFor="lunar-month">월</label>
                  <input id="lunar-month" type="number" required min="1" max="12" inputMode="numeric" value={lunarMonth} onChange={(event) => setLunarMonth(event.target.value)} />
                </div>
                <div className="field">
                  <label htmlFor="lunar-day">일</label>
                  <input id="lunar-day" type="number" required min="1" max="30" inputMode="numeric" value={lunarDay} onChange={(event) => setLunarDay(event.target.value)} />
                </div>
              </div>
              <label className="check-label" htmlFor="leap-month">
                <input id="leap-month" type="checkbox" checked={isLeapMonth} onChange={(event) => setIsLeapMonth(event.target.checked)} />
                윤달입니다
              </label>
            </fieldset>
          )}
          <div className="field">
            <label htmlFor="birth-time">출생시각</label>
            <input id="birth-time" type="time" required={!isTimeUnknown} disabled={isTimeUnknown} value={birthTime} onChange={(event) => setBirthTime(event.target.value)} />
          </div>
          <label className="check-label" htmlFor="unknown-time">
            <input id="unknown-time" type="checkbox" checked={isTimeUnknown} onChange={(event) => setIsTimeUnknown(event.target.checked)} />
            출생시각 모름
          </label>
          {errorMessage && (
            <div className="error-message" role="alert">
              <strong>오류:</strong> {errorMessage}
              <button type="button" className="text-button" onClick={returnToEditing}>다시 입력</button>
            </div>
          )}
          <button type="submit" className="primary-button">결과 보기</button>
        </form>
      </section>
    </main>
  )
}
