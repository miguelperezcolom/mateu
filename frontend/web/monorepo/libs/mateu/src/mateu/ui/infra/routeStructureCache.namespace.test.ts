import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ComponentType } from '@mateu/shared/apiClients/dtos/ComponentType.ts'
import type Component from '@mateu/shared/apiClients/dtos/Component.ts'
import type UIFragment from '@mateu/shared/apiClients/dtos/UIFragment.ts'

// The structure cache is scoped per app and per build: an app served on the same origin after
// another one (localhost:8095) must never be painted the other one's screens, whose view types it
// does not know (the 403 "you are not allowed" on every page the first app had visited).

// the vitest environment is plain node: back both storages with Maps, and give the page a <head>
const storageOn = (backing: Map<string, string>) => ({
    getItem: (key: string) => backing.get(key) ?? null,
    setItem: (key: string, value: string) => void backing.set(key, value),
    removeItem: (key: string) => void backing.delete(key),
    clear: () => backing.clear(),
})
vi.stubGlobal('localStorage', storageOn(new Map()))
vi.stubGlobal('sessionStorage', storageOn(new Map()))

/** The page as the server wrote it: `<meta name="mateu-app" content="…">`, or none. */
const servePage = (app: string | undefined) => {
    vi.stubGlobal('document', {
        querySelector: (selector: string) => selector === 'meta[name="mateu-app"]' && app !== undefined
            ? { getAttribute: (name: string) => (name === 'content' ? app : null) }
            : null,
    })
}

/** The module as a reload (or the next page in the tab) sees it: only what storage kept. */
const loadPage = async (app: string | undefined) => {
    servePage(app)
    vi.resetModules()
    return await import('./routeStructureCache.ts')
}

const comp = (id: string): Component => ({
    type: ComponentType.ServerSide,
    id,
    children: undefined,
    style: '',
    cssClasses: '',
    slot: '',
    initialData: undefined,
    confirmOnNavigationIfDirty: false,
})

beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
})

afterEach(() => {
    vi.unstubAllGlobals()
    vi.stubGlobal('localStorage', storageOn(new Map()))
    vi.stubGlobal('sessionStorage', storageOn(new Map()))
})

