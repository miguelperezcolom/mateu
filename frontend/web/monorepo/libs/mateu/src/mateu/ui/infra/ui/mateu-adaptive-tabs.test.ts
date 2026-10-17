// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import './mateu-adaptive-tabs'
import type { MateuAdaptiveTabs } from './mateu-adaptive-tabs'

let observers: { cb: ResizeObserverCallback, disconnect: ReturnType<typeof vi.fn> }[] = []
beforeEach(() => {
    observers = []
    vi.stubGlobal('ResizeObserver', class {
        disconnect = vi.fn()
        constructor(public cb: ResizeObserverCallback) { observers.push(this as any) }
        observe() {}
        unobserve() {}
    })
})
afterEach(() => { vi.unstubAllGlobals(); document.body.innerHTML = '' })

const resize = (width: number) => observers.at(-1)!.cb([{ contentRect: { width } } as any], {} as any)

async function mount() {
    const el = document.createElement('mateu-adaptive-tabs') as MateuAdaptiveTabs
    el.tabLabels = ['One', 'Two', 'Three']
    // a stand-in for vaadin-tabs: anything with a `selected` property
    const strip = document.createElement('div') as any
    strip.slot = 'tabs'
    strip.selected = 0
    el.appendChild(strip)
    for (let i = 0; i < 3; i++) {
        const p = document.createElement('div')
        p.slot = `panel-${i}`
        p.textContent = `content ${i}`
        el.appendChild(p)
    }
    document.body.appendChild(el)
    await el.updateComplete
    await new Promise(r => setTimeout(r)) // slotchange
    return { el, strip, root: el.shadowRoot! }
}
const visiblePanels = (root: ShadowRoot) => [...root.querySelectorAll('.panel')].map(p => !(p as HTMLElement).hidden)

describe('adaptive tabs', () => {
    it('shows the tab strip and only the selected panel when wide', async () => {
        const { root } = await mount()
        expect((root.querySelector('.strip') as HTMLElement).hidden).toBe(false)
        expect(visiblePanels(root)).toEqual([true, false, false])
        expect(root.querySelector('.accordion')).toBeNull()
    })

    it('follows the tab strip selection', async () => {
        const { el, strip, root } = await mount()
        strip.dispatchEvent(new CustomEvent('selected-changed', { detail: { value: 2 } }))
        await el.updateComplete
        expect(visiblePanels(root)).toEqual([false, false, true])
        strip.dispatchEvent(new CustomEvent('selected-changed', { detail: { value: -1 } }))
        await el.updateComplete
        expect(visiblePanels(root)).toEqual([false, false, true])
    })

    it('degrades to an exclusive accordion when narrow, keeping the selection both ways', async () => {
        const { el, strip, root } = await mount()
        strip.dispatchEvent(new CustomEvent('selected-changed', { detail: { value: 1 } }))
        resize(300)
        await el.updateComplete
        expect((root.querySelector('.strip') as HTMLElement).hidden).toBe(true)
        const headers = [...root.querySelectorAll('.acc-header')] as HTMLButtonElement[]
        expect(headers.map(h => h.textContent!.replace('⟩', '').trim())).toEqual(['One', 'Two', 'Three'])
        expect(headers.map(h => h.getAttribute('aria-expanded'))).toEqual(['false', 'true', 'false'])
        headers[2].click()
        await el.updateComplete
        expect(headers.map(h => h.getAttribute('aria-expanded'))).toEqual(['false', 'false', 'true'])
        expect([...root.querySelectorAll('.acc-body')].map(b => (b as HTMLElement).hidden)).toEqual([true, true, false])
        // the hidden strip follows, so going back wide lands on the same tab
        expect(strip.selected).toBe(2)
        resize(1200)
        await el.updateComplete
        expect(visiblePanels(root)).toEqual([false, false, true])
    })

    it('re-syncs the strip when it drifted while hidden, and disconnects on removal', async () => {
        const { el, strip } = await mount()
        resize(300)
        await el.updateComplete
        ;(el.shadowRoot!.querySelectorAll('.acc-header')[1] as HTMLButtonElement).click()
        strip.selected = 0
        resize(1200)
        await el.updateComplete
        expect(strip.selected).toBe(1)
        const observer = observers.at(-1)!
        el.remove()
        expect(observer.disconnect).toHaveBeenCalled()
    })
})
