import type { Progress } from '@mateu/shared/apiClients/dtos/Progress.ts'

/**
 * The TASK CENTER's state: every long-running task this page knows about, running or recently
 * finished, keyed by `taskId` (design/progress-and-notifications.md). Fed by the `Progress`
 * commands of any answer — wherever it arrives — and read by `mateu-task-center`, so a task outlives
 * the screen that started it: leaving the screen leaves the task in the list.
 *
 * Every `Progress` command is the whole state of its task, so an update REPLACES the wire part of
 * the entry; the entry also keeps what is the client's alone: where the task came from (to cancel,
 * retry or run a result action), whether the user sent it to the background, when it was first
 * seen and when it finished (for the elapsed time and the auto-close).
 *
 * Pure state (a reducer) plus a tiny subscribable singleton around it.
 */

/** What the client remembers about the action that started a task. */
export interface TaskOrigin {
    /** the element that ran the action (the result actions and Retry go to it) */
    initiator?: HTMLElement
    baseUrl?: string
    route?: string
    serverSideType?: string
    actionId?: string
    /** re-runs the action that started the task, with the same parameters */
    retry?: () => void
}

export interface TaskEntry {
    progress: Progress
    origin?: TaskOrigin
    /** the user moved a blocking task to the background */
    movedToBackground: boolean
    /** the user dismissed it from the list / closed its finished overlay */
    dismissed: boolean
    /** client clock: first seen */
    seenAt: number
    /** client clock: when it reached done/failed/cancelled */
    finishedAt?: number
    /** client clock: last update */
    updatedAt: number
}

export interface TaskState {
    /** in arrival order */
    entries: TaskEntry[]
}

/** How many finished tasks the list keeps (the oldest finished go first). */
export const MAX_FINISHED = 10

export const emptyTaskState = (): TaskState => ({ entries: [] })

export const isFinished = (progress: Progress): boolean =>
    progress.state === 'done' || progress.state === 'failed' || progress.state === 'cancelled'

/** Pure: the state after a `Progress` command. A finished task is never revived by a late update. */
export const applyProgress = (state: TaskState, progress: Progress, now: number, origin?: TaskOrigin): TaskState => {
    if (!progress?.taskId) return state
    const index = state.entries.findIndex((e) => e.progress.taskId === progress.taskId)
    let entries: TaskEntry[]
    if (index < 0) {
        entries = [...state.entries, {
            progress,
            origin,
            movedToBackground: false,
            dismissed: false,
            seenAt: now,
            updatedAt: now,
            finishedAt: isFinished(progress) ? now : undefined,
        }]
    } else {
        const previous = state.entries[index]
        // the stream's "cancelled"/"done" and the cancel's own echo can arrive in any order: the
        // first terminal state wins, nothing after it changes the task again
        if (isFinished(previous.progress)) return state
        entries = [...state.entries]
        entries[index] = {
            ...previous,
            progress,
            origin: previous.origin ?? origin,
            updatedAt: now,
            finishedAt: isFinished(progress) ? now : undefined,
        }
    }
    return { entries: pruneFinished(entries) }
}

/** Pure: keeps at most {@link MAX_FINISHED} finished tasks (dismissed ones go first). */
export const pruneFinished = (entries: TaskEntry[]): TaskEntry[] => {
    const finished = entries.filter((e) => isFinished(e.progress))
    if (finished.length <= MAX_FINISHED) return entries
    const ordered = [...finished].sort((a, b) =>
        (Number(b.dismissed) - Number(a.dismissed)) || ((a.finishedAt ?? 0) - (b.finishedAt ?? 0)))
    const drop = new Set(ordered.slice(0, finished.length - MAX_FINISHED))
    return entries.filter((e) => !drop.has(e))
}

const patch = (state: TaskState, taskId: string, change: Partial<TaskEntry>): TaskState => ({
    entries: state.entries.map((e) => e.progress.taskId === taskId ? { ...e, ...change } : e),
})

export const moveToBackground = (state: TaskState, taskId: string): TaskState =>
    patch(state, taskId, { movedToBackground: true })

/** Dismissing a finished task removes it; a running one is only hidden from the overlay. */
export const dismiss = (state: TaskState, taskId: string): TaskState => {
    const entry = state.entries.find((e) => e.progress.taskId === taskId)
    if (!entry) return state
    if (isFinished(entry.progress)) return { entries: state.entries.filter((e) => e !== entry) }
    return patch(state, taskId, { dismissed: true })
}

