// @vitest-environment jsdom
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * mateu-app as the user drives it: a menu click in each shell variant asks the router for the
 * route (`route-changed`), unsaved changes can stop it, a remote section that did not answer is
 * asked again, ⌘K finds and opens menu entries / app shortcuts / global-search hits, the shell's
 * flows and actions run owner first, header actions, FABs and the chat toggle do what they say.
 */

const mocks = vi.hoisted(() => ({
    dispatchAppHeaderAction: vi.fn((..._args: unknown[]) => Promise.resolve()),
    searchGlobally: vi.fn((..._args: unknown[]) => Promise.resolve([] as unknown[])),
    navigateToRoute: vi.fn(),
    fetchExternalJson: vi.fn((..._args: unknown[]) => Promise.resolve({} as unknown)),
    runAppShortcut: vi.fn(),
}))
vi.mock('@infra/ui/renderers/appHeaderActions.ts', async (orig) => ({
    ...(await orig<typeof import('./renderers/appHeaderActions')>()),
    dispatchAppHeaderAction: mocks.dispatchAppHeaderAction,
}))
vi.mock('@infra/ui/appSources.ts', async (orig) => ({
    ...(await orig<typeof import('./appSources')>()),
    searchGlobally: mocks.searchGlobally,
}))
vi.mock('@infra/ui/rowRoute.ts', async (orig) => ({
    ...(await orig<typeof import('./rowRoute')>()),
    navigateToRoute: mocks.navigateToRoute,
}))
vi.mock('../http/externalOptions.ts', async (orig) => ({
    ...(await orig<typeof import('../http/externalOptions')>()),
    fetchExternalJson: mocks.fetchExternalJson,
}))
vi.mock('@infra/ui/appExtrasMount.ts', async (orig) => ({
    ...(await orig<typeof import('./appExtrasMount')>()),
    runAppShortcut: mocks.runAppShortcut,
}))

import './mateu-app'
import type { MateuApp } from './mateu-app'
import { componentRenderer, ComponentRenderer } from './renderers/ComponentRenderer'
import { BasicComponentRenderer } from './renderers/BasicComponentRenderer'
import { AppVariant } from '@mateu/shared/apiClients/dtos/componentmetadata/AppVariant'
import { ComponentMetadataType } from '@mateu/shared/apiClients/dtos/ComponentMetadataType'
import { RuleAction } from '@mateu/shared/apiClients/dtos/componentmetadata/RuleAction'
import { dirtyGuard } from './dirtyGuard'
import { registerRemoteMenuRetry } from './remoteMenuRetry'
import { setNotifier } from '@application/Notifier'
import { appData } from '@domain/state'

class TestRenderer extends BasicComponentRenderer {}

beforeAll(() => componentRenderer.set(new TestRenderer() as unknown as ComponentRenderer))
afterAll(() => componentRenderer.set({} as ComponentRenderer))

const menu = [
    { label: 'Orders', path: '/orders', route: '/orders', destination: { route: '/orders' } },
    { label: 'Customers', path: '/customers', route: '/customers', destination: { route: '/customers' } },
    {
        label: 'Admin', submenus: [
            { label: 'Users', route: '/admin/users' },
            { label: 'Roles', route: '/admin/roles', description: 'Who may do what' },
        ],
    },
]

const app = (over: Record<string, unknown> = {}) => ({
    id: 'app', type: 'ClientSide', children: [],
    metadata: {
        type: ComponentMetadataType.App,
        title: 'Back office',
        variant: AppVariant.MENU_ON_TOP,
        route: '',
        homeRoute: '/orders',
        serverSideType: 'com.example.BackOffice',
        menu,
        ...over,
    },
})

const mount = async (component: unknown) => {
    const el = document.createElement('mateu-app') as MateuApp
    el.component = component as never
    el.baseUrl = ''
    el.state = {}
    el.data = {}
    document.body.appendChild(el)
    await el.updateComplete
    return el
}

