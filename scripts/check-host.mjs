#!/usr/bin/env node
/**
 * Assert the built Host half actually loads, and that its Config behaves.
 *
 * The Host half imports `@deepseek-ai/schemastery` at run time, and a linked
 * install resolves that from this package's own `node_modules`. When the
 * directory is missing, the import throws during activation and DSH drops the
 * whole bundle: both slot entries disappear from the page with no test
 * failing. Importing the emitted artifacts here catches that before an install.
 */
import { pathToFileURL } from 'node:url'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const entry = pathToFileURL(join(root, 'lib', 'index.js')).href

let module
try {
  module = await import(entry)
} catch (error) {
  console.error('check:host: lib/index.js failed to load — run `pnpm install` if node_modules is missing.')
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
}

if (typeof module.apply !== 'function') {
  console.error('check:host: lib/index.js does not export apply()')
  process.exit(1)
}
if (typeof module.Config !== 'function') {
  console.error('check:host: lib/index.js does not export a callable Config')
  process.exit(1)
}

/** Fields the row, the settings row, and the client all read. */
const EXPECTED = [
  'dayStart', 'dayEnd', 'reminderEnabled', 'reminderTime',
  'snoozeMinutes', 'soundEnabled', 'manualOverrideMinutes', 'completionSound',
]

const defaults = module.Config({})
const missing = EXPECTED.filter(field => !Object.hasOwn(defaults, field))
if (missing.length > 0) {
  console.error(`check:host: Config({}) is missing ${missing.join(', ')}`)
  process.exit(1)
}

let rejected = false
try {
  module.Config({ manualOverrideMinutes: 9999 })
} catch {
  rejected = true
}
if (!rejected) {
  console.error('check:host: Config accepted an out-of-range manualOverrideMinutes')
  process.exit(1)
}

console.log(`check:host: lib/index.js loads; Config defaults carry ${String(EXPECTED.length)} fields and reject out-of-range values`)
