/**
 * The TASK CENTER of one running UI — the long-running tasks (`LongTask`, the wire's `Progress`
 * command) this session has started: running ones and the recently finished, several at once.
 * Pure (no React): the shell's TaskHost paints it (a modal for a blocking task, a strip that
 * collapses to "3 tasks running" + a sheet listing them for the rest).
 *
 * Every `Progress` command is SELF-CONTAINED (the whole current state of the task), so a command is
 * an UPSERT by `taskId` — never a merge of partial updates. A task outlives the screen that started
 * it: the store belongs to the session, not to a view. See design/progress-and-notifications.md.
 */

export type TaskState = 'running' | 'done' | 'failed' | 'cancelled';

/** An action of a finished task ("Open report"): `route` navigates, else `actionId` runs. */
export interface TaskAction {
  label?: string | null;
  actionId?: string | null;
  parameters?: Record<string, unknown> | null;
  route?: string | null;
  style?: string | null;
}

/** The wire's ProgressDto. */
export interface Progress {
  taskId: string;
  title: string;
  text: string;
  fraction: number | null;
  done: number | null;
  total: number | null;
  state: TaskState;
  blocking: boolean;
  backgroundable: boolean;
  cancellable: boolean;
  retryable: boolean;
  startedAt: number | null;
  closeAfterSeconds: number | null;
  error: string | null;
  resultActions: TaskAction[];
}

/** What the renderer can do on a task: the closures of the screen that started it. */
export interface TaskOrigin {
  cancel?: () => void;
  retry?: () => void;
  runAction?: (action: TaskAction) => void;
}

export interface Task extends Progress {
  /** The user sent a blocking task to the background (or it was never blocking). */
  backgrounded: boolean;
  /** When this device first heard of the task (elapsed time without trusting the server clock). */
  seenAt: number;
  /** When it finished, on this device. */
  finishedAt: number | null;
  origin: TaskOrigin;
}

/** What an upsert changed — for the announcements (polite: started / finished). */
export type TaskEvent = { kind: 'started' | 'finished'; task: Task } | null;

const STATES: TaskState[] = ['running', 'done', 'failed', 'cancelled'];
const num = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null);
const text = (v: unknown): string => (typeof v === 'string' ? v : v == null ? '' : String(v));

/** Pure: the Progress a command's data carries, or null when it is not one. */
export function progressOf(data: unknown): Progress | null {
  if (!data || typeof data !== 'object') return null;
  const d = data as Record<string, unknown>;
  const taskId = text(d['taskId']);
  if (!taskId) return null;
  const state = STATES.includes(d['state'] as TaskState) ? (d['state'] as TaskState) : 'running';
  const fraction = num(d['fraction']);
  return {
    taskId,
    title: text(d['title']),
    text: text(d['text']),
    fraction: fraction == null ? null : Math.max(0, Math.min(1, fraction)),
    done: num(d['done']),
    total: num(d['total']),
    state,
    blocking: d['blocking'] === true,
    backgroundable: d['backgroundable'] === true,
    cancellable: d['cancellable'] === true,
    retryable: d['retryable'] === true,
    startedAt: num(d['startedAt']),
    closeAfterSeconds: num(d['closeAfterSeconds']),
    error: d['error'] == null ? null : text(d['error']),
    resultActions: Array.isArray(d['resultActions'])
      ? (d['resultActions'] as TaskAction[]).filter((a) => a && typeof a === 'object')
      : [],
  };
}

/** Pure: "12 of 300" when the work is countable, else ''. */
export function stepCountText(task: Pick<Progress, 'done' | 'total'>): string {
  return task.total != null && task.total > 0 && task.done != null ? `${task.done} of ${task.total}` : '';
}

/** Pure: "45 s" / "3 min 05 s" / "1 h 02 min" since `from`, at `now`. */
export function elapsedText(from: number, now: number): string {
  const seconds = Math.max(0, Math.floor((now - from) / 1000));
  if (seconds < 60) return `${seconds} s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ${String(seconds % 60).padStart(2, '0')} s`;
  return `${Math.floor(minutes / 60)} h ${String(minutes % 60).padStart(2, '0')} min`;
}

/** Pure: the strip's collapsed line ("3 tasks running", "1 task running", "2 tasks finished"). */
export function stripLabel(counts: { running: number; finished: number }): string {
  if (counts.running > 0) return `${counts.running} ${counts.running === 1 ? 'task' : 'tasks'} running`;
  if (counts.finished > 0) return `${counts.finished} ${counts.finished === 1 ? 'task' : 'tasks'} finished`;
  return '';
}

