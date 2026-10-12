// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SSEService } from './SSEService'
import { setNotifier } from './Notifier'
import { upstream } from '@domain/state.ts'

/**
 * The streamed (SSE) action path — LongTask progress, app-header actions. It is a bare fetch, so
 * nothing the axios client does is inherited: each streamed increment must be applied as it
 * arrives (even when an event is split across network chunks), a server error line must FAIL the
 * action with its message and a Retry, and an HTTP error must not read as an empty success.
 */
describe('SSEService streaming', () => {
    const service = new SSEService()
    let events: { type: string, detail: any }[]
    let initiator: HTMLElement
    let toasts: unknown[]
    let fragments: unknown[]
    let sub: { unsubscribe(): void }

    const streamOf = (chunks: string[]) => new ReadableStream<Uint8Array>({
        start(controller) {
            const enc = new TextEncoder()
            chunks.forEach(c => controller.enqueue(enc.encode(c)))
            controller.close()
        },
    })
    const respond = (init: { ok?: boolean, status?: number, chunks?: string[], text?: string }) => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: init.ok ?? true,
            status: init.status ?? 200,
            body: init.chunks ? streamOf(init.chunks) : null,
            text: async () => init.text ?? '',
        }))
    }
    const run = async (callback?: (r?: unknown) => void, background = false) => {
        service.runAction({} as never, '/base', 'deploy', '', 'go', 'cmp-1', {}, 'my.Type', { a: 1 }, { p: 2 },
            initiator, background, callback, false, 'tok')
        // let the fetch + stream settle
        for (let i = 0; i < 20; i++) await new Promise(r => setTimeout(r, 0))
    }

    beforeEach(() => {
        events = []; toasts = []; fragments = []
        initiator = document.createElement('div')
        initiator.attachShadow({ mode: 'open' })
        document.body.appendChild(initiator)
        for (const type of ['backend-called-event', 'backend-succeeded-event', 'backend-failed-event', 'backend-cancelled-event']) {
            initiator.addEventListener(type, (e) => events.push({ type, detail: (e as CustomEvent).detail }))
        }
        setNotifier({ show: (m) => toasts.push(m) })
        sub = upstream.subscribe((m: { fragment?: unknown }) => { if (m?.fragment) fragments.push(m.fragment) })
    })
    afterEach(() => { sub.unsubscribe(); vi.unstubAllGlobals(); document.body.innerHTML = '' })

    it('posts the action to /mateu/v3/sse/<route> with the component state and parameters', async () => {
        respond({ chunks: [] })
        await run()
        const [url, init] = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0]
        expect(url).toBe('/base/mateu/v3/sse/deploy')
        const body = JSON.parse((init as RequestInit).body as string)
        expect(body).toMatchObject({ serverSideType: 'my.Type', componentState: { a: 1 }, parameters: { p: 2 },
            initiatorComponentId: 'cmp-1', route: '/deploy', actionId: 'go' })
        expect((init as RequestInit).headers).toMatchObject({ Accept: 'text/event-stream' })
    })

    it('applies every streamed increment as it arrives, even when an event is split across chunks', async () => {
        respond({ chunks: [
            'data: {"messages":[{"text":"step 1"}]}\n\n',
            'data: {"fragments":[{"targetComponentId":"x"',
            ',"state":{"done":true}}]}\n\n',
        ] })
        const seen: unknown[] = []
        await run((r) => seen.push(r))
        expect(seen).toHaveLength(2)
        expect(toasts.map(t => (t as { text: string }).text)).toEqual(['step 1'])
        expect(fragments).toEqual([{ targetComponentId: 'x', state: { done: true } }])
        expect(events.map(e => e.type)).toEqual(['backend-called-event', 'backend-succeeded-event'])
    })

    it('a server error line fails the action with ITS message and a Retry that re-runs it', async () => {
        respond({ chunks: ['{"message":"Deploy refused"}\n\n'] })
        await run()
        const failed = events.find(e => e.type === 'backend-failed-event')!
        expect(failed.detail.actionId).toBe('go')
        expect((failed.detail.reason as Error).message).toBe('Deploy refused')
        expect(typeof failed.detail.retry).toBe('function')
        expect(events.map(e => e.type)).not.toContain('backend-succeeded-event')

        respond({ chunks: [] })
        failed.detail.retry()
        for (let i = 0; i < 20; i++) await new Promise(r => setTimeout(r, 0))
        expect(fetch).toHaveBeenCalledTimes(1) // the re-stubbed fetch, called by the retry
    })

    it('a validation error carried in _embedded.errors shows the first one', async () => {
        respond({ chunks: ['{"message":"Bad Request","_embedded":{"errors":[{"message":"name: must not be blank"}]}}\n\n'] })
        await run()
        const failed = events.find(e => e.type === 'backend-failed-event')!
        expect((failed.detail.reason as Error).message).toBe('name: must not be blank')
    })

    it('an HTTP error status FAILS the action instead of reading as an empty, successful stream', async () => {
        respond({ ok: false, status: 403, text: '' })
        await run()
        expect(events.map(e => e.type)).toEqual(['backend-called-event', 'backend-failed-event'])
        expect((events[1].detail.reason as Error).message).toBe('HTTP 403')
    })

    it('an HTTP error with a JSON body fails with its message', async () => {
        respond({ ok: false, status: 500, text: '{"message":"Something went wrong"}' })
        await run()
        expect((events.at(-1)!.detail.reason as Error).message).toBe('Something went wrong')
    })

    it('a background action does not announce itself as busy', async () => {
        respond({ chunks: [] })
        await run(undefined, true)
        expect(events.map(e => e.type)).toEqual([])
    })

    it('appState/appData in a streamed increment notify app-data-updated', async () => {
        respond({ chunks: ['data: {"appState":{"hotel":"h1"}}\n\n'] })
        const updates: unknown[] = []
        initiator.addEventListener('app-data-updated', () => updates.push(1))
        await run()
        expect(updates).toHaveLength(1)
    })
})
