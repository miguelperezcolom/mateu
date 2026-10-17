// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { render } from 'lit'
import './mateu-vaadin-foldout'
import type { MateuVaadinFoldout } from './mateu-vaadin-foldout'
import { renderVaadinFoldout } from './renderVaadinFoldout'

/**
 * The foldout as a carousel, with the geometry jsdom lacks supplied by hand: an 800px rail over a
 * 2000px row of sections (overview 300px, panels at 400/800/1200). The arrow keys step one section
 * at a time (not while the user is typing), a vertical wheel moves the row sideways, a scroll that
 * ends between sections snaps to the nearest one, and once the row overflows the paging dots
 * appear — a dot jumps to its section. Plus the renderer that puts it on the page.
 */
const OFFSETS = [0, 400, 800, 1200]

const mount = async () => {
    const f = document.createElement('mateu-vaadin-foldout') as MateuVaadinFoldout
    f.headerTitle = 'Booking'
    f.panels = [{ title: 'A' }, { title: 'B' }, { title: 'C' }] as never
    document.body.appendChild(f)
    await f.updateComplete
    const rail = f.shadowRoot!.querySelector('.rail') as HTMLElement
    let left = 0
    Object.defineProperties(rail, {
        clientWidth: { configurable: true, get: () => 800 },
        scrollWidth: { configurable: true, get: () => 2000 },
        scrollLeft: { configurable: true, get: () => left, set: (v: number) => { left = v } },
    })
    rail.getBoundingClientRect = () => ({ left: 0, right: 800, top: 0, bottom: 600, width: 800, height: 600 }) as DOMRect
    const scrollTo = vi.fn((o: ScrollToOptions) => { left = o.left ?? left })
    rail.scrollTo = scrollTo as never
    const sections = Array.from(f.shadowRoot!.querySelectorAll('.section')) as HTMLElement[]
    sections.forEach((s, i) => {
        Object.defineProperty(s, 'offsetLeft', { configurable: true, get: () => OFFSETS[i] })
        Object.defineProperty(s, 'offsetWidth', { configurable: true, get: () => i === 0 ? 300 : 400 })
        s.getBoundingClientRect = () => ({ left: OFFSETS[i] - left, right: OFFSETS[i] - left + 400 }) as DOMRect
    })
    return { f, rail, scrollTo, first: sections[0], setLeft: (v: number) => { left = v } }
}
const frame = () => new Promise((r) => requestAnimationFrame(() => r(undefined)))
const key = (k: string, init: KeyboardEventInit = {}) =>
    document.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...init }))

afterEach(() => { document.body.innerHTML = '' })

