/**
 * The completion cue: fires once each time a Session stops running.
 *
 * The engine folds snapshots of the host's Session running state, so it is
 * unit-testable without a browser, a session, or a socket. The Client entry owns
 * the subscription to the host observable and the sound.
 * @module
 */

/** One Session's running state, as the host reports it. */
export interface SessionRunningState {
  /**
   * Latest known running state. `undefined` before a baseline or event
   * establishes it.
   */
  readonly running: boolean | undefined
}

/** The running state of every known Session, keyed by Session identity. */
export type RunningSnapshot = ReadonlyMap<string, SessionRunningState>

/** The host source this engine folds: a snapshot reader plus a change subscription. */
export interface RunningSource {
  /** @returns the current snapshot (a stable reference until the next change). */
  getSnapshot(): RunningSnapshot
  /**
   * @param listener - invoked after each snapshot replacement.
   * @returns the disposer removing this listener.
   */
  subscribe(listener: () => void): () => void
}

/**
 * Watches running state and reports each transition into idle.
 *
 * A Session dropped from the snapshot does not announce: a removed entry means
 * the identity is gone, not that its work finished. A Session first seen already
 * idle does not announce either, so opening a page never replays a completion
 * the user has already seen.
 */
export class CompletionWatch {
  private previous: RunningSnapshot = new Map()
  private primed = false
  private dispose: (() => void) | null = null
  /** Set while a callback is in flight, so a re-entrant publish is ignored. */
  private inCallback = false

  /**
   * @param source - Host running-state source to fold.
   * @param onComplete - Called once per Session that stops running.
   */
  constructor(
    private readonly source: RunningSource,
    private readonly onComplete: (sessionId: string) => void,
  ) {}

  /**
   * Take the current snapshot as the baseline, then subscribe.
   *
   * The baseline is what keeps a Session that is already idle when the watch
   * starts from announcing.
   */
  start(): void {
    if (this.dispose !== null) return
    this.previous = this.source.getSnapshot()
    this.primed = true
    this.dispose = this.source.subscribe(() => { this.observe() })
  }

  /** Drop the subscription; the watch can be started again. */
  stop(): void {
    this.dispose?.()
    this.dispose = null
    this.primed = false
  }

  /** @returns Whether the watch currently holds a subscription. */
  isRunning(): boolean {
    return this.dispose !== null
  }

  /** Announce every Session that moved from running to idle since the last snapshot. */
  private observe(): void {
    if (!this.primed) return
    const next = this.source.getSnapshot()
    const previous = this.previous
    this.previous = next
    if (this.inCallback) {
      // A publish made while a callback ran is folded into the baseline and not
      // announced: announcing it later would replay a completion the callback
      // already reported.
      return
    }
    const completed: string[] = []
    for (const [sessionId, state] of next) {
      if (previous.get(sessionId)?.running === true && state.running === false) {
        completed.push(sessionId)
      }
    }
    if (completed.length === 0) return
    this.inCallback = true
    try {
      for (const sessionId of completed) this.onComplete(sessionId)
    } finally {
      this.inCallback = false
    }
  }
}
