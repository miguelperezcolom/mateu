// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * mateu-page's sections index (@Toc): when it shows (forced, suppressed, or the auto rule of more
 * than four stacked sections), what clicking an entry and Ctrl+Alt+<n> do (scroll the section to
 * just below the pinned region, and keep it highlighted until the user scrolls), the scrollspy that
 * follows the reading position, the stacked offsets of pinned (sticky) sections, and where the index
 * goes (the aside channel, a bar over the form).
 */

const placement = vi.hoisted(() => ({ value: 'column' as string, released: 0 }))
vi.mock('@infra/ui/layout/fabRail.ts', async (orig) => ({
    ...(await orig<typeof import('./layout/fabRail')>()),
    requestAside: (_el: Element, onPlacement: (p: string, workEnd?: number) => void) => {
        onPlacement(placement.value, 900)
        return () => { placement.released++ }
    },
}))

import './mateu-page'
import type { MateuPage } from './mateu-page'
import { ComponentMetadataType } from '@mateu/shared/apiClients/dtos/ComponentMetadataType'

const page = (metadata: Record<string, unknown> = {}) => ({
    id: 'p1', type: 'ClientSide',
    metadata: { type: ComponentMetadataType.Page, title: 'Check-in', ...metadata },
    children: [],
})

const frames = async () => {
    for (let i = 0; i < 5; i++) await new Promise((r) => requestAnimationFrame(() => r(undefined)))
}

/** A section card with its title, at a given top (jsdom has no layout: the rects are stubbed). */
const card = (title: string, top: number, height = 100, sticky = false) => {
    const el = document.createElement('div')
    el.className = 'mateu-section' + (sticky ? ' mateu-section--sticky' : '')
    el.innerHTML = `<h3>${title}</h3><p>…</p>`
    el.getBoundingClientRect = () => ({ top, bottom: top + height, left: 0, right: 100, width: 100, height } as DOMRect)
    Object.defineProperty(el, 'offsetHeight', { value: height, configurable: true })
    return el
}

const mount = async (metadata: Record<string, unknown>, cards: HTMLElement[], parent: HTMLElement = document.body) => {
    const el = document.createElement('mateu-page') as MateuPage
    el.component = page(metadata) as never
    el.state = {}
    el.data = {}
    cards.forEach((c) => el.appendChild(c))
    parent.appendChild(el)
    await el.updateComplete
    await frames()
    await el.updateComplete
    return el
}

const entries = (el: MateuPage) => Array.from(el.shadowRoot!.querySelectorAll<HTMLElement>('.page-toc__item'))
const activeLabel = (el: MateuPage) => el.shadowRoot!.querySelector('.page-toc__item.is-active .page-toc__label')?.textContent

const five = () => [card('Guests', 0), card('Cardex', 200), card('Company', 400), card('Card', 600), card('History', 800)]

beforeEach(() => {
    placement.value = 'column'
    placement.released = 0
})

afterEach(() => {
    document.body.innerHTML = ''
    vi.restoreAllMocks()
})

