import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MateuTableCrud } from './mateu-table-crud'
import { isListingMove } from './navigationUrl'
import { installHistoryIndex, isListingEntry, notePopState, resetHistoryIndexForTests } from './historyIndex'
import { LISTING_ENTRY, listingUrlPrefix, ownParams, registerListing, resetListingScopesForTests, unregisterListing, withOwnParams } from './listingUrlScope'

/**
 * Back/Forward between two states of a listing re-searches in place (review M6): the listing marks
 * the entries it writes, a run of multi-select toggles is ONE entry, the default saved view applied
 * on opening replaces the entry, and two listings on one page keep apart in the query string.
 */
const META = { id: 'c1', metadata: { initialPage: 0, pageSize: 10, filters: [{ fieldId: 'status' }] } }

let calls: Array<{ kind: 'push' | 'replace', url: string, state: any }>
let priorWindow: any
let priorHistory: any

const at = (pathname: string, search: string) => {
    const location = { pathname, search }
    ;(globalThis as any).window = { location, innerHeight: 900 }
    const write = (kind: 'push' | 'replace') => (state: unknown, _t: string, url: string) => {
        calls.push({ kind, url, state })
        const q = url.indexOf('?')
        location.pathname = q >= 0 ? url.slice(0, q) : url
        location.search = q >= 0 ? url.slice(q) : ''
    }
    ;(globalThis as any).history = { state: null, pushState: vi.fn(write('push')), replaceState: vi.fn(write('replace')) }
}

const proto = MateuTableCrud.prototype as any
const crud = (over: Record<string, any> = {}): any => ({
    measureFill: vi.fn(), trimOverflow: vi.fn(), requestUpdate: vi.fn(), endLoading: vi.fn(), beginLoading: vi.fn(),
    scheduleMeasure: vi.fn(), dispatchEvent: vi.fn(), data: {}, id: 'listing', loadingSince: undefined, awaitingRows: false,
    _initializedForKey: undefined, _appliedUrl: undefined, _urlWrite: 'push', state: {}, component: META,
    _filterIds: proto._filterIds, _urlParams: proto._urlParams, _ownKeys: proto._ownKeys, _ownUrl: proto._ownUrl,
    _syncStateToUrl: proto._syncStateToUrl, _pageSizeOf: () => 10, ownLoadingBackground: () => undefined,
    search: proto._runSearch,
    ...over,
})

const searchEvent = (detail: Record<string, unknown>) => ({ detail }) as unknown as Event

