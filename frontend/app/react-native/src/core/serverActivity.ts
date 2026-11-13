/**
 * The requests in flight to a SERVER — the RN twin of the IntelliJ plugin's `api/ServerActivity.kt`
 * — so the UI on screen can show that it is waiting for one (a thin progress bar under its top bar,
 * shell/ServerActivityBar.tsx).
 *
 * What counts: every Mateu call the user is waiting for (a sync action or route load, a LongTask
 * stream while it is open), the REST sources a screen fetches (direct or proxied) and the manifest /
 * bundle an opening UI needs. What does NOT: the long-lived or periodic background traffic — the
 * app's event stream (`_live-updates`), the agent channel, presence heartbeats, push (un)registration,
 * keep-alives, task re-attachment, polling refreshes and the offline queue's drain — or the bar
 * would never go away. Those are excluded by action id ([BACKGROUND_ACTIONS]) or by the request's
 * own `background` flag.
 *
 * Process-wide (one instance, [serverActivity]): only one UI is on screen and the hidden hub UIs send
 * nothing but excluded background traffic (their polling stands still while hidden).
 *
 * Pure (no React / RN imports): unit-tested with a fake clock.
 */

/** How long the server must keep us waiting before the bar shows: a fast answer never flickers it. */
export const SHOW_AFTER_MS = 500;

/**
 * A request that starts this soon after the indicator went away (a route load handing over to the
 * screen's OnLoad search) is the SAME wait: the indicator comes straight back, without another
 * delay and without a second announcement — never a hide / show flicker between chained calls.
 */
export const HANDOVER_MS = 200;

/** App-level actions that run in the background for as long as a UI is open — never counted. */
export const BACKGROUND_ACTIONS: ReadonlySet<string> = new Set([
  '_live-updates',
  '_agent-channel',
  '_presence',
  '_push-register',
  '_push-unregister',
  '_keep-alive',
  '_progress-tasks',
  '_progress-resume',
  '_client-log',
]);

/** Whether a request to the Mateu server is background traffic the user is not waiting for. */
export function isBackgroundRequest(actionId: string | null | undefined, background?: boolean): boolean {
  return background === true || BACKGROUND_ACTIONS.has(actionId ?? '');
}

type Listener = (busy: boolean) => void;

export class ServerActivity {
  private pending = 0;
  private readonly listeners = new Set<Listener>();

  /** Whether a request is still waiting for its answer. */
  get busy(): boolean {
    return this.pending > 0;
  }

  /** How many requests are in flight. */
  get inFlight(): number {
    return this.pending;
  }

  /** Hears every busy ↔ idle transition (0 → 1 and 1 → 0), not each request. */
  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Counts one request from now; the returned function ends it. Ending twice is harmless (a
   * `finally` and an abort may both call it), so the count can never go negative or stay up.
   */
  begin(): () => void {
    let ended = false;
    if (++this.pending === 1) this.emit(true);
    return () => {
      if (ended) return;
      ended = true;
      this.pending = Math.max(0, this.pending - 1);
      if (this.pending === 0) this.emit(false);
    };
  }

  /** Runs `call` counted as one request; it is uncounted however it ends (answer, error, abort). */
  async track<T>(call: () => Promise<T>): Promise<T> {
    const end = this.begin();
    try {
      return await call();
    } finally {
      end();
    }
  }

  /** Tests only: forgets every pending request. */
  reset(): void {
    const was = this.pending > 0;
    this.pending = 0;
    if (was) this.emit(false);
  }

  private emit(busy: boolean): void {
    for (const l of [...this.listeners]) {
      try {
        l(busy);
      } catch {
        // a listener's failure never breaks the request it counts
      }
    }
  }
}

/** The app's one counter. */
export const serverActivity = new ServerActivity();

export interface BusyTimer {
  set(fn: () => void, ms: number): unknown;
  clear(handle: unknown): void;
  now(): number;
}

const realTimer: BusyTimer = {
  set: (fn, ms) => setTimeout(fn, ms),
  clear: (h) => clearTimeout(h as ReturnType<typeof setTimeout>),
  now: () => Date.now(),
};

/**
 * WHEN the indicator shows: only after `delayMs` of CONTINUOUS busy (a request that answers sooner,
 * or one that hands over to the next within the same busy period, shows nothing), hidden the moment
 * the server is idle. `onShown` hears each busy period that became visible — ONCE — which is when the
 * screen reader is told (a polite "Loading…", never repeated while the same wait goes on — a call
 * that follows within [HANDOVER_MS] brings the indicator straight back and is not announced again).
 */
export class DelayedBusy {
  private shownNow = false;
  private handle: unknown = null;
  /** When a shown indicator last went away (-∞: never / not since the last announced period). */
  private hiddenAt = Number.NEGATIVE_INFINITY;
  private readonly visibility = new Set<(visible: boolean) => void>();
  private readonly shownListeners = new Set<() => void>();
  private readonly off: () => void;
  private readonly timer: BusyTimer;
  private readonly delayMs: number;

  // (no TS parameter properties: node's type stripping, which runs the tests, can't erase them)
  constructor(activity: ServerActivity, timer: BusyTimer = realTimer, delayMs: number = SHOW_AFTER_MS) {
    this.timer = timer;
    this.delayMs = delayMs;
    this.off = activity.subscribe((busy) => (busy ? this.arm() : this.idle()));
    if (activity.busy) this.arm();
  }

  get visible(): boolean {
    return this.shownNow;
  }

  /** Hears the indicator appear (true) and go (false). */
  subscribe(listener: (visible: boolean) => void): () => void {
    this.visibility.add(listener);
    return () => {
      this.visibility.delete(listener);
    };
  }

  /** Hears once per busy period that lasted long enough to be shown. */
  onShown(listener: () => void): () => void {
    this.shownListeners.add(listener);
    return () => {
      this.shownListeners.delete(listener);
    };
  }

  dispose(): void {
    this.off();
    this.idle();
  }

  private arm(): void {
    if (this.handle !== null || this.shownNow) return;
    if (this.timer.now() - this.hiddenAt <= HANDOVER_MS) {
      this.set(true); // the same wait, handed over to the next call: back at once, not announced again
      return;
    }
    this.handle = this.timer.set(() => {
      this.handle = null;
      this.set(true);
      for (const l of [...this.shownListeners]) l();
    }, this.delayMs);
  }

  private idle(): void {
    if (this.handle !== null) {
      this.timer.clear(this.handle);
      this.handle = null;
    }
    if (this.shownNow) this.hiddenAt = this.timer.now();
    this.set(false);
  }

  private set(visible: boolean): void {
    if (this.shownNow === visible) return;
    this.shownNow = visible;
    for (const l of [...this.visibility]) l(visible);
  }
}
