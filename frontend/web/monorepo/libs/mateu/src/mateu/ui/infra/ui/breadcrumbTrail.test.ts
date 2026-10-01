import { describe, it, expect, vi } from 'vitest'
import { autoTrail, menuTrail, parentCrumb, publishShellMenu, shellTrail, pathOfPage, menuEntryFor } from './breadcrumbTrail'

const leaf = (label: string, route: string) => ({ label, route, submenus: [] } as any)
const group = (label: string, submenus: any[], route = '') => ({ label, route, submenus } as any)

// the shape of a federated shell: groups the shell draws, sections a pod contributed under them
const menu = [
    leaf('Inicio', ''),
    group('Call center', [leaf('Reservas', '/booking/bookings'), leaf('Clientes', '/booking/customers')]),
    group('ERP', [group('Maestros', [leaf('Interlocutores', '/erp/partners')])]),
    leaf('Avisos', '/notices'),
]


const es = { lang: 'es' }

describe('the automatic breadcrumb trail', () => {
    it('a listing is its menu path', () => {
        expect(autoTrail(menu, '/booking/bookings', es)).toEqual([
            { text: 'Call center' }, { text: 'Reservas' },
        ])
    })

    it('a record is titled with its own page title, and links back to the listing', () => {
        expect(autoTrail(menu, '/booking/bookings/QN29HB', { title: '<b>QN29HB</b> · Giulia Keller', pageType: 'detail', lang: 'es' })).toEqual([
            { text: 'Call center' }, { text: 'Reservas', route: '/booking/bookings' }, { text: 'QN29HB · Giulia Keller' },
        ])
    })

    it('editing names the record it edits, remembered from its own page, and says so', () => {
        autoTrail(menu, '/booking/bookings/QN29HB', { title: 'QN29HB · Giulia Keller', lang: 'es' })
        expect(autoTrail(menu, '/booking/bookings/QN29HB/edit', { title: 'Editar reserva', lang: 'es' })).toEqual([
            { text: 'Call center' },
            { text: 'Reservas', route: '/booking/bookings' },
            { text: 'QN29HB · Giulia Keller', route: '/booking/bookings/QN29HB' },
            { text: 'Editar' },
        ])
    })

    it('a record reached straight at its edit route is named by its id', () => {
        expect(autoTrail(menu, '/booking/bookings/ZZ9/edit', es).map(c => c.text)).toEqual(['Call center', 'Reservas', 'ZZ9', 'Editar'])
    })

    it('a new record is «Nuevo»', () => {
        expect(autoTrail(menu, '/booking/bookings/new', es).map(c => c.text)).toEqual(['Call center', 'Reservas', 'Nuevo'])
    })

    it('nested groups all show; the longest matching route wins; the query string is ignored', () => {
        expect(autoTrail(menu, '/erp/partners/00100007?tab=2', { title: 'TUI Deutschland', lang: 'es' }).map(c => c.text))
            .toEqual(['ERP', 'Maestros', 'Interlocutores', 'TUI Deutschland'])
    })

    it('a top-level page alone gets no trail — its title says it already', () => {
        expect(autoTrail(menu, '/notices', es)).toEqual([])
    })

    it('a route the menu does not know gets no guessed trail, and the home never matches by prefix', () => {
        expect(autoTrail(menu, '/somewhere/else', es)).toEqual([])
        expect(menuTrail(menu, '/whatever').matched).toBeUndefined()
    })

    it('English outside Spanish', () => {
        expect(autoTrail(menu, '/booking/bookings/X/edit', { lang: 'en' }).map(c => c.text).slice(-1)).toEqual(['Edit'])
    })

    it('the parent crumb is the last one before the current with a route', () => {
        expect(parentCrumb(autoTrail(menu, '/booking/bookings/QN29HB', es))).toEqual({ text: 'Reservas', route: '/booking/bookings' })
        expect(parentCrumb(autoTrail(menu, '/booking/bookings', es))).toBeUndefined()
    })

    it('a group with a route of its own (a federated section prefix) is plain text unless an entry opens that route', () => {
        const federated = [
            group('Admin', [group('Workflow', [leaf('Processes', '/workflow/processes')], '/workflow')], '/admin'),
            group('Mapping', [leaf('Overview', '/mapping'), leaf('Dictionary', '/mapping/dictionary')], '/mapping'),
        ]
        expect(autoTrail(federated, '/workflow/processes/42', es)).toEqual([
            { text: 'Admin' }, { text: 'Workflow' }, { text: 'Processes', route: '/workflow/processes' }, { text: '42' },
        ])
        // «Mapping» is also an entry's route: that one IS a page
        expect(autoTrail(federated, '/mapping/dictionary/7', es)[0]).toEqual({ text: 'Mapping', route: '/mapping' })
        expect(parentCrumb(autoTrail(federated, '/workflow/processes', es))).toBeUndefined()
    })

    it('the shell that published first owns the menu; @NoBreadcrumbs on it turns the trail off', () => {
        const shell = {}
        publishShellMenu(shell, menu, false)
        publishShellMenu({}, [leaf('Otra', '/booking/bookings')], false) // a pod's own app, inside
        expect(shellTrail('/booking/bookings', es).map(c => c.text)).toEqual(['Call center', 'Reservas'])
        publishShellMenu(shell, menu, true)
        expect(shellTrail('/booking/bookings', es)).toEqual([])
    })

    it('a page keeps the path it was rendered for: the URL changing ahead of the next page does not move its trail', () => {
        const g = globalThis as any
        const had = 'window' in g
        const previous = g.window
        g.window = { location: { pathname: '/audit/actions' } }
        try {
            const oldPage = {}
            expect(pathOfPage(oldPage)).toBe('/audit/actions')
            g.window.location.pathname = '/mapping/dictionary' // the menu click, before the new page arrives
            expect(pathOfPage(oldPage)).toBe('/audit/actions')
            expect(pathOfPage({})).toBe('/mapping/dictionary') // the new page, once it arrives
        } finally {
            if (had) g.window = previous; else delete g.window
        }
    })
})

describe('a crumb navigates like the menu', () => {
    const menu: any[] = [
        { label: 'Call center', route: '/booking', submenus: [
            { label: 'Bookings', route: '/booking/bookings', consumedRoute: '/booking', baseUrl: '/_booking', submenus: [] },
        ] },
    ]
    it('finds the entry that owns a route, a record under it included', () => {
        expect(menuEntryFor(menu, '/booking/bookings')?.label).toBe('Bookings')
        expect(menuEntryFor(menu, '/booking/bookings/VF67UM')?.label).toBe('Bookings')
        expect(menuEntryFor(menu, '/other')).toBeUndefined()
    })
    it('goes through the shell navigator with the crumb route', async () => {
        vi.resetModules() // a fresh store: the shell that publishes first owns it
        const fresh = await import('./breadcrumbTrail')
        const calls: any[] = []
        expect(fresh.navigateLikeMenu('/booking/bookings')).toBe(false) // no shell yet: caller falls back
        fresh.publishShellMenu({}, menu as any, false, (option: any, route: string) => calls.push([option.label, route]))
        expect(fresh.navigateLikeMenu('/booking/bookings')).toBe(true)
        expect(fresh.navigateLikeMenu('/booking/bookings/VF67UM')).toBe(true)
        expect(calls).toEqual([['Bookings', '/booking/bookings'], ['Bookings', '/booking/bookings/VF67UM']])
        expect(fresh.navigateLikeMenu('/nowhere')).toBe(false)
    })
})
