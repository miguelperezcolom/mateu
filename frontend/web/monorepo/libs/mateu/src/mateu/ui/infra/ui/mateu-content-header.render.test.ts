// @vitest-environment jsdom
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

const navigated: string[] = []
vi.mock('@infra/ui/safeNavigate.ts', async (importOriginal) => {
    const original = await importOriginal<Record<string, unknown>>()
    return { ...original, safeNavigate: (url: string) => { navigated.push(url); return true } }
})

import './mateu-content-header'
import type { MateuContentHeader } from './mateu-content-header'
import { buttonTheme, neutralButtonClass } from './mateu-content-header'
import { componentRenderer, ComponentRenderer } from './renderers/ComponentRenderer'
import { BasicComponentRenderer } from './renderers/BasicComponentRenderer'
import { ComponentMetadataType } from '@mateu/shared/apiClients/dtos/ComponentMetadataType'
import { publishShellMenu } from './breadcrumbTrail'

/**
 * The page header as a user meets it: overline, title (or its placeholder), subtitle, timestamp,
 * KPI facts, badges, breadcrumbs, peer navigation and the toolbar — what shows and what a click does.
 */
class TestRenderer extends BasicComponentRenderer {}
beforeAll(() => componentRenderer.set(new TestRenderer() as unknown as ComponentRenderer))
afterAll(() => componentRenderer.set({} as ComponentRenderer))

type Captured = { type: string, detail: any }

const mount = async (metadata: Record<string, unknown>, extra: Record<string, unknown> = {}, parent: HTMLElement = document.body) => {
    const el = document.createElement('mateu-content-header') as MateuContentHeader & Record<string, any>
    el.metadata = { type: ComponentMetadataType.Form, ...metadata } as never
    el.state = {}
    el.data = {}
    Object.assign(el, extra)
    const events: Captured[] = []
    for (const type of ['action-requested', 'route-changed', 'navigate-to-requested']) {
        el.addEventListener(type, (e) => events.push({ type, detail: (e as CustomEvent).detail }))
    }
    parent.appendChild(el)
    await el.updateComplete
    await el.updateComplete
    const actions = () => events.filter(e => e.type === 'action-requested').map(e => e.detail)
    return { el, events, actions, root: el.shadowRoot as ShadowRoot }
}

afterEach(() => {
    document.body.innerHTML = ''
    navigated.length = 0
})

describe('the header text', () => {
    it('overline, title, subtitle and timestamp, interpolated against the state', async () => {
        const { root } = await mount({
            overline: 'Requisitions', title: 'Order ${state.no}', subtitle: 'for ${state.who}', timestamp: 'Last updated today',
        }, { state: { no: '42', who: 'Ana' } })
        expect(root.querySelector('.page-overline')?.textContent).toBe('Requisitions')
        expect(root.querySelector('h2')?.textContent).toBe('Order 42')
        expect(root.textContent).toContain('for Ana')
        expect(root.querySelector('.page-timestamp')?.textContent).toBe('Last updated today')
    })

    it('without a title the placeholder shows, dimmed, inside the heading', async () => {
        const { root } = await mount({ titlePlaceholder: 'New booking…' })
        expect(root.querySelector('h2 .page-title-placeholder')?.textContent).toBe('New booking…')
    })

    it('a placeholder is not shown once a title exists', async () => {
        const { root } = await mount({ title: 'Booking 7', titlePlaceholder: 'New booking…' })
        expect(root.querySelector('.page-title-placeholder')).toBeNull()
    })

    it('a nested header uses a smaller heading per level and is marked nested', async () => {
        for (const [level, tag] of [[1, 'h3'], [2, 'h4'], [3, 'h5'], [4, 'h6']] as const) {
            const { el, root } = await mount({ title: 'Inner', level })
            expect(root.querySelector(tag)?.textContent).toBe('Inner')
            expect(root.querySelector('h2')).toBeNull()
            expect(el.hasAttribute('data-nested')).toBe(true)
            document.body.innerHTML = ''
        }
    })

    it('nothing to say, nothing rendered', async () => {
        const { root } = await mount({})
        expect(root.querySelector('.form-header')).toBeNull()
    })
})

