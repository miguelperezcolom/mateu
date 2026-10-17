// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { neutralNotifier, registerNeutralNotifier } from './neutralNotifier'
import { notify } from '@application/Notifier.ts'

/**
 * The default toast every renderer without its own notifier uses. What matters to a user: an error
 * interrupts the screen reader (alert/assertive), anything else waits (status/polite); a Retry
 * control runs the closure it was given; an Undo control dispatches the server action on the
 * initiator; and toasts go away on their own.
 */
describe('neutralNotifier', () => {
    afterEach(() => { document.body.innerHTML = ''; vi.useRealTimers() })

    const toasts = () => Array.from(document.body.querySelectorAll('[role]')) as HTMLElement[]

    it('an error is an assertive alert', () => {
        neutralNotifier.show({ text: 'Save failed', variant: 'error' } as never, document.body)
        const [t] = toasts()
        expect(t.getAttribute('role')).toBe('alert')
        expect(t.getAttribute('aria-live')).toBe('assertive')
        expect(t.getAttribute('aria-atomic')).toBe('true')
        expect(t.querySelector('span')!.textContent).toBe('Save failed')
    })

    it('anything else is a polite status', () => {
        neutralNotifier.show({ text: 'Saved', variant: 'success' } as never, document.body)
        const [t] = toasts()
        expect(t.getAttribute('role')).toBe('status')
        expect(t.getAttribute('aria-live')).toBe('polite')
    })

    it('a Retry control runs its closure once and dismisses the toast', () => {
        vi.useFakeTimers()
        const retry = vi.fn()
        neutralNotifier.show({ text: 'Request failed', variant: 'error', onAction: retry } as never, document.body)
        const button = document.body.querySelector('button')!
        expect(button.textContent).toBe('Retry')
        button.click()
        expect(retry).toHaveBeenCalledTimes(1)
        vi.advanceTimersByTime(250)
        expect(toasts()).toHaveLength(0)
    })

    it('an info toast is painted in the accent colour, not as a plain base-colour toast', () => {
        neutralNotifier.show({ text: 'FYI', variant: 'info' } as never, document.body)
        neutralNotifier.show({ text: 'Plain' } as never, document.body)
        const [info, plain] = toasts()
        expect(info.style.background).toContain('--lumo-primary-color')
        expect(plain.style.background).toContain('--lumo-base-color')
    })

    it('a custom action label is used as written', () => {
        neutralNotifier.show({ text: 'x', onAction: () => {}, actionLabel: 'Try again' } as never, document.body)
        expect(document.body.querySelector('button')!.textContent).toBe('Try again')
    })

    it('Undo dispatches the server action on the initiator', () => {
        const initiator = document.createElement('div')
        document.body.appendChild(initiator)
        const seen: unknown[] = []
        initiator.addEventListener('action-requested', (e) => seen.push((e as CustomEvent).detail))
        neutralNotifier.show({ text: 'Deleted', undoActionId: 'restore', undoParameters: { id: 7 } } as never, initiator)
        const button = document.body.querySelector('button')!
        expect(button.textContent).toBe('Undo')
        button.click()
        expect(seen).toEqual([{ actionId: 'restore', parameters: { id: 7 }, serverNamed: true }])
    })

    it('Undo is handed to a mateu-component directly (its listener lives inside its shadow root)', () => {
        // the walkthrough found Undo dead in the browser: dispatched on the component's HOST, the
        // event only bubbled up past every listener and was dropped
        const component = document.createElement('div') as HTMLElement & { manageActionRequestedEvent?: unknown }
        document.body.appendChild(component)
        const handled: unknown[] = []
        const bubbled: unknown[] = []
        component.manageActionRequestedEvent = (e: CustomEvent) => handled.push(e.detail)
        document.body.addEventListener('action-requested', e => bubbled.push((e as CustomEvent).detail))
        neutralNotifier.show({ text: 'Deleted', undoActionId: 'restore', undoParameters: { id: 7 } } as never, component)
        document.body.querySelector('button')!.click()
        expect(handled).toEqual([{ actionId: 'restore', parameters: { id: 7 }, serverNamed: true }])
        expect(bubbled).toEqual([])
    })

    it('the client-side closure wins over an undo', () => {
        const retry = vi.fn()
        neutralNotifier.show({ text: 'x', onAction: retry, undoActionId: 'restore' } as never, document.body)
        document.body.querySelector('button')!.click()
        expect(retry).toHaveBeenCalled()
    })

    it('goes away on its own after the duration; longer when it carries a control; never with 0', () => {
        vi.useFakeTimers()
        neutralNotifier.show({ text: 'plain' } as never, document.body)
        neutralNotifier.show({ text: 'with control', onAction: () => {} } as never, document.body)
        neutralNotifier.show({ text: 'sticky', duration: 0 } as never, document.body)
        vi.advanceTimersByTime(5300)
        expect(toasts().map(t => t.textContent)).toEqual(['with controlRetry', 'sticky✕'])
        vi.advanceTimersByTime(5000)
        expect(toasts().map(t => t.textContent)).toEqual(['sticky✕'])
    })

    it('an error stays until dismissed, whatever duration it arrived with, and ✕ dismisses it', () => {
        // owner, 2026-10-12: read in 3 s and gone, the reason a save failed was often never seen
        vi.useFakeTimers()
        neutralNotifier.show({ text: 'Save failed', variant: 'error', duration: 3000 } as never, document.body)
        vi.advanceTimersByTime(60000)
        expect(toasts()).toHaveLength(1)
        const close = document.body.querySelector('button[aria-label]') as HTMLButtonElement
        expect(close.getAttribute('aria-label')).toBe('Dismiss')
        close.click()
        vi.advanceTimersByTime(250)
        expect(toasts()).toHaveLength(0)
    })

    it('is anchored where the message asks', () => {
        neutralNotifier.show({ text: 'top', position: 'topStart' } as never, document.body)
        const [t] = toasts()
        expect(t.style.top).not.toBe('')
        expect(t.style.left).not.toBe('')
        expect(t.style.bottom).toBe('')
    })

    it('registerNeutralNotifier installs it as the current notifier', () => {
        registerNeutralNotifier()
        notify({ text: 'through the port', variant: 'error' } as never, document.body)
        expect(toasts().map(t => t.querySelector('span')!.textContent)).toEqual(['through the port'])
    })
})
