import { describe, it, expect, afterEach } from 'vitest'
import {
    toSyncPath,
    loadBundleManifest,
    hasBundle,
    getBundledIncrement,
    __setBundleForTests,
} from './bundleStore'

describe('toSyncPath', () => {
    it('mirrors the server exporter / AxiosMateuApiClient', () => {
        expect(toSyncPath('')).toBe('_no_route')
        expect(toSyncPath('/')).toBe('_no_route')
        expect(toSyncPath('/products')).toBe('products')
        expect(toSyncPath('products')).toBe('products')
        expect(toSyncPath('orders/1')).toBe('orders/1')
        expect(toSyncPath(undefined)).toBe('_no_route')
    })
})

describe('loadBundleManifest', () => {
    afterEach(() => __setBundleForTests(undefined))

    const manifest = {
        baseUrl: '',
        staticOnly: true,
        entries: [
            { route: '/home', syncPath: 'home', ok: true, json: JSON.stringify({ fragments: [{ x: 1 }] }) },
            { route: '/broken', syncPath: 'broken', ok: false, json: null, skipReason: 'boom' },
            { route: '/bad-json', syncPath: 'bad-json', ok: true, json: '{not json' },
        ],
    }
    const okFetch = (body: unknown): typeof fetch =>
        (async () => ({ ok: true, json: async () => body })) as unknown as typeof fetch

    it('indexes ok entries by syncPath and parses their increment JSON', async () => {
        await loadBundleManifest('x', okFetch(manifest))
        expect(hasBundle()).toBe(true)
        expect(getBundledIncrement('home')).toEqual({ fragments: [{ x: 1 }] })
    })

    it('skips entries that are not ok', async () => {
        await loadBundleManifest('x', okFetch(manifest))
        expect(getBundledIncrement('broken')).toBeUndefined()
    })

    it('swallows an entry whose json is malformed (keeps the rest)', async () => {
        await loadBundleManifest('x', okFetch(manifest))
        expect(getBundledIncrement('bad-json')).toBeUndefined()
        expect(getBundledIncrement('home')).toBeDefined() // the good one still loaded
    })

    it('leaves bundle mode OFF on a non-2xx manifest', async () => {
        const bad = (async () => ({ ok: false, json: async () => ({}) })) as unknown as typeof fetch
        await loadBundleManifest('x', bad)
        expect(hasBundle()).toBe(false)
    })

    it('leaves bundle mode OFF when fetch throws', async () => {
        const boom = (async () => { throw new Error('offline') }) as unknown as typeof fetch
        await loadBundleManifest('x', boom)
        expect(hasBundle()).toBe(false)
    })
})
