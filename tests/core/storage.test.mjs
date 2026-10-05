/**
 * Unit tests for the durable browser store. Node has no `localStorage`, so the
 * test installs a minimal one — which is also how the module's defensive reads
 * (a throwing or absent store) get exercised.
 */
import assert from 'node:assert/strict'
import { afterEach, beforeEach, describe, it } from 'node:test'
import { STORAGE_KEY, clearStoredState, loadStoredState, saveStoredState } from '../../lib/core/storage.js'
import { normalizeSettings } from '../../lib/core/config.js'

/** A localStorage stand-in that can be made to fail on demand. */
function fakeStorage(options = {}) {
  const data = new Map()
  return {
    data,
    getItem(key) {
      if (options.failReads === true) throw new Error('read refused')
      return data.has(key) ? data.get(key) : null
    },
    setItem(key, value) {
      if (options.failWrites === true) throw new Error('write refused')
      data.set(key, value)
    },
    removeItem(key) {
      data.delete(key)
    },
  }
}

/** Install a store on the global object for one test. */
function install(store) {
  Object.defineProperty(globalThis, 'localStorage', { value: store, configurable: true, writable: true })
}

describe('stored state', () => {
  beforeEach(() => { install(fakeStorage()) })
  afterEach(() => { Reflect.deleteProperty(globalThis, 'localStorage') })

  it('round-trips the fields it owns', () => {
    assert.deepEqual(loadStoredState(), {})
    saveStoredState({ firedDay: '2026-10-03' })
    assert.deepEqual(loadStoredState(), { firedDay: '2026-10-03' })
    saveStoredState({ snoozeUntil: 1_800_000_000_000, settings: { dayStart: '07:00' } })
    assert.deepEqual(loadStoredState(), {
      firedDay: '2026-10-03',
      snoozeUntil: 1_800_000_000_000,
      settings: { dayStart: '07:00' },
    })
    clearStoredState()
    assert.deepEqual(loadStoredState(), {})
  })

  it('deletes a field the caller explicitly clears', () => {
    saveStoredState({ firedDay: '2026-10-03', snoozeUntil: 1_800_000_000_000, overrideUntil: 1_800_000_100_000 })
    saveStoredState({ firedDay: '2026-10-04' }, { snoozeUntil: true, overrideUntil: true })
    assert.deepEqual(loadStoredState(), { firedDay: '2026-10-04' })
  })

  it('round-trips the override deadline', () => {
    saveStoredState({ overrideUntil: 1_800_000_100_000 })
    assert.equal(loadStoredState().overrideUntil, 1_800_000_100_000)
  })

  it('ignores corrupt, mistyped, and foreign values', () => {
    const store = fakeStorage()
    install(store)
    store.data.set(STORAGE_KEY, '{not json')
    assert.deepEqual(loadStoredState(), {})
    store.data.set(STORAGE_KEY, JSON.stringify({ firedDay: 5, snoozeUntil: 'soon', settings: [] }))
    assert.deepEqual(loadStoredState(), {})
    store.data.set(STORAGE_KEY, JSON.stringify({ firedDay: '2026-01-01', extra: true }))
    assert.deepEqual(loadStoredState(), { firedDay: '2026-01-01' })
  })

  it('degrades to nothing when the store is absent or refuses', () => {
    Reflect.deleteProperty(globalThis, 'localStorage')
    assert.deepEqual(loadStoredState(), {})
    saveStoredState({ firedDay: '2026-10-03' })
    clearStoredState()

    install(fakeStorage({ failReads: true, failWrites: true }))
    assert.deepEqual(loadStoredState(), {})
    saveStoredState({ firedDay: '2026-10-03' })
    clearStoredState()
  })

  it('feeds the normalizer, which drops what it cannot use', () => {
    saveStoredState({ settings: { dayStart: '07:15', snoozeMinutes: 999 } })
    const restored = normalizeSettings(loadStoredState().settings)
    assert.equal(restored.dayStart, '07:15')
    assert.equal(restored.snoozeMinutes, 10)
    assert.equal(restored.reminderTime, '23:30')
  })
})
