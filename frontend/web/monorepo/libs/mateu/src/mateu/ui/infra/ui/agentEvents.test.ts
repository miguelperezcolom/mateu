// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'

const rendered: { origin: unknown, request: unknown }[] = []
let renderFailure: Error | undefined
vi.mock('./builtInRenderTarget', () => ({
    renderScreenInShell: (origin: unknown, request: unknown) => {
        rendered.push({ origin, request })
        return renderFailure ? Promise.reject(renderFailure) : Promise.resolve()
    },
}))
const navigated: string[] = []
vi.mock('./rowRoute', () => ({ navigateToRoute: (_from: unknown, route: string) => { navigated.push(route) } }))

import { applyAgentEvent, navigatingShellOf } from './agentEvents'
import { claimEvent } from './chatEvents'
import { declareAgentEvent } from './agentEventPolicy'

/**
 * The ONE place an agent event is applied — the chat's stream and the live UI push channel both
 * come here: dispatched first (a subscriber takes it), then a navigation nobody took goes to the app
 * shell's own handler (like a menu click), a generated screen nobody took to the built-in render
 * target, and anything else was just the dispatch.
 */

type Shell = HTMLElement & { updateRoute: (e: Event) => void, component?: unknown }

const shell = (variant?: string, parent: Node = document.body): Shell => {
    const el = document.createElement('mateu-app') as Shell
    el.attachShadow({ mode: 'open' })
    el.updateRoute = vi.fn()
    el.component = { metadata: { variant } }
    parent.appendChild(el)
    return el
}

const settle = async () => { for (let i = 0; i < 5; i++) await Promise.resolve() }

afterEach(() => {
    document.body.innerHTML = ''
    rendered.length = 0
    navigated.length = 0
    renderFailure = undefined
})

describe('applyAgentEvent', () => {
    it('a render-screen nobody takes goes to the built-in render target; a claimed one stays with its subscriber', async () => {
        const origin = shell()
        applyAgentEvent(origin, 'render-screen', { yaml: 'type: Text', target: 'drawer', title: 'Hi' })
        expect(rendered).toEqual([{ origin, request: { yaml: 'type: Text', target: 'drawer', title: 'Hi' } }])

        const claimer = (e: Event) => claimEvent(e)
        document.addEventListener('render-screen', claimer)
        applyAgentEvent(origin, 'render-screen', { yaml: 'type: Card' })
        document.removeEventListener('render-screen', claimer)
        applyAgentEvent(origin, 'render-screen', { nothing: true })
        expect(rendered).toHaveLength(1)
    })

    it('says when a generated screen could not be shown', async () => {
        renderFailure = new Error('no backend')
        const failed: unknown[] = []
        applyAgentEvent(shell(), 'render-screen', { yaml: 'x: 1' }, { onRenderFailed: (e) => failed.push(e) })
        await settle()
        expect(failed).toEqual([renderFailure])
    })

    it('a navigation the shell\'s listener took is done; one dispatched from the shell itself reaches its handler like a menu click', () => {
        const app = shell()
        const detail = { route: '/orders', consumedRoute: '', actionId: '', baseUrl: '/b', serverSideType: 'x.Home', uriPrefix: '' }
        const listener = document.createElement('div')
        app.shadowRoot!.appendChild(listener)
        const took: unknown[] = []
        listener.addEventListener('navigation-requested', (e) => { e.preventDefault(); took.push((e as CustomEvent).detail) })
        applyAgentEvent(listener, 'navigation-requested', detail)
        expect(took).toEqual([detail])
        expect(app.updateRoute).not.toHaveBeenCalled()

        // the push channel dispatches from the shell: no listener there, so its handler runs
        applyAgentEvent(app, 'navigation-requested', detail)
        expect(app.updateRoute).toHaveBeenCalledTimes(1)
        expect(((app.updateRoute as ReturnType<typeof vi.fn>).mock.calls[0][0] as CustomEvent).detail).toEqual(detail)
        expect(navigated).toEqual([])
    })

    it('a nested MEDIATOR shell is not the one that navigates; outside any shell the route is opened directly', () => {
        const outer = shell()
        const inner = shell('MEDIATOR', outer.shadowRoot!)
        expect(navigatingShellOf(inner)).toBe(outer)

        const loose = document.createElement('div')
        document.body.appendChild(loose)
        expect(navigatingShellOf(loose)).toBeNull()
        applyAgentEvent(loose, 'navigation-requested', { route: '/orders' })
        applyAgentEvent(loose, 'navigation-requested', { nothing: true })
        expect(navigated).toEqual(['/orders'])
    })

    it('any other event a component on screen DECLARES goes out as a bubbling, composed DOM event', () => {
        const app = shell()
        const heard: unknown[] = []
        const listener = (e: Event) => heard.push((e as CustomEvent).detail)
        document.addEventListener('highlight-row', listener)
        applyAgentEvent(app, 'highlight-row', { id: 6 }) // nobody on screen declares it: dropped
        const release = declareAgentEvent('highlight-row') // a @SubscribeTo on screen
        applyAgentEvent(app, 'highlight-row', { id: 7 })
        release()
        applyAgentEvent(app, 'highlight-row', { id: 8 }) // the subscriber left
        document.removeEventListener('highlight-row', listener)
        expect(heard).toEqual([{ id: 7 }])
        expect(rendered).toEqual([])
        expect(app.updateRoute).not.toHaveBeenCalled()
    })

    it('NM9: the framework\'s own event names never go out, declared or not', () => {
        const app = shell()
        const heard: string[] = []
        const names = ['server-side-action-requested', 'page-banners-received', 'route-changed', 'url-update-requested', 'dirty', 'clean', 'mateu-open-ai']
        const listener = (e: Event) => heard.push(e.type)
        const releases = names.map((n) => { document.addEventListener(n, listener); return declareAgentEvent(n) })
        for (const n of names) applyAgentEvent(app, n, { actionId: 'delete', parameters: {} })
        names.forEach((n, i) => { document.removeEventListener(n, listener); releases[i]() })
        expect(heard).toEqual([])
    })
})
