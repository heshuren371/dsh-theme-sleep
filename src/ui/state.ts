/**
 * The props face every surface in `src/ui/` renders from.
 *
 * This module is deliberately dependency-free: the components must not import
 * the Client entry, the core, or the locale module, so a change here is the
 * only coordination point between the plugin lifecycle and its views.
 * @module
 */
import type { ReminderState } from '../core/reminder.js'
import type { ThemeSleepSettings } from '../core/types.js'

/** Localized text renderer, bound to the active locale by the Client entry. */
export type TranslateText = (key: string, params?: Record<string, string | number>) => string

/** Full plugin snapshot the surfaces select from. */
export interface ThemeSleepViewState {
  /** Live settings, already normalized. */
  readonly settings: ThemeSleepSettings
  /** Theme the time rule expects right now. */
  readonly expected: 'light' | 'dark'
  /** Theme the runtime reports as active. */
  readonly active: 'light' | 'dark'
  /** Whether the user picked a theme by hand and that choice still wins. */
  readonly overridden: boolean
  /**
   * Instant a manual theme choice stops winning, while one is active; `0` when
   * no override is running. The value is always finite: the "until the next
   * switch" window resolves to the next rule boundary.
   */
  readonly overrideUntil: number
  /** The next rule transition and its instant. */
  readonly boundary: { readonly theme: 'light' | 'dark'; readonly at: number }
  /** Current reminder decision. */
  readonly reminder: ReminderState
  /** System-notification permission as the browser reports it. */
  readonly notification: 'granted' | 'denied' | 'default' | 'unsupported'
  /** Whether settings came from the Host document rather than the defaults. */
  readonly settingsReady: boolean
  /** Milliseconds until {@link boundary}. */
  readonly switchInMs: number
}

/** Subscribe hook over the plugin snapshot, supplied by the Client entry. */
export type UseView = <T>(selector: (state: Readonly<ThemeSleepViewState>) => T) => T

/** Write path a settings surface uses; the Client entry owns persistence. */
export type PersistSettings = (patch: Partial<ThemeSleepSettings>) => void

/** Actions the bedtime card raises. */
export interface ReminderActions {
  /** Postpone the current occurrence by the configured snooze delay. */
  snooze(): void
  /** Acknowledge the occurrence; it does not return until the next day. */
  dismiss(): void
  /** Open the General settings section. */
  openSettings(): void
}

/** Props the Client entry injects into the composer-dock chip. */
export interface ChipProps {
  /** Subscribe hook over the plugin snapshot. */
  useView: UseView
  /** Localized text renderer. */
  text: TranslateText
}

/** Props the Client entry injects into the bedtime card. */
export interface ReminderCardProps {
  /** Subscribe hook over the plugin snapshot. */
  useView: UseView
  /** Localized text renderer. */
  text: TranslateText
  /** User answers. */
  actions: ReminderActions
  /** Current wall-clock time as `HH:mm`, read when the card renders. */
  clock(): string
}

/** Props the Client entry injects into the General-settings row. */
export interface SettingsRowProps {
  /** Subscribe hook over the plugin snapshot. */
  useView: UseView
  /** Localized text renderer. */
  text: TranslateText
  /** Persist a settings patch through the Client entry. */
  persist: PersistSettings
  /** Whether the Host settings document has been adopted. */
  settingsReady: boolean
  /** Ask the browser for notification permission from a user gesture. */
  requestNotifications(): void
}
