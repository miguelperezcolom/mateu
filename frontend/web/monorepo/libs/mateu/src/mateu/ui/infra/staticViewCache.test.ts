import { beforeEach, describe, expect, it } from 'vitest'
import type UIFragment from '@mateu/shared/apiClients/dtos/UIFragment.ts'
import {
    clearStaticFragments,
    getStaticFragment,
    putStaticFragment,
    setStaticViewCacheEnabled,
} from './staticViewCache.ts'

const frag = (id: string): UIFragment => ({
    targetComponentId: '_ux',
    component: { id } as any,
    state: { v: id },
    data: {},
    action: undefined,
    containerId: undefined,
})

beforeEach(() => {
    clearStaticFragments()
    setStaticViewCacheEnabled(true)
})

describe('staticViewCache', () => {
    it('round-trips a full fragment by key', () => {
        putStaticFragment('/a', frag('a'))
        expect(getStaticFragment('/a')?.state).toEqual({ v: 'a' })
        expect(getStaticFragment('/missing')).toBeUndefined()
    })

    it('evicts least-recently-used past the cap of 30', () => {
        for (let i = 0; i < 35; i++) putStaticFragment('/r' + i, frag('r' + i))
        expect(getStaticFragment('/r0')).toBeUndefined()   // oldest 5 gone
        expect(getStaticFragment('/r4')).toBeUndefined()
        expect(getStaticFragment('/r5')).toBeDefined()
        expect(getStaticFragment('/r34')).toBeDefined()
    })

    it('re-inserting a key refreshes its recency', () => {
        for (let i = 0; i < 30; i++) putStaticFragment('/r' + i, frag('r' + i))
        putStaticFragment('/r0', frag('r0'))              // touch the oldest → now newest
        putStaticFragment('/new', frag('new'))            // evicts the now-oldest (/r1)
        expect(getStaticFragment('/r0')).toBeDefined()
        expect(getStaticFragment('/r1')).toBeUndefined()
    })

    it('the kill switch clears and disables the cache', () => {
        putStaticFragment('/a', frag('a'))
        setStaticViewCacheEnabled(false)
        expect(getStaticFragment('/a')).toBeUndefined()
        putStaticFragment('/b', frag('b'))
        setStaticViewCacheEnabled(true)
        expect(getStaticFragment('/b')).toBeUndefined()   // write while disabled was dropped
    })

    it('clears on demand', () => {
        putStaticFragment('/a', frag('a'))
        clearStaticFragments()
        expect(getStaticFragment('/a')).toBeUndefined()
    })
})
