import { APP_LOCALE } from '@/config/constants'

const EMPTY = '—'

const numberFormatter = new Intl.NumberFormat(APP_LOCALE)
const percentFormatter = new Intl.NumberFormat(APP_LOCALE, { style: 'percent', maximumFractionDigits: 0 })
const dateFormatter = new Intl.DateTimeFormat(APP_LOCALE, { day: 'numeric', month: 'short', year: 'numeric' })
const dateTimeFormatter = new Intl.DateTimeFormat(APP_LOCALE, {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

export const formatNumber = (value: number | null | undefined) => (value == null ? EMPTY : numberFormatter.format(value))

export const formatPercent = (ratio: number) => percentFormatter.format(ratio)

/** Backend mengirim DATE "2026-10-19" & TIMESTAMP "2026-10-19 08:00:00" (tanpa zona waktu). */
const parseDate = (value: string) => new Date(value.includes(' ') ? value.replace(' ', 'T') : `${value}T00:00:00`)

export const formatDate = (value: string | null | undefined) => (value ? dateFormatter.format(parseDate(value)) : EMPTY)

export const formatDateTime = (value: string | null | undefined) =>
  value ? dateTimeFormatter.format(parseDate(value)) : EMPTY

export const formatText = (value: string | null | undefined) => (value ? value : EMPTY)
