// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import './mateu-column-chooser'
import type { MateuColumnChooser } from './mateu-column-chooser'
import './mateu-tree-select'
import type { MateuTreeSelect } from './mateu-tree-select'
import { readColumnPrefs } from '../columnPrefsStore.ts'

/**
 * Column chooser (listing personalization): hide/show and reorder the OFFERABLE columns — the
 * identifier/action/select ones are protected — persisted per listing path, announced to the
 * host crud with `column-prefs-changed`.
 */
describe('mateu-column-chooser', () => {
    const COLUMNS = [
        { id: 'select', label: '', protected: true },
        { id: 'name', label: 'Name', protected: false },
        { id: 'city', label: 'City', protected: false },
        { id: 'age', label: 'Age', protected: false },
    ]
    let changes: number

    const mount = async (columns = COLUMNS) => {
        const c = document.createElement('mateu-column-chooser') as MateuColumnChooser
        c.columns = columns
        c.scope = '/people'
        c.addEventListener('column-prefs-changed', () => changes++)
        document.body.appendChild(c)
        await c.updateComplete
        return c
    }
    const $ = (c: MateuColumnChooser, sel: string) => c.shadowRoot!.querySelector(sel) as HTMLElement
    const rows = (c: MateuColumnChooser) => Array.from(c.shadowRoot!.querySelectorAll('.row')).map(r => r.getAttribute('data-column-id'))
    const row = (c: MateuColumnChooser, id: string) => c.shadowRoot!.querySelector(`.row[data-column-id="${id}"]`) as HTMLElement
    const open = async (c: MateuColumnChooser) => { $(c, '.trigger').click(); await c.updateComplete }

    beforeEach(() => { localStorage.clear(); changes = 0 })
    afterEach(() => { document.body.innerHTML = '' })

    it('renders nothing when no column can be personalized', async () => {
        const c = await mount([{ id: 'select', label: '', protected: true }])
        expect($(c, '.trigger')).toBeNull()
    })

    it('offers only the unprotected columns; the trigger says whether it is open', async () => {
        const c = await mount()
        expect($(c, '.trigger').getAttribute('aria-expanded')).toBe('false')
        await open(c)
        expect($(c, '.trigger').getAttribute('aria-expanded')).toBe('true')
        expect(rows(c)).toEqual(['name', 'city', 'age'])
    })

    it('unticking a column hides it, persists for this path and tells the host', async () => {
        const c = await mount()
        await open(c)
        const box = row(c, 'city').querySelector('input') as HTMLInputElement
        box.checked = false
        box.dispatchEvent(new Event('change'))
        await c.updateComplete
        expect(readColumnPrefs('/people')!.hidden).toEqual(['city'])
        expect(changes).toBe(1)
        expect($(c, '.trigger').classList.contains('active')).toBe(true)
        // ticking it again shows it back
        const again = row(c, 'city').querySelector('input') as HTMLInputElement
        again.dispatchEvent(new Event('change'))
        expect(readColumnPrefs('/people')?.hidden ?? []).toEqual([])
    })

    it('moving a column swaps it with its OFFERABLE neighbour; protected ones keep their slot', async () => {
        const c = await mount()
        await open(c)
        // the first offerable can't go up; the last can't go down
        const [nameUp] = Array.from(row(c, 'name').querySelectorAll('button.move')) as HTMLButtonElement[]
        const ageDown = (Array.from(row(c, 'age').querySelectorAll('button.move')) as HTMLButtonElement[])[1]
        expect(nameUp.disabled).toBe(true)
        expect(ageDown.disabled).toBe(true)
        ;(Array.from(row(c, 'city').querySelectorAll('button.move'))[0] as HTMLButtonElement).click()
        await c.updateComplete
        expect(rows(c)).toEqual(['city', 'name', 'age'])
        expect(readColumnPrefs('/people')!.order).toEqual(['select', 'city', 'name', 'age'])
    })

    it('the move buttons are named after their column', async () => {
        const c = await mount()
        await open(c)
        const up = row(c, 'city').querySelector('button.move') as HTMLElement
        expect(up.getAttribute('aria-label')).toContain('City')
    })

    it('Reset forgets the personalization and is disabled when there is none', async () => {
        const c = await mount()
        await open(c)
        expect(($(c, '.reset') as HTMLButtonElement).disabled).toBe(true)
        const box = row(c, 'age').querySelector('input') as HTMLInputElement
        box.dispatchEvent(new Event('change'))
        await c.updateComplete
        ;($(c, '.reset') as HTMLButtonElement).click()
        await c.updateComplete
        expect(readColumnPrefs('/people')).toBeFalsy()
        expect(changes).toBe(2)
    })

    it('a click outside closes the panel', async () => {
        const c = await mount()
        await open(c)
        document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, composed: true }))
        await c.updateComplete
        expect($(c, '.panel')).toBeNull()
    })
})