const root = (el: MateuApp) => el.shadowRoot!
const $ = <T extends Element = HTMLElement>(el: MateuApp, sel: string) => root(el).querySelector(sel) as T
const $$ = <T extends Element = HTMLElement>(el: MateuApp, sel: string) => Array.from(root(el).querySelectorAll(sel)) as T[]
const byText = (el: MateuApp, sel: string, text: string) =>
    $$(el, sel).find((n) => n.textContent?.trim().includes(text)) as HTMLElement

let routes: string[]
let navigations: string[]
const onRoute = (e: Event) => routes.push((e as CustomEvent).detail.route)
const onNavigate = (e: Event) => navigations.push((e as CustomEvent).detail.route)

beforeEach(() => {
    routes = []
    navigations = []
    document.addEventListener('route-changed', onRoute)
    document.addEventListener('navigate-to-requested', onNavigate)
})

afterEach(() => {
    document.removeEventListener('route-changed', onRoute)
    document.removeEventListener('navigate-to-requested', onNavigate)
    document.body.innerHTML = ''
    document.head.querySelectorAll("link[rel~='icon']").forEach((l) => l.remove())
    document.documentElement.removeAttribute('theme')
    dirtyGuard.markClean()
    appData.value = {}
    setNotifier({ show: () => {} })
    vi.clearAllMocks()
    vi.restoreAllMocks()
    vi.useRealTimers()
    window.history.replaceState({}, '', '/')
})

