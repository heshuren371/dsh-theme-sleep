#!/usr/bin/env node
/**
 * jsdom end-to-end smoke test for the theme-sleep Client half.
 *
 * Loads the *built* `lib/client.js` through a stubbed `window.__ModuleLoader__`
 * inside a real jsdom window, binds the exact module table the Web shell hands
 * the factory (`react`, `react-dom`, `react-dom/client`), and drives a fake
 * Cordis client context — slots, locale, theme, configForms, timers — the way
 * `src/client.ts` uses it.
 *
 *   node scripts/smoke.mjs
 *
 * What it covers:
 *   1. exactly one module registers under the package name, and the bundle
 *      touches no module-table word before its factory is called;
 *   2. `apply` registers the composer-dock chip, the General-settings row, and
 *      a `theme/change` listener;
 *   3. the light/dark period rule drives `theme.setTheme` under a mocked `Date`;
 *   4. the bedtime reminder fires at 23:31 with a ready config form, the card
 *      renders, and the missing Notification/AudioContext APIs stay no-ops;
 *   5. the settings write path persists through `inject().persist` without a
 *      redundant theme write;
 *   6. every disposer tears the plugin down and a stale timer writes nothing;
 *   7. a `loading` then schema-invalid config document normalizes without
 *      throwing.
 *
 * The bundle runs in the jsdom window's own VM context, so `window.Date` can be
 * faked before evaluation and the plugin really reads it. Dependencies resolve
 * local-first (`node_modules`) with the sibling checkout as a fallback;
 * override that fallback with `DTS_TEST_DEPS=/path/to/checkout`.
 *
 * This is a development aid and is not part of the published bundle.
 */
import { createRequire } from 'node:module'
import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const pluginDir = path.resolve(here, '..')
const bundlePath = path.join(pluginDir, 'lib', 'client.js')

if (!fs.existsSync(bundlePath)) {
  console.error(`smoke: missing ${bundlePath} — run \`pnpm run build\` first`)
  process.exit(1)
}

// ── dependencies: local node_modules first, sibling checkout as a fallback ───
const localRequire = createRequire(path.join(pluginDir, 'package.json'))
const fallbackDir = process.env.DTS_TEST_DEPS || path.resolve(pluginDir, '..', 'dsh-pomodoro')
let fallbackRequire = null

function dep(name) {
  try {
    return localRequire(name)
  } catch {
    if (fallbackRequire === null) fallbackRequire = createRequire(path.join(fallbackDir, 'package.json'))
    try {
      return fallbackRequire(name)
    } catch {
      throw new Error(
        `smoke: cannot resolve "${name}" from ${path.join(pluginDir, 'node_modules')} or ${fallbackDir}. ` +
        'Run `pnpm install`, or point DTS_TEST_DEPS at a checkout that ships the test dependencies.',
      )
    }
  }
}

const { JSDOM, VirtualConsole } = dep('jsdom')

// react-dom decides "is there a DOM?" once, when it is first required, so a
// window must exist in the Node realm before the platform packages load. Every
// harness then points these globals at its own window before any render.
const bootDom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost/' })
globalThis.window = bootDom.window
globalThis.document = bootDom.window.document
globalThis.IS_REACT_ACT_ENVIRONMENT = true

const React = dep('react')
const ReactDom = dep('react-dom')
const ReactDomClient = dep('react-dom/client')
const ReactDomServer = dep('react-dom/server')
const act = React.act

const code = fs.readFileSync(bundlePath, 'utf8')

// ── console capture ──────────────────────────────────────────────────────────
// React reports act() misuse, missing keys and invalid props through
// console.error; the plugin reports its own failures the same way. Treat both
// as defects rather than hidden noise.
const consoleErrors = []
const nativeConsoleError = console.error.bind(console)
console.error = (...args) => {
  consoleErrors.push(describe(args))
  nativeConsoleError(...args)
}

function describe(args) {
  return args
    .map(value => {
      if (typeof value === 'string') return value
      if (value instanceof Error) return value.message
      if (value !== null && typeof value === 'object' && 'message' in value) return String(value.message)
      return String(value)
    })
    .join(' ')
}

// ── assertion plumbing ───────────────────────────────────────────────────────
let passed = 0
const failures = []

function check(label, condition, detail) {
  if (condition) {
    passed += 1
    console.log(`  ok   ${label}`)
    return true
  }
  const suffix = detail === undefined ? '' : `  → ${detail}`
  failures.push(`${label}${suffix}`)
  console.log(`  FAIL ${label}${suffix}`)
  return false
}

// ── the plugin's contract, mirrored here so the smoke can assert against it ──
const MODULE_ID = '@local/dsh-theme-sleep'
const ENTRY_ID = 'theme-sleep'
const CHIP_SLOT = 'conversation.composer.dock'
const ROW_SLOT = 'settings.general.item'
const THEME_POLL_MS = 30 * 1000

/** Local wall-clock instant on 2026-10-0<day>; day 4 is the next local day. */
function msAt(hour, minute, day = 3) {
  return new Date(2026, 9, day, hour, minute, 0, 0).getTime()
}

/** The zh-placeholder interpolation `ctx.locale.bind` is expected to provide. */
function interpolate(template, params) {
  if (params === undefined) return template
  return String(template).replace(/\{(\w+)\}/g, (whole, name) => (
    params[name] === undefined ? whole : String(params[name])
  ))
}

