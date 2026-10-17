// @vitest-environment jsdom
import { afterEach, beforeAll, describe, expect, it } from 'vitest'

// The palette as the author uses it: the whole catalogue, searchable, pictured in the project's
// design system (or by name only, remembered per browser); a click adds a node, a press starts a drag.

beforeAll(async () => { await import('./editor-palette') })
afterEach(() => { document.body.innerHTML = ''; localStorage.clear() })

async function palette(renderer = 'vaadin') {
    const el = document.createElement('editor-palette') as any
    el.renderer = renderer
    const events: { type: string; detail: any }[] = []
    for (const t of ['palette-add', 've-drag-start']) el.addEventListener(t, (e: CustomEvent) => events.push({ type: t, detail: e.detail }))
    document.body.appendChild(el)
    await el.updateComplete
    return { el, root: el.shadowRoot as ShadowRoot, events }
}
const entry = (root: ShadowRoot, name: string) => [...root.querySelectorAll('button')].find((b) => b.title === name || b.title.startsWith(name + ' —')) as HTMLButtonElement

describe('<editor-palette>', () => {
    it('searches the catalogue by name and says when nothing matches', async () => {
        const { el, root } = await palette()
        const search = root.querySelector('.search input') as HTMLInputElement
        expect(search.placeholder).toMatch(/Search \d+ components/)
        search.value = 'button'
        search.dispatchEvent(new Event('input'))
        await el.updateComplete
        const names = [...root.querySelectorAll('button')].map((b) => b.title.split(' —')[0])
        expect(names.length).toBeGreaterThan(0)
        expect(names.every((n) => n.toLowerCase().includes('button'))).toBe(true)
        search.value = 'zzznope'
        search.dispatchEvent(new Event('input'))
        await el.updateComplete
        expect(root.querySelector('.none')?.textContent).toContain('No component matches “zzznope”')
    })

    it('a click adds a new node of that type; a press starts a drag carrying it and where it began', async () => {
        const { root, events } = await palette()
        const button = entry(root, 'Button')
        button.click()
        button.dispatchEvent(new MouseEvent('mousedown', { clientX: 12, clientY: 34, bubbles: true }))
        expect(events[0]).toMatchObject({ type: 'palette-add', detail: { node: { type: 'Button' } } })
        expect(events[1]).toMatchObject({ type: 've-drag-start', detail: { node: { type: 'Button' }, clientX: 12, clientY: 34 } })
    })

    it('pictures the components in the project\'s design system; "Names only" is remembered', async () => {
        const first = await palette('vaadin')
        expect(first.root.querySelectorAll('button.card img').length).toBeGreaterThan(0)
        const toggle = first.root.querySelector('.names-only input') as HTMLInputElement
        toggle.checked = true
        toggle.dispatchEvent(new Event('change'))
        await first.el.updateComplete
        expect(first.root.querySelectorAll('button.card')).toHaveLength(0)
        first.el.remove()
        const again = await palette('vaadin')
        expect(again.root.querySelectorAll('button.card')).toHaveLength(0)
        expect((again.root.querySelector('.names-only input') as HTMLInputElement).checked).toBe(true)
    })

    it('the DS-neutral canvas lists names; Redwood marks what it has no picture of as likely unpainted', async () => {
        const neutral = await palette('neutral')
        expect(neutral.root.querySelectorAll('button.card')).toHaveLength(0)
        expect(neutral.root.querySelector('button.absent')).toBeNull()
        neutral.el.remove()
        const redwood = await palette('redwood')
        expect(redwood.root.querySelectorAll('button.card').length).toBeGreaterThan(0)
        const absent = redwood.root.querySelector('button.absent') as HTMLButtonElement | null
        if (absent) expect(absent.title).toContain('no Redwood picture')
    })

    it('hovering a pictured card shows it larger; leaving or pressing hides it', async () => {
        const { el, root } = await palette('vaadin')
        const card = root.querySelector('button.card') as HTMLButtonElement
        card.dispatchEvent(new MouseEvent('mouseenter'))
        await el.updateComplete
        expect(root.querySelector('.peek .name')?.textContent).toBe(card.title)
        card.dispatchEvent(new MouseEvent('mouseleave'))
        await el.updateComplete
        expect(root.querySelector('.peek')).toBeNull()
        card.dispatchEvent(new MouseEvent('mouseenter'))
        card.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
        await el.updateComplete
        expect(root.querySelector('.peek')).toBeNull()
    })
})
