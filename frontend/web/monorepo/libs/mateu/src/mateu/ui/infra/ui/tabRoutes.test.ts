import { describe, expect, it } from 'vitest'
import { tabIndexFromPath, tabRoutePath } from './tabRoutes'

describe('tabRoutePath', () => {
    it('appends the key to a page path that names no tab yet', () => {
        expect(tabRoutePath('/vcns/7', ['subnets', 'gateways'], 'gateways')).toBe('/vcns/7/gateways')
    })
    it('replaces the key of the tab the path already names', () => {
        expect(tabRoutePath('/vcns/7/subnets', ['subnets', 'gateways'], 'gateways')).toBe('/vcns/7/gateways')
    })
    it('ignores a trailing slash', () => {
        expect(tabRoutePath('/vcns/7/', ['subnets'], 'subnets')).toBe('/vcns/7/subnets')
    })
})

describe('tabIndexFromPath', () => {
    it('finds the tab the last segment names', () => {
        expect(tabIndexFromPath('/vcns/7/gateways', ['subnets', 'gateways'])).toBe(1)
    })
    it('is -1 when the path names no tab', () => {
        expect(tabIndexFromPath('/vcns/7', ['subnets', 'gateways'])).toBe(-1)
    })
    it('skips tabs with no key', () => {
        expect(tabIndexFromPath('/vcns/7/x', [undefined, 'x'])).toBe(1)
    })
})
