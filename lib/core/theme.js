/**
 * The automatic light/dark rule: pure period arithmetic for "6:00–19:00 light,
 * 19:00–06:00 dark", with the boundary math needed to schedule the next check.
 * @module
 */
import { inWindow, nextOccurrenceMs, secondOfDay, wrapSecond } from './time.js';
/**
 * The period a local second of day belongs to.
 * `day` is the light window `[dayStart, dayEnd)`; every other second is `night`.
 * Equal bounds describe an always-dark rule, because the light window is a
 * half-open range of zero width.
 * @param second - Second of local day.
 * @param rule - Resolved period bounds.
 * @returns The period name.
 */
export function periodAt(second, rule) {
    return inWindow(second, rule.dayStart, rule.dayEnd) ? 'day' : 'night';
}
/**
 * The theme the rule expects at a local second of day.
 * @param second - Second of local day.
 * @param rule - Resolved period bounds.
 * @returns `light` inside the day window, `dark` otherwise.
 */
export function expectedThemeAt(second, rule) {
    return periodAt(second, rule) === 'day' ? 'light' : 'dark';
}
/**
 * The theme the rule expects at an absolute instant.
 * @param nowMs - Epoch milliseconds.
 * @param rule - Resolved period bounds.
 * @returns The expected theme.
 */
export function expectedTheme(nowMs, rule) {
    return expectedThemeAt(secondOfDay(nowMs), rule);
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
export function nextBoundary(nowMs, rule) {
    const start = wrapSecond(rule.dayStart);
    const end = wrapSecond(rule.dayEnd);
    if (start === end) {
        return { theme: 'dark', at: nextOccurrenceMs(nowMs, end), atSecond: end };
    }
    const atStart = nextOccurrenceMs(nowMs, start);
    const atEnd = nextOccurrenceMs(nowMs, end);
    if (atStart <= atEnd) {
        // The light window opens: `dayStart` is a day boundary.
        return { theme: 'light', at: atStart, atSecond: start };
    }
    // The light window closes: `dayEnd` is a night boundary.
    return { theme: 'dark', at: atEnd, atSecond: end };
}
/**
 * Resolve the whole phase in one call, so every surface agrees on the instant
 * it was computed for.
 * @param nowMs - Epoch milliseconds.
 * @param rule - Resolved period bounds.
 * @returns Period, expected theme, next boundary, and time to it.
 */
export function themePhase(nowMs, rule) {
    const period = periodAt(secondOfDay(nowMs), rule);
    const boundary = nextBoundary(nowMs, rule);
    return {
        period,
        theme: period === 'day' ? 'light' : 'dark',
        boundary,
        remainingMs: Math.max(0, boundary.at - nowMs),
    };
}
/**
 * Whether a rule covers the whole day with alternating periods, i.e. its bounds
 * differ. Used by the settings surface to explain a degenerate configuration.
 * @param rule - Resolved period bounds.
 * @returns True when the two bounds differ.
 */
export function isAlternating(rule) {
    return wrapSecond(rule.dayStart) !== wrapSecond(rule.dayEnd);
}