describe('menu navigation', () => {
    it('MENU_ON_TOP: clicking an entry asks the router for its route', async () => {
        const el = await mount(app())
        byText(el, '.menu-band .mateu-nav-item', 'Customers').click()
        expect(routes).toEqual(['/customers'])
        expect(el.selectedRoute).toBe('/customers')
        // the entry on screen is marked
        await el.updateComplete
        expect(byText(el, '.menu-band .mateu-nav-item', 'Customers').classList).toContain('mateu-nav-item--active')
    })

    it('a group opens as a dropdown whose entries navigate', async () => {
        const el = await mount(app())
        const group = $$(el, '.menu-band details.mateu-nav-group')[0]
        expect(group.querySelector('summary')!.textContent).toContain('Admin')
        byText(el, '.menu-band .mateu-nav-panel .mateu-nav-item', 'Roles').click()
        expect(routes).toEqual(['/admin/roles'])
    })

    it('unsaved changes the user keeps stop the navigation', async () => {
        const el = await mount(app())
        dirtyGuard.markDirty()
        vi.spyOn(window, 'confirm').mockReturnValue(false)
        byText(el, '.menu-band .mateu-nav-item', 'Customers').click()
        expect(routes).toEqual([])
        expect(el.selectedRoute).toBe('/orders')
    })

    it('a query is part of the destination: same path, other filters is another place', async () => {
        window.history.replaceState({}, '', '/bookings?status=Open')
        const el = await mount(app())
        el.selectRoute(undefined, '/bookings?status=Cancelled', undefined, undefined, undefined, undefined)
        expect(routes).toEqual(['/bookings?status=Cancelled'])
        // and the very same place is no navigation at all
        window.history.replaceState({}, '', '/bookings?status=Cancelled')
        el.selectRoute(undefined, '/bookings?status=Cancelled', undefined, undefined, undefined, undefined)
        expect(routes).toHaveLength(1)
    })

    it('a remote entry is composed under its uri prefix and its consumed route', async () => {
        const el = await mount(app())
        el.selectRoute('/remote', '/remote/things', undefined, undefined, 'com.example.Remote', '/crm/')
        el.selectRoute(undefined, 'deals', undefined, undefined, undefined, 'crm')
        el.selectRoute(undefined, '/x', undefined, undefined, undefined, '/crm')
        el.selectRoute(undefined, '/_page', undefined, undefined, undefined, undefined)
        expect(routes).toEqual(['/crm/things', 'crm/deals', '/crm/x', ''])
        expect(el.selectedServerSideType).toBeUndefined()
    })

    it('a mateu-ux asking for another route through navigation-requested is routed by the shell', async () => {
        const el = await mount(app())
        const ux = $(el, 'mateu-ux')
        ux.dispatchEvent(new CustomEvent('navigation-requested', { detail: { route: '/customers' }, bubbles: true, composed: true, cancelable: true }))
        expect(routes).toEqual(['/customers'])
    })

    it('a remote section whose remote did not answer is asked again instead of opened', async () => {
        const retry = vi.fn()
        registerRemoteMenuRetry(retry)
        const el = await mount(app({ menu: [...menu, { label: 'CRM', route: '/crm', unavailable: true, description: 'CRM is not answering' }] }))
        const crm = byText(el, '.menu-band .mateu-nav-item', 'CRM')
        expect(crm.classList).toContain('mateu-nav-unavailable')
        expect(crm.title).toBe('CRM is not answering')
        crm.click()
        expect(retry).toHaveBeenCalledTimes(1)
        expect(routes).toEqual([])
    })

    it('a rule leaf runs its action on the app rail instead of navigating', async () => {
        const el = await mount(app({ menu: [{ label: 'Refresh', rules: [{ action: RuleAction.RunAction, actionId: 'refresh' }] }] }))
        byText(el, '.menu-band .mateu-nav-item', 'Refresh').click()
        expect(routes).toEqual([])
        expect(mocks.dispatchAppHeaderAction).toHaveBeenCalledWith(expect.objectContaining({ serverSideType: 'com.example.BackOffice' }), el, 'refresh')
    })

    it('TABS: a tab per entry, the active one by the current route, a click navigates', async () => {
        const el = await mount(app({ variant: AppVariant.TABS, menu: menu.slice(0, 2) }))
        const tabs = $$(el, '.mateu-tab')
        expect(tabs.map((t) => t.getAttribute('aria-selected'))).toEqual(['true', 'false'])
        tabs[1].click()
        await el.updateComplete
        expect(routes).toEqual(['/customers'])
        expect($$(el, '.mateu-tab').map((t) => t.getAttribute('aria-selected'))).toEqual(['false', 'true'])
    })

    it('TABS with a back link goes up to its parent, through the dirty guard', async () => {
        const el = await mount(app({ variant: AppVariant.TABS, backRoute: '/orders', backLabel: 'Orders' }))
        const back = $<HTMLAnchorElement>(el, 'a.mateu-back-link')
        expect(back.textContent).toContain('Orders')
        back.click()
        expect(mocks.navigateToRoute).toHaveBeenCalledWith(el, '/orders')
    })

    it('MENU_ON_LEFT: groups are disclosures, leaves are buttons that navigate', async () => {
        const el = await mount(app({ variant: AppVariant.MENU_ON_LEFT }))
        expect($(el, 'details.left-menu-group summary').textContent).toBe('Admin')
        byText(el, '.left-menu-item', 'Users').click()
        expect(routes).toEqual(['/admin/users'])
    })

    it('HAMBURGER: the drawer lists the menu, a link navigates, a long menu can be searched', async () => {
        const el = await mount(app({ variant: AppVariant.HAMBURGER_MENU, totalMenuOptions: 12 }))
        byText(el, '.side-nav-link', 'Customers').click()
        expect(routes).toEqual(['/customers'])
        // the drawer toggle opens and closes the drawer
        const layout = $(el, '.m-app-layout')
        const open = layout.classList.contains('drawer-open')
        $(el, '.drawer-toggle').click()
        expect(layout.classList.contains('drawer-open')).toBe(!open)

        const search = $<HTMLInputElement>(el, '.drawer-search')
        search.value = 'rol'
        search.dispatchEvent(new Event('input'))
        await el.updateComplete
        const labels = $$(el, '.side-nav-link').map((l) => l.textContent?.trim())
        expect(labels).toContain('Roles')
        expect(labels).not.toContain('Customers')
    })

    it('TILES: a group opens its hub of tiles, a tile navigates and closes it', async () => {
        const el = await mount(app({ variant: AppVariant.TILES }))
        byText(el, '.mateu-nav-item', 'Admin').click()
        await el.updateComplete
        expect(el.tilesMenuOption?.label).toBe('Admin')
        const tile = byText(el, '.nav-tile', 'Roles')
        expect(tile.querySelector('.nav-tile-desc')!.textContent).toBe('Who may do what')
        tile.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
        await el.updateComplete
        expect(routes).toEqual(['/admin/roles'])
        expect(el.tilesMenuOption).toBeNull()
        // a leaf of the top bar navigates directly
        byText(el, '.mateu-nav-item', 'Orders').click()
        expect(routes).toEqual(['/admin/roles', '/orders'])
    })

    it('RAIL: a group opens its sub-panel, a sub-item navigates', async () => {
        const el = await mount(app({ variant: AppVariant.RAIL }))
        const admin = $$(el, '.rail-item')[2]
        expect(admin.getAttribute('aria-expanded')).toBe('false')
        admin.click()
        await el.updateComplete
        expect($(el, '.rail-sub-title').textContent).toBe('Admin')
        expect($$(el, '.rail-item')[2].getAttribute('aria-expanded')).toBe('true')
        byText(el, '.rail-sub-item', 'Users').click()
        expect(routes).toEqual(['/admin/users'])
        // clicking the open group again closes it
        $$(el, '.rail-item')[2].click()
        await el.updateComplete
        expect($(el, '.rail-sub-panel')).toBeNull()
    })
})

