// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SSEService } from './SSEService'
import { setNotifier } from './Notifier'
import { upstream } from '@domain/state.ts'
import { onSessionExpired } from '@infra/http/sessionGuard.ts'
import { taskStore } from '@infra/progress/taskStore.ts'
import { recoverBrokenTasks } from '@infra/progress/reattach.ts'

vi.mock('@infra/progress/reattach.ts', () => ({ recoverBrokenTasks: vi.fn() }))

/**
 * A streamed action that reports a TASK (Progress commands): the task center owns it from its first
 * report — the page's veil is released at once, the task outlives its screen (the stream is read to
 * the end, only its page-level parts apply once the screen is gone), and a stream that breaks under
 * it ends the task failed.
 */
describe('SSEService task streams', () => {
    const service = new SSEService()
    let events: string[]
    let initiator: HTMLElement
    let commands: { type?: string }[]
    let sub: { unsubscribe(): void }

    const progress = (state: string, extra = '') =>
        `data: {"commands":[{"type":"Progress","data":{"taskId":"t1","title":"Import","state":"${state}","blocking":false${extra}}}]}\n\n`

    const streamOf = (chunks: string[], fail = false) => new ReadableStream<Uint8Array>({
        start(controller) {
            const enc = new TextEncoder()
            chunks.forEach(c => controller.enqueue(enc.encode(c)))
            // (later: an error right away would discard what was queued)
            if (fail) setTimeout(() => controller.error(new Error('connection reset')), 5)
            else controller.close()
        },
    })
    const respond = (chunks: string[], fail = false) => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200, body: streamOf(chunks, fail), text: async () => '' }))
    }
    const run = async (isStale?: () => boolean) => {
        service.runAction({} as never, '/base', 'import', '', 'importAll', 'cmp-1', {}, 'my.Type', {}, {},
            initiator, false, undefined, false, 'tok', { isStale })
        for (let i = 0; i < 30; i++) await new Promise(r => setTimeout(r, 0))
    }

    beforeEach(() => {
        vi.mocked(recoverBrokenTasks).mockClear()
        taskStore.reset()
        events = []; commands = []
        initiator = document.createElement('div')
        initiator.id = 'cmp-1'
        initiator.attachShadow({ mode: 'open' })
        document.body.appendChild(initiator)
        for (const type of ['backend-called-event', 'backend-succeeded-event', 'backend-failed-event', 'backend-cancelled-event']) {
            initiator.addEventListener(type, () => events.push(type))
        }
        setNotifier({ show: () => undefined })
        sub = upstream.subscribe((m: { command?: { type?: string } }) => { if (m?.command) commands.push(m.command) })
    })
    afterEach(() => { sub.unsubscribe(); vi.unstubAllGlobals(); document.body.innerHTML = '' })

    it('feeds the task center and releases the veil at the first report, once', async () => {
        respond([progress('running'), progress('running', ',"fraction":0.5'), progress('done')])
        await run()
        expect(taskStore.find('t1')?.progress.state).toBe('done')
        expect(taskStore.find('t1')?.origin).toMatchObject({ baseUrl: '/base', serverSideType: 'my.Type', actionId: 'importAll' })
        expect(events).toEqual(['backend-called-event', 'backend-succeeded-event'])
        // Progress never reaches the components
        expect(commands.filter((c) => c.type === 'Progress')).toEqual([])
    })

    it('a task outlives its screen: read to the end, only page-level parts apply once the screen is gone', async () => {
        respond([progress('running'), 'data: {"commands":[{"type":"NavigateTo","data":"/elsewhere"}]}\n\n', progress('done')])
        // the user leaves the screen right after the task first reported
        await run(() => !!taskStore.find('t1'))
        expect(taskStore.find('t1')?.progress.state).toBe('done')
        expect(commands.map((c) => c.type)).not.toContain('NavigateTo')
        expect(events).not.toContain('backend-cancelled-event')
    })

    it('a stream that ends before its task did goes looking for the task instead of failing it', async () => {
        respond([progress('running')])
        await run()
        expect(taskStore.find('t1')?.progress.state).toBe('running')
        expect(recoverBrokenTasks).toHaveBeenCalledWith('/base', 'my.Type', ['t1'], undefined)
    })

    it('a stream that breaks under a running task does too, with what broke', async () => {
        respond([progress('running')], true)
        await run()
        await new Promise(r => setTimeout(r, 30))
        expect(taskStore.find('t1')?.progress.state).toBe('running')
        expect(recoverBrokenTasks).toHaveBeenCalledWith('/base', 'my.Type', ['t1'], 'connection reset')
    })

    it('an error line is the server saying it failed: nothing to resume', async () => {
        respond([progress('running'), '{"message":"Import blew up"}\n\n'])
        await run()
        expect(taskStore.find('t1')?.progress).toMatchObject({ state: 'failed', error: 'Import blew up' })
        expect(recoverBrokenTasks).not.toHaveBeenCalled()
    })

    it('a task that ended is not looked for', async () => {
        respond([progress('running'), progress('done')])
        await run()
        expect(recoverBrokenTasks).not.toHaveBeenCalled()
    })

    it('a resume stream is the last try: it fails what it leaves running, even with no event at all', async () => {
        taskStore.upsert({ taskId: 't1', title: 'Import', state: 'running', blocking: false } as never, { baseUrl: '/base' })
        respond([])
        service.runAction({} as never, '/base', '', '', '_progress-resume', 'c', {}, 'my.Type', {}, {},
            initiator, true, undefined, false, '', { resumesTasks: ['t1'] })
        for (let i = 0; i < 30; i++) await new Promise(r => setTimeout(r, 0))
        expect(taskStore.find('t1')?.progress.state).toBe('failed')
        expect(recoverBrokenTasks).not.toHaveBeenCalled()
    })

    it('leaving the screen before the first event does not cancel a stream that turns out to be a task', async () => {
        respond([progress('running'), progress('done')])
        await run(() => true)
        expect(taskStore.find('t1')?.progress.state).toBe('done')
        expect(events).not.toContain('backend-cancelled-event')
    })

    it('a stale stream whose first event is no task is dropped as before', async () => {
        respond(['data: {"commands":[{"type":"NavigateTo","data":"/x"}]}\n\n'])
        await run(() => true)
        expect(commands.map((c) => c.type)).not.toContain('NavigateTo')
        expect(events).toContain('backend-cancelled-event')
    })

    it('the task center\'s Retry still works once the screen is gone (the failed run\'s view is stale for good)', async () => {
        respond([progress('failed', ',"retryable":true')])
        await run(() => true)
        const entry = taskStore.find('t1')!
        expect(entry.progress.state).toBe('failed')
        taskStore.dismiss('t1')
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200, body: streamOf([progress('running'), progress('done')]), text: async () => '' }))
        entry.origin!.retry!()
        for (let i = 0; i < 30; i++) await new Promise(r => setTimeout(r, 0))
        expect(taskStore.find('t1')?.progress.state).toBe('done')
    })

    it('that Retry says so when it cannot start, with no screen left to tell', async () => {
        const shown: string[] = []
        setNotifier({ show: (toast: { text?: string }) => { shown.push(toast.text ?? '') } } as never)
        respond([progress('failed', ',"retryable":true')])
        await run(() => true)
        const entry = taskStore.find('t1')!
        taskStore.dismiss('t1')
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500, headers: new Headers(), text: async () => 'boom' }))
        entry.origin!.retry!()
        for (let i = 0; i < 30; i++) await new Promise(r => setTimeout(r, 0))
        expect(shown).toHaveLength(1)
    })

    it('carries the @AppContext values, its own app state winning', async () => {
        localStorage.setItem('mateu-app-context', JSON.stringify({ hotel: 'B', company: 'C1' }))
        const { appState } = await import('@domain/state.ts')
        appState.value = { company: 'C2' }
        respond([progress('done')])
        await run()
        const body = JSON.parse(((fetch as unknown as { mock: { calls: [string, RequestInit][] } }).mock.calls[0][1].body) as string)
        expect(body.appState).toEqual({ hotel: 'B', company: 'C2' })
        appState.value = {}
        localStorage.removeItem('mateu-app-context')
    })

    describe('an expired session', () => {
        const respondInTurn = (...responses: unknown[]) => {
            const fetchMock = vi.fn()
            responses.forEach((r) => fetchMock.mockResolvedValueOnce(r))
            vi.stubGlobal('fetch', fetchMock)
            return fetchMock
        }
        const unauthorized = { ok: false, status: 401, headers: new Headers(), text: async () => 'expired' }
        afterEach(() => onSessionExpired(undefined))

        it('re-authenticates and runs the action again, once and as one action', async () => {
            onSessionExpired((context) => context.retry())
            const fetchMock = respondInTurn(unauthorized, { ok: true, status: 200, headers: new Headers(), body: streamOf([progress('done')]), text: async () => '' })
            await run()
            expect(fetchMock).toHaveBeenCalledTimes(2)
            expect(taskStore.find('t1')?.progress.state).toBe('done')
            expect(events.filter((e) => e === 'backend-called-event')).toHaveLength(1)
            expect(events).not.toContain('backend-failed-event')
        })

        it('a second 401 fails: it does not ask again', async () => {
            const asked = vi.fn((context: { retry: () => void }) => context.retry())
            onSessionExpired(asked)
            const fetchMock = respondInTurn(unauthorized, unauthorized)
            await run()
            expect(fetchMock).toHaveBeenCalledTimes(2)
            expect(asked).toHaveBeenCalledTimes(1)
            expect(events).toContain('backend-failed-event')
        })

        it('the user declining fails the action; a view no longer on screen does not ask', async () => {
            onSessionExpired((context) => context.giveUp())
            respondInTurn(unauthorized)
            await run()
            expect(events).toContain('backend-failed-event')

            const asked = vi.fn()
            onSessionExpired(asked)
            respondInTurn(unauthorized)
            await run(() => true)
            expect(asked).not.toHaveBeenCalled()
        })
    })
})
