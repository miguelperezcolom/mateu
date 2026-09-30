import { describe, it, expect } from 'vitest'
import { autoTrail, menuTrail, parentCrumb, publishShellMenu, shellTrail } from './breadcrumbTrail'

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

    it('the shell that published first owns the menu; @NoBreadcrumbs on it turns the trail off', () => {
        const shell = {}
        publishShellMenu(shell, menu, false)
        publishShellMenu({}, [leaf('Otra', '/booking/bookings')], false) // a pod's own app, inside
        expect(shellTrail('/booking/bookings', es).map(c => c.text)).toEqual(['Call center', 'Reservas'])
        publishShellMenu(shell, menu, true)
        expect(shellTrail('/booking/bookings', es)).toEqual([])
    })
})
