/**
 * The Host `Config` schema for the plugin row.
 *
 * This is the first gate for every value that reaches the plugin: the Loader
 * validates the row's `config` against it before `apply` runs, and the settings
 * document is projected through it. The Client half re-normalizes anyway
 * (`core/config.ts`), because a settings document can also carry values written
 * by an older version of this plugin.
 * @module
 */

import z from '@deepseek-ai/schemastery'
import {
  DEFAULT_SETTINGS, MAX_MANUAL_OVERRIDE_MINUTES, MAX_SNOOZE_MINUTES,
  MIN_MANUAL_OVERRIDE_MINUTES, MIN_SNOOZE_MINUTES, type ThemeSleepSettings,
} from './core/types.ts'

/** Accepted `HH:mm` text for a time-of-day field. */
const TIME_PATTERN = /^([01]?\d|2[0-3]):[0-5]\d$/

/** Time-of-day field with the plugin's default. */
function timeField(fallback: string, description: string) {
  return z.string().pattern(TIME_PATTERN).default(fallback).description(description)
}

/** Live settings of the automatic theme and bedtime reminder. */
export const Config: z<ThemeSleepSettings> = z.object({
  dayStart: timeField(DEFAULT_SETTINGS.dayStart, 'First minute of the light period (HH:mm).'),
  dayEnd: timeField(DEFAULT_SETTINGS.dayEnd, 'First minute of the dark period (HH:mm).'),
  reminderEnabled: z.boolean().default(DEFAULT_SETTINGS.reminderEnabled)
    .description('Whether the bedtime reminder is armed.'),
  reminderTime: timeField(DEFAULT_SETTINGS.reminderTime, 'Minute of day the bedtime reminder fires (HH:mm).'),
  snoozeMinutes: z.number().step(1).min(MIN_SNOOZE_MINUTES).max(MAX_SNOOZE_MINUTES)
    .default(DEFAULT_SETTINGS.snoozeMinutes)
    .description('Minutes the reminder card postpones the bedtime reminder by.'),
  soundEnabled: z.boolean().default(DEFAULT_SETTINGS.soundEnabled)
    .description('Whether the reminder plays a short chime.'),
  manualOverrideMinutes: z.number().step(1).min(MIN_MANUAL_OVERRIDE_MINUTES).max(MAX_MANUAL_OVERRIDE_MINUTES)
    .default(DEFAULT_SETTINGS.manualOverrideMinutes)
    .description('Minutes a manually chosen theme wins over the rule; 0 re-asserts the rule immediately.'),
})

/** The same defaults as a plain object, for callers that only need the fallbacks. */
export { DEFAULT_SETTINGS }
