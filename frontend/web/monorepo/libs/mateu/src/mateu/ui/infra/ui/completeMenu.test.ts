import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import ConnectedElement from './ConnectedElement'
import { ComponentType } from '@mateu/shared/apiClients/dtos/ComponentType'
import { ComponentMetadataType } from '@mateu/shared/apiClients/dtos/ComponentMetadataType'
import { AppVariant } from '@mateu/shared/apiClients/dtos/componentmetadata/AppVariant'
import { autoTrail } from './breadcrumbTrail'
import { activeTopIndex } from './navTree'
import { retryUnavailableMenus } from './remoteMenuRetry'

const published: unknown[] = []
vi.mock('@domain/state', () => ({
    upstream: { next: (message: unknown) => published.push(message), subscribe: () => ({ unsubscribe: () => {} }) },
}))

const runAction = vi.fn()
vi.mock('@infra/http/AxiosMateuApiClient.ts', () => ({
    mateuApiClient: { runAction: (...args: unknown[]) => runAction(...args) },
}))

/**
 * Expanding a shell's remote menus, and what it is not allowed to cost.
 *
 * <p>The shape this pins comes from a measured page load. Entering
 * /workflow/definitions by URL, behind a console fronting six remote menus, ran the page's
 * three-request chain — route, page, listing search — THREE times: once for the first paint, and
 * again for each time the app component was replaced. One of those replacements was this: the menu
 * arriving. applyFragment answers a ClientSide component by setting
 * `this.component.children = [component]`, so republishing the app to update its menu threw away
 * everything the router had mounted underneath.
 *
 * <p>And what it has to keep (P9, delivery 1): one remote down is one section down, the shell's
 * label wins when it declares one, the user's place is known before any remote answers, hidden
 * sections still give breadcrumbs, and the variant is the app's own.
 */
const elements: any[] = []

const elementWith = (menu: unknown[], extra: Record<string, unknown> = {}) => {
    const app = { type: ComponentMetadataType.App, menu, variant: AppVariant.MENU_ON_LEFT, ...extra } as any
    const clientSideComponent = { id: 'app', type: ComponentType.ClientSide, metadata: app, children: [] } as any
    const proto = ConnectedElement.prototype as any
    const element = {
        id: 'target',
        callbackToken: 'token',
        isConnected: true,
        component: clientSideComponent,
        requestUpdate: vi.fn(),
        completeMenu: proto.completeMenu,
        askRemotes: proto.askRemotes,
        remoteAppOf: proto.remoteAppOf,
    } as any
    elements.push(element)
    return { element, clientSideComponent, app }
}

const remote = (baseUrl: string, label: string, extra: Record<string, unknown> = {}) =>
    ({ remote: true, baseUrl, route: '', label, params: undefined, serverSideType: '', ...extra })

const remoteAnswer = (baseUrl: string, route: string, options: unknown[]) => ({
    fragments: [{
        targetComponentId: baseUrl + '#' + route,
        component: {
            type: ComponentType.ClientSide,
            metadata: { type: ComponentMetadataType.App, menu: options, route: '', serverSideType: 'Home' },
        },
    }],
})

const appFragment = (component: unknown) => ({ component }) as any

/** Lets the allSettled chain run out. */
const settle = async () => { for (let i = 0; i < 5; i++) await Promise.resolve() }

const labels = (options: any[]) => options.map((o: any) => o.label)

