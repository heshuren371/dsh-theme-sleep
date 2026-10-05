/**
 * Client half entry — the single file the Web shell evaluates in the browser.
 *
 * Responsibilities kept here, and nowhere else:
 *
 * 1. Register the bundle under its module id (the package name) and bind the
 *    browser module table before any component touches React.
 * 2. Own the plugin lifecycle: dictionaries, the theme driver, the reminder
 *    engine, the settings scope, and the slot seats.
 * 3. Hand the surfaces a frozen props face; the components in `./ui/*` never
 *    see `ctx` and hold no decisions.
 */
import type * as ReactNS from 'react'
import { bindPlatform, h, React, type ElementType } from './platform.js'
import { bindLocale, en, fallbackTranslate, NS, type Translate, zh } from './i18n.js'
import { normalizeSettings, themeRuleOf } from './core/config.js'
import { DEFAULT_SETTINGS, MAX_MANUAL_OVERRIDE_MINUTES, type ThemeSleepSettings } from './core/types.js'
import { localDayKey } from './core/time.js'
import { loadStoredState, saveStoredState } from './core/storage.js'
import { themePhase, type ThemeRule } from './core/theme.js'
import { ReminderEngine, type ReminderState } from './core/reminder.js'
import { CompletionWatch, type RunningSnapshot, type RunningSource } from './core/completion.js'
import type { CompletionSound } from './core/sound.js'
import type { ThemeSleepViewState } from './ui/state.js'
import { Chip } from './ui/chip.js'
import { ReminderCard } from './ui/overlay.js'
import { SettingsRow } from './ui/settings.js'
import { UI_STYLES } from './ui/styles.js'

/** Bundle id: the shell resolves this Client module by the package name. */
const MODULE_ID = '@local/dsh-theme-sleep'

/** Loader entry id, which is also the settings namespace of the Host row. */
const ENTRY_ID = 'theme-sleep'

/** Slot entry ids, namespaced so they cannot collide with shipped entries. */
const CHIP_SLOT_ID = 'theme-sleep-chip'
const SETTINGS_SLOT_ID = 'theme-sleep-row'

/**
 * How long a self-initiated theme change still counts as this plugin's own
 * write. `setTheme` writes through the settings document and can therefore
 * republish asynchronously; the timestamp lets a late echo be attributed
 * correctly without swallowing a theme the user picks afterwards.
 */
const OWN_WRITE_WINDOW_MS = 5000

/** Longest gap between two period checks, in milliseconds. */
const THEME_POLL_MS = 30 * 1000

/** Bound translator; falls back to Chinese copy before the locale service binds. */
let translate: Translate = fallbackTranslate

/**
 * Render a dictionary key through the currently bound translator.
 * @param key - Dictionary key.
 * @param params - Optional placeholder values.
 * @returns Localized text.
 */
function text(key: string, params?: Record<string, string | number>): string {
  return translate(key as Parameters<Translate>[0], params)
}

interface ModuleLoaderSink {
  load(registration: { id: string; factory: (require: (specifier: string) => unknown) => unknown }): void
}

type Disposer = () => void

/** Client locale service, as reached from `ctx.locale`. */
interface ClientLocaleService {
  register(namespace: string, dictionaries: Record<string, Record<string, unknown>>): Disposer
  bind(namespace: string): (key: string, params?: Record<string, string | number>) => unknown
}

/** One theme the runtime registry knows. */
interface ThemeDefinitionView {
  id: string
  colorScheme: 'light' | 'dark'
}

/** Immutable theme state published by the theme runtime. */
interface ThemeSnapshotView {
  preference: string
  active: ThemeDefinitionView
  themes: readonly ThemeDefinitionView[]
  revision: number
}

/** Theme service face, as reached from `ctx.theme`. */
interface ThemeService {
  getTheme(): ThemeSnapshotView
  setTheme(id: string): void
}

/** One accepted settings section plus its write queue. */
interface ConfigFormSnapshotView {
  status: 'loading' | 'ready' | 'unavailable'
  value?: unknown
  revision?: number
  writable: boolean
}

interface ConfigFormView {
  getSnapshot(): ConfigFormSnapshotView
  subscribe(listener: () => void): Disposer
  set(field: string, value: unknown): Promise<boolean>
}

/** Options accepted by `ctx.slots.register`; the extra keys are the inject face. */
interface SlotRegistrationOptions {
  name: string
  id: string
  order?: number
  label?: string | (() => string)
  locale?: string
  inject?: () => Record<string, unknown>
}