describe('HAMBURGER_SECTIONS', () => {
    const sectionsMenu = [
        { label: 'Front desk', route: '/front', submenus: [{ label: 'Arrivals', route: '/front/arrivals' }, { label: 'Departures', route: '/front/departures' }] },
        { label: 'Billing', route: '/billing', submenus: [{ label: 'Folios', route: '/billing/folios' }] },
        { label: 'CRM', route: '/crm', unavailable: true, description: 'down' },
    ]

    it('the hamburger opens the sections; choosing one goes to its home and closes the panel', async () => {
        const el = await mount(app({ variant: AppVariant.HAMBURGER_SECTIONS, menu: sectionsMenu, homeRoute: '' }))
        expect($(el, '.mateu-sections-panel')).toBeNull()
        $(el, '.mateu-sections-toggle').click()
        await el.updateComplete
        const links = $$(el, '.mateu-section-link')
        expect(links.map((l) => l.textContent?.trim())).toEqual(['Front desk', 'Billing', 'CRM'])
        links[1].click()
        await el.updateComplete
        expect(routes).toEqual(['/billing/folios'])
        expect(el.sectionsOpen).toBe(false)
    })

    it('band 2 shows the section on screen and its entries', async () => {
        window.history.replaceState({}, '', '/front/arrivals')
        const el = await mount(app({ variant: AppVariant.HAMBURGER_SECTIONS, menu: sectionsMenu, homeRoute: '/front/arrivals' }))
        expect($(el, '.mateu-section-title').textContent).toBe('Front desk')
        byText(el, '.sections-band .mateu-nav-item', 'Departures').click()
        expect(routes).toEqual(['/front/departures'])
        // the section's name goes back to its home (here: where the address bar already is)
        $(el, '.mateu-section-title').click()
        expect(el.selectedRoute).toBe('/front/arrivals')
    })

    it('Escape, the scrim, or an unavailable section (asked again) close or keep it as they should', async () => {
        const retry = vi.fn()
        registerRemoteMenuRetry(retry)
        const el = await mount(app({ variant: AppVariant.HAMBURGER_SECTIONS, menu: sectionsMenu, homeRoute: '' }))
        el.sectionsOpen = true
        await el.updateComplete
        byText(el, '.mateu-section-link', 'CRM').click()
        expect(retry).toHaveBeenCalledTimes(1)
        expect(el.sectionsOpen).toBe(true)

        $(el, '.mateu-sections-scrim').click()
        expect(el.sectionsOpen).toBe(false)

        el.sectionsOpen = true
        await el.updateComplete
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
        expect(el.sectionsOpen).toBe(false)
    })
})

