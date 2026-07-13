import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'

dayjs.extend(utc)
dayjs.extend(customParseFormat)
dayjs.extend(isSameOrBefore)

const ISO_DATE_FORMAT = 'YYYY-MM-DD'
const DATE_DISPLAY: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
}
const DATETIME_DISPLAY: Intl.DateTimeFormatOptions = {
  ...DATE_DISPLAY,
  hour: '2-digit',
  minute: '2-digit',
}

/** UTC calendar date string for API date inputs (matches server validation). */
export function todayUtcDateString(): string {
  return dayjs.utc().format(ISO_DATE_FORMAT)
}

export function toDateInputValue(value: string | null | undefined): string {
  if (!value) return ''
  const datePart = value.slice(0, 10)
  return /^\d{4}-\d{2}-\d{2}$/.test(datePart) ? datePart : ''
}

export function isPastOrTodayUtc(value: string): boolean {
  const parsed = dayjs.utc(value, ISO_DATE_FORMAT, true)
  if (!parsed.isValid()) return false
  return parsed.isSameOrBefore(dayjs.utc(), 'day')
}

/** UTC calendar date string for N years before today (e.g. max DOB for age gates). */
export function yearsAgoUtcDateString(years: number): string {
  return dayjs.utc().subtract(years, 'year').format(ISO_DATE_FORMAT)
}

/** True when dateOfBirth is on or before (today − minAge years), day-precision UTC. */
export function isAtLeastAgeUtc(dateOfBirth: string, minAge = 18): boolean {
  const parsed = dayjs.utc(dateOfBirth, ISO_DATE_FORMAT, true)
  if (!parsed.isValid()) return false
  return parsed.isSameOrBefore(dayjs.utc().subtract(minAge, 'year'), 'day')
}

/** Display an API timestamp in the user's local timezone. */
export function formatLocalDateTime(iso?: string | null): string {
  if (!iso) return '—'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleString(undefined, DATETIME_DISPLAY)
}

/** Display a calendar date (YYYY-MM-DD) without timezone shift. */
export function formatCalendarDate(iso?: string | null): string {
  if (!iso) return '—'
  const datePart = iso.slice(0, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
    return formatLocalDate(iso)
  }
  const [year, month, day] = datePart.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString(undefined, DATE_DISPLAY)
}

/** Display the local date portion of an API timestamp. */
export function formatLocalDate(iso?: string | null): string {
  if (!iso) return '—'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleDateString(undefined, DATE_DISPLAY)
}