/** Client slot service, as reached from `ctx.slots`. */
interface ClientSlotsService {
  inject(ownerKey: string, callback: () => unknown): Disposer
  register(options: SlotRegistrationOptions, component: unknown): Disposer
}

/** Disposable timer helpers mixed into Cordis contexts. */
interface TimerService {
  timeout(callback: () => void, delay: number): Disposer
}

/**
 * Observable of every Session's running state. Declared structurally: the
 * service is published by ui-session, and older shells have delivered the map
 * directly, so both shapes are accepted.
 */
interface SessionStatusSourceView {
  getSnapshot?(): RunningSnapshot
  subscribe?(listener: () => void): Disposer
}

/** The restricted Cordis context the shell hands to `apply`. */
interface PluginContext {
  effect(callback: () => Disposer | void, label?: string): Disposer
  on(event: string, listener: (...args: never[]) => void): Disposer
  locale: ClientLocaleService
  slots: ClientSlotsService
  theme: ThemeService
  configForms: { get(entryId: string): ConfigFormView }
  timer: TimerService
  layout?: { selectPanel?(id: string): void }
  /**
   * Session UI status, published by ui-session. Optional in the type and read
   * defensively: it is not in `exports.inject`, because a shell without it must
   * still get the theme and the bedtime reminder.
   */
  uiSession?: { sessionStatus?: SessionStatusSourceView | RunningSnapshot }
}

/** Shape this bundle exports back to the shell. */
interface ClientModuleExports {
  apply(ctx: PluginContext): void
  inject: string[]
}

/** Notification permission as the surfaces report it. */
type NotificationState = 'granted' | 'denied' | 'default' | 'unsupported'

/**
 * One immutable plugin snapshot. `ui/state.ts` declares the same shape for the
 * components; this interface keeps `core` free of UI types.
 */
interface ViewState extends ThemeSleepViewState {
  settings: ThemeSleepSettings
  expected: 'light' | 'dark'
  active: 'light' | 'dark'
  overridden: boolean
  overrideUntil: number
  boundary: { theme: 'light' | 'dark'; at: number }
  reminder: ReminderState
  notification: NotificationState
  settingsReady: boolean
  switchInMs: number
}

/** Subscribe hook a surface uses to re-render on state changes. */
type UseView = <T>(selector: (state: Readonly<ThemeSleepViewState>) => T) => T

/**
 * Minimal state container: one snapshot object, replaced on change, with a
 * `useSyncExternalStore`-friendly subscribe pair.
 */
class ViewStore {
  private state: ViewState
  private readonly listeners = new Set<() => void>()

  /** @param initial - First published state. */
  constructor(initial: ViewState) {
    this.state = initial
  }

  /** @returns The current immutable snapshot. */
  get(): ViewState {
    return this.state
  }

  /**
   * Merge a patch into the snapshot and notify listeners when anything changed.
   * @param patch - Fields to merge.
   */
  update(patch: Partial<ViewState>): void {
    for (const key of Object.keys(patch) as (keyof ViewState)[]) {
      if (!Object.is(this.state[key], patch[key])) {
        this.state = { ...this.state, ...patch }
        for (const listener of [...this.listeners]) {
          try {
            listener()
          } catch (error: unknown) {
            logError('view listener', error)
          }
        }
        return
      }
    }
  }

  /**
   * Observe snapshot replacements.
   * @param listener - Called after each change.
   * @returns The disposer removing the listener.
   */
  subscribe = (listener: () => void): Disposer => {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }
}

/**
 * Report a failure without letting a missing console break the plugin.
 * @param where - Short location tag.
 * @param error - The failure to report.
 */
function logError(where: string, error: unknown): void {
  try {
    console.error(`[dsh-theme-sleep] ${where}:`, error)
  } catch {
    /* a shell without console must not crash the plugin */
  }
}

/**
 * Build the selector hook used by every surface.
 * @param store - Plugin state container.
 * @returns A hook returning `selector(state)`, re-read on each store change.
 */
