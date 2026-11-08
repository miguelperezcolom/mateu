// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SSEService } from './SSEService'
import { setNotifier } from './Notifier'
import { upstream } from '@domain/state.ts'
import { taskStore } from '@infra/progress/taskStore.ts'

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

    it('a stream that ends before its task did ends the task failed', async () => {
        respond([progress('running')])
        await run()
        expect(taskStore.find('t1')?.progress.state).toBe('failed')
    })

    it('a stream that breaks under a running task ends it failed, with what broke', async () => {
        respond([progress('running')], true)
        await run()
        await new Promise(r => setTimeout(r, 30))
        expect(taskStore.find('t1')?.progress).toMatchObject({ state: 'failed', error: 'connection reset' })
    })
})
