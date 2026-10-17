// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import ComponentElement from './ComponentElement'
import { upstream } from '@domain/state'
import { componentRenderer } from './renderers/ComponentRenderer'
import { resetAnnouncer } from '@infra/a11y/announcer'
import { headerValuesList, resetHeaderValues } from './headerValues'
import { ComponentType } from '@mateu/shared/apiClients/dtos/ComponentType'
import { ComponentMetadataType } from '@mateu/shared/apiClients/dtos/ComponentMetadataType'
import { UIFragmentAction } from '@mateu/shared/apiClients/dtos/UIFragmentAction'
import { TriggerType } from '@mateu/shared/apiClients/dtos/componentmetadata/TriggerType'

/**
 * The fragment and overlay mechanics every component inherits: what an Add / Replace fragment does
 * to the component tree on screen, how an overlay dismisses itself through its owner, and how the
 * upstream bus reaches the component a message is addressed to.
 */
class TestComponent extends ComponentElement {
    requested: string[] = []
    manageActionRequestedEvent(e: CustomEvent) { this.requested.push(e.detail.actionId) }
    dismiss() { return this.removeSelfFromOwnerChildren() }
}
customElements.define('test-component-element', TestComponent)

const make = (id = 'host') => {
    const el = document.createElement('test-component-element') as TestComponent
    el.id = id
    return el
}

const drawer = (id: string) => ({ id, type: ComponentType.ClientSide, metadata: { type: ComponentMetadataType.Drawer } }) as any
const text = (id: string) => ({ id, type: ComponentType.ClientSide, metadata: { type: ComponentMetadataType.Text, text: id } }) as any
const serverSide = (serverSideType: string, over: Record<string, unknown> = {}) =>
    ({ id: crypto.randomUUID(), type: ComponentType.ServerSide, serverSideType, children: [], ...over }) as any

afterEach(() => {
    document.body.innerHTML = ''
    componentRenderer.setAfterRenderHook(undefined)
    resetHeaderValues()
    resetAnnouncer()
    vi.useRealTimers()
    vi.restoreAllMocks()
})

describe('Add fragments', () => {
    it('stack an overlay on the component; an Add with the id of an open overlay refreshes it in place', () => {
        const el = make()
        el.component = serverSide('x.Page', { children: [text('body')] })
        el.applyFragment({ targetComponentId: 'host', action: UIFragmentAction.Add, component: drawer('pay') } as any)
        expect(el.component!.children!.map(c => c.id)).toEqual(['body', 'pay'])

        const refreshed = { ...drawer('pay'), metadata: { type: ComponentMetadataType.Drawer, headerTitle: 'Card' } }
        el.applyFragment({ targetComponentId: 'host', action: UIFragmentAction.Add, component: refreshed } as any)
        expect(el.component!.children).toHaveLength(2)
        expect(el.component!.children![1]).toBe(refreshed)
    })
})

describe('Replace fragments', () => {
    it('re-rendering the same view in place keeps its open overlays', () => {
        const el = make()
        el.component = serverSide('x.Page', { children: [text('old'), drawer('d')] })
        el.applyFragment({ targetComponentId: 'host', action: UIFragmentAction.Replace,
            component: serverSide('x.Page', { children: [text('new')], actions: [{ id: 'save' }] }) } as any)
        expect(el.component!.children!.map(c => c.id)).toEqual(['new', 'd'])
        expect((el.component as any).actions).toEqual([{ id: 'save' }])
    })

    it('a different view drops the overlays and fires its OnLoad triggers', () => {
        vi.useFakeTimers()
        const el = make()
        document.body.appendChild(el)
        el.component = serverSide('x.Page', { children: [drawer('d')] })
        el.applyFragment({ targetComponentId: 'host', action: UIFragmentAction.Replace,
            component: serverSide('x.Other', { triggers: [{ type: TriggerType.OnLoad, actionId: 'load', times: 1 }] }) } as any)
        expect(el.component!.children).toEqual([])
        vi.advanceTimersByTime(0)
        expect(el.requested).toEqual(['load'])
    })

    it('the first component to arrive is adopted, and its OnLoad runs', () => {
        vi.useFakeTimers()
        const el = make()
        document.body.appendChild(el)
        const first = serverSide('x.Page', { triggers: [{ type: TriggerType.OnLoad, actionId: 'load', times: 1 }] })
        el.applyFragment({ targetComponentId: 'host', action: UIFragmentAction.Replace, component: first } as any)
        expect(el.component).toBe(first)
        vi.advanceTimersByTime(0)
        expect(el.requested).toEqual(['load'])
    })

    it('a client-side component becomes the only child', () => {
        const el = make()
        el.component = serverSide('x.Page', { children: [text('a'), text('b')] })
        el.applyFragment({ targetComponentId: 'host', action: UIFragmentAction.Replace, component: text('c') } as any)
        expect(el.component!.children!.map(c => c.id)).toEqual(['c'])
    })

    it('runs the renderer after-render hook once the fragment is applied', () => {
        vi.useFakeTimers()
        const hook = vi.fn()
        componentRenderer.setAfterRenderHook(hook)
        const el = make()
        el.applyFragment({ targetComponentId: 'host', data: { rows: [1] } } as any)
        expect(el.data).toEqual({ rows: [1] })
        vi.advanceTimersByTime(0)
        expect(hook).toHaveBeenCalledWith(el)
    })
})

