/**
 * Config normalization and boundary validation.
 *
 * The Host's Config schema is the first gate; this module is the second, for
 * every path that reaches the plugin as untyped data (a settings document, a
 * profile patch, a restored snapshot). Nothing here throws: a bad field falls
 * back to its default, so a corrupt document cannot take the theme down.
 * @module
 */
import { DEFAULT_DAY_END_SECONDS, DEFAULT_DAY_START_SECONDS, DEFAULT_REMINDER_SECONDS, DEFAULT_SETTINGS, MAX_MANUAL_OVERRIDE_MINUTES, MAX_SNOOZE_MINUTES, MIN_MANUAL_OVERRIDE_MINUTES, MIN_SNOOZE_MINUTES, } from './types.js';
import { parseClock, secondToHhMm } from './time.js';
/** Keys accepted from an untrusted settings object. */
const KEYS = [
    'dayStart', 'dayEnd', 'reminderEnabled', 'reminderTime', 'snoozeMinutes', 'soundEnabled',
    'manualOverrideMinutes',
];
/**
 * Whether a value is a plain object that could carry settings.
 * @param value - Candidate.
 * @returns True for a non-null, non-array object.
 */
function isRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
/**
 * Normalize one time string, falling back when it cannot be parsed.
 * @param value - Candidate `HH:mm`.
 * @param fallback - Time string used when the candidate is invalid.
 * @returns A canonical `HH:mm` string.
 */
function normalizeTime(value, fallback) {
    if (typeof value !== 'string')
        return fallback;
    const seconds = parseClock(value);
    return seconds === undefined ? fallback : secondToHhMm(seconds);
}
/**
 * Normalize one boolean, falling back on any other type.
 * @param value - Candidate.
 * @param fallback - Value used when the candidate is not a boolean.
 * @returns A boolean.
 */
function normalizeBoolean(value, fallback) {
    return typeof value === 'boolean' ? value : fallback;
}
/**
 * Normalize the snooze delay into its configured range.
 * @param value - Candidate minutes.
 * @returns An integer within the range, or the default.
 */
function normalizeSnooze(value) {
    if (typeof value !== 'number' || !Number.isFinite(value))
        return DEFAULT_SETTINGS.snoozeMinutes;
    const rounded = Math.round(value);
    if (rounded < MIN_SNOOZE_MINUTES || rounded > MAX_SNOOZE_MINUTES)
        return DEFAULT_SETTINGS.snoozeMinutes;
    return rounded;
}
/**
 * Normalize the manual-override window into its supported range.
 * @param value - Candidate minutes.
 * @returns An integer within the range, or the default.
 */
function normalizeOverride(value) {
    if (typeof value !== 'number' || !Number.isFinite(value))
        return DEFAULT_SETTINGS.manualOverrideMinutes;
    const rounded = Math.round(value);
    if (rounded < MIN_MANUAL_OVERRIDE_MINUTES || rounded > MAX_MANUAL_OVERRIDE_MINUTES)
        return DEFAULT_SETTINGS.manualOverrideMinutes;
    return rounded;
}
/**
 * Turn any untrusted value into a complete, valid settings object. Unknown keys
 * are dropped and every missing or invalid field takes its default, so callers
 * never need a second guard.
 * @param value - Candidate settings (possibly a partial or corrupt document).
 * @returns Complete settings.
 */
export function normalizeSettings(value) {
    const source = isRecord(value) ? value : {};
    const present = KEYS.filter(key => Object.hasOwn(source, key));
    if (present.length === 0)
        return DEFAULT_SETTINGS;
    return {
        dayStart: normalizeTime(source['dayStart'], DEFAULT_SETTINGS.dayStart),
        dayEnd: normalizeTime(source['dayEnd'], DEFAULT_SETTINGS.dayEnd),
        reminderEnabled: normalizeBoolean(source['reminderEnabled'], DEFAULT_SETTINGS.reminderEnabled),
        reminderTime: normalizeTime(source['reminderTime'], DEFAULT_SETTINGS.reminderTime),
        snoozeMinutes: normalizeSnooze(source['snoozeMinutes']),
        soundEnabled: normalizeBoolean(source['soundEnabled'], DEFAULT_SETTINGS.soundEnabled),
        manualOverrideMinutes: normalizeOverride(source['manualOverrideMinutes']),
    };
}
/**
 * Resolve a settings object into the light/dark rule in seconds of day.
 * @param settings - Complete settings.
 * @returns Resolved period bounds.
 */
export function themeRuleOf(settings) {
    const dayStart = parseClock(settings.dayStart) ?? DEFAULT_DAY_START_SECONDS;
    const dayEnd = parseClock(settings.dayEnd) ?? DEFAULT_DAY_END_SECONDS;
    return { dayStart, dayEnd };
}
/**
 * Resolve the reminder time to seconds of day.
 * @param settings - Complete settings.
 * @returns Seconds of day for the reminder.
 */
export function reminderSecondOf(settings) {
    return parseClock(settings.reminderTime) ?? DEFAULT_REMINDER_SECONDS;
}
/**
 * Whether a candidate time string is acceptable to the Host schema and the
 * settings inputs: `HH:mm` with both fields in range.
 * @param value - Candidate text.
 * @returns True when {@link parseClock} accepts it.
 */
export function isValidTimeText(value) {
    return parseClock(value) !== undefined;
}
