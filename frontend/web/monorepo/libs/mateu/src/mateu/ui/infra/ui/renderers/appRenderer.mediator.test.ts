// @vitest-environment jsdom
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

/**
 * appRenderer beyond the navigation variants: the MEDIATOR shell (a crud's chrome-less shell) and
 * where its content ux points — its own internal route (`state._route`) under its consumed route,
 * keeping the home route's markers; the SPLIT layout's detail pane; a menu group shown as cards;
 * the "open on mobile" button; the side-nav refresh of the page on screen.
 */

import '../mateu-app'
import type { MateuApp } from '../mateu-app'
import { componentRenderer, ComponentRenderer } from './ComponentRenderer'
import { BasicComponentRenderer } from './BasicComponentRenderer'
import { AppVariant } from '@mateu/shared/apiClients/dtos/componentmetadata/AppVariant'
import { ComponentMetadataType } from '@mateu/shared/apiClients/dtos/ComponentMetadataType'

class TestRenderer extends BasicComponentRenderer {}
beforeAll(() => componentRenderer.set(new TestRenderer() as unknown as ComponentRenderer))
afterAll(() => componentRenderer.set({} as ComponentRenderer))

const app = (over: Record<string, unknown> = {}) => ({
    id: 'app', type: 'ClientSide', children: [],
    metadata: {
        type: ComponentMetadataType.App,
        title: 'Products',
        variant: AppVariant.MEDIATOR,
        route: '/products',
        homeRoute: '/products?_embeddedMediator=1',
        homeConsumedRoute: '/products',
        serverSideType: 'com.example.ProductsCrud',
        homeServerSideType: 'com.example.ProductsCrud',
        menu: [],
        ...over,
    },
})

const mount = async (component: unknown, state: Record<string, unknown> = {}) => {
    const el = document.createElement('mateu-app') as MateuApp
    el.component = component as never
    el.baseUrl = '/shop'
    el.state = state
    el.data = {}
    document.body.appendChild(el)
    await el.updateComplete
    return el
}

const uxs = (el: MateuApp) => Array.from(el.shadowRoot!.querySelectorAll('mateu-ux'))

afterEach(() => {
    document.body.innerHTML = ''
    vi.restoreAllMocks()
})

describe('the MEDIATOR shell', () => {
    it('loads its home route at its own base url, with a stable content id', async () => {
        const el = await mount(app())
        const [ux] = uxs(el)
        expect(ux.getAttribute('route')).toBe('/products?_embeddedMediator=1')
        expect(ux.getAttribute('baseurl')).toBe('/shop')
        expect(ux.getAttribute('serversidetype')).toBe('com.example.ProductsCrud')
        expect(ux.id).toBe('ux__products_com_example_ProductsCrud')
        // and passes its own state down as the content's seed
        expect((ux as unknown as { initialState: unknown }).initialState).toEqual({})
    })

    it('its internal route (state._route) goes under the consumed route and keeps the home route\'s markers', async () => {
        const el = await mount(app(), { _route: '/new' })
        expect(uxs(el)[0].getAttribute('route')).toBe('/products/new?_embeddedMediator=1')
        el.state = { _route: '/7?tab=lines' }
        el.requestUpdate()
        await el.updateComplete
        expect(uxs(el)[0].getAttribute('route')).toBe('/products/7?tab=lines&_embeddedMediator=1')
    })

    it('a lazy island (_lazy=1) is loaded only when shown', async () => {
        const el = await mount(app({ homeRoute: '/products?_lazy=1' }))
        expect(el.shadowRoot!.querySelector('mateu-when-visible')).not.toBeNull()
    })

    it('SPLIT: a list pane on the consumed route and a detail pane on the selected record (or a new one)', async () => {
        const el = await mount(app({ layout: 'SPLIT', homeRoute: '/products' }))
        let [list, detail] = uxs(el)
        expect(list.getAttribute('route')).toBe('/products')
        expect(detail.getAttribute('route')).toBe('new')
        expect(detail.id).toBe(list.id + '_detail')

        el.state = { _route: '/42/edit' }
        el.requestUpdate()
        await el.updateComplete
        ;[list, detail] = uxs(el)
        expect(detail.getAttribute('route')).toBe('/products/42/edit')
        expect((list as unknown as { appState: Record<string, unknown> }).appState._splitDetailId).toBe('42')
    })
})

describe('more of the header and menu', () => {
    it('a group declared as cards is drawn as a card menu between the plain entries', async () => {
        const el = await mount(app({
            variant: AppVariant.MENU_ON_TOP,
            menu: [
                { label: 'Home', route: '/home' },
                { label: 'Quick access', display: 'cards', submenus: [{ label: 'Bookings', route: '/bookings', description: 'All bookings' }] },
                { label: 'Reports', route: '/reports' },
            ],
        }))
        const band = el.shadowRoot!.querySelector('.mateu-app-band2 .mateu-nav-with-cards')!
        expect(band).not.toBeNull()
        const cards = band.querySelector('mateu-card-menu') as HTMLElement & { item: { text: string } }
        expect(cards.item.text).toBe('Quick access')
        expect(Array.from(band.querySelectorAll('.mateu-nav-item')).map((b) => b.textContent)).toEqual(['Home', 'Reports'])
    })

    it('"open on mobile" is a header button when the app asks for it', async () => {
        const el = await mount(app({ variant: AppVariant.MENU_ON_TOP, mobileQr: true }))
        const button = el.shadowRoot!.querySelector('.mateu-mobile-qr')
        expect(button?.getAttribute('aria-label')).toMatch(/mobile/i)
    })

    it('re-selecting the page on screen from the nav refreshes it instead of navigating', async () => {
        const el = await mount(app({ variant: AppVariant.HAMBURGER_MENU, homeRoute: '/products', menu: [{ label: 'Products', route: '/products' }] }))
        const select = vi.spyOn(el, 'selectRoute')
        const ux = uxs(el)[0]
        const before = ux.getAttribute('instant')
        el.navItemSelected({ path: el.selectedRoute, consumedRoute: el.selectedConsumedRoute, baseUrl: el.selectedBaseUrl,
            serverSideType: el.selectedServerSideType } as never)
        expect(select).not.toHaveBeenCalled()
        expect(ux.getAttribute('instant')).not.toBe(before)
        el.navItemSelected({ path: '/other' } as never)
        expect(select).toHaveBeenCalledWith(undefined, '/other', undefined, undefined, undefined, undefined)
    })
})
