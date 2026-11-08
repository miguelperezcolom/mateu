/**
 * REATTACH — a task survives a broken stream (design/progress-and-notifications.md, "Reattach").
 *
 * The server keeps a task running for a grace period (60 s by default) after its last stream went
 * away. This session remembers, in memory, the tasks its streams reported (with the rail they came
 * on: the base url's client, the route and server-side type) — so it survives navigation and screen
 * remounts, never an app kill. When a stream ends while its task still runs (the connection dropped,
 * the phone went to sleep) or the app comes back to the foreground, it asks `_progress-tasks` which
 * of them the server still has for this caller, upserts their state into the task center and opens a
 * `_progress-resume` stream for each one still running. An id the server does not answer is gone
 * (expired, never the caller's): it is forgotten, and a task still shown running ends failed.
 *
 * A resumed stream carries only the task's page-level parts (Progress, NotificationsChanged,
 * messages): the screen that started it may be gone. So a reattached task's result actions with a
 * `route` still navigate; Retry and `actionId` actions are not offered (no origin to run them on).
 */
import { progressOf, type Progress, type TaskAction, type TaskCenter, type TaskOrigin } from './taskCenter.ts';
import type { RunActionParams } from '../api/MateuApiClient.ts';

export const TASKS_ACTION = '_progress-tasks';
export const RESUME_ACTION = '_progress-resume';
export const CANCEL_ACTION = '_progress-cancel';
/** How many ids one `_progress-tasks` asks about (the server looks at 50). */
export const MAX_IDS = 50;
/** Resume streams that end without the task's end, in a row, before waiting for the foreground. */
export const MAX_RESUME_ATTEMPTS = 2;
export const LOST_TEXT = 'The connection was lost before the task finished';

type Json = Record<string, unknown>;

/** The part of the API client a reattach needs (MateuApiClient). */
export interface TaskApi {
  readonly baseUrl: string;
  runAction(params: RunActionParams): Promise<unknown>;
  runActionStream(params: RunActionParams, onIncrement: (increment: unknown) => void): Promise<void>;
}

/** Where a task came from: the client of its base url, and the route / type of its action. */
export interface TaskRail {
  api: TaskApi;
  route: string;
  serverSideType: string | null;
}

/** What the session lends a reattach. */
export interface ReattachHost {
  tasks: TaskCenter;
  appState: Record<string, unknown>;
  /** The page-level parts of a resumed increment besides Progress: messages, inbox changes. */
  applyPageLevel(increment: Json): void;
  /** A reattached task's result action with a route. */
  navigate(route: string): void;
}

const asArray = (v: unknown): Json[] => (Array.isArray(v) ? (v.filter((x) => x && typeof x === 'object') as Json[]) : []);

/** Pure: the Progress commands of an increment. */
export function progressesOf(increment: unknown): Progress[] {
  return asArray((increment as Json | null)?.['commands'])
    .filter((c) => c['type'] === 'Progress')
    .map((c) => progressOf(c['data']))
    .filter((p): p is Progress => !!p);
}

export class TaskReattach {
  private readonly known = new Map<string, TaskRail>();
  private readonly streaming = new Map<string, number>();
  private readonly attempts = new Map<string, number>();
  private running: Promise<void> | null = null;

  /** A stream reported the task (first time wins: its rail is where the task lives). */
  remember(taskId: string, rail: TaskRail): void {
    if (!this.known.has(taskId)) this.known.set(taskId, rail);
  }

  forget(taskId: string): void {
    this.known.delete(taskId);
    this.attempts.delete(taskId);
  }

  has(taskId: string): boolean {
    return this.known.has(taskId);
  }

  /** The tasks remembered (for tests and diagnostics). */
  ids(): string[] {
    return [...this.known.keys()];
  }

  /** A stream is reading the task now (the one that started it, or a resume). */
  streamStarted(taskId: string): void {
    this.streaming.set(taskId, (this.streaming.get(taskId) ?? 0) + 1);
  }

  streamEnded(taskId: string): void {
    const n = (this.streaming.get(taskId) ?? 1) - 1;
    if (n > 0) this.streaming.set(taskId, n);
    else this.streaming.delete(taskId);
  }

  /** Remembered, no stream reading it, and not known finished here. */
  private orphans(tasks: TaskCenter): string[] {
    return [...this.known.keys()].filter((id) => {
      if (this.streaming.has(id)) return false;
      const task = tasks.get(id);
      if (task && task.state !== 'running') {
        this.forget(id);
        return false;
      }
      return true;
    });
  }

