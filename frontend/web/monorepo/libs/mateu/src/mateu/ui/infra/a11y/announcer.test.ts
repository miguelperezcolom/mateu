// @vitest-environment jsdom
// The subject here IS the DOM (live regions), so this file opts into jsdom;
// the suite default stays `node` for the pure-logic tests.
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { announce, installAnnouncer, resetAnnouncer } from './announcer'

const region = (politeness: 'polite' | 'assertive') =>
    document.querySelector(`[data-mateu-live-region="${politeness}"]`)

describe('announcer', () => {

    beforeEach(() => {
        resetAnnouncer()
        document.body.innerHTML = ''
    })

    it('creates both regions up front, before anything is announced', () => {
        // A region created and filled in the same tick is frequently never announced, so they
        // must exist from boot.
        installAnnouncer()
        expect(region('polite')).not.toBeNull()
        expect(region('assertive')).not.toBeNull()
        expect(region('polite')?.textContent).toBe('')
    })

    it('announces politely by default', () => {
        announce('12 results')
        expect(region('polite')?.textContent).toBe('12 results')
        expect(region('assertive')?.textContent ?? '').toBe('')
    })

    it('interrupts only when asked to', () => {
        announce('Could not save', { politeness: 'assertive' })
        expect(region('assertive')?.textContent).toBe('Could not save')
    })

    it('marks the regions so assistive technology reads the whole message', () => {
        announce('hello')
        const el = region('polite')!
        expect(el.getAttribute('aria-live')).toBe('polite')
        expect(el.getAttribute('aria-atomic')).toBe('true')
        expect(el.getAttribute('role')).toBe('status')
        expect(region('assertive')?.getAttribute('role') ?? 'alert').toBe('alert')
    })

    it('keeps the region visually hidden but readable — never display:none', () => {
        // display:none / visibility:hidden would remove it from the accessibility tree too,
        // which defeats the whole purpose.
        announce('hello')
        const style = (region('polite') as HTMLElement).style
        expect(style.display).not.toBe('none')
        expect(style.visibility).not.toBe('hidden')
        expect(style.position).toBe('absolute')
        expect(style.overflow).toBe('hidden')
    })

    it('re-announces an identical message, which a plain assignment would not', () => {
        vi.useFakeTimers()
        announce('Could not save', { politeness: 'assertive' })
        announce('Could not save', { politeness: 'assertive' })
        // Cleared first so the repeat is a real mutation…
        expect(region('assertive')?.textContent).toBe('')
        vi.advanceTimersByTime(100)
        // …then restored.
        expect(region('assertive')?.textContent).toBe('Could not save')
        vi.useRealTimers()
    })

    it('says nothing for an empty or blank message', () => {
        announce('')
        announce('   ')
        expect(region('polite')?.textContent ?? '').toBe('')
    })

    it('reuses the one region per politeness instead of stacking them up', () => {
        installAnnouncer()
        announce('one')
        announce('two')
        expect(document.querySelectorAll('[data-mateu-live-region="polite"]').length).toBe(1)
        expect(region('polite')?.textContent).toBe('two')
    })
})
