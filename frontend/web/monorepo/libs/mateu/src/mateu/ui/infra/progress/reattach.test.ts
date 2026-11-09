// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type UICommand from '@mateu/shared/apiClients/dtos/UICommand.ts'
import type { Progress } from '@mateu/shared/apiClients/dtos/Progress.ts'
import { byBaseUrl, reattachTasks, recoverBrokenTasks, resetReattach, type ReattachDeps } from './reattach'
import { forgetTask, MAX_REMEMBERED, rememberedTasks, rememberTask, TASK_MEMORY_KEY } from './taskMemory'
import { applyGlobalCommand } from './globalCommands'
import { taskStore } from './taskStore'
import { resetTaskCenterMount } from './taskCenterMount'

/**
 * Reattach after a reload: the tab remembers the tasks its streams report (session storage), and
 * on boot asks `_progress-tasks` for them, puts the answers in the task center and resumes the
 * running ones; ids the server does not answer (unknown, expired, someone else's) are forgotten.
 */
const progress = (taskId: string, over: Partial<Progress> = {}): Progress =>
    ({ taskId, title: taskId, state: 'running', blocking: false, ...over })
const command = (p: Progress): UICommand => ({ type: 'Progress', data: p, targetComponentId: '' })

beforeEach(() => {
    sessionStorage.clear()
    taskStore.reset()
    resetReattach()
    resetTaskCenterMount()
})

describe('a broken stream goes looking for its tasks', () => {
    const NO_WAIT = [0, 0]
    const retry = vi.fn()
    const started = (id: string) => taskStore.upsert(progress(id), { baseUrl: '/app', retry })
    const answering = (...found: Progress[]): ReattachDeps => ({
        list: vi.fn(async () => ({ commands: found.map(command) }) as never),
        resume: vi.fn(),
    })

    it('a task still running is followed again and stays as it was, Retry included', async () => {
        started('t1')
        const deps = answering(progress('t1', { text: 'half way' }))
        await recoverBrokenTasks('/app', 'x.Import', ['t1'], 'reset', deps, NO_WAIT)
        expect(deps.resume).toHaveBeenCalledWith({ taskId: 't1', baseUrl: '/app', serverSideType: 'x.Import' })
        expect(taskStore.find('t1')?.progress).toMatchObject({ state: 'running', text: 'half way' })
        expect(taskStore.find('t1')?.origin?.retry).toBe(retry)
    })

    it('a task that ended meanwhile takes its real end, with no stream', async () => {
        started('t1')
        const deps = answering(progress('t1', { state: 'done' }))
        await recoverBrokenTasks('/app', undefined, ['t1'], 'reset', deps, NO_WAIT)
        expect(taskStore.find('t1')?.progress.state).toBe('done')
        expect(deps.resume).not.toHaveBeenCalled()
    })

    it('a task the server no longer knows ends failed, with what broke', async () => {
        started('t1')
        await recoverBrokenTasks('/app', undefined, ['t1'], 'reset', answering(), NO_WAIT)
        expect(taskStore.find('t1')?.progress).toMatchObject({ state: 'failed', error: 'reset' })
    })

    it('tries again while the backend is out of reach, then gives up and fails the task', async () => {
        started('t1')
        const deps: ReattachDeps = { list: vi.fn().mockRejectedValue(new Error('offline')), resume: vi.fn() }
        await recoverBrokenTasks('/app', undefined, ['t1'], 'reset', deps, NO_WAIT)
        expect(deps.list).toHaveBeenCalledTimes(2)
        expect(taskStore.find('t1')?.progress).toMatchObject({ state: 'failed', error: 'reset' })
    })

    it('a blip shorter than the waits costs nothing', async () => {
        started('t1')
        const deps = answering(progress('t1'))
        vi.mocked(deps.list).mockRejectedValueOnce(new Error('offline'))
        await recoverBrokenTasks('/app', undefined, ['t1'], 'reset', deps, NO_WAIT)
        expect(taskStore.find('t1')?.progress.state).toBe('running')
        expect(deps.resume).toHaveBeenCalledTimes(1)
    })
})

