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
        expect(t.textContent).toBe('Save failed')
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
        expect(seen).toEqual([{ actionId: 'restore', parameters: { id: 7 } }])
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
        expect(toasts().map(t => t.textContent)).toEqual(['with controlRetry', 'sticky'])
        vi.advanceTimersByTime(5000)
        expect(toasts().map(t => t.textContent)).toEqual(['sticky'])
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
        expect(toasts().map(t => t.textContent)).toEqual(['through the port'])
    })
})
