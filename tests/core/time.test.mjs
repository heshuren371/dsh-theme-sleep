/**
 * Unit tests for the pure period arithmetic. Every case pins a local calendar
 * instant (`new Date(y, m, d, h, mi)`) so the expectations hold in any time
 * zone the test machine runs in.
 */
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  DAY_SECONDS, formatClock, humanizeDuration, inWindow, localDayKey, nextOccurrenceMs,
  parseClock, parseMinuteClock, secondOfDay, secondToHhMm, secondsUntil, wholeMinutes, wrapSecond,
} from '../../lib/core/time.js'
import {
  expectedTheme, expectedThemeAt, isAlternating, nextBoundary, periodAt, themePhase,
} from '../../lib/core/theme.js'

/** Epoch milliseconds for a local wall-clock instant. */
function local(year, month, day, hour, minute, second = 0) {
  return new Date(year, month - 1, day, hour, minute, second, 0).getTime()
}

const RULE = { dayStart: 6 * 3600, dayEnd: 19 * 3600 }

describe('time helpers', () => {
  it('parses HH:mm and HH:mm:ss, rejecting out-of-range text', () => {
    assert.equal(parseClock('06:00'), 6 * 3600)
    assert.equal(parseClock('6:05'), 6 * 3600 + 300)
    assert.equal(parseClock('23:59:59'), 23 * 3600 + 59 * 60 + 59)
    assert.equal(parseClock(' 19:00 '), 19 * 3600)
    assert.equal(parseMinuteClock('06:00:45'), 6 * 3600)
    assert.equal(parseClock('24:00'), undefined)
    assert.equal(parseClock('19:60'), undefined)
    assert.equal(parseClock('nineteen'), undefined)
    assert.equal(parseClock(''), undefined)
    assert.equal(parseClock('1:2'), undefined)
  })

  it('formats seconds of day, dropping seconds and wrapping', () => {
    assert.equal(secondToHhMm(6 * 3600), '06:00')
    assert.equal(secondToHhMm(19 * 3600 + 59 * 60 + 59), '19:59')
    assert.equal(secondToHhMm(DAY_SECONDS + 60), '00:01')
    assert.equal(secondToHhMm(-60), '23:59')
    assert.equal(formatClock(13 * 3600 + 5 * 60, false), '13:05')
    assert.equal(formatClock(0, true), '12:00 AM')
    assert.equal(formatClock(13 * 3600 + 5 * 60, true), '1:05 PM')
    assert.equal(wrapSecond(DAY_SECONDS * 3 + 7), 7)
  })

  it('reads the local second of day and day key', () => {
    const at = local(2026, 10, 3, 23, 30, 15)
    assert.equal(secondOfDay(at), 23 * 3600 + 30 * 60 + 15)
    assert.equal(localDayKey(at), '2026-10-03')
    assert.equal(localDayKey(local(2026, 1, 9, 0, 0)), '2026-01-09')
  })

  it('treats windows as half-open and wraps them across midnight', () => {
    assert.equal(inWindow(6 * 3600, 6 * 3600, 19 * 3600), true)
    assert.equal(inWindow(19 * 3600 - 1, 6 * 3600, 19 * 3600), true)
    assert.equal(inWindow(19 * 3600, 6 * 3600, 19 * 3600), false)
    assert.equal(inWindow(5 * 3600 + 3599, 6 * 3600, 19 * 3600), false)
    assert.equal(inWindow(23 * 3600, 19 * 3600, 6 * 3600), true)
    assert.equal(inWindow(2 * 3600, 19 * 3600, 6 * 3600), true)
    assert.equal(inWindow(12 * 3600, 19 * 3600, 6 * 3600), false)
    assert.equal(inWindow(12 * 3600, 6 * 3600, 6 * 3600), false)
  })

  it('measures forward durations in (0, 24h]', () => {
    assert.equal(secondsUntil(6 * 3600, 19 * 3600), 13 * 3600)
    assert.equal(secondsUntil(19 * 3600, 6 * 3600), 11 * 3600)
    assert.equal(secondsUntil(0, 0), DAY_SECONDS)
    assert.equal(secondsUntil(23 * 3600, 6 * 3600), 7 * 3600)
  })

  it('finds the next occurrence strictly after an instant', () => {
    const at = local(2026, 10, 3, 18, 59, 59)
    assert.equal(nextOccurrenceMs(at, 19 * 3600), local(2026, 10, 3, 19, 0, 0))
    // Exactly at the target rolls a whole day forward, never to "now".
    assert.equal(nextOccurrenceMs(local(2026, 10, 3, 19, 0, 0), 19 * 3600), local(2026, 10, 4, 19, 0, 0))
    // A DST-free zone keeps this exact; under a DST transition the wall-clock
    // target shifts by the offset, so only the local hour is asserted.
    assert.equal(secondOfDay(nextOccurrenceMs(at, 6 * 3600)), 6 * 3600)
  })

  it('humanizes durations', () => {
    assert.equal(wholeMinutes(-5), 0)
    assert.equal(wholeMinutes(119_000), 1)
    assert.equal(humanizeDuration(0, true), '1 分钟后')
    assert.equal(humanizeDuration(2 * 3600_000, true), '2 小时后')
    assert.equal(humanizeDuration(2 * 3600_000 + 5 * 60_000, true), '2 小时 5 分钟后')
    assert.equal(humanizeDuration(2 * 3600_000 + 5 * 60_000, false), 'in 2 h 05 min')
    assert.equal(humanizeDuration(60_000, false), 'in 1 min')
  })
})

