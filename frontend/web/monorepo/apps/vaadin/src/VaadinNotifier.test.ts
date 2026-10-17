// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// vaadin-notification renders into an overlay jsdom cannot lay out; a stand-in records what the
// adapter asks of it (the subject here is the adapter, not Vaadin's overlay).
const shown: { text: string, options: Record<string, unknown> }[] = []
vi.mock('@vaadin/notification', () => {
    class Notification extends HTMLElement {
        position = ''
        duration = 0
        opened = false
        renderer: ((root: HTMLElement) => void) | undefined
        static show(text: string, options: Record<string, unknown>) { shown.push({ text, options }) }
    }
    if (!customElements.get('fake-vaadin-notification')) customElements.define('fake-vaadin-notification', Notification)
    return { Notification }
})
const announce = vi.fn()
vi.mock('@infra/a11y/announcer.ts', () => ({ announce: (...a: unknown[]) => announce(...a) }))

import { themeOf, vaadinNotifier } from './VaadinNotifier'

/**
 * The Vaadin toast adapter. vaadin-notification's overlay is NOT a live region, so the adapter
 * announces every toast itself (errors assertively); a toast with a Retry/Undo control is drawn by
 * hand so the control works and dismisses the toast.
 */
describe('vaadinNotifier', () => {
    beforeEach(() => { shown.length = 0; announce.mockReset() })
    afterEach(() => { document.body.innerHTML = '' })

    it('announces an error assertively and anything else politely', () => {
        vaadinNotifier.show({ text: 'Save failed', variant: 'error' } as never, document.body)
        vaadinNotifier.show({ text: 'Saved', variant: 'success' } as never, document.body)
        expect(announce.mock.calls).toEqual([
            ['Save failed', { politeness: 'assertive' }],
            ['Saved', { politeness: 'polite' }],
        ])
    })

    it('a plain toast goes through Notification.show with the mapped position and theme', () => {
        vaadinNotifier.show({ text: 'Hi', variant: 'success', position: 'topCenter', duration: 3000 } as never, document.body)
        vaadinNotifier.show({ text: 'Default' } as never, document.body)
        expect(shown).toEqual([
            { text: 'Hi', options: { position: 'top-center', theme: 'success', duration: 3000 } },
            { text: 'Default', options: { position: 'bottom-end', theme: undefined, duration: undefined } },
        ])
    })

    it('an info toast takes the accent theme (Lumo has no info theme)', () => {
        vaadinNotifier.show({ text: 'FYI', variant: 'info' } as never, document.body)
        expect(shown.at(-1)).toEqual({ text: 'FYI', options: { position: 'bottom-end', theme: 'primary', duration: undefined } })
        expect(themeOf('success')).toBe('success')
        expect(themeOf(undefined)).toBeUndefined()
    })

    const drawn = () => {
        const n = document.body.querySelector('fake-vaadin-notification') as HTMLElement & {
            renderer: (root: HTMLElement) => void, opened: boolean, duration: number, position: string }
        const root = document.createElement('div')
        n.renderer(root)
        return { n, root }
    }

    it('Retry: the control runs the closure once and closes the toast; a non-error stays up 10s by default', () => {
        const retry = vi.fn()
        vaadinNotifier.show({ text: 'Request failed', variant: 'warning', onAction: retry, position: 'bottomStart' } as never, document.body)
        const { n, root } = drawn()
        expect(n.opened).toBe(true)
        expect(n.duration).toBe(10000)
        expect(n.position).toBe('bottom-start')
        expect(n.getAttribute('theme')).toBe('warning')
        const button = root.querySelector('button')!
        expect(button.textContent).toBe('Retry')
        expect(root.textContent).toContain('Request failed')
        button.click()
        expect(retry).toHaveBeenCalledTimes(1)
        expect(n.opened).toBe(false)
        expect(shown).toEqual([])
    })

    it('an error stays until dismissed, whatever duration it arrived with, and ✕ dismisses it', () => {
        // owner, 2026-10-12: read in three seconds and gone, the reason a save failed was often never seen
        vaadinNotifier.show({ text: 'Save failed', variant: 'error', duration: 3000, onAction: () => {} } as never, document.body)
        const { n, root } = drawn()
        expect(n.duration).toBe(0)
        expect(n.getAttribute('theme')).toBe('error')
        const buttons = [...root.querySelectorAll('button')].map(b => b.textContent)
        expect(buttons).toEqual(['Retry', '✕'])
        root.querySelectorAll('button')[1].click()
        expect(n.opened).toBe(false)
    })

    it('the renderer does not draw twice into the same root', () => {
        vaadinNotifier.show({ text: 'x', onAction: () => {} } as never, document.body)
        const { n, root } = drawn()
        n.renderer(root)
        expect(root.querySelectorAll('button')).toHaveLength(1)
    })

    it('Undo dispatches the server action on the initiator', () => {
        const initiator = document.createElement('div')
        document.body.appendChild(initiator)
        const seen: unknown[] = []
        initiator.addEventListener('action-requested', (e) => seen.push((e as CustomEvent).detail))
        vaadinNotifier.show({ text: 'Deleted', undoActionId: 'restore', undoParameters: { id: 3 }, undoLabel: 'Deshacer' } as never, initiator)
        const { root } = drawn()
        const button = root.querySelector('button')!
        expect(button.textContent).toBe('Deshacer')
        button.click()
        // serverNamed: the server named the action in its answer, so the component runs it even
        // though it never advertised it (mateu-component)
        expect(seen).toEqual([{ actionId: 'restore', parameters: { id: 3 }, serverNamed: true }])
    })

    it('closing the toast removes it from the document', () => {
        vaadinNotifier.show({ text: 'x', onAction: () => {} } as never, document.body)
        const { n } = drawn()
        n.dispatchEvent(new CustomEvent('opened-changed', { detail: { value: false } }))
        expect(n.isConnected).toBe(false)
    })
})