describe('mateu-vaadin-foldout carousel', () => {
    it('ArrowRight / ArrowLeft step to the next / previous section', async () => {
        const { scrollTo, setLeft } = await mount()
        key('ArrowRight')
        expect(scrollTo).toHaveBeenLastCalledWith({ left: 400, behavior: 'smooth' })
        setLeft(800)
        key('ArrowLeft')
        expect(scrollTo).toHaveBeenLastCalledWith({ left: 400, behavior: 'smooth' })
        // the last boundary is the end of the row (2000 - 800), not past it
        setLeft(1200)
        key('ArrowRight')
        expect(scrollTo).toHaveBeenLastCalledWith({ left: 1200, behavior: 'smooth' })
    })

    it('the arrows are left alone while typing in a field, with a modifier, or when nothing overflows', async () => {
        const { rail, scrollTo } = await mount()
        const input = document.createElement('input')
        document.body.appendChild(input)
        input.focus()
        key('ArrowRight')
        input.blur()
        key('ArrowRight', { ctrlKey: true })
        key('ArrowUp')
        Object.defineProperty(rail, 'scrollWidth', { configurable: true, get: () => 800 })
        key('ArrowRight')
        expect(scrollTo).not.toHaveBeenCalled()
    })

    it('a vertical wheel over the row scrolls it sideways (and is claimed)', async () => {
        const { rail } = await mount()
        const wheel = new WheelEvent('wheel', { deltaY: 120, bubbles: true, cancelable: true, composed: true })
        rail.dispatchEvent(wheel)
        expect(wheel.defaultPrevented).toBe(true)
        expect(rail.scrollLeft).toBe(120)
        // a horizontal gesture or a pinch-zoom (ctrl) is the browser's
        const sideways = new WheelEvent('wheel', { deltaX: 50, deltaY: 10, bubbles: true, cancelable: true })
        rail.dispatchEvent(sideways)
        rail.dispatchEvent(new WheelEvent('wheel', { deltaY: 100, ctrlKey: true, bubbles: true, cancelable: true }))
        expect(sideways.defaultPrevented).toBe(false)
        expect(rail.scrollLeft).toBe(120)
    })

    it('a scroll that ends between sections snaps to the nearest one', async () => {
        const { rail, scrollTo, setLeft } = await mount()
        setLeft(700)
        rail.dispatchEvent(new Event('scrollend'))
        expect(scrollTo).toHaveBeenLastCalledWith({ left: 800, behavior: 'smooth' })
        scrollTo.mockClear()
        await new Promise((r) => setTimeout(r, 450))
        setLeft(800)
        rail.dispatchEvent(new Event('scrollend'))
        expect(scrollTo).not.toHaveBeenCalled()
    })

    it('once scrolled, the overview stays pinned, the paging dots show, and a dot jumps to its section', async () => {
        const { f, rail, scrollTo, first, setLeft } = await mount()
        setLeft(200)
        rail.dispatchEvent(new Event('scroll'))
        await frame()
        await f.updateComplete
        expect(first.style.transform).toBe('translateX(200px)')
        expect(first.classList.contains('floating')).toBe(true)
        const dots = Array.from(f.shadowRoot!.querySelectorAll('.dot')) as HTMLElement[]
        expect(dots.map(d => d.getAttribute('aria-label'))).toEqual(['Booking', 'A', 'B', 'C'])
        expect(dots.filter(d => d.getAttribute('aria-current') === 'true').length).toBeGreaterThan(0)
        dots[3].click()
        expect(scrollTo).toHaveBeenLastCalledWith({ left: 1200, behavior: 'smooth' })
        // the first panel next to a pinned overview is reached at 0
        dots[1].click()
        expect(scrollTo).toHaveBeenLastCalledWith({ left: 0, behavior: 'smooth' })
    })

    it('once removed, the foldout stops listening to the keyboard', async () => {
        const { f, scrollTo } = await mount()
        f.remove()
        key('ArrowRight')
        expect(scrollTo).not.toHaveBeenCalled()
    })
})

describe('renderVaadinFoldout', () => {
    it('puts the wire foldout on the page: panels, header, badges, navigation, edit action and slotted children', async () => {
        const host = document.createElement('div')
        document.body.appendChild(host)
        const comp = {
            type: 'ClientSide', slot: 'main', style: 'height: 30rem', cssClasses: 'x',
            metadata: { type: 'FoldoutLayout', panels: [{ title: 'Ops', width: '38rem' }], headerTitle: 'Booking 42', badges: ['VIP'], navigation: { nextActionId: 'next' }, overviewEditActionId: 'edit' },
            children: [],
        }
        render(renderVaadinFoldout(host as never, comp as never, '', {}, {}, {}, {}), host)
        const f = host.querySelector('mateu-vaadin-foldout') as MateuVaadinFoldout
        await f.updateComplete
        expect(f.panels).toEqual([{ title: 'Ops', width: '38rem' }])
        expect(f.headerTitle).toBe('Booking 42')
        expect(f.badges).toEqual(['VIP'])
        expect(f.navigation).toEqual({ nextActionId: 'next' })
        expect(f.getAttribute('overviewEditActionId')).toBe('edit')
        expect(f.getAttribute('slot')).toBe('main')
        expect(f.shadowRoot!.querySelector('.tb-edit')).not.toBeNull()
    })

    it('a bare foldout gets empty defaults', async () => {
        const host = document.createElement('div')
        document.body.appendChild(host)
        render(renderVaadinFoldout(host as never, { type: 'ClientSide', metadata: { type: 'FoldoutLayout' } } as never, '', {}, {}, {}, {}), host)
        const f = host.querySelector('mateu-vaadin-foldout') as MateuVaadinFoldout
        expect(f.panels).toEqual([])
        expect(f.navigation).toBeNull()
        expect(f.hasAttribute('slot')).toBe(false)
    })
})
