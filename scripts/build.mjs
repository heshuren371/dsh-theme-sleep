#!/usr/bin/env node
/**
 * Build both halves of the bundle.
 *
 * - `lib/client.js` — ONE self-contained script with no imports. The shell hands
 *   this file to the browser and evaluates it there, so relative imports cannot
 *   survive the trip; the Client source is therefore split into modules, and
 *   esbuild folds them back into a single IIFE. Platform words (`react`,
 *   `react-dom`) are never static imports: `src/platform.ts` receives the
 *   module-table `require` from the factory at runtime.
 * - `lib/index.js`, `lib/schema.js`, `lib/core/*.js` — the typed Host half and
 *   the pure core, emitted by tsc so the shipped artifact is exactly what the
 *   unit tests import. `tsconfig.build.json` uses NodeNext, so the emitted
 *   relative imports keep their `.js` specifiers.
 *
 * `lib/` is committed (the plugin is installed from GitHub, which runs no build
 * step).
 */
import { execFileSync } from 'node:child_process'
import { existsSync, rmSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { build } from 'esbuild'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
process.chdir(root)

rmSync('lib', { recursive: true, force: true })

const result = await build({
  entryPoints: ['src/client.ts'],
  outfile: 'lib/client.js',
  bundle: true,
  format: 'iife',
  platform: 'browser',
  target: 'es2022',
  legalComments: 'none',
  charset: 'utf8',
  logLevel: 'warning',
  banner: {
    js: '/* @local/dsh-theme-sleep — generated from src/ by `pnpm run build`; do not edit. */',
  },
})

if (result.warnings.length > 0) {
  for (const warning of result.warnings) console.warn('esbuild:', warning.text)
}

// `pnpm run build` puts node_modules/.bin on PATH; a bare `node scripts/build.mjs`
// does not, so prefer the locally installed compiler when it exists.
const localTsc = join(root, 'node_modules', '.bin', process.platform === 'win32' ? 'tsc.cmd' : 'tsc')
execFileSync(existsSync(localTsc) ? localTsc : 'tsc', ['-p', 'tsconfig.build.json'], { stdio: 'inherit' })

console.log('build: lib/client.js (bundled) + lib/index.js, lib/schema.js, lib/core/*.js (tsc)')
