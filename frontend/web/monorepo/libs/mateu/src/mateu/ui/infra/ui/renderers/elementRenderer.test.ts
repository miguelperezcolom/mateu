// @vitest-environment jsdom
// The subject here IS the DOM: what a custom element receives when the component around it
// re-renders with new state, and whether it survives that re-render as the same node.
import { describe, it, expect, beforeEach } from 'vitest'
import { LitElement } from 'lit'
import { renderElement, remoteOriginOf, moduleUrlFor } from './elementRenderer'
import Element from '@mateu/shared/apiClients/dtos/componentmetadata/Element'
import ClientSideComponent from '@mateu/shared/apiClients/dtos/ClientSideComponent'
import { ComponentState, ComponentData } from '@infra/ui/renderers/types'

// renderElement hydrates the real element inside a setTimeout, after the template has been
// committed — a host with a shadow root and the container div is all it looks at.
// The container div is what renderElement's own template puts in the host's shadow root, one per
// component id — mounted here by hand because the test drives the renderer, not a Lit host.
const host = (...ids: string[]) => {
    const el = document.createElement('div')
    el.attachShadow({ mode: 'open' })
    el.shadowRoot!.innerHTML = ids.map((id) =>
        `<div class="element-container" data-element-id="${id}"></div>`).join('')
    document.body.appendChild(el)
    return el
}

const settle = () => new Promise((resolve) => setTimeout(resolve))

const element = (attributes: Record<string, string>, content = ''): Element =>
    ({ name: 'workflow-graph', attributes, on: {}, content, html: false }) as unknown as Element

const component = (): ClientSideComponent => ({ id: 'diagram' }) as unknown as ClientSideComponent

const render = async (h: HTMLElement, e: Element, state: ComponentState, data: ComponentData = {}) => {
    renderElement(h as unknown as LitElement, e, component(), state, data, {}, {})
    await settle()
    return h.shadowRoot!.querySelector('workflow-graph')!
}

describe('renderElement', () => {

    beforeEach(() => { document.body.innerHTML = '' })

    it('follows the state, so a value that changes without a new component tree reaches the element', async () => {
        // The case this exists for: a view that refreshes itself with a State update. The component
        // tree — and with it the element's attributes — is NOT resent, so an attribute written as a
        // literal is frozen as of the render that built it. Written as an expression it is a value,
        // and the value channel is exactly what a State update carries.
        const h = host('diagram')
        const e = element({ overlay: '${state.overlay}' })

        const first = await render(h, e, { overlay: '{"a":"running"}' })
        expect(first.getAttribute('overlay')).toBe('{"a":"running"}')

        const second = await render(h, e, { overlay: '{"a":"done"}' })
        expect(second.getAttribute('overlay')).toBe('{"a":"done"}')
    })

    it('updates the element in place rather than rebuilding it', async () => {
        // The distinction that decides whether this is a fix or a different bug: a custom element
        // that re-runs its layout on every rebuild would lose the zoom, the selection and the
        // layout an operator is looking at. The node must be the same node, with a new attribute.
        const h = host('diagram')
        const e = element({ overlay: '${state.overlay}' })

        const first = await render(h, e, { overlay: 'one' })
        const second = await render(h, e, { overlay: 'two' })

        expect(second).toBe(first)
        expect(second.getAttribute('overlay')).toBe('two')
    })

    it('M-S7: a data-bound url never becomes a javascript: link, srcdoc and data-bound handlers never pass', async () => {
        const h = host('diagram')
        const e = element({ href: '${state.url}', src: '${state.img}', srcdoc: '<p>x</p>', onclick: 'go(${state.id})',
            title: '${state.title}', 'data-x': 'plain' })
        const el = await render(h, e, { url: 'javascript:alert(1)', img: 'https://cdn.example/a.png', id: '1', title: 'T' })
        expect(el.hasAttribute('href')).toBe(false)
        expect(el.getAttribute('src')).toBe('https://cdn.example/a.png')
        expect(el.hasAttribute('srcdoc')).toBe(false)
        expect(el.hasAttribute('onclick')).toBe(false)
        expect(el.getAttribute('title')).toBe('T')
        expect(el.getAttribute('data-x')).toBe('plain')
    })

    it('leaves a plain attribute alone', async () => {
        const h = host('diagram')
        const e = element({ readonly: 'true', overlay: '${state.overlay}' })

        const el = await render(h, e, { overlay: 'x' })

        expect(el.getAttribute('readonly')).toBe('true')
    })

    it('carries the content the same way', async () => {
        const h = host('diagram')
        const e = element({}, 'status: ${state.status}')

        const el = await render(h, e, { status: 'running' })

        expect(el.textContent).toBe('status: running')
    })

    it('substitutes once, so a value that itself looks like an expression is left as it arrived', async () => {
        // The values that travel this way are payloads — JSON, a template someone else parses.
        // Evaluating the RESULT again would corrupt them, and would evaluate a string the server
        // sent as data. One pass: the expression is the attribute's, never the value's.
        const h = host('diagram')
        const e = element({ overlay: '${state.overlay}' })

        const el = await render(h, e, { overlay: '{"label":"${not.mine}"}' })

        expect(el.getAttribute('overlay')).toBe('{"label":"${not.mine}"}')
    })

    it('keeps a failing expression visible as itself instead of blanking the attribute', async () => {
        const h = host('diagram')
        const e = element({ overlay: '${nope.missing}' })

        const el = await render(h, e, {})

        expect(el.getAttribute('overlay')).toBe('${nope.missing}')
    })

    it('gives each element its own container', async () => {
        // Two elements in one component: both containers carry the same class, so a lookup by class
        // finds the FIRST one for both and the second element's data lands on the wrong node.
        const h = host('a', 'b')

        renderElement(h as unknown as LitElement, element({ overlay: '${state.a}' }),
            { id: 'a' } as unknown as ClientSideComponent, { a: 'left' }, {}, {}, {})
        renderElement(h as unknown as LitElement,
            ({ name: 'other-graph', attributes: { overlay: '${state.b}' }, on: {}, content: '', html: false }) as unknown as Element,
            { id: 'b' } as unknown as ClientSideComponent, { b: 'right' }, {}, {}, {})
        await settle()

        const containers = h.shadowRoot!.querySelectorAll('.element-container')
        expect(containers[0].querySelector('workflow-graph')?.getAttribute('overlay')).toBe('left')
        expect(containers[1].querySelector('other-graph')?.getAttribute('overlay')).toBe('right')
    })
})

