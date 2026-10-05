/**
 * Minute-of-day arithmetic shared by the theme watcher, the reminder engine,
 * and the settings surface. Every function takes and returns plain numbers, so
 * the whole module is testable without a clock, a DOM, or a locale.
 * @module
 */

/** Minutes in one day. */
export const DAY_MINUTES = 24 * 60

/** Seconds in one day. */
export const DAY_SECONDS = 24 * 60 * 60

/** One minute in milliseconds. */
export const MINUTE_MS = 60 * 1000

/** One day in milliseconds. */
export const DAY_MS = DAY_SECONDS * 1000

/** A local wall-clock time of day, as seconds since local midnight. */
export type SecondsOfDay = number

/**
 * Clamp any integer minute-of-day into `[0, DAY_MINUTES)`.
 * @param minute - Possibly out-of-range minute value.
 * @returns The same minute wrapped into one day.
 */
export function wrapMinute(minute: number): number {
  const normalized = Math.trunc(minute)
  if (!Number.isFinite(normalized)) return 0
  return ((normalized % DAY_MINUTES) + DAY_MINUTES) % DAY_MINUTES
}

/**
 * Clamp any second-of-day into `[0, DAY_SECONDS)`.
 * @param second - Possibly out-of-range second value.
 * @returns The same second wrapped into one day.
 */
export function wrapSecond(second: number): SecondsOfDay {
  const normalized = Math.trunc(second)
  if (!Number.isFinite(normalized)) return 0
  return ((normalized % DAY_SECONDS) + DAY_SECONDS) % DAY_SECONDS
}

/**
 * Parse `HH:mm` (optionally `HH:mm:ss`) into seconds of day.
 * Out-of-range or malformed input returns `undefined` so callers choose the
 * fallback instead of silently receiving midnight.
 * @param text - Candidate time string.
 * @returns Seconds of day, or `undefined` when the text is not a valid time.
 */
export function parseClock(text: string): SecondsOfDay | undefined {
  const match = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(text.trim())
  if (match === null) return undefined
  const hour = Number(match[1])
  const minute = Number(match[2])
  const second = match[3] === undefined ? 0 : Number(match[3])
  if (hour > 23 || minute > 59 || second > 59) return undefined
  return hour * 3600 + minute * 60 + second
}

/**
 * Parse `HH:mm` into seconds of day, dropping any seconds component.
 * @param text - Candidate time string.
 * @returns Seconds of day on a minute boundary, or `undefined`.
 */
export function parseMinuteClock(text: string): SecondsOfDay | undefined {
  const parsed = parseClock(text)
  if (parsed === undefined) return undefined
  return parsed - (parsed % 60)
}

/**
 * Format seconds of day as `HH:mm`, wrapping out-of-range input and dropping
 * any seconds component.
 * @param second - Seconds of day.
 * @returns Zero-padded 24-hour `HH:mm`.
 */
export function secondToHhMm(second: number): string {
  const value = wrapSecond(second)
  const hour = Math.floor(value / 3600)
  const minute = Math.floor((value % 3600) / 60)
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

/**
 * Format seconds of day as a localized 12-hour or 24-hour clock string.
 * @param second - Seconds of day.
 * @param hour12 - Whether to render `h:mm AM/PM` instead of `HH:mm`.
 * @returns Display text for the reminder card and the settings summary.
 */
export function formatClock(second: number, hour12: boolean): string {
  const value = wrapSecond(second)
  const hour = Math.floor(value / 3600)
  const minute = Math.floor((value % 3600) / 60)
  if (!hour12) return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
  const suffix = hour < 12 ? 'AM' : 'PM'
  const display = hour % 12 === 0 ? 12 : hour % 12
  return `${display}:${String(minute).padStart(2, '0')} ${suffix}`
}

/**
 * Local second of day for an absolute instant.
 * @param nowMs - Epoch milliseconds.
 * @returns Seconds since the local day's midnight.
 */
export function secondOfDay(nowMs: number): SecondsOfDay {
  const date = new Date(nowMs)
  return date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds()
}

/**
 * Local minute of day for an absolute instant.
 * @param nowMs - Epoch milliseconds.
 * @returns Minutes since the local day's midnight.
 */
export function minuteOfDay(nowMs: number): number {
  const date = new Date(nowMs)
  return date.getHours() * 60 + date.getMinutes()
}

/**
 * Stable per-local-day key, used to fire a reminder at most once a day.
 * @param nowMs - Epoch milliseconds.
 * @returns `YYYY-MM-DD` in the local calendar.
 */
export function localDayKey(nowMs: number): string {
  const date = new Date(nowMs)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${String(date.getFullYear()).padStart(4, '0')}-${month}-${day}`
}

/**
 * Whether a local instant falls inside a half-open window that may cross
 * midnight.
 * @param second - Second of day to test.
 * @param startSecond - Window start (inclusive).
 * @param endSecond - Window end (exclusive).
 * @returns True when `second` is inside `[start, end)`, wrapping at midnight.
 */
export function inWindow(second: SecondsOfDay, startSecond: number, endSecond: number): boolean {
  const at = wrapSecond(second)
  const start = wrapSecond(startSecond)
  const end = wrapSecond(endSecond)
  if (start === end) return false
  if (start < end) return at >= start && at < end
  return at >= start || at < end
}

/**
 * Duration in seconds from one time of day forward to the next occurrence of
 * another, never returning 0 for distinct times.
 * @param fromSecond - Starting time of day.
 * @param toSecond - Target time of day.
 * @returns Seconds forward, in `(0, DAY_SECONDS]`.
 */
export function secondsUntil(fromSecond: SecondsOfDay, toSecond: SecondsOfDay): number {
  const from = wrapSecond(fromSecond)
  const to = wrapSecond(toSecond)
  const delta = to - from
  return delta > 0 ? delta : delta + DAY_SECONDS
}

/**
 * Absolute instant of the next occurrence of a time of day, strictly after
 * `nowMs`.
 * @param nowMs - Epoch milliseconds.
 * @param targetSecond - Target time of day.
 * @returns Epoch milliseconds of the next occurrence.
 */
export function nextOccurrenceMs(nowMs: number, targetSecond: number): number {
  const deltaSeconds = secondsUntil(secondOfDay(nowMs), targetSecond)
  return nowMs + deltaSeconds * 1000
}

/**
 * Elapsed whole minutes of a duration, for coarse "in 2 h 05 min" copy.
 * @param milliseconds - Non-negative duration.
 * @returns Whole minutes, clamped at zero.
 */
export function wholeMinutes(milliseconds: number): number {
  if (!Number.isFinite(milliseconds) || milliseconds <= 0) return 0
  return Math.floor(milliseconds / MINUTE_MS)
}

/**
 * Render a duration as compact localized copy (Chinese and English forms).
 * @param milliseconds - Non-negative duration.
 * @param zh - Whether to render Chinese copy.
 * @returns Copy such as `2 小时 5 分钟后` or `in 2 h 05 min`.
 */
export function humanizeDuration(milliseconds: number, zh: boolean): string {
  const totalMinutes = wholeMinutes(milliseconds)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (zh) {
    if (hours === 0) return `${String(Math.max(minutes, 1))} 分钟后`
    if (minutes === 0) return `${String(hours)} 小时后`
    return `${String(hours)} 小时 ${String(minutes)} 分钟后`
  }
  if (hours === 0) return `in ${String(Math.max(minutes, 1))} min`
  const padded = String(minutes).padStart(2, '0')
  return `in ${String(hours)} h ${padded} min`
}
