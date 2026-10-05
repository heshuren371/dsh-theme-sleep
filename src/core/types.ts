/**
 * Public value shapes shared by the Host row, the Client half, and the pure core.
 *
 * The Host declares these as its `Config` schema (see `schema.ts`), so the same
 * field names travel: profile comment -> settings row -> live plugin.
 * @module
 */

/** Theme the automatic switcher puts the application into. */
export type ThemeId = 'light' | 'dark'

/** Every field of the plugin's Config, resolved to plain values. */
export interface ThemeSleepSettings {
  /** First minute of the light period, `HH:mm`. */
  readonly dayStart: string
  /** First minute of the dark period, `HH:mm`. */
  readonly dayEnd: string
  /** Whether the 23:30 bedtime reminder is armed at all. */
  readonly reminderEnabled: boolean
  /** Minute of day the bedtime reminder fires, `HH:mm`. */
  readonly reminderTime: string
  /** Minutes of snooze applied by the reminder card's snooze button. */
  readonly snoozeMinutes: number
  /** Whether the reminder also plays a short chime. */
  readonly soundEnabled: boolean
  /**
   * How long a theme the user picked by hand wins over the rule, in minutes.
   * `0` disables the override entirely (the rule re-asserts on the next check).
   */
  readonly manualOverrideMinutes: number
}

/** Defaults for every field; also the composition-layer fallback. */
export const DEFAULT_SETTINGS: ThemeSleepSettings = Object.freeze({
  dayStart: '06:00',
  dayEnd: '19:00',
  reminderEnabled: true,
  reminderTime: '23:30',
  snoozeMinutes: 10,
  soundEnabled: true,
  manualOverrideMinutes: 30,
})

/** Default period bounds as seconds since local midnight. */
export const DEFAULT_DAY_START_SECONDS = 6 * 60 * 60
/** Default dark-period start as seconds since local midnight. */
export const DEFAULT_DAY_END_SECONDS = 19 * 60 * 60
/** Default bedtime reminder as seconds since local midnight. */
export const DEFAULT_REMINDER_SECONDS = 23 * 60 * 60 + 30 * 60

/** Lower bound of the configurable snooze delay, in minutes. */
export const MIN_SNOOZE_MINUTES = 1
/** Upper bound of the configurable snooze delay, in minutes. */
export const MAX_SNOOZE_MINUTES = 120

/** Lower bound of the manual-override window, in minutes (`0` = no override). */
export const MIN_MANUAL_OVERRIDE_MINUTES = 0
/** Upper bound of the manual-override window, in minutes. */
export const MAX_MANUAL_OVERRIDE_MINUTES = 24 * 60

/** Lower bound of the configurable reminder time (00:00). */
export const MIN_REMINDER_SECONDS = 0
/** Upper bound of the configurable reminder time (23:59). */
export const MAX_REMINDER_SECONDS = 23 * 60 * 60 + 59 * 60