describe('facts and badges', () => {
    it('KPIs read as label/value facts beside the title; one with an action gets its button', async () => {
        const { root, actions } = await mount({
            title: 'Booking',
            kpis: [{ title: 'Nights', text: '${state.n}' }, { title: 'Balance', text: '120 €', actionId: 'pay' }],
        }, { state: { n: 3 } })
        const facts = Array.from(root.querySelectorAll('.header-fact'))
        expect(facts.map(f => f.querySelector('.header-fact-label')?.textContent)).toEqual(['Nights', 'Balance'])
        expect(facts[0].querySelector('.header-fact-value')?.textContent).toBe('3')
        ;(facts[1].querySelector('.fact-action') as HTMLButtonElement).click()
        expect(actions().at(-1)?.actionId).toBe('pay')
    })

    it('with kpisBelow the facts sit in a row under the header and the badges beside the title', async () => {
        const { root } = await mount({
            title: 'Booking', kpisBelow: true,
            kpis: [{ title: 'Nights', text: '3' }],
            badges: [{ text: 'VIP', color: 'success' }],
        })
        expect(root.querySelector('.kpi-row .kpi-label')?.textContent).toBe('Nights')
        expect(root.querySelector('.header-fact')).toBeNull()
        expect(root.querySelector('h2')?.parentElement?.textContent).toContain('VIP')
    })

    it('badges show in their own strip under the header', async () => {
        const { root } = await mount({ title: 'Booking', badges: [{ text: 'Confirmed', color: 'SUCCESS' }, { text: '' }] })
        expect(root.textContent).toContain('Confirmed')
    })
})

describe('the toolbar', () => {
    it('back is a chevron before the title, cancel and actions are split by a divider', async () => {
        const { root, actions } = await mount({ title: 'Edit', toolbar: [
            { id: 'b', actionId: 'back', label: 'Back' },
            { id: 'c', actionId: 'cancel-edit', label: 'Cancel' },
            { id: 's', actionId: 'save', label: 'Save', buttonStyle: 'primary' },
        ] })
        const chevron = root.querySelector('.back-chevron') as HTMLButtonElement
        expect(chevron.getAttribute('aria-label')).toBe('Back')
        chevron.click()
        expect(actions().at(-1).actionId).toBe('back')
        expect(root.querySelector('.toolbar-divider')).not.toBeNull()
        ;(root.querySelector('[data-action-id="s"]') as HTMLButtonElement).click()
        expect(actions().at(-1).actionId).toBe('save')
        expect(root.querySelector('[data-action-id="s"]')!.className).toContain('primary')
    })

    it('a button hidden through data is not drawn', async () => {
        const { root } = await mount({ title: 'Edit', toolbar: [{ id: 'b', actionId: 'back', label: 'Back' }, { id: 's', actionId: 'save', label: 'Save' }] },
            { data: { 'save.hidden': true, 'back.hidden': true } })
        expect(root.querySelector('[data-action-id="s"]')).toBeNull()
        expect(root.querySelector('.back-chevron')).toBeNull()
    })

    it('a button with a route navigates on the client', async () => {
        const { root, events } = await mount({ title: 'X', toolbar: [{ id: 'n', actionId: 'new', label: 'New', route: '/orders/${state.id}' }] }, { state: { id: '9' } })
        ;(root.querySelector('[data-action-id="n"]') as HTMLButtonElement).click()
        expect(events.map(e => e.type)).toEqual(['route-changed', 'navigate-to-requested'])
        expect(events[0].detail.route).toBe('/orders/9')
    })

    it('a bulk action reads the selection of the listing beside it: disabled without one, carried with one', async () => {
        const host = document.createElement('div')
        document.body.appendChild(host)
        const crud = document.createElement('mateu-table-crud') as HTMLElement & { state?: unknown }
        crud.state = { crud_selected_items: [] }
        host.appendChild(crud)
        const { el, root, actions } = await mount({ title: 'Orders', toolbar: [{ id: 'd', actionId: 'delete', label: 'Delete', rowsSelectedRequired: true }] }, {}, host)
        const button = () => root.querySelector('[data-action-id="d"]') as HTMLButtonElement
        expect(button().disabled).toBe(true)
        crud.state = { crud_selected_items: [{ id: 1 }] }
        el.requestUpdate()
        await el.updateComplete
        expect(button().disabled).toBe(false)
        button().click()
        expect(actions().at(-1)).toMatchObject({ actionId: 'delete', parameters: { crud_selected_items: [{ id: 1 }] } })
    })

    it('noHeader: the actions still render on a row of their own, back as an ordinary button', async () => {
        const { root, actions } = await mount({ noHeader: true, toolbar: [
            { id: 'b', actionId: 'back', label: 'Back' }, { id: 's', actionId: 'save', label: 'Save' },
        ] })
        expect(root.querySelector('.no-header-row')).not.toBeNull()
        expect(root.querySelector('.back-chevron')).toBeNull()
        ;(root.querySelector('[data-action-id="b"]') as HTMLButtonElement).click()
        expect(actions().at(-1).actionId).toBe('back')
    })

    it('the overflow menu lists the secondaries that did not fit and runs them', async () => {
        const { el, root, actions } = await mount({ title: 'X', toolbar: [
            { id: 'a', actionId: 'a', label: 'Alpha' }, { id: 'b', actionId: 'b', label: 'Beta' },
        ] })
        ;(el as any)._overflowN = 1
        await el.updateComplete
        const more = root.querySelector('.overflow-btn') as HTMLButtonElement
        expect(more.getAttribute('aria-expanded')).toBe('false')
        more.click()
        await el.updateComplete
        const items = Array.from(root.querySelectorAll('.overflow-item')) as HTMLButtonElement[]
        expect(items.map(i => i.textContent)).toEqual(['Beta'])
        items[0].click()
        expect(actions().at(-1).actionId).toBe('b')
        await el.updateComplete
        expect(root.querySelector('.overflow-menu')).toBeNull()
    })

    it('a click elsewhere on the page closes the overflow menu', async () => {
        const { el, root } = await mount({ title: 'X', toolbar: [{ id: 'a', actionId: 'a', label: 'Alpha' }] })
        ;(el as any)._overflowN = 1
        await el.updateComplete
        ;(root.querySelector('.overflow-btn') as HTMLButtonElement).click()
        await el.updateComplete
        expect(root.querySelector('.overflow-menu')).not.toBeNull()
        document.body.click()
        await el.updateComplete
        expect(root.querySelector('.overflow-menu')).toBeNull()
    })

    it('a renderer may draw the toolbar buttons with its own widgets', async () => {
        const renderer = new TestRenderer() as unknown as ComponentRenderer & Record<string, unknown>
        renderer.renderToolbarButton = ((_b: unknown, label: string) => `CUSTOM:${label}`) as never
        componentRenderer.set(renderer)
        try {
            const { root } = await mount({ title: 'X', toolbar: [{ id: 'a', actionId: 'a', label: 'Alpha' }] })
            expect(root.textContent).toContain('CUSTOM:Alpha')
        } finally {
            componentRenderer.set(new TestRenderer() as unknown as ComponentRenderer)
        }
    })
})

