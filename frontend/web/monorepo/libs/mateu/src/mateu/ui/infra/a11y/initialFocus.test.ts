// @vitest-environment jsdom
// The subject is where the focus may go on a fresh page vs after the user acted on it.
import { describe, it, expect, beforeEach } from 'vitest'
import { mayTakeFocusOnItsOwn, resetInteractionForTests, watchForInteraction } from './initialFocus'

describe('mayTakeFocusOnItsOwn', () => {

    beforeEach(() => {
        document.body.innerHTML = ''
        resetInteractionForTests()
        watchForInteraction()
    })

    it('refuses on a page nobody has acted on yet: the first Tab belongs to the skip link', () => {
        expect(mayTakeFocusOnItsOwn()).toBe(false)
    })

    it('a lone Tab is not acting on the page', () => {
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }))
        expect(mayTakeFocusOnItsOwn()).toBe(false)
    })

    it('allows it once the user clicked something (an in-app navigation)', () => {
        const link = document.createElement('a')
        link.href = '#x'
        document.body.appendChild(link)
        link.focus()
        document.dispatchEvent(new Event('pointerdown'))
        expect(mayTakeFocusOnItsOwn()).toBe(true)
    })

    it('never takes it from a field the user is typing in', () => {
        const input = document.createElement('input')
        document.body.appendChild(input)
        input.focus()
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }))
        expect(mayTakeFocusOnItsOwn()).toBe(false)
    })

    it('never takes it from the skip link', () => {
        const skip = document.createElement('mateu-skip-link')
        const root = skip.attachShadow({ mode: 'open' })
        const a = document.createElement('a')
        a.href = '#main'
        root.appendChild(a)
        document.body.appendChild(skip)
        a.focus()
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
        expect(mayTakeFocusOnItsOwn()).toBe(false)
    })
})