/** @TreeSelect: a select whose options are a tree; with leavesOnly a group only expands. */
describe('mateu-tree-select', () => {
    const OPTIONS = [
        { value: 'eu', label: 'Europe', children: [
            { value: 'es', label: 'Spain', children: [{ value: 'pmi', label: 'Palma' }] },
            { value: 'fr', label: 'France' },
        ] },
        { value: 'us', label: 'USA' },
    ]
    let picked: unknown[]

    const mount = async (props: Partial<MateuTreeSelect> = {}) => {
        const t = document.createElement('mateu-tree-select') as MateuTreeSelect
        Object.assign(t, { fieldId: 'zone', options: OPTIONS, ...props })
        t.addEventListener('value-changed', (e) => picked.push((e as CustomEvent).detail))
        document.body.appendChild(t)
        await t.updateComplete
        return t
    }
    const $ = (t: MateuTreeSelect, sel: string) => t.shadowRoot!.querySelector(sel) as HTMLElement
    const nodes = (t: MateuTreeSelect) => Array.from(t.shadowRoot!.querySelectorAll('.node:not(.node--clear)')) as HTMLElement[]
    const labels = (t: MateuTreeSelect) => nodes(t).map(n => n.textContent!.replace(/[▸▾]/g, '').trim())
    const open = async (t: MateuTreeSelect) => { $(t, '.control').click(); await t.updateComplete }

    beforeEach(() => { picked = [] })
    afterEach(() => { document.body.innerHTML = '' })

    it('shows the current value by its label (found at any depth)', async () => {
        const t = await mount({ value: 'pmi' })
        expect($(t, '.control').textContent).toContain('Palma')
    })

    it('opens with the path to the current value expanded, so the selection is visible', async () => {
        const t = await mount({ value: 'pmi' })
        await open(t)
        expect($(t, '.control').getAttribute('aria-expanded')).toBe('true')
        expect(labels(t)).toEqual(['Europe', 'Spain', 'Palma', 'France', 'USA'])
        expect(t.shadowRoot!.querySelector('.node--selected')!.textContent).toContain('Palma')
    })

    it('the caret expands a node without selecting it', async () => {
        const t = await mount()
        await open(t)
        expect(labels(t)).toEqual(['Europe', 'USA'])
        const caret = nodes(t)[0].querySelector('.caret') as HTMLElement
        expect(caret.getAttribute('aria-expanded')).toBe('false')
        caret.click()
        await t.updateComplete
        expect(labels(t)).toEqual(['Europe', 'Spain', 'France', 'USA'])
        expect(picked).toEqual([])
    })

    it('a group IS selectable by default', async () => {
        const t = await mount()
        await open(t)
        nodes(t)[0].click()
        expect(picked).toEqual([{ value: 'eu', fieldId: 'zone' }])
    })

    it('leavesOnly: clicking a group only expands it; a leaf commits and closes', async () => {
        const t = await mount({ leavesOnly: true })
        await open(t)
        nodes(t)[0].click()
        await t.updateComplete
        expect(picked).toEqual([])
        expect(labels(t)).toContain('France')
        nodes(t).find(n => n.textContent!.includes('France'))!.click()
        await t.updateComplete
        expect(picked).toEqual([{ value: 'fr', fieldId: 'zone' }])
        expect($(t, '.panel')).toBeNull()
    })

    it('nodes are operable with the keyboard', async () => {
        const t = await mount()
        await open(t)
        nodes(t)[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
        expect(picked).toEqual([{ value: 'us', fieldId: 'zone' }])
    })

    it('with a value, offers a clear row in the page language', async () => {
        document.documentElement.lang = 'es'
        try {
            const t = await mount({ value: 'us' })
            await open(t)
            const clear = $(t, '.node--clear')
            expect(clear.textContent).toBe('— Limpiar')
            clear.click()
            expect(picked).toEqual([{ value: undefined, fieldId: 'zone' }])
        } finally {
            document.documentElement.lang = ''
        }
    })
})
