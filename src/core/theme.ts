/**
 * The automatic light/dark rule: pure period arithmetic for "6:00–19:00 light,
 * 19:00–06:00 dark", with the boundary math needed to schedule the next check.
 * @module
 */

import type { ThemeId } from './types.ts'
import { inWindow, nextOccurrenceMs, secondOfDay, wrapSecond } from './time.ts'

/** The light/dark rule, resolved from Config into seconds of day. */
export interface ThemeRule {
  /** First second of the light window, inclusive. */
  readonly dayStart: number
  /** First second of the dark window, i.e. the light window's exclusive end. */
  readonly dayEnd: number
}

/** One resolved transition: the theme that takes over and when. */
export interface ThemeBoundary {
  /** Theme the rule expects at and after the boundary. */
  readonly theme: ThemeId
  /** Epoch milliseconds of the next boundary. */
  readonly at: number
  /** Second of day the boundary sits at. */
  readonly atSecond: number
}

/** Which side of the rule a moment falls on. */
export type Period = 'day' | 'night'

/**
 * The period a local second of day belongs to.
 * `day` is the light window `[dayStart, dayEnd)`; every other second is `night`.
 * Equal bounds describe an always-dark rule, because the light window is a
 * half-open range of zero width.
 * @param second - Second of local day.
 * @param rule - Resolved period bounds.
 * @returns The period name.
 */
export function periodAt(second: number, rule: ThemeRule): Period {
  return inWindow(second, rule.dayStart, rule.dayEnd) ? 'day' : 'night'
}

/**
 * The theme the rule expects at a local second of day.
 * @param second - Second of local day.
 * @param rule - Resolved period bounds.
 * @returns `light` inside the day window, `dark` otherwise.
 */
export function expectedThemeAt(second: number, rule: ThemeRule): ThemeId {
  return periodAt(second, rule) === 'day' ? 'light' : 'dark'
}

/**
 * The theme the rule expects at an absolute instant.
 * @param nowMs - Epoch milliseconds.
 * @param rule - Resolved period bounds.
 * @returns The expected theme.
 */
export function expectedTheme(nowMs: number, rule: ThemeRule): ThemeId {
  return expectedThemeAt(secondOfDay(nowMs), rule)
}

/**
 * The theme that takes over at a boundary, and the next boundary after `nowMs`.
 * Both bounds are always transitions when they differ: the light window ends at
 * `dayEnd` and begins again at `dayStart`. Equal bounds leave the rule constant,
 * so the function reports the dark handover one day out and the caller's
 * period-override bookkeeping stays stable.
 * @param nowMs - Epoch milliseconds.
 * @param rule - Resolved period bounds.
 * @returns Boundary theme, instant, and local second.
 */
export function nextBoundary(nowMs: number, rule: ThemeRule): ThemeBoundary {
  const start = wrapSecond(rule.dayStart)
  const end = wrapSecond(rule.dayEnd)
  if (start === end) {
    return { theme: 'dark', at: nextOccurrenceMs(nowMs, end), atSecond: end }
  }
  const atStart = nextOccurrenceMs(nowMs, start)
  const atEnd = nextOccurrenceMs(nowMs, end)
  if (atStart <= atEnd) {
    // The light window opens: `dayStart` is a day boundary.
    return { theme: 'light', at: atStart, atSecond: start }
  }
  // The light window closes: `dayEnd` is a night boundary.
  return { theme: 'dark', at: atEnd, atSecond: end }
}

/** The resolved rule plus the expected theme and next boundary at one instant. */
export interface ThemePhase {
  /** Which side of the rule `nowMs` falls on. */
  readonly period: Period
  /** Theme the rule expects now. */
  readonly theme: ThemeId
  /** Next transition of the rule. */
  readonly boundary: ThemeBoundary
  /** Milliseconds from `nowMs` to {@link boundary}. */
  readonly remainingMs: number
}

/**
 * Resolve the whole phase in one call, so every surface agrees on the instant
 * it was computed for.
 * @param nowMs - Epoch milliseconds.
 * @param rule - Resolved period bounds.
 * @returns Period, expected theme, next boundary, and time to it.
 */
export function themePhase(nowMs: number, rule: ThemeRule): ThemePhase {
  const period = periodAt(secondOfDay(nowMs), rule)
  const boundary = nextBoundary(nowMs, rule)
  return {
    period,
    theme: period === 'day' ? 'light' : 'dark',
    boundary,
    remainingMs: Math.max(0, boundary.at - nowMs),
  }
}

/**
 * Whether a rule covers the whole day with alternating periods, i.e. its bounds
 * differ. Used by the settings surface to explain a degenerate configuration.
 * @param rule - Resolved period bounds.
 * @returns True when the two bounds differ.
 */
export function isAlternating(rule: ThemeRule): boolean {
  return wrapSecond(rule.dayStart) !== wrapSecond(rule.dayEnd)
}
