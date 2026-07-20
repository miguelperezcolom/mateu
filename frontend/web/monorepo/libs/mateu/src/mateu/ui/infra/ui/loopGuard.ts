/**
 * Client-side request-loop breaker (circuit breaker).
 *
 * A misbehaving federated mount can re-request the same route over and over — the shell mounts a
 * remote as its home, the remote answers with something that flips the shell's route, which
 * re-mounts, which re-requests… a storm of identical sync calls that hammers the server and
 * freezes the UI. No real user interaction produces the SAME request identity many times within a
 * couple of seconds, so that pattern is a reliable loop signature.
 *
 * This guard is consulted at the single request chokepoint (AxiosMateuApiClient.runAction). It
 * counts identical requests in a sliding time window and, once the count crosses a threshold,
 * tells the caller to BLOCK the request instead of sending it — breaking the cycle. The caller
 * aborts in-flight requests and surfaces one error message; because the blocked call returns no
 * fragment, nothing re-renders and the loop dies.
 *
 * Mirrors the singleton-module shape of {@link dirtyGuard}.
 */
class LoopGuard {
  private windowMs = 4000;
  private threshold = 12;
  private events: { sig: string; t: number }[] = [];
  private reported = new Set<string>();

  /**
   * Records a request identified by {@code signature} and decides whether it is a runaway loop
   * that must be blocked. Returns:
   *   - blocked:  true when this signature has fired >= threshold times within the window,
   *   - firstTrip: true only on the first blocked call of a burst, so the caller surfaces the
   *     error exactly once (subsequent blocked calls stay silent).
   *
   * {@code now} is injectable for deterministic tests.
   */
  check(signature: string, now: number = Date.now()): { blocked: boolean; firstTrip: boolean } {
    this.events.push({ sig: signature, t: now });
    const cutoff = now - this.windowMs;
    this.events = this.events.filter((e) => e.t >= cutoff);
    let count = 0;
    for (const e of this.events) {
      if (e.sig === signature) count++;
    }
    if (count >= this.threshold) {
      const firstTrip = !this.reported.has(signature);
      this.reported.add(signature);
      return { blocked: true, firstTrip };
    }
    // cooled down below the threshold → allow reporting again on a future burst
    this.reported.delete(signature);
    return { blocked: false, firstTrip: false };
  }

  /** Clears all recorded activity (e.g. on a deliberate navigation). */
  reset(): void {
    this.events = [];
    this.reported.clear();
  }

  /** Tuning knobs (mainly for tests). */
  configure(opts: { windowMs?: number; threshold?: number }): void {
    if (opts.windowMs !== undefined) this.windowMs = opts.windowMs;
    if (opts.threshold !== undefined) this.threshold = opts.threshold;
  }
}

export const loopGuard = new LoopGuard();
