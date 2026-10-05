/**
 * Unit tests for the completion-cue engine. The source is a small fake, so every
 * case is an explicit sequence of snapshots with no browser or session involved.
 */
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { CompletionWatch } from '../../lib/core/completion.js'

/**
 * A running-state source a test drives by hand.
 * @returns the source plus the helpers that publish a new snapshot.
 */
function fakeSource(initial) {
  let snapshot = initial
  const listeners = new Set()
  return {
    getSnapshot: () => snapshot,
    subscribe(listener) {
      listeners.add(listener)
      return () => { listeners.delete(listener) }
    },
    /** Replace the snapshot and notify every listener. */
    publish(next) {
      snapshot = next
      for (const listener of [...listeners]) listener()
    },
    get listenerCount() { return listeners.size },
  }
}

/** Build a snapshot from `[id, running]` pairs. */
function snapshotOf(entries) {
  return new Map(entries.map(([id, running]) => [id, { running }]))
}

describe('CompletionWatch', () => {
  it('announces a Session that moves from running to idle', () => {
    const source = fakeSource(snapshotOf([['a', true]]))
    const seen = []
    const watch = new CompletionWatch(source, id => seen.push(id))
    watch.start()
    source.publish(snapshotOf([['a', false]]))
    assert.deepEqual(seen, ['a'])
  })

  it('treats the first snapshot as a baseline and never replays it', () => {
    const source = fakeSource(snapshotOf([['a', false]]))
    const seen = []
    const watch = new CompletionWatch(source, id => seen.push(id))
    watch.start()
    source.publish(snapshotOf([['a', false]]))
    assert.deepEqual(seen, [])
  })

  it('ignores every transition that is not running to idle', () => {
    const source = fakeSource(snapshotOf([['a', false]]))
    const seen = []
    const watch = new CompletionWatch(source, id => seen.push(id))
    watch.start()
    source.publish(snapshotOf([['a', true]])) // idle -> running
    source.publish(snapshotOf([['a', true]])) // still running
    source.publish(snapshotOf([['a', false]])) // running -> idle
    source.publish(snapshotOf([['a', false]])) // still idle
    assert.deepEqual(seen, ['a'])
  })

  it('never announces a Session it first sees idle', () => {
    const source = fakeSource(snapshotOf([['a', true]]))
    const seen = []
    const watch = new CompletionWatch(source, id => seen.push(id))
    watch.start()
    // b appears already idle: the page joined after its work finished.
    source.publish(snapshotOf([['a', true], ['b', false]]))
    assert.deepEqual(seen, [])
  })

  it('does not announce a Session that disappears from the snapshot', () => {
    const source = fakeSource(snapshotOf([['a', true]]))
    const seen = []
    const watch = new CompletionWatch(source, id => seen.push(id))
    watch.start()
    source.publish(snapshotOf([]))
    assert.deepEqual(seen, [])
  })

  it('announces every Session that completes in one snapshot', () => {
    const source = fakeSource(snapshotOf([['a', true], ['b', true]]))
    const seen = []
    const watch = new CompletionWatch(source, id => seen.push(id))
    watch.start()
    source.publish(snapshotOf([['a', false], ['b', false]]))
    assert.deepEqual(seen, ['a', 'b'])
  })

  it('folds a publish a callback makes while it runs, without announcing it', () => {
    const source = fakeSource(snapshotOf([['a', true]]))
    const seen = []
    const watch = new CompletionWatch(source, id => {
      seen.push(id)
      // A cue that publishes through the host must not re-enter the fold...
      if (seen.length === 1) source.publish(snapshotOf([['a', false], ['b', false]]))
    })
    watch.start()
    source.publish(snapshotOf([['a', false]]))
    assert.deepEqual(seen, ['a'])
    // ...and the dropped publish is folded into the baseline, so `b` completing
    // during it is never replayed on a later snapshot.
    source.publish(snapshotOf([['a', false], ['b', false]]))
    assert.deepEqual(seen, ['a'])
  })

  it('holds one subscription across repeated starts and releases it on stop', () => {
    const source = fakeSource(snapshotOf([['a', true]]))
    const seen = []
    const watch = new CompletionWatch(source, id => seen.push(id))
    assert.equal(watch.isRunning(), false)
    watch.start()
    assert.equal(watch.isRunning(), true)
    watch.start() // idempotent: no second subscription
    assert.equal(source.listenerCount, 1)
    watch.stop()
    assert.equal(watch.isRunning(), false)
    assert.equal(source.listenerCount, 0)
    source.publish(snapshotOf([['a', false]]))
    assert.deepEqual(seen, [])
  })
})