function makeUseView(store: ViewStore): UseView {
  const { useRef, useSyncExternalStore, useState, useEffect } = React as unknown as {
    useRef: <T>(initial: T) => { current: T }
    useState: <T>(initial: T) => [T, (next: T) => void]
    useEffect: (effect: () => Disposer | void, deps: readonly unknown[]) => void
    useSyncExternalStore?: (subscribe: (listener: () => void) => Disposer, get: () => unknown) => unknown
  }
  return function useView<T>(selector: (state: Readonly<ThemeSleepViewState>) => T): T {
    const cache = useRef<{ state: ViewState; value: T } | null>(null)
    const getSnapshot = (): T => {
      const state = store.get()
      if (cache.current !== null && cache.current.state === state) return cache.current.value
      const value = selector(state)
      cache.current = { state, value }
      return value
    }
    if (typeof useSyncExternalStore === 'function') {
      return useSyncExternalStore(store.subscribe, getSnapshot) as T
    }
    // Fallback for a shell that exposes only the documented hooks subset.
    const [value, setValue] = useState<T>(getSnapshot())
    useEffect(() => store.subscribe(() => { setValue(getSnapshot()) }), [])
    return value
  }
}

/**
 * Read the notification permission without prompting.
 * @returns The current permission, or `unsupported`.
 */
function notificationPermission(): NotificationState {
  try {
    const permission = (window as unknown as { Notification?: { permission?: string } }).Notification?.permission
    if (permission === 'granted' || permission === 'denied' || permission === 'default') return permission
    return 'unsupported'
  } catch {
    return 'unsupported'
  }
}

/**
 * Ask for notification permission. Only called from a user gesture.
 * @returns The permission after the prompt settles.
 */
function requestNotificationPermission(): Promise<NotificationState> {
  try {
    const ctor = (window as unknown as {
      Notification?: { permission?: string; requestPermission?(): Promise<string> }
    }).Notification
    if (ctor === undefined || typeof ctor.requestPermission !== 'function') {
      return Promise.resolve<NotificationState>('unsupported')
    }
    return Promise.resolve(ctor.requestPermission()).then(
      () => notificationPermission(),
      () => 'denied' as const,
    )
  } catch {
    return Promise.resolve<NotificationState>('denied')
  }
}

/**
 * Show one system notification when permission allows it.
 * @param title - Notification title.
 * @param body - Notification body.
 */
function showSystemNotification(title: string, body: string): void {
  try {
    const ctor = (window as unknown as {
      Notification?: (new (title: string, options?: { body?: string; tag?: string; silent?: boolean }) => unknown)
        & { permission?: string }
    }).Notification
    if (ctor === undefined || ctor.permission !== 'granted') return
    new ctor(title, { body, tag: 'dsh-theme-sleep', silent: true })
  } catch {
    /* notifications are best-effort */
  }
}

/** Lazily created WebAudio context; the chime is best-effort and never throws. */
let audioContext: {
  state?: string
  resume?: () => Promise<void>
  currentTime: number
  createOscillator(): {
    type: string
    frequency: { value: number }
    connect(target: unknown): void
    start(when: number): void
    stop(when: number): void
  }
  createGain(): {
    gain: { setValueAtTime(value: number, when: number): void; exponentialRampToValueAtTime(value: number, when: number): void }
    connect(target: unknown): void
  }
  destination: unknown
} | null = null

/** One tone in a cue: when to start relative to the cue, and its pitch in hertz. */
interface Tone {
  /** Seconds after the cue starts. */
  readonly at: number
  /** Oscillator frequency. */
  readonly hz: number
}

/** Length of one tone, in seconds. */
const TONE_SECONDS = 0.45

/**
 * The built-in cues. The reminder always plays `chime`; a finished turn plays
 * whichever cue `completionSound` selects.
 */
const TONES: Readonly<Record<'ding' | 'chime' | 'blip', readonly Tone[]>> = Object.freeze({
  ding: Object.freeze([{ at: 0, hz: 880 }, { at: 0.17, hz: 1320 }]),
  chime: Object.freeze([{ at: 0, hz: 660 }, { at: 0.5, hz: 880 }, { at: 1, hz: 660 }]),
  blip: Object.freeze([{ at: 0, hz: 520 }]),
})

/**
 * Play one cue with WebAudio; silent on any failure, because a blocked audio
 * context is the expected state before the page has seen a user gesture.
 * @param style - Which built-in cue to play.
 */
