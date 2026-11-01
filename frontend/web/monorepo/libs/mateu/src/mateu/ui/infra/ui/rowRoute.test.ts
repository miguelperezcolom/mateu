// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { isExternalRoute, navigateToRoute, rowRouteOf } from './rowRoute'

describe('isExternalRoute', () => {
    it('a whole URL leaves the app; a route of the app does not', () => {
        for (const ext of ['https://images.nasa.gov/x.jpg', 'http://a.b', 'HTTPS://A.B', '//cdn.example.com/x', 'mailto:a@b.c', 'javascript:alert(1)']) {
            expect(isExternalRoute(ext), ext).toBe(true)
        }
        for (const own of ['missions/6', '/missions/6/edit', 'people?q=a:b', '', undefined, null]) {
            expect(isExternalRoute(own as string), String(own)).toBe(false)
        }
    })
})

describe('a rowRoute that is a whole URL', () => {
    afterEach(() => vi.restoreAllMocks())

    it('resolves from the row unencoded', () => {
        expect(rowRouteOf('${row.imageLarge}', { imageLarge: 'https://images-assets.nasa.gov/image/a/a~large.jpg' }))
            .toBe('https://images-assets.nasa.gov/image/a/a~large.jpg')
    })

    it('opens in a new tab instead of navigating the app', () => {
        const open = vi.spyOn(window, 'open').mockImplementation(() => null)
        const from = document.createElement('div')
        const events: string[] = []
        for (const t of ['route-changed', 'navigate-to-requested']) from.addEventListener(t, () => events.push(t))
        navigateToRoute(from, 'https://images.nasa.gov/details/as15')
        expect(open).toHaveBeenCalledWith('https://images.nasa.gov/details/as15', '_blank', 'noopener,noreferrer')
        expect(events).toEqual([])
    })

    it('a refused scheme goes nowhere — neither a tab nor the app', () => {
        const open = vi.spyOn(window, 'open').mockImplementation(() => null)
        vi.spyOn(console, 'warn').mockImplementation(() => undefined)
        const from = document.createElement('div')
        const events: string[] = []
        from.addEventListener('route-changed', () => events.push('route-changed'))
        navigateToRoute(from, 'javascript:alert(1)')
        expect(open).not.toHaveBeenCalled()
        expect(events).toEqual([])
    })

    it('an app route still navigates the app', () => {
        const from = document.createElement('div')
        const events: string[] = []
        for (const t of ['route-changed', 'navigate-to-requested']) from.addEventListener(t, () => events.push(t))
        navigateToRoute(from, 'missions/6')
        expect(events).toEqual(['route-changed', 'navigate-to-requested'])
    })
})