describe('the ⌘K palette', () => {
    const open = async (el: MateuApp) => {
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))
        await el.updateComplete
        return $<HTMLInputElement>(el, '.cmd-input')
    }
    const type = async (el: MateuApp, input: HTMLInputElement, text: string) => {
        input.value = text
        input.dispatchEvent(new Event('input'))
        await el.updateComplete
    }
    const key = (input: HTMLInputElement, k: string) =>
        input.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }))

    it('lists every leaf with its breadcrumb, filters as the user types, Enter opens the selected one', async () => {
        const el = await mount(app())
        const input = await open(el)
        expect($$(el, '.cmd-result-label').map((n) => n.textContent)).toEqual(['Orders', 'Customers', 'Users', 'Roles'])
        expect(byText(el, '.cmd-result', 'Roles').querySelector('.cmd-result-breadcrumb')!.textContent).toBe('Admin')

        await type(el, input, 'admin')
        expect($$(el, '.cmd-result-label').map((n) => n.textContent)).toEqual(['Users', 'Roles'])
        key(input, 'ArrowDown')
        key(input, 'ArrowDown') // clamped at the last one
        await el.updateComplete
        expect($(el, '.cmd-result--selected').textContent).toContain('Roles')
        key(input, 'ArrowUp')
        await el.updateComplete
        expect($(el, '.cmd-result--selected').textContent).toContain('Users')
        key(input, 'Enter')
        await el.updateComplete
        expect(routes).toEqual(['/admin/users'])
        expect(el.commandPaletteOpen).toBe(false)
    })

    it('says so when nothing matches; a click on a result opens it; the backdrop and Escape close it', async () => {
        const el = await mount(app())
        let input = await open(el)
        await type(el, input, 'zzz')
        expect($(el, '.cmd-empty').textContent).toContain('zzz')
        $(el, '.cmd-backdrop').click()
        await el.updateComplete
        expect($(el, '.cmd-palette')).toBeNull()

        input = await open(el)
        byText(el, '.cmd-result', 'Customers').click()
        expect(routes).toEqual(['/customers'])

        await open(el)
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
        await el.updateComplete
        expect($(el, '.cmd-palette')).toBeNull()
    })

    it('lists the matching app shortcuts first (quick launch) and runs one on Enter', async () => {
        const shortcuts = [{ key: 'f9', label: 'Reservations', route: '/reservations', code: 'RES' }]
        const el = await mount(app({ shortcuts }))
        const input = await open(el)
        await type(el, input, 'res')
        const first = $$(el, '.cmd-result')[0]
        expect(first.querySelector('.cmd-result-label')!.textContent).toBe('Reservations')
        expect(first.querySelector('.cmd-result-breadcrumb')!.textContent).toBe('RES · F9')
        key(input, 'Enter')
        expect(mocks.runAppShortcut).toHaveBeenCalledWith(shortcuts[0], el)
        expect(el.commandPaletteOpen).toBe(false)
    })

    it('shows the global-search hits by category, and opening one navigates there', async () => {
        vi.useFakeTimers()
        mocks.searchGlobally.mockResolvedValue([
            { label: 'ACME Corp', description: 'Customer 42', route: '/customers/42', category: 'Customers' },
            { label: 'ACME Ltd', route: '/customers/43', category: 'Customers' },
            { label: 'INV-7', route: '/invoices/7', category: 'Invoices' },
        ])
        const el = await mount(app({ globalSearchEnabled: true }))
        const input = await open(el)
        await type(el, input, 'acme')
        await vi.advanceTimersByTimeAsync(300)
        await el.updateComplete
        expect(mocks.searchGlobally).toHaveBeenCalledWith(expect.anything(), '', 'acme', el, 'cmd-palette')
        expect($$(el, '.cmd-category').map((n) => n.textContent)).toEqual(['Customers', 'Invoices'])
        expect(byText(el, '.cmd-result', 'ACME Corp').textContent).toContain('Customer 42')

        // the hits come after the (no) menu results: ArrowDown twice + Enter opens the second hit
        key(input, 'ArrowDown')
        key(input, 'Enter')
        await el.updateComplete
        expect(routes).toEqual(['/customers/43'])
        expect(navigations).toEqual(['/customers/43'])

        // a click on a hit opens it too; clearing the query drops the hits
        const again = await open(el)
        await type(el, again, 'inv')
        await vi.advanceTimersByTimeAsync(300)
        await el.updateComplete
        byText(el, '.cmd-result', 'INV-7').click()
        expect(navigations).toEqual(['/customers/43', '/invoices/7'])
        const third = await open(el)
        await type(el, third, '')
        expect(el.commandPaletteDataHits).toEqual([])
    })

    it('stands down when the command center owns ⌘K', async () => {
        const el = await mount(app({ commandCenterEnabled: true }))
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))
        await el.updateComplete
        expect(el.commandPaletteOpen).toBe(false)
        expect($(el, '.cmd-palette')).toBeNull()
    })
})