describe('structure cache namespaces', () => {
    it('reads the app fingerprint off the page, and none when the page carries no meta', async () => {
        expect((await loadPage('app-a')).pageAppFingerprint()).toBe('app-a')
        expect((await loadPage(undefined)).pageAppFingerprint()).toBe('')
    })

    it('another app on the same origin finds nothing the previous one cached (the 403 bug)', async () => {
        const a = await loadPage('app-a')
        const key = a.structureCacheKey({ baseUrl: '', consumedRoute: '', route: '/orders', serverSideType: undefined })
        a.putCachedStructure(key, comp('a-orders'), 'h1')
        expect(a.getCachedStructure(key)?.component.id).toBe('a-orders')

        // same tab, same origin, same route — another app now answers there
        const b = await loadPage('app-b')
        expect(b.getCachedStructure(key)).toBeUndefined()
        // and its entries are gone from storage, not just hidden
        expect(sessionStorage.getItem('mateu-route-structure-cache') ?? '').not.toContain('a-orders')
    })

    it('the same app keeps its cache across a reload', async () => {
        const a = await loadPage('app-a')
        const key = a.structureCacheKey({ baseUrl: '', consumedRoute: '', route: '/orders', serverSideType: undefined })
        a.noteBackendBuild(a.backendOfBaseUrl(''), 'build-1')
        a.putCachedStructure(key, comp('a-orders'), 'h1')
        const again = await loadPage('app-a')
        expect(again.getCachedStructure(key)?.component.id).toBe('a-orders')
    })

    it('a response from another build drops that backend\'s entries, and only that backend\'s', async () => {
        const cache = await loadPage('app-a')
        const here = cache.structureCacheKey({ baseUrl: '', consumedRoute: '', route: '/r', serverSideType: undefined })
        const remote = cache.structureCacheKey({ baseUrl: 'https://remote.example', consumedRoute: '', route: '/r', serverSideType: undefined })
        cache.noteBackendBuild(cache.backendOfBaseUrl(''), 'b1')
        cache.noteBackendBuild(cache.backendOfBaseUrl('https://remote.example'), 'r1')
        cache.putCachedStructure(here, comp('here'))
        cache.putCachedStructure(remote, comp('remote'))

        // the same build again changes nothing
        cache.noteBackendBuild(cache.backendOfBaseUrl(''), 'b1')
        expect(cache.getCachedStructure(here)?.component.id).toBe('here')

        // the page's own backend was deployed again
        cache.noteBackendBuild(cache.backendOfBaseUrl(''), 'b2')
        expect(cache.getCachedStructure(here)).toBeUndefined()
        expect(cache.getCachedStructure(remote)?.component.id).toBe('remote')

        // and a reload does not bring the old build's entry back
        expect((await loadPage('app-a')).getCachedStructure(here)).toBeUndefined()
    })

    it('a response without a build (a static bundle, an older server) changes nothing', async () => {
        const cache = await loadPage('app-a')
        const key = cache.structureCacheKey({ baseUrl: '', consumedRoute: '', route: '/r', serverSideType: undefined })
        cache.noteBackendBuild(cache.backendOfBaseUrl(''), 'b1')
        cache.putCachedStructure(key, comp('x'))
        cache.noteBackendBuild(cache.backendOfBaseUrl(''), undefined)
        cache.noteBackendBuild(undefined, 'b9')
        expect(cache.getCachedStructure(key)?.component.id).toBe('x')
    })

    it('entries cached before the build was known go once it is', async () => {
        const cache = await loadPage('app-a')
        const key = cache.structureCacheKey({ baseUrl: '', consumedRoute: '', route: '/r', serverSideType: undefined })
        cache.putCachedStructure(key, comp('x'))
        expect(cache.getCachedStructure(key)?.component.id).toBe('x')
        cache.noteBackendBuild(cache.backendOfBaseUrl(''), 'b1')
        // written under "no build yet", not under b1: a prediction no longer
        expect(cache.getCachedStructure(key)).toBeUndefined()
    })

    it('ignores an entry an older release wrote (no namespace on it)', async () => {
        const cache = await loadPage('app-a')
        const key = cache.structureCacheKey({ baseUrl: '', consumedRoute: '', route: '/r', serverSideType: undefined })
        sessionStorage.setItem('mateu-route-structure-cache', JSON.stringify({
            [key]: { v: 2, t: Date.now(), component: comp('old') },
        }))
        expect(cache.getCachedStructure(key)).toBeUndefined()
    })

    it('dropBackendStructures forgets one backend (the self-heal after a refusal)', async () => {
        const cache = await loadPage('app-a')
        const here = cache.structureCacheKey({ baseUrl: '', consumedRoute: '', route: '/r', serverSideType: undefined })
        const other = cache.structureCacheKey({ baseUrl: 'https://remote.example', consumedRoute: '', route: '/r', serverSideType: undefined })
        cache.putCachedStructure(here, { ...comp('here'), initialData: { n: 1 } } as Component)   // in memory only
        cache.putCachedStructure(other, comp('other'))
        cache.dropBackendStructures('')
        expect(cache.getCachedStructure(here)).toBeUndefined()
        expect(cache.getCachedStructure(other)?.component.id).toBe('other')
    })

    it('a build change also forgets the @StaticView answers of the session', async () => {
        const cache = await loadPage('app-a')
        const statics = await import('./staticViewCache.ts')
        cache.noteBackendBuild(cache.backendOfBaseUrl(''), 'b1')
        statics.putStaticFragment('k', { targetComponentId: 'x' } as UIFragment)
        cache.noteBackendBuild(cache.backendOfBaseUrl(''), 'b2')
        expect(statics.getStaticFragment('k')).toBeUndefined()
    })

    it('the backend of a baseUrl is the one the transport reports builds for', async () => {
        const cache = await loadPage('app-a')
        expect(cache.backendOfBaseUrl('https://remote.example/crm')).toBe('https://remote.example/crm')
        const { backendKeyOf } = await import('./http/backendKey.ts')
        expect(cache.backendOfBaseUrl('https://remote.example/crm'))
            .toBe(backendKeyOf('https://remote.example/crm/mateu/v3/sync/orders'))
    })
})
