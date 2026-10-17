// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * mateu-ui, the composition root: the URL becomes the route of the top-level ux (base url / path
 * prefix stripped, query kept), a route change pushes the address bar, a server NavigateTo re-aims
 * the ux without the dirty prompt, back/forward reloads the URL (or is undone when the user keeps
 * their unsaved changes), and `overrides` / `config` seed the app state.
 *
 * The ux itself is stubbed: what mateu-ui hands it is the contract here.
 */

const mocks = vi.hoisted(() => ({
    installClientErrorReporting: vi.fn(),
    loadBundleManifest: vi.fn(),
    installLiveReload: vi.fn(),
}))
vi.mock('./mateu-ux', () => ({}))
vi.mock('./mateu-api-caller', () => ({}))
vi.mock('@infra/http/clientErrorReporter.ts', () => ({ installClientErrorReporting: mocks.installClientErrorReporting }))
vi.mock('@infra/http/bundleStore.ts', () => ({ loadBundleManifest: mocks.loadBundleManifest }))
vi.mock('@infra/dev/liveReload.ts', () => ({ installLiveReload: mocks.installLiveReload }))

import './mateu-ui'
import type { MateuUi } from './mateu-ui'
import { appState } from '@domain/state'
import { dirtyGuard } from './dirtyGuard'

const at = (url: string) => window.history.replaceState({}, '', url)

const mount = async (attrs: Record<string, string> = {}) => {
    const el = document.createElement('mateu-ui') as MateuUi
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v)
    document.body.appendChild(el)
    await el.updateComplete
    return el
}

// the shell installs window.onpopstate; jsdom (under vitest) does not route a dispatched popstate
// to that property, so the browser's back/forward is simulated by calling it as the browser would
const backOrForward = () => (window.onpopstate as (e: unknown) => void)({ target: window })

const ux = (el: MateuUi) => (el.renderRoot as ParentNode).querySelector('mateu-ux') as HTMLElement

beforeEach(() => at('/'))

afterEach(() => {
    document.body.innerHTML = ''
    window.onpopstate = null
    appState.value = {}
    dirtyGuard.markClean()
    vi.clearAllMocks()
    vi.restoreAllMocks()
    at('/')
})

describe('booting from the URL', () => {
    it('the path (minus the base url) and the query become the route of the top-level ux', async () => {
        at('/app/orders/42?tab=lines')
        const el = await mount({ baseurl: '/app' })
        expect(el.route).toBe('/orders/42?tab=lines')
        expect(ux(el).getAttribute('route')).toBe('/orders/42?tab=lines')
        expect(ux(el).getAttribute('baseurl')).toBe('/app')
        expect(ux(el).getAttribute('top')).toBe('true')
        expect(mocks.installClientErrorReporting).toHaveBeenCalledWith('/app')
        expect(mocks.installLiveReload).toHaveBeenCalledWith(el)
    })

    it('an absolute base url only strips its path', async () => {
        at('/ctx/customers')
        const el = await mount({ baseurl: 'https://api.example.com/ctx' })
        expect(el.route).toBe('/customers')
        at('/ctx/x')
        el.baseUrl = 'http://api.example.com/ctx'
        expect(el.extractRouteFromUrl(window)).toBe('/x')
    })

    it('a path prefix is stripped, and the bare root is the empty route', async () => {
        at('/portal/bookings')
        const el = await mount({ pathprefix: '/portal' })
        expect(el.route).toBe('/bookings')
        at('/')
        el.pathPrefix = undefined
        expect(el.extractRouteFromUrl(window)).toBe('')
    })

    it('a bundle url starts the manifest fetch', async () => {
        await mount({ bundleurl: '/bundle/manifest.json' })
        expect(mocks.loadBundleManifest).toHaveBeenCalledWith('/bundle/manifest.json')
    })

    it('?overrides= seeds the app state (JSON, or kept raw when it is not)', async () => {
        at('/?overrides=' + encodeURIComponent('{"hotel":"H1"}'))
        await mount()
        expect(appState.value).toMatchObject({ hotel: 'H1' })
        document.body.innerHTML = ''
        at('/?overrides=plain')
        await mount()
        expect(appState.value).toMatchObject({ config: 'plain' })
    })

    it('a config attribute seeds the app state too', async () => {
        await mount({ config: '{"tenant":"acme"}' })
        expect(appState.value).toMatchObject({ tenant: 'acme' })
    })

    it('a nested (non-top) mateu-ui does not read the URL nor install the error reporter', async () => {
        at('/somewhere')
        const el = await mount({ top: 'false', route: '/inner' })
        expect(el.route).toBe('/inner')
        expect(el.consumedRoute).toBe('')
        expect(mocks.installClientErrorReporting).not.toHaveBeenCalled()
    })
})