describe('shell flows and actions', () => {
    it('a menu rule naming a shell flow runs it in the browser: its NavigateTo moves the shell (mount-relative)', async () => {
        const el = await mount(app({
            rootRoute: '/bo',
            actions: [{ id: 'goCustomers', commands: [{ type: 'NavigateTo', data: '/customers' }] }],
        }))
        el.runMenuRules([{ action: RuleAction.RunAction, actionId: 'goCustomers' }] as never)
        expect(routes).toEqual(['/customers'])
        expect(el.selectedRoute).toBe('/bo/customers')
        expect(mocks.dispatchAppHeaderAction).not.toHaveBeenCalled()
    })

    it('a flow step running an app action goes on the app rail; an action-catalogue entry goes to the screen', async () => {
        const el = await mount(app({
            actions: [{ id: 'both', commands: [{ type: 'RunAction', data: { actionId: 'serverSide' } }] }],
            actionCatalogue: [{ id: 'fromCatalogue', restAction: { source: { url: '/x' } } }],
        }))
        el.runShellAction('both')
        expect(mocks.dispatchAppHeaderAction).toHaveBeenCalledWith(expect.anything(), el, 'serverSide')

        const requested: unknown[] = []
        el.addEventListener('action-requested', (e) => requested.push((e as CustomEvent).detail))
        el.runShellAction('fromCatalogue')
        expect(requested).toEqual([{ actionId: 'fromCatalogue' }])
    })

    it('a failing app action is told to the user', async () => {
        const shown: unknown[] = []
        setNotifier({ show: (m) => shown.push(m) })
        mocks.dispatchAppHeaderAction.mockRejectedValueOnce(new Error('boom'))
        const el = await mount(app())
        el.runAppAction('explode')
        await vi.waitFor(() => expect(JSON.stringify(shown)).toContain('boom'))
    })

    it('a FAB dispatches its action from the shell', async () => {
        const el = await mount(app({ fabs: [{ actionId: 'newOrder', label: 'New order', icon: 'vaadin:plus' }] }))
        const requested: unknown[] = []
        el.addEventListener('action-requested', (e) => requested.push((e as CustomEvent).detail))
        $<HTMLButtonElement>(el, '.app-fab').click()
        expect(requested).toEqual([{ actionId: 'newOrder' }])
    })
})