/** Upper bound of the manual-override window: the "until the next switch" sentinel. */
const MAX_OVERRIDE = 1440

const READY_VALUE = {
  dayStart: '06:00',
  dayEnd: '19:00',
  reminderEnabled: true,
  reminderTime: '23:30',
  snoozeMinutes: 10,
  soundEnabled: true,
  manualOverrideMinutes: 30,
}

/**
 * One isolated plugin lifetime: a fresh jsdom window with a faked clock, the
 * bundle evaluated in that window's VM context, and a recording fake context.
 * @param options - Initial clock, theme, config-form snapshot, and an optional
 *   durable store the "previous page" left behind.
 * @returns Harness handles used by the scenarios.
 */
function createHarness({ now, theme = 'dark', formSnapshot, storedState }) {
  const virtualConsole = new VirtualConsole()
  virtualConsole.on('error', (...args) => { consoleErrors.push('[window] ' + describe(args)) })
  virtualConsole.on('jsdomError', error => {
    consoleErrors.push('[jsdom] ' + (error instanceof Error ? error.message : String(error)))
  })

  const dom = new JSDOM('<!doctype html><html><head></head><body><div id="root"></div></body></html>', {
    url: 'http://localhost/',
    pretendToBeVisual: true,
    runScripts: 'outside-only',
    virtualConsole,
  })
  const win = dom.window
  const doc = win.document
  const context = dom.getInternalVMContext()
  if (storedState !== undefined) {
    win.localStorage.setItem('dsh-theme-sleep/v1', JSON.stringify(storedState))
  }

  // ── mocked clock: jsdom implements no fake timers, so Date is subclassed ──
  const clock = { now }
  const RealDate = win.Date
  class FakeDate extends RealDate {
    constructor(...args) {
      if (args.length === 0) super(clock.now)
      else super(...args)
    }
    static now() { return clock.now }
  }
  FakeDate.parse = RealDate.parse
  FakeDate.UTC = RealDate.UTC
  win.Date = FakeDate

  // ── deliberately absent browser APIs, with read counters ─────────────────
  // jsdom ships neither Notification nor AudioContext. Counting reads proves
  // the best-effort paths consulted them and constructed nothing.
  const reads = { notification: 0, audio: 0 }
  Object.defineProperty(win, 'Notification', {
    configurable: true,
    get() { reads.notification += 1; return undefined },
  })
  Object.defineProperty(win, 'AudioContext', {
    configurable: true,
    get() { reads.audio += 1; return undefined },
  })
  Object.defineProperty(win, 'webkitAudioContext', {
    configurable: true,
    get() { reads.audio += 1; return undefined },
  })

  // ── recording fake plugin context ────────────────────────────────────────
  const noop = () => {}
  const state = {
    loads: [],
    required: [],
    effects: [],
    listeners: new Map(),
    localeNamespace: null,
    dictionaries: null,
    injections: [],
    registrations: [],
    themeCalls: [],
    formIds: [],
    formWrites: [],
    timers: [],
    errors: [],
  }

  const THEMES = [
    { id: 'light', colorScheme: 'light' },
    { id: 'dark', colorScheme: 'dark' },
  ]
  let preference = theme
  let revision = 1

  const snapshot = () => ({
    preference,
    active: THEMES.find(candidate => candidate.id === preference) ?? THEMES[0],
    themes: THEMES,
    revision,
  })

  /** Publish a snapshot exactly like the runtime's `theme/change` emit. */
  const publish = () => {
    revision += 1
    const next = snapshot()
    for (const listener of [...(state.listeners.get('theme/change') ?? [])]) {
      try {
        listener(next)
      } catch (error) {
        state.errors.push(error)
      }
    }
  }

  /** `ctx.theme.setTheme`: unknown ids throw, a same-preference call is a no-op. */
  const setTheme = id => {
    if (!THEMES.some(candidate => candidate.id === id)) throw new Error(`theme "${id}" is not registered`)
    const previous = preference
    state.themeCalls.push({ id, previous, changed: previous !== id })
    if (previous === id) return
    preference = id
    publish()
  }

  /** A theme change the user made by hand: records no plugin write. */
  const userSetTheme = id => {
    if (!THEMES.some(candidate => candidate.id === id)) throw new Error(`theme "${id}" is not registered`)
    preference = id
    publish()
  }

  let formValue = formSnapshot
  const formListeners = new Set()
  const form = {
    getSnapshot: () => formValue,
    subscribe(listener) {
      formListeners.add(listener)
      return () => { formListeners.delete(listener) }
    },
    set(field, value) {
      state.formWrites.push({ field, value })
      return Promise.resolve(true)
    },
    /** Test-side: replace the accepted section and notify subscribers. */
    emit(next) {
      formValue = next
      for (const listener of [...formListeners]) listener()
    },
  }

  const ctx = {
    effect(callback) {
      const dispose = callback()
      const owned = typeof dispose === 'function' ? dispose : noop
      state.effects.push(owned)
      return owned
    },
    on(event, listener) {
      const list = state.listeners.get(event) ?? []
      list.push(listener)
      state.listeners.set(event, list)
      return () => {
        const index = list.indexOf(listener)
        if (index >= 0) list.splice(index, 1)
      }
    },
    locale: {
      register(namespace, dictionaries) {
        state.localeNamespace = namespace
        state.dictionaries = dictionaries
        return noop
      },
      bind() {
        return (key, params) => {
          const dictionary = state.dictionaries?.zh ?? {}
          const template = typeof dictionary[key] === 'string' ? dictionary[key] : key
          return interpolate(template, params)
        }
      },
    },
    slots: {
      // The real service wraps the callback in `ctx.effect`, so the registration
      // disposer is plugin-owned; mirror that instead of dropping it.
      inject(owner, callback) {
        state.injections.push(owner)
        const dispose = callback()
        const owned = typeof dispose === 'function' ? dispose : noop
        state.effects.push(owned)
        return owned
      },
      register(options, component) {
        const entry = { name: options.name, options, component, live: true }
        state.registrations.push(entry)
        return () => { entry.live = false }
      },
    },
    theme: {
      getTheme: () => snapshot(),
      setTheme,
    },
    configForms: {
      get(entryId) {
        state.formIds.push(entryId)
        return form
      },
    },
    timer: {
      timeout(callback, delay) {
        const record = { callback, delay, cancelled: false }
        state.timers.push(record)
        return () => { record.cancelled = true }
      },
    },
    layout: { selectPanel: noop },
  }

  // ── harness operations ───────────────────────────────────────────────────
  function pointGlobals() {
    globalThis.window = win
    globalThis.document = doc
  }

  /** Run React work inside `act` with the platform globals on this window. */
  async function run(fn) {
    pointGlobals()
    return act(async () => fn())
  }

  /** Evaluate the built bundle in this window and collect its registrations. */
  function evaluate() {
    win.__ModuleLoader__ = {
      load(definition) { state.loads.push(definition) },
    }
    vm.runInContext(code, context, { filename: 'lib/client.js' })
    return state.loads
  }

  /** Call the registered factory with the shell's module table. */
  function instantiate() {
    if (state.loads.length !== 1) {
      throw new Error(`expected exactly one module registration, got ${state.loads.length}`)
    }
    return state.loads[0].factory(specifier => {
      state.required.push(specifier)
      if (specifier === 'react') return React
      if (specifier === 'react-dom') return ReactDom
      if (specifier === 'react-dom/client') return ReactDomClient
      throw new Error(`unexpected require: ${specifier}`)
    })
  }

  async function applyWith(mod) {
    try {
      await run(() => mod.apply(ctx))
      return null
    } catch (error) {
      state.errors.push(error)
      return error
    }
  }

  function latestTimer() {
    for (let index = state.timers.length - 1; index >= 0; index -= 1) {
      const record = state.timers[index]
      if (!record.cancelled) return record
    }
    return undefined
  }

  async function fire(record) {
    if (record === undefined) throw new Error('smoke: no scheduled timer to fire')
    await run(() => { record.callback() })
  }

  /** Mount a component on a real React root so hooks run for real. */
  async function mountComponent(component, props) {
    const host = doc.createElement('div')
    host.setAttribute('data-smoke', 'mount')
    doc.body.appendChild(host)
    const root = ReactDomClient.createRoot(host)
    await run(() => { root.render(React.createElement(component, props)) })
    return {
      host,
      html: () => host.innerHTML,
      text: () => host.textContent ?? '',
      async unmount() {
        await run(() => root.unmount())
        host.remove()
      },
    }
  }

  /**
   * Mount a hookless probe that re-renders on every store change, capturing the
   * live plugin snapshot through a surface's own `useView` hook.
   */
  async function captureLiveState(useView) {
    const host = doc.createElement('div')
    doc.body.appendChild(host)
    const root = ReactDomClient.createRoot(host)
    let latest = null
    function Probe() {
      latest = useView(current => current)
      return null
    }
    await run(() => { root.render(React.createElement(Probe)) })
    return {
      get: () => latest,
      async unmount() {
        await run(() => root.unmount())
        host.remove()
      },
    }
  }

  /** Run every recorded disposer in reverse (Cordis teardown order). */
  async function disposeAll() {
    const errors = []
    for (const dispose of [...state.effects].reverse()) {
      try {
        await run(() => dispose())
      } catch (error) {
        errors.push(error)
      }
    }
    state.effects.length = 0
    return errors
  }

  const themeIds = () => state.themeCalls.map(call => call.id)
  const registration = name => state.registrations.find(entry => entry.name === name)
  const setNow = value => { clock.now = value }
  const reminderHost = () => doc.querySelector('[data-dsh-theme-sleep="reminder-root"]')

  // Test-driven mutations go through `act` too, otherwise React warns about the
  // store updates they cause (the runtime itself always mutates from a tick).
  const emitForm = async next => { await run(() => form.emit(next)) }
  const changeTheme = async id => { await run(() => userSetTheme(id)) }

  return {
    dom, win, doc, ctx, state, reads, form,
    evaluate, instantiate, applyWith, latestTimer, fire, mountComponent,
    captureLiveState, disposeAll, themeIds, registration, setNow, reminderHost,
    emitForm, changeTheme, run,
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// Scenarios
// ═════════════════════════════════════════════════════════════════════════════

// ── [1] registration, light/dark rule, write path, override window, disposal ──
console.log('\n[1] registration, period rule, write path, override window, disposal')
{
  const h = createHarness({
    now: msAt(12, 0),
    theme: 'dark',
    formSnapshot: { status: 'loading', writable: true },
  })
  try {
    const loadCountBefore = h.state.loads.length
    h.evaluate()
    check('exactly one module registers', h.state.loads.length === loadCountBefore + 1, String(h.state.loads.length))
    check('module id is the package name', h.state.loads[0]?.id === MODULE_ID, String(h.state.loads[0]?.id))
    check(
      'the bundle touched no module-table word before its factory ran',
      h.state.required.length === 0,
      JSON.stringify(h.state.required),
    )

    const mod = h.instantiate()
    check('bind-time pulls exactly react', h.state.required.join(',') === 'react', h.state.required.join(','))
    check(
      'exports.inject is the declared service list',
      Array.isArray(mod.inject) && mod.inject.includes('theme') && mod.inject.includes('configForms'),
      JSON.stringify(mod.inject),
    )

    const applyError = await h.applyWith(mod)
    check('apply resolves without throwing', applyError === null, applyError && String(applyError.stack ?? applyError))

    const chip = h.registration(CHIP_SLOT)
    const row = h.registration(ROW_SLOT)
    check('chip registered into conversation.composer.dock', chip !== undefined && chip.options.id === 'theme-sleep-chip', JSON.stringify(chip?.options?.id))
    check('settings row registered into settings.general.item', row !== undefined && row.options.id === 'theme-sleep-row', JSON.stringify(row?.options?.id))
    check(
      'both seats were awaited through slots.inject',
      h.state.injections.length === 2 && h.state.injections.includes(CHIP_SLOT) && h.state.injections.includes(ROW_SLOT),
      JSON.stringify(h.state.injections),
    )
    check(
      'a theme/change listener is installed',
      (h.state.listeners.get('theme/change') ?? []).length >= 1,
      String((h.state.listeners.get('theme/change') ?? []).length),
    )
    check('locale namespace registered', h.state.localeNamespace === ENTRY_ID, String(h.state.localeNamespace))
    const zh = h.state.dictionaries?.zh ?? {}
    const en = h.state.dictionaries?.en ?? {}
    check(
      'zh/en dictionaries carry the same non-empty key set',
      Object.keys(zh).length > 0 && Object.keys(en).length === Object.keys(zh).length,
      `${Object.keys(zh).length} zh / ${Object.keys(en).length} en`,
    )
    check('configForms.get used the Loader entry id', h.state.formIds.includes(ENTRY_ID), h.state.formIds.join(','))

    // 3. the light window at local 12:00 must win over the initial dark theme.
    check('light window writes light', h.themeIds().join(',') === 'light', h.themeIds().join(','))
    const first = h.latestTimer()
    check(
      'a watch timer is scheduled within the poll cap',
      first !== undefined && Number.isFinite(first.delay) && first.delay >= 0 && first.delay <= THEME_POLL_MS,
      JSON.stringify(first?.delay),
    )
    check('plugin stylesheet injected', h.doc.querySelector('style[data-dsh-theme-sleep="styles"]') !== null)
    check('reminder card root mounted', h.reminderHost() !== null)
    check('reminder card stays empty while idle', (h.reminderHost()?.innerHTML ?? '').length === 0)

    // A ready config form is adopted without rewriting the unchanged period.
    await h.emitForm({ status: 'ready', value: { ...READY_VALUE }, writable: true, revision: 4 })
    check('adopting a ready form keeps the period write', h.themeIds().join(',') === 'light', h.themeIds().join(','))

    // The live store makes the override bookkeeping observable (not just writes).
    const live = await h.captureLiveState(row.options.inject().useView)

    // 5. the direct write path: persist through the row's inject face.
    const rowProps = row.options.inject()
    check(
      'the inject face exposes the live settings face',
      typeof rowProps.useView === 'function' &&
        typeof rowProps.persist === 'function' &&
        rowProps.text('chip.title') === zh['chip.title'] &&
        rowProps.settingsReady === true,
      JSON.stringify({ text: rowProps.text('chip.title'), ready: rowProps.settingsReady }),
    )
    await h.run(() => rowProps.persist({ reminderEnabled: false }))
    check(
      'persist recorded form.set("reminderEnabled", false)',
      h.state.formWrites.some(write => write.field === 'reminderEnabled' && write.value === false),
      JSON.stringify(h.state.formWrites),
    )
    check('an unchanged light period causes no extra setTheme', h.themeIds().join(',') === 'light', h.themeIds().join(','))

    // The registered chip renders for real (real store, real useSyncExternalStore).
    const chipMount = await h.mountComponent(chip.component)
    check('the registered chip renders with the live store', chipMount.html().length > 0, chipMount.html().slice(0, 120))
    await chipMount.unmount()

    // 3 (dark half): local 22:00 must flip the still-light runtime to dark.
    h.setNow(msAt(22, 0))
    await h.fire(h.latestTimer())
    check('dark window writes dark', h.themeIds().join(',') === 'light,dark', h.themeIds().join(','))

    // A theme the user picked by hand wins for the configured window only.
    await h.changeTheme('light')
    check('a manual change is not fought immediately', h.themeIds().join(',') === 'light,dark', h.themeIds().join(','))
    h.setNow(msAt(22, 5))
    await h.fire(h.latestTimer())
    check('the manual choice holds inside its window', h.themeIds().join(',') === 'light,dark', h.themeIds().join(','))
    h.setNow(msAt(22, 31))
    await h.fire(h.latestTimer())
    check('the rule re-asserts after the override window', h.themeIds().join(',') === 'light,dark,dark', h.themeIds().join(','))

    // The longest window ("until the next switch") must still end at the
    // boundary — a deadline that never expires would strand the theme forever.
    await h.run(() => rowProps.persist({ manualOverrideMinutes: MAX_OVERRIDE }))
    await h.changeTheme('light')
    check('[1] the longest override is recorded', live.get()?.overridden === true, JSON.stringify(live.get()?.overridden))
    check(
      '[1] the longest override reports a finite deadline at the boundary',
      Number.isFinite(live.get()?.overrideUntil) && live.get().overrideUntil > msAt(22, 45),
      JSON.stringify(live.get()?.overrideUntil),
    )
    h.setNow(msAt(22, 45))
    await h.fire(h.latestTimer())
    check('the longest override holds inside the period', live.get()?.overridden === true, JSON.stringify(live.get()?.overridden))
    // Past the 06:00 boundary the sentinel must release: an infinite deadline
    // used to leave the override (and the theme) stuck forever.
    h.setNow(msAt(6, 1, 4))
    await h.fire(h.latestTimer())
    check(
      'the longest override expires at the next boundary',
      live.get()?.overridden === false && live.get()?.active === 'light',
      JSON.stringify({ overridden: live.get()?.overridden, active: live.get()?.active }),
    )

    // The override window is configurable: 0 means the rule wins immediately.
    await h.run(() => rowProps.persist({ manualOverrideMinutes: 0 }))
    await h.changeTheme('dark')
    check('a zero override window is never recorded', live.get()?.overridden === false, JSON.stringify(live.get()?.overridden))
    check('the rule survives the rejected manual change', live.get()?.active === 'light', JSON.stringify(live.get()?.active))

    // Shortening a live override must release it on the new deadline, not the old.
    await h.run(() => rowProps.persist({ manualOverrideMinutes: 30 }))
    await h.changeTheme('dark')
    check('[1] a fresh override starts on the configured window', live.get()?.overridden === true, JSON.stringify(live.get()?.overridden))
    const longDeadline = live.get()?.overrideUntil ?? 0
    await h.run(() => rowProps.persist({ manualOverrideMinutes: 1 }))
    check(
      'lowering the window shortens the live deadline',
      (live.get()?.overrideUntil ?? 0) < longDeadline,
      `${String(longDeadline)} → ${String(live.get()?.overrideUntil)}`,
    )
    // Day 4, well past the shortened 06:02 deadline.
    h.setNow(msAt(6, 40, 4))
    await h.fire(h.latestTimer())
    check(
      'lowering the window releases the override early',
      live.get()?.overridden === false && live.get()?.active === 'light',
      JSON.stringify({ overridden: live.get()?.overridden, active: live.get()?.active }),
    )
    await h.run(() => rowProps.persist({ manualOverrideMinutes: 30 }))
    await live.unmount()

    // 6. disposal.
    const disposeErrors = await h.disposeAll()
    check(
      'every disposer ran without throwing',
      disposeErrors.length === 0,
      disposeErrors.map(error => String(error && error.stack ? error.stack : error)).join(' | '),
    )
    check('stylesheet removed with the plugin', h.doc.querySelector('style[data-dsh-theme-sleep="styles"]') === null)
    check('reminder card root removed with the plugin', h.reminderHost() === null)
    const beforeStale = h.themeIds().length
    const stale = h.state.timers[h.state.timers.length - 1]
    await h.fire(stale)
    check('a stale timer callback after disposal writes nothing', h.themeIds().length === beforeStale, `${beforeStale} → ${h.themeIds().length}`)
    check('no plugin listener errors were recorded', h.state.errors.length === 0, h.state.errors.map(String).join(' | '))
  } catch (error) {
    check('[1] scenario completed', false, String(error && error.stack ? error.stack : error))
  }
}

// ── [2] bedtime reminder, card, snooze, missing notification APIs ─────────────
console.log('\n[2] bedtime reminder, card render, snooze, no-op system notification')
{
  const h = createHarness({
    now: msAt(23, 0),
    theme: 'light',
    formSnapshot: { status: 'loading', writable: true },
  })
  try {
    h.evaluate()
    const mod = h.instantiate()
    const applyError = await h.applyWith(mod)
    check('[2] apply resolves without throwing', applyError === null, applyError && String(applyError.stack ?? applyError))
    check('[2] local 23:00 writes dark', h.themeIds().join(',') === 'dark', h.themeIds().join(','))

    const row = h.registration(ROW_SLOT)
    const live = await h.captureLiveState(row.options.inject().useView)
    check('[2] probe captured the idle store', live.get()?.reminder?.mode === 'idle', JSON.stringify(live.get()?.reminder))

    h.setNow(msAt(23, 5))
    await h.emitForm({ status: 'ready', value: { ...READY_VALUE }, writable: true, revision: 7 })
    check('[2] the ready form does not rewrite the dark period', h.themeIds().join(',') === 'dark', h.themeIds().join(','))
    check('[2] settings are reported ready', row.options.inject().settingsReady === true)

    // 23:31: the watch tick lands past the reminder time.
    h.setNow(msAt(23, 31))
    const notificationReads = h.reads.notification
    const audioReads = h.reads.audio
    let tickError = null
    try {
      await h.fire(h.latestTimer())
    } catch (error) {
      tickError = error
    }
    check('[2] the announce tick does not throw', tickError === null, tickError && String(tickError.stack ?? tickError))
    check('[2] Notification is absent in this environment', h.win.Notification === undefined)
    check(
      '[2] showSystemNotification is a no-op (API consulted, nothing constructed)',
      h.reads.notification > notificationReads && h.win.Notification === undefined,
      `reads ${notificationReads} → ${h.reads.notification}`,
    )
    check(
      '[2] the chime is a no-op with no AudioContext',
      h.reads.audio > audioReads && h.win.AudioContext === undefined,
      `reads ${audioReads} → ${h.reads.audio}`,
    )
    check('[2] the reminder tick writes no theme', h.themeIds().join(',') === 'dark', h.themeIds().join(','))

    const view = live.get()
    check('[2] the live store reports the reminder as active', view?.reminder?.mode === 'active', JSON.stringify(view?.reminder))
    check(
      '[2] the live store reports the dark period and unsupported notifications',
      view?.expected === 'dark' && view?.active === 'dark' && view?.notification === 'unsupported',
      JSON.stringify({ expected: view?.expected, active: view?.active, notification: view?.notification }),
    )

    const cardHtml = h.reminderHost()?.innerHTML ?? ''
    check('[2] the reminder card rendered after the bedtime tick', cardHtml.length > 0, `${cardHtml.length} chars`)
    check(
      '[2] the card carries localized copy',
      Object.values(h.state.dictionaries?.zh ?? {}).some(value => (
        typeof value === 'string' && value.length > 1 && cardHtml.includes(interpolate(value, { minutes: READY_VALUE.snoozeMinutes }))
      )),
      cardHtml.slice(0, 200),
    )

    const stubUseView = selector => selector(live.get())
    let rowHtml = null
    let rowError = null
    try {
      rowHtml = ReactDomServer.renderToString(
        React.createElement(row.component, { ...row.options.inject(), useView: stubUseView }),
      )
    } catch (error) {
      rowError = error
    }
    check(
      '[2] the settings row renders with the injected face and live-store stub',
      rowError === null && typeof rowHtml === 'string' && rowHtml.length > 0,
      rowError ? String(rowError.stack ?? rowError) : `"${String(rowHtml).slice(0, 120)}"`,
    )

    // 5. an expired snooze must poll, not reschedule itself at 0 ms forever.
    //    The card is driven the way a user drives it: a real click on snooze.
    const buttons = [...(h.reminderHost()?.querySelectorAll('button') ?? [])]
    const buttonTexts = buttons.map(button => button.textContent ?? '')
    const snoozeButton = buttons.find((_button, index) => (buttonTexts[index] ?? '').includes(String(READY_VALUE.snoozeMinutes)))
    check('[2] the card exposes a snooze button', snoozeButton !== undefined, JSON.stringify(buttonTexts))
    if (snoozeButton !== undefined) {
      await h.run(() => { snoozeButton.dispatchEvent(new h.win.MouseEvent('click', { bubbles: true, cancelable: true })) })
    }
    check('[2] snoozing closes the card', (h.reminderHost()?.innerHTML ?? '') === '', `${(h.reminderHost()?.innerHTML ?? '').length} chars`)
    const snoozedView = live.get()
    check(
      '[2] the store reports a pending snooze',
      typeof snoozedView?.reminder?.snoozeUntil === 'number' && snoozedView.reminder.mode === 'idle',
      JSON.stringify(snoozedView?.reminder),
    )
    h.setNow(msAt(23, 45))
    await h.fire(h.latestTimer())
    const afterSnooze = h.latestTimer()
    check(
      '[2] an expired snooze reschedules with a positive delay',
      afterSnooze !== undefined && afterSnooze.delay > 0,
      JSON.stringify(afterSnooze && afterSnooze.delay),
    )
    check('[2] the re-shown card carries the snoozed copy', (h.reminderHost()?.innerHTML ?? '').length > 0, `${(h.reminderHost()?.innerHTML ?? '').length} chars`)

    // The answer must be durable immediately: a tab closed within one poll
    // interval of dismissing must not reload the answered snooze.
    const readStore = () => JSON.parse(h.win.localStorage.getItem('dsh-theme-sleep/v1') ?? '{}')
    check(
      '[2] the snooze deadline is stored with the answer',
      typeof readStore().snoozeUntil === 'number',
      JSON.stringify(readStore()),
    )
    const dismissButton = [...(h.reminderHost()?.querySelectorAll('button') ?? [])]
      .find(button => (button.textContent ?? '') === (h.state.dictionaries?.zh?.['reminder.dismiss'] ?? ''))
    check('[2] the re-shown card exposes the dismiss button', dismissButton !== undefined, JSON.stringify(buttonTexts))
    if (dismissButton !== undefined) {
      await h.run(() => { dismissButton.dispatchEvent(new h.win.MouseEvent('click', { bubbles: true, cancelable: true })) })
    }
    check('[2] dismissing closes the card', (h.reminderHost()?.innerHTML ?? '') === '', `${(h.reminderHost()?.innerHTML ?? '').length} chars`)
    check(
      '[2] dismissing clears the stored snooze immediately',
      Object.hasOwn(readStore(), 'snoozeUntil') === false,
      JSON.stringify(readStore()),
    )
    check(
      '[2] dismissing keeps the fired day stored',
      readStore().firedDay === '2026-10-03',
      JSON.stringify(readStore()),
    )

    await live.unmount()
    const disposeErrors = await h.disposeAll()
    check('[2] teardown is clean', disposeErrors.length === 0, disposeErrors.map(String).join(' | '))
    check('[2] no plugin listener errors were recorded', h.state.errors.length === 0, h.state.errors.map(String).join(' | '))
  } catch (error) {
    check('[2] scenario completed', false, String(error && error.stack ? error.stack : error))
  }
}

// ── [3] malformed config documents normalize without throwing ────────────────
console.log('\n[3] loading → schema-invalid config documents normalize')
{
  const h = createHarness({
    now: msAt(7, 0),
    theme: 'dark',
    formSnapshot: { status: 'loading', writable: true },
  })
  try {
    h.evaluate()
    const mod = h.instantiate()
    const applyError = await h.applyWith(mod)
    check('[3] apply resolves with a loading form', applyError === null, applyError && String(applyError.stack ?? applyError))
    check('[3] defaults put local 07:00 in the light period', h.themeIds().join(',') === 'light', h.themeIds().join(','))

    let emitError = null
    try {
      await h.emitForm({
        status: 'ready',
        value: {
          dayStart: '08:30',
          dayEnd: 'nope',
          reminderEnabled: true,
          reminderTime: '25:00',
          snoozeMinutes: 999,
          soundEnabled: false,
        },
        writable: true,
        revision: 2,
      })
    } catch (error) {
      emitError = error
    }
    check('[3] a partially invalid ready section does not throw', emitError === null, emitError && String(emitError.stack ?? emitError))
    check('[3] the valid dayStart (08:30) is applied', h.themeIds().join(',') === 'light,dark', h.themeIds().join(','))

    h.setNow(msAt(9, 0))
    await h.fire(h.latestTimer())
    check('[3] local 09:00 is light again under 08:30–19:00', h.themeIds().join(',') === 'light,dark,light', h.themeIds().join(','))

    let junkError = null
    try {
      await h.emitForm({ status: 'ready', value: [], writable: true, revision: 3 })
    } catch (error) {
      junkError = error
    }
    check('[3] an entirely invalid section does not throw', junkError === null, junkError && String(junkError.stack ?? junkError))
    check('[3] junk falls back to defaults without a redundant write', h.themeIds().join(',') === 'light,dark,light', h.themeIds().join(','))

    h.setNow(msAt(5, 0, 4))
    await h.fire(h.latestTimer())
    check('[3] defaults put the next local 05:00 in the dark period', h.themeIds().join(',') === 'light,dark,light,dark', h.themeIds().join(','))

    const disposeErrors = await h.disposeAll()
    check('[3] teardown is clean', disposeErrors.length === 0, disposeErrors.map(String).join(' | '))
    check('[3] no plugin listener errors were recorded', h.state.errors.length === 0, h.state.errors.map(String).join(' | '))
  } catch (error) {
    check('[3] scenario completed', false, String(error && error.stack ? error.stack : error))
  }
}

// ── [4] a reload after the occurrence must not re-fire it ────────────────────
console.log('\n[4] reload safety: the durable store suppresses a repeat')
{
  const h = createHarness({
    now: msAt(23, 40),
    theme: 'light',
    formSnapshot: { status: 'ready', value: { ...READY_VALUE }, writable: true },
    storedState: { firedDay: '2026-10-03' },
  })
  try {
    h.evaluate()
    const mod = h.instantiate()
    const applyError = await h.applyWith(mod)
    check('[4] apply resolves with a stored state', applyError === null, applyError && String(applyError.stack ?? applyError))
    await h.fire(h.latestTimer())
    check('[4] the reminder does not re-fire on the same local day', (h.reminderHost()?.innerHTML ?? '') === '', `${(h.reminderHost()?.innerHTML ?? '').length} chars`)
    const disposeErrors = await h.disposeAll()
    check('[4] teardown is clean', disposeErrors.length === 0, disposeErrors.map(String).join(' | '))
  } catch (error) {
    check('[4] scenario completed', false, String(error && error.stack ? error.stack : error))
  }
}

// ── [5] stale durable fields and late opens stay quiet ───────────────────────
console.log('\n[5] stale durable state and a late open')
{
  // A snooze stored yesterday must not resurrect a phantom card today, and it
  // must not swallow tonight's reminder either.
  const stale = createHarness({
    now: msAt(14, 0, 4),
    theme: 'light',
    formSnapshot: { status: 'ready', value: { ...READY_VALUE }, writable: true },
    storedState: { firedDay: '2026-10-03', snoozeUntil: msAt(23, 41) },
  })
  try {
    stale.evaluate()
    const mod = stale.instantiate()
    await stale.applyWith(mod)
    await stale.fire(stale.latestTimer())
    check('[5] a previous day\'s snooze does not show a phantom card', (stale.reminderHost()?.innerHTML ?? '') === '', `${(stale.reminderHost()?.innerHTML ?? '').length} chars`)
    stale.setNow(msAt(23, 31, 4))
    await stale.fire(stale.latestTimer())
    check('[5] the evening reminder still fires after a stale snooze', (stale.reminderHost()?.innerHTML ?? '').length > 0, `${(stale.reminderHost()?.innerHTML ?? '').length} chars`)
    const disposeErrors = await stale.disposeAll()
    check('[5] teardown is clean', disposeErrors.length === 0, disposeErrors.map(String).join(' | '))
  } catch (error) {
    check('[5] stale-state scenario completed', false, String(error && error.stack ? error.stack : error))
  }

  // Two snooze cycles on one day are two alerts: the second cycle must not be
  // silent because the day key is the same.
  const repeat = createHarness({
    now: msAt(23, 0),
    theme: 'light',
    formSnapshot: { status: 'ready', value: { ...READY_VALUE }, writable: true },
  })
  try {
    repeat.evaluate()
    const mod = repeat.instantiate()
    await repeat.applyWith(mod)
    repeat.setNow(msAt(23, 31))
    await repeat.fire(repeat.latestTimer())
    const snoozeOnce = async () => {
      const button = [...(repeat.reminderHost()?.querySelectorAll('button') ?? [])]
        .find(candidate => (candidate.textContent ?? '').includes(String(READY_VALUE.snoozeMinutes)))
      check('[5] the card exposes its snooze button', button !== undefined, JSON.stringify((repeat.reminderHost()?.innerHTML ?? '').slice(0, 80)))
      if (button !== undefined) {
        await repeat.run(() => { button.dispatchEvent(new repeat.win.MouseEvent('click', { bubbles: true, cancelable: true })) })
      }
    }
    await snoozeOnce()
    const firstDeadline = JSON.parse(repeat.win.localStorage.getItem('dsh-theme-sleep/v1') ?? '{}').snoozeUntil
    repeat.setNow(msAt(23, 42))
    await repeat.fire(repeat.latestTimer())
    await snoozeOnce()
    const secondDeadline = JSON.parse(repeat.win.localStorage.getItem('dsh-theme-sleep/v1') ?? '{}').snoozeUntil
    check(
      '[5] a second snooze cycle has its own deadline',
      typeof firstDeadline === 'number' && typeof secondDeadline === 'number' && secondDeadline > firstDeadline,
      `${String(firstDeadline)} → ${String(secondDeadline)}`,
    )
    const disposeErrors = await repeat.disposeAll()
    check('[5] teardown is clean', disposeErrors.length === 0, disposeErrors.map(String).join(' | '))
  } catch (error) {
    check('[5] repeat-snooze scenario completed', false, String(error && error.stack ? error.stack : error))
  }

  // Opening at 23:40 with a 23:30 reminder: today is unspendable, so the plugin
  // must poll instead of rescheduling a 0 ms tick loop.
  const late = createHarness({
    now: msAt(23, 40),
    theme: 'light',
    formSnapshot: { status: 'ready', value: { ...READY_VALUE }, writable: true },
  })
  try {
    late.evaluate()
    const mod = late.instantiate()
    await late.applyWith(mod)
    await late.fire(late.latestTimer())
    const afterLate = late.latestTimer()
    check(
      '[5] a late open reschedules with a positive delay',
      afterLate !== undefined && afterLate.delay > 0,
      JSON.stringify(afterLate && afterLate.delay),
    )
    check('[5] a late open shows no card for the missed occurrence', (late.reminderHost()?.innerHTML ?? '') === '', `${(late.reminderHost()?.innerHTML ?? '').length} chars`)
    const disposeErrors = await late.disposeAll()
    check('[5] teardown is clean', disposeErrors.length === 0, disposeErrors.map(String).join(' | '))
  } catch (error) {
    check('[5] late-open scenario completed', false, String(error && error.stack ? error.stack : error))
  }

  // A manual theme choice outlives a reload inside its own window.
  const overridePick = msAt(23, 20, 4)
  const reloaded = createHarness({
    now: msAt(23, 25, 4),
    // The runtime still carries the user's hand-picked theme; the rule wants dark.
    theme: 'light',
    formSnapshot: { status: 'ready', value: { ...READY_VALUE }, writable: true },
    storedState: { overrideUntil: overridePick + 30 * 60 * 1000, settings: { ...READY_VALUE } },
  })
  try {
    reloaded.evaluate()
    const mod = reloaded.instantiate()
    await reloaded.applyWith(mod)
    const row = reloaded.registration(ROW_SLOT)
    const live = await reloaded.captureLiveState(row.options.inject().useView)

    check(
      '[5] a reload inside the override window keeps the choice',
      live.get()?.overridden === true,
      JSON.stringify({ overridden: live.get()?.overridden, until: live.get()?.overrideUntil }),
    )
    reloaded.setNow(msAt(23, 55, 4))
    await reloaded.fire(reloaded.latestTimer())
    check(
      '[5] the reloaded window still expires at its own deadline',
      live.get()?.overridden === false,
      JSON.stringify({ overridden: live.get()?.overridden, until: live.get()?.overrideUntil }),
    )
    await live.unmount()
    const disposeErrors = await reloaded.disposeAll()
    check('[5] teardown is clean', disposeErrors.length === 0, disposeErrors.map(String).join(' | '))
  } catch (error) {
    check('[5] reloaded-override scenario completed', false, String(error && error.stack ? error.stack : error))
  }
}

// ── [6] console hygiene ──────────────────────────────────────────────────────
console.log('\n[6] console hygiene')
{
  check('no plugin or React errors were logged', consoleErrors.length === 0, consoleErrors.join(' | '))
}

// ── verdict ──────────────────────────────────────────────────────────────────
if (failures.length > 0) {
  console.error(`\nsmoke: FAIL (${String(failures.length)} failed, ${String(passed)} passed)`)
  for (const failure of failures) console.error(`  - ${failure}`)
  process.exit(1)
}
console.log(`\nsmoke: ${String(passed)} assertions passed`)
