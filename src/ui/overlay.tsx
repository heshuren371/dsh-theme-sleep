/**
 * The bedtime card: the in-app half of the reminder.
 *
 * The card is portalled beside `#root` by the Client entry, so its layer covers
 * the window. The layer itself is `pointer-events:none` — only the card accepts
 * clicks — and the dark scrim is painted only while the occurrence is fresh
 * (`active`); a snoozed re-show stays scrim-free. The card holds no clock: the
 * current time arrives through the `clock` prop and the mode through `useView`.
 * @module
 */
import { h } from './h.js'
import type { ReminderCardProps } from './state.js'
import { formatClock } from '../core/time.js'

/** One rendered element, as the platform bridge returns it. */
type UiElement = ReturnType<typeof h>

/**
 * Local `HH:mm` for the instant a snooze expires.
 * @param epochMs - Epoch milliseconds from the snapshot.
 * @returns Zero-padded local wall-clock text.
 */
function clockTextOf(epochMs: number): string {
  const date = new Date(epochMs)
  return formatClock(date.getHours() * 3600 + date.getMinutes() * 60, false)
}

/**
 * The card's crescent moon, authored inline and sized by width/height.
 * @returns A decorative inline SVG.
 */
function moonIcon(): UiElement {
  return h(
    'svg',
    {
      className: 'dts-card__icon',
      viewBox: '0 0 16 16',
      width: 16,
      height: 16,
      'aria-hidden': true,
      focusable: false,
    },
    h('path', { d: 'M8 2.2a5.8 5.8 0 1 0 5.8 5.8A4.6 4.6 0 0 1 8 2.2z', fill: 'currentColor' }),
  )
}

/**
 * Render the bedtime card, or nothing while the reminder is idle.
 * @param props - Snapshot selector, localized text, user answers, and the clock.
 * @returns The card layer, or `null`.
 */
export function ReminderCard({ useView, text, actions, clock }: ReminderCardProps): UiElement | null {
  const mode = useView(state => state.reminder.mode)
  const snoozeUntil = useView(state => state.reminder.snoozeUntil)
  const snoozeMinutes = useView(state => state.settings.snoozeMinutes)

  if (mode === 'idle') return null

  const now = clock()
  const body = mode === 'snoozed'
    ? text('reminder.snoozedBody', { time: snoozeUntil === undefined ? now : clockTextOf(snoozeUntil) })
    : text('reminder.body', { time: now })

  return h(
    'div',
    { className: mode === 'active' ? 'dts-layer dts-layer--scrim' : 'dts-layer' },
    h(
      'div',
      { className: 'dts-card', role: 'alert', 'aria-live': 'assertive' },
      h(
        'div',
        { className: 'dts-card__head' },
        moonIcon(),
        h('h2', { className: 'dts-card__title' }, text('reminder.title')),
      ),
      h('p', { className: 'dts-card__body' }, body),
      h(
        'div',
        { className: 'dts-card__actions' },
        h(
          'button',
          {
            type: 'button',
            className: 'dts-btn dts-btn--primary',
            onClick: () => { actions.dismiss() },
          },
          text('reminder.dismiss'),
        ),
        h(
          'button',
          {
            type: 'button',
            className: 'dts-btn dts-btn--ghost',
            onClick: () => { actions.snooze() },
          },
          text('reminder.snooze', { minutes: snoozeMinutes }),
        ),
        h(
          'button',
          {
            type: 'button',
            className: 'dts-btn dts-btn--link',
            onClick: () => { actions.dismiss() },
          },
          text('reminder.close'),
        ),
      ),
    ),
  )
}
