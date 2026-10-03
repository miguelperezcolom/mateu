import { describe, expect, it } from 'vitest'
import {
    activeTopIndex,
    coverLength,
    isActiveFor,
    menuEntryFor,
    menuTrail,
    mergeRemoteMenus,
    mountPrefix,
    remoteMounts,
    unavailableHint,
    withoutHidden,
    withPrefixesFromHome,
} from './navTree'

const leaf = (label: string, route: string, extra: Record<string, unknown> = {}) => ({ label, route, submenus: [], ...extra } as any)
const group = (label: string, submenus: any[], route = '') => ({ label, route, submenus } as any)
const mount = (label: string, baseUrl: string, extra: Record<string, unknown> = {}) =>
    ({ label, remote: true, baseUrl, route: '', submenus: [], ...extra } as any)

describe('the navigation tree', () => {

    it('a remote section is placed by its prefix; an older server sends only the path, which stands in', () => {
        expect(mountPrefix(mount('Forms', '/_forms', { path: '/admin/forms', routePrefix: '/forms' }))).toBe('/forms')
        expect(mountPrefix(mount('Booking', '/_booking', { path: '/booking' }))).toBe('/booking')
        expect(mountPrefix(leaf('Local', '/local'))).toBe('')
    })

    it('the active top-level option is the most specific one, and the home never wins by prefix', () => {
        const menu = [
            leaf('Inicio', ''),
            mount('Call center', '/_booking', { routePrefix: '/booking' }),
            group('Admin', [leaf('Reports', '/booking/reports')]),
        ]
        expect(activeTopIndex(menu, '/booking/bookings')).toBe(1)
        // a real entry under the same first segment says more than the section's prefix
        expect(activeTopIndex(menu, '/booking/reports/2026')).toBe(2)
        expect(activeTopIndex(menu, '/')).toBeNaN()
        expect(activeTopIndex(menu, '/elsewhere')).toBeNaN()
    })

    it('a group is active when it holds the active entry, and a prefix never matches a longer name', () => {
        const admin = group('Admin', [leaf('Forms', '/forms/tasks')], '/admin')
        expect(isActiveFor(admin, '/forms/tasks/7')).toBe(true)
        expect(isActiveFor(admin, '/admin')).toBe(true)
        expect(isActiveFor(leaf('Forms', '/forms'), '/forms-archive')).toBe(false)
        expect(coverLength(admin, '/forms/tasks/7')).toBe('/forms/tasks'.length)
    })

    it('the trail prefers a real entry to a section prefix of the same length', () => {
        const menu = [
            mount('Avisos', '/_notices', { routePrefix: '/notices' }),
            leaf('Notices', '/notices'),
        ]
        expect(menuTrail(menu, '/notices/7')).toEqual({ crumbs: [{ text: 'Notices', route: '/notices' }], matched: '/notices' })
    })

    it('a section that has not answered is pending: the section is known, what is under it is not', () => {
        const menu = [group('Admin', [mount('Forms', '/_forms', { routePrefix: '/forms' })])]
        expect(menuTrail(menu, '/forms/tasks')).toEqual({
            crumbs: [{ text: 'Admin' }, { text: 'Forms' }], matched: '/forms', pending: true,
        })
    })

    it('hidden entries are not drawn but still place a page', () => {
        const menu = [group('Inbox', [leaf('Tasks', '/inbox/tasks')], '/inbox')]
        menu[0].visible = false
        expect(withoutHidden(menu)).toEqual([])
        expect(menuTrail(menu, '/inbox/tasks/1').crumbs).toEqual([{ text: 'Inbox' }, { text: 'Tasks', route: '/inbox/tasks' }])
    })

    it('a section that has not answered is not an entry to navigate to', () => {
        expect(menuEntryFor([mount('Forms', '/_forms', { routePrefix: '/forms' })], '/forms/tasks')).toBeUndefined()
    })

    it('every remote section, at any depth, hidden ones included', () => {
        const hidden = mount('Inbox', '/_inbox', { visible: false })
        const nested = mount('Forms', '/_forms')
        expect(remoteMounts([leaf('a', '/a'), group('Admin', [nested]), hidden])).toEqual([nested, hidden])
    })

    it('a deep link tells which remote it came from, and so where that remote\'s screens live', () => {
        const admin = mount('Workflow', '/_workflow-admin', { routePrefix: '/workflowAdmin' })
        const other = mount('Forms', '/_forms', { routePrefix: '/forms' })
        const menu = [group('Platform', [admin]), other]

        const learnt = withPrefixesFromHome(menu, '/_workflow-admin', '/workflow/definitions?x=1')

        expect(learnt[0].submenus[0].routePrefix).toBe('/workflow')
        expect(learnt[1]).toBe(other)
        // nothing to learn: the same array
        expect(withPrefixesFromHome(menu, '/_forms', '/forms/tasks')).toBe(menu)
        expect(withPrefixesFromHome(menu, undefined, '/x')).toBe(menu)
        expect(withPrefixesFromHome(menu, '/_workflow-admin', '/')).toBe(menu)
    })

    describe('merging the remotes\' menus', () => {

        it('the shell\'s declared label and icon win over the remote\'s single group', () => {
            const placeholder = mount('Call center', '/_booking', { shellLabel: true, icon: 'vaadin:phone' })
            const merged = mergeRemoteMenus([placeholder], new Map([[placeholder, { app: {
                menu: [group('Booking', [leaf('Bookings', '/booking/bookings')], '/booking')], route: '', serverSideType: 'B',
            } }]]))
            expect(merged[0]).toMatchObject({ label: 'Call center', icon: 'vaadin:phone', route: '/booking' })
            expect(merged[0].submenus[0]).toMatchObject({ label: 'Bookings', baseUrl: '/_booking', serverSideType: 'B' })
        })

        it('an entry that names its own base keeps it (a remote that federates in turn)', () => {
            const placeholder = mount('Ops', '/_ops')
            const merged = mergeRemoteMenus([placeholder], new Map([[placeholder, { app: {
                menu: [leaf('Elsewhere', '/x', { baseUrl: '/_x' })],
            } }]]))
            expect(merged[0].baseUrl).toBe('/_x')
        })

        it('a hidden section comes in hidden, all the way down', () => {
            const placeholder = mount('Inbox', '/_inbox', { visible: false })
            const merged = mergeRemoteMenus([placeholder], new Map([[placeholder, { app: {
                menu: [group('Inbox', [leaf('Tasks', '/inbox/tasks')], '/inbox')],
            } }]]))
            expect(merged[0].visible).toBe(false)
            expect(merged[0].submenus[0].visible).toBe(false)
        })

        it('a remote that did not answer leaves its section, disabled and saying why; one not asked stays as it is', () => {
            const down = mount('ERP', '/_erp')
            const notAsked = mount('Inbox', '/_inbox', { visible: false })
            const merged = mergeRemoteMenus([down, notAsked], new Map([[down, { failed: true as const }]]), 'es')
            expect(merged[0]).toMatchObject({ unavailable: true, disabled: true, description: unavailableHint('ERP', 'es') })
            expect(merged[1]).toBe(notAsked)
        })

        it('never touches what it was given', () => {
            const placeholder = mount('Workflow', '/_workflow')
            const answer = [leaf('Processes', '/processes')]
            const menu = [group('Admin', [placeholder])]
            const merged = mergeRemoteMenus(menu, new Map([[placeholder, { app: { menu: answer } }]]))
            expect(merged[0]).not.toBe(menu[0])
            expect(menu[0].submenus[0]).toBe(placeholder)
            expect(answer[0].baseUrl).toBeUndefined()
        })

        it('says why in the UI\'s language', () => {
            expect(unavailableHint('<b>ERP</b>', 'es')).toBe('ERP no está disponible ahora. Se volverá a intentar.')
            expect(unavailableHint('ERP', 'en')).toBe('ERP is not available right now. It will be retried.')
        })
    })
})
