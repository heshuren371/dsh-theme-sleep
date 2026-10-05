/**
 * Unit tests for the bedtime-reminder state machine. The engine takes its clock
 * from the test, so every case is an explicit local instant.
 */
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  REMINDER_POLL_MS, ReminderEngine, clampDelay, clampSnoozeMinutes, secondsFromReminderTime,
  startOfLocalDayMs,
} from '../../lib/core/reminder.js'
import { DEFAULT_SETTINGS } from '../../lib/core/types.js'

/** Epoch milliseconds for a local wall-clock instant. */
function local(year, month, day, hour, minute, second = 0) {
  return new Date(year, month - 1, day, hour, minute, second, 0).getTime()
}

const SETTINGS = {
  reminderEnabled: true,
  reminderTime: '23:30',
  snoozeMinutes: 10,
}

/** A clock the test moves by hand. */
function clockAt(start) {
  let current = start
  return {
    clock: { now: () => current },
    set(at) { current = at },
  }
}

describe('secondsFromReminderTime', () => {
  it('parses valid times and falls back to 23:30', () => {
    assert.equal(secondsFromReminderTime('23:30'), 23 * 3600 + 30 * 60)
    assert.equal(secondsFromReminderTime('00:00'), 0)
    assert.equal(secondsFromReminderTime(' 07:05 '), 7 * 3600 + 5 * 60)
    assert.equal(secondsFromReminderTime('24:00'), 23 * 3600 + 30 * 60)
    assert.equal(secondsFromReminderTime('bogus'), 23 * 3600 + 30 * 60)
  })
})

