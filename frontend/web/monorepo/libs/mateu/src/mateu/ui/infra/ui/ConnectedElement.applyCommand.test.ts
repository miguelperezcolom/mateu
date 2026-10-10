// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ConnectedElement from './ConnectedElement'
import UICommand from '@mateu/shared/apiClients/dtos/UICommand'
import UIFragment from '@mateu/shared/apiClients/dtos/UIFragment'

/** The smallest concrete ConnectedElement: records what applyCommand asks of it. */
class TestConnected extends ConnectedElement {
    actions: CustomEvent[] = []
    component: { emitsName?: string, serverSideType?: string } | undefined
    applyFragment(_fragment: UIFragment) {}
    manageActionRequestedEvent(event: CustomEvent) { this.actions.push(event) }
}
customElements.define('test-connected', TestConnected)

const cmd = (type: string, data?: unknown) => ({ type, data } as unknown as UICommand)

let el: TestConnected
const events: CustomEvent[] = []
const record = (e: Event) => events.push(e as CustomEvent)

beforeEach(() => {
    el = document.createElement('test-connected') as TestConnected
    document.body.appendChild(el)
    events.length = 0
    for (const name of ['route-changed', 'dirty', 'clean', 'saved', 'close-modal-requested']) document.addEventListener(name, record)
})
afterEach(() => {
    for (const name of ['route-changed', 'dirty', 'clean', 'saved', 'close-modal-requested']) document.removeEventListener(name, record)
    document.body.innerHTML = ''
    document.head.querySelectorAll('[data-test]').forEach((n) => n.remove())
    vi.restoreAllMocks()
})

describe('ConnectedElement.applyCommand', () => {
    it('SetWindowTitle sets the document title', () => {
        el.applyCommand(cmd('SetWindowTitle', 'Orders'))
        expect(document.title).toBe('Orders')
    })

    it('SetFavicon updates or creates the icon link', () => {
        el.applyCommand(cmd('SetFavicon', '/a.svg'))
        expect(document.querySelector('link[rel="icon"]')?.getAttribute('href')).toBe('/a.svg')
        el.applyCommand(cmd('SetFavicon', '/b.svg'))
        expect(document.querySelectorAll('link[rel="icon"]')).toHaveLength(1)
        expect(document.querySelector('link[rel="icon"]')?.getAttribute('href')).toBe('/b.svg')
    })

    it('NavigateTo never runs a javascript: URL', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        const before = window.location.href
        el.applyCommand(cmd('NavigateTo', 'javascript:document.title="pwned"'))
        expect(document.title).not.toBe('pwned')
        expect(window.location.href).toBe(before)
        expect(warn).toHaveBeenCalled()
    })

    it('NavigateTo opens a cross-origin URL in a new tab without an opener', () => {
        const open = vi.spyOn(window, 'open').mockImplementation(() => null)
        el.applyCommand(cmd('NavigateTo', 'https://other.example/x'))
        expect(open).toHaveBeenCalledWith('https://other.example/x', '_blank', 'noopener,noreferrer')
    })

    it('PushStateToHistory, MarkAsDirty and MarkAsClean emit the shell events', () => {
        el.applyCommand(cmd('PushStateToHistory', '/orders/1'))
        el.applyCommand(cmd('MarkAsDirty'))
        el.applyCommand(cmd('MarkAsClean'))
        expect(events.map((e) => e.type)).toEqual(['route-changed', 'dirty', 'clean'])
        expect(events[0].detail).toEqual({ route: '/orders/1' })
    })

    it('DispatchEvent stamps the emitter name on object payloads only', () => {
        el.component = { emitsName: 'guests-section', serverSideType: 'x.Guests' }
        el.applyCommand(cmd('DispatchEvent', { eventName: 'saved', payload: { id: 7 } }))
        el.applyCommand(cmd('DispatchEvent', { eventName: 'saved', payload: 'plain' }))
        expect(events[0].detail).toEqual({ id: 7, __source: 'guests-section' })
        expect(events[1].detail).toBe('plain')
    })

    it('RunAction without a target runs the action on this component', () => {
        el.applyCommand(cmd('RunAction', { actionId: 'search' }))
        expect(el.actions.map((a) => a.detail.actionId)).toEqual(['search'])
    })

    it('CloseModal with no overlay of its own asks the owner, and emits the named result', () => {
        el.applyCommand(cmd('CloseModal', { eventName: 'saved', payload: { ok: true } }))
        expect(events.map((e) => e.type)).toEqual(['close-modal-requested', 'saved'])
    })

    it('CloseModal closes the topmost overlay in its own root', () => {
        const root = el.shadowRoot!
        const first = document.createElement('mateu-dialog') as unknown as { close: () => void }
        const second = document.createElement('mateu-drawer') as unknown as { close: () => void }
        first.close = vi.fn()
        second.close = vi.fn()
        root.append(first as unknown as Node, second as unknown as Node)
        el.applyCommand(cmd('CloseModal'))
        expect(second.close).toHaveBeenCalledTimes(1)
        expect(first.close).not.toHaveBeenCalled()
    })

    it('AddContentToBody wires listeners that stop calling back once the component is gone', () => {
        el.applyCommand(cmd('AddContentToBody', { name: 'div', attributes: { id: 'injected', 'data-test': '1' }, on: { click: 'clicked' } }))
        const injected = document.getElementById('injected')!
        injected.click()
        expect(el.actions.map((a) => a.detail.actionId)).toEqual(['clicked'])
        el.remove()
        injected.click()
        expect(el.actions).toHaveLength(1)
        // and it is not appended twice
        el.applyCommand(cmd('AddContentToBody', { name: 'div', attributes: { id: 'injected' } }))
        expect(document.querySelectorAll('#injected')).toHaveLength(1)
    })

    it('AddContentToHead appends once per id', () => {
        el.applyCommand(cmd('AddContentToHead', { name: 'meta', attributes: { id: 'm1', 'data-test': '1', name: 'x' } }))
        el.applyCommand(cmd('AddContentToHead', { name: 'meta', attributes: { id: 'm1', 'data-test': '1', name: 'x' } }))
        expect(document.head.querySelectorAll('#m1')).toHaveLength(1)
    })

    it('DownloadFile turns base64 content into a downloaded blob', () => {
        const createObjectURL = vi.fn(() => 'blob:x')
        const revokeObjectURL = vi.fn()
        Object.assign(URL, { createObjectURL, revokeObjectURL })
        const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
        el.applyCommand(cmd('DownloadFile', { filename: 'a.txt', mimeType: 'text/plain', base64Content: btoa('hello') }))
        expect(createObjectURL).toHaveBeenCalledTimes(1)
        expect(click).toHaveBeenCalledTimes(1)
        expect(revokeObjectURL).toHaveBeenCalledWith('blob:x')
    })
})
