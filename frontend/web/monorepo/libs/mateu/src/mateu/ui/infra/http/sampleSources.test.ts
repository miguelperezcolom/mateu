import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
    isSampled,
    resolveRestSource,
    sampleOf,
    setRestSourceCatalogue,
    setSampleMode,
    viaProxy,
} from './restSourceCatalogue.ts'
import { fetchExternalJson, fetchExternalPage } from './externalOptions.ts'
import { sortExternalRows } from './restRowFilters.ts'
import { toStatus } from '../ui/renderers/columnRenderers/statusColumnRenderer.ts'
import { StatusType } from '@mateu/shared/apiClients/dtos/componentmetadata/StatusType.ts'

/**
 * SAMPLE data on REST sources — the browser's (direct) leg. The server's proxied leg is pinned by
 * SampleSourcesSyncTest; both apply the same rule: a sample answers ONLY in sample mode.
 */
const SAMPLE = { data: [{ id: 1, customer: 'Acme', status: 'OPEN' }, { id: 2, customer: 'Globex', status: 'SHIPPED' }], meta: { total: 2 } }

const failingFetch = (() => Promise.reject(new Error('the endpoint must not be called'))) as unknown as typeof fetch

describe('sample data on REST sources', () => {
    beforeEach(() => {
        setRestSourceCatalogue([
            { name: 'orders', source: { url: 'http://127.0.0.1:1/orders', itemsPath: 'data', proxy: true }, totalPath: 'meta.total', sample: SAMPLE },
            { name: 'inline', source: { url: 'http://127.0.0.1:1/x', sample: [{ id: 9 }] } },
            { name: 'plain', source: { url: 'http://127.0.0.1:1/y' } },
        ])
    })
    afterEach(() => setSampleMode(false))

    it('is never used outside sample mode — the endpoint is called (and here fails)', async () => {
        expect(isSampled({ ref: 'orders' })).toBe(false)
        expect(viaProxy({ ref: 'orders' })).toBe(true)
        await expect(fetchExternalJson({ ref: 'orders' }, undefined, failingFetch)).rejects.toThrow()
    })

    it('in sample mode a read answers with a copy of the sample, with no fetch and no proxy', async () => {
        setSampleMode(true)
        expect(viaProxy({ ref: 'orders' })).toBe(false)
        const json = await fetchExternalJson({ ref: 'orders' }, undefined, failingFetch) as any
        expect(json).toEqual(SAMPLE)
        json.data.pop()
        expect(SAMPLE.data).toHaveLength(2) // a copy: the listing may not mutate the catalogue
    })

    it('in sample mode a write succeeds without persisting', async () => {
        setSampleMode(true)
        expect(await fetchExternalJson({ ref: 'orders', method: 'POST', body: '{}' }, undefined, failingFetch)).toBeNull()
    })

    it("a source's own inline sample counts, and a source without one is still called", async () => {
        setSampleMode(true)
        expect(sampleOf({ ref: 'inline' })).toEqual([{ id: 9 }])
        expect(sampleOf({ url: 'http://x', sample: { a: 1 } })).toEqual({ a: 1 })
        expect(isSampled({ ref: 'plain' })).toBe(false)
        await expect(fetchExternalJson({ ref: 'plain' }, undefined, failingFetch)).rejects.toThrow()
    })

    it('the surface\'s own sample wins over the entry\'s', () => {
        expect(resolveRestSource({ ref: 'orders', sample: [1] }).sample).toEqual([1])
    })

    it('rows and the total come out of the sample through the usual paths', async () => {
        setSampleMode(true)
        const page = await fetchExternalPage({ ref: 'orders' }, ['id', 'customer'], undefined, failingFetch)
        expect(page.rows).toEqual([{ id: 1, customer: 'Acme' }, { id: 2, customer: 'Globex' }])
        expect(page.total).toBe(2)
    })
})

describe('in-memory sort (sampled and unpaged listings)', () => {
    const rows = [{ n: 'b', v: 2 }, { n: 'a', v: 10 }, { n: 'c', v: null }]
    it('sorts by the listing sort state, blanks last', () => {
        expect(sortExternalRows(rows, [{ fieldId: 'v', direction: 'ascending' }]).map(r => r.n)).toEqual(['b', 'a', 'c'])
        expect(sortExternalRows(rows, [{ fieldId: 'n', direction: 'descending' }]).map(r => r.n)).toEqual(['c', 'b', 'a'])
    })
    it('no sort leaves the rows untouched', () => {
        expect(sortExternalRows(rows, undefined)).toBe(rows)
    })
})

describe('status tones from a field type', () => {
    it('a declared tone for the value wins over the word', () => {
        expect(toStatus('OPEN', { OPEN: 'warning' })?.type).toBe(StatusType.WARNING)
        expect(toStatus('SHIPPED', { SHIPPED: 'success' })?.type).toBe(StatusType.SUCCESS)
        expect(toStatus('FAILED', { OPEN: 'warning' })?.type).toBe(StatusType.DANGER) // by its word
    })
})
