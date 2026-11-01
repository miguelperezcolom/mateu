// @vitest-environment jsdom
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * mateu-ux, the view that loads a route: what it sends to the server for its route (and for the
 * actions of the content below it), how a route change reaches the address bar (mount-relative, uri
 * prefix), the "Not found" of a failed load, the delayed skeleton, the client structure cache and
 * @StaticView (a revisit paints at once; a static one skips the server), state-only answers that
 * must not blank the screen, the dev live reload, and the stale guard against the previous view.
 */

const mocks = vi.hoisted(() => ({
    httpRun: vi.fn(),
    sseRun: vi.fn(),
}))
vi.mock('@application/service', () => ({ service: { runAction: mocks.httpRun } }))
vi.mock('@application/SSEService.ts', () => ({ sseService: { runAction: mocks.sseRun } }))

import './mateu-ux'
import type { MateuUx } from './mateu-ux'
import { componentRenderer, ComponentRenderer } from './renderers/ComponentRenderer'
import { BasicComponentRenderer } from './renderers/BasicComponentRenderer'
import { ComponentType } from '@mateu/shared/apiClients/dtos/ComponentType'
import { ComponentMetadataType } from '@mateu/shared/apiClients/dtos/ComponentMetadataType'
import { UIFragmentAction } from '@mateu/shared/apiClients/dtos/UIFragmentAction'
import { clearStructureCache, setStructureCacheEnabled } from '@infra/routeStructureCache'
import { clearStaticFragments } from '@infra/staticViewCache'
import { appState } from '@domain/state'

class TestRenderer extends BasicComponentRenderer {}
beforeAll(() => componentRenderer.set(new TestRenderer() as unknown as ComponentRenderer))
afterAll(() => componentRenderer.set({} as ComponentRenderer))

/** A server-side view whose content is a plain element with a text. */
const view = (text: string, over: Record<string, unknown> = {}) => ({
    id: 'v-' + text, type: ComponentType.ServerSide, serverSideType: 'com.example.View', actions: [], triggers: [],
    initialData: {}, rules: [], validations: [],
    children: [{ id: 'el-' + text, type: ComponentType.ClientSide, children: [],
        metadata: { type: ComponentMetadataType.Element, name: 'p', content: text } }],
    ...over,
}) as never

const fragment = (component: unknown, state: Record<string, unknown> = {}, action = UIFragmentAction.Replace) =>
    ({ targetComponentId: 'ux', component, state, data: {}, action, containerId: undefined }) as never

const mount = async (attrs: Record<string, string> = {}, props: Partial<MateuUx> = {}) => {
    const el = document.createElement('mateu-ux') as MateuUx
    el.id = 'ux'
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v)
    Object.assign(el, props)
    document.body.appendChild(el)
    await el.updateComplete
    return el
}

type RunArgs = [unknown, string, string, string, string, string, Record<string, unknown>, string, Record<string, unknown>, Record<string, unknown>, HTMLElement, boolean, unknown, boolean, string, Record<string, unknown>]
const call = (n = 0) => mocks.httpRun.mock.calls[n] as unknown as RunArgs
/** The text on screen, through every shadow root, without the stylesheets. */
const deepText = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? ''
    if (node instanceof HTMLStyleElement) return ''
    let out = ''
    const el = node as Element
    if (el.shadowRoot) out += deepText(el.shadowRoot)
    node.childNodes.forEach((c) => { out += deepText(c) })
    return out
}
const text = (el: MateuUx) => deepText(el).replace(/\s+/g, ' ').trim()
const settle = async (el: MateuUx) => {
    await el.updateComplete
    for (let i = 0; i < 5; i++) await new Promise((r) => setTimeout(r, 0))
}

beforeEach(() => {
    setStructureCacheEnabled(true)
    clearStructureCache()
    clearStaticFragments()
})

afterEach(() => {
    document.body.innerHTML = ''
    appState.value = {}
    vi.clearAllMocks()
    vi.useRealTimers()
})