function playTones(style: 'ding' | 'chime' | 'blip'): void {
  try {
    const scope = window as unknown as {
      AudioContext?: new () => never
      webkitAudioContext?: new () => never
    }
    const Ctor = scope.AudioContext ?? scope.webkitAudioContext
    if (Ctor === undefined) return
    audioContext ??= new Ctor() as unknown as typeof audioContext
    const audio = audioContext
    if (audio === null) return
    if (audio.state === 'suspended') void audio.resume?.()
    for (const tone of TONES[style]) {
      const oscillator = audio.createOscillator()
      const gain = audio.createGain()
      oscillator.type = 'sine'
      oscillator.frequency.value = tone.hz
      const at = audio.currentTime + tone.at
      gain.gain.setValueAtTime(0.0001, at)
      gain.gain.exponentialRampToValueAtTime(0.16, at + 0.03)
      gain.gain.exponentialRampToValueAtTime(0.0001, at + TONE_SECONDS - 0.03)
      oscillator.connect(gain)
      gain.connect(audio.destination)
      oscillator.start(at)
      oscillator.stop(at + TONE_SECONDS)
    }
  } catch (error: unknown) {
    logError('cue', error)
  }
}

/**
 * Play the cue configured for a finished turn, if any.
 *
 * A hidden page plays nothing: the user cannot hear a background tab, and some
 * browsers suspend its audio context anyway.
 * @param style - Configured completion cue.
 */
function playCompletionCue(style: CompletionSound): void {
  if (style === 'off') return
  if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return
  playTones(style)
}

/** Page-visible clock text, used by the card copy. */
function clockText(): string {
  const date = new Date()
  const hour = date.getHours()
  const minute = String(date.getMinutes()).padStart(2, '0')
  return `${String(hour).padStart(2, '0')}:${minute}`
}

/** Properties the crash card needs; kept here so it renders without plugin CSS. */
const ERROR_CSS = [
  '.dts-crash{position:fixed;right:24px;bottom:24px;box-sizing:border-box;width:280px;padding:12px;',
  'border-radius:14px;background:var(--dsw-alias-bg-overlay);color:var(--dsw-alias-label-primary);',
  'border:1px solid var(--dsw-alias-border-l1);box-shadow:0 12px 28px rgba(0,0,0,.22);',
  'font-family:inherit;font-size:12px;line-height:1.45;z-index:2147483000}',
  '.dts-crash__title{font-weight:600;color:var(--dsw-alias-label-secondary);margin-bottom:6px}',
  '.dts-crash__notice{padding:5px 8px;border-radius:8px;background:var(--dsw-alias-bg-layer-2);',
  'color:var(--dsw-alias-state-error-primary);word-break:break-word}',
].join('')

/**
 * Build the chip boundary. The class expression lives inside the factory
 * because it extends `React.Component`, which only exists after
 * {@link bindPlatform} ran.
 * @param useView - Subscribe hook for the plugin store.
 * @returns The boundary component.
 */
function createChipBoundary(useView: UseView): ElementType {
  const { Component } = React
  return class ThemeSleepChipBoundary extends Component<Record<string, never>, { error: unknown }> {
    override state: { error: unknown } = { error: null }

    static getDerivedStateFromError(error: unknown): { error: unknown } {
      return { error }
    }

    override componentDidCatch(error: unknown): void {
      logError('chip render', error)
    }

    override render(): ReactNS.ReactNode {
      if (this.state.error === null) return h(Chip, { useView, text })
      const message = this.state.error instanceof Error ? this.state.error.message : String(this.state.error)
      const card = h(
        'div',
        { className: 'dts-crash' },
        h('style', { dangerouslySetInnerHTML: { __html: ERROR_CSS } }),
        h('div', { className: 'dts-crash__title' }, text('chip.title')),
        h('div', { className: 'dts-crash__notice' }, text('error.render') + message),
        h(
          'button',
          {
            type: 'button',
            className: 'dts-btn',
            onClick: () => { this.setState({ error: null }) },
          },
          text('error.retry'),
        ),
      )
      return card
    }
  }
}

/**
 * Build the bedtime-card boundary so an error inside the card cannot blank the
 * app: it renders nothing and leaves the chip reporting state.
 * @param useView - Subscribe hook for the plugin store.
 * @param actions - User answers the card raises.
 * @returns The boundary component.
 */
