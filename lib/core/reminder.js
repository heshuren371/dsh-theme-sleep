/**
 * Bedtime-reminder bookkeeping: pure state machine, no timers and no DOM.
 *
 * The Client driver calls {@link ReminderEngine.tick} on every watch tick; the
 * engine answers whether the card should be showing and when the next tick must
 * happen. Keeping the decisions here means the once-a-day rule, the snooze
 * overlay, and reload safety are unit-testable without a browser.
 * @module
 */
import { MAX_REMINDER_SECONDS, MAX_SNOOZE_MINUTES, MIN_SNOOZE_MINUTES, } from './types.js';
import { MINUTE_MS, localDayKey, wrapSecond } from './time.js';
/** The default clock: the real one. */
export const systemClock = { now: () => Date.now() };
/** Longest automatic re-check while the reminder is armed, in milliseconds. */
export const REMINDER_POLL_MS = 60 * 1000;
/**
 * Once-a-day bedtime reminder with snooze.
 *
 * Firing rule: while the reminder is enabled, the first tick at or after
 * `reminderTime` on a local day that has not fired yet shows the card. A page
 * reload does not re-fire a reminder that already fired that day (the day key
 * outlives the module), and a page that opens after the reminder time does not
 * retro-fire — the plugin tells the engine when it started watching.
 */
export class ReminderEngine {
    clock;
    lastFiredDay;
    snoozeUntil;
    /** Card is dismissed/acknowledged for the current occurrence. */
    acknowledged = false;
    /**
     * Whether a reminder is currently eligible to be shown. The engine starts
     * armed so the first `setEnabled(false)` is a real transition; the Client
     * feeds it the live setting on every tick anyway.
     */
    armed = true;
    /** Startup instant; an occurrence before it never retro-fires. */
    watcherStartMs;
    /**
     * @param clock - Clock used for every decision; defaults to `Date.now`.
     * @param startMs - Instant the watcher started; defaults to the clock's now.
     */
    constructor(clock = systemClock, startMs) {
        this.clock = clock;
        this.watcherStartMs = startMs ?? clock.now();
    }
    /**
     * Re-arm the engine for a new settings snapshot.
     *
     * Disabling the reminder clears any pending snooze, closes the card, and ends
     * the watch; enabling it starts a fresh watch from now, so an occurrence that
     * passed while the feature was off is never replayed. Calling it while
     * already armed (the Client does that on every tick) changes nothing.
     * @param enabled - Whether the reminder is armed.
     */
    setEnabled(enabled) {
        if (enabled === this.armed)
            return;
        this.armed = enabled;
        if (enabled) {
            this.snoozeUntil = undefined;
            this.acknowledged = false;
            this.watcherStartMs = this.clock.now();
        }
        else {
            // A disabled reminder keeps no watch: re-arming later is a new watch.
            this.watcherStartMs = Number.POSITIVE_INFINITY;
        }
    }
    /**
     * Restore the durable part of the engine's state after a page reload.
     *
     * Only the day already fired survives a reload: a reminder the user answered
     * (or never answered) on one page must not fire again when the page is
     * refreshed that evening. An expired snooze deadline is restored too, so the
     * card comes back after a reload that happened while snoozing.
     * @param state - Restored fields; absent fields are left untouched.
     */
    hydrate(state) {
        if (state.firedDay !== undefined)
            this.lastFiredDay = state.firedDay;
        // A snooze only survives a reload inside the local day it was made: a value
        // left behind by a previous day would otherwise resurrect a phantom card on
        // every later load and suppress that evening's real reminder.
        if (state.snoozeUntil !== undefined && localDayKey(state.snoozeUntil) === localDayKey(this.clock.now())) {
            this.snoozeUntil = state.snoozeUntil;
            this.acknowledged = false;
        }
    }
    /**
     * Re-base the watcher start. The Client calls this after the settings scope
     * first resolves, because an occurrence before that point was not watched.
     * @param startMs - Instant the current watch began.
     */
    setWatcherStart(startMs) {
        this.watcherStartMs = startMs;
    }
    /**
     * The occurrence instant for one local day.
     * @param nowMs - Instant inside that local day.
     * @param settings - Reminder settings.
     * @returns Epoch milliseconds of that day's occurrence.
     */
    occurrenceFor(nowMs, settings) {
        const target = wrapSecond(secondsFromReminderTime(settings.reminderTime));
        const startOfDay = startOfLocalDayMs(nowMs);
        return startOfDay + target * 1000;
    }
    /**
     * Advance the engine to `nowMs` and report what to display.
     * @param settings - Live reminder settings.
     * @param nowMs - Current epoch milliseconds.
     * @returns The reminder decision for this instant.
     */
    tick(settings, nowMs = this.clock.now()) {
        const dayKey = localDayKey(nowMs);
        if (!settings.reminderEnabled) {
            return { mode: 'idle', dayKey };
        }
        if (this.snoozeUntil !== undefined) {
            if (nowMs >= this.snoozeUntil) {
                return { mode: this.acknowledged ? 'idle' : 'snoozed', dayKey, firedAt: this.snoozeUntil, snoozeUntil: this.snoozeUntil };
            }
            return { mode: 'idle', dayKey, snoozeUntil: this.snoozeUntil };
        }
        const occurrence = this.occurrenceFor(nowMs, settings);
        const due = nowMs >= occurrence && occurrence >= this.watcherStartMs;
        if (!due)
            return { mode: 'idle', dayKey };
        if (this.lastFiredDay === dayKey) {
            return { mode: this.acknowledged ? 'idle' : 'active', dayKey, firedAt: occurrence };
        }
        this.lastFiredDay = dayKey;
        this.acknowledged = false;
        return { mode: 'active', dayKey, firedAt: occurrence };
    }
    /**
     * Snooze the current occurrence.
     * @param settings - Live reminder settings; the snooze delay comes from it.
     * @param nowMs - Current epoch milliseconds.
     * @returns The engine state after the snooze.
     */
    snooze(settings, nowMs = this.clock.now()) {
        const minutes = clampSnoozeMinutes(settings.snoozeMinutes);
        this.snoozeUntil = nowMs + minutes * MINUTE_MS;
        this.acknowledged = false;
        return { mode: 'idle', dayKey: localDayKey(nowMs), snoozeUntil: this.snoozeUntil };
    }
    /**
     * Acknowledge the current occurrence; the card closes and does not return
     * until the next local day.
     * @param nowMs - Current epoch milliseconds.
     * @returns The idle state.
     */
    dismiss(nowMs = this.clock.now()) {
        this.snoozeUntil = undefined;
        this.acknowledged = true;
        return { mode: 'idle', dayKey: localDayKey(nowMs) };
    }
    /** @returns The instant the current snooze expires, if one is pending. */
    pendingSnoozeUntil() {
        return this.snoozeUntil;
    }
    /** @returns The local day already fired, if any. */
    firedDay() {
        return this.lastFiredDay;
    }
    /**
     * Milliseconds until the engine needs another look.
     *
     * While idle it is the remaining time to the next occurrence, capped so a
     * suspended laptop or a changed system clock is noticed within a minute;
     * while the card shows it is the polling interval, because the user's answer
     * (not the clock) advances it.
     * @param settings - Live reminder settings.
     * @param nowMs - Current epoch milliseconds.
     * @returns A positive delay no longer than {@link REMINDER_POLL_MS}.
     */
    msUntilNextCheck(settings, nowMs = this.clock.now()) {
        if (!settings.reminderEnabled)
            return REMINDER_POLL_MS;
        if (this.snoozeUntil !== undefined) {
            // A passed deadline is no reason to spin: the card is already up and only
            // the user's answer clears it, so poll instead of rescheduling at 0 ms.
            return nowMs >= this.snoozeUntil ? REMINDER_POLL_MS : clampDelay(this.snoozeUntil - nowMs);
        }
        if (this.acknowledged && this.lastFiredDay === localDayKey(nowMs))
            return REMINDER_POLL_MS;
        const occurrence = this.occurrenceFor(nowMs, settings);
        if (nowMs < occurrence)
            return clampDelay(occurrence - nowMs);
        // The occurrence is behind us. If this watch could still have caught it, a
        // tick must run at once; if it is behind the watch (a page opened later), the
        // day is unspendable and polling is the only correct answer — returning 0
        // here would spin the timer until midnight.
        if (occurrence >= this.watcherStartMs && this.lastFiredDay !== localDayKey(nowMs))
            return 0;
        return REMINDER_POLL_MS;
    }
}
/**
 * Clamp a snooze delay into the configured range.
 * @param minutes - Candidate delay from settings or storage.
 * @returns An integer within `[MIN_SNOOZE_MINUTES, MAX_SNOOZE_MINUTES]`.
 */
