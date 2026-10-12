// @vitest-environment jsdom
import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import type { VeSourcePicker } from './ve-source-picker'

beforeAll(async () => {
    window.matchMedia ??= ((q: string) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} })) as any
    await import('./ve-source-picker')
})
afterEach(() => { document.body.innerHTML = '' })

const settle = async (el: VeSourcePicker) => { await new Promise((r) => setTimeout(r, 0)); await el.updateComplete }

async function mount(value: unknown) {
    const el = document.createElement('ve-source-picker') as VeSourcePicker
    el.value = value
    el.sources = [{ name: 'customers', description: 'CRM' }, { name: 'inbox' }]
    const seen: unknown[] = []
    el.addEventListener('change', (e) => seen.push((e.target as VeSourcePicker).value))
    document.body.appendChild(el)
    await settle(el)
    const select = el.shadowRoot!.querySelector('ve-select') as any
    return { el, seen, select, url: () => el.shadowRoot!.querySelector('input') as HTMLInputElement | null }
}

describe('<ve-source-picker> — a named source of sources.yaml, or a typed url', () => {
    it('offers the project\'s sources and picks one as {ref}, keeping the other keys', async () => {
        const { el, seen, select, url } = await mount({ url: 'https://x/api', itemsPath: 'content' })
        expect([...select.querySelectorAll('option')].map((o: HTMLOptionElement) => o.value)).toEqual(['', 'customers', 'inbox'])
        expect(url()!.value).toBe('https://x/api')
        select.value = 'customers'
        select.dispatchEvent(new Event('change', { bubbles: true, composed: true }))
        await settle(el)
        // exactly one change heard outside, with the new value
        expect(seen).toEqual([{ itemsPath: 'content', ref: 'customers' }])
        expect(url()).toBeNull()
    })

    it('an unknown ref stays selected, marked; clearing everything gives \'\'', async () => {
        const { el, seen, select } = await mount({ ref: 'gone' })
        expect(select.value).toBe('gone')
        expect(select.querySelector('option[value=gone]').textContent).toContain('(unknown)')
        select.value = ''
        select.dispatchEvent(new Event('change', { bubbles: true, composed: true }))
        await settle(el)
        expect(seen).toEqual([''])
    })

    it('a typed url is written as {url}', async () => {
        const { el, seen, url } = await mount('')
        url()!.value = ' https://api.example.com/items '
        url()!.dispatchEvent(new Event('change', { bubbles: true, composed: true }))
        await settle(el)
        expect(seen).toEqual([{ url: 'https://api.example.com/items' }])
    })
})
