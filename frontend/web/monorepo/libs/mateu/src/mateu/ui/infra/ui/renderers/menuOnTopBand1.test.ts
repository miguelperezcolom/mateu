import { describe, expect, it } from 'vitest'
import type App from '@mateu/shared/apiClients/dtos/componentmetadata/App.ts'
import type { MateuApp } from '@infra/ui/mateu-app.ts'
import { hasHeaderWidgets, showsMenuOnTopBand1 } from './appRenderer'

/**
 * MENU_ON_TOP draws two bands: band 1 = the logo and the header widgets, band 2 = the title and the
 * menu. With neither a logo nor a widget band 1 was an empty 56px strip above the menu on every
 * page of a freshly generated app, so it is only drawn when it has something to hold.
 */
describe('MENU_ON_TOP band 1', () => {
    const app = (extra: Partial<App> = {}) => ({ title: 'My app', menu: [], ...extra }) as unknown as App
    const shell = (children: unknown[] = []) => ({ component: { children } }) as unknown as MateuApp

    it('is not drawn for an app with a title and a menu only', () => {
        expect(showsMenuOnTopBand1(app(), shell())).toBe(false)
        expect(showsMenuOnTopBand1(app(), { component: undefined } as unknown as MateuApp)).toBe(false)
    })

    it('is drawn when there is a logo', () => {
        expect(showsMenuOnTopBand1(app({ logo: '/logo.svg' }), shell())).toBe(true)
    })

    it('is drawn for every kind of header widget', () => {
        const cases: Partial<App>[] = [
            { sseUrl: '/chat' },
            { themeToggle: true },
            { mobileQr: true },
            { notificationsEnabled: true },
            { contextSelectors: [{ fieldName: 'hotel', label: 'Hotel', options: [] }] },
            { contextActions: [{ actionId: 'x', label: 'X' }] },
            { headerValues: [{ id: 'bd', label: 'Business date', value: '2026-10-18' }] },
        ] as unknown as Partial<App>[]
        for (const c of cases) {
            expect(hasHeaderWidgets(app(c), shell())).toBe(true)
            expect(showsMenuOnTopBand1(app(c), shell())).toBe(true)
        }
    })

    it('is drawn when the app authors widgets (children in slot "widgets")', () => {
        expect(showsMenuOnTopBand1(app(), shell([{ slot: 'widgets', type: 'ClientSide' }]))).toBe(true)
        expect(showsMenuOnTopBand1(app(), shell([{ type: 'ClientSide' }]))).toBe(false)
    })
})