describe('theme rule', () => {
  it('is light inside [dayStart, dayEnd) and dark otherwise', () => {
    assert.equal(periodAt(12 * 3600, RULE), 'day')
    assert.equal(expectedThemeAt(12 * 3600, RULE), 'light')
    assert.equal(expectedThemeAt(6 * 3600, RULE), 'light')
    assert.equal(expectedThemeAt(18 * 3600 + 3599, RULE), 'light')
    assert.equal(expectedThemeAt(19 * 3600, RULE), 'dark')
    assert.equal(expectedThemeAt(23 * 3600, RULE), 'dark')
    assert.equal(expectedThemeAt(0, RULE), 'dark')
    assert.equal(expectedThemeAt(5 * 3600 + 3599, RULE), 'dark')
  })

  it('resolves the expected theme from an absolute instant', () => {
    assert.equal(expectedTheme(local(2026, 10, 3, 12, 0), RULE), 'light')
    assert.equal(expectedTheme(local(2026, 10, 3, 22, 0), RULE), 'dark')
  })

  it('reports the next boundary as a light or dark handover', () => {
    const noon = local(2026, 10, 3, 12, 0)
    const toDark = nextBoundary(noon, RULE)
    assert.equal(toDark.theme, 'dark')
    assert.equal(toDark.at, local(2026, 10, 3, 19, 0, 0))
    assert.equal(toDark.atSecond, 19 * 3600)

    const late = local(2026, 10, 3, 22, 0)
    const toLight = nextBoundary(late, RULE)
    assert.equal(toLight.theme, 'light')
    assert.equal(toLight.at, local(2026, 10, 4, 6, 0, 0))
    assert.equal(toLight.atSecond, 6 * 3600)
  })

  it('brackets every minute of the day with a boundary no further than a day', () => {
    for (let second = 0; second < DAY_SECONDS; second += 97) {
      const at = local(2026, 10, 3, Math.floor(second / 3600), Math.floor((second % 3600) / 60), second % 60)
      const phase = themePhase(at, RULE)
      assert.ok(phase.remainingMs > 0, `remaining must be positive at ${String(second)}`)
      assert.ok(phase.remainingMs <= DAY_SECONDS * 1000, `remaining must be within a day at ${String(second)}`)
      assert.equal(phase.theme, expectedThemeAt(second, RULE))
      assert.equal(phase.boundary.theme === 'light' ? 'night' : 'day', phase.period)
      assert.equal(phase.boundary.at, at + phase.remainingMs)
    }
  })

  it('honours an inverted rule and reports a degenerate one', () => {
    const inverted = { dayStart: 20 * 3600, dayEnd: 4 * 3600 }
    assert.equal(expectedThemeAt(22 * 3600, inverted), 'light')
    assert.equal(expectedThemeAt(2 * 3600, inverted), 'light')
    assert.equal(expectedThemeAt(12 * 3600, inverted), 'dark')
    assert.equal(isAlternating(inverted), true)
    assert.equal(isAlternating({ dayStart: 3600, dayEnd: 3600 }), false)
    assert.equal(expectedThemeAt(12 * 3600, { dayStart: 3600, dayEnd: 3600 }), 'dark')
  })
})