describe('navigation', () => {
    it('a url-update request pushes the new address (path and query)', async () => {
        at('/orders')
        const el = await mount()
        const push = vi.spyOn(window.history, 'pushState')
        ux(el).dispatchEvent(new CustomEvent('url-update-requested', { detail: { route: '/orders?status=open' }, bubbles: true, composed: true }))
        expect(push).toHaveBeenCalledTimes(1)
        expect(window.location.pathname + window.location.search).toBe('/orders?status=open')
        // the same place again is not a second history entry
        ux(el).dispatchEvent(new CustomEvent('url-update-requested', { detail: { route: '/orders?status=open' }, bubbles: true, composed: true }))
        expect(push).toHaveBeenCalledTimes(1)
    })

    it('a nested mateu-ui never touches the address bar', async () => {
        const el = await mount({ top: 'false' })
        const push = vi.spyOn(window.history, 'pushState')
        el.dispatchEvent(new CustomEvent('url-update-requested', { detail: { route: '/x' } }))
        expect(push).not.toHaveBeenCalled()
    })

    it('a server-initiated navigation re-aims the ux and drops the unsaved-changes flag', async () => {
        const el = await mount()
        dirtyGuard.markDirty()
        const before = ux(el).getAttribute('instant')
        ux(el).dispatchEvent(new CustomEvent('navigate-to-requested', { detail: { route: '/orders/7' }, bubbles: true, composed: true }))
        expect(ux(el).getAttribute('route')).toBe('/orders/7')
        expect(ux(el).getAttribute('instant')).not.toBe(before)
        expect(dirtyGuard.dirty).toBe(false)
    })

    it('back/forward reloads the URL it lands on, rebuilding the tree when it is another screen', async () => {
        at('/orders')
        const el = await mount()
        const key = el.navigationKey
        at('/customers')
        backOrForward()
        await el.updateComplete
        expect(el.route).toBe('/customers')
        expect(el.navigationKey).not.toBe(key)
    })

    it('back/forward with unsaved changes the user keeps puts the address back', async () => {
        at('/orders/1/edit')
        const el = await mount()
        dirtyGuard.markDirty()
        vi.spyOn(window, 'confirm').mockReturnValue(false)
        at('/orders')
        backOrForward()
        expect(window.location.pathname).toBe('/orders/1/edit')
        expect(el.route).toBe('/orders/1/edit')
    })

    it('remount rebuilds the tree on the current URL', async () => {
        const el = await mount()
        const key = el.navigationKey
        at('/reports')
        el.remount()
        expect(el.navigationKey).not.toBe(key)
        expect(el.route).toBe('/reports')
    })

    it('an action nobody claimed is reported to the developer', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        const el = await mount()
        ux(el).dispatchEvent(new CustomEvent('action-requested', { detail: { actionId: 'saev' }, bubbles: true, composed: true }))
        expect(warn).toHaveBeenCalledWith(expect.stringContaining('"saev"'))
    })

    it('the debug overlay is drawn only when asked for', async () => {
        const el = await mount()
        expect((el.renderRoot as ParentNode).querySelector('mateu-debug-overlay')).toBeNull()
        el.debug = true
        await el.updateComplete
        expect((el.renderRoot as ParentNode).querySelector('mateu-debug-overlay')).not.toBeNull()
    })

    it('stops listening once removed', async () => {
        const el = await mount()
        el.remove()
        const push = vi.spyOn(window.history, 'pushState')
        el.dispatchEvent(new CustomEvent('url-update-requested', { detail: { route: '/gone' } }))
        expect(push).not.toHaveBeenCalled()
    })
})