describe('peer navigation', () => {
    it('previous/next arrows go to the neighbour record; a side without a route is disabled', async () => {
        const { root } = await mount({ title: 'Employee', peerNav: { nextLabel: 'Bob', nextRoute: '/employees/${state.next}' } }, { state: { next: '3' } })
        const prev = root.querySelector('.peer-nav-prev') as HTMLButtonElement
        const next = root.querySelector('.peer-nav-next') as HTMLButtonElement
        expect(prev.disabled).toBe(true)
        expect(next.getAttribute('aria-label')).toBe('Bob')
        next.click()
        expect(navigated).toEqual(['/employees/3'])
    })

    it('with no route on either side there are no arrows', async () => {
        const { root } = await mount({ title: 'Employee', peerNav: { prevLabel: 'A' } })
        expect(root.querySelector('.peer-nav')).toBeNull()
    })
})

describe('breadcrumbs', () => {
    it('declared crumbs: a link goes inside the app, an absolute url leaves it, the last one is the current page', async () => {
        const { root, events } = await mount({ title: 'Order', breadcrumbs: [
            { text: 'Home', link: '/home' }, { text: 'Docs', link: 'https://example.com/docs' }, { text: 'Order' },
        ] })
        const links = Array.from(root.querySelectorAll('.breadcrumb-link')) as HTMLButtonElement[]
        expect(links.map(l => l.textContent)).toEqual(['Home', 'Docs'])
        expect(root.querySelector('.breadcrumb-current')?.getAttribute('aria-current')).toBe('page')
        links[0].click()
        expect(events.find(e => e.type === 'navigate-to-requested')?.detail.route).toBe('/home')
        links[1].click()
        expect(navigated).toEqual(['https://example.com/docs'])
    })

    it('a page without declared crumbs gets the trail of the shell menu, and its links navigate like the menu', async () => {
        history.replaceState(null, '', '/sales/orders/7')
        const shell = { isConnected: true }
        const viaMenu: string[] = []
        publishShellMenu(shell, [
            { label: 'Sales', submenus: [{ label: 'Orders', route: '/sales/orders' }, { label: 'Quotes', route: '/sales/quotes' }] },
        ] as never, false, (_option, route) => viaMenu.push(route))
        try {
            const { root } = await mount({ type: ComponentMetadataType.Page, title: 'Order 7' })
            const nav = root.querySelector('.breadcrumbs-bar')
            expect(nav?.textContent).toContain('Sales')
            const link = root.querySelector('.breadcrumb-link') as HTMLButtonElement | null
            expect(link).not.toBeNull()
            link!.click()
            expect(viaMenu).toHaveLength(1)
        } finally {
            shell.isConnected = false
            history.replaceState(null, '', '/')
        }
    })
})

describe('button themes', () => {
    it('combine color, style and size; the neutral classes follow them', () => {
        expect(buttonTheme({ color: 'error', buttonStyle: 'tertiaryInline', size: 'small' } as never)).toBe('error tertiary-inline small')
        expect(buttonTheme({ color: 'normal', size: 'normal' } as never)).toBeUndefined()
        expect(neutralButtonClass({ color: 'error', buttonStyle: 'primary' } as never)).toBe('primary danger')
        expect(neutralButtonClass({ buttonStyle: 'tertiary' } as never)).toBe('tertiary')
    })
})