  /**
   * Asks the server about every orphaned task and resumes the ones still running. Resolves once
   * the server has answered which ones it still has (the resumed streams go on in the background).
   * One run at a time: a second call while one runs waits for it.
   */
  reattach(host: ReattachHost): Promise<void> {
    if (this.running) return this.running;
    this.running = this.run(host).finally(() => {
      this.running = null;
    });
    return this.running;
  }

  /** The app came back to the foreground: every orphan gets its resume attempts again. */
  foreground(host: ReattachHost): Promise<void> {
    this.attempts.clear();
    return this.reattach(host);
  }

  private async run(host: ReattachHost): Promise<void> {
    const byBackend = new Map<TaskApi, string[]>();
    for (const id of this.orphans(host.tasks)) {
      if ((this.attempts.get(id) ?? 0) >= MAX_RESUME_ATTEMPTS) continue;
      const rail = this.known.get(id)!;
      byBackend.set(rail.api, [...(byBackend.get(rail.api) ?? []), id]);
    }
    for (const [api, all] of byBackend) {
      for (let i = 0; i < all.length; i += MAX_IDS) {
        const ids = all.slice(i, i + MAX_IDS);
        const rail = this.known.get(ids[0])!;
        let answer: unknown;
        try {
          answer = await api.runAction(this.request(rail, TASKS_ACTION, { taskIds: ids }, host));
        } catch {
          // offline / server unreachable: nothing is decided, the next foreground asks again
          continue;
        }
        const answered = new Set<string>();
        for (const progress of progressesOf(answer)) {
          if (!ids.includes(progress.taskId)) continue;
          answered.add(progress.taskId);
          this.upsert(host, progress);
          if (progress.state === 'running') this.resume(progress.taskId, host);
          else this.forget(progress.taskId);
        }
        // not the caller's, expired, or never there: gone — a task still shown running ends failed
        const gone = ids.filter((id) => !answered.has(id));
        for (const id of gone) this.forget(id);
        host.tasks.failRunning(gone, LOST_TEXT);
      }
    }
  }

  private resume(taskId: string, host: ReattachHost): void {
    const rail = this.known.get(taskId);
    if (!rail) return;
    this.streamStarted(taskId);
    void rail.api
      .runActionStream(this.request(rail, RESUME_ACTION, { taskId }, host), (increment) => {
        // something came: the task is reachable again
        this.attempts.delete(taskId);
        for (const progress of progressesOf(increment)) {
          if (progress.taskId === taskId || this.known.has(progress.taskId)) this.upsert(host, progress);
        }
        host.applyPageLevel(increment as Json);
      })
      .catch(() => undefined)
      .finally(() => {
        this.streamEnded(taskId);
        const task = host.tasks.get(taskId);
        if (task && task.state !== 'running') {
          this.forget(taskId);
          return;
        }
        // the resume ended before the task did: try again (bounded), else wait for the foreground
        const tries = (this.attempts.get(taskId) ?? 0) + 1;
        this.attempts.set(taskId, tries);
        if (tries < MAX_RESUME_ATTEMPTS) void this.reattach(host);
      });
  }

  /** A reattached task's state; its Cancel goes to its own backend, a route action navigates. */
  private upsert(host: ReattachHost, progress: Progress): void {
    const rail = this.known.get(progress.taskId);
    const origin: TaskOrigin = {
      runAction: (action: TaskAction) => {
        if (action.route) host.navigate(action.route);
      },
    };
    if (rail) origin.cancel = () => void this.cancel(progress.taskId, rail, host);
    // a task this device still knows keeps the closures of the screen that started it
    const existing = host.tasks.get(progress.taskId);
    host.tasks.upsert(
      { ...progress, resultActions: existing ? progress.resultActions : progress.resultActions.filter((a) => !!a.route) },
      // …and only gets what it lacks from here
      existing
        ? {
            ...(existing.origin.runAction ? {} : { runAction: origin.runAction }),
            ...(existing.origin.cancel || !origin.cancel ? {} : { cancel: origin.cancel }),
          }
        : origin,
    );
  }

  private async cancel(taskId: string, rail: TaskRail, host: ReattachHost): Promise<void> {
    try {
      const answer = await rail.api.runAction(this.request(rail, CANCEL_ACTION, { taskId }, host));
      for (const progress of progressesOf(answer)) this.upsert(host, progress);
    } catch {
      // the stream still ends the task as it ends
    }
  }

  private request(rail: TaskRail, actionId: string, parameters: Json, host: ReattachHost): RunActionParams {
    return {
      route: rail.route,
      consumedRoute: '',
      actionId,
      serverSideType: rail.serverSideType,
      initiatorComponentId: 'mateu-task-center',
      componentState: {},
      appState: host.appState,
      parameters,
    };
  }
}