describe('task memory', () => {
    it('a running task a stream reports is remembered; its end forgets it', () => {
        applyGlobalCommand(command(progress('t1')), { baseUrl: '/app', route: '/import', serverSideType: 'x.Import' })
        expect(rememberedTasks()).toEqual([{ taskId: 't1', baseUrl: '/app', route: '/import', serverSideType: 'x.Import' }])
        expect(JSON.parse(sessionStorage.getItem(TASK_MEMORY_KEY)!)).toHaveLength(1)
        applyGlobalCommand(command(progress('t1', { state: 'done' })), { baseUrl: '/app' })
        expect(rememberedTasks()).toEqual([])
        expect(sessionStorage.getItem(TASK_MEMORY_KEY)).toBeNull()
    })

    it('a Progress that did not come from a stream (no base url) is not remembered', () => {
        applyGlobalCommand(command(progress('t1')), { initiator: document.body })
        expect(rememberedTasks()).toEqual([])
    })

    it('remembers each task once, at most MAX_REMEMBERED, and tolerates garbage in storage', () => {
        for (let i = 0; i < MAX_REMEMBERED + 5; i++) rememberTask({ taskId: `t${i}`, baseUrl: '' })
        rememberTask({ taskId: 't10', baseUrl: '' }) // known: not added twice
        expect(rememberedTasks()).toHaveLength(MAX_REMEMBERED)
        expect(rememberedTasks()[0].taskId).toBe('t5')
        forgetTask('nope')
        sessionStorage.setItem(TASK_MEMORY_KEY, '{"not":"a list"}')
        expect(rememberedTasks()).toEqual([])
        sessionStorage.setItem(TASK_MEMORY_KEY, '[{"taskId":1},{"taskId":"ok","baseUrl":""}]')
        expect(rememberedTasks().map((t) => t.taskId)).toEqual(['ok'])
    })
})

describe('reattachTasks', () => {
    it('asks per base url, shows the answers, resumes the running ones and forgets the rest', async () => {
        rememberTask({ taskId: 'a', baseUrl: '/one', serverSideType: 'x.A' })
        rememberTask({ taskId: 'b', baseUrl: '/one' })
        rememberTask({ taskId: 'c', baseUrl: '/two' })
        rememberTask({ taskId: 'foreign', baseUrl: '/two' })
        const list = vi.fn<ReattachDeps['list']>(async (baseUrl, _sst, ids) => ({
            commands: baseUrl === '/one'
                ? [command(progress('a', { fraction: 0.4, etaSeconds: 30 })), command(progress('b', { state: 'done' }))]
                // a foreign id is simply absent; an id the client did not ask for is ignored
                : [command(progress('c')), command(progress('zzz'))].filter((c) => ids.includes((c.data as Progress).taskId)),
        }) as never)
        const resume = vi.fn<ReattachDeps['resume']>()
        await reattachTasks({ list, resume })

        expect(list).toHaveBeenCalledWith('/one', 'x.A', ['a', 'b'])
        expect(list).toHaveBeenCalledWith('/two', undefined, ['c', 'foreign'])
        expect(resume.mock.calls.map((c) => c[0].taskId).sort()).toEqual(['a', 'c'])
        expect(taskStore.find('a')?.progress.etaSeconds).toBe(30)
        // reattached: no screen behind it, so no initiator and no Retry
        expect(taskStore.find('a')?.origin?.initiator).toBeUndefined()
        expect(taskStore.find('a')?.origin?.retry).toBeUndefined()
        expect(taskStore.find('a')?.origin?.baseUrl).toBe('/one')
        expect(taskStore.find('b')?.progress.state).toBe('done')
        expect(rememberedTasks().map((t) => t.taskId).sort()).toEqual(['a', 'c'])
    })

    it('runs once per page, and keeps the tasks when the backend cannot be reached', async () => {
        rememberTask({ taskId: 'a', baseUrl: '' })
        const list = vi.fn<ReattachDeps['list']>(async () => { throw new Error('offline') })
        await reattachTasks({ list, resume: vi.fn() })
        await reattachTasks({ list, resume: vi.fn() })
        expect(list).toHaveBeenCalledTimes(1)
        expect(rememberedTasks()).toHaveLength(1)
    })

    it('groups by base url', () => {
        const groups = byBaseUrl([{ taskId: 'a', baseUrl: 'x' }, { taskId: 'b', baseUrl: 'y' }, { taskId: 'c', baseUrl: 'x' }])
        expect([...groups.keys()]).toEqual(['x', 'y'])
        expect(groups.get('x')!.map((t) => t.taskId)).toEqual(['a', 'c'])
    })
})
