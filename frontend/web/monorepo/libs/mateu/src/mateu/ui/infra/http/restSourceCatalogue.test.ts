// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
    UnknownRestSourceError,
    __clearRemoteRestSources,
    addReferencedRestSources,
    getRestSource,
    pathOfField,
    resolveRestSource,
    setRestSourceCatalogue,
    totalPathOf,
} from './restSourceCatalogue.ts'
import { fetchExternalJson, mapItemsToRows } from './externalOptions.ts'

/**
 * The catalogue's job is that a NAME resolves to one endpoint, and that resolving it never invents
 * one. A reference silently resolving to something half-built would send a request nobody declared.
 */
describe('restSourceCatalogue', () => {
    beforeEach(() => {
        setRestSourceCatalogue([
            {
                name: 'countries',
                source: {
                    url: 'https://restcountries.com/v3.1/all',
                    itemsPath: 'data',
                    valuePath: 'cca2',
                    labelPath: 'name.common',
                },
            },
            {
                name: 'orders',
                source: { url: '/api/orders', itemsPath: 'data' },
                fields: { customerName: 'customer.name', total: 'amount.gross' },
                totalPath: 'meta.total',
            },
        ])
    })

    it('resolves a reference to the catalogued endpoint', () => {
        const resolved = resolveRestSource({ ref: 'countries' })
        expect(resolved.url).toBe('https://restcountries.com/v3.1/all')
        expect(resolved.valuePath).toBe('cca2')
    })

    it('keeps what the surface declared, so it can map a shared endpoint its own way', () => {
        const resolved = resolveRestSource({ ref: 'countries', labelPath: 'name.official' })
        expect(resolved.url).toBe('https://restcountries.com/v3.1/all')
        expect(resolved.labelPath).toBe('name.official')
    })

    it('leaves an inline descriptor untouched', () => {
        const inline = { url: '/one-off', itemsPath: 'rows' }
        expect(resolveRestSource(inline)).toEqual(inline)
    })

    it('returns an unknown reference as declared instead of inventing an endpoint', () => {
        const resolved = resolveRestSource({ ref: 'nope' })
        expect(resolved.url).toBeUndefined()
        expect(resolved.ref).toBe('nope')
    })

    it('replaces the catalogue rather than merging, so a stale entry cannot survive', () => {
        setRestSourceCatalogue([{ name: 'other', source: { url: '/other' } }])
        expect(getRestSource('countries')).toBeUndefined()
        expect(getRestSource('other')?.source.url).toBe('/other')
    })

    it('treats an absent catalogue as empty', () => {
        setRestSourceCatalogue(undefined)
        expect(getRestSource('countries')).toBeUndefined()
    })

    describe('field mapping', () => {
        it('maps a flat name onto a nested path', () => {
            expect(pathOfField({ ref: 'orders' }, 'customerName')).toBe('customer.name')
        })

        it('leaves an unmapped name as its own path', () => {
            expect(pathOfField({ ref: 'orders' }, 'reference')).toBe('reference')
        })

        it('is the identity for an inline descriptor', () => {
            expect(pathOfField({ url: '/x' }, 'customerName')).toBe('customerName')
        })

        it('lets a nested response field fill a flat column', () => {
            // The gap a listing cannot close alone: a column id IS the path, and a record field
            // cannot be called `customer.name`.
            const json = { data: [{ customer: { name: 'Ada' }, amount: { gross: 42 } }] }
            const rows = mapItemsToRows(json, 'data', ['customerName', 'total'], (id) =>
                pathOfField({ ref: 'orders' }, id),
            )
            expect(rows).toEqual([{ customerName: 'Ada', total: 42 }])
        })

        it('still reads a column by its id when no mapping is given', () => {
            const json = { data: [{ code: 'ES', name: 'Spain' }] }
            expect(mapItemsToRows(json, 'data', ['code', 'name'])).toEqual([
                { code: 'ES', name: 'Spain' },
            ])
        })
    })

    it('exposes the total path of a server-paged source', () => {
        expect(totalPathOf({ ref: 'orders' })).toBe('meta.total')
        expect(totalPathOf({ ref: 'countries' })).toBeUndefined()
    })
})

describe('the entries a response names (a page with no app shell)', () => {
    beforeEach(() => {
        setRestSourceCatalogue([])
        __clearRemoteRestSources()
    })

    it('resolve a ref no app catalogue carries', () => {
        addReferencedRestSources([{ name: 'invoices', source: { url: 'https://api.example.com/invoices' } } as any])
        expect(resolveRestSource({ ref: 'invoices' } as any).url).toBe('https://api.example.com/invoices')
    })

    it('never override the app catalogue', () => {
        setRestSourceCatalogue([{ name: 'invoices', source: { url: '/app' } } as any])
        addReferencedRestSources([{ name: 'invoices', source: { url: '/response' } } as any])
        expect(getRestSource('invoices')?.source?.url).toBe('/app')
    })

    it('an unresolvable ref is reported as such, nothing is fetched', async () => {
        vi.spyOn(console, 'warn').mockImplementation(() => {})
        const fetchImpl = vi.fn()
        await expect(fetchExternalJson({ ref: 'nobody' } as any, (t) => t, fetchImpl as any))
            .rejects.toBeInstanceOf(UnknownRestSourceError)
        expect(fetchImpl).not.toHaveBeenCalled()
    })

    it('a response carrying restSources registers them before its fragments render', async () => {
        const { HttpService } = await import('../../application/HttpService.ts')
        new HttpService().handleUIIncrement({ restSources: [{ name: 'late', source: { url: '/late' } }] } as any,
            document.createElement('div'), 't')
        expect(getRestSource('late')?.source?.url).toBe('/late')
    })
})
