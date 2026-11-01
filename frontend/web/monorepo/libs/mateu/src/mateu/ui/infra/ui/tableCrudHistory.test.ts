import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { MateuTableCrud } from './mateu-table-crud'
import { sortDirectionOf } from './sortDirection'

/**
 * A listing's page, sort, filters and search live in the URL — and each change the USER makes is a
 * history entry, so Back returns to the previous page/filters (the filters doc promises it). It used
 * to replaceState every time: Back left the listing altogether (space/museums, Fable review A8).
 * Re-stating on a (re)load what the URL already asked for stays a replace.
 */
const META = { id: 'c1', metadata: { initialPage: 0, pageSize: 10, filters: [{ fieldId: 'status' }] } }

let calls: Array<{ kind: 'push' | 'replace', url: string }>
let priorWindow: any
let priorHistory: any

const at = (pathname: string, search: string) => {
    const location = { pathname, search }
    ;(globalThis as any).window = { location, innerHeight: 900 }
    const write = (kind: 'push' | 'replace') => (_s: unknown, _t: string, url: string) => {
        calls.push({ kind, url })
        const q = url.indexOf('?')
        location.pathname = q >= 0 ? url.slice(0, q) : url
        location.search = q >= 0 ? url.slice(q) : ''
    }
    ;(globalThis as any).history = { state: null, pushState: vi.fn(write('push')), replaceState: vi.fn(write('replace')) }
}

const crud = (over: Record<string, any> = {}): any => ({
    measureFill: vi.fn(), trimOverflow: vi.fn(), requestUpdate: vi.fn(), endLoading: vi.fn(), beginLoading: vi.fn(),
    scheduleMeasure: vi.fn(), data: {}, id: 'listing', loadingSince: undefined, awaitingRows: false,
    _initializedForKey: undefined, _appliedUrl: undefined, _urlWrite: 'push', state: {}, component: META,
    _initStateFromUrl: (MateuTableCrud.prototype as any)._initStateFromUrl,
    _filterIds: (MateuTableCrud.prototype as any)._filterIds,
    _restoreUrlFiltersIfMissing: (MateuTableCrud.prototype as any)._restoreUrlFiltersIfMissing,
    _urlParams: (MateuTableCrud.prototype as any)._urlParams,
    _syncStateToUrl: (MateuTableCrud.prototype as any)._syncStateToUrl,
    ...over,
})

describe('listing history', () => {
    beforeEach(() => { calls = []; priorWindow = (globalThis as any).window; priorHistory = (globalThis as any).history })
    afterEach(() => { (globalThis as any).window = priorWindow; (globalThis as any).history = priorHistory })

    it("a page the user asks for is a NEW history entry (pushState), so Back returns to the previous one", () => {
        at('/missions', '')
        const element = crud({ state: { page: 1 } })
        element._syncStateToUrl(META.metadata)
        expect(calls).toEqual([{ kind: 'push', url: '/missions?page=1' }])
        expect(element._appliedUrl).toBe('/missions?page=1')
    })

    it('a sort and a filter the user applies push too; nothing changes → nothing written', () => {
        at('/missions', '?page=1')
        const element = crud({ state: { page: 0, status: 'ACTIVE', sort: [{ fieldId: 'name', direction: 'descending' }] } })
        element._syncStateToUrl(META.metadata)
        expect(calls).toEqual([{ kind: 'push', url: '/missions?status=ACTIVE&sort=name%3Adescending' }])
        element._syncStateToUrl(META.metadata)
        expect(calls.length).toBe(1)
    })

    it('re-reading a URL on (re)load writes with replaceState — it is not a new entry', () => {
        at('/missions', '?sort=name:asc')
        const element = crud({
            handleSearchRequested(this: any) { this._syncStateToUrl(META.metadata) },
        })
        ;(MateuTableCrud.prototype as any).updated.call(element, new Map([['component', undefined]]))
        expect(calls.every(c => c.kind === 'replace')).toBe(true)
        expect(element._urlWrite).toBe('push')
        // the hand-typed `asc` became the wire's `ascending`
        expect(element.state.sort).toEqual([{ fieldId: 'name', direction: 'ascending' }])
    })
})

describe('sortDirectionOf', () => {
    it('reads the two wire words and the short forms, in any case; drops anything else', () => {
        expect(sortDirectionOf('ascending')).toBe('ascending')
        expect(sortDirectionOf('ASC')).toBe('ascending')
        expect(sortDirectionOf('desc')).toBe('descending')
        expect(sortDirectionOf('Descending')).toBe('descending')
        expect(sortDirectionOf('up')).toBeUndefined()
        expect(sortDirectionOf(undefined)).toBeUndefined()
    })
})
