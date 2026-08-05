import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ComponentType } from '@mateu/shared/apiClients/dtos/ComponentType.ts'
import type Component from '@mateu/shared/apiClients/dtos/Component.ts'
import {
    clearStructureCache,
    getCachedStructure,
    putCachedStructure,
    setStructureCacheEnabled,
    structureCacheKey,
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
    localStorage.clear()
    setStructureCacheEnabled(true)
})

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
        expect(getCachedStructure(key('/a'))?.id).toBe('a')
        expect(getCachedStructure(key('/b'))?.id).toBe('b')
        expect(getCachedStructure(key('/missing'))).toBeUndefined()
    })

    it('separates entries seeded with different initialState', () => {
        putCachedStructure(key('/a', { stayId: 1 }), comp('one'))
        putCachedStructure(key('/a', { stayId: 2 }), comp('two'))
        expect(getCachedStructure(key('/a', { stayId: 1 }))?.id).toBe('one')
        expect(getCachedStructure(key('/a', { stayId: 2 }))?.id).toBe('two')
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
        expect(getCachedStructure(key('/r10'))?.id).toBe('r10')
        expect(getCachedStructure(key('/r59'))?.id).toBe('r59')
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
        expect(getCachedStructure(key('/a'))?.id).toBe('a')
    })

    it('clears the whole cache', () => {
        putCachedStructure(key('/a'), comp('a'))
        clearStructureCache()
        expect(getCachedStructure(key('/a'))).toBeUndefined()
    })
})
