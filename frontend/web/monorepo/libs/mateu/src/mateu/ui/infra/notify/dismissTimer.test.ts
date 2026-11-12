// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { RESUME_MIN_MS, pausableDismiss } from './dismissTimer'
import { ACTIONABLE_TOAST_MIN_MS, toastLifetime } from '@application/Notifier.ts'

/**
 * WCAG 2.2.1 Timing Adjustable: a toast's clock stops while the user is with it (pointer over it,
 * focus inside it, page hidden) and resumes with what was left, never less than RESUME_MIN_MS.
 */
describe('pausableDismiss', () => {
    let el: HTMLElement
    beforeEach(() => {
        vi.useFakeTimers()
        el = document.createElement('div')
        el.appendChild(document.createElement('button'))
        document.body.appendChild(el)
    })
    afterEach(() => { vi.useRealTimers(); document.body.innerHTML = '' })

    it('closes after the duration when nobody touches it', () => {
        const close = vi.fn()
        pausableDismiss(el, 5000, close)
        vi.advanceTimersByTime(4999)
        expect(close).not.toHaveBeenCalled()
        vi.advanceTimersByTime(1)
        expect(close).toHaveBeenCalledTimes(1)
    })

    it('never closes on its own when the duration is 0 (sticky)', () => {
        const close = vi.fn()
        const timer = pausableDismiss(el, 0, close)
        vi.advanceTimersByTime(600000)
        expect(close).not.toHaveBeenCalled()
        expect(timer.paused).toBe(false)
    })

    it('pauses while hovered and resumes with what was left', () => {
        const close = vi.fn()
        const timer = pausableDismiss(el, 5000, close)
        vi.advanceTimersByTime(1000)
        el.dispatchEvent(new Event('mouseenter'))
        expect(timer.paused).toBe(true)
        vi.advanceTimersByTime(60000)
        expect(close).not.toHaveBeenCalled()
        el.dispatchEvent(new Event('mouseleave'))
        vi.advanceTimersByTime(3999)
        expect(close).not.toHaveBeenCalled()
        vi.advanceTimersByTime(1)
        expect(close).toHaveBeenCalledTimes(1)
    })

    it('a resumed toast gets at least RESUME_MIN_MS', () => {
        const close = vi.fn()
        pausableDismiss(el, 5000, close)
        vi.advanceTimersByTime(4900)
        el.dispatchEvent(new Event('mouseenter'))
        el.dispatchEvent(new Event('mouseleave'))
        vi.advanceTimersByTime(RESUME_MIN_MS - 1)
        expect(close).not.toHaveBeenCalled()
        vi.advanceTimersByTime(1)
        expect(close).toHaveBeenCalledTimes(1)
    })

    it('pauses while the focus is inside, moving between its controls keeps it paused', () => {
        const close = vi.fn()
        const second = document.createElement('button')
        el.appendChild(second)
        pausableDismiss(el, 5000, close)
        el.firstElementChild!.dispatchEvent(new FocusEvent('focusin', { bubbles: true }))
        // focus moves from the first control to the second: still inside
        el.firstElementChild!.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: second }))
        vi.advanceTimersByTime(60000)
        expect(close).not.toHaveBeenCalled()
        second.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: document.body }))
        vi.advanceTimersByTime(5000)
        expect(close).toHaveBeenCalledTimes(1)
    })

    it('pauses while the page is hidden', () => {
        const close = vi.fn()
        let state: DocumentVisibilityState = 'visible'
        const spy = vi.spyOn(document, 'visibilityState', 'get').mockImplementation(() => state)
        pausableDismiss(el, 5000, close)
        state = 'hidden'
        document.dispatchEvent(new Event('visibilitychange'))
        vi.advanceTimersByTime(60000)
        expect(close).not.toHaveBeenCalled()
        state = 'visible'
        document.dispatchEvent(new Event('visibilitychange'))
        vi.advanceTimersByTime(5000)
        expect(close).toHaveBeenCalledTimes(1)
        spy.mockRestore()
    })

    it('cancel stops it for good', () => {
        const close = vi.fn()
        const timer = pausableDismiss(el, 5000, close)
        timer.cancel()
        el.dispatchEvent(new Event('mouseleave'))
        vi.advanceTimersByTime(60000)
        expect(close).not.toHaveBeenCalled()
    })
})

describe('toastLifetime', () => {
    it('an actionable toast never stays less than the floor; a plain one keeps its duration', () => {
        expect(toastLifetime({ text: 'x', duration: 3000 }, true)).toBe(ACTIONABLE_TOAST_MIN_MS)
        expect(toastLifetime({ text: 'x', duration: 30000 }, true)).toBe(30000)
        expect(toastLifetime({ text: 'x' }, true)).toBe(ACTIONABLE_TOAST_MIN_MS)
        expect(toastLifetime({ text: 'x', duration: 3000 }, false)).toBe(3000)
        expect(toastLifetime({ text: 'x' }, false)).toBe(5000)
        expect(toastLifetime({ text: 'x', variant: 'error' }, true)).toBe(0)
    })
})
