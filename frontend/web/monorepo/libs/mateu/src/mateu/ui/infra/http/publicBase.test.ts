import { afterEach, describe, expect, it } from 'vitest'
import { normalizePublicBase, publicBase, setPublicBase, underPublicBase, withoutPublicBase } from './publicBase'

describe('publicBase', () => {
    afterEach(() => setPublicBase(''))

    it('normalizes the base the page names, and refuses anything that is not a plain path', () => {
        expect(normalizePublicBase('/crm/')).toBe('/crm')
        expect(normalizePublicBase('crm')).toBe('/crm')
        expect(normalizePublicBase('/a/b')).toBe('/a/b')
        expect(normalizePublicBase('/')).toBe('')
        expect(normalizePublicBase(undefined)).toBe('')
        expect(normalizePublicBase('//evil.example')).toBe('')
        expect(normalizePublicBase('/"><script>')).toBe('')
    })

    it('puts a root-relative path the server names under the base, and nothing else', () => {
        setPublicBase('/crm')
        expect(publicBase()).toBe('/crm')
        expect(underPublicBase('/orders')).toBe('/crm/orders')
        expect(underPublicBase('/orders/3?x=1')).toBe('/crm/orders/3?x=1')
        expect(underPublicBase('/api/products')).toBe('/crm/api/products')
        // already under it: the page's own baseUrl / pathPrefix
        expect(underPublicBase('/crm')).toBe('/crm')
        expect(underPublicBase('/crm/plain')).toBe('/crm/plain')
        // a sibling that only starts with the same letters is NOT under it
        expect(underPublicBase('/crmx')).toBe('/crm/crmx')
        // absolute, protocol-relative, relative, empty: untouched
        expect(underPublicBase('https://api.example/x')).toBe('https://api.example/x')
        expect(underPublicBase('//cdn.example/x')).toBe('//cdn.example/x')
        expect(underPublicBase('orders')).toBe('orders')
        expect(underPublicBase('')).toBe('')
        expect(underPublicBase(undefined)).toBe(undefined)
    })

    it('is a no-op at the root of a host', () => {
        expect(underPublicBase('/orders')).toBe('/orders')
        expect(withoutPublicBase('/orders')).toBe('/orders')
    })

    it('takes the base off a browser path', () => {
        expect(withoutPublicBase('/crm/orders', '/crm')).toBe('/orders')
        expect(withoutPublicBase('/crm', '/crm')).toBe('/')
        expect(withoutPublicBase('/other', '/crm')).toBe('/other')
    })
})
