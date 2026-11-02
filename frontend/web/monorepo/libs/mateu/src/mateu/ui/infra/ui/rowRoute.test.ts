// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { appRouteHref, isExternalRoute, navigateToRoute, rowRouteOf } from './rowRoute'

describe('isExternalRoute', () => {
    it('a whole URL leaves the app; a route of the app does not', () => {
        for (const ext of ['https://images.nasa.gov/x.jpg', 'http://a.b', 'HTTPS://A.B', '//cdn.example.com/x', 'mailto:a@b.c', 'javascript:alert(1)']) {
            expect(isExternalRoute(ext), ext).toBe(true)
        }
        for (const own of ['missions/6', '/missions/6/edit', 'people?q=a:b', '', undefined, null]) {
            expect(isExternalRoute(own as string), String(own)).toBe(false)
        }
    })

    it('a backslash spelling of another host is another host (final review M15)', () => {
        for (const ext of ['/\\evil.com', '\\\\evil.com', '\\/evil.com']) {
            expect(isExternalRoute(ext), ext).toBe(true)
        }
    })
})

describe('a composed rowRoute (final review M15)', () => {
    it('percent-encodes each value, so it cannot leave the mount or add a query', () => {
        expect(rowRouteOf('people/${row.id}', { id: '../../admin' })).toBe('people/..%2F..%2Fadmin')
        expect(rowRouteOf('people/${row.id}', { id: 'x?y=1#z' })).toBe('people/x%3Fy%3D1%23z')
        expect(rowRouteOf('people/${row.id}/notes/${row.n}', { id: 'a b', n: 3 })).toBe('people/a%20b/notes/3')
    })

    it('an ordinary id is unchanged', () => {
        expect(rowRouteOf('people/${row.id}', { id: 42 })).toBe('people/42')
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

describe('appRouteHref (the identifier link of a rowRoute)', () => {
    afterEach(() => { document.body.innerHTML = '' })

    it('keeps a non-root mount in the link', () => {
        const ui = document.createElement('mateu-ui') as HTMLElement & { baseUrl?: string, pathPrefix?: string }
        ui.baseUrl = '/back-office'
        ui.pathPrefix = '/back-office'
        const cell = document.createElement('span')
        ui.appendChild(cell)
        document.body.appendChild(ui)
        expect(appRouteHref(cell, 'people/3')).toBe('/back-office/people/3')
        expect(appRouteHref(cell, '/people/3')).toBe('/back-office/people/3')
    })

    it('is the bare route without a mateu-ui around', () => {
        expect(appRouteHref(document.createElement('span'), 'people/3')).toBe('/people/3')
    })
})