export function clampSnoozeMinutes(minutes) {
    if (!Number.isFinite(minutes))
        return MIN_SNOOZE_MINUTES;
    const rounded = Math.round(minutes);
    if (rounded < MIN_SNOOZE_MINUTES)
        return MIN_SNOOZE_MINUTES;
    if (rounded > MAX_SNOOZE_MINUTES)
        return MAX_SNOOZE_MINUTES;
    return rounded;
}
/**
 * Clamp a tick delay into `[0, REMINDER_POLL_MS]` so no timer drifts forever.
 * @param milliseconds - Candidate delay.
 * @returns A delay in the polling range.
 */
export function clampDelay(milliseconds) {
    if (!Number.isFinite(milliseconds))
        return REMINDER_POLL_MS;
    if (milliseconds < 0)
        return 0;
    if (milliseconds > REMINDER_POLL_MS)
        return REMINDER_POLL_MS;
    return Math.floor(milliseconds);
}
/**
 * Seconds of day for a reminder time string, falling back to 23:30.
 * @param text - `HH:mm` from settings.
 * @returns Seconds of day within `[0, 24 h)`.
 */
export function secondsFromReminderTime(text) {
    const match = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(text.trim());
    if (match === null)
        return 23 * 3600 + 30 * 60;
    const hour = Number(match[1]);
    const minute = Number(match[2]);
    if (hour > 23 || minute > 59)
        return 23 * 3600 + 30 * 60;
    const second = hour * 3600 + minute * 60;
    return second > MAX_REMINDER_SECONDS ? MAX_REMINDER_SECONDS : second;
}
/**
 * Epoch milliseconds of local midnight for the day containing `nowMs`.
 * @param nowMs - Epoch milliseconds.
 * @returns Epoch milliseconds of that day's 00:00 local time.
 */
export function startOfLocalDayMs(nowMs) {
    const date = new Date(nowMs);
    date.setHours(0, 0, 0, 0);
    return date.getTime();
}
