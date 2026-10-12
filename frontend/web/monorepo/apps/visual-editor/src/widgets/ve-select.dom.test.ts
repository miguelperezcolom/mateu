// @vitest-environment jsdom
import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import { html, render } from 'lit'
import type { VeSelect } from './ve-select'

beforeAll(async () => { await import('./ve-select') })
afterEach(() => { document.body.innerHTML = '' })

const settle = async (el: VeSelect) => { await new Promise((r) => setTimeout(r, 0)); await el.updateComplete }

/** A select as the panels write it: Lit `<option value ?selected>` children, a `change` handler reading `.value`. */
async function mount(selected = 'b', onChange?: (v: string) => void) {
    const host = document.createElement('div')
    document.body.appendChild(host)
    const draw = (sel: string) => render(html`
        <ve-select title="Pick" @change=${(e: Event) => onChange?.((e.target as HTMLSelectElement).value)}>
            <option value="a" ?selected=${sel === 'a'}>Alpha</option>
            <option value="b" ?selected=${sel === 'b'}>Beta</option>
            <option value="c" ?selected=${sel === 'c'} disabled>Gamma</option>
            <option value="d" ?selected=${sel === 'd'}>Delta</option>
        </ve-select>`, host)
    draw(selected)
    const el = host.querySelector('ve-select') as VeSelect
    await settle(el)
    return { el, redraw: async (sel: string) => { draw(sel); await settle(el) } }
}

const trigger = (el: VeSelect) => el.shadowRoot!.querySelector('button.trigger') as HTMLButtonElement
const items = (el: VeSelect) => [...el.shadowRoot!.querySelectorAll('li[role=option]')] as HTMLElement[]

describe('<ve-select> — the editor\'s own dropdown (a drop-in for <select>)', () => {
    it('reads its <option> children: the selected one is the value and the label on the trigger', async () => {
        const { el } = await mount('b')
        expect(el.value).toBe('b')
        expect(el.selectedIndex).toBe(1)
        expect(trigger(el).textContent).toContain('Beta')
        // nothing is open until asked
        expect(items(el)).toHaveLength(0)
    })

    it('opens its OWN list (not the native popup), drawn with the editor\'s tokens and placed fixed', async () => {
        const { el } = await mount('b')
        trigger(el).click()
        await settle(el)
        expect(items(el).map((li) => li.textContent)).toEqual(['Alpha', 'Beta', 'Gamma', 'Delta'])
        const ul = el.shadowRoot!.querySelector('ul') as HTMLElement
        expect(ul.getAttribute('style')).toMatch(/position:fixed;/)
        expect(items(el)[1].getAttribute('aria-selected')).toBe('true')
    })

    it('a pick sets the value and fires change, read like a native select', async () => {
        const seen: string[] = []
        const { el } = await mount('b', (v) => seen.push(v))
        trigger(el).click()
        await settle(el)
        items(el)[3].click()
        await settle(el)
        expect(seen).toEqual(['d'])
        expect(el.value).toBe('d')
        expect(items(el)).toHaveLength(0) // closed
    })

    it('a disabled option cannot be picked', async () => {
        const seen: string[] = []
        const { el } = await mount('b', (v) => seen.push(v))
        trigger(el).click()
        await settle(el)
        items(el)[2].click()
        expect(seen).toEqual([])
    })

    it('the keyboard: ↓ opens, ↓ moves (skipping a disabled option), Enter picks, Esc closes', async () => {
        const seen: string[] = []
        const { el } = await mount('b', (v) => seen.push(v))
        const key = (k: string) => trigger(el).dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, composed: true }))
        key('ArrowDown')
        await settle(el)
        expect(items(el)).toHaveLength(4)
        key('ArrowDown') // from Beta past the disabled Gamma, onto Delta
        await settle(el)
        key('Enter')
        await settle(el)
        expect(seen).toEqual(['d'])
        key('ArrowDown')
        await settle(el)
        key('Escape')
        await settle(el)
        expect(items(el)).toHaveLength(0)
    })

    it('the arrows it handles do not reach the editor (which would walk the layers tree)', async () => {
        const { el } = await mount('b')
        let leaked = 0
        const onKey = () => leaked++
        window.addEventListener('keydown', onKey)
        trigger(el).dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, composed: true }))
        window.removeEventListener('keydown', onKey)
        expect(leaked).toBe(0)
    })

    it('follows the parent when it re-renders with another selected option', async () => {
        const { el, redraw } = await mount('b')
        await redraw('a')
        await new Promise((r) => setTimeout(r, 0)) // the MutationObserver
        await el.updateComplete
        expect(el.value).toBe('a')
        expect(trigger(el).textContent).toContain('Alpha')
    })

    it('closes on a press outside it', async () => {
        const { el } = await mount('b')
        trigger(el).click()
        await settle(el)
        document.body.dispatchEvent(new Event('pointerdown', { bubbles: true, composed: true }))
        await settle(el)
        expect(items(el)).toHaveLength(0)
    })
})
