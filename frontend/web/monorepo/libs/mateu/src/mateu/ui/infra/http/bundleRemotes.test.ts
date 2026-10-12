// A federated shell mounting a domain that has NO backend: its static bundle. The RemoteMenu's base
// URL names the bundle's manifest, and every load the shell aims at it is answered from there — with
// the remote's REST sources added to the client catalogue — while the page's own bundle (if any)
// keeps answering only its own loads.
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
    __setBundleForTests, getBundledIncrement, isForeignBaseUrl, isStaticBundleUrl, loadBundleManifest,
    loadRemoteBundle, resolveBundledLoad, resolveRemoteBundledLoad,
} from '@infra/http/bundleStore.ts'
import {
    __clearRemoteRestSources, getRestSource, remoteCataloguesSettled, resolveRestSource, setRemoteRestSources,
    setRestSourceCatalogue, trackRemoteCatalogues,
} from '@infra/http/restSourceCatalogue.ts'
import { fetchExternalJson } from '@infra/http/externalOptions.ts'

const CATALOG = 'http://cdn.example.com/catalog/manifest.json'

/** What `mateu:bundle` with specsOnly writes for a YAML-only domain: raw definitions, no entries. */
const catalogManifest = {
    entries: [],
    routes: {
        routes: [
            { route: '', definition: 'catalog-app.yaml' },
            { route: 'products', definition: 'products.yaml' },
        ],
    },
    sources: {
        sources: [{ name: 'products', source: { url: 'http://cdn.example.com/api/products.json', method: 'GET' } }],
    },
    definitions: {
        'catalog-app.yaml': {
            type: 'AppShell', title: 'Catalog', homeRoute: 'products',
            menu: [{ type: 'RouteLink', label: 'Products', route: 'products' }],
        },
        'products.yaml': {
            type: 'Listing', title: 'Products', rowsSource: { ref: 'products' },
            columns: [{ type: 'GridColumn', id: 'sku', label: 'SKU' }],
        },
    },
}

const okFetch = (body: unknown) =>
    vi.fn(async () => ({ ok: true, json: async () => body })) as unknown as typeof fetch & { mock: { calls: unknown[] } }

const metadataOf = (inc: any) => inc?.fragments?.[0]?.component?.metadata
const typesIn = (node: any, out: string[] = []): string[] => {
    if (!node || typeof node !== 'object') return out
    if (typeof node.type === 'string') out.push(node.type)
    for (const value of Object.values(node)) {
        if (Array.isArray(value)) value.forEach(v => typesIn(v, out))
        else if (value && typeof value === 'object') typesIn(value, out)
    }
    return out
}

afterEach(() => {
    __setBundleForTests(undefined)
    __clearRemoteRestSources()
    setRestSourceCatalogue([])
})

describe('a static remote', () => {
    it('is named by a base URL that points at a manifest, not at a server', () => {
        expect(isStaticBundleUrl(CATALOG)).toBe(true)
        expect(isStaticBundleUrl('https://cdn.example.com/catalog/manifest.json?v=3')).toBe(true)
        expect(isStaticBundleUrl('/bundles/orders.JSON')).toBe(true)
        expect(isStaticBundleUrl('http://localhost:18481/orders')).toBe(false)
        expect(isStaticBundleUrl('')).toBe(false)
        expect(isStaticBundleUrl(undefined)).toBe(false)
    })

    it('answers the shell\'s menu load with its own app shell, its menu and its sources', async () => {
        const fetchImpl = okFetch(catalogManifest)
        const answer = await resolveRemoteBundledLoad(CATALOG, '_no_route', '_empty', fetchImpl)
        const app = metadataOf(answer)
        expect(app).toMatchObject({ type: 'App', title: 'Catalog' })
        expect(JSON.stringify(app.menu)).toContain('Products')
        // the shell publishes what the remote's screens will need
        expect(app.restSources.map((s: any) => s.name)).toEqual(['products'])
    })

    it('answers a content load with the screen itself, expanded in the browser', async () => {
        const answer = await resolveRemoteBundledLoad(CATALOG, 'products', '', okFetch(catalogManifest))
        expect(metadataOf(answer)?.type).not.toBe('App')
        expect(JSON.stringify(answer)).toContain('Products')
        expect(typesIn(answer)).toContain('Crud')
    })

    it('mounted at its root as content, shows its home screen — never its shell inside the shell\'s', async () => {
        const answer = await resolveRemoteBundledLoad(CATALOG, '_no_route', '', okFetch(catalogManifest))
        expect(metadataOf(answer)?.type).not.toBe('App')
        expect(JSON.stringify(answer)).toContain('Products')
    })

    it('reads its manifest once, however many loads it answers', async () => {
        const fetchImpl = okFetch(catalogManifest)
        await resolveRemoteBundledLoad(CATALOG, '_no_route', '_empty', fetchImpl)
        await resolveRemoteBundledLoad(CATALOG, 'products', '', fetchImpl)
        await loadRemoteBundle(CATALOG, fetchImpl)
        expect(fetchImpl.mock.calls).toHaveLength(1)
    })

    it('adds its REST sources to the catalogue as its own layer', async () => {
        await loadRemoteBundle(CATALOG, okFetch(catalogManifest))
        expect(resolveRestSource({ ref: 'products' } as any).url).toBe('http://cdn.example.com/api/products.json')
    })

    it('does not answer a route it does not declare, and asks again after a failed read', async () => {
        expect(await resolveRemoteBundledLoad(CATALOG, 'nope', '', okFetch(catalogManifest))).toBeUndefined()
        const down = vi.fn(async () => ({ ok: false, json: async () => ({}) })) as unknown as typeof fetch
        const OTHER = 'http://cdn.example.com/other/manifest.json'
        expect(await resolveRemoteBundledLoad(OTHER, '_no_route', '_empty', down)).toBeUndefined()
        // the next attempt (the remote-menu retry) reads it again instead of a cached failure
        expect(await resolveRemoteBundledLoad(OTHER, '_no_route', '_empty', okFetch(catalogManifest))).toBeDefined()
    })

    it('leaves the page\'s own bundle answering the page\'s own loads', async () => {
        const own = { fragments: [{ component: { type: 'ServerSide', id: 'home' } }] }
        await loadBundleManifest('own', okFetch({
            entries: [{ route: '/home', syncPath: 'home', ok: true, json: JSON.stringify(own) }],
        }))
        await resolveRemoteBundledLoad(CATALOG, 'products', '', okFetch(catalogManifest))
        expect(getBundledIncrement('home')).toEqual(own)
        expect(resolveBundledLoad('products', '')).toBeUndefined()
    })
})