function createCardBoundary(
  useView: UseView,
  actions: {
    snooze(): void
    dismiss(): void
    openSettings(): void
  },
): ElementType {
  const { Component } = React
  return class ThemeSleepCardBoundary extends Component<Record<string, never>, { error: unknown }> {
    override state: { error: unknown } = { error: null }

    static getDerivedStateFromError(error: unknown): { error: unknown } {
      return { error }
    }

    override componentDidCatch(error: unknown): void {
      logError('reminder card render', error)
    }

    override render(): ReactNS.ReactNode {
      if (this.state.error !== null) return null
      return h(ReminderCard, { useView, text, actions, clock: clockText })
    }
  }
}

const sink = (window as unknown as { __ModuleLoader__?: ModuleLoaderSink }).__ModuleLoader__
if (sink === undefined) {
  throw new Error(`${MODULE_ID}: window.__ModuleLoader__ is missing (booted outside the web shell?)`)
}

sink.load({
  id: MODULE_ID,
  factory(require_) {
    bindPlatform(require_)

    const module = { exports: {} as ClientModuleExports }
    const exports = module.exports
    const inject = ['slots', 'locale', 'theme', 'configForms']

    function apply(ctx: PluginContext): void {
      const nowMs = (): number => Date.now()
      ctx.effect(
        () => ctx.locale.register(NS, { zh, en } as unknown as Record<string, Record<string, unknown>>),
        'theme-sleep: dictionaries',
      )
      try {
        const bound = ctx.locale.bind(NS)
        translate = (key, params) => String(bound(key, params))
      } catch (error: unknown) {
        logError('locale bind', error)
      }
      bindLocale(translate)

      let settings: ThemeSleepSettings = DEFAULT_SETTINGS
      let settingsReady = false
      const engine = new ReminderEngine(undefined, nowMs())
      const store = new ViewStore({
        settings,
        expected: 'light',
        active: 'light',
        overridden: false,
        overrideUntil: 0,
        boundary: { theme: 'dark', at: nowMs() },
        reminder: { mode: 'idle', dayKey: localDayKey(nowMs()) },
        notification: notificationPermission(),
        settingsReady: false,
        switchInMs: 0,
      })
      const useView = makeUseView(store)

      // ---- theme driver -------------------------------------------------
      /**
       * Instant the user's hand-picked theme stops winning, or `undefined` when
       * no manual choice is active. A choice made while the override window is
       * `0` is never recorded; a `Infinity` deadline means it holds until the
       * next period boundary.
       */
      let overrideUntil: number | undefined
      /** Window length in force when the current override started, in minutes. */
      let overrideMinutesApplied = 0
      /** Color scheme the last write actually produced, or null when it is stale. */
      let ownWriteApplied: 'light' | 'dark' | null = null
      let ownWriteAt = 0

      // Durable browser state, restored after the bookkeeping it feeds exists: the
      // occurrence already shown today (so a reload at 23:40 does not re-fire), a
      // live snooze deadline, a manual-theme window that is still open, and a copy
      // of the last accepted settings (so a shell without the settings transport
      // still starts from the user's rule rather than the defaults).
      const stored = loadStoredState()
      engine.hydrate({
        ...(stored.firedDay === undefined ? {} : { firedDay: stored.firedDay }),
        ...(stored.snoozeUntil === undefined ? {} : { snoozeUntil: stored.snoozeUntil }),
      })
      if (stored.settings !== undefined) {
        settings = normalizeSettings(stored.settings)
        store.update({ settings })
      }
      // Restored after the cached settings, so the recorded window is the one the
      // override actually ran under; restoring first would record the default and
      // a later lowering of the window would not shorten it.
      if (stored.overrideUntil !== undefined && stored.overrideUntil > nowMs()) {
        overrideUntil = stored.overrideUntil
        overrideMinutesApplied = settings.manualOverrideMinutes
      }
      /** Suppresses the override bookkeeping for the plugin's own write. */
      let applyingTheme = false

      const readActive = (): 'light' | 'dark' => {
        try {
          return ctx.theme.getTheme().active.colorScheme
        } catch (error: unknown) {
          logError('theme read', error)
          return store.get().active
        }
      }

      /**
       * Deadline for a manual theme choice made at `now`, or `undefined` when
       * the override window is disabled (`manualOverrideMinutes === 0`).
       */
      const overrideDeadline = (now: number, rule: ThemeRule): number | undefined => {
        const minutes = settings.manualOverrideMinutes
        if (!Number.isFinite(minutes) || minutes <= 0) return undefined
        // The configured upper bound means "until the next switch", and a window
        // longer than the time left in this period ends at the switch too: both
        // resolve to the boundary instant, a finite deadline the expiry check
        // below can actually reach.
        const boundaryAt = themePhase(now, rule).boundary.at
        if (minutes >= MAX_MANUAL_OVERRIDE_MINUTES) return boundaryAt
        return Math.min(now + minutes * 60_000, boundaryAt)
      }

      /**
       * Apply the rule, holding off only while a fresh manual choice wins, then
       * publish the state every surface reads.
       */
      const syncTheme = (now: number): void => {
        const rule = themeRuleOf(settings)
        const phase = themePhase(now, rule)
        const active = readActive()
        // The pending write's intent is only "fresh" while the runtime still
        // shows the theme it produced; a runtime that has moved on invalidates it.
        const freshOwnWrite = ownWriteApplied !== null
          && now - ownWriteAt < OWN_WRITE_WINDOW_MS
          && active === ownWriteApplied
        if (!freshOwnWrite) ownWriteApplied = null
        // Shortening the window must shorten a live override too, or the option
        // would keep its own promise ("follow the rule right away") only for
        // choices made after the change.
        const configuredWindow = settings.manualOverrideMinutes
        if (overrideUntil !== undefined && configuredWindow < overrideMinutesApplied) {
          // Clamp to the EARLIER of the recomputed deadline and the one already
          // running: recomputing from `now` on every tick would push the
          // deadline forward forever and the override could never expire.
          const shortened = Math.min(now + Math.max(configuredWindow, 0) * 60_000, phase.boundary.at)
          overrideUntil = Math.min(overrideUntil, shortened)
          overrideMinutesApplied = configuredWindow
        }
        if (overrideUntil !== undefined && now >= overrideUntil) {
          overrideUntil = undefined
          overrideMinutesApplied = 0
        }
        const overridden = overrideUntil !== undefined && active !== phase.theme
        if (!overridden && active !== phase.theme) {
          applyingTheme = true
          try {
            ownWriteApplied = phase.theme
            ownWriteAt = now
            ctx.theme.setTheme(phase.theme)
          } catch (error: unknown) {
            logError('theme write', error)
          } finally {
            applyingTheme = false
          }
        }
        store.update({
          expected: phase.theme,
          active: readActive(),
          overridden,
          overrideUntil: overridden && overrideUntil !== undefined ? overrideUntil : 0,
          boundary: { theme: phase.boundary.theme, at: phase.boundary.at },
          switchInMs: phase.remainingMs,
        })
      }

      /**
       * Decide who moved the theme.
       *
       * The plugin's own write — and a deferred republication of it — is
       * absorbed; anything else is the user's choice, held for the configured
       * window before the rule takes over again.
       */
      const onThemeChange = (): void => {
        try {
          if (applyingTheme) return
          const now = nowMs()
          const snapshot = ctx.theme.getTheme()
          const rule = themeRuleOf(settings)
          const phase = themePhase(now, rule)
          if (ownWriteApplied !== null && snapshot.active.colorScheme === ownWriteApplied
            && Math.abs(now - ownWriteAt) <= OWN_WRITE_WINDOW_MS) {
            // Our own write, observed (a synchronous publish during the call, or
            // a late one). Drop the intent so a later identical user choice is
            // not mistaken for it, and leave the period bookkeeping alone.
            ownWriteApplied = null
            syncTheme(now)
            return
          }
          if (snapshot.active.colorScheme !== phase.theme) {
            const deadline = overrideDeadline(now, rule)
            // A disabled window has nothing to remember, so the expiry path runs
            // and the sync below re-asserts the rule.
            overrideUntil = deadline ?? Number.NEGATIVE_INFINITY
            overrideMinutesApplied = deadline === undefined ? 0 : settings.manualOverrideMinutes
          }
          syncTheme(now)
        } catch (error: unknown) {
          logError('theme change', error)
        }
      }

      /**
       * Adapt `uiSession.sessionStatus` to the completion engine's source.
       *
       * A service that publishes a bare map still works: the snapshot reader
       * returns it and the subscription is a no-op, which degrades to "the cue
       * fires only when something else publishes".
       */
      const runningSource = (): RunningSource | null => {
        const status = ctx.uiSession?.sessionStatus
        if (status === undefined || status === null) return null
        const read = (): RunningSnapshot => (
          typeof (status as SessionStatusSourceView).getSnapshot === 'function'
            ? (status as SessionStatusSourceView).getSnapshot!()
            : status as RunningSnapshot
        )
        const subscribe = typeof (status as SessionStatusSourceView).subscribe === 'function'
          ? (listener: () => void): Disposer => (status as SessionStatusSourceView).subscribe!(listener)
          : (): Disposer => () => {}
        return {
          getSnapshot: () => read(),
          subscribe,
        }
      }

      // ---- reminder driver ----------------------------------------------
      let cardWasShowing = false
      /**
       * Alert already announced: `dayKey` for the daily occurrence, and
       * `dayKey:snooze:<deadline>` for a snooze replay so each cycle on that day
       * is its own alert. A backwards clock jump can make the engine report the
       * same day again; keying the alert prevents announcing it twice.
       */
      let announcedKey: string | null = null
      const alertKeyOf = (state: ReminderState): string => (
        // The daily occurrence is one alert per day; each snooze cycle on that
        // day is its own alert, keyed by the deadline it was postponed to.
        state.mode === 'snoozed'
          ? `${state.dayKey}:snooze:${String(state.snoozeUntil ?? 0)}`
          : state.dayKey
      )
      const publishReminder = (state: ReminderState, celebrate: boolean): void => {
        const showing = state.mode !== 'idle'
        const alertKey = alertKeyOf(state)
        if (celebrate && showing && !cardWasShowing && announcedKey !== alertKey) {
          showSystemNotification(text('reminder.title'), text('reminder.body', { time: clockText() }))
          if (settings.soundEnabled) playTones('chime')
          announcedKey = alertKey
        }
        cardWasShowing = showing
        store.update({ reminder: state, notification: notificationPermission() })
      }

      /**
       * Write the reminder bookkeeping now.
       *
       * Called on every tick and on every user answer: the answer must be durable
       * before the next tick, or a tab closed within one poll interval of
       * dismissing would reload an answered snooze and show the card again.
       * A field that must go away is named in `reset`, because the store merges.
       */
      const persistReminderState = (): void => {
        const snoozeUntil = engine.pendingSnoozeUntil()
        saveStoredState(
          {
            firedDay: engine.firedDay(),
            ...(snoozeUntil === undefined ? {} : { snoozeUntil }),
            ...(overrideUntil === undefined ? {} : { overrideUntil }),
          },
          {
            ...(snoozeUntil === undefined ? { snoozeUntil: true } : {}),
            ...(overrideUntil === undefined ? { overrideUntil: true } : {}),
          },
        )
      }

      const syncReminder = (now: number, announce: boolean): void => {
        engine.setEnabled(settings.reminderEnabled)
        publishReminder(engine.tick(settings, now), announce)
        persistReminderState()
      }

      // ---- settings ------------------------------------------------------
      let form: ConfigFormView | null = null
      const adoptSettings = (raw: unknown, ready: boolean): void => {
        settings = normalizeSettings(raw)
        settingsReady = settingsReady || ready
        store.update({ settings, settingsReady })
        if (ready) saveStoredState({ settings: { ...settings } })
      }

      const persist = (patch: Partial<ThemeSleepSettings>): void => {
        settings = normalizeSettings({ ...settings, ...patch })
        store.update({ settings })
        saveStoredState({ settings: { ...settings } })
        const now = nowMs()
        syncTheme(now)
        syncReminder(now, true)
        const target = form
        if (target === null) return
        for (const [field, value] of Object.entries(patch)) {
          void target.set(field, value).catch((error: unknown) => { logError(`settings write ${field}`, error) })
        }
      }

      const requestNotifications = (): void => {
        void requestNotificationPermission().then(permission => {
          store.update({ notification: permission })
        })
      }

      // ---- surfaces ------------------------------------------------------
      const openSettings = (): void => {
        try {
          ctx.layout?.selectPanel?.('settings')
        } catch (error: unknown) {
          logError('open settings', error)
        }
      }

      const actions = {
        snooze(): void {
          publishReminder(engine.snooze(settings, nowMs()), false)
          persistReminderState()
        },
        dismiss(): void {
          publishReminder(engine.dismiss(nowMs()), false)
          persistReminderState()
        },
        openSettings,
      }

      ctx.slots.inject('conversation.composer.dock', () => ctx.slots.register(
        { name: 'conversation.composer.dock', id: CHIP_SLOT_ID, order: 40 },
        createChipBoundary(useView),
      ))

      ctx.slots.inject('settings.general.item', () => ctx.slots.register(
        {
          name: 'settings.general.item',
          id: SETTINGS_SLOT_ID,
          order: 25,
          locale: NS,
          inject: () => ({
            useView,
            text,
            persist,
            settingsReady,
            requestNotifications,
          }),
        },
        SettingsRow,
      ))

      // ---- lifecycle -----------------------------------------------------
      ctx.effect(() => {
        const style = document.createElement('style')
        style.setAttribute('data-dsh-theme-sleep', 'styles')
        style.textContent = UI_STYLES
        document.head.appendChild(style)
        return () => { style.remove() }
      }, 'theme-sleep: stylesheet')

      ctx.effect(() => {
        const host = document.createElement('div')
        host.setAttribute('data-dsh-theme-sleep', 'reminder-root')
        document.body.appendChild(host)
        const { createRoot } = require_('react-dom/client') as {
          createRoot(element: Element): { render(node: unknown): void; unmount(): void }
        }
        const root = createRoot(host)
        root.render(h(createCardBoundary(useView, actions)))
        return () => {
          try {
            root.unmount()
          } catch (error: unknown) {
            logError('reminder unmount', error)
          }
          host.remove()
        }
      }, 'theme-sleep: reminder card root')

      ctx.effect(() => {
        const onResume = (): void => {
          const now = nowMs()
          syncTheme(now)
          syncReminder(now, true)
        }
        document.addEventListener('visibilitychange', onResume)
        window.addEventListener('focus', onResume)
        return () => {
          document.removeEventListener('visibilitychange', onResume)
          window.removeEventListener('focus', onResume)
        }
      }, 'theme-sleep: resume hooks')

      ctx.effect(() => ctx.on('theme/change', onThemeChange), 'theme-sleep: theme/change listener')

      ctx.effect(() => {
        const source = runningSource()
        if (source === null) {
          logError('completion watch', 'the uiSession service is unavailable; a finished turn has no cue')
          return
        }
        const watch = new CompletionWatch(source, () => { playCompletionCue(settings.completionSound) })
        watch.start()
        return () => { watch.stop() }
      }, 'theme-sleep: completion cue')

      ctx.effect(() => {
        let disposed = false
        let timer: Disposer | null = null
        // `timer` is the cordis client runtime's disposable interval helper;
        // a shell without it falls back to a plain timeout with the same cleanup.
        const scheduleTimeout = (callback: () => void, delay: number): Disposer => {
          try {
            if (typeof ctx.timer?.timeout === 'function') return ctx.timer.timeout(callback, delay)
          } catch (error: unknown) {
            logError('timer service', error)
          }
          const handle = setTimeout(callback, delay)
          return () => { clearTimeout(handle) }
        }
        const schedule = (delay: number): void => {
          if (disposed) return
          timer = scheduleTimeout(() => {
            timer = null
            tick()
          }, Math.max(0, Math.min(delay, THEME_POLL_MS)))
        }
        const tick = (): void => {
          if (disposed) return
          const now = nowMs()
          syncTheme(now)
          syncReminder(now, true)
          const themeDelay = Math.max(0, store.get().boundary.at - now)
          const reminderDelay = engine.msUntilNextCheck(settings, now)
          schedule(Math.min(themeDelay, reminderDelay, THEME_POLL_MS))
        }
        schedule(0)
        return () => {
          disposed = true
          timer?.()
          timer = null
        }
      }, 'theme-sleep: watch timer')

      ctx.effect(() => {
        let active = true
        let dispose: Disposer | null = null
        try {
          const acquired = ctx.configForms.get(ENTRY_ID)
          form = acquired
          const read = (): void => {
            if (!active) return
            const snapshot = acquired.getSnapshot()
            const ready = snapshot.status === 'ready'
            adoptSettings(snapshot.value, ready)
            if (ready) engine.setWatcherStart(nowMs())
            const now = nowMs()
            syncTheme(now)
            syncReminder(now, false)
          }
          read()
          dispose = acquired.subscribe(read)
          return () => {
            active = false
            form = null
            dispose?.()
          }
        } catch (error: unknown) {
          // Without the transport the plugin still runs on defaults.
          logError('settings form', error)
          adoptSettings(undefined, false)
          const now = nowMs()
          syncTheme(now)
          syncReminder(now, false)
          return () => { active = false }
        }
      }, 'theme-sleep: settings scope')
    }

    exports.apply = apply
    exports.inject = inject
    return module.exports
  },
})
