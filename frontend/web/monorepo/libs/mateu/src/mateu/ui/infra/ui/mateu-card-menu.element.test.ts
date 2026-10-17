// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import './mateu-card-menu'
import type { MateuCardMenu } from './mateu-card-menu'

afterEach(() => { document.body.innerHTML = '' })

const group = {
    text: 'Products', display: 'cards', selected: true,
    children: [
        { text: 'Bookings', description: 'Make and change bookings', image: '/b.png', route: '/bookings' },
        { component: 'hr' },
        { text: 'Rooms', icon: 'vaadin:bed', selected: true, route: '/rooms' },
        { text: 'Finance', children: [{ text: 'Invoices', route: '/invoices' }, { component: 'hr' }] },
    ],
} as any

async function mount(item: any = group) {
    const el = document.createElement('mateu-card-menu') as MateuCardMenu
    el.item = item
    el.onSelect = vi.fn()
    document.body.appendChild(el)
    await el.updateComplete
    const root = el.shadowRoot!
    const trigger = () => root.querySelector('.trigger') as HTMLButtonElement
    const open = async () => { trigger().click(); await el.updateComplete }
    return { el, root, trigger, open }
}

describe('card menu', () => {
    it('renders nothing without an item; otherwise a trigger announcing a popup', async () => {
        expect((await mount(null)).root.querySelector('.trigger')).toBeNull()
        const { trigger } = await mount()
        expect(trigger().textContent).toContain('Products')
        expect(trigger().classList.contains('active')).toBe(true)
        expect(trigger().getAttribute('aria-expanded')).toBe('false')
    })

    it('opens a panel with one card per entry: leaves navigate, groups offer their entries as actions', async () => {
        const { root, trigger, open } = await mount()
        await open()
        expect(trigger().getAttribute('aria-expanded')).toBe('true')
        const cards = [...root.querySelectorAll('.card')] as HTMLElement[]
        expect(cards.map(c => c.getAttribute('aria-label'))).toEqual(['Bookings', 'Rooms', 'Finance'])
        expect(cards.map(c => c.getAttribute('role'))).toEqual(['menuitem', 'menuitem', 'group'])
        expect(cards[0].querySelector('img')!.getAttribute('src')).toBe('/b.png')
        expect(cards[0].querySelector('.description')!.textContent).toBe('Make and change bookings')
        expect(cards[1].classList.contains('active')).toBe(true)
        expect(cards[2].getAttribute('tabindex')).toBeNull()
        expect([...cards[2].querySelectorAll('.action')].map(a => a.textContent)).toEqual(['Invoices'])
    })

    it('clicking a leaf card selects it and closes the panel', async () => {
        const { el, root, open } = await mount()
        await open()
        ;(root.querySelector('.card') as HTMLElement).click()
        await el.updateComplete
        expect(el.onSelect).toHaveBeenCalledWith(group.children[0])
        expect(root.querySelector('.panel')).toBeNull()
    })

    it('Enter/Space on a focused card and a click on an action select too', async () => {
        const { el, root, open } = await mount()
        await open()
        const rooms = root.querySelectorAll('.card')[1] as HTMLElement
        const enter = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true })
        rooms.dispatchEvent(enter)
        expect(enter.defaultPrevented).toBe(true)
        expect(el.onSelect).toHaveBeenLastCalledWith(group.children[2])
        await open()
        ;(root.querySelector('.action') as HTMLButtonElement).click()
        expect(el.onSelect).toHaveBeenLastCalledWith(group.children[3].children[0])
        // a group card itself does nothing on click
        await open()
        ;(root.querySelectorAll('.card')[2] as HTMLElement).click()
        expect(el.onSelect).toHaveBeenCalledTimes(2)
    })

    it('closes on a click outside, and on Escape giving the focus back to the trigger', async () => {
        const { el, root, open, trigger } = await mount()
        await open()
        document.body.click()
        await el.updateComplete
        expect(root.querySelector('.panel')).toBeNull()
        await open()
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
        await el.updateComplete
        expect(root.querySelector('.panel')).toBeNull()
        expect(root.activeElement).toBe(trigger())
    })
})