describe('a remote\'s REST source layer', () => {
    it('fills what the shell\'s own catalogue does not carry; the shell wins a clash', () => {
        setRestSourceCatalogue([{ name: 'shared', source: { url: 'https://shell/shared' } } as any])
        setRemoteRestSources('http://orders', [
            { name: 'orders', source: { url: 'https://orders/api' } } as any,
            { name: 'shared', source: { url: 'https://orders/shared' } } as any,
        ])
        expect(getRestSource('orders')?.source?.url).toBe('https://orders/api')
        expect(getRestSource('shared')?.source?.url).toBe('https://shell/shared')
    })

    it('survives the shell replacing its own catalogue (an app re-mounting)', () => {
        setRemoteRestSources('http://orders', [{ name: 'orders', source: { url: 'https://orders/api' } } as any])
        setRestSourceCatalogue([{ name: 'other', source: { url: 'x' } } as any])
        expect(getRestSource('orders')?.source?.url).toBe('https://orders/api')
    })

    it('is replaced by that remote\'s next answer, and dropped when it answers none', () => {
        setRemoteRestSources('http://orders', [{ name: 'orders', source: { url: 'v1' } } as any])
        setRemoteRestSources('http://orders', [{ name: 'orders', source: { url: 'v2' } } as any])
        expect(getRestSource('orders')?.source?.url).toBe('v2')
        setRemoteRestSources('http://orders', undefined)
        expect(getRestSource('orders')).toBeUndefined()
    })
})

describe('a cold deep link into a remote', () => {
    it('waits for the remote\'s answer before giving up on a source name nobody knows yet', async () => {
        let answer!: () => void
        const asking = new Promise<void>((resolve) => { answer = resolve })
        trackRemoteCatalogues(asking.then(() =>
            setRemoteRestSources('http://orders', [{ name: 'orders', source: { url: 'https://orders/api' } } as any])))
        const fetchImpl = vi.fn(async () => ({ ok: true, json: async () => [{ id: 1 }] })) as unknown as typeof fetch
        const rows = fetchExternalJson({ ref: 'orders' } as any, (t) => t, fetchImpl)
        await Promise.resolve()
        expect(fetchImpl).not.toHaveBeenCalled()
        answer()
        expect(await rows).toEqual([{ id: 1 }])
        expect((fetchImpl as any).mock.calls[0][0]).toBe('https://orders/api')
    })

    it('does not wait when nothing is being asked, nor when the name is already known', async () => {
        await expect(remoteCataloguesSettled()).resolves.toBeUndefined()
        trackRemoteCatalogues(Promise.reject(new Error('down')))
        // a remote that failed only ends the wait
        await expect(remoteCataloguesSettled()).resolves.toBeUndefined()
    })
})

describe('isForeignBaseUrl', () => {
    it('is true only for an absolute URL on another origin', () => {
        ;(globalThis as any).window = { location: { origin: 'http://localhost:18480' } }
        try {
            expect(isForeignBaseUrl('http://localhost:18481/orders')).toBe(true)
            expect(isForeignBaseUrl('http://localhost:18480/orders')).toBe(false)
            expect(isForeignBaseUrl('/orders')).toBe(false)
            expect(isForeignBaseUrl('')).toBe(false)
            expect(isForeignBaseUrl(undefined)).toBe(false)
        } finally {
            delete (globalThis as any).window
        }
    })
})
