/**
 * Which built-in sound plays when a DSH turn finishes.
 *
 * The values name a tone sequence, not a file: nothing is fetched and no audio
 * asset ships with the plugin. `off` suppresses the cue.
 * @module
 */

/** Selectable completion cues, in the order the settings row lists them. */
export const COMPLETION_SOUNDS = ['off', 'ding', 'chime', 'blip'] as const

/** One completion cue name. */
export type CompletionSound = typeof COMPLETION_SOUNDS[number]

/**
 * Whether a value names a selectable completion cue.
 * @param value - Candidate from settings or untrusted storage.
 * @returns True for a member of {@link COMPLETION_SOUNDS}.
 */
export function isCompletionSound(value: unknown): value is CompletionSound {
  return typeof value === 'string' && (COMPLETION_SOUNDS as readonly string[]).includes(value)
}
