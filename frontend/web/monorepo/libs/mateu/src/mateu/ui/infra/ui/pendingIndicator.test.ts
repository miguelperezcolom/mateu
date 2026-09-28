// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { anyPending, clearPending, markPending } from './pendingIndicator.ts'

afterEach(() => { document.body.innerHTML = '' })

describe('anyPending', () => {
    it('is true while a pressed control shows its busy state, false once it is cleared', () => {
        const button = document.body.appendChild(document.createElement('button'))
        expect(anyPending()).toBe(false)
        markPending(button)
        expect(anyPending()).toBe(true)
        clearPending(button)
        expect(anyPending()).toBe(false)
    })

    it('forgets a control that left the page without being cleared, as when the screen is navigated away', () => {
        const button = document.body.appendChild(document.createElement('button'))
        markPending(button)
        button.remove()
        expect(anyPending()).toBe(false)
    })
})
