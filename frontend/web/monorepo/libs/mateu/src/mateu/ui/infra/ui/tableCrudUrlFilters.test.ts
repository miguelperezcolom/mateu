import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { MateuTableCrud } from './mateu-table-crud'

/**
 * Restoring a listing's filters from the URL, so a shared/reloaded `?status=PAUSED,COMPLETED` shows
 * as an applied filter (the chip), not just a filtered result set.
 *
 * <p>The bar reads applied filters off `state[fieldId]`. Two things had to hold and only the first
 * did: the cold-load init puts the URL's filters into `state` (it always did) — but the SERVER's
 * search response then re-renders the crud with a fresh state that does not carry them, and the
 * init does not run again (same listing key), so the filter vanished from `state` while the server
 * kept filtering (it read the query). The bar showed nothing though the listing was filtered. The
 * fix re-applies the URL's filters — the source of truth, kept in sync by `_syncStateToUrl` — on
 * every component change, restoring only what the pushed state is missing.
 */
const changed = (keys: string[]) => new Map(keys.map(key => [key, undefined])) as any

const META = {
    id: 'c1',
    metadata: {
        initialPage: 0,
        pageSize: 10,
        filters: [{ fieldId: 'status', stereotype: 'multiSelect' }],
    },
}

const crud = (over: Record<string, any> = {}) => ({
    measureFill: vi.fn(),
    trimOverflow: vi.fn(),
    requestUpdate: vi.fn(),
    endLoading: vi.fn(),
    beginLoading: vi.fn(),
    scheduleMeasure: vi.fn(),
    handleSearchRequested: vi.fn(),
    data: {},
    id: 'listing',
    loadingSince: undefined,
    awaitingRows: false,
    _initializedForKey: undefined,
    state: {},
    _initStateFromUrl: (MateuTableCrud.prototype as any)._initStateFromUrl,
    _filterIds: (MateuTableCrud.prototype as any)._filterIds,
    _restoreUrlFiltersIfMissing: (MateuTableCrud.prototype as any)._restoreUrlFiltersIfMissing,
    component: META,
    ...over,
})

const run = (element: any) =>
    (MateuTableCrud.prototype as any).updated.call(element, changed(['component']))

describe('a listing restores its filters from the URL', () => {

    let priorWindow: any
    beforeEach(() => { priorWindow = (globalThis as any).window })
    afterEach(() => { (globalThis as any).window = priorWindow })

    const withSearch = (search: string) => {
        (globalThis as any).window = { location: { pathname: '/things', search }, innerHeight: 900 }
    }

    it('puts a single-value filter from the URL into the state on cold load', () => {
        withSearch('?status=COMPLETED')
        const element = crud()
        run(element)
        expect(element.state.status).toBe('COMPLETED')
    })

    it('puts a multi-value filter from the URL into the state on cold load', () => {
        withSearch('?status=PAUSED,COMPLETED')
        const element = crud()
        run(element)
        expect(element.state.status).toBe('PAUSED,COMPLETED')
    })

    it('re-applies a filter the server re-render dropped from the state', () => {
        // The regression this fixes. The listing is already initialised (its key is set); the search
        // response pushed a fresh state that carries none of the filters. The filter must come back
        // from the URL, or the bar shows no chip on a listing that IS filtered.
        withSearch('?status=PAUSED,COMPLETED')
        const element = crud({
            _initializedForKey: 'c1|',
            state: { styleForView: '', idFieldForRow: 'id' }, // the server's own state, no filters
        })
        run(element)
        expect(element.state.status).toBe('PAUSED,COMPLETED')
    })

    it('does not clobber in-progress input that the URL has not caught up with', () => {
        // Typing in the search box lives in state before it is applied (and synced to the URL).
        // A re-render mid-type must not revert it to the URL's older value.
        withSearch('?status=PAUSED') // URL has no searchText
        const element = crud({
            _initializedForKey: 'c1|',
            state: { searchText: 'half-typed' },
        })
        run(element)
        expect(element.state.searchText).toBe('half-typed')
        expect(element.state.status).toBe('PAUSED') // and the missing one is still restored
    })

    it('does not overwrite a filter the state already carries', () => {
        withSearch('?status=PAUSED')
        const element = crud({
            _initializedForKey: 'c1|',
            state: { status: 'RUNNING' }, // whatever the state has wins; only missing is restored
        })
        run(element)
        expect(element.state.status).toBe('RUNNING')
    })

    it('leaves the state reference untouched when there is nothing to restore', () => {
        withSearch('?status=PAUSED')
        const before = { status: 'PAUSED' }
        const element = crud({ _initializedForKey: 'c1|', state: before })
        run(element)
        // no needless new object -> no needless render
        expect(element.state).toBe(before)
    })
})
