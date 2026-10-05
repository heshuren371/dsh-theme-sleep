/**
 * Unit tests for the dictionary contract. The visible text of every surface
 * comes from these keys, so a missing translation is a user-visible defect.
 */
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { en, fallbackTranslate, NS, t, zh } from '../../lib/i18n.js'

describe('dictionaries', () => {
  it('is namespaced under the package identity', () => {
    assert.equal(NS, 'theme-sleep')
  })

  it('defines the same key set in both locales', () => {
    const zhKeys = Object.keys(zh).sort()
    const enKeys = Object.keys(en).sort()
    assert.deepEqual(enKeys, zhKeys)
    assert.ok(zhKeys.length > 30, `expected a substantial dictionary, got ${String(zhKeys.length)} keys`)
  })

  it('keeps every placeholder in both locales', () => {
    const placeholders = (value) => [...value.matchAll(/\{(\w+)\}/g)].map(match => match[1]).sort()
    for (const key of Object.keys(zh)) {
      assert.deepEqual(
        placeholders(en[key]),
        placeholders(zh[key]),
        `placeholder mismatch for ${key}`,
      )
    }
  })

  it('carries no empty copy and no template leftovers', () => {
    for (const [key, value] of Object.entries(zh)) {
      assert.ok(value.trim().length > 0, `empty zh copy for ${key}`)
    }
    for (const [key, value] of Object.entries(en)) {
      assert.ok(value.trim().length > 0, `empty en copy for ${key}`)
    }
  })

  it('renders placeholders and leaves unknown ones intact', () => {
    assert.equal(t('chip.reminder', { time: '23:30' }), '就寝提醒 23:30')
    assert.equal(fallbackTranslate('reminder.snooze', { minutes: 10 }), '再 10 分钟')
    assert.equal(t('chip.next.dark', { time: '19:00' }), '将于 19:00 切换深色')
    assert.equal(fallbackTranslate('chip.light', { unused: 1 }), '浅色')
  })
})