describe('when the index shows', () => {
    it('auto: more than four stacked sections get an index with their titles and shortcut badges', async () => {
        const el = await mount({}, five())
        expect(entries(el).map((e) => e.querySelector('.page-toc__label')!.textContent)).toEqual(['Guests', 'Cardex', 'Company', 'Card', 'History'])
        expect(entries(el)[1].title).toBe('Cardex (Ctrl+Alt+2)')
        expect(entries(el)[0].querySelector('.page-toc__key')!.textContent).toBe('1')
        expect(el.shadowRoot!.querySelector('.page-body')!.classList).toContain('with-toc')
        // the header is pinned while the index shows
        expect(el.shadowRoot!.querySelector('.page-header-wrap')!.classList).toContain('sticky-header')
    })

    it('auto: four sections, or sections laid out side by side, get none', async () => {
        const few = await mount({}, five().slice(0, 4))
        expect(entries(few)).toHaveLength(0)
        document.body.innerHTML = ''
        const row = document.createElement('vaadin-horizontal-layout')
        const cards = five()
        cards.forEach((c) => row.appendChild(c))
        const el = document.createElement('mateu-page') as MateuPage
        el.component = page() as never
        el.appendChild(row)
        document.body.appendChild(el)
        await el.updateComplete
        await frames()
        expect(entries(el)).toHaveLength(0)
    })

    it('@Toc forces it on even for two sections; @Toc(false) suppresses it; untitled cards are left out', async () => {
        const forced = await mount({ toc: true }, [card('One', 0), card('', 100), card('Two', 200)])
        expect(entries(forced).map((e) => e.textContent?.replace(/\s+/g, ' ').trim())).toEqual(['One 1', 'Two 2'])
        document.body.innerHTML = ''
        const off = await mount({ toc: false }, five())
        expect(entries(off)).toHaveLength(0)
    })

    it('a title in the card\'s title slot is preferred to a heading', async () => {
        const c = card('Heading', 0)
        const slotted = document.createElement('span')
        slotted.slot = 'title'
        slotted.textContent = 'Slotted title'
        c.prepend(slotted)
        const el = await mount({ toc: true }, [c])
        expect(entries(el)[0].querySelector('.page-toc__label')!.textContent).toBe('Slotted title')
    })

    it('a nested page (in a drawer) does not ask for the aside channel; a top-level one gives it back when removed', async () => {
        const nested = await mount({ toc: true, level: 1 }, five())
        expect(nested.hasAttribute('data-nested')).toBe(true)
        nested.remove()
        expect(placement.released).toBe(0)
        const top = await mount({ toc: true }, five())
        top.remove()
        expect(placement.released).toBe(1)
    })

    it('where there is no aside the index folds into a bar over the form', async () => {
        placement.value = 'bar'
        const el = await mount({ toc: true }, five())
        expect(el.shadowRoot!.querySelector('.page-body')!.classList).toContain('toc-bar')
    })
})

describe('jumping to a section', () => {
    it('a click scrolls the section to just below the pinned region and highlights it', async () => {
        const scrollBy = vi.spyOn(window, 'scrollBy').mockImplementation(() => {})
        const el = await mount({ toc: true }, five())
        entries(el)[2].click()
        await el.updateComplete
        expect(activeLabel(el)).toBe('Company')
        // no pinned header height in jsdom: the section lands one gap (12px) from the top
        expect(scrollBy).toHaveBeenCalledWith({ top: 400 - 12, behavior: 'smooth' })
    })

    it('a sticky section above the target is counted in the landing offset, and pinned cards stack', async () => {
        const scrollBy = vi.spyOn(window, 'scrollBy').mockImplementation(() => {})
        const cards = [card('Guests', 0, 80, true), card('Rooms', 100, 50, true), card('Cardex', 300), card('Company', 500), card('Card', 700)]
        const el = await mount({ toc: true }, cards)
        // stacked under the (0px in jsdom) header: 12, then 12 + 80 + 12
        expect(cards[0].style.top).toBe('12px')
        expect(cards[1].style.top).toBe('104px')
        entries(el)[2].click()
        expect(scrollBy).toHaveBeenCalledWith({ top: 300 - (12 + 80 + 12 + 50 + 12), behavior: 'smooth' })
    })

    it('Ctrl+Alt+<n> (top row or keypad) jumps like a click; other combinations and out-of-range digits do not', async () => {
        const scrollBy = vi.spyOn(window, 'scrollBy').mockImplementation(() => {})
        const el = await mount({ toc: true }, five())
        document.dispatchEvent(new KeyboardEvent('keydown', { code: 'Digit4', key: '4', ctrlKey: true, altKey: true }))
        await el.updateComplete
        expect(activeLabel(el)).toBe('Card')
        document.dispatchEvent(new KeyboardEvent('keydown', { code: 'Numpad2', key: '2', ctrlKey: true, altKey: true }))
        await el.updateComplete
        expect(activeLabel(el)).toBe('Cardex')
        scrollBy.mockClear()
        document.dispatchEvent(new KeyboardEvent('keydown', { code: 'Digit9', key: '9', ctrlKey: true, altKey: true }))
        document.dispatchEvent(new KeyboardEvent('keydown', { code: 'Digit1', key: '1', ctrlKey: true }))
        document.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyA', key: 'a', ctrlKey: true, altKey: true }))
        expect(scrollBy).not.toHaveBeenCalled()
    })

    it('inside a scrolling container, the container is what scrolls', async () => {
        const scroller = document.createElement('div')
        scroller.style.overflowY = 'auto'
        Object.defineProperty(scroller, 'scrollHeight', { value: 2000 })
        Object.defineProperty(scroller, 'clientHeight', { value: 500 })
        scroller.getBoundingClientRect = () => ({ top: 50 } as DOMRect)
        const scrollBy = vi.fn()
        scroller.scrollBy = scrollBy as never
        document.body.appendChild(scroller)
        const el = await mount({ toc: true }, five(), scroller)
        entries(el)[1].click()
        expect(scrollBy).toHaveBeenCalledWith({ top: 200 - 50 - 12, behavior: 'smooth' })
    })
})