describe('a re-render with a different definition', () => {

    beforeEach(() => { document.body.innerHTML = '' })

    // what the element's events reach: the host's manageActionRequestedEvent
    const listeningHost = (...ids: string[]) => {
        const h = host(...ids) as HTMLElement & { manageActionRequestedEvent?: (e: CustomEvent) => void }
        const actions: string[] = []
        h.manageActionRequestedEvent = (e: CustomEvent) => { actions.push(e.detail.actionId) }
        return { h, actions }
    }

    const withOn = (on: Record<string, string>, attributes: Record<string, string> = {}): Element =>
        ({ name: 'workflow-graph', attributes, on, content: '', html: false }) as unknown as Element

    const renderWith = async (h: HTMLElement, e: Element, c: Record<string, unknown> = { id: 'diagram' }) => {
        renderElement(h as unknown as LitElement, e, c as unknown as ClientSideComponent, {}, {}, {}, {})
        await settle()
        return h.shadowRoot!.querySelector('workflow-graph')!
    }

    it('an event runs the action the CURRENT definition names, once, on the same node', async () => {
        const { h, actions } = listeningHost('diagram')
        const first = await renderWith(h, withOn({ click: 'old-action' }))
        const second = await renderWith(h, withOn({ click: 'new-action' }))
        expect(second).toBe(first)
        second.dispatchEvent(new Event('click'))
        expect(actions).toEqual(['new-action'])
    })

    it('an event the definition no longer names runs nothing, and a new one is wired', async () => {
        const { h, actions } = listeningHost('diagram')
        await renderWith(h, withOn({ click: 'select' }))
        const el = await renderWith(h, withOn({ dblclick: 'open' }))
        el.dispatchEvent(new Event('click'))
        el.dispatchEvent(new Event('dblclick'))
        // re-rendering the same definition again does not add a second listener
        await renderWith(h, withOn({ dblclick: 'open' }))
        el.dispatchEvent(new Event('dblclick'))
        expect(actions).toEqual(['open', 'open'])
    })

    it('an attribute gone from the definition is removed', async () => {
        const { h } = listeningHost('diagram')
        const first = await renderWith(h, withOn({}, { disabled: '', title: 'T' }))
        expect(first.hasAttribute('disabled')).toBe(true)
        const second = await renderWith(h, withOn({}, { title: 'T' }))
        expect(second).toBe(first)
        expect(second.hasAttribute('disabled')).toBe(false)
        expect(second.getAttribute('title')).toBe('T')
    })

    it('a data-bound url that turns unsafe is removed rather than left at its old value', async () => {
        const { h } = listeningHost('diagram')
        const e = withOn({}, { href: '${state.url}' })
        renderElement(h as unknown as LitElement, e, { id: 'diagram' } as unknown as ClientSideComponent, { url: 'https://ok.example' }, {}, {}, {})
        await settle()
        renderElement(h as unknown as LitElement, e, { id: 'diagram' } as unknown as ClientSideComponent, { url: 'javascript:alert(1)' }, {}, {}, {})
        await settle()
        expect(h.shadowRoot!.querySelector('workflow-graph')!.hasAttribute('href')).toBe(false)
    })

    it('style, class and slot follow the component, and go when it drops them', async () => {
        const { h } = listeningHost('diagram')
        const el = await renderWith(h, withOn({}), { id: 'diagram', style: 'color: red', cssClasses: 'big', slot: 'side' })
        expect(el.getAttribute('style')).toBe('color: red')
        expect(el.getAttribute('class')).toBe('big')
        expect(el.getAttribute('slot')).toBe('side')
        await renderWith(h, withOn({}), { id: 'diagram' })
        expect(el.hasAttribute('style')).toBe(false)
        expect(el.hasAttribute('class')).toBe(false)
        expect(el.hasAttribute('slot')).toBe(false)
    })

    it("the element's OWN attributes are left alone", async () => {
        // a custom element writes attributes of its own (state reflected for styling, aria-*):
        // only what Mateu wrote is Mateu's to take away
        const { h } = listeningHost('diagram')
        const el = await renderWith(h, withOn({}, { mode: 'edit' }))
        el.setAttribute('aria-busy', 'true')
        el.setAttribute('class', 'upgraded')
        el.setAttribute('style', 'width: 10px')
        await renderWith(h, withOn({}, {}))
        expect(el.hasAttribute('mode')).toBe(false)
        expect(el.getAttribute('aria-busy')).toBe('true')
        expect(el.getAttribute('class')).toBe('upgraded')
        expect(el.getAttribute('style')).toBe('width: 10px')
    })
})

