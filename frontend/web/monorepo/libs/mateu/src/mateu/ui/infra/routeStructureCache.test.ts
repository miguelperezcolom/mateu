import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ComponentType } from '@mateu/shared/apiClients/dtos/ComponentType.ts'
import type Component from '@mateu/shared/apiClients/dtos/Component.ts'
import {
    clearStructureCache,
    getCachedStructure,
    putCachedStructure,
    setStructureCacheEnabled,
    structureCacheKey,
    structureOf,
} from './routeStructureCache.ts'

// the vitest environment is plain node: back localStorage with a Map
const backing = new Map<string, string>()
vi.stubGlobal('localStorage', {
    getItem: (key: string) => backing.get(key) ?? null,
    setItem: (key: string, value: string) => void backing.set(key, value),
    removeItem: (key: string) => void backing.delete(key),
    clear: () => backing.clear(),
})

beforeEach(() => {
    clearStructureCache()
    localStorage.clear()
    setStructureCacheEnabled(true)
})

/** The module as a NEW tab (or a reload) sees it: only what storage kept. */
const inAFreshTab = async () => {
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

const key = (route: string, initialState?: Record<string, unknown>) =>
    structureCacheKey({ baseUrl: '', consumedRoute: '', route, serverSideType: 'App', initialState })

describe('structureCacheKey', () => {
    it('composes from baseUrl, consumedRoute, route and serverSideType', () => {
        expect(structureCacheKey({ baseUrl: 'b', consumedRoute: '/c', route: '/r', serverSideType: 'T' }))
            .toBe('b|/c|/r|T')
    })

    it('tolerates undefined parts', () => {
        expect(structureCacheKey({ baseUrl: '', consumedRoute: undefined, route: undefined, serverSideType: undefined }))
            .toBe('|||')
    })

    it('folds a non-empty initialState into a distinct suffix', () => {
        const a = structureCacheKey({ baseUrl: '', consumedRoute: '', route: '/r', serverSideType: 'T', initialState: { stayId: 1 } })
        const b = structureCacheKey({ baseUrl: '', consumedRoute: '', route: '/r', serverSideType: 'T', initialState: { stayId: 2 } })
        const none = structureCacheKey({ baseUrl: '', consumedRoute: '', route: '/r', serverSideType: 'T' })
        expect(a).not.toBe(b)
        expect(a).not.toBe(none)
        expect(a).toContain('#')
    })

    it('treats an empty initialState like no state', () => {
        expect(structureCacheKey({ baseUrl: '', consumedRoute: '', route: '/r', serverSideType: 'T', initialState: {} }))
            .toBe(structureCacheKey({ baseUrl: '', consumedRoute: '', route: '/r', serverSideType: 'T' }))
    })
})

describe('routeStructureCache', () => {
    it('round-trips a structure by key', () => {
        putCachedStructure(key('/a'), comp('a'))
        putCachedStructure(key('/b'), comp('b'))
        expect(getCachedStructure(key('/a'))?.component.id).toBe('a')
        expect(getCachedStructure(key('/b'))?.component.id).toBe('b')
        expect(getCachedStructure(key('/missing'))).toBeUndefined()
    })

    it('round-trips the server ETag next to the structure', () => {
        putCachedStructure(key('/a'), comp('a'), 'hash-123')
        expect(getCachedStructure(key('/a'))?.hash).toBe('hash-123')
        // a store without a hash (old backend) reads back undefined, not a crash
        putCachedStructure(key('/b'), comp('b'))
        expect(getCachedStructure(key('/b'))?.hash).toBeUndefined()
    })

    it('separates entries seeded with different initialState', () => {
        putCachedStructure(key('/a', { stayId: 1 }), comp('one'))
        putCachedStructure(key('/a', { stayId: 2 }), comp('two'))
        expect(getCachedStructure(key('/a', { stayId: 1 }))?.component.id).toBe('one')
        expect(getCachedStructure(key('/a', { stayId: 2 }))?.component.id).toBe('two')
        expect(getCachedStructure(key('/a'))).toBeUndefined()
    })

    it('invalidates entries written under a different cache version', () => {
        // simulate a stale entry from an older CACHE_VERSION
        localStorage.setItem('mateu-route-structure-cache', JSON.stringify({
            [key('/a')]: { v: 999, t: Date.now(), component: comp('stale') },
        }))
        expect(getCachedStructure(key('/a'))).toBeUndefined()
    })

    it('evicts the least-recently-written entries past the cap', () => {
        let now = 1_000
        const spy = vi.spyOn(Date, 'now').mockImplementation(() => now++)
        for (let i = 0; i < 60; i++) putCachedStructure(key('/r' + i), comp('r' + i))
        // the 10 oldest (r0..r9) are gone, the newest survive
        expect(getCachedStructure(key('/r0'))).toBeUndefined()
        expect(getCachedStructure(key('/r9'))).toBeUndefined()
        expect(getCachedStructure(key('/r10'))?.component.id).toBe('r10')
        expect(getCachedStructure(key('/r59'))?.component.id).toBe('r59')
        spy.mockRestore()
    })

    it('honors the kill switch for both read and write', () => {
        putCachedStructure(key('/a'), comp('a'))
        setStructureCacheEnabled(false)
        expect(getCachedStructure(key('/a'))).toBeUndefined()   // read disabled
        putCachedStructure(key('/b'), comp('b'))                 // write disabled
        setStructureCacheEnabled(true)
        expect(getCachedStructure(key('/b'))).toBeUndefined()
    })

    it('survives corrupt storage', () => {
        localStorage.setItem('mateu-route-structure-cache', 'not json')
        expect(getCachedStructure(key('/a'))).toBeUndefined()
        putCachedStructure(key('/a'), comp('a'))
        expect(getCachedStructure(key('/a'))?.component.id).toBe('a')
    })

    it('clears the whole cache', () => {
        putCachedStructure(key('/a'), comp('a'))
        clearStructureCache()
        expect(getCachedStructure(key('/a'))).toBeUndefined()
    })

    it('never persists the values the page was opened with (final review H2)', async () => {
        const page = { ...comp('a'), initialData: { name: 'OLD-SECRET-VALUE' } } as Component
        putCachedStructure(key('/a'), page, 'h1')
        expect(localStorage.getItem('mateu-route-structure-cache') ?? '').not.toContain('OLD-SECRET-VALUE')
        // a revisit in the same tab paints it as before, values included
        const cached = getCachedStructure(key('/a'))
        expect((cached?.component as { initialData?: unknown }).initialData).toEqual({ name: 'OLD-SECRET-VALUE' })
        expect(cached?.hash).toBe('h1')
        // another tab, a reload, another user of the browser: nothing to paint
        const fresh = await inAFreshTab()
        expect(fresh.getCachedStructure(key('/a'))).toBeUndefined()
    })

    it("drops an island's values too", async () => {
        const island = { ...comp('island'), initialData: { iban: 'ES00-SECRET' } } as Component
        putCachedStructure(key('/a'), { ...comp('a'), children: [island] } as Component, 'h1')
        expect(localStorage.getItem('mateu-route-structure-cache') ?? '').not.toContain('ES00-SECRET')
        expect((await inAFreshTab()).getCachedStructure(key('/a'))).toBeUndefined()
    })

    it('a structure that carries no values survives a reload, with its ETag', async () => {
        putCachedStructure(key('/a'), comp('a'), 'h1')
        const cached = (await inAFreshTab()).getCachedStructure(key('/a'))
        expect(cached?.component.id).toBe('a')
        expect(cached?.hash).toBe('h1')
    })

    it('structureOf leaves the input untouched', () => {
        const page = { ...comp('a'), initialData: { name: 'Ada' } } as Component
        const { component, valued } = structureOf(page)
        expect(valued).toBe(true)
        expect((component as { initialData?: unknown }).initialData).toBeUndefined()
        expect((page as { initialData?: unknown }).initialData).toEqual({ name: 'Ada' })
        expect(structureOf(comp('b')).valued).toBe(false)
    })

    it('clearing forgets this tab\'s copy too', () => {
        putCachedStructure(key('/a'), { ...comp('a'), initialData: { n: 1 } } as Component, 'h1')
        clearStructureCache()
        expect(getCachedStructure(key('/a'))).toBeUndefined()
    })

    it('hands out a copy: what the screen writes on a component never reaches the next visit', () => {
        const trigger = { type: 'OnLoad', actionId: 'search' } as Record<string, unknown>
        const component = { type: ComponentType.ServerSide, triggers: [trigger] } as unknown as Component
        putCachedStructure('key', component, 'hash')

        // the first render of the answer itself, and of a seed: each fires its OnLoad (claimOnLoadFiring)
        trigger.triggered = true
        const seed = getCachedStructure('key')!.component as unknown as { triggers: Record<string, unknown>[] }
        expect(seed.triggers[0].triggered).toBeUndefined()
        seed.triggers[0].triggered = true

        const revisit = getCachedStructure('key')!
        expect((revisit.component as unknown as { triggers: Record<string, unknown>[] }).triggers[0].triggered).toBeUndefined()
        expect(revisit.hash).toBe('hash')
    })
})
