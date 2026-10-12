// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { deepActiveElement, trapFocus } from './focusTrap'

/**
 * trapFocus itself (the tabbable search has its own suite): focus moves IN on open, Tab and
 * Shift+Tab wrap around inside — across a shadow root —, and release gives the focus back unless
 * something else deliberately took it.
 */
describe('trapFocus', () => {
    const frame = () => new Promise((r) => requestAnimationFrame(() => r(undefined)))
    const visible = (root: ParentNode) => root.querySelectorAll('*').forEach((el) => {
        (el as HTMLElement).getClientRects = () => [{}] as unknown as DOMRectList
    })
    const tab = (target: Element, shiftKey = false) => {
        const e = new KeyboardEvent('keydown', { key: 'Tab', shiftKey, bubbles: true, composed: true, cancelable: true })
        target.dispatchEvent(e)
        return e
    }

    afterEach(() => { document.body.innerHTML = '' })

    const setup = () => {
        document.body.innerHTML = `<button id="opener">open</button>
            <div id="panel"><button id="first">first</button><div id="host"></div></div>`
        const host = document.getElementById('host')!
        const shadow = host.attachShadow({ mode: 'open' })
        shadow.innerHTML = '<input id="last">'
        visible(document.body)
        visible(shadow)
        return { panel: document.getElementById('panel')!, first: document.getElementById('first')!, last: shadow.getElementById('last')! }
    }

    it('moves the focus to the first tabbable on open', async () => {
        const { panel, first } = setup()
        document.getElementById('opener')!.focus()
        trapFocus(panel)
        await frame()
        expect(document.activeElement).toBe(first)
    })

    it('honours initialFocus', async () => {
        const { panel, last } = setup()
        trapFocus(panel, { initialFocus: () => last })
        await frame()
        expect(deepActiveElement()).toBe(last)
    })

    it('Tab on the last (inside a shadow root) wraps to the first; Shift+Tab on the first wraps to the last', async () => {
        const { panel, first, last } = setup()
        trapFocus(panel)
        await frame()
        last.focus()
        const e = tab(last)
        expect(e.defaultPrevented).toBe(true)
        expect(document.activeElement).toBe(first)

        const back = tab(first, true)
        expect(back.defaultPrevented).toBe(true)
        expect(deepActiveElement()).toBe(last)
    })

    it('Tab in the middle is left to the browser', async () => {
        const { panel, first } = setup()
        trapFocus(panel)
        await frame()
        first.focus()
        expect(tab(first).defaultPrevented).toBe(false)
    })

    it('an overlay with nothing tabbable keeps the focus on itself', async () => {
        document.body.innerHTML = '<div id="empty">just text</div>'
        const panel = document.getElementById('empty')!
        trapFocus(panel)
        await frame()
        expect(panel.getAttribute('tabindex')).toBe('-1')
        expect(document.activeElement).toBe(panel)
        expect(tab(panel).defaultPrevented).toBe(true)
        expect(document.activeElement).toBe(panel)
    })

    it('release gives the focus back and stops trapping', async () => {
        const { panel, first, last } = setup()
        const opener = document.getElementById('opener')!
        opener.focus()
        const trap = trapFocus(panel)
        await frame()
        trap.release()
        expect(document.activeElement).toBe(opener)
        last.focus()
        expect(tab(last).defaultPrevented).toBe(false)
        expect(first).toBeTruthy()
    })

    it('release does not steal the focus back from something that took it deliberately', async () => {
        const { panel } = setup()
        document.getElementById('opener')!.focus()
        const trap = trapFocus(panel)
        await frame()
        const elsewhere = document.createElement('button')
        document.body.appendChild(elsewhere)
        elsewhere.focus()
        trap.release()
        expect(document.activeElement).toBe(elsewhere)
    })
})
