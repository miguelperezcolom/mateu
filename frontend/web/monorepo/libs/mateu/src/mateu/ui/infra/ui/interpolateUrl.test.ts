import { describe, expect, it } from 'vitest'
import { interpolateUrl, templateResolver, urlEncode } from './interpolation'
import { fetchExternalJson } from '../http/externalOptions'

// The same cases are pinned on the server (TemplateInterpolatorUrlTest), .NET (UrlTemplateTests)
// and Python (test_url_template.py): a direct call and a proxied one must reach the same url.
describe('interpolateUrl', () => {
    it('a path value cannot add segments or a query', () => {
        expect(interpolateUrl('https://api.example.com/people/${state.id}', { id: '1/../../admin?x=' }))
            .toBe('https://api.example.com/people/1%2F..%2F..%2Fadmin%3Fx%3D')
    })

    it('a query value cannot add parameters', () => {
        expect(interpolateUrl('/search?q=${state.q}&page=1', { q: 'a b&page=99#frag' }))
            .toBe('/search?q=a%20b%26page%3D99%23frag&page=1')
    })

    it('unicode and reserved characters are encoded like the server does', () => {
        expect(interpolateUrl('/x/${state.v}', { v: "Ñandú !'()*~._-" }))
            .toBe('/x/%C3%91and%C3%BA%20%21%27%28%29%2A~._-')
        expect(urlEncode("!'()*")).toBe('%21%27%28%29%2A')
    })

    it('a leading configured base is substituted raw', () => {
        expect(interpolateUrl('${appState.base}/people/${state.id}', { id: 7 }, {}, { appState: { base: 'https://h/v1' } }))
            .toBe('https://h/v1/people/7')
    })

    it('client state cannot choose the origin', () => {
        expect(() => interpolateUrl('${state.base}/people', { base: 'http://169.254.169.254' })).toThrow()
        expect(() => interpolateUrl('https://${state.host}/people', { host: 'evil' })).toThrow()
    })

    it('a dot segment is refused in the path but not in the query', () => {
        expect(() => interpolateUrl('/people/${state.id}', { id: '..' })).toThrow()
        expect(interpolateUrl('/people?id=${state.id}', { id: '..' })).toBe('/people?id=..')
    })

    it('missing values and templates without placeholders', () => {
        expect(interpolateUrl('/people/${state.missing}', {})).toBe('/people/')
        expect(interpolateUrl('https://h/x', {})).toBe('https://h/x')
        expect(interpolateUrl(undefined, {})).toBeUndefined()
    })
})

describe('fetchExternalJson with a templateResolver', () => {
    it('encodes the url and leaves headers interpolated as they were', async () => {
        const calls: { url: string; init: RequestInit }[] = []
        const fakeFetch = (async (url: string, init: RequestInit) => {
            calls.push({ url, init })
            return { ok: true, status: 200, text: async () => '{}' } as unknown as Response
        }) as unknown as typeof fetch
        await fetchExternalJson(
            { url: 'https://h/people/${state.id}', headers: { 'X-Name': '${state.name}' } } as any,
            templateResolver({ id: 'a/b', name: 'x/y' }, {}),
            fakeFetch,
        )
        expect(calls[0].url).toBe('https://h/people/a%2Fb')
        expect((calls[0].init.headers as Record<string, string>)['X-Name']).toBe('x/y')
    })
})
