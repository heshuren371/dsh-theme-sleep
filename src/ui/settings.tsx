/**
 * The General-settings row: the only surface that writes settings.
 *
 * Layout follows the host's Appearance row (title, sections, hairline). Time
 * and number fields keep a local draft while the user edits, so a half-typed
 * value never fights the re-render from the store: a valid draft commits
 * immediately, an invalid one stays on screen with the inline hint and reverts
 * on blur. The only other local state is the transient "saved" flag.
 * @module
 */
import { h, React } from './h.js'
import type { SettingsRowProps } from './state.js'
import { formatClock, parseClock } from '../core/time.js'
import {
  DEFAULT_SETTINGS,
  MAX_MANUAL_OVERRIDE_MINUTES,
  MAX_SNOOZE_MINUTES,
  MIN_SNOOZE_MINUTES,
  type ThemeSleepSettings,
} from '../core/types.js'

/**
 * Everything one manual-override choice needs. The stored value is a minute
 * count; the upper bound is the "until the next switch" sentinel and renders as
 * an indistinguishable max.
 */
const OVERRIDE_CHOICES: readonly { readonly minutes: number; readonly key: string }[] = [
  { minutes: 0, key: 'panel.overrideNever' },
  { minutes: 5, key: 'panel.overrideFive' },
  { minutes: 30, key: 'panel.overrideThirty' },
  { minutes: 120, key: 'panel.overrideTwoHours' },
  { minutes: MAX_MANUAL_OVERRIDE_MINUTES, key: 'panel.overridePeriod' },
]

/** One rendered element, as the platform bridge returns it. */
type UiElement = ReturnType<typeof h>

/** How long the saved hint stays on screen. */
const SAVED_HINT_MS = 2000

/** Settings fields edited as `HH:mm` text. */
type TimeField = 'dayStart' | 'dayEnd' | 'reminderTime'

/**
 * Local `HH:mm` for an instant supplied by the snapshot.
 * @param epochMs - Epoch milliseconds from a snapshot field.
 * @returns Zero-padded local wall-clock text.
 */
function clockTextOf(epochMs: number): string {
  const date = new Date(epochMs)
  return formatClock(date.getHours() * 3600 + date.getMinutes() * 60, false)
}

/** Everything one labelled time input needs. */
interface TimeFieldOptions {
  /** Visible caption. */
  caption: string
  /** Accessible name, from the same dictionary key as the caption. */
  label: string
  /** Draft text while editing, otherwise the committed value. */
  value: string
  /** Whether the draft is an unparseable time. */
  invalid: boolean
  /** Inline hint shown while `invalid`. */
  invalidText: string
  /** Receives every new draft. */
  onChange(value: string): void
  /** Restores the committed value after the field loses focus. */
  onBlur(): void
}

/**
 * Render one caption + `<input type="time">` + inline error.
 * @param options - Field copy, value, and handlers.
 * @returns The labelled field.
 */
function timeField(options: TimeFieldOptions): UiElement {
  return h(
    'label',
    { className: 'dts-field' },
    h('span', { className: 'dts-caption' }, options.caption),
    h('input', {
      className: 'dts-input',
      type: 'time',
      value: options.value,
      'aria-label': options.label,
      'aria-invalid': options.invalid,
      onChange: (event: { currentTarget: HTMLInputElement }) => { options.onChange(event.currentTarget.value) },
      onBlur: () => { options.onBlur() },
    }),
    options.invalid ? h('span', { className: 'dts-hint dts-hint--warn' }, options.invalidText) : null,
  )
}

/**
 * Render one switch as a real button with `role="switch"`.
 * @param checked - Current value.
 * @param label - Accessible name.
 * @param onToggle - Receives the click that flips the value.
 * @returns The toggle.
 */
function switchButton(checked: boolean, label: string, onToggle: () => void): UiElement {
  return h(
    'button',
    {
      type: 'button',
      className: 'dts-switch',
      role: 'switch',
      'aria-checked': checked,
      'aria-label': label,
      onClick: onToggle,
    },
    h('span', { className: 'dts-switch__knob', 'aria-hidden': true }),
  )
}

/**
 * Render the General-settings row.
 * @param props - Snapshot selector, text, the persist path, and the permission request.
 * @returns The settings row.
 */
