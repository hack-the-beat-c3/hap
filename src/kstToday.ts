import type { TodayDate } from './saju/engine'

const kstDateFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
})

export function getTodayInKST(): TodayDate {
  const parts = kstDateFormatter.formatToParts(new Date())
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value)

  return { year: value('year'), month: value('month'), day: value('day') }
}
