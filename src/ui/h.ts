/**
 * The only React doorway the view layer uses.
 *
 * `react` is resolved from the host module table at bundle-factory time (see
 * `src/platform.ts`), so a view module must never import `react` itself: it
 * re-exports the bridge's `h` and the bound `React` object instead. The module
 * body only re-exports, so it is safe to evaluate before the factory runs.
 * @module
 */
import { h, React } from '../platform.js'

export { h, React }
