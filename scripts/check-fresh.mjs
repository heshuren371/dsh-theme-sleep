#!/usr/bin/env node
/**
 * Assert that the committed `lib/` is what `src/` builds right now.
 *
 * Installation uses the `lib/` in the repository, so a stale artifact ships
 * behavior that no test in `src/` describes. This rebuilds and fails on any
 * difference, whether the drift is in a tracked file or a new one.
 */
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
process.chdir(root)

execFileSync('node', ['scripts/build.mjs'], { stdio: 'inherit' })

/**
 * Run git and return its stdout, or exit with the command's own diagnosis when
 * the working tree is unusable.
 * @param args - git arguments.
 * @returns the command's stdout.
 */
function git(args) {
  try {
    return execFileSync('git', args, { encoding: 'utf8' })
  } catch (error) {
    console.error(`check:fresh: git ${args.join(' ')} failed; this check needs a git working tree`)
    console.error(String(error.stderr ?? error))
    process.exit(1)
  }
}

// `diff` covers tracked files against the index; `status --porcelain` covers
// both the index and untracked files, so together they catch a stale artifact
// and a newly emitted module.
const modified = git(['diff', '--name-only', '--', 'lib'])
const listed = git(['status', '--porcelain', '--untracked-files=all', '--', 'lib'])
const drifted = [modified.trim(), listed.trim()].filter(entry => entry !== '')

if (drifted.length > 0) {
  console.error('check:fresh: lib/ is not in sync with src/ — run `pnpm run build` and commit the result.')
  console.error(drifted.join('\n'))
  process.exit(1)
}

console.log('check:fresh: lib/ matches a fresh build of src/')