describe('completeMenu', () => {

    beforeEach(() => {
        published.length = 0
        runAction.mockReset()
    })

    afterEach(() => {
        // the elements of a finished test are gone: their pending retries must not ask anything
        elements.splice(0).forEach(element => { element.isConnected = false })
        retryUnavailableMenus()
        vi.useRealTimers()
        delete (globalThis as any).window
    })

    it('asks a remote menu that sits INSIDE a group, not just the ones on the bar', async () => {
        // The regression this fixes. A shell that groups its remote sections under one entry —
        // "Admin", holding Workflow, Forms and Worker — rendered the group with the labels the
        // shell had written and nothing under them: the resolver only ever looked at the top
        // level, so nobody asked those pods for their screens. It reads as three empty services.
        const { element, clientSideComponent } = elementWith([
            { label: 'Admin', remote: false, submenus: [remote('/_workflow', 'Workflow')] },
            remote('/_booking', 'Booking'),
        ])
        runAction.mockImplementation((baseUrl: string) =>
            Promise.resolve(remoteAnswer(baseUrl, '', [{ label: 'Processes', route: '/processes' }])))

        element.completeMenu(appFragment(clientSideComponent))
        await settle()

        const asked = runAction.mock.calls.map((c: unknown[]) => c[0]).sort()
        expect(asked).toEqual(['/_booking', '/_workflow'])
    })

    it('puts a nested remote answer under its group, leaving the rest of the bar alone', async () => {
        const { element, clientSideComponent } = elementWith([
            { label: 'Admin', remote: false, submenus: [remote('/_workflow', 'Workflow')] },
            { label: 'Contenidos', remote: false, submenus: [{ label: 'Contents', route: '/contents' }] },
        ])
        runAction.mockImplementation((baseUrl: string) =>
            Promise.resolve(remoteAnswer(baseUrl, '', [{ label: 'Workflow', route: '', submenus: [
                { label: 'Processes', route: '/processes' },
            ] }])))

        element.completeMenu(appFragment(clientSideComponent))
        await settle()

        const menu = (clientSideComponent.metadata as any).menu
        expect(labels(menu)).toEqual(['Admin', 'Contenidos'])
        // The group now holds what the pod answered, not the placeholder the shell wrote.
        expect(labels(menu[0].submenus)).toEqual(['Workflow'])
        expect(labels(menu[0].submenus[0].submenus)).toEqual(['Processes'])
        // An ordinary group with no remote in it is untouched.
        expect(labels(menu[1].submenus)).toEqual(['Contents'])
    })

    it('asks each remote menu for its app once', async () => {
        const { element, clientSideComponent } = elementWith([
            remote('/_workflow', 'Workflow'), remote('/_booking', 'Booking'),
        ])
        runAction.mockImplementation((baseUrl: string) =>
            Promise.resolve(remoteAnswer(baseUrl, '', [{ label: 'Processes', route: '/processes' }])))

        element.completeMenu(appFragment(clientSideComponent))
        await settle()

        expect(runAction).toHaveBeenCalledTimes(2)
        // quietly: a remote that fails is its section's problem — no toast, no "no connection"
        expect(runAction.mock.calls[0][11]).toMatchObject({ quiet: true })
    })

    /**
     * The assertion this file exists for, and it is a negative one: nothing goes upstream. A
     * fragment published here reaches applyFragment as a ClientSide component, whose branch
     * replaces the host's children — the routed page included.
     */
    it('does not republish the app component, which would rebuild the routed page', async () => {
        const { element, clientSideComponent } = elementWith([remote('/_workflow', 'Workflow')])
        runAction.mockImplementation((baseUrl: string) =>
            Promise.resolve(remoteAnswer(baseUrl, '', [{ label: 'Processes', route: '/processes' }])))

        element.completeMenu(appFragment(clientSideComponent))
        await settle()

        expect(published).toHaveLength(0)
    })

    it('hands the renderer a new metadata object, so the menu actually repaints — in the app\'s own variant', async () => {
        const { element, clientSideComponent, app } = elementWith([remote('/_workflow', 'Workflow')])
        runAction.mockImplementation((baseUrl: string) =>
            Promise.resolve(remoteAnswer(baseUrl, '', [{ label: 'Processes', route: '/processes' }])))

        element.completeMenu(appFragment(clientSideComponent))
        await settle()

        // A new reference: mutating in place would leave the child element holding the same
        // object and Lit would repaint nothing.
        expect(clientSideComponent.metadata).not.toBe(app)
        expect(clientSideComponent.metadata.menu).toEqual([{ label: 'Processes', route: '/processes',
            baseUrl: '/_workflow', consumedRoute: '', serverSideType: 'Home', uriPrefix: '' }])
        // MENU_ON_TOP used to be forced here on any shell with remotes; the app said MENU_ON_LEFT.
        expect(clientSideComponent.metadata.variant).toBe(AppVariant.MENU_ON_LEFT)
        expect(element.requestUpdate).toHaveBeenCalled()
    })

    it('leaves the mounted children alone', async () => {
        const { element, clientSideComponent } = elementWith([remote('/_workflow', 'Workflow')])
        const mounted = [{ id: 'the-routed-page' }]
        clientSideComponent.children = mounted
        runAction.mockImplementation((baseUrl: string) =>
            Promise.resolve(remoteAnswer(baseUrl, '', [{ label: 'Processes', route: '/processes' }])))

        element.completeMenu(appFragment(clientSideComponent))
        await settle()

        expect(clientSideComponent.children).toBe(mounted)
    })

    it('does nothing at all when there is no remote menu to expand', async () => {
        const { element, clientSideComponent } = elementWith([{ label: 'Local', route: '/local' }])

        element.completeMenu(appFragment(clientSideComponent))
        await settle()

        expect(runAction).not.toHaveBeenCalled()
        expect(published).toHaveLength(0)
        expect(element.requestUpdate).not.toHaveBeenCalled()
    })

    it('keeps the same metadata when nothing is hidden and there is no remote', async () => {
        const { element, clientSideComponent, app } = elementWith([{ label: 'Local', route: '/local' }])

        element.completeMenu(appFragment(clientSideComponent))

        expect(clientSideComponent.metadata).toBe(app)
    })

    // ── one remote down is one section down ──────────────────────────────────────────────────

    it('merges the remotes that answered when one of them fails, and leaves its section unavailable', async () => {
        // Promise.all used to reject on the first failure and merge NOTHING: every section stayed a
        // label with nothing under it, the healthy ones included.
        const { element, clientSideComponent } = elementWith([
            remote('/_booking', 'Call center', { shellLabel: true }),
            remote('/_erp', 'ERP', { shellLabel: true }),
            remote('/_notices', 'Avisos', { shellLabel: true }),
        ])
        runAction.mockImplementation((baseUrl: string) => baseUrl === '/_erp'
            ? Promise.reject(new Error('503'))
            : Promise.resolve(remoteAnswer(baseUrl, '', [{ label: baseUrl, route: '', submenus: [
                { label: 'List', route: baseUrl.replace('/_', '/') + '/list' },
            ] }])))

        element.completeMenu(appFragment(clientSideComponent))
        await settle()

        const menu = (clientSideComponent.metadata as any).menu
        expect(labels(menu)).toEqual(['Call center', 'ERP', 'Avisos'])
        expect(labels(menu[0].submenus)).toEqual(['List'])
        expect(labels(menu[2].submenus)).toEqual(['List'])
        // the failed section is still there — a section that vanishes looks like it never existed —
        // but cannot be opened, and says why
        expect(menu[1]).toMatchObject({ remote: true, unavailable: true, disabled: true })
        expect(menu[1].description).toMatch(/ERP/)
    })

    it('asks a failed remote again in the background, and only that one', async () => {
        vi.useFakeTimers()
        const { element, clientSideComponent } = elementWith([
            remote('/_booking', 'Call center', { shellLabel: true }),
            remote('/_erp', 'ERP', { shellLabel: true }),
        ])
        let erpUp = false
        runAction.mockImplementation((baseUrl: string) => baseUrl === '/_erp' && !erpUp
            ? Promise.reject(new Error('503'))
            : Promise.resolve(remoteAnswer(baseUrl, '', [{ label: baseUrl, route: '', submenus: [
                { label: 'List', route: baseUrl.replace('/_', '/') + '/list' },
            ] }])))

        element.completeMenu(appFragment(clientSideComponent))
        await settle()
        expect((clientSideComponent.metadata as any).menu[1].unavailable).toBe(true)

        erpUp = true
        runAction.mockClear()
        await vi.advanceTimersByTimeAsync(ConnectedElement.remoteRetryDelays[0])
        await settle()

        expect(runAction.mock.calls.map((c: unknown[]) => c[0])).toEqual(['/_erp'])
        const menu = (clientSideComponent.metadata as any).menu
        expect(labels(menu)).toEqual(['Call center', 'ERP'])
        expect(menu[1].unavailable).toBeUndefined()
        expect(labels(menu[1].submenus)).toEqual(['List'])
        // the one that answered the first time is still merged
        expect(labels(menu[0].submenus)).toEqual(['List'])
    })

    it('asks a failed remote again at once when the user clicks its section', async () => {
        vi.useFakeTimers()
        const { element, clientSideComponent } = elementWith([remote('/_erp', 'ERP', { shellLabel: true })])
        let up = false
        runAction.mockImplementation((baseUrl: string) => !up
            ? Promise.reject(new Error('503'))
            : Promise.resolve(remoteAnswer(baseUrl, '', [{ label: 'ERP', route: '/erp', submenus: [{ label: 'List', route: '/erp/list' }] }])))

        element.completeMenu(appFragment(clientSideComponent))
        await settle()
        up = true
        runAction.mockClear()

        retryUnavailableMenus() // what a click on the unavailable section does
        await settle()

        expect(runAction).toHaveBeenCalledTimes(1)
        expect(labels((clientSideComponent.metadata as any).menu[0].submenus)).toEqual(['List'])
        // and the timer it replaced does not ask a second time
        await vi.advanceTimersByTimeAsync(ConnectedElement.remoteRetryDelays[0])
        expect(runAction).toHaveBeenCalledTimes(1)
    })

    // ── whose label ─────────────────────────────────────────────────────────────────────────

    it('keeps the label the shell declared over the one the remote answers with', async () => {
        // ec-demo1 repeats every section's label in the shell so the bar does not change a moment
        // after it is drawn: the remote's label used to replace the shell's.
        const { element, clientSideComponent } = elementWith([
            remote('/_booking', 'Call center', { shellLabel: true, icon: 'vaadin:phone' }),
        ])
        runAction.mockImplementation((baseUrl: string) =>
            Promise.resolve(remoteAnswer(baseUrl, '', [{ label: 'Booking', route: '/booking', submenus: [
                { label: 'Bookings', route: '/booking/bookings' },
            ] }])))

        element.completeMenu(appFragment(clientSideComponent))
        await settle()

        const menu = (clientSideComponent.metadata as any).menu
        expect(menu[0]).toMatchObject({ label: 'Call center', icon: 'vaadin:phone' })
        expect(labels(menu[0].submenus)).toEqual(['Bookings'])
    })

    it('takes the remote\'s label when the shell only had the field name', async () => {
        const { element, clientSideComponent } = elementWith([remote('/_booking', 'Booking', { shellLabel: false })])
        runAction.mockImplementation((baseUrl: string) =>
            Promise.resolve(remoteAnswer(baseUrl, '', [{ label: 'Reservas', route: '/booking', submenus: [
                { label: 'Bookings', route: '/booking/bookings' },
            ] }])))

        element.completeMenu(appFragment(clientSideComponent))
        await settle()

        expect(labels((clientSideComponent.metadata as any).menu)).toEqual(['Reservas'])
    })

    it('pastes several top-level entries as they come: there is no single one to name', async () => {
        const { element, clientSideComponent } = elementWith([remote('/_booking', 'Call center', { shellLabel: true })])
        runAction.mockImplementation((baseUrl: string) =>
            Promise.resolve(remoteAnswer(baseUrl, '', [
                { label: 'Bookings', route: '/bookings' }, { label: 'Quotes', route: '/quotes' },
            ])))

        element.completeMenu(appFragment(clientSideComponent))
        await settle()

        expect(labels((clientSideComponent.metadata as any).menu)).toEqual(['Bookings', 'Quotes'])
    })

    // ── the user's place, before anyone answers ─────────────────────────────────────────────

    it('knows the active section and the first breadcrumb before the remote answers', () => {
        const { element, clientSideComponent } = elementWith([
            { label: 'Inicio', route: '/inicio' },
            remote('/_booking', 'Call center', { shellLabel: true, path: '/booking', routePrefix: '/booking' }),
            { label: 'Admin', route: '/admin', submenus: [
                remote('/_forms', 'Forms', { shellLabel: true, path: '/admin/forms', routePrefix: '/forms' }),
            ] },
        ])
        runAction.mockImplementation(() => new Promise(() => {})) // nobody answers

        element.completeMenu(appFragment(clientSideComponent))

        const menu = (clientSideComponent.metadata as any).menu
        expect(activeTopIndex(menu, '/booking/bookings/QN29HB')).toBe(1)
        // grouped: the group's path is /admin/forms, the remote's screens live under /forms
        expect(activeTopIndex(menu, '/forms/tasks')).toBe(2)
        expect(autoTrail(menu, '/forms/tasks', { title: 'Tareas', lang: 'es' })).toEqual([
            { text: 'Admin' }, { text: 'Forms' }, { text: 'Tareas' },
        ])
    })

    it('learns a section\'s prefix from the deep link it was mounted for', () => {
        // The control console's `workflowAdmin` serves /workflow/...: nothing in the field says so,
        // but the server mounted /workflow/definitions from /_workflow-admin, and said so.
        ;(globalThis as any).window = { location: { pathname: '/workflow/definitions' } }
        const { element, clientSideComponent } = elementWith([
            remote('/_workflow-admin', 'Workflow', { shellLabel: true, path: '/workflowAdmin', routePrefix: '/workflowAdmin' }),
            remote('/remote', 'Remote', { shellLabel: true, path: '/remote', routePrefix: '/remote' }),
        ], { homeBaseUrl: '/_workflow-admin', homeRoute: '/workflow/definitions' })
        runAction.mockImplementation(() => new Promise(() => {}))

        element.completeMenu(appFragment(clientSideComponent))

        const menu = (clientSideComponent.metadata as any).menu
        expect(activeTopIndex(menu, '/workflow/definitions')).toBe(0)
        expect(autoTrail(menu, '/workflow/definitions', { title: 'Definitions' })).toEqual([
            { text: 'Workflow' }, { text: 'Definitions' },
        ])
    })

    it('leaves a prefix alone when it already covers the deep link (the remote stripped its own root)', () => {
        // A remote at @UI("/remote") is mounted at homeRoute "/page" — its route within itself.
        ;(globalThis as any).window = { location: { pathname: '/remote/page' } }
        const { element, clientSideComponent } = elementWith([
            remote('/remote', 'Remote', { shellLabel: true, path: '/remote', routePrefix: '/remote' }),
        ], { homeBaseUrl: '/remote', homeRoute: '/page' })
        runAction.mockImplementation(() => new Promise(() => {}))

        element.completeMenu(appFragment(clientSideComponent))

        const menu = (clientSideComponent.metadata as any).menu
        expect(menu[0].routePrefix).toBe('/remote')
        expect(autoTrail(menu, '/remote/page', { title: 'Remote Page' })).toEqual([
            { text: 'Remote' }, { text: 'Remote Page' },
        ])
    })

    // ── hidden sections ─────────────────────────────────────────────────────────────────────

    it('leaves a hidden remote out of the drawn menu, and does not ask it while the user is elsewhere', async () => {
        // `@Menu @Hidden RemoteMenu inbox`: reached from a header widget, it resolves its deep links
        // on the server and has no entry of its own.
        ;(globalThis as any).window = { location: { pathname: '/booking/bookings' } }
        const { element, clientSideComponent } = elementWith([
            remote('/_booking', 'Booking', { path: '/booking' }),
            { ...remote('/_inbox', 'Inbox', { path: '/inbox' }), visible: false },
            { label: 'Admin', remote: false, submenus: [{ ...remote('/_inbox2', 'Inbox', { path: '/inbox2' }), visible: false }] },
        ])
        runAction.mockImplementation((baseUrl: string) =>
            Promise.resolve(remoteAnswer(baseUrl, '', [{ label: 'Bookings', route: '/booking/bookings' }])))

        element.completeMenu(appFragment(clientSideComponent))
        // gone before anything renders — not only once the remotes have answered
        expect(labels((clientSideComponent.metadata as any).menu)).toEqual(['Booking', 'Admin'])
        expect((clientSideComponent.metadata as any).menu[1].submenus).toEqual([])
        await settle()

        expect(runAction.mock.calls.map((c: unknown[]) => c[0])).toEqual(['/_booking'])
        expect(labels((clientSideComponent.metadata as any).menu)).toEqual(['Bookings', 'Admin'])
        // still in the tree the breadcrumbs read
        expect(labels((clientSideComponent.metadata as any).navMenu)).toEqual(['Bookings', 'Inbox', 'Admin'])
    })

    it('asks a hidden remote when the user is in it, and its pages get their breadcrumbs', async () => {
        ;(globalThis as any).window = { location: { pathname: '/inbox/tasks/42' } }
        const { element, clientSideComponent } = elementWith([
            remote('/_booking', 'Booking', { path: '/booking' }),
            { ...remote('/_inbox', 'Inbox', { path: '/inbox', routePrefix: '/inbox' }), visible: false },
        ])
        runAction.mockImplementation((baseUrl: string) => Promise.resolve(baseUrl === '/_inbox'
            ? remoteAnswer(baseUrl, '', [{ label: 'Bandeja', route: '/inbox', submenus: [{ label: 'Tareas', route: '/inbox/tasks' }] }])
            : remoteAnswer(baseUrl, '', [{ label: 'Bookings', route: '/booking/bookings' }])))

        element.completeMenu(appFragment(clientSideComponent))
        // before it answers: the section
        expect(autoTrail((clientSideComponent.metadata as any).navMenu, '/inbox/tasks/42', { title: 'Tarea 42' }))
            .toEqual([{ text: 'Inbox' }, { text: 'Tarea 42' }])
        await settle()

        expect(runAction.mock.calls.map((c: unknown[]) => c[0]).sort()).toEqual(['/_booking', '/_inbox'])
        const metadata = clientSideComponent.metadata as any
        expect(labels(metadata.menu)).toEqual(['Bookings'])
        expect(autoTrail(metadata.navMenu, '/inbox/tasks/42', { title: 'Tarea 42' })).toEqual([
            { text: 'Bandeja' }, { text: 'Tareas', route: '/inbox/tasks' }, { text: 'Tarea 42' },
        ])
    })
})
