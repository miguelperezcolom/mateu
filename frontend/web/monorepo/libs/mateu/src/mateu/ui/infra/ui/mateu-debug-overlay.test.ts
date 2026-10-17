// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import './mateu-debug-overlay'

/**
 * The developer's debug overlay: a 🐛 button opening a panel with the app state, the app data and
 * an inspector that outlines the mateu-* element under the pointer and shows its state/data/metadata.
 */
const mount = async () => {
    const el = document.createElement('mateu-debug-overlay') as HTMLElement & { appState: unknown, appData: unknown, updateComplete: Promise<unknown> }
    el.appState = { hotel: 'H1' }
    el.appData = { user: 'ana' }
    document.body.appendChild(el)
    await el.updateComplete
    const root = el.shadowRoot as ShadowRoot
    const click = async (selector: string) => {
        (root.querySelector(selector) as HTMLElement).click()
        await el.updateComplete
    }
    const tab = async (label: string) => {
        (Array.from(root.querySelectorAll('.tab')).find(t => t.textContent!.trim() === label) as HTMLElement).click()
        await el.updateComplete
    }
    return { el, root, click, tab }
}

afterEach(() => { document.body.innerHTML = '' })

describe('mateu-debug-overlay', () => {
    it('starts as a button; opening shows the app state, the AppData tab the app data, ✕ closes', async () => {
        const { root, click, tab } = await mount()
        expect(root.querySelector('.panel')).toBeNull()
        await click('.fab')
        expect(root.querySelector('.json')?.textContent).toContain('"hotel": "H1"')
        await tab('AppData')
        expect(root.querySelector('.json')?.textContent).toContain('"user": "ana"')
        expect(root.querySelector('.tab--active')?.textContent?.trim()).toBe('AppData')
        await click('.close-btn')
        expect(root.querySelector('.panel')).toBeNull()
        expect(root.querySelector('.fab')).not.toBeNull()
    })

    it('the inspector outlines the hovered mateu element and shows what it holds, and lets go when the pointer leaves', async () => {
        const { el, root, click, tab } = await mount()
        await click('.fab')
        await tab('Inspector')
        expect(root.textContent).toContain('Hover a mateu-* element')

        const target = document.createElement('mateu-thing') as HTMLElement & Record<string, unknown>
        target.id = 'orders'
        target.state = { page: 2 }
        target.data = { rows: 3 }
        target.component = { metadata: { type: 'Crud' } }
        const inner = document.createElement('span')
        target.appendChild(inner)
        document.body.appendChild(target)
        const outside = document.createElement('div')
        document.body.appendChild(outside)

        inner.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))
        await el.updateComplete
        expect(target.style.outline).toContain('2px solid')
        expect(root.querySelector('.inspector-tag')?.textContent).toBe('<mateu-thing id="orders">')
        const blocks = Array.from(root.querySelectorAll('.json')).map(b => b.textContent)
        expect(blocks[0]).toContain('"page": 2')
        expect(blocks[1]).toContain('"rows": 3')
        expect(blocks[2]).toContain('"type": "Crud"')

        const other = document.createElement('mateu-other')
        document.body.appendChild(other)
        other.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))
        await el.updateComplete
        expect(target.style.outline).toBe('')
        expect(root.querySelector('.inspector-tag')?.textContent).toBe('<mateu-other>')

        outside.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))
        await el.updateComplete
        expect(other.style.outline).toBe('')
        expect(root.textContent).toContain('Hover a mateu-* element')
    })

    it('removed from the page, it leaves no outline behind', async () => {
        const { el } = await mount()
        const target = document.createElement('mateu-thing')
        document.body.appendChild(target)
        target.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))
        expect(target.style.outline).not.toBe('')
        el.remove()
        expect(target.style.outline).toBe('')
    })
})
