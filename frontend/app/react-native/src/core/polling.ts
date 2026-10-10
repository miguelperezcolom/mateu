/**
 * Periodic refresh (timed triggers) — the native port of the web's triggerOnLoad/scheduleOnload +
 * handleBackendSucceeded and of the Redwood shell's poc/polling.mjs.
 *
 * - `OnLoad` with `timeoutMillis > 0` runs its action ONCE after that delay (≤ 0 stays immediate —
 *   that path is the caller's, see [isTimedOnLoad]).
 * - `OnSuccess` runs `actionId` after an action whose id == `calledActionId` succeeded on the SAME
 *   screen (after `timeoutMillis` when > 0, else at once).
 * Together: OnLoad(refresh, 10000) + OnSuccess(refresh after refresh, 10000) = refresh every 10 s.
 *
 * One GENERATION per screen: entering a different screen (or a fresh navigation) bumps it and every
 * pending timer of the previous one is cancelled and, should it fire anyway, dropped — the
 * equivalent of the web's callbackToken. A re-render of the SAME screen (what a refresh answers)
 * keeps the generation and does NOT re-arm the timed OnLoads, or each round would add a loop.
 *
 * Pure (no React / RN imports) with an injectable timer, so it is unit-tested with a fake clock.
 */

type Json = Record<string, any>;

export interface PollTimer {
  set(fn: () => void, ms: number): unknown;
  clear(handle: unknown): void;
}

export const realTimer: PollTimer = {
  set: (fn, ms) => setTimeout(fn, ms),
  clear: (h) => clearTimeout(h as ReturnType<typeof setTimeout>),
};

/** Runs a scheduled action; `background` = a silent refresh (no busy indicator, no error toast). */
export type PollRunner = (actionId: string, opts: { background: boolean }) => void;

const typeOf = (t: Json) => String(t?.['type'] ?? '').toLowerCase();
const timeoutOf = (t: Json) => Number(t?.['timeoutMillis']) || 0;

/** An OnLoad trigger the scheduler owns (delayed); the immediate ones keep the caller's path. */
export function isTimedOnLoad(t: Json): boolean {
  return typeOf(t) === 'onload' && !!t['actionId'] && timeoutOf(t) > 0;
}

export class PollingScheduler {
  private generation = 0;
  private screenKey: string | null = null;
  private triggers: Json[] = [];
  private readonly handles = new Set<unknown>();

  private readonly runner: PollRunner;
  private readonly timer: PollTimer;
  /** Evaluated at FIRE time against the live state (a trigger `condition`). */
  private readonly conditionHolds: (condition: string) => boolean;

  // (no TS parameter properties: node's type stripping, which runs the tests, can't erase them)
  constructor(runner: PollRunner, timer: PollTimer = realTimer, conditionHolds: (condition: string) => boolean = () => true) {
    this.runner = runner;
    this.timer = timer;
    this.conditionHolds = conditionHolds;
  }

  get currentGeneration(): number {
    return this.generation;
  }

  get pendingCount(): number {
    return this.handles.size;
  }

  /**
   * A ServerSide component was rendered. A new screen (different key, or `fresh` = it came from a
   * navigation) cancels what was pending and arms its timed OnLoads; the same screen re-rendered
   * by one of its own actions only refreshes the trigger list (OnSuccess re-schedules the loop).
   */
  enterScreen(key: string, triggers: Json[], fresh: boolean): void {
    const same = !fresh && this.screenKey !== null && key === this.screenKey;
    this.triggers = Array.isArray(triggers) ? triggers : [];
    if (same) return;
    this.cancelAll();
    this.screenKey = key;
    for (const t of this.triggers) if (isTimedOnLoad(t)) this.schedule(t, this.generation);
  }

  /** An action dispatched at `generation` succeeded: schedule its OnSuccess followers. */
  actionSucceeded(generation: number, actionId: string): number {
    if (generation !== this.generation || this.screenKey === null) return 0;
    const next = this.triggers.filter(
      (t) => typeOf(t) === 'onsuccess' && !!t['actionId'] && t['calledActionId'] === actionId,
    );
    for (const t of next) this.schedule(t, this.generation);
    return next.length;
  }

  /** The screen went away (unmount / tab closed): nothing pending may fire. */
  stop(): void {
    this.cancelAll();
    this.screenKey = null;
    this.triggers = [];
  }

  private cancelAll(): void {
    this.generation++;
    for (const h of this.handles) this.timer.clear(h);
    this.handles.clear();
  }

  private schedule(t: Json, gen: number): void {
    const fire = () => {
      if (gen !== this.generation) return;
      const condition = String(t['condition'] ?? '');
      if (condition && !this.conditionHolds(condition)) return;
      this.runner(String(t['actionId']), { background: !!t['background'] });
    };
    const ms = timeoutOf(t);
    if (ms <= 0) {
      fire();
      return;
    }
    const handle = this.timer.set(() => {
      this.handles.delete(handle);
      fire();
    }, ms);
    this.handles.add(handle);
  }
}
