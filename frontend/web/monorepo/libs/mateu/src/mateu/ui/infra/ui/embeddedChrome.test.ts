// @vitest-environment jsdom
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * A micro frontend EMBEDDED in a page (`MicroFrontend.chrome`) is a block of that page: the window
 * (title, address bar, favicon) stays the host's — in ec-demo1 the remote's title won over the host
 * page's «Herramientas» on every load —, it draws no breadcrumb of its own, its page header is
 * hidden (NONE), reduced to its actions (COMPACT) or kept (PAGE), and every request it sends says
 * so (`embeddedChrome`).
 */

const mocks = vi.hoisted(() => ({
    httpRun: vi.fn(),
    sseRun: vi.fn(),
}))
vi.mock('@application/service', () => ({ service: { runAction: mocks.httpRun } }))
vi.mock('@application/SSEService.ts', () => ({ sseService: { runAction: mocks.sseRun } }))

import './mateu-ux'
import './mateu-content-header'
import type { MateuUx } from './mateu-ux'
import type { MateuContentHeader } from './mateu-content-header'
import ConnectedElement from './ConnectedElement'
import UICommand from '@mateu/shared/apiClients/dtos/UICommand'
import UIFragment from '@mateu/shared/apiClients/dtos/UIFragment'
import { componentRenderer, ComponentRenderer } from './renderers/ComponentRenderer'
import { BasicComponentRenderer } from './renderers/BasicComponentRenderer'
import { ComponentMetadataType } from '@mateu/shared/apiClients/dtos/ComponentMetadataType'
import { renderMicroFrontend } from './renderers/microFrontendRenderer'
import { render } from 'lit'
import { publishShellMenu } from './breadcrumbTrail'
import { chromeOf, embeddingChromeOf, isInsideMicroFrontend, isSuppressedWindowCommand, ownEmbeddedChromeOf } from './embeddedChrome'
import { resetWindowTitleForTests } from './windowTitle'

class TestRenderer extends BasicComponentRenderer {}
beforeAll(() => componentRenderer.set(new TestRenderer() as unknown as ComponentRenderer))
afterAll(() => componentRenderer.set({} as ComponentRenderer))

class TestConnected extends ConnectedElement {
    applyFragment(_fragment: UIFragment) {}
    manageActionRequestedEvent(_event: CustomEvent) {}
}
customElements.define('test-embedded-connected', TestConnected)

const cmd = (type: string, data?: unknown) => ({ type, data } as unknown as UICommand)

/** A tree of plain elements shaped like the real one, without loading anything. */
const tree = (chrome?: string) => {
    const host = document.createElement('section')
    host.setAttribute('data-role', 'host-page')
    // the helpers look for MATEU-UX by tag name: a stand-in that loads nothing
    const fake = document.createElement('div')
    Object.defineProperty(fake, 'tagName', { value: 'MATEU-UX' })
    if (chrome) fake.setAttribute('embedded-chrome', chrome)
    const shadow = fake.attachShadow({ mode: 'open' })
    const inner = document.createElement('test-embedded-connected') as TestConnected
    shadow.appendChild(inner)
    host.appendChild(fake)
    document.body.appendChild(host)
    return { host, embed: fake, inner }
}

beforeEach(() => {
    document.title = 'Herramientas'
    resetWindowTitleForTests()
    mocks.httpRun.mockReset()
    mocks.sseRun.mockReset()
})
afterEach(() => {
    document.body.innerHTML = ''
    document.head.querySelectorAll('link[rel="icon"]').forEach((n) => n.remove())
    resetWindowTitleForTests()
})

describe('the chrome and where it applies', () => {
    it('reads only the three chromes the wire defines', () => {
        expect(chromeOf('NONE')).toBe('NONE')
        expect(chromeOf('compact')).toBe('COMPACT')
        expect(chromeOf('PAGE')).toBe('PAGE')
        expect(chromeOf('')).toBeUndefined()
        expect(chromeOf('FULL')).toBeUndefined()
        expect(chromeOf(undefined)).toBeUndefined()
    })

    it('anything inside an embed — through shadow roots — is embedded; outside it nothing is', () => {
        const { host, inner, embed } = tree('COMPACT')
        expect(embeddingChromeOf(inner)).toBe('COMPACT')
        expect(embeddingChromeOf(embed)).toBe('COMPACT')
        expect(embeddingChromeOf(host)).toBeUndefined()
        expect(ownEmbeddedChromeOf(inner)).toBe('COMPACT')
        expect(isSuppressedWindowCommand('SetWindowTitle', inner)).toBe(true)
        expect(isSuppressedWindowCommand('DispatchEvent', inner)).toBe(false)
        expect(isSuppressedWindowCommand('SetWindowTitle', host)).toBe(false)
    })

    it('a micro frontend without chrome is top-level, as it always was', () => {
        const { inner } = tree()
        expect(embeddingChromeOf(inner)).toBeUndefined()
        expect(isSuppressedWindowCommand('SetWindowTitle', inner)).toBe(false)
    })
})

