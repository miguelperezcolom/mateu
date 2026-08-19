// @vitest-environment jsdom
// The subject here IS the DOM: what a custom element receives when the component around it
// re-renders with new state, and whether it survives that re-render as the same node.
import { describe, it, expect, beforeEach } from 'vitest'
import { LitElement } from 'lit'
import { renderElement } from './elementRenderer'
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