export function SettingsRow(props: SettingsRowProps): UiElement {
  const { useView, text, persist, requestNotifications } = props
  const { useEffect, useState } = React
  const active = useView(state => state.active)
  const overridden = useView(state => state.overridden)
  const boundaryTheme = useView(state => state.boundary.theme)
  const boundaryAt = useView(state => state.boundary.at)
  const dayStart = useView(state => state.settings.dayStart)
  const dayEnd = useView(state => state.settings.dayEnd)
  const reminderEnabled = useView(state => state.settings.reminderEnabled)
  const reminderTime = useView(state => state.settings.reminderTime)
  const snoozeMinutes = useView(state => state.settings.snoozeMinutes)
  const soundEnabled = useView(state => state.settings.soundEnabled)
  const notification = useView(state => state.notification)
  const manualOverrideMinutes = useView(state => state.settings.manualOverrideMinutes)

  const [startDraft, setStartDraft] = useState<string | null>(null)
  const [endDraft, setEndDraft] = useState<string | null>(null)
  const [reminderDraft, setReminderDraft] = useState<string | null>(null)
  const [snoozeDraft, setSnoozeDraft] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!saved) return
    const timer = window.setTimeout(() => { setSaved(false) }, SAVED_HINT_MS)
    return () => { window.clearTimeout(timer) }
  }, [saved])

  /** Persist one patch and flash the saved hint. */
  const commit = (patch: Partial<ThemeSleepSettings>): void => {
    persist(patch)
    setSaved(true)
  }

  /** Commit a time draft when it parses; otherwise keep it and show the hint. */
  const commitTime = (field: TimeField, raw: string, setDraft: (value: string | null) => void): void => {
    if (parseClock(raw) === undefined) {
      setDraft(raw)
      return
    }
    setDraft(null)
    const patch: Partial<ThemeSleepSettings> = field === 'dayStart'
      ? { dayStart: raw }
      : field === 'dayEnd'
        ? { dayEnd: raw }
        : { reminderTime: raw }
    commit(patch)
  }

  const startInvalid = startDraft !== null && parseClock(startDraft) === undefined
  const endInvalid = endDraft !== null && parseClock(endDraft) === undefined
  const reminderInvalid = reminderDraft !== null && parseClock(reminderDraft) === undefined

  /** Commit a snooze delay, rounded and clamped into the supported range. */
  const changeSnooze = (raw: string): void => {
    setSnoozeDraft(raw)
    if (raw.trim() === '') return
    const parsed = Number(raw)
    if (!Number.isFinite(parsed)) return
    const clamped = Math.min(MAX_SNOOZE_MINUTES, Math.max(MIN_SNOOZE_MINUTES, Math.round(parsed)))
    commit({ snoozeMinutes: clamped })
  }

  /** The system-notification line: a prompt button, or the reported state. */
  const notificationLine = (): UiElement => {
    if (notification === 'granted') return h('div', { className: 'dts-hint' }, text('panel.notificationsOn'))
    if (notification === 'denied') return h('div', { className: 'dts-hint dts-hint--warn' }, text('panel.notificationsDenied'))
    if (notification === 'unsupported') return h('div', { className: 'dts-hint' }, text('panel.notificationsUnsupported'))
    return h(
      'div',
      { className: 'dts-footer' },
      h(
        'button',
        {
          type: 'button',
          className: 'dts-btn dts-btn--ghost',
          onClick: () => { requestNotifications() },
        },
        text('panel.enableNotifications'),
      ),
    )
  }

  return h(
    'div',
    { className: 'dts-row' },
    h('div', { className: 'dts-row__title' }, text('chip.title')),

    h(
      'div',
      { className: 'dts-section' },
      h('div', { className: 'dts-rowtitle' }, text('panel.autoTitle')),
      h('div', { className: 'dts-caption' }, text('panel.autoDescription')),
      h(
        'div',
        { className: 'dts-fields' },
        timeField({
          caption: text('panel.dayStart'),
          label: text('panel.dayStart'),
          value: startDraft ?? dayStart,
          invalid: startInvalid,
          invalidText: text('panel.invalidTime'),
          onChange: raw => { commitTime('dayStart', raw, setStartDraft) },
          onBlur: () => { setStartDraft(null) },
        }),
        timeField({
          caption: text('panel.dayEnd'),
          label: text('panel.dayEnd'),
          value: endDraft ?? dayEnd,
          invalid: endInvalid,
          invalidText: text('panel.invalidTime'),
          onChange: raw => { commitTime('dayEnd', raw, setEndDraft) },
          onBlur: () => { setEndDraft(null) },
        }),
      ),
    ),

    h(
      'div',
      { className: 'dts-summary' },
      h('span', { className: 'dts-caption' }, text('panel.currentTheme')),
      h('span', { className: 'dts-summary__value' }, text(active === 'light' ? 'chip.light' : 'chip.dark')),
      h('span', { className: 'dts-sep', 'aria-hidden': true }, '·'),
      h('span', { className: 'dts-caption' }, text('panel.nextSwitch')),
      h(
        'span',
        { className: 'dts-summary__value' },
        text(boundaryTheme === 'light' ? 'chip.next.light' : 'chip.next.dark', { time: clockTextOf(boundaryAt) }),
      ),
    ),
    overridden ? h('div', { className: 'dts-hint' }, text('panel.overrideHint')) : null,

    h(
      'div',
      { className: 'dts-section' },
      h(
        'div',
        { className: 'dts-rowhead' },
        h(
          'div',
          { className: 'dts-rowhead__text' },
          h('div', { className: 'dts-rowtitle' }, text('panel.notifyTitle')),
          h('div', { className: 'dts-caption' }, text('panel.notifyDescription')),
        ),
        switchButton(reminderEnabled, text('panel.notifyTitle'), () => { commit({ reminderEnabled: !reminderEnabled }) }),
      ),
      h(
        'div',
        { className: 'dts-fields' },
        timeField({
          caption: text('panel.reminderTime'),
          label: text('panel.reminderTime'),
          value: reminderDraft ?? reminderTime,
          invalid: reminderInvalid,
          invalidText: text('panel.invalidTime'),
          onChange: raw => { commitTime('reminderTime', raw, setReminderDraft) },
          onBlur: () => { setReminderDraft(null) },
        }),
        h(
          'label',
          { className: 'dts-field' },
          h('span', { className: 'dts-caption' }, `${text('panel.snooze')} (${text('panel.snoozeUnit')})`),
          h('input', {
            className: 'dts-input dts-input--number',
            type: 'number',
            min: MIN_SNOOZE_MINUTES,
            max: MAX_SNOOZE_MINUTES,
            value: snoozeDraft ?? String(snoozeMinutes),
            'aria-label': text('panel.snooze'),
            onChange: (event: { currentTarget: HTMLInputElement }) => { changeSnooze(event.currentTarget.value) },
            onBlur: () => { setSnoozeDraft(null) },
          }),
        ),
      ),
      h(
        'label',
        { className: 'dts-field' },
        h('span', { className: 'dts-caption' }, text('panel.overrideTitle')),
        h(
          'select',
          {
            className: 'dts-input dts-input--select',
            value: String(manualOverrideMinutes),
            'aria-label': text('panel.overrideTitle'),
            onChange: (event: { currentTarget: HTMLSelectElement }) => {
              const minutes = Number(event.currentTarget.value)
              if (Number.isFinite(minutes)) commit({ manualOverrideMinutes: minutes })
            },
          },
          ...OVERRIDE_CHOICES.map(choice => h(
            'option',
            { key: choice.minutes, value: String(choice.minutes) },
            text(choice.key),
          )),
        ),
      ),
      h(
        'div',
        { className: 'dts-toggle' },
        h('span', { className: 'dts-caption' }, text('panel.sound')),
        switchButton(soundEnabled, text('panel.sound'), () => { commit({ soundEnabled: !soundEnabled }) }),
      ),
      notificationLine(),
    ),

    h(
      'div',
      { className: 'dts-footer' },
      h(
        'button',
        {
          type: 'button',
          className: 'dts-btn dts-btn--ghost',
          onClick: () => { commit({ ...DEFAULT_SETTINGS }) },
        },
        text('panel.reset'),
      ),
      saved ? h('span', { className: 'dts-saved', role: 'status' }, text('panel.saved')) : null,
    ),
  )
}