describe('the route load', () => {
    it('asks the server for its route with the empty action id, its consumed route, type and seed state', async () => {
        const el = await mount({ baseurl: '/app', route: '/orders', consumedroute: '/app' },
            { serverSideType: 'com.example.Orders', initialState: { stayId: 7 } })
        expect(mocks.httpRun).toHaveBeenCalledTimes(1)
        const [, baseUrl, route, consumedRoute, actionId, initiatorId, , serverSideType, componentState, , initiator] = call()
        expect([baseUrl, route, consumedRoute, actionId, initiatorId, serverSideType]).toEqual(['/app', '/orders', '/app', '', 'ux', 'com.example.Orders'])
        expect(componentState).toEqual({ stayId: 7 })
        expect(initiator).toBe(el)
    })

    it('the app state goes with it, with the ux\'s own overrides laid over', async () => {
        appState.value = { hotel: 'H1', lang: 'en' }
        await mount({ route: '/x', overrides: '{"lang":"es"}' })
        expect(call()[6]).toEqual({ hotel: 'H1', lang: 'es' })
    })

    it('a new route or instant loads again', async () => {
        const el = await mount({ route: '/a' })
        el.route = '/b'
        await el.updateComplete
        el.instant = 'now'
        await el.updateComplete
        expect(mocks.httpRun.mock.calls.map((c) => (c as unknown as RunArgs)[2])).toEqual(['/a', '/b', '/b'])
    })

    it('renders what the server answers, and stamps the page chrome the styles read', async () => {
        const el = await mount({ route: '/a' })
        el.applyFragment(fragment(view('Hello')))
        await settle(el)
        expect(text(el)).toContain('Hello')
        expect(el.dataset.pageWidth).toBeTruthy()
        expect(el.dataset.hasWelcomeBanner).toBe('false')
    })

    it('a state-only answer merges into the content on screen instead of blanking it', async () => {
        const el = await mount({ route: '/a' })
        el.applyFragment(fragment(view('Hello'), { a: 1 }))
        el.applyFragment({ targetComponentId: 'ux', state: { b: 2 }, data: { d: 1 } } as never)
        await settle(el)
        expect(text(el)).toContain('Hello')
        expect(el.fragment!.state).toEqual({ a: 1, b: 2 })
        expect(el.fragment!.data).toEqual({ d: 1 })
    })

    it('a failed route load shows "Not found"; a failed action of the content does not', async () => {
        const el = await mount({ route: '/missing' })
        el.dispatchEvent(new CustomEvent('backend-call-failed', { detail: { actionId: 'save' } }))
        await el.updateComplete
        expect(text(el)).toBe('')
        el.dispatchEvent(new CustomEvent('backend-call-failed', { detail: { actionId: '' } }))
        await settle(el)
        expect(text(el)).toContain('Not found')
    })
})

describe('the loading skeleton', () => {
    it('appears only after a delay while the first load is out, and goes when it ends', async () => {
        vi.useFakeTimers()
        const el = await mount({ route: '/slow' })
        el.dispatchEvent(new CustomEvent('backend-called-event'))
        await vi.advanceTimersByTimeAsync(300)
        expect((el.shadowRoot ?? el).querySelector('.route-skeleton')).toBeNull()
        await vi.advanceTimersByTimeAsync(200)
        await el.updateComplete
        expect((el.shadowRoot ?? el).querySelector('.route-skeleton')).not.toBeNull()
        el.dispatchEvent(new CustomEvent('backend-succeeded-event'))
        await el.updateComplete
        expect((el.shadowRoot ?? el).querySelector('.route-skeleton')).toBeNull()
    })

    it('content already on screen is kept under the veil (no skeleton), and a child\'s traffic is ignored', async () => {
        vi.useFakeTimers()
        const el = await mount({ route: '/a' })
        const child = document.createElement('div')
        ;(el.shadowRoot ?? el).appendChild(child)
        child.dispatchEvent(new CustomEvent('backend-called-event', { bubbles: true, composed: true }))
        await vi.advanceTimersByTimeAsync(500)
        await el.updateComplete
        expect((el.shadowRoot ?? el).querySelector('.route-skeleton')).toBeNull()

        el.applyFragment(fragment(view('Hello')))
        el.dispatchEvent(new CustomEvent('backend-called-event'))
        await vi.advanceTimersByTimeAsync(500)
        await el.updateComplete
        expect((el.shadowRoot ?? el).querySelector('.route-skeleton')).toBeNull()
        vi.useRealTimers()
        await settle(el)
        expect(text(el)).toContain('Hello')
    })
})