/** Removes every finished task ("Clear finished"). */
export const clearFinished = (state: TaskState): TaskState =>
    ({ entries: state.entries.filter((e) => !isFinished(e.progress)) })

/** Whether an entry shows as the blocking overlay at `now`. */
export const showsAsBlocking = (entry: TaskEntry, now: number): boolean => {
    if (!entry.progress.blocking || entry.movedToBackground || entry.dismissed) return false
    if (!isFinished(entry.progress)) return true
    // a finished blocking task keeps its overlay until closed — or until its closeAfterSeconds
    const closeAfter = entry.progress.closeAfterSeconds
    if (closeAfter && closeAfter > 0 && entry.finishedAt !== undefined) {
        return now - entry.finishedAt < closeAfter * 1000
    }
    // a cancelled task the user cancelled has nothing more to say
    return entry.progress.state !== 'cancelled'
}

/** The task the blocking overlay shows (the most recent one), if any. */
export const blockingTask = (state: TaskState, now: number): TaskEntry | undefined =>
    [...state.entries].reverse().find((e) => showsAsBlocking(e, now))

/** The tasks the task list shows: everything not dismissed, newest first. */
export const listedTasks = (state: TaskState): TaskEntry[] =>
    [...state.entries].filter((e) => !(e.dismissed && isFinished(e.progress))).reverse()

export interface TaskCounts { running: number, finished: number, failed: number }

export const countsOf = (state: TaskState): TaskCounts => ({
    running: state.entries.filter((e) => !isFinished(e.progress)).length,
    finished: state.entries.filter((e) => isFinished(e.progress) && !e.dismissed).length,
    failed: state.entries.filter((e) => e.progress.state === 'failed' && !e.dismissed).length,
})

/** "12 of 300", when the work is countable. */
export const stepCountOf = (progress: Progress): { done: number, total: number } | undefined =>
    typeof progress.total === 'number' && progress.total > 0
        ? { done: Math.max(0, progress.done ?? 0), total: progress.total }
        : undefined

/** Elapsed seconds, from the server's start when it sent one, else from when the client saw it. */
export const elapsedSeconds = (entry: TaskEntry, now: number): number => {
    const end = entry.finishedAt ?? now
    const start = entry.seenAt
    return Math.max(0, Math.round((end - start) / 1000))
}

/** "1:05" / "12:00:03". */
export const formatElapsed = (seconds: number): string => {
    const s = Math.max(0, Math.floor(seconds))
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    const two = (n: number) => String(n).padStart(2, '0')
    return h > 0 ? `${h}:${two(m)}:${two(sec)}` : `${m}:${two(sec)}`
}

/** 0..100 for `aria-valuenow`, or undefined when indeterminate. */
export const percentOf = (progress: Progress): number | undefined =>
    typeof progress.fraction === 'number' && Number.isFinite(progress.fraction)
        ? Math.round(Math.max(0, Math.min(1, progress.fraction)) * 100)
        : undefined

// ── the page's one store ──────────────────────────────────────────────────────

type Listener = (state: TaskState) => void

let current: TaskState = emptyTaskState()
const listeners = new Set<Listener>()

const publish = (next: TaskState) => {
    if (next === current) return
    current = next
    for (const listener of listeners) {
        try { listener(current) } catch { /* one broken listener must not stop the others */ }
    }
}

export const taskStore = {
    get state(): TaskState { return current },
    upsert(progress: Progress, origin?: TaskOrigin, now = Date.now()) {
        publish(applyProgress(current, progress, now, origin))
    },
    moveToBackground(taskId: string) { publish(moveToBackground(current, taskId)) },
    dismiss(taskId: string) { publish(dismiss(current, taskId)) },
    clearFinished() { publish(clearFinished(current)) },
    /**
     * The stream that reported these tasks ended (or broke) before they did: they will never say
     * how they ended, so they end failed here — a task left "running" forever is a lie.
     */
    failUnfinished(taskIds: Iterable<string>, error?: string, now = Date.now()) {
        let next = current
        for (const id of taskIds) {
            const entry = next.entries.find((e) => e.progress.taskId === id)
            if (entry && !isFinished(entry.progress)) {
                next = applyProgress(next, { ...entry.progress, state: 'failed', error: error ?? entry.progress.error ?? null }, now)
            }
        }
        publish(next)
    },
    find(taskId: string): TaskEntry | undefined {
        return current.entries.find((e) => e.progress.taskId === taskId)
    },
    subscribe(listener: Listener): () => void {
        listeners.add(listener)
        return () => listeners.delete(listener)
    },
    /** test hook */
    reset() { current = emptyTaskState(); listeners.clear() },
}
