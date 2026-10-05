/**
 * Host half of the bundle.
 *
 * The plugin's whole behaviour is in the browser: the time rule, the reminder,
 * the surfaces, and the persistence path all live in the Client half, which
 * reaches the Host through the settings document. The Host half therefore owns
 * exactly two things:
 *
 * 1. The Loader seat for the bundle row (`cordis.patch.yml` inserts it).
 * 2. The `Config` schema the row is validated against, which is also what the
 *    Settings page projects for this entry.
 *
 * A `Config` export is what makes the row's values durable: the settings
 * document writes the user layer of this entry's `config`, and profile patches
 * keep working unchanged.
 * @module
 */

/** Config schema of the plugin row; see `./schema.ts`. */
export { Config } from './schema.ts'

/**
 * Host activation. There is deliberately nothing to register here: registering
 * a Host-side timer would keep the reminder running in every profile, including
 * headless ones, while the reminder can only ever be shown by a browser.
 */
export function apply(): void {
  /* no Host-side resources: the Client half owns the behaviour */
}