/** Pure: what a screen reader says when a task finishes. */
export function finishedAnnouncement(task: Pick<Progress, 'title' | 'state' | 'text' | 'error'>): string {
  const outcome = task.state === 'done' ? 'finished' : task.state === 'failed' ? 'failed' : 'cancelled';
  const detail = task.state === 'failed' ? task.error || task.text : task.text;
  return `${task.title || 'Task'} ${outcome}${detail ? `: ${detail}` : ''}`;
}

/** Pure: the accessibilityValue of a task's progress bar (none for an indeterminate one). */
export function progressA11yValue(task: Pick<Progress, 'fraction' | 'done' | 'total' | 'text'>):
  { min: number; max: number; now: number; text?: string } | { text: string } {
  const count = stepCountText(task);
  if (task.fraction == null) return { text: count || task.text || 'In progress' };
  return { min: 0, max: 100, now: Math.round(task.fraction * 100), ...(count ? { text: count } : {}) };
}

/** Finished tasks kept for the list (the most recent). */
export const RECENT_FINISHED = 10;

export class TaskCenter {
  private tasks: Task[] = [];
  private listeners = new Set<() => void>();

  private readonly now: () => number;

  constructor(now: () => number = () => Date.now()) {
    this.now = now;
  }

  /** Upserts a task from a Progress command; answers what changed (for the announcements). */
  upsert(progress: Progress, origin?: TaskOrigin): TaskEvent {
    const index = this.tasks.findIndex((t) => t.taskId === progress.taskId);
    const previous = index >= 0 ? this.tasks[index] : null;
    // a finished task does not come back to life (a late duplicate of an older step)
    if (previous && previous.state !== 'running' && progress.state === 'running') return null;
    const finished = progress.state !== 'running';
    const task: Task = {
      ...progress,
      backgrounded: previous ? previous.backgrounded : !progress.blocking,
      seenAt: previous?.seenAt ?? this.now(),
      finishedAt: finished ? (previous?.finishedAt ?? this.now()) : null,
      origin: { ...(previous?.origin ?? {}), ...(origin ?? {}) },
    };
    if (index >= 0) this.tasks[index] = task;
    else this.tasks.push(task);
    this.trim();
    this.emit();
    if (!previous && !finished) return { kind: 'started', task };
    if (finished && (!previous || previous.state === 'running')) return { kind: 'finished', task };
    return null;
  }

  /** A stream that ended without saying how the task ended (the connection dropped): failed. */
  failRunning(taskIds: Iterable<string>, error: string): TaskEvent[] {
    const events: TaskEvent[] = [];
    for (const id of taskIds) {
      const task = this.get(id);
      if (task && task.state === 'running') {
        events.push(this.upsert({ ...task, state: 'failed', error }));
      }
    }
    return events;
  }

  get(taskId: string): Task | undefined {
    return this.tasks.find((t) => t.taskId === taskId);
  }

  /** Every task, oldest first. */
  list(): Task[] {
    return [...this.tasks];
  }

  /**
   * The blocking task the user waits for (shown as a modal), if any: the oldest still on screen. A
   * finished one stays (its outcome, its actions) until closed — or `closeAfterSeconds` elapse.
   */
  blocking(): Task | undefined {
    return this.tasks.find((t) => t.blocking && !t.backgrounded);
  }

  counts(): { running: number; finished: number; failed: number } {
    let running = 0;
    let finished = 0;
    let failed = 0;
    for (const t of this.tasks) {
      if (t.state === 'running') running++;
      else finished++;
      if (t.state === 'failed') failed++;
    }
    return { running, finished, failed };
  }

  /** "Background": the blocking task goes on in the strip. Only when it allows it (or is over). */
  moveToBackground(taskId: string): boolean {
    const task = this.get(taskId);
    if (!task || (!task.backgroundable && task.state === 'running')) return false;
    task.backgrounded = true;
    this.emit();
    return true;
  }

  /** Removes a finished task from the list (its ✕, "Clear finished"). */
  dismiss(taskId: string): void {
    const before = this.tasks.length;
    this.tasks = this.tasks.filter((t) => t.taskId !== taskId || t.state === 'running');
    if (this.tasks.length !== before) this.emit();
  }

  clearFinished(): void {
    const before = this.tasks.length;
    this.tasks = this.tasks.filter((t) => t.state === 'running');
    if (this.tasks.length !== before) this.emit();
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private trim(): void {
    const finished = this.tasks.filter((t) => t.state !== 'running');
    if (finished.length <= RECENT_FINISHED) return;
    const drop = new Set(
      [...finished].sort((a, b) => (a.finishedAt ?? 0) - (b.finishedAt ?? 0)).slice(0, finished.length - RECENT_FINISHED),
    );
    this.tasks = this.tasks.filter((t) => !drop.has(t));
  }

  private emit(): void {
    for (const l of this.listeners) {
      try {
        l();
      } catch {
        // a broken listener does not stop the others
      }
    }
  }
}
