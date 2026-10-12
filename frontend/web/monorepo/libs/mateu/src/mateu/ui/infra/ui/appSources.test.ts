import { afterEach, describe, expect, it, vi } from 'vitest'
import { contextOptionsOf, markReadVars, notificationsOf, runAppSource, searchHitsOf } from '@infra/ui/appSources'
import { setRestSourceCatalogue } from '@infra/http/restSourceCatalogue'
import { mateuApiClient } from '@infra/http/AxiosMateuApiClient'
import { switcherRoute } from '@infra/ui/recordSwitcherModel'
import { interpolate } from '@infra/ui/interpolation'

// A data-authored shell's header feeds (context picker options, inbox, palette search) from REST
// sources: the shaping below is the same whichever leg fetched the response.
describe('app shell sources — shaping', () => {
    afterEach(() => setRestSourceCatalogue([]))

    it('reads inbox entries through the source field map, unread by default', () => {
        setRestSourceCatalogue([{ name: 'inbox', source: { url: '/inbox', itemsPath: 'items' }, fields: { title: 'subject' } } as never])
        const list = notificationsOf({ items: [{ id: 1, subject: 'Hello', unread: false }, { id: 'n2', subject: 'Bye', route: 'orders/2' }] }, { ref: 'inbox' })
        expect(list).toEqual([
            { id: '1', title: 'Hello', text: null, route: null, unread: false, when: null },
            { id: 'n2', title: 'Bye', text: null, route: 'orders/2', unread: true, when: null },
        ])
    })

    it('reads palette hits from a bare array and drops hits with nowhere to go', () => {
        const hits = searchHitsOf([{ label: 'Ada', route: 'customers/1', category: 'Customers' }, { label: 'Nowhere' }], { url: '/s' })
        expect(hits).toEqual([{ label: 'Ada', description: null, route: 'customers/1', category: 'Customers' }])
    })

    it('reads picker options through itemsPath/valuePath/labelPath', () => {
        const options = contextOptionsOf({ content: [{ id: 'C1', name: 'Acme' }] }, { url: '/c', itemsPath: 'content', valuePath: 'id', labelPath: 'name' })
        expect(options).toEqual([{ value: 'C1', label: 'Acme' }])
    })

    it('a mark-as-read call gets the ids comma-joined, the first one and whether it is all', () => {
        expect(markReadVars(['a', 'b'], false)).toEqual({ ids: 'a,b', id: 'a', all: false })
    })
})

describe('app shell sources — the two legs', () => {
    afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals() })
    const app = { rootRoute: '', serverSideType: 'shell' } as never
    const host = {} as HTMLElement

    it('fetches a direct source in the browser, interpolating the variables', async () => {
        const fetchMock = vi.fn(async () => ({ ok: true, status: 200, text: async () => '[]' }))
        vi.stubGlobal('fetch', fetchMock)
        await runAppSource(app, '', 'globalSearch', { url: 'https://x.test/search?q=${state.searchText}' }, { searchText: 'ada' }, host)
        expect((fetchMock.mock.calls[0] as unknown[])[0]).toBe('https://x.test/search?q=ada')
    })

    it('sends a proxied source through _appsource, naming the role and never the url', async () => {
        const run = vi.spyOn(mateuApiClient, 'runAction').mockResolvedValue({ appData: { _restfetch: { items: [] } } } as never)
        const json = await runAppSource(app, '', 'contextOptions', { url: '/c', proxy: true }, { searchText: '' }, host, 'company')
        expect(json).toEqual({ items: [] })
        const params = run.mock.calls[0][8] as Record<string, unknown>
        expect(run.mock.calls[0][3]).toBe('_appsource')
        expect(params).toEqual({ searchText: '', _appSource: 'contextOptions', _field: 'company' })
    })

    it('a proxied failure is an error, not an empty answer', async () => {
        vi.spyOn(mateuApiClient, 'runAction').mockResolvedValue({ appData: { _restfetchError: { status: 404, message: 'nope' } } } as never)
        await expect(runAppSource(app, '', 'notifications', { url: '/i', proxy: true }, {}, host)).rejects.toThrow('nope')
    })
})

describe('record switcher route (a YAML page\'s recordSwitcher.route)', () => {
    const switcher = { options: [], value: '1', actionId: '_switchRecord', route: 'customers/${state._record}' } as never
    const resolve = (t: string, s: Record<string, unknown>) => interpolate(t, s)

    it('navigates to the route with the picked value', () => {
        expect(switcherRoute(switcher, '2', {}, resolve)).toBe('customers/2')
    })

    it('does nothing for the current value, and leaves a switcher without route to its action', () => {
        expect(switcherRoute(switcher, '1', {}, resolve)).toBeNull()
        expect(switcherRoute({ ...(switcher as object), route: null } as never, '2', {}, resolve)).toBeNull()
    })
})
