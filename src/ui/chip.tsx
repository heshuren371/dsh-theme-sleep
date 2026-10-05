/**
 * The ambient status chip under the composer.
 *
 * One compact pill reports the theme the time rule expects, the next switch,
 * and the bedtime reminder; clicking it opens a read-only popover with the same
 * summary. The chip holds no write path: every settings change goes through the
 * General-settings row. All values come from `useView`; the only local state is
 * whether the popover is open.
 * @module
 */
import { h, React } from './h.js'
import type { ChipProps } from './state.js'
import { formatClock } from '../core/time.js'

/** One rendered element, as the platform bridge returns it. */
type UiElement = ReturnType<typeof h>

/**
 * Local `HH:mm` for an instant supplied by the snapshot.
 * @param epochMs - Epoch milliseconds from a prop.
 * @returns Zero-padded local wall-clock text.
 */
function clockTextOf(epochMs: number): string {
  const date = new Date(epochMs)
  return formatClock(date.getHours() * 3600 + date.getMinutes() * 60, false)
}

/**
 * The theme glyph: a sun for the light period, a crescent moon for the dark one.
 * @param theme - Theme the icon should match.
 * @returns A decorative inline SVG sized to the chip.
 */
function themeIcon(theme: 'light' | 'dark'): UiElement {
  if (theme === 'light') {
    return h(
      'svg',
      {
        className: 'dts-chip__icon',
        viewBox: '0 0 16 16',
        width: 14,
        height: 14,
        'aria-hidden': true,
        focusable: false,
      },
      h('circle', { cx: 8, cy: 8, r: 3.1, fill: 'currentColor' }),
      h('path', {
        d: 'M8 1.2v1.8M8 13v1.8M1.2 8h1.8M13 8h1.8M3.2 3.2l1.3 1.3M11.5 11.5l1.3 1.3M12.8 3.2l-1.3 1.3M4.5 11.5l-1.3 1.3',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 1.3,
        strokeLinecap: 'round',
      }),
    )
  }
  return h(
    'svg',
    {
      className: 'dts-chip__icon',
      viewBox: '0 0 16 16',
      width: 14,
      height: 14,
      'aria-hidden': true,
      focusable: false,
    },
    h('path', { d: 'M8 2.2a5.8 5.8 0 1 0 5.8 5.8A4.6 4.6 0 0 1 8 2.2z', fill: 'currentColor' }),
  )
}

/**
 * Render the composer-dock chip and its read-only popover.
 * @param props - Snapshot selector and localized text.
 * @returns The pill and, while open, the popover above it.
 */
export function Chip({ useView, text }: ChipProps): UiElement {
  const { useEffect, useRef, useState } = React
  const expected = useView(state => state.expected)
  const boundaryTheme = useView(state => state.boundary.theme)
  const boundaryAt = useView(state => state.boundary.at)
  const overridden = useView(state => state.overridden)
  const overrideUntil = useView(state => state.overrideUntil)
  const reminderEnabled = useView(state => state.settings.reminderEnabled)
  const reminderTime = useView(state => state.settings.reminderTime)
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement | null>(null)

  const themeLabel = text(expected === 'light' ? 'chip.light' : 'chip.dark')
  const nextLabel = text(boundaryTheme === 'light' ? 'chip.next.light' : 'chip.next.dark', {
    time: clockTextOf(boundaryAt),
  })
  const reminderLabel = reminderEnabled
    ? text('chip.reminder', { time: reminderTime })
    : text('chip.reminderOff')
  const overrideLabel = text('chip.override')
  // "Until the next switch" reports the boundary; a finite window reports its
  // own deadline. Either way the chip answers "when does the rule come back?".
  const overrideResume = overrideUntil > 0
    ? text('chip.overrideUntil', { time: clockTextOf(overrideUntil) })
    : null
  const summary = [themeLabel, nextLabel, reminderLabel].join(' · ')

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') setOpen(false)
    }
    const onMouseDown = (event: MouseEvent): void => {
      const wrap = wrapRef.current
      const target = event.target
      if (wrap !== null && target instanceof Node && wrap.contains(target)) return
      setOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('mousedown', onMouseDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('mousedown', onMouseDown)
    }
  }, [open])

  const pill = h(
    'button',
    {
      type: 'button',
      className: 'dts-chip',
      'aria-haspopup': 'dialog',
      'aria-expanded': open,
      'aria-label': overridden ? `${overrideLabel} · ${overrideResume ?? nextLabel}` : summary,
      title: overridden ? `${overrideLabel} · ${overrideResume ?? nextLabel}` : summary,
      onClick: () => { setOpen(!open) },
    },
    themeIcon(expected),
    h('span', { className: 'dts-chip__label' }, themeLabel),
    h('span', { className: 'dts-chip__sep', 'aria-hidden': true }, '·'),
    h('span', { className: 'dts-chip__label' }, nextLabel),
    h('span', { className: 'dts-chip__sep', 'aria-hidden': true }, '·'),
    h('span', { className: 'dts-chip__label' }, reminderLabel),
    overridden ? h('span', { className: 'dts-chip__sep', 'aria-hidden': true }, '·') : null,
    overridden ? h('span', { className: 'dts-chip__label' }, overrideLabel) : null,
    overridden && overrideResume !== null
      ? h('span', { className: 'dts-chip__sep', 'aria-hidden': true }, '·')
      : null,
    overridden && overrideResume !== null
      ? h('span', { className: 'dts-chip__label' }, overrideResume)
      : null,
  )

  const popover = open
    ? h(
      'div',
      { className: 'dts-pop', role: 'dialog', 'aria-label': text('chip.title') },
      h('h2', { className: 'dts-pop__title' }, text('chip.title')),
      h('div', { className: 'dts-pop__line' }, `${themeLabel} · ${nextLabel}`),
      h('div', { className: 'dts-pop__line' }, reminderLabel),
      overridden
        ? h('div', { className: 'dts-pop__hint' }, `${text('panel.overrideHint')}${overrideResume === null ? '' : ` ${overrideResume}`}`)
        : null,
    )
    : null

  return h('div', { className: 'dts-chip-wrap', ref: wrapRef }, pill, popover)
}
