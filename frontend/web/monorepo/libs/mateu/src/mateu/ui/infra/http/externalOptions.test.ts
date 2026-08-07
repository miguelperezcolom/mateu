import { describe, it, expect, afterEach } from 'vitest'
import { getByPath, mapItemsToOptions, mapItemsToRows, fetchExternalOptions, fetchExternalRows, fetchExternalJson } from './externalOptions'
import { registerExternalAuthProvider } from './externalAuth'
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

describe('mapItemsToRows', () => {
    it('maps each item into a row keyed by column id (dot paths)', () => {
        const json = { data: { countries: [{ code: 'ES', name: 'Spain', pop: 47 }] } }
        expect(mapItemsToRows(json, 'data.countries', ['code', 'name', 'pop'])).toEqual([
            { code: 'ES', name: 'Spain', pop: 47 },
        ])
    })
    it('treats the root as the array when itemsPath is blank and fills missing columns with undefined', () => {
        expect(mapItemsToRows([{ a: 1 }], '', ['a', 'b'])).toEqual([{ a: 1, b: undefined }])
    })
    it('returns [] when the path is not an array', () => {
        expect(mapItemsToRows({ nope: 1 }, 'x', ['a'])).toEqual([])
    })
})

describe('fetchExternalRows', () => {
    it('fetches and maps rows by column id', async () => {
        const fetchImpl = (async () => ({
            ok: true,
            status: 200,
            json: async () => ({ items: [{ code: 'FR', name: 'France' }] }),
        })) as unknown as typeof fetch
        const rows = await fetchExternalRows(
            { url: 'https://x', itemsPath: 'items' } as RestDataSource,
            ['code', 'name'],
            (t) => t,
            fetchImpl,
        )
        expect(rows).toEqual([{ code: 'FR', name: 'France' }])
    })
})

describe('fetchExternalJson', () => {
    it('interpolates url/headers/body and returns the raw JSON (the leg a @RestAction uses)', async () => {
        let seen: { url?: string; init?: RequestInit } = {}
        const fetchImpl = (async (url: string, init: RequestInit) => {
            seen = { url, init }
            return { ok: true, status: 200, json: async () => ({ address: { city: 'Madrid' } }) }
        }) as unknown as typeof fetch
        const json = await fetchExternalJson(
            { url: 'https://x/${state.zip}', method: 'POST', headers: { Authorization: 'Bearer ${state.t}' }, body: '{"z":"${state.zip}"}' } as RestDataSource,
            (t) => t?.replace('${state.zip}', '28001').replace('${state.t}', 'abc'),
            fetchImpl,
        )
        expect(seen.url).toBe('https://x/28001')
        expect((seen.init?.headers as Record<string, string>).Authorization).toBe('Bearer abc')
        expect(seen.init?.body).toBe('{"z":"28001"}')
        expect(getByPath(json, 'address.city')).toBe('Madrid')
    })
})

describe('client-side auth provider (direct path)', () => {
    afterEach(() => registerExternalAuthProvider(undefined))

    const capture = (): [typeof fetch, () => Record<string, string>] => {
        let headers: Record<string, string> = {}
        const fetchImpl = (async (_u: string, init: RequestInit) => {
            headers = init.headers as Record<string, string>
            return { ok: true, status: 200, json: async () => ({}) }
        }) as unknown as typeof fetch
        return [fetchImpl, () => headers]
    }

    it('merges provider headers into a direct fetch, winning over a declared header', async () => {
        registerExternalAuthProvider(({ url, method }) => ({ Authorization: `Bearer secret-${method}`, 'X-Url': url }))
        const [fetchImpl, headers] = capture()
        await fetchExternalJson(
            { url: 'https://api/x', headers: { Authorization: 'Bearer declared' } } as RestDataSource,
            (t) => t,
            fetchImpl,
        )
        expect(headers().Authorization).toBe('Bearer secret-GET') // provider wins over the declared header
        expect(headers()['X-Url']).toBe('https://api/x')
    })

    it('adds nothing when no provider is registered', async () => {
        const [fetchImpl, headers] = capture()
        await fetchExternalJson({ url: 'https://api/x' } as RestDataSource, (t) => t, fetchImpl)
        expect(headers().Authorization).toBeUndefined()
    })

    it('a throwing provider does not break the fetch', async () => {
        registerExternalAuthProvider(() => { throw new Error('token store down') })
        const [fetchImpl, headers] = capture()
        await fetchExternalJson({ url: 'https://api/x' } as RestDataSource, (t) => t, fetchImpl)
        expect(headers().Authorization).toBeUndefined()
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