describe('the window stays the host page\'s', () => {
    it('the host names the window, and an embedded island\'s title, favicon and history push are not applied', () => {
        const { host, inner } = tree('NONE')
        const hostEl = document.createElement('test-embedded-connected') as TestConnected
        host.appendChild(hostEl)
        // the host page's own load
        hostEl.applyCommand(cmd('SetWindowTitle', 'Herramientas'))
        expect(document.title).toBe('Herramientas')

        const pushed: string[] = []
        document.addEventListener('route-changed', (e) => pushed.push((e as CustomEvent).detail.route))
        // the island's answer, from an older remote that still sends the window commands
        inner.applyCommand(cmd('SetWindowTitle', 'Remote tools'))
        inner.applyCommand(cmd('SetFavicon', '/remote.png'))
        inner.applyCommand(cmd('PushStateToHistory', '/remote-tools/somewhere'))

        expect(document.title).toBe('Herramientas')
        expect(document.querySelector('link[rel="icon"]')).toBeNull()
        expect(pushed).toEqual([])
    })

    it('without chrome the island still names the window (the behaviour it always had)', () => {
        const { inner } = tree()
        inner.applyCommand(cmd('SetWindowTitle', 'Remote tools'))
        expect(document.title).toBe('Remote tools')
    })

    it('every chrome keeps the window: NONE, COMPACT and PAGE alike', () => {
        for (const chrome of ['NONE', 'COMPACT', 'PAGE']) {
            document.body.innerHTML = ''
            document.title = 'Herramientas'
            const { inner } = tree(chrome)
            inner.applyCommand(cmd('SetWindowTitle', 'Remote ' + chrome))
            expect(document.title, chrome).toBe('Herramientas')
        }
    })
})

describe('the island\'s mateu-ux', () => {
    const mountUx = async (chrome?: string) => {
        const el = document.createElement('mateu-ux') as MateuUx
        el.id = 'mfe_x'
        el.setAttribute('baseurl', '/remote')
        el.setAttribute('route', '/remote-tools')
        if (chrome) el.setAttribute('embedded-chrome', chrome)
        document.body.appendChild(el)
        await el.updateComplete
        for (let i = 0; i < 5; i++) await new Promise((r) => setTimeout(r, 0))
        return el
    }
    const optionsOf = (n = 0) => (mocks.httpRun.mock.calls[n] as unknown[])[15] as Record<string, unknown>

    it('marks its load with the chrome, and never claims a structure it may no longer show', async () => {
        await mountUx('NONE')
        expect(mocks.httpRun).toHaveBeenCalled()
        expect(optionsOf()).toMatchObject({ embeddedChrome: 'NONE', knownStructureHash: undefined })
    })

    it('marks the actions of the content below it too', async () => {
        const el = await mountUx('PAGE')
        mocks.httpRun.mockClear()
        const child = document.createElement('div')
        el.appendChild(child)
        child.dispatchEvent(new CustomEvent('server-side-action-requested', {
            detail: { route: '/remote-tools', consumedRoute: '', actionId: 'rename', serverSideType: 'x',
                initiatorComponentId: 'c1', initiator: child, componentState: {}, parameters: {} },
            bubbles: true, composed: true,
        }))
        expect(optionsOf()).toMatchObject({ embeddedChrome: 'PAGE' })
    })

    it('a top-level one sends no marker', async () => {
        await mountUx()
        expect(optionsOf().embeddedChrome).toBeUndefined()
    })

    it('a move inside it does not reach the address bar', async () => {
        const el = await mountUx('COMPACT')
        const seen: string[] = []
        document.addEventListener('url-update-requested', (e) => seen.push((e as CustomEvent).detail.route))
        const child = document.createElement('div')
        el.appendChild(child)
        child.dispatchEvent(new CustomEvent('route-changed', { detail: { route: '/remote-tools/1' }, bubbles: true, composed: true }))
        expect(seen).toEqual([])
    })

    it('the micro frontend renderer puts the wire chrome on the ux, and nothing without it', () => {
        const container = document.createElement('div')
        document.body.appendChild(container)
        const component = (chrome?: string) => ({ type: 'ClientSide', id: 'm', children: [],
            metadata: { type: 'MicroFrontend', baseUrl: '/remote', route: '/r', consumedRoute: '', serverSideType: '',
                appState: {}, actionId: '', style: '', cssClasses: '', ...(chrome ? { chrome } : {}) } }) as never
        render(renderMicroFrontend(component('COMPACT')), container)
        expect(container.querySelector('mateu-ux')?.getAttribute('embedded-chrome')).toBe('COMPACT')
        render(renderMicroFrontend(component()), container)
        expect(container.querySelector('mateu-ux')?.hasAttribute('embedded-chrome')).toBe(false)
    })
})

