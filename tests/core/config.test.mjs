/**
 * Unit tests for settings normalization and the resolved rule. Every input is
 * untrusted data: a hand-edited settings document, an older plugin version, or
 * a partially written patch.
 */
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  isValidTimeText, normalizeSettings, reminderSecondOf, themeRuleOf,
} from '../../lib/core/config.js'
import {
  DEFAULT_SETTINGS, MAX_MANUAL_OVERRIDE_MINUTES, MAX_SNOOZE_MINUTES, MIN_SNOOZE_MINUTES,
} from '../../lib/core/types.js'

describe('normalizeSettings', () => {
  it('returns the frozen defaults for absent or unusable input', () => {
    assert.equal(normalizeSettings(undefined), DEFAULT_SETTINGS)
    assert.equal(normalizeSettings(null), DEFAULT_SETTINGS)
    assert.equal(normalizeSettings(42), DEFAULT_SETTINGS)
    assert.equal(normalizeSettings('06:00'), DEFAULT_SETTINGS)
    assert.equal(normalizeSettings([]), DEFAULT_SETTINGS)
    assert.equal(normalizeSettings({}), DEFAULT_SETTINGS)
  })

  it('canonicalizes a valid section', () => {
    const settings = normalizeSettings({
      dayStart: '6:00', dayEnd: '19:00', reminderEnabled: false,
      reminderTime: '23:30', snoozeMinutes: 15, soundEnabled: false,
    })
    assert.deepEqual(settings, {
      dayStart: '06:00', dayEnd: '19:00', reminderEnabled: false,
      reminderTime: '23:30', snoozeMinutes: 15, soundEnabled: false,
      manualOverrideMinutes: 30,
    })
  })

  it('falls back field by field instead of failing the whole section', () => {
    const settings = normalizeSettings({
      dayStart: '25:00', dayEnd: '19:00', reminderEnabled: 'yes',
      reminderTime: 'noon', snoozeMinutes: Number.NaN, soundEnabled: 1,
      unknownKey: 'dropped',
    })
    assert.deepEqual(settings, {
      dayStart: DEFAULT_SETTINGS.dayStart,
      dayEnd: '19:00',
      reminderEnabled: DEFAULT_SETTINGS.reminderEnabled,
      reminderTime: DEFAULT_SETTINGS.reminderTime,
      snoozeMinutes: DEFAULT_SETTINGS.snoozeMinutes,
      soundEnabled: DEFAULT_SETTINGS.soundEnabled,
      manualOverrideMinutes: DEFAULT_SETTINGS.manualOverrideMinutes,
    })
    assert.equal(Object.hasOwn(settings, 'unknownKey'), false)
  })

  it('clamps the snooze delay into the supported range', () => {
    assert.equal(normalizeSettings({ snoozeMinutes: 0 }).snoozeMinutes, DEFAULT_SETTINGS.snoozeMinutes)
    assert.equal(normalizeSettings({ snoozeMinutes: MAX_SNOOZE_MINUTES + 1 }).snoozeMinutes, DEFAULT_SETTINGS.snoozeMinutes)
    assert.equal(normalizeSettings({ snoozeMinutes: MIN_SNOOZE_MINUTES }).snoozeMinutes, MIN_SNOOZE_MINUTES)
    assert.equal(normalizeSettings({ snoozeMinutes: MAX_SNOOZE_MINUTES }).snoozeMinutes, MAX_SNOOZE_MINUTES)
    assert.equal(normalizeSettings({ snoozeMinutes: 9.4 }).snoozeMinutes, 9)
  })

  it('clamps the manual-override window, keeping 0 as "no override"', () => {
    assert.equal(normalizeSettings({ manualOverrideMinutes: 0 }).manualOverrideMinutes, 0)
    assert.equal(normalizeSettings({ manualOverrideMinutes: 5 }).manualOverrideMinutes, 5)
    assert.equal(normalizeSettings({ manualOverrideMinutes: 1440 }).manualOverrideMinutes, MAX_MANUAL_OVERRIDE_MINUTES)
    assert.equal(normalizeSettings({ manualOverrideMinutes: -1 }).manualOverrideMinutes, DEFAULT_SETTINGS.manualOverrideMinutes)
    assert.equal(normalizeSettings({ manualOverrideMinutes: 9999 }).manualOverrideMinutes, DEFAULT_SETTINGS.manualOverrideMinutes)
    assert.equal(normalizeSettings({ manualOverrideMinutes: Number.NaN }).manualOverrideMinutes, DEFAULT_SETTINGS.manualOverrideMinutes)
    assert.equal(normalizeSettings({ manualOverrideMinutes: '30' }).manualOverrideMinutes, DEFAULT_SETTINGS.manualOverrideMinutes)
  })

  it('resolves the rule and the reminder second', () => {
    assert.deepEqual(themeRuleOf(DEFAULT_SETTINGS), { dayStart: 6 * 3600, dayEnd: 19 * 3600 })
    assert.deepEqual(themeRuleOf(normalizeSettings({ dayStart: '22:30', dayEnd: '05:15' })), {
      dayStart: 22 * 3600 + 30 * 60, dayEnd: 5 * 3600 + 15 * 60,
    })
    assert.equal(reminderSecondOf(DEFAULT_SETTINGS), 23 * 3600 + 30 * 60)
    assert.equal(reminderSecondOf(normalizeSettings({ reminderTime: '00:00' })), 0)
    assert.equal(isValidTimeText('06:00'), true)
    assert.equal(isValidTimeText('6:0'), false)
    assert.equal(isValidTimeText('23:59'), true)
  })
})
