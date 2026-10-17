// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import './mateu-card-list'
import type { MateuCardList } from './mateu-card-list'

/**
 * The card listing: one card per row of the current page (title/subtitle/status/image cards, or
 * plain items), a click selects the row (and runs the selection action), and an infinite scroll
 * sentinel asks for the next page while it stays visible.
 */
describe('mateu-card-list (DOM)', () => {
    let observed: { el: Element, cb: (entries: { intersectionRatio: number }[]) => void }[]
    const OrigIO = window.IntersectionObserver
    let events: { type: string, detail: Record<string, any> }[]
    let listening: AbortController

    const page = (content: unknown[], totalElements: number, pageSize = 2) => ({ list: { page: { content, totalElements, pageSize } } })
    const mount = async (data: Record<string, unknown>, metadata: Record<string, unknown> = { pageSize: 2 }) => {
        const el = document.createElement('mateu-card-list') as MateuCardList
        el.id = 'list'
        el.metadata = metadata as never
        el.data = data
        el.state = {}
        document.body.appendChild(el)
        await el.updateComplete
        await el.updateComplete
        return el
    }
    const $ = (el: MateuCardList, sel: string) => el.shadowRoot!.querySelector(sel) as HTMLElement
    const $$ = (el: MateuCardList, sel: string) => Array.from(el.shadowRoot!.querySelectorAll(sel)) as HTMLElement[]

    beforeEach(() => {
        observed = []
        ;(window as unknown as Record<string, unknown>).IntersectionObserver = class {
            constructor(private cb: (entries: { intersectionRatio: number }[]) => void) {}
            observe(el: Element) { observed.push({ el, cb: this.cb }) }
            disconnect() {}
        }
        events = []
        listening = new AbortController()
        for (const type of ['action-requested', 'fetch-more-elements']) {
            document.addEventListener(type, (e) => events.push({ type, detail: (e as CustomEvent).detail }), { signal: listening.signal })
        }
    })
    afterEach(() => {
        listening.abort()
        document.body.innerHTML = ''
        ;(window as unknown as Record<string, unknown>).IntersectionObserver = OrigIO
    })

    it('renders a card per row with its image, title, status, subtitle and content; plain items as text', async () => {
        const el = await mount(page([
            { title: 'Room 101', subtitle: 'Double', content: 'Sea view', image: '/r101.jpg', status: { type: 'SUCCESS', message: 'Free' } },
            { title: 'Room 102' },
            'just text',
        ], 3))
        const cards = $$(el, '.car-container')
        expect(cards).toHaveLength(3)
        expect(cards[0].getAttribute('role')).toBe('button')
        expect(cards[0].querySelector('.card-title')!.textContent).toBe('Room 101')
        expect(cards[0].querySelector('.card-subtitle')!.textContent).toBe('Double')
        expect(cards[0].querySelector('img')!.getAttribute('src')).toBe('/r101.jpg')
        expect(cards[0].querySelector('[theme^=badge]')!.textContent).toBe('Free')
        expect(cards[0].textContent).toContain('Sea view')
        expect(cards[1].querySelector('img')).toBeNull()
        expect(cards[1].querySelector('.card-subtitle')).toBeNull()
        expect(cards[2].textContent!.trim()).toBe('just text')
        // the whole page is here: no "loading more"
        expect($(el, '#ask-for-more').style.display).toBe('none')
    })

    it('clicking (or Enter on) a card selects its row and runs the selection action', async () => {
        const row = { title: 'Room 101' }
        const el = await mount(page([row, { title: 'Room 102' }], 2), { pageSize: 2, onRowSelectionChangedActionId: 'rowSelected' })
        $$(el, '.car-container')[0].click()
        expect(el.state['list_selected_items']).toEqual([row])
        expect(events).toEqual([{ type: 'action-requested', detail: { actionId: 'rowSelected' } }])
        $$(el, '.car-container')[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
        expect(el.state['list_selected_items']).toEqual([{ title: 'Room 102' }])
        expect(events).toHaveLength(2)
    })

    it('without a selection action a click only records the selection', async () => {
        const el = await mount(page([{ title: 'A' }], 1))
        $$(el, '.car-container')[0].click()
        expect(el.state['list_selected_items']).toEqual([{ title: 'A' }])
        expect(events).toEqual([])
    })

    it('while the sentinel is visible it asks for the next page, and keeps asking until it is not', async () => {
        const el = await mount(page([{ title: 'A' }, { title: 'B' }], 5))
        expect($(el, '#ask-for-more').style.display).toBe('flex')
        expect($(el, '#ask-for-more').textContent).toBe('Loading more…')
        const sentinel = observed.find(o => o.el === $(el, '#ask-for-more'))!
        sentinel.cb([{ intersectionRatio: 1 }])
        expect(events).toHaveLength(1)
        expect(events[0].type).toBe('fetch-more-elements')
        expect(events[0].detail.params).toEqual({ page: 1, pageSize: 2 })
        // the page arrived and the sentinel is still visible: ask again
        events[0].detail.callback()
        expect(events).toHaveLength(2)
        sentinel.cb([{ intersectionRatio: 0 }])
        events[1].detail.callback()
        expect(events).toHaveLength(2)
    })
})