describe('the header', () => {
    it('header actions: a route navigates, an action runs on the app rail, a dropdown holds children', async () => {
        const el = await mount(app({
            contextActions: [
                { label: 'Reports', route: '/reports' },
                { label: 'Close day', actionId: 'closeDay' },
                { label: 'More', children: [{ label: 'Sync', actionId: 'sync' }] },
            ],
        }))
        byText(el, '.app-header-action-btn', 'Reports').click()
        expect(mocks.navigateToRoute).toHaveBeenCalledWith(el, '/reports')
        byText(el, '.app-header-action-btn', 'Close day').click()
        expect(mocks.dispatchAppHeaderAction).toHaveBeenCalledWith(expect.anything(), el, 'closeDay')
        byText(el, 'details.mateu-nav-group .mateu-nav-item', 'Sync').click()
        expect(mocks.dispatchAppHeaderAction).toHaveBeenCalledWith(expect.anything(), el, 'sync')
    })

    it('a header action that fails is told to the user', async () => {
        const shown: unknown[] = []
        setNotifier({ show: (m) => shown.push(m) })
        mocks.dispatchAppHeaderAction.mockRejectedValueOnce(new Error('nope'))
        const el = await mount(app({ contextActions: [{ label: 'Close day', actionId: 'closeDay' }] }))
        byText(el, '.app-header-action-btn', 'Close day').click()
        await vi.waitFor(() => expect(JSON.stringify(shown)).toContain('nope'))
    })

    it('a header action naming a shell flow runs it in the browser', async () => {
        const el = await mount(app({
            contextActions: [{ label: 'Customers', actionId: 'goCustomers' }],
            actions: [{ id: 'goCustomers', commands: [{ type: 'NavigateTo', data: 'customers' }] }],
        }))
        byText(el, '.app-header-action-btn', 'Customers').click()
        expect(routes).toEqual(['/customers'])
        expect(mocks.dispatchAppHeaderAction).not.toHaveBeenCalled()
    })

    it('live UI push: the header offers "Connect AI" and a pushed navigation is a menu click', async () => {
        const encoder = new TextEncoder()
        const pushed = 'data: ' + JSON.stringify({ commands: [{ type: 'AgentPush', data: {
            kind: 'navigate', event: 'navigation-requested', detail: { route: '/customers', consumedRoute: '' },
        } }] }) + '\n\n'
        const fetchMock = vi.fn((_url: string, _init: RequestInit) => Promise.resolve(new Response(new ReadableStream<Uint8Array>({
            start(c) { c.enqueue(encoder.encode(pushed)) },
        }), { status: 200 })))
        vi.stubGlobal('fetch', fetchMock)
        try {
            const el = await mount(app({ agentPush: true }))
            expect($(el, 'mateu-agent-connect')).toBeTruthy()
            await vi.waitFor(() => expect(routes).toEqual(['/customers']))
            expect(el.selectedRoute).toBe('/customers')
            expect(JSON.parse(fetchMock.mock.calls[0][1].body as string).actionId).toBe('_agent-channel')
            el.component = app() as never
            await el.updateComplete
            expect($(el, 'mateu-agent-connect')).toBeNull()
        } finally {
            vi.unstubAllGlobals()
        }
    })

    it('the chat toggle opens and closes the assistant, and the command center\'s "Ask AI" opens it', async () => {
        const el = await mount(app({ sseUrl: '/chat' }))
        const toggle = $(el, '.mateu-chat-toggle')
        expect(toggle.getAttribute('aria-pressed')).toBe('false')
        toggle.click()
        await el.updateComplete
        expect(el.chatOpen).toBe(true)
        expect($(el, 'mateu-chat').getAttribute('slot')).toBe('detail')
        expect($(el, '.mateu-chat-toggle').getAttribute('aria-pressed')).toBe('true')
        $(el, '.mateu-chat-toggle').click()
        await el.updateComplete
        expect(el.chatOpen).toBe(false)
        el.dispatchEvent(new CustomEvent('mateu-open-ai'))
        await el.updateComplete
        expect(el.chatOpen).toBe(true)
    })

    it('the theme toggle in the header flips the theme', async () => {
        const el = await mount(app({ themeToggle: true }))
        el.isDark = false
        await el.updateComplete
        const toggle = $(el, '.mateu-theme-toggle')
        expect(toggle.getAttribute('aria-label')).toMatch(/dark/i)
        toggle.click()
        await el.updateComplete
        expect(document.documentElement.getAttribute('theme')).toBe('dark')
        expect($(el, '.mateu-theme-toggle').getAttribute('aria-label')).toMatch(/light/i)
    })

    it('a compact page takes the content padding away', async () => {
        const el = await mount(app({ variant: AppVariant.TABS }))
        expect($(el, '[role="main"]').classList).not.toContain('no-padding')
        $(el, 'mateu-ux').dispatchEvent(new CustomEvent('compact-changed', { detail: { compact: true }, bubbles: true, composed: true }))
        await el.updateComplete
        expect($(el, '[role="main"]').classList).toContain('no-padding')
    })

    it('chromeless: no header, no menu — only the content', async () => {
        const el = await mount(app({ chromeless: true }))
        expect($(el, '.app.chromeless [role="main"] mateu-ux')).not.toBeNull()
        expect($(el, '.mateu-nav-item')).toBeNull()
    })
})