describe('the module of an Element sent by a REMOTE screen', () => {

    // A shell → its remote section's mateu-ux (absolute baseUrl) → a nested component of the
    // remote screen (empty baseUrl of its own) → the element's container.
    const tree = (shellBase: string, remoteBase: string) => {
        const shell = document.createElement('div') as HTMLElement & { baseUrl?: string }
        shell.baseUrl = shellBase
        const remote = document.createElement('div') as HTMLElement & { baseUrl?: string }
        remote.baseUrl = remoteBase
        shell.attachShadow({ mode: 'open' }).appendChild(remote)
        const nested = document.createElement('div') as HTMLElement & { baseUrl?: string }
        nested.baseUrl = ''
        remote.attachShadow({ mode: 'open' }).appendChild(nested)
        const container = document.createElement('div')
        nested.attachShadow({ mode: 'open' }).appendChild(container)
        return container
    }

    it('is loaded from the remote, not from the shell', () => {
        // The EventConductor console's diagram tab, composed into a shell: /eventconductor/... 404'd
        // on the shell and the graph never rendered.
        const origin = remoteOriginOf(tree('', 'http://localhost:8620/_workflow'), 'http://localhost:8621')
        expect(origin).toBe('http://localhost:8620')
        expect(moduleUrlFor('/eventconductor/workflow-graph.js', origin))
            .toBe('http://localhost:8620/eventconductor/workflow-graph.js')
    })

    it("leaves this app's own screens alone", () => {
        // a relative base url (a mount of this same app), and an app whose own backend is absolute
        // (a static front end calling its API): neither is a remote
        expect(remoteOriginOf(tree('', '/_workflow'), 'http://localhost:8621')).toBeUndefined()
        expect(remoteOriginOf(tree('https://api.acme.com', 'https://api.acme.com/_wf'), 'https://cdn.acme.com')).toBeUndefined()
        expect(moduleUrlFor('/x/graph.js', undefined)).toBe('/x/graph.js')
    })

    it('keeps absolute, protocol-relative and relative module urls as written', () => {
        expect(moduleUrlFor('https://cdn.acme.com/graph.js', 'http://localhost:8620')).toBe('https://cdn.acme.com/graph.js')
        expect(moduleUrlFor('//cdn.acme.com/graph.js', 'http://localhost:8620')).toBe('//cdn.acme.com/graph.js')
        expect(moduleUrlFor('graph.js', 'http://localhost:8620')).toBe('graph.js')
    })
})