describe('actions of the content', () => {
    it('go to the server with the ux\'s base url; an SSE action goes to the stream service', async () => {
        const el = await mount({ baseurl: '/app', route: '/a' })
        el.applyFragment(fragment(view('Hello')))
        await el.updateComplete
        mocks.httpRun.mockClear()
        const initiator = document.createElement('div')
        ;(el.shadowRoot ?? el).appendChild(initiator)
        const detail = { route: '/a', consumedRoute: '', actionId: 'save', serverSideType: 'com.example.View',
            initiatorComponentId: 'c1', initiator, componentState: { name: 'x' }, parameters: { p: 1 } }
        initiator.dispatchEvent(new CustomEvent('server-side-action-requested', { detail, bubbles: true, composed: true }))
        expect(mocks.httpRun).toHaveBeenCalledTimes(1)
        expect(call().slice(1, 5)).toEqual(['/app', '/a', '', 'save'])
        expect(call()[8]).toEqual({ name: 'x' })
        expect(call()[9]).toEqual({ p: 1 })

        initiator.dispatchEvent(new CustomEvent('server-side-action-requested', { detail: { ...detail, sse: true }, bubbles: true, composed: true }))
        expect(mocks.sseRun).toHaveBeenCalledTimes(1)
    })

    it('an action fired by the PREVIOUS view after the ux moved on is dropped and its initiator told', async () => {
        const el = await mount({ baseurl: '/app', route: '/a' })
        el.applyFragment(fragment(view('Hello')))
        // the ux is re-bound to another page (another base url) before the old content's action arrives
        el.baseUrl = '/other'
        mocks.httpRun.mockClear()
        const initiator = document.createElement('div')
        const cancelled = vi.fn()
        initiator.addEventListener('backend-cancelled-event', cancelled)
        ;(el.shadowRoot ?? el).appendChild(initiator)
        initiator.dispatchEvent(new CustomEvent('server-side-action-requested', {
            detail: { actionId: 'save', initiator, route: '/a' }, bubbles: true, composed: true }))
        expect(mocks.httpRun).not.toHaveBeenCalled()
        expect(cancelled).toHaveBeenCalled()
    })

    it('an app-state-only change is handed to the content without re-rendering the view', async () => {
        const el = await mount({ route: '/a' })
        el.applyFragment(fragment(view('Hello')))
        await el.updateComplete
        const comp = (el.shadowRoot ?? el).querySelector('mateu-component') as unknown as { appState: unknown }
        expect(comp).not.toBeNull()
        el.appState = { hotel: 'H2' }
        await el.updateComplete
        expect(comp.appState).toEqual({ hotel: 'H2' })
    })
})

describe('route changes reaching the address bar', () => {
    const urlUpdates = (el: MateuUx) => ({
        fire: (route: string) => el.dispatchEvent(new CustomEvent('route-changed', { detail: { route }, bubbles: true, composed: true })),
    })

    it('a top ux announces its route; a mediator\'s internal route is under the consumed route and the uri prefix', async () => {
        const seen: string[] = []
        const listener = (e: Event) => seen.push((e as CustomEvent).detail.route)
        document.addEventListener('url-update-requested', listener)
        const top = await mount({ route: '/orders', top: 'true' })
        expect(seen).toEqual(['/orders'])
        document.body.innerHTML = ''

        const el = await mount({ route: '/products', consumedroute: '/products' })
        const { fire } = urlUpdates(el)
        fire('/new')
        fire('/products/7')
        el.uriPrefix = '/shop/'
        fire('/new')
        el.uriPrefix = 'shop'
        fire('deals')
        el.uriPrefix = '/shop'
        fire('/x')
        expect(seen).toEqual(['/orders', '/products/new', '/products/7', '/shop/products/new', 'shop/deals', '/shop/products/x'])
        document.removeEventListener('url-update-requested', listener)
        void top
    })

    it('a history push moves the route without loading it again', async () => {
        const el = await mount({ route: '/products' })
        mocks.httpRun.mockClear()
        el.dispatchEvent(new CustomEvent('history-pushed', { detail: { route: '/products/new' } }))
        await el.updateComplete
        expect(el.route).toBe('/products/new')
        expect(mocks.httpRun).not.toHaveBeenCalled()
        // the next real navigation loads again
        el.route = '/products/1'
        await el.updateComplete
        expect(mocks.httpRun).toHaveBeenCalledTimes(1)
    })
})