describe('the embedded page\'s header', () => {
    const header = async (chrome: string | undefined, metadata: Record<string, unknown>) => {
        const { embed } = tree(chrome)
        const el = document.createElement('mateu-content-header') as MateuContentHeader & Record<string, any>
        el.metadata = { type: ComponentMetadataType.Page, ...metadata } as never
        el.state = {}
        el.data = {}
        embed.shadowRoot!.appendChild(el)
        await el.updateComplete
        await el.updateComplete
        return el.shadowRoot as ShadowRoot
    }
    const page = {
        title: 'Remote tools', subtitle: 'all of them', route: '/remote-tools',
        toolbar: [{ id: 'go', actionId: 'go', label: 'Go' }],
        breadcrumbs: [{ text: 'Home', link: '/' }, { text: 'Remote tools' }],
    }

    it('top-level, the header has its title, actions and trail', async () => {
        const root = await header(undefined, page)
        expect(root.querySelector('h2')?.textContent).toContain('Remote tools')
        expect(root.textContent).toContain('Go')
        expect(root.querySelector('.breadcrumbs-bar')).not.toBeNull()
    })

    it('NONE: no header at all', async () => {
        const root = await header('NONE', page)
        expect(root.querySelector('h2')).toBeNull()
        expect(root.textContent).not.toContain('Go')
        expect(root.querySelector('.breadcrumbs-bar')).toBeNull()
    })

    it('COMPACT: only the actions', async () => {
        const root = await header('COMPACT', page)
        expect(root.querySelector('h2')).toBeNull()
        expect(root.textContent).not.toContain('all of them')
        expect(root.textContent).toContain('Go')
        expect(root.querySelector('.breadcrumbs-bar')).toBeNull()
    })

    it('PAGE: the title and actions, without a trail — not even the automatic one from the host\'s menu', async () => {
        // the host's address and menu: a top-level page there gets the automatic trail…
        history.replaceState(null, '', '/intranet/herramientas')
        const shell = { isConnected: true }
        publishShellMenu(shell, [
            { label: 'Intranet', submenus: [{ label: 'Herramientas', route: '/intranet/herramientas' }] },
        ] as never, false)
        try {
            const top = await header(undefined, { ...page, breadcrumbs: [] })
            expect(top.querySelector('.breadcrumbs-bar')?.textContent).toContain('Intranet')
            // …an embedded one does not
            const root = await header('PAGE', { ...page, breadcrumbs: [] })
            expect(root.querySelector('h2')?.textContent).toContain('Remote tools')
            expect(root.textContent).toContain('Go')
            expect(root.querySelector('.breadcrumbs-bar')).toBeNull()
        } finally {
            publishShellMenu(shell, undefined, false)
            shell.isConnected = false // gone: the next test's shell may publish its menu
            history.replaceState(null, '', '/')
        }
        const declared = await header('PAGE', page)
        expect(declared.querySelector('.breadcrumbs-bar')).toBeNull()
    })

    it('a REMOTE page in an island with the DEFAULT chrome draws no trail of the host either', async () => {
        // found building the Mateu Explorer: the host's breadcrumb showed inside the embedded remote page
        history.replaceState(null, '', '/extranet/almacen')
        const shell = { isConnected: true }
        publishShellMenu(shell, [
            { label: 'Extranet', submenus: [{ label: 'Almacen', route: '/extranet/almacen' }] },
        ] as never, false)
        try {
            const headerIn = async (island: boolean) => {
                const { embed } = tree(undefined)
                if (island) embed.setAttribute('micro-frontend', '')
                const el = document.createElement('mateu-content-header') as MateuContentHeader & Record<string, any>
                el.metadata = { type: ComponentMetadataType.Page, ...page, breadcrumbs: [] } as never
                el.state = {}
                el.data = {}
                embed.shadowRoot!.appendChild(el)
                await el.updateComplete
                await el.updateComplete
                return el.shadowRoot as ShadowRoot
            }
            // the same page outside an island gets the host's automatic trail…
            expect((await headerIn(false)).querySelector('.breadcrumbs-bar')?.textContent).toContain('Extranet')
            // …inside one, with no chrome declared, it does not
            const root = await headerIn(true)
            expect(root.querySelector('h2')?.textContent).toContain('Remote tools')
            expect(root.querySelector('.breadcrumbs-bar')).toBeNull()
        } finally {
            publishShellMenu(shell, undefined, false)
            history.replaceState(null, '', '/')
        }
    })

    it('the micro frontend renderer marks every island, whatever its chrome', () => {
        const container = document.createElement('div')
        document.body.appendChild(container)
        render(renderMicroFrontend({ type: 'ClientSide', id: 'm', children: [],
            metadata: { type: 'MicroFrontend', baseUrl: '/remote', route: '/r', consumedRoute: '', serverSideType: '',
                appState: {}, actionId: '', style: '', cssClasses: '' } } as never), container)
        expect(container.querySelector('mateu-ux')?.hasAttribute('micro-frontend')).toBe(true)
        expect(container.querySelector('mateu-api-caller')?.hasAttribute('inline-failures')).toBe(true)
        expect(isInsideMicroFrontend(container.querySelector('mateu-ux'))).toBe(true)
        expect(isInsideMicroFrontend(container)).toBe(false)
    })
})