describe('ReminderEngine', () => {
  it('fires once when the watch crosses the reminder time', () => {
    const start = local(2026, 10, 3, 23, 0)
    const { clock } = clockAt(start)
    const engine = new ReminderEngine(clock, start)

    assert.equal(engine.tick(SETTINGS, local(2026, 10, 3, 23, 29, 59)).mode, 'idle')
    const fired = engine.tick(SETTINGS, local(2026, 10, 3, 23, 30, 0))
    assert.equal(fired.mode, 'active')
    assert.equal(fired.dayKey, '2026-10-03')
    assert.equal(fired.firedAt, local(2026, 10, 3, 23, 30, 0))
    // Still showing a minute later, and it does not re-announce.
    assert.equal(engine.tick(SETTINGS, local(2026, 10, 3, 23, 31)).mode, 'active')
  })

  it('does not retro-fire an occurrence that predates the watch', () => {
    const startedAt = local(2026, 10, 3, 23, 45)
    const { clock } = clockAt(startedAt)
    const engine = new ReminderEngine(clock, startedAt)
    // The page opened at 23:45: today's 23:30 sits behind the watch.
    assert.equal(engine.tick(SETTINGS, startedAt).mode, 'idle')
    assert.equal(engine.firedDay(), undefined)
    assert.equal(engine.tick(SETTINGS, local(2026, 10, 3, 23, 59)).mode, 'idle')
    assert.equal(engine.tick(SETTINGS, local(2026, 10, 4, 0, 30)).mode, 'idle')
    // The next day's occurrence is the first one this watch can reach.
    assert.equal(engine.tick(SETTINGS, local(2026, 10, 4, 23, 30)).mode, 'active')
    assert.equal(engine.firedDay(), '2026-10-04')
  })

  it('fires again the next local day', () => {
    const start = local(2026, 10, 3, 23, 0)
    const { clock } = clockAt(start)
    const engine = new ReminderEngine(clock, start)
    assert.equal(engine.tick(SETTINGS, local(2026, 10, 3, 23, 30)).mode, 'active')
    engine.dismiss(local(2026, 10, 3, 23, 31))
    assert.equal(engine.tick(SETTINGS, local(2026, 10, 3, 23, 59)).mode, 'idle')
    assert.equal(engine.tick(SETTINGS, local(2026, 10, 4, 23, 30)).mode, 'active')
    assert.equal(engine.firedDay(), '2026-10-04')
  })

  it('keeps the card up until the user answers, then stays quiet for the day', () => {
    const start = local(2026, 10, 3, 23, 0)
    const { clock } = clockAt(start)
    const engine = new ReminderEngine(clock, start)
    assert.equal(engine.tick(SETTINGS, local(2026, 10, 3, 23, 30)).mode, 'active')
    assert.equal(engine.dismiss(local(2026, 10, 3, 23, 30, 30)).mode, 'idle')
    assert.equal(engine.tick(SETTINGS, local(2026, 10, 3, 23, 40)).mode, 'idle')
  })

  it('snoozes and re-shows when the snooze expires', () => {
    const start = local(2026, 10, 3, 23, 0)
    const { clock } = clockAt(start)
    const engine = new ReminderEngine(clock, start)
    assert.equal(engine.tick(SETTINGS, local(2026, 10, 3, 23, 30)).mode, 'active')

    const snoozed = engine.snooze(SETTINGS, local(2026, 10, 3, 23, 30, 30))
    assert.equal(snoozed.mode, 'idle')
    assert.equal(snoozed.snoozeUntil, local(2026, 10, 3, 23, 40, 30))

    assert.equal(engine.tick(SETTINGS, local(2026, 10, 3, 23, 35)).mode, 'idle')
    assert.equal(engine.tick(SETTINGS, local(2026, 10, 3, 23, 40, 29)).mode, 'idle')
    const again = engine.tick(SETTINGS, local(2026, 10, 3, 23, 40, 30))
    assert.equal(again.mode, 'snoozed')
  })

  it('honours the configured snooze delay and clamps bad values', () => {
    const start = local(2026, 10, 3, 23, 0)
    const { clock } = clockAt(start)
    const engine = new ReminderEngine(clock, start)
    engine.tick(SETTINGS, local(2026, 10, 3, 23, 30))
    const snoozed = engine.snooze({ ...SETTINGS, snoozeMinutes: 45 }, local(2026, 10, 3, 23, 30))
    assert.equal(snoozed.snoozeUntil, local(2026, 10, 4, 0, 15))
    assert.equal(clampSnoozeMinutes(0), 1)
    assert.equal(clampSnoozeMinutes(999), 120)
    assert.equal(clampSnoozeMinutes(10.6), 11)
    assert.equal(clampSnoozeMinutes(Number.NaN), 1)
  })

  it('re-arms from scratch when the reminder is switched on', () => {
    const start = local(2026, 10, 3, 22, 0)
    const { clock, set } = clockAt(start)
    const engine = new ReminderEngine(clock, start)
    engine.setEnabled(false)
    // While disabled nothing shows, even past the reminder time.
    set(local(2026, 10, 3, 23, 35))
    assert.equal(engine.tick(SETTINGS, local(2026, 10, 3, 23, 35)).mode, 'idle')
    assert.equal(engine.firedDay(), undefined)
    // Re-enabling at 23:35 re-bases the watch; today's 23:30 is already behind
    // it, so the first fire is the next day's occurrence...
    engine.setEnabled(true)
    assert.equal(engine.tick(SETTINGS, local(2026, 10, 3, 23, 45)).mode, 'idle')
    assert.equal(engine.firedDay(), undefined)
    assert.equal(engine.tick(SETTINGS, local(2026, 10, 4, 23, 30)).mode, 'active')
    // ...unless the reminder is switched on before the occurrence arrives.
    const earlier = clockAt(local(2026, 10, 5, 22, 0))
    const second = new ReminderEngine(earlier.clock, local(2026, 10, 5, 22, 0))
    second.setEnabled(false)
    earlier.set(local(2026, 10, 5, 22, 30))
    second.setEnabled(true)
    assert.equal(second.tick(SETTINGS, local(2026, 10, 5, 23, 31)).mode, 'active')
  })

  it('stays quiet across a reload that already fired today', () => {
    const first = local(2026, 10, 3, 23, 0)
    const firstClock = clockAt(first)
    const firstEngine = new ReminderEngine(firstClock.clock, first)
    assert.equal(firstEngine.tick(SETTINGS, local(2026, 10, 3, 23, 30)).mode, 'active')
    const firedDay = firstEngine.firedDay()
    assert.equal(firedDay, '2026-10-03')

    // A fresh page, same day, after the occurrence: hydration must keep the card down.
    const reload = local(2026, 10, 3, 23, 40)
    const reloadClock = clockAt(reload)
    const reloaded = new ReminderEngine(reloadClock.clock, reload)
    reloaded.hydrate({ firedDay: firedDay ?? undefined, snoozeUntil: firstEngine.pendingSnoozeUntil() })
    assert.equal(reloaded.tick(SETTINGS, reload).mode, 'idle')
    assert.equal(reloaded.tick(SETTINGS, local(2026, 10, 4, 23, 30)).mode, 'active')
  })

  it('never fires while the reminder is disabled', () => {
    const start = local(2026, 10, 3, 23, 0)
    const { clock } = clockAt(start)
    const engine = new ReminderEngine(clock, start)
    // The engine starts armed; the settings gate alone must keep it quiet.
    assert.equal(engine.tick({ ...SETTINGS, reminderEnabled: false }, local(2026, 10, 3, 23, 30)).mode, 'idle')
    assert.equal(engine.firedDay(), undefined)
  })

  it('reports a bounded next-check delay', () => {
    const start = local(2026, 10, 3, 22, 0)
    const { clock } = clockAt(start)
    const engine = new ReminderEngine(clock, start)
    // The delay to the occurrence is capped by the polling interval, so a
    // suspended laptop or a rolled-back clock is noticed within a minute.
    assert.equal(REMINDER_POLL_MS, 60 * 1000)
    assert.equal(engine.msUntilNextCheck(SETTINGS, start), REMINDER_POLL_MS)
    assert.equal(engine.msUntilNextCheck(SETTINGS, local(2026, 10, 3, 23, 29)), REMINDER_POLL_MS)
    assert.equal(engine.msUntilNextCheck({ ...SETTINGS, reminderEnabled: false }, start), REMINDER_POLL_MS)
    assert.equal(engine.msUntilNextCheck(SETTINGS, local(2026, 10, 3, 23, 30)), 0)
    engine.tick(SETTINGS, local(2026, 10, 3, 23, 30))
    assert.equal(engine.msUntilNextCheck(SETTINGS, local(2026, 10, 3, 23, 31)), REMINDER_POLL_MS)
    assert.equal(clampDelay(-1), 0)
    assert.equal(clampDelay(Number.NaN), REMINDER_POLL_MS)
    assert.equal(clampDelay(10 * 60 * 1000), REMINDER_POLL_MS)
  })

  it('never reschedules at 0 ms while a passed snooze is on screen', () => {
    const start = local(2026, 10, 3, 23, 0)
    const { clock } = clockAt(start)
    const engine = new ReminderEngine(clock, start)
    assert.equal(engine.tick(SETTINGS, local(2026, 10, 3, 23, 30)).mode, 'active')
    engine.snooze(SETTINGS, local(2026, 10, 3, 23, 30, 30))
    // Before the deadline the delay counts down to it (capped by the poll value,
    // so it stays a positive number).
    const before = engine.msUntilNextCheck(SETTINGS, local(2026, 10, 3, 23, 39, 59))
    assert.ok(before > 0 && before <= REMINDER_POLL_MS, String(before))
    // At and after it the card is showing, so the next check is a poll, not 0.
    engine.tick(SETTINGS, local(2026, 10, 3, 23, 40, 30))
    assert.equal(engine.msUntilNextCheck(SETTINGS, local(2026, 10, 3, 23, 40, 30)), REMINDER_POLL_MS)
    assert.equal(engine.msUntilNextCheck(SETTINGS, local(2026, 10, 4, 0, 30)), REMINDER_POLL_MS)
  })

  it('ignores a snooze deadline left behind by a previous day', () => {
    const reload = local(2026, 10, 4, 14, 0)
    const { clock } = clockAt(reload)
    const engine = new ReminderEngine(clock, reload)
    engine.hydrate({ firedDay: '2026-10-03', snoozeUntil: local(2026, 10, 3, 23, 41) })
    // A phantom card would show here and also swallow the evening's reminder.
    assert.equal(engine.tick(SETTINGS, reload).mode, 'idle')
    assert.equal(engine.tick(SETTINGS, local(2026, 10, 4, 23, 31)).mode, 'active')
  })

  it('restores a snooze made earlier the same day', () => {
    const reload = local(2026, 10, 3, 23, 42)
    const { clock } = clockAt(reload)
    const engine = new ReminderEngine(clock, reload)
    engine.hydrate({ firedDay: '2026-10-03', snoozeUntil: local(2026, 10, 3, 23, 45) })
    assert.equal(engine.tick(SETTINGS, reload).mode, 'idle')
    assert.equal(engine.tick(SETTINGS, local(2026, 10, 3, 23, 45, 30)).mode, 'snoozed')
  })

  it('never schedules a 0 ms re-check for an occurrence behind the watch', () => {
    // The page opens at 23:40 with a 23:30 reminder: today is unspendable, so the
    // next check must be the poll interval, not an immediate tick loop.
    const startedAt = local(2026, 10, 3, 23, 40)
    const { clock } = clockAt(startedAt)
    const engine = new ReminderEngine(clock, startedAt)
    assert.equal(engine.tick(SETTINGS, startedAt).mode, 'idle')
    assert.equal(engine.msUntilNextCheck(SETTINGS, startedAt), REMINDER_POLL_MS)
    assert.equal(engine.msUntilNextCheck(SETTINGS, local(2026, 10, 3, 23, 59)), REMINDER_POLL_MS)
    assert.equal(engine.msUntilNextCheck(SETTINGS, local(2026, 10, 4, 0, 30)), REMINDER_POLL_MS)
  })

  it('computes the local day start and handles a midnight reminder', () => {
    assert.equal(startOfLocalDayMs(local(2026, 10, 3, 23, 30)), local(2026, 10, 3, 0, 0))
    const midnight = { reminderEnabled: true, reminderTime: '00:00', snoozeMinutes: 5 }
    const start = local(2026, 10, 3, 23, 0)
    const { clock } = clockAt(start)
    const engine = new ReminderEngine(clock, start)
    const fired = engine.tick(midnight, local(2026, 10, 4, 0, 0, 5))
    assert.equal(fired.mode, 'active')
    assert.equal(fired.dayKey, '2026-10-04')
  })
})
