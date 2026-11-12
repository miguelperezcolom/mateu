import { afterEach, describe, expect, it, vi } from 'vitest'
import { sourcedOptionsOf } from './sourcedOptions'

/** The one loader every options control uses: fetched once per interpolated url, proxied on demand. */
const ITEMS = [{ id: 7, name: 'Apollo 11' }, { id: 25, name: 'Artemis III' }]

type Host = EventTarget & { state: Record<string, unknown>, data: Record<string, any>, requestUpdate: () => void, updates: number }

const hostOf = (state: Record<string, unknown> = {}): Host => {
    const host = new EventTarget() as Host
    host.state = state
    host.data = {}
    host.updates = 0
    host.requestUpdate = () => { host.updates++ }
    return host
}

afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
})

describe('sourcedOptionsOf', () => {
    it('fetches directly, maps value/label paths, and asks again only when the url changes', async () => {
        const fetchMock = vi.fn(async () => new Response(JSON.stringify(ITEMS), { status: 200, headers: { 'Content-Type': 'application/json' } }))
        vi.stubGlobal('fetch', fetchMock)
        const host = hostOf({ q: 'a' })
        const src = { url: 'https://api.example.test/missions?q=${state.q}', valuePath: 'id', labelPath: 'name' }
        expect(sourcedOptionsOf(host, 'k', 'f', src as never)).toEqual([])
        await vi.waitFor(() => expect(host.updates).toBe(1))
        expect(sourcedOptionsOf(host, 'k', 'f', src as never)).toEqual([{ value: 7, label: 'Apollo 11' }, { value: 25, label: 'Artemis III' }])
        expect(fetchMock).toHaveBeenCalledTimes(1)
        host.state.q = 'b'
        sourcedOptionsOf(host, 'k', 'f', src as never)
        await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))
    })

    it('a proxied source dispatches __restfetch__ naming only the field, and maps the answer', () => {
        const host = hostOf()
        const asked: any[] = []
        host.addEventListener('action-requested', (e) => asked.push((e as CustomEvent).detail))
        const src = { url: 'https://secret.example.test/x', proxy: true, valuePath: 'id', labelPath: 'name' }
        sourcedOptionsOf(host, 'k', 'tags', src as never)
        expect(asked).toHaveLength(1)
        expect(asked[0].actionId).toBe('__restfetch__')
        expect(asked[0].parameters).toEqual({ _sourceKind: 'options', _sourceId: 'tags' })
        asked[0].callback({ appData: { _restfetch: ITEMS } })
        expect(host.data.k.content.map((o: any) => o.value)).toEqual([7, 25])
        expect(host.updates).toBe(1)
    })
})
