/** Defaults for every field; also the composition-layer fallback. */
export const DEFAULT_SETTINGS = Object.freeze({
    dayStart: '06:00',
    dayEnd: '19:00',
    reminderEnabled: true,
    reminderTime: '23:30',
    snoozeMinutes: 10,
    soundEnabled: true,
    manualOverrideMinutes: 30,
    completionSound: 'chime',
});
/** Default period bounds as seconds since local midnight. */
export const DEFAULT_DAY_START_SECONDS = 6 * 60 * 60;
/** Default dark-period start as seconds since local midnight. */
export const DEFAULT_DAY_END_SECONDS = 19 * 60 * 60;
/** Default bedtime reminder as seconds since local midnight. */
export const DEFAULT_REMINDER_SECONDS = 23 * 60 * 60 + 30 * 60;
/** Lower bound of the configurable snooze delay, in minutes. */
export const MIN_SNOOZE_MINUTES = 1;
/** Upper bound of the configurable snooze delay, in minutes. */
export const MAX_SNOOZE_MINUTES = 120;
/** Lower bound of the manual-override window, in minutes (`0` = no override). */
export const MIN_MANUAL_OVERRIDE_MINUTES = 0;
/** Upper bound of the manual-override window, in minutes. */
export const MAX_MANUAL_OVERRIDE_MINUTES = 24 * 60;
/** Lower bound of the configurable reminder time (00:00). */
export const MIN_REMINDER_SECONDS = 0;
/** Upper bound of the configurable reminder time (23:59). */
export const MAX_REMINDER_SECONDS = 23 * 60 * 60 + 59 * 60;
