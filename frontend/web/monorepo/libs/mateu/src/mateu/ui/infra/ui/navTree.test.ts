import { describe, expect, it } from 'vitest'
import {
    activeSection,
    activeTopIndex,
    coverLength,
    isActiveFor,
    menuEntryFor,
    menuTrail,
    mergeRemoteMenus,
    mountPrefix,
    remoteMounts,
    sectionHome,
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

    describe('HAMBURGER_SECTIONS: sections and their homes', () => {
        const menu = [
            leaf('Inicio', '/inicio'),
            mount('IA', '/_ai', { routePrefix: '/ai', shellLabel: true }),
            group('Usuarios', [
                leaf('Oculta', '/users/hidden', { visible: false }),
                { separator: true, label: '', route: '', submenus: [] } as any,
                group('Permisos', [leaf('Roles', '/users/roles'), leaf('Grants', '/users/grants')]),
                leaf('Users', '/users/users'),
            ], '/users'),
            mount('Caído', '/_down', { routePrefix: '/down', unavailable: true }),
        ]

        it('the section on screen comes from the route, a remote one by its prefix before it answers', () => {
            expect(activeSection(menu, '/users/roles/7')?.label).toBe('Usuarios')
            expect(activeSection(menu, '/ai/agents')?.label).toBe('IA')
            expect(activeSection(menu, '/inicio')?.label).toBe('Inicio')
            expect(activeSection(menu, '/')).toBeUndefined()
            expect(activeSection(undefined, '/ai')).toBeUndefined()
        })

        it('a section\'s home is its first entry that can be opened, depth first', () => {
            // a group: hidden entries and separators are skipped, a nested group is entered
            expect(sectionHome(menu[2])?.route).toBe('/users/roles')
            // a top-level page is its own home
            expect(sectionHome(menu[0])?.route).toBe('/inicio')
        })

        it('a remote section has no home until it answers, nor one that did not', () => {
            expect(sectionHome(menu[1])).toBeUndefined()
            expect(sectionHome(menu[3])).toBeUndefined()
            expect(sectionHome(group('Vacía', [leaf('Oculta', '/x', { visible: false })]))).toBeUndefined()
        })
    })

    describe('HAMBURGER_SECTIONS: a remote mounted at the top is one section', () => {
        const remote = mount('Remote', 'http://r', { path: '/remote', routePrefix: '/remote', shellLabel: true })
        const nested = mount('Forms', '/_forms', { path: '/forms', routePrefix: '/forms' })
        const menu = [remote, group('Admin', [nested])]
        const pages = { app: { menu: [leaf('Page', '/remote/page'), leaf('Things', '/remote/things')], route: '/remote' } }

        it('several entries become the entries of a section named as the shell named it', () => {
            const merged = mergeRemoteMenus(menu, new Map([[remote, pages]]), 'en', { sections: true })
            expect(merged[0].label).toBe('Remote')
            expect(merged[0].submenus.map((o: any) => o.label)).toEqual(['Page', 'Things'])
            expect(merged[0].submenus[0].baseUrl).toBe('http://r')
            // and the route says which section it is
            expect(activeSection(merged, '/remote/things/t2')?.label).toBe('Remote')
            expect(sectionHome(merged[0])?.route).toBe('/remote/page')
        })

        it('one group stays the section; deeper mounts and the other variants paste as before', () => {
            const oneGroup = { app: { menu: [group('Svc', [leaf('A', '/svc/a')])] } }
            expect(mergeRemoteMenus(menu, new Map([[remote, oneGroup]]), 'en', { sections: true })[0].label).toBe('Remote')
            expect(mergeRemoteMenus(menu, new Map([[remote, oneGroup]]), 'en', { sections: true })[0].submenus[0].label).toBe('A')
            const inside = mergeRemoteMenus(menu, new Map([[nested, pages]]), 'en', { sections: true })
            expect(inside[1].submenus.map((o: any) => o.label)).toEqual(['Page', 'Things'])
            expect(mergeRemoteMenus(menu, new Map([[remote, pages]]), 'en').map(o => o.label)).toEqual(['Page', 'Things', 'Admin'])
        })
    })
})