describe('what the shell publishes on boot', () => {
    it('the brand accent and the favicon', async () => {
        const el = await mount(app({ accentColor: '#c74634', favicon: '/favicon.png' }))
        expect(el.style.getPropertyValue('--mateu-accent')).toBe('#c74634')
        expect((document.querySelector("link[rel~='icon']") as HTMLLinkElement).href).toContain('/favicon.png')
        // an accent that would break out of the declaration is ignored, and the old one removed
        el.component = app({ accentColor: 'red; background: url(x)' }) as never
        await el.updateComplete
        expect(el.style.getPropertyValue('--mateu-accent')).toBe('')
    })

    it('an accent draws no colour strip, not even with a strip image (Redwood drops the strip for a custom brand)', async () => {
        const el = await mount(app({ accentColor: 'teal', accentStrip: '/img/strip.svg', generatedAccentStrip: 'data:image/svg+xml;base64,PHN2Zy8+' }))
        expect(el.style.getPropertyValue('--mateu-accent')).toBe('teal')
        expect(el.style.getPropertyValue('--mateu-page-band-h')).toBe('')
        expect(el.style.getPropertyValue('--mateu-page-band-image')).toBe('')
    })

    it('the app-scope data source is fetched once into the app data, and the screens are told', async () => {
        mocks.fetchExternalJson.mockResolvedValue({ hotels: ['H1'] })
        const updated = vi.fn()
        document.addEventListener('app-data-updated', updated)
        const el = await mount(app({ appDataSource: { ref: 'hotels' } }))
        await new Promise((r) => setTimeout(r, 0))
        expect(appData.value).toMatchObject({ hotels: ['H1'] })
        expect(updated).toHaveBeenCalledTimes(1)
        el.requestUpdate()
        await el.updateComplete
        expect(mocks.fetchExternalJson).toHaveBeenCalledTimes(1)
        document.removeEventListener('app-data-updated', updated)
    })

    it('the home of a new app shell is the selected route', async () => {
        const el = await mount(app({ homeRoute: '/customers', homeServerSideType: 'com.example.Customers', homeUriPrefix: '/c' }))
        expect(el.selectedRoute).toBe('/customers')
        expect(el.selectedServerSideType).toBe('com.example.Customers')
        expect(el.selectedUriPrefix).toBe('/c')
        expect($(el, 'mateu-ux').getAttribute('route')).toBe('/customers')
    })
})