describe('the scrollspy', () => {
    it('highlights the section on the reading line as the page scrolls', async () => {
        const cards = five()
        const el = await mount({ toc: true }, cards)
        expect(activeLabel(el)).toBe('Guests')
        // scroll: Company reaches the top
        cards.forEach((c, i) => { c.getBoundingClientRect = () => ({ top: i * 200 - 400, bottom: i * 200 - 300 } as DOMRect) })
        window.dispatchEvent(new Event('scroll'))
        await el.updateComplete
        expect(activeLabel(el)).toBe('Company')
    })

    it('after a click the highlight stays on the clicked entry until the user scrolls by hand', async () => {
        vi.spyOn(window, 'scrollBy').mockImplementation(() => {})
        const cards = five()
        const el = await mount({ toc: true }, cards)
        entries(el)[4].click()
        await el.updateComplete
        // the last section cannot reach the reading line: the spy alone would say Card
        cards.forEach((c, i) => { c.getBoundingClientRect = () => ({ top: i * 200 - 600, bottom: i * 200 - 500 } as DOMRect) })
        window.dispatchEvent(new Event('scroll'))
        await el.updateComplete
        expect(activeLabel(el)).toBe('History')
        // the index shortcut itself does not release the lock; a wheel gesture does
        window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Digit5', ctrlKey: true, altKey: true }))
        window.dispatchEvent(new Event('scroll'))
        await el.updateComplete
        expect(activeLabel(el)).toBe('History')
        window.dispatchEvent(new Event('wheel'))
        window.dispatchEvent(new Event('scroll'))
        await el.updateComplete
        expect(activeLabel(el)).toBe('Card')
    })

    it('a sticky section pinned at the top moves the reading line below it; one not pinned yet does not', async () => {
        const guests = card('Guests', 0, 300, true)
        const cards = [guests, card('Cardex', 250), card('Company', 400), card('Card', 600), card('History', 800)]
        const el = await mount({ toc: true }, cards)
        window.dispatchEvent(new Event('scroll'))
        await el.updateComplete
        // Cardex (top 250) is behind the pinned Guests card (bottom 300): the reading line is 316
        expect(activeLabel(el)).toBe('Cardex')
        // the same layout with Guests not yet pinned (it starts below the top): the reading line is
        // at the top and nothing but the first section has reached it
        guests.getBoundingClientRect = () => ({ top: 50, bottom: 350 } as DOMRect)
        window.dispatchEvent(new Event('scroll'))
        await el.updateComplete
        expect(activeLabel(el)).toBe('Guests')
    })

    it('a resize re-lays the pinned offsets', async () => {
        const sticky = card('Guests', 0, 80, true)
        await mount({ toc: true }, [sticky, card('Cardex', 100), card('Company', 300)])
        sticky.style.top = ''
        window.dispatchEvent(new Event('resize'))
        expect(sticky.style.top).toBe('12px')
    })
})
