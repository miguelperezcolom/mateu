// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import './mateu-task-queue'
import type { MateuTaskQueue } from './mateu-task-queue'

/** The grouped work-queue rail: cards per group, local selection + the queue's action, per-item buttons. */
describe('mateu-task-queue (DOM)', () => {
    const GROUPS = [
        { label: 'Arrivals', items: [
            { id: 'a1', title: 'Smith', caption: 'Room 101', badges: [{ label: 'VIP', color: 'success' }] },
            { id: 'a2', title: 'Jones', selected: true, actionLabel: 'Check in', actionId: 'checkIn' },
        ] },
        { items: [{ id: 'd1', title: 'Brown' }] },
    ]
    let events: { actionId: string, parameters: Record<string, unknown> }[]
    const listener = (e: Event) => events.push((e as CustomEvent).detail)
    const mount = async (props: Partial<MateuTaskQueue> = {}) => {
        const el = document.createElement('mateu-task-queue') as MateuTaskQueue
        el.groups = GROUPS as never
        Object.assign(el, props)
        document.body.appendChild(el)
        await el.updateComplete
        return el
    }
    const cards = (el: MateuTaskQueue) => Array.from(el.shadowRoot!.querySelectorAll('[role=option]')) as HTMLElement[]

    beforeEach(() => { events = []; document.addEventListener('action-requested', listener) })
    afterEach(() => { document.removeEventListener('action-requested', listener); document.body.innerHTML = '' })

    it('renders the groups as listboxes of cards, seeding the selection from the wire', async () => {
        const el = await mount()
        const groups = Array.from(el.shadowRoot!.querySelectorAll('[role=listbox]'))
        expect(groups.map(g => g.getAttribute('aria-label'))).toEqual(['Arrivals', null])
        expect(el.shadowRoot!.querySelector('.group-label')!.textContent).toBe('Arrivals')
        const [smith, jones] = cards(el)
        expect(smith.querySelector('.title')!.textContent).toBe('Smith')
        expect(smith.querySelector('.caption')!.textContent).toBe('Room 101')
        expect(smith.querySelector('.chip.success')!.textContent).toBe('VIP')
        expect(jones.classList.contains('selected')).toBe(true)
        expect(jones.getAttribute('aria-selected')).toBe('true')
        expect(jones.querySelector('button.item-action')!.textContent!.trim()).toBe('Check in')
        expect(smith.querySelector('button')).toBeNull()
    })

    it('a click or Enter selects a card and dispatches the queue action with the item', async () => {
        const el = await mount({ actionId: 'openItem' })
        cards(el)[0].click()
        await el.updateComplete
        expect(cards(el)[0].classList.contains('selected')).toBe(true)
        expect(cards(el)[1].classList.contains('selected')).toBe(false)
        cards(el)[2].dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
        expect(events).toEqual([
            { actionId: 'openItem', parameters: { _item: 'a1' } },
            { actionId: 'openItem', parameters: { _item: 'd1' } },
        ])
    })

    it('without a queue action a click only selects; an item button runs its own action, not the selection', async () => {
        const el = await mount()
        cards(el)[0].click()
        await el.updateComplete
        expect(events).toEqual([])
        expect(cards(el)[0].classList.contains('selected')).toBe(true)
        ;(cards(el)[1].querySelector('button.item-action') as HTMLElement).click()
        await el.updateComplete
        expect(events).toEqual([{ actionId: 'checkIn', parameters: { _item: 'a2' } }])
        expect(cards(el)[0].classList.contains('selected')).toBe(true)
        // Enter on the item button (the browser turns it into its click) does not also select the card
        cards(el)[1].querySelector('button.item-action')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, composed: true }))
        await el.updateComplete
        expect(cards(el)[0].classList.contains('selected')).toBe(true)
    })
})
