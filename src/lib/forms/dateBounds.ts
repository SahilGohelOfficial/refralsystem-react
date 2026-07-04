import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import type { FieldValidation } from '../../types/form'
import { todayUtcDateString } from '../dates'

dayjs.extend(utc)
dayjs.extend(customParseFormat)

const ISO_DATE_FORMAT = 'YYYY-MM-DD'
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

function parseIsoDayjs(value: string): dayjs.Dayjs | null {
  if (!ISO_DATE_PATTERN.test(value)) return null
  const parsed = dayjs.utc(value, ISO_DATE_FORMAT, true)
  return parsed.isValid() ? parsed : null
}

export function formatLocalDate(date: Date): string {
  return dayjs.utc(date).format(ISO_DATE_FORMAT)
}

export function isValidIsoDateString(value: string): boolean {
  return parseIsoDayjs(value) !== null
}

function laterDate(a: string, b: string): string {
  return dayjs.utc(a).isAfter(dayjs.utc(b)) ? a : b
}

function earlierDate(a: string, b: string): string {
  return dayjs.utc(a).isBefore(dayjs.utc(b)) ? a : b
}

export function getEffectiveDateBounds(
  validation?: FieldValidation,
  today = todayUtcDateString(),
): { min?: string; max?: string } {
  let min = validation?.minDate
  let max = validation?.maxDate

  if (validation?.onlyFuture) {
    min = min ? laterDate(min, today) : today
  }

  if (validation?.onlyPast) {
    max = max ? earlierDate(max, today) : today
  }

  return { min, max }
}

export function validateDateValue(
  value: string,
  validation?: FieldValidation,
  errorMessage?: string,
  today = todayUtcDateString(),
): string | undefined {
  if (validation?.onlyFuture && validation?.onlyPast) {
    return 'Invalid date field configuration.'
  }

  if (!isValidIsoDateString(value)) {
    return errorMessage ?? 'Invalid date format.'
  }

  const { min, max } = getEffectiveDateBounds(validation, today)

  if (min && dayjs.utc(value).isBefore(dayjs.utc(min), 'day')) {
    return errorMessage ?? `Date must be on or after ${min}.`
  }

  if (max && dayjs.utc(value).isAfter(dayjs.utc(max), 'day')) {
    return errorMessage ?? `Date must be on or before ${max}.`
  }

  return undefined
}