describe('a timed OnLoad (a poll)', () => {
    it('fires after its delay, and not for a component that has since been replaced', () => {
        vi.useFakeTimers()
        const el = make('p1')
        document.body.appendChild(el)
        el.component = serverSide('x.Status', { id: 'p1', triggers: [{ type: TriggerType.OnLoad, actionId: 'poll', timeoutMillis: 500, times: 2 }] })
        el.triggerOnLoad()
        vi.advanceTimersByTime(500)
        expect(el.requested).toEqual(['poll'])

        el.scheduleOnload({ actionId: 'poll', timeoutMillis: 500 } as any)
        el.component = serverSide('x.SomethingElse', { id: 'p1' })
        vi.advanceTimersByTime(500)
        expect(el.requested).toEqual(['poll'])
        el.remove()
    })
})

describe('an overlay dismissing itself', () => {
    it('splices its component out of the owner children (matched by id, across a shadow root) and re-renders the owner', () => {
        const owner = document.createElement('div') as HTMLDivElement & { component?: any, requestUpdate?: () => void }
        const own = drawer('d1')
        owner.component = { children: [text('body'), own] }
        owner.requestUpdate = vi.fn()
        const shadow = owner.attachShadow({ mode: 'open' })
        document.body.appendChild(owner)

        const overlay = make('d1')
        // renderClientSideComponent hands the renderer a shallow copy
        overlay.component = { ...own }
        shadow.appendChild(overlay)

        expect(overlay.dismiss()).toBe(true)
        expect(owner.component.children.map((c: any) => c.id)).toEqual(['body'])
        expect(owner.requestUpdate).toHaveBeenCalled()
    })

    it('never splices a non-overlay sibling that happens to share the id', () => {
        const owner = document.createElement('div') as HTMLDivElement & { component?: any }
        owner.component = { children: [text('d1')] }
        document.body.appendChild(owner)
        const overlay = make('d1')
        overlay.component = drawer('d1')
        owner.appendChild(overlay)
        expect(overlay.dismiss()).toBe(false)
        expect(owner.component.children).toHaveLength(1)
    })
})

describe('the upstream bus', () => {
    it('applies the commands and fragments addressed to this component only', () => {
        const el = make('target')
        document.body.appendChild(el)
        upstream.next({ command: { type: 'SetWindowTitle', data: 'Mine', targetComponentId: 'target' } } as any)
        upstream.next({ command: { type: 'SetWindowTitle', data: 'Theirs', targetComponentId: 'other' } } as any)
        expect(document.title).toBe('Mine')

        upstream.next({ fragment: { targetComponentId: 'target', state: { a: 1 } }, callbackToken: '' } as any)
        upstream.next({ fragment: { targetComponentId: 'other', state: { b: 1 } }, callbackToken: '' } as any)
        expect(el.state).toEqual({ a: 1 })

        el.remove()
        upstream.next({ fragment: { targetComponentId: 'target', state: { c: 1 } }, callbackToken: '' } as any)
        expect(el.state).toEqual({ a: 1 })
    })

    it('an Announce command says it to screen readers; UpdateHeaderValue sets the live header value', () => {
        const el = make()
        el.applyCommand({ type: 'Announce', data: { text: 'Booking cancelled', assertive: true } } as any)
        expect(document.querySelector('[data-mateu-live-region="assertive"]')?.textContent).toBe('Booking cancelled')
        el.applyCommand({ type: 'UpdateHeaderValue', data: { id: 'businessDate', value: '2026-10-17' } } as any)
        expect(headerValuesList()).toEqual([expect.objectContaining({ id: 'businessDate', value: '2026-10-17' })])
    })

    it('a RunAction aimed at another component travels the bus to it', () => {
        vi.useFakeTimers()
        const sender = make('sender')
        const receiver = make('receiver')
        document.body.append(sender, receiver)
        sender.applyCommand({ type: 'RunAction', data: { actionId: 'refresh', targetComponentId: 'receiver' } } as any)
        vi.advanceTimersByTime(0)
        // the receiver turns it into its own action
        expect(sender.requested).toEqual([])
        expect(receiver.requested).toEqual(['refresh'])
    })
})
