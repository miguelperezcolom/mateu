import { describe, it, expect } from 'vitest'
import { getByPath, mapItemsToOptions, fetchExternalOptions } from './externalOptions'
import type RestDataSource from '@mateu/shared/apiClients/dtos/componentmetadata/RestDataSource.ts'

describe('getByPath', () => {
    it('returns the object itself for an empty path', () => {
        expect(getByPath({ a: 1 }, '')).toEqual({ a: 1 })
        expect(getByPath({ a: 1 }, undefined)).toEqual({ a: 1 })
    })
    it('navigates a dot path', () => {
        expect(getByPath({ name: { common: 'Spain' } }, 'name.common')).toBe('Spain')
    })
    it('is undefined for a missing key', () => {
        expect(getByPath({ a: 1 }, 'b.c')).toBeUndefined()
    })
})

describe('mapItemsToOptions', () => {
    it('maps objects by value/label paths', () => {
        const json = { data: { items: [{ cca2: 'ES', name: { common: 'Spain' } }] } }
        expect(mapItemsToOptions(json, 'data.items', 'cca2', 'name.common')).toEqual([
            { value: 'ES', label: 'Spain' },
        ])
    })
    it('treats the root as the array when itemsPath is blank', () => {
        const json = [{ id: 1, title: 'One' }]
        expect(mapItemsToOptions(json, '', 'id', 'title')).toEqual([{ value: 1, label: 'One' }])
    })
    it('maps a primitive array to value=label', () => {
        expect(mapItemsToOptions(['a', 'b'], '')).toEqual([
            { value: 'a', label: 'a' },
            { value: 'b', label: 'b' },
        ])
    })
    it('falls back value↔label when one side is missing', () => {
        expect(mapItemsToOptions([{ name: 'X' }], '', 'missing', 'name')).toEqual([
            { value: 'X', label: 'X' },
        ])
    })
    it('returns [] when the path is not an array', () => {
        expect(mapItemsToOptions({ nope: true }, 'data.items')).toEqual([])
    })
})

describe('fetchExternalOptions', () => {
    const ok = (body: unknown): typeof fetch =>
        (async () => ({ ok: true, status: 200, json: async () => body })) as unknown as typeof fetch

    it('interpolates the url and maps the response', async () => {
        let calledUrl = ''
        const source: RestDataSource = { url: 'https://x/${state.q}', itemsPath: '', valuePath: 'v', labelPath: 'l' }
        const fetchImpl = (async (u: string) => {
            calledUrl = u
            return { ok: true, status: 200, json: async () => [{ v: 1, l: 'one' }] }
        }) as unknown as typeof fetch
        const opts = await fetchExternalOptions(source, (t) => t?.replace('${state.q}', 'ES'), fetchImpl)
        expect(calledUrl).toBe('https://x/ES')
        expect(opts).toEqual([{ value: 1, label: 'one' }])
    })

    it('throws on a non-2xx response', async () => {
        const fetchImpl = (async () => ({ ok: false, status: 503, json: async () => ({}) })) as unknown as typeof fetch
        await expect(fetchExternalOptions({ url: 'https://x' }, (t) => t, fetchImpl)).rejects.toThrow(/503/)
    })

    it('sends a body for POST', async () => {
        let sentBody: unknown
        const source: RestDataSource = { url: 'https://x', method: 'POST', body: '{"q":1}' }
        const fetchImpl = (async (_u: string, init: RequestInit) => {
            sentBody = init.body
            return { ok: true, status: 200, json: async () => [] }
        }) as unknown as typeof fetch
        await fetchExternalOptions(source, (t) => t, fetchImpl)
        expect(sentBody).toBe('{"q":1}')
        void ok
    })
})