describe('the structure cache', () => {
    it('a revisit paints the cached structure at once and echoes its hash so the server may answer state-only', async () => {
        const first = await mount({ route: '/cached' })
        first.applyFragment(fragment(view('Cached screen', { structureHash: 'h1' })))
        document.body.innerHTML = ''
        mocks.httpRun.mockClear()

        const again = await mount({ route: '/cached' })
        await settle(again)
        expect(text(again)).toContain('Cached screen')
        expect(call()[15]).toMatchObject({ knownStructureHash: 'h1' })
    })

    it('an answer with the very structure painted from the cache keeps it on screen and takes only its state', async () => {
        // a static/YAML page carries no structureHash, so the server cannot answer state-only: the
        // identical structure replaced the predicted one, re-mounting the page — it flickered and
        // ran its OnLoad (its record fetch) twice
        const first = await mount({ route: '/yaml' })
        first.applyFragment(fragment(view('Museum')))
        document.body.innerHTML = ''

        const again = await mount({ route: '/yaml' })
        await settle(again)
        const painted = again.fragment!.component
        again.applyFragment(fragment(view('Museum'), { name: 'SMK' }))
        expect(again.fragment!.component).toBe(painted)
        expect(again.fragment!.state).toMatchObject({ name: 'SMK' })

        // a different structure still replaces it
        again.applyFragment(fragment(view('Other')))
        await settle(again)
        expect(text(again)).toContain('Other')
    })

    it('a state-only answer that changes nothing keeps what the content loaded itself (a revisited record page)', async () => {
        // A collection-detail record page revisited: the cache paints its structure, its OnLoad
        // fetches the record (REST data into the child's own state) while the load is out, and the
        // server, seeing the echoed hash, answers state-only with the id the seed already had. The
        // merge made new state/data objects, the child was re-bound to its seed and the record it
        // had loaded was gone for good (its OnLoad had already fired): the detail went blank.
        const record = () => view('Earth', { structureHash: 'h-body', initialData: { id: '4' } })
        const first = await mount({ route: '/bodies/4' })
        first.applyFragment(fragment(record(), { id: '4' }))
        document.body.innerHTML = ''

        const again = await mount({ route: '/bodies/4' })
        await settle(again)
        const child = again.renderRoot.querySelector('mateu-component') as unknown as { state: Record<string, unknown> }
        child.state = { ...child.state, name: 'Earth', radiusKm: 6371 } // what its OnLoad brought
        const before = again.fragment

        again.applyFragment({ targetComponentId: 'ux', component: undefined, state: { id: '4' }, data: {},
            action: UIFragmentAction.Replace, containerId: undefined } as never)
        await settle(again)
        expect(again.fragment).toBe(before)
        expect(child.state).toMatchObject({ id: '4', name: 'Earth', radiusKm: 6371 })

        // an answer that DOES change the state still reaches the content
        again.applyFragment({ targetComponentId: 'ux', component: undefined, state: { id: '5' }, data: {},
            action: UIFragmentAction.Replace, containerId: undefined } as never)
        await settle(again)
        expect(child.state).toMatchObject({ id: '5' })
    })

    it('a @StaticView revisit is answered from the session cache without asking the server', async () => {
        const first = await mount({ route: '/static' })
        first.applyFragment(fragment(view('Static screen', { staticView: true }), { s: 1 }))
        document.body.innerHTML = ''
        mocks.httpRun.mockClear()

        const again = await mount({ route: '/static' })
        await settle(again)
        expect(mocks.httpRun).not.toHaveBeenCalled()
        expect(text(again)).toContain('Static screen')
        expect(again.fragment!.state).toEqual({ s: 1 })
    })

    it('an overlay pushed onto the view (Add) is not route content: not cached', async () => {
        const first = await mount({ route: '/withDialog' })
        first.applyFragment(fragment(view('Dialog'), {}, UIFragmentAction.Add))
        document.body.innerHTML = ''
        const again = await mount({ route: '/withDialog' })
        expect(text(again)).not.toContain('Dialog')
    })
})

describe('dev live reload', () => {
    it('re-requests the route on screen with the live state, and lays it over the answer', async () => {
        const el = await mount({ route: '/form' }, { initialState: { seed: true } })
        mocks.httpRun.mockClear()
        el.liveReload({ name: 'typed' })
        await el.updateComplete
        expect(mocks.httpRun).toHaveBeenCalledTimes(1)
        expect(call()[8]).toEqual({ seed: true, name: 'typed' })
        // afterwards the seed is back to what it was
        await el.updateComplete
        expect(el.initialState).toEqual({ seed: true })
        el.applyFragment(fragment(view('Form'), { name: 'server' }))
        expect(el.fragment!.state).toEqual({ name: 'typed' })
    })
})
