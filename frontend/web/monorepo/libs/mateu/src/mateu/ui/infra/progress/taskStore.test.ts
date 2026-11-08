import { beforeEach, describe, expect, it } from 'vitest'
import {
    applyProgress, blockingTask, clearFinished, countsOf, dismiss, elapsedSeconds, emptyTaskState, formatElapsed,
    listedTasks, MAX_FINISHED, moveToBackground, percentOf, stepCountOf, taskStore,
} from './taskStore'
import type { Progress } from '@mateu/shared/apiClients/dtos/Progress.ts'

/**
 * The task center's state: tasks upserted by id from self-contained Progress commands, several at
 * once, recently finished ones kept (bounded), the blocking overlay picked, counts for the badge.
 */
const p = (taskId: string, over: Partial<Progress> = {}): Progress =>
    ({ taskId, title: taskId, text: '', state: 'running', blocking: false, ...over })

describe('taskStore (pure)', () => {
    it('upserts by taskId: a new id adds a task, the same id replaces its state', () => {
        let s = applyProgress(emptyTaskState(), p('a', { text: 'one' }), 0)
        s = applyProgress(s, p('b'), 1)
        s = applyProgress(s, p('a', { text: 'two', fraction: 0.5 }), 2)
        expect(s.entries.map((e) => [e.progress.taskId, e.progress.text])).toEqual([['a', 'two'], ['b', '']])
        expect(s.entries[0].seenAt).toBe(0)
        expect(s.entries[0].updatedAt).toBe(2)
    })

    it('a finished task is never revived by a late update (cancel echo vs stream end)', () => {
        let s = applyProgress(emptyTaskState(), p('a'), 0)
        s = applyProgress(s, p('a', { state: 'cancelled' }), 1)
        const after = applyProgress(s, p('a', { state: 'done' }), 2)
        expect(after).toBe(s)
        expect(after.entries[0].finishedAt).toBe(1)
    })

    it('keeps the origin of the first report', () => {
        const initiator = {} as HTMLElement
        let s = applyProgress(emptyTaskState(), p('a'), 0, { initiator, actionId: 'run' })
        s = applyProgress(s, p('a', { text: 'x' }), 1)
        expect(s.entries[0].origin?.actionId).toBe('run')
    })

    it(`keeps at most ${MAX_FINISHED} finished tasks, the oldest go first; running ones are never dropped`, () => {
        let s = emptyTaskState()
        s = applyProgress(s, p('running'), 0)
        for (let i = 0; i < MAX_FINISHED + 3; i++) s = applyProgress(s, p('t' + i, { state: 'done' }), i + 1)
        const ids = s.entries.map((e) => e.progress.taskId)
        expect(ids).toContain('running')
        expect(ids.filter((id) => id !== 'running')).toHaveLength(MAX_FINISHED)
        expect(ids).not.toContain('t0')
        expect(ids).toContain('t' + (MAX_FINISHED + 2))
    })

    it('counts running, finished and failed (for the indicator)', () => {
        let s = applyProgress(emptyTaskState(), p('a'), 0)
        s = applyProgress(s, p('b', { state: 'failed' }), 0)
        s = applyProgress(s, p('c', { state: 'done' }), 0)
        expect(countsOf(s)).toEqual({ running: 1, finished: 2, failed: 1 })
    })

    it('a blocking running task is the overlay until moved to the background', () => {
        let s = applyProgress(emptyTaskState(), p('bg'), 0)
        s = applyProgress(s, p('modal', { blocking: true, backgroundable: true }), 0)
        expect(blockingTask(s, 0)?.progress.taskId).toBe('modal')
        s = moveToBackground(s, 'modal')
        expect(blockingTask(s, 0)).toBeUndefined()
        expect(listedTasks(s).map((e) => e.progress.taskId)).toEqual(['modal', 'bg'])
    })

    it('a finished blocking task stays until closed, or until its closeAfterSeconds', () => {
        let s = applyProgress(emptyTaskState(), p('m', { blocking: true }), 0)
        s = applyProgress(s, p('m', { blocking: true, state: 'done' }), 1000)
        expect(blockingTask(s, 999_999)?.progress.taskId).toBe('m')
        let t = applyProgress(emptyTaskState(), p('m', { blocking: true }), 0)
        t = applyProgress(t, p('m', { blocking: true, state: 'done', closeAfterSeconds: 2 }), 1000)
        expect(blockingTask(t, 2500)?.progress.taskId).toBe('m')
        expect(blockingTask(t, 3001)).toBeUndefined()
        expect(blockingTask(dismiss(s, 'm'), 0)).toBeUndefined()
    })

    it('dismissing a finished task removes it; clearFinished removes every finished one', () => {
        let s = applyProgress(emptyTaskState(), p('a', { state: 'done' }), 0)
        s = applyProgress(s, p('b'), 0)
        s = applyProgress(s, p('c', { state: 'failed' }), 0)
        expect(dismiss(s, 'a').entries.map((e) => e.progress.taskId)).toEqual(['b', 'c'])
        expect(clearFinished(s).entries.map((e) => e.progress.taskId)).toEqual(['b'])
    })

    it('step counts, percent and elapsed time', () => {
        expect(stepCountOf(p('a', { done: 12, total: 300 }))).toEqual({ done: 12, total: 300 })
        expect(stepCountOf(p('a', { total: 0 }))).toBeUndefined()
        expect(percentOf(p('a', { fraction: 0.256 }))).toBe(26)
        expect(percentOf(p('a', { fraction: null }))).toBeUndefined()
        expect(percentOf(p('a', { fraction: 3 }))).toBe(100)
        const s = applyProgress(emptyTaskState(), p('a'), 1000)
        expect(elapsedSeconds(s.entries[0], 66_000)).toBe(65)
        expect(formatElapsed(65)).toBe('1:05')
        expect(formatElapsed(3725)).toBe('1:02:05')
    })
})

describe('taskStore (singleton)', () => {
    beforeEach(() => taskStore.reset())

    it('notifies its listeners and fails the tasks a broken stream left running', () => {
        const seen: number[] = []
        taskStore.subscribe((s) => seen.push(s.entries.length))
        taskStore.upsert(p('a'), undefined, 0)
        taskStore.upsert(p('b', { state: 'done' }), undefined, 0)
        taskStore.failUnfinished(['a', 'b'], 'Connection lost', 5)
        expect(taskStore.find('a')?.progress).toMatchObject({ state: 'failed', error: 'Connection lost' })
        expect(taskStore.find('b')?.progress.state).toBe('done')
        expect(seen).toEqual([1, 2, 2])
    })
})