describe('listing history (M6)', () => {
    beforeEach(() => {
        calls = []; priorWindow = (globalThis as any).window; priorHistory = (globalThis as any).history
        resetListingScopesForTests()
    })
    afterEach(() => { (globalThis as any).window = priorWindow; (globalThis as any).history = priorHistory })

    it('marks the entries it writes as the listing\'s', () => {
        at('/missions', '')
        const element = crud({ state: { page: 1 } })
        element._syncStateToUrl(META.metadata)
        expect(calls[0].state[LISTING_ENTRY]).toBe(true)
    })

    it('folds a run of multi-select toggles into ONE entry; another search starts a new one', () => {
        at('/missions', '')
        const element = crud()
        element.state = { status: 'A' }
        element.search.call(element, searchEvent({ burst: 'status:1' }))
        element.state = { ...element.state, status: 'A,B' }
        element.search.call(element, searchEvent({ burst: 'status:1' }))
        element.state = { ...element.state, status: 'A,B,C' }
        element.search.call(element, searchEvent({ burst: 'status:1' }))
        expect(calls.map(c => c.kind)).toEqual(['push', 'replace', 'replace'])
        expect(calls.at(-1)!.url).toBe('/missions?status=A%2CB%2CC')
        // the panel opened again: a new run, a new entry
        element.state = { ...element.state, status: 'A' }
        element.search.call(element, searchEvent({ burst: 'status:2' }))
        // a plain search (Enter, a chip removed) is its own entry too
        element.state = { ...element.state, status: undefined }
        element.search.call(element, searchEvent({}))
        expect(calls.map(c => c.kind)).toEqual(['push', 'replace', 'replace', 'push', 'push'])
    })

    it('a default view applied on opening replaces the entry the user opened', () => {
        at('/missions', '')
        const element = crud({ state: { status: 'OPEN' } })
        element.search.call(element, searchEvent({ history: 'replace' }))
        expect(calls.map(c => c.kind)).toEqual(['replace'])
        expect(element._urlWrite).toBe('push')
    })

    it('two listings on one page write apart: the second one prefixes its keys', () => {
        at('/record/3', '')
        const first = crud({ id: 'orders' })
        const second = crud({ id: 'invoices' })
        registerListing(first)
        registerListing(second)
        first.state = { page: 2 }
        first._syncStateToUrl(META.metadata)
        second.state = { page: 1, status: 'PAID' }
        second._syncStateToUrl(META.metadata)
        expect(listingUrlPrefix(first, 'orders')).toBe('')
        expect(listingUrlPrefix(second, 'invoices')).toBe('invoices.')
        expect((globalThis as any).window.location.search).toBe('?page=2&invoices.status=PAID&invoices.page=1')
        // the second listing's write is not "the URL moved" for the first one
        expect(first._ownUrl(META.metadata)).toBe(first._appliedUrl)
        expect(first._urlParams().get('page')).toBe('2')
        expect(second._urlParams().get('status')).toBe('PAID')
        unregisterListing(first)
        unregisterListing(second)
    })

    it('a lone listing keeps the bare keys, also after the one it replaced is gone', () => {
        const old = {}
        registerListing(old)
        expect(listingUrlPrefix(old, 'a')).toBe('')
        unregisterListing(old)
        const next = {}
        registerListing(next)
        expect(listingUrlPrefix(next, 'b')).toBe('')
    })
})

describe('listingUrlScope helpers', () => {
    it('reads and writes only the listing\'s own keys', () => {
        expect(ownParams('?a.page=2&page=5&x=1', 'a.', ['page']).toString()).toBe('page=2')
        expect(withOwnParams('x=1&a.page=2', 'a.', ['page', 'sort'], { sort: 'n:ascending' })).toBe('x=1&a.sort=n%3Aascending')
    })
})

describe('isListingMove', () => {
    it('is the listing\'s when the path is the same and one of the two entries is the listing\'s', () => {
        expect(isListingMove({ href: 'https://x/missions?page=2', listing: true }, false, { pathname: '/missions' })).toBe(true)
        expect(isListingMove({ href: 'https://x/missions', listing: false }, true, { pathname: '/missions' })).toBe(true)
    })
    it('is a screen change when the path moved or neither entry is the listing\'s', () => {
        expect(isListingMove({ href: 'https://x/missions?page=2', listing: true }, false, { pathname: '/missions/3' })).toBe(false)
        expect(isListingMove({ href: 'https://x/missions', listing: false }, false, { pathname: '/missions' })).toBe(false)
        expect(isListingMove({ href: 'not a url', listing: true }, true, { pathname: '/missions' })).toBe(false)
    })
})

describe('historyIndex remembers which entries a listing wrote', () => {
    beforeEach(() => resetHistoryIndexForTests())
    it('reports the entry the user came from as a listing entry', () => {
        const entries: Array<{ state: any, url: string }> = [{ state: null, url: 'https://x/a' }]
        let i = 0
        const location = { href: 'https://x/a' }
        const history: any = {
            get state() { return entries[i].state },
            pushState(state: any, _t: string, url: string) { entries.splice(i + 1); entries.push({ state, url }); i++; location.href = url },
            replaceState(state: any, _t: string, url?: string) { entries[i] = { state, url: url ?? entries[i].url } },
        }
        const win = { history, location } as any
        installHistoryIndex(win)
        win.history.pushState({ [LISTING_ENTRY]: true }, '', 'https://x/a?page=2')
        i = 0; location.href = entries[0].url
        const moved = notePopState(entries[0].state, win)!
        expect(moved.from.listing).toBe(true)
        expect(isListingEntry(entries[0].state)).toBe(false)
    })
})
