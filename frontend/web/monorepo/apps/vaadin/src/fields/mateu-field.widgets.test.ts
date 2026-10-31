// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import * as navigation from '@infra/ui/safeNavigate.ts'
import './mateu-field'
import type { MateuField } from './mateu-field'

/**
 * mateu-field, the widgets of the default renderer one by one: which control each declaration gets
 * and — what a user relies on — what an interaction with it writes back (`value-changed`) or asks
 * the server for (`action-requested`: lookups, remote options).
 */
const field = (over: Record<string, unknown>) => ({
    fieldId: 'f', dataType: 'string', stereotype: 'regular', label: 'Field', required: false,
    disabled: false, readOnly: false, ...over,
})

type Detail = Record<string, any>

const mount = async (f: Record<string, unknown>, state: Record<string, unknown> = {},
                     data: Record<string, unknown> = {}, id = 'f') => {
    const el = document.createElement('mateu-field') as MateuField
    el.id = id
    el.field = field(f) as never
    el.state = state
    el.data = data
    const changes: Detail[] = []
    const actions: Detail[] = []
    el.addEventListener('value-changed', (e) => changes.push((e as CustomEvent).detail))
    el.addEventListener('action-requested', (e) => actions.push((e as CustomEvent).detail))
    document.body.appendChild(el)
    await el.updateComplete
    await el.updateComplete
    return { el, root: el.shadowRoot!, changes, actions }
}

// the control's own event: it does not bubble out of the field (the field re-announces it)
const fire = (target: Element, type: string, detail?: unknown) =>
    target.dispatchEvent(new CustomEvent(type, { detail }))

afterEach(() => {
    document.body.innerHTML = ''
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
})

describe('mateu-field: a single-valued lookup (@Searchable / @Lookup)', () => {
    it('typing a code asks the server to resolve it, the search button opens the selector', async () => {
        const { root, actions } = await mount({ stereotype: 'searchable', label: 'Supplier' }, { f: 'S1' },
            { 'f-label': 'Acme' })
        const [code, description] = Array.from(root.querySelectorAll('vaadin-text-field')) as any[]
        expect(description.value).toBe('Acme')
        expect(code.getAttribute('accessible-name')).toBe('Supplier — Code')
        code.value = 'S2'
        fire(code, 'change')
        ;(root.querySelector('vaadin-button') as HTMLElement).click()
        expect(actions).toEqual([
            { actionId: 'code-f', parameters: { code: 'S2' } },
            { actionId: 'codesearch-f', parameters: {} },
        ])
    })
})

describe('mateu-field: options served by the server (remoteCoordinates)', () => {
    const remote = { remoteCoordinates: { action: 'search-f' } }

    it('a select asks for its options once and lists what came back', async () => {
        const { actions } = await mount({ stereotype: 'select', ...remote })
        expect(actions).toEqual([{ actionId: 'search-f', parameters: { searchText: '', fieldId: 'f', size: 200, page: 0, sort: undefined } }])
        const loaded = await mount({ stereotype: 'select', ...remote }, { f: { value: 'b' } },
            { f: { content: [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }], totalElements: 2 } })
        expect(loaded.actions).toEqual([])
        const select = loaded.root.querySelector('vaadin-select') as any
        expect(select.items.map((o: any) => o.label)).toEqual(['A', 'B'])
        // an Option-shaped value selects by its code
        expect(select.value).toBe('b')
    })

    it('a radio group asks for its options and renders one radio per option, the current one checked', async () => {
        const empty = await mount({ stereotype: 'radio', ...remote })
        expect(empty.actions.map(a => a.actionId)).toEqual(['search-f'])
        const { root } = await mount({ stereotype: 'radio', ...remote }, { f: 'b' },
            { f: { content: [{ value: 'a', label: 'A' }, { value: 'b', label: 'B', description: 'Second' }], totalElements: 2 } })
        const radios = Array.from(root.querySelectorAll('vaadin-radio-button')) as any[]
        expect(radios.map(r => r.getAttribute('value'))).toEqual(['a', 'b'])
        expect(radios[1].hasAttribute('checked')).toBe(true)
        expect(radios[1].textContent).toContain('Second')
    })

    it('a list box asks for its options and a pick writes the option value, not its index', async () => {
        const empty = await mount({ stereotype: 'listBox', ...remote })
        expect(empty.actions.map(a => a.actionId)).toEqual(['search-f'])
        const { root, changes } = await mount({ stereotype: 'listBox', ...remote }, { f: 'b' },
            { f: { content: [{ value: 'a', label: 'A' }, { value: 'b', label: 'B', icon: 'vaadin:star' }], totalElements: 2 } })
        const list = root.querySelector('vaadin-list-box')!
        expect(list.getAttribute('selected')).toBe('1')
        expect(root.querySelectorAll('vaadin-item').length).toBe(2)
        fire(list, 'selected-changed', { value: 0 })
        expect(changes.at(-1)).toEqual({ value: 'a', fieldId: 'f' })
    })

    it('a multi-valued list box writes the values of the picked indexes, and nothing when unchanged', async () => {
        const { root, changes } = await mount({ stereotype: 'listBox', dataType: 'array', ...remote }, { f: ['a'] },
            { f: { content: [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }], totalElements: 2 } })
        const list = root.querySelector('vaadin-list-box') as any
        expect(list.selectedValues).toEqual([0])
        fire(list, 'selected-values-changed', { value: [0] })
        expect(changes).toEqual([])
        fire(list, 'selected-values-changed', { value: [0, 1] })
        expect(changes).toEqual([{ value: ['a', 'b'], fieldId: 'f' }])
    })

    it('a multi-valued checkbox group asks for its options after the first render', async () => {
        // it used to schedule the request behind a flag that render() had always already set: never sent
        const { root, actions } = await mount({ dataType: 'array', stereotype: 'regular', ...remote })
        expect(actions.map(a => a.actionId)).toEqual(['search-f'])
        const loaded = await mount({ dataType: 'array', stereotype: 'regular', optionsColumns: 2, ...remote }, { f: ['a'] },
            { f: { content: [{ value: 'a', label: 'A' }], totalElements: 1 } })
        expect(root.querySelector('vaadin-checkbox-group')).not.toBeNull()
        const group = loaded.root.querySelector('vaadin-checkbox-group')!
        expect(group.className).toContain('multi-column')
        expect(group.querySelectorAll('vaadin-checkbox').length).toBe(1)
    })
})

describe('mateu-field: a remote combo box (type-ahead against the server)', () => {
    const remote = { stereotype: 'combobox', remoteCoordinates: { action: 'search-f' } }

    it('each keystroke searches the server and only the LATEST search answers the combo', async () => {
        const { root, actions } = await mount(remote, {}, {})
        const combo = root.querySelector('vaadin-combo-box') as any
        const results: unknown[][] = []
        combo.dataProvider({ filter: 'ma', page: 0, pageSize: 50 }, (items: unknown[]) => results.push(items))
        combo.dataProvider({ filter: 'mad', page: 0, pageSize: 50 }, (items: unknown[]) => results.push(items))
        const [first, second] = actions.slice(-2)
        expect(second.actionId).toBe('search-f')
        expect(second.parameters).toEqual({ searchText: 'mad', fieldId: 'f', size: 50, page: 0, sort: undefined })
        expect(second.callbackonly).toBe(true)
        // the slow answer for "ma" arrives after "mad" was typed: dropped
        first.callback({ fragments: [{ data: { f: { content: [{ value: 'x', label: 'Mallorca' }], totalElements: 1 } } }] })
        second.callback({ fragments: [{ data: { f: { content: [{ value: 'm', label: 'Madrid' }], totalElements: 1 } } }] })
        expect(results).toEqual([[{ value: 'm', label: 'Madrid' }]])
    })

    it('a search with no result empties the list', async () => {
        const { root, actions } = await mount(remote)
        const combo = root.querySelector('vaadin-combo-box') as any
        const results: [unknown[], number][] = []
        combo.dataProvider({ filter: 'zz', page: 0, pageSize: 50 }, (items: unknown[], size: number) => results.push([items, size]))
        actions.at(-1)!.callback({ fragments: [] })
        expect(results).toEqual([[[], 0]])
    })

    it('shows the current value by the label the server sent with the state', async () => {
        const { root } = await mount(remote, { f: 'm' }, { 'f-label': 'Madrid' })
        expect((root.querySelector('vaadin-combo-box') as any).selectedItem).toEqual({ value: 'm', label: 'Madrid' })
    })

    it('a multi-select remote combo writes the picked values', async () => {
        const { root, changes } = await mount({ ...remote, dataType: 'array' }, { f: [] })
        const combo = root.querySelector('vaadin-multi-select-combo-box')!
        fire(combo, 'selected-items-changed', { value: [{ value: 'm', label: 'Madrid' }] })
        expect(changes).toEqual([{ value: ['m'], fieldId: 'f' }])
    })
})

describe('mateu-field: local option widgets', () => {
    const options = [{ value: 'a', label: 'A' }, { value: 'b', label: 'B', description: 'Bee' }]

    it('a combo box offers the declared options', async () => {
        const { root } = await mount({ stereotype: 'combobox', options }, { f: 'a' })
        const combo = root.querySelector('vaadin-combo-box') as any
        expect(combo.items).toEqual(options)
    })

    it('a list box selects the current option and a pick writes its value', async () => {
        const { root, changes } = await mount({ stereotype: 'listBox', options }, { f: 'b' })
        const list = root.querySelector('vaadin-list-box')!
        expect(list.getAttribute('selected')).toBe('1')
        expect(list.textContent).toContain('Bee')
        fire(list, 'selected-changed', { value: 0 })
        expect(changes).toEqual([{ value: 'a', fieldId: 'f' }])
    })

    it('a multi list box and a multi combo write the picked values', async () => {
        const list = await mount({ stereotype: 'listBox', dataType: 'array', options }, { f: [] })
        fire(list.root.querySelector('vaadin-list-box')!, 'selected-values-changed', { value: [1] })
        expect(list.changes).toEqual([{ value: ['b'], fieldId: 'f' }])
        document.body.innerHTML = ''
        const combo = await mount({ stereotype: 'combobox', dataType: 'array', options }, { f: ['a'] })
        const el = combo.root.querySelector('vaadin-multi-select-combo-box') as any
        expect(el.selectedItems).toEqual([options[0]])
        fire(el, 'selected-items-changed', { value: options })
        expect(combo.changes).toEqual([{ value: ['a', 'b'], fieldId: 'f' }])
    })

    it('a checkbox group carries one checkbox per option and the current values', async () => {
        const { root } = await mount({ dataType: 'array', options }, { f: ['b'] })
        const group = root.querySelector('vaadin-checkbox-group') as any
        expect(group.value).toEqual(['b'])
        expect(group.querySelectorAll('vaadin-checkbox').length).toBe(2)
    })

    it('choice (single and multi), popover and the array grid render their own components', async () => {
        for (const [over, tag] of [
            [{ stereotype: 'choice', options }, 'mateu-choice'],
            [{ stereotype: 'choice', dataType: 'array', options }, 'mateu-choice'],
            [{ stereotype: 'popover', options }, 'vaadin-popover'],
            [{ stereotype: 'grid', dataType: 'array', columns: [] }, 'mateu-grid'],
        ] as [Record<string, unknown>, string][]) {
            const { root } = await mount(over, {})
            expect(root.querySelector(tag), tag).not.toBeNull()
            document.body.innerHTML = ''
        }
    })
})

describe('mateu-field: text-like widgets', () => {
    it('markdown and html are a source editor with a preview, and their edits carry the field id', async () => {
        const md = await mount({ stereotype: 'markdown' }, { f: '# Hi' })
        const editor = md.root.querySelector('mateu-markup-editor')!
        expect(md.root.querySelector('mateu-markdown')).not.toBeNull()
        const outer: unknown[] = []
        md.el.parentElement!.addEventListener('value-changed', (e) => outer.push((e as CustomEvent).detail))
        editor.dispatchEvent(new CustomEvent('value-changed', { detail: { value: '# Bye' }, bubbles: true, composed: true }))
        // the editor's own event is swallowed and re-announced as the field's
        expect(md.changes).toEqual([{ value: '# Bye', fieldId: 'f' }])
        expect(outer).toEqual([{ value: '# Bye', fieldId: 'f' }])
        document.body.innerHTML = ''
        const h = await mount({ stereotype: 'html' }, { f: '<b>bold</b><script>alert(1)</script>' })
        const preview = h.root.querySelector('[slot="preview"]')!
        expect(preview.querySelector('b')?.textContent).toBe('bold')
        expect(preview.querySelector('script')).toBeNull()
    })

    it('rich text uses the Tiptap editor', async () => {
        const { root } = await mount({ stereotype: 'richText' }, { f: '<p>x</p>' })
        expect(root.querySelector('mateu-rich-text-editor')).not.toBeNull()
    })

    it('an editable link opens its value in a new tab through the safe navigator', async () => {
        const nav = vi.spyOn(navigation, 'safeNavigate').mockImplementation(() => true as never)
        const { root } = await mount({ stereotype: 'link' }, { f: 'https://mateu.io' })
        ;(root.querySelector('vaadin-icon[icon="vaadin:external-link"]') as HTMLElement).click()
        expect(nav).toHaveBeenCalledWith('https://mateu.io', { newTab: true })
    })

    it('an icon field: read-only shows the icon, editable filters the catalogue as the user types', async () => {
        const ro = await mount({ stereotype: 'icon', readOnly: false }, { f: 'vaadin:star' })
        const combo = ro.root.querySelector('vaadin-combo-box') as any
        expect(ro.root.querySelector('vaadin-icon[slot="prefix"]')!.getAttribute('icon')).toBe('vaadin:star')
        fire(combo, 'filter-changed', { value: 'vaadin:sta' })
        await ro.el.updateComplete
        expect(combo.filteredItems.length).toBeGreaterThan(0)
        expect(combo.filteredItems.every((i: string) => i.includes('vaadin:sta'))).toBe(true)
    })

    it('an image shows its value as the picture', async () => {
        const { root } = await mount({ stereotype: 'image', label: 'Logo' }, { f: 'https://x/logo.png' })
        const img = root.querySelector('img')!
        expect(img.getAttribute('src')).toBe('https://x/logo.png')
        expect(img.getAttribute('alt')).toBe('Logo')
    })

    it('an empty money field starts in its declared currency (EUR when none is declared)', async () => {
        const declared = await mount({ dataType: 'money', attributes: [{ key: 'currency', value: 'usd' }] }, {})
        const money = declared.root.querySelector('mateu-money-field') as any
        await money.updateComplete
        expect(money.defaultCurrency).toBe('USD')
        expect((money.shadowRoot.querySelector('vaadin-select') as any).value).toBe('USD')
        money.valueChanged(new CustomEvent('value-changed', { detail: { value: '12' } }))
        expect(declared.changes.at(-1)).toEqual({ value: { value: 12, currency: 'USD', locale: 'es-ES' }, fieldId: 'f' })
        document.body.innerHTML = ''
        const plain = await mount({ dataType: 'money' }, {})
        const euro = plain.root.querySelector('mateu-money-field') as any
        await euro.updateComplete
        expect((euro.shadowRoot.querySelector('vaadin-select') as any).value).toBe('EUR')
    })

    it('a generic file upload takes its accept from the field attributes', async () => {
        const { root } = await mount({ stereotype: 'fileUpload', attributes: [{ key: 'accept', value: '.pdf' }] }, {})
        expect((root.querySelector('mateu-file-upload') as any).accept).toBe('.pdf')
    })

    it('a color field: the picker writes the chosen color, read-only shows a swatch', async () => {
        const { root, changes } = await mount({ stereotype: 'color' }, { f: '#ff0000' })
        const input = root.querySelector('input[type="color"]') as HTMLInputElement
        expect(input.value).toBe('#ff0000')
        input.value = '#00ff00'
        input.dispatchEvent(new Event('input'))
        expect(changes).toEqual([{ value: '#00ff00', fieldId: 'f' }])
    })

    it('an unknown data type says so instead of rendering nothing', async () => {
        const { root } = await mount({ dataType: 'quantum', stereotype: 'spin' }, {})
        expect(root.textContent).toContain('Unknown field type quantum / spin')
    })
})

describe('mateu-field: an uploadable image (data URI, no upload endpoint)', () => {
    it('with no image: a placeholder and Upload; with one: the image, Replace and Delete', async () => {
        const empty = await mount({ stereotype: 'uploadableImage' }, { f: '' })
        expect(empty.root.querySelector('img')).toBeNull()
        const buttons = Array.from(empty.root.querySelectorAll('vaadin-button')).map(b => b.textContent!.trim())
        expect(buttons).toEqual(['Upload'])
        document.body.innerHTML = ''
        const full = await mount({ stereotype: 'uploadableImage' }, { f: 'data:image/png;base64,AAAA' })
        expect(full.root.querySelector('img')!.getAttribute('src')).toBe('data:image/png;base64,AAAA')
        const labels = Array.from(full.root.querySelectorAll('vaadin-button')).map(b => b.textContent!.trim())
        expect(labels).toEqual(['Replace', 'Delete'])
        ;(full.root.querySelectorAll('vaadin-button')[1] as HTMLElement).click()
        expect(full.changes).toEqual([{ value: '', fieldId: 'f' }])
    })

    it('Upload opens the file picker and the picked file is written as a data URI', async () => {
        const { root, changes } = await mount({ stereotype: 'uploadableImage' }, { f: '' })
        const input = root.querySelector('input[type="file"]') as HTMLInputElement
        const click = vi.spyOn(input, 'click')
        ;(root.querySelector('vaadin-button') as HTMLElement).click()
        expect(click).toHaveBeenCalled()
        const file = new File(['png'], 'a.png', { type: 'image/png' })
        Object.defineProperty(input, 'files', { value: [file], configurable: true })
        input.dispatchEvent(new Event('change'))
        await vi.waitFor(() => expect(changes.length).toBe(1))
        expect(changes[0].value).toMatch(/^data:image\/png;base64,/)
        expect(changes[0].fieldId).toBe('f')
    })
})

describe('mateu-field: numbers, booleans, dates', () => {
    it('a number field carries its min/max/step bounds', async () => {
        const { root } = await mount({ dataType: 'number', min: 1, max: 9, step: 0.5, stepButtonsVisible: true }, { f: 2 })
        const n = root.querySelector('vaadin-number-field')!
        expect([n.getAttribute('min'), n.getAttribute('max'), n.getAttribute('step')]).toEqual(['1', '9', '0.5'])
        expect(n.hasAttribute('step-buttons-visible')).toBe(true)
    })

    it('stars: clicking the third star writes 3', async () => {
        const { root, changes } = await mount({ dataType: 'integer', stereotype: 'stars' }, { f: 1 })
        const stars = root.querySelectorAll('vaadin-icon[icon="vaadin:star"]')
        expect(stars.length).toBe(5)
        ;(stars[2] as HTMLElement).click()
        expect(changes).toEqual([{ value: 3, fieldId: 'f' }])
    })

    it('a slider writes the dragged value, within its declared bounds', async () => {
        const { root, changes } = await mount({ dataType: 'integer', stereotype: 'slider', sliderMin: 2, sliderMax: 8 }, { f: 4 })
        const range = root.querySelector('input[type="range"]') as HTMLInputElement
        expect([range.getAttribute('min'), range.getAttribute('max')]).toEqual(['2', '8'])
        range.value = '6'
        range.dispatchEvent(new Event('input'))
        expect(changes).toEqual([{ value: '6', fieldId: 'f' }])
    })

    it('a checkbox writes its checked state', async () => {
        const { root, changes } = await mount({ dataType: 'bool', label: 'Active' }, { f: false })
        const box = root.querySelector('vaadin-checkbox') as any
        box.checked = true
        box.dispatchEvent(new Event('change'))
        expect(changes).toEqual([{ value: true, fieldId: 'f' }])
    })

    it('a date range is shown as from;to and written back as {from, to}', async () => {
        const { root, changes } = await mount({ dataType: 'dateRange' }, { f: { from: '2026-01-01', to: '2026-01-31' } })
        const picker = root.querySelector('vcf-date-range-picker')!
        expect(picker.getAttribute('value')).toBe('2026-01-01;2026-01-31')
        fire(picker, 'value-changed', { value: '2026-02-01;2026-02-28' })
        expect(changes).toEqual([{ value: { from: '2026-02-01', to: '2026-02-28' }, fieldId: 'f' }])
    })

    it('date, date-time and time pick their own pickers', async () => {
        for (const [dataType, tag] of [['date', 'vaadin-date-picker'], ['dateTime', 'vaadin-date-time-picker'], ['time', 'vaadin-time-picker']]) {
            const { root, changes } = await mount({ dataType }, { f: null })
            const picker = root.querySelector(tag)!
            expect(picker, tag).not.toBeNull()
            fire(picker, 'value-changed', { value: '2026-03-03' })
            expect(changes).toEqual([{ value: '2026-03-03', fieldId: 'f' }])
            document.body.innerHTML = ''
        }
    })

    it('a range writes {from, to} when either thumb moves', async () => {
        const { root, changes } = await mount({ dataType: 'range', sliderMin: 0, sliderMax: 100 }, { f: { from: 10, to: 20 } })
        const slider = root.querySelector('mateu-range-slider') as any
        expect([slider.getAttribute('start-value'), slider.getAttribute('end-value')]).toEqual(['10', '20'])
        slider.startValue = 15
        slider.endValue = 30
        slider.dispatchEvent(new Event('change'))
        expect(changes).toEqual([{ value: { from: 15, to: 30 }, fieldId: 'f' }])
    })
})

describe('mateu-field: money and status', () => {
    it('an editable money field uses the money control; a read-only one shows the formatted amount', async () => {
        const edit = await mount({ dataType: 'money' }, { f: 10 })
        expect(edit.root.querySelector('mateu-money-field')).not.toBeNull()
        document.body.innerHTML = ''
        const ro = await mount({ dataType: 'money', readOnly: true }, { f: { value: 1234.5, locale: 'en-US', currency: 'EUR' } })
        expect(ro.root.textContent).toContain('€1,234.50')
    })

    it('a status shows its message as a badge themed by its type', async () => {
        const { root } = await mount({ dataType: 'status', readOnly: true }, { f: { type: 'SUCCESS', message: 'Paid' } })
        const badge = root.querySelector('span[theme]')!
        expect(badge.textContent).toBe('Paid')
        expect(badge.getAttribute('theme')).toContain('success')
    })
})

describe('mateu-field: attachments (dataType file)', () => {
    it('lists the files it holds; an upload appends the server id, and only a real change is written', async () => {
        const state = { f: [{ id: '1', name: 'a.pdf' }] }
        const { root, changes } = await mount({ dataType: 'file' }, state)
        const upload = root.querySelector('vaadin-upload') as any
        expect(upload.files.map((f: any) => f.name)).toEqual(['a.pdf'])
        fire(upload, 'files-changed', { value: [{ id: '1', name: 'a.pdf' }, { name: 'pending.pdf' }] })
        expect(changes).toEqual([])
        fire(upload, 'upload-success', { xhr: { responseText: '2' }, file: { name: 'b.pdf' } })
        expect(changes.at(-1)!.value).toEqual([{ id: '1', name: 'a.pdf' }, { id: '2', name: 'b.pdf' }])
        fire(upload, 'files-changed', { value: [{ id: '3', name: 'c.pdf' }] })
        expect(changes.at(-1)).toEqual({ value: [{ id: '3', name: 'c.pdf' }], fieldId: 'f' })
    })
})

describe('mateu-field: read-only values', () => {
    it('a read-only value reads as plain text: the option label, the lookup label, or a dash', async () => {
        const option = await mount({ readOnly: true, options: [{ value: 'r1', label: 'Requisition 204' }] }, { f: 'r1' })
        expect(option.root.querySelector('vaadin-text-field')).toBeNull()
        expect(option.root.querySelector('.mateu-readonly-text')!.textContent).toContain('Requisition 204')
        document.body.innerHTML = ''
        const lookup = await mount({ readOnly: true }, { f: 'ES' }, { 'f-label': 'Spain' })
        expect(lookup.root.textContent).toContain('Spain')
        document.body.innerHTML = ''
        const amount = await mount({ readOnly: true }, { f: { value: 'X1' } })
        expect(amount.root.textContent).toContain('X1')
        document.body.innerHTML = ''
        const none = await mount({ readOnly: true }, {})
        expect(none.root.querySelector('.mateu-readonly-text')!.textContent).toContain('—')
    })

    it('a read-only link is a link (a javascript: one is not), a read-only icon the icon, a color its swatch', async () => {
        const link = await mount({ stereotype: 'link', readOnly: true }, { f: 'https://mateu.io' })
        expect(link.root.querySelector('a')!.getAttribute('href')).toBe('https://mateu.io')
        expect(link.root.querySelector('vaadin-text-field')).toBeNull()
        document.body.innerHTML = ''
        const js = await mount({ stereotype: 'link', readOnly: true }, { f: 'javascript:alert(1)' })
        expect(js.root.querySelector('a')!.hasAttribute('href')).toBe(false)
        document.body.innerHTML = ''
        const icon = await mount({ stereotype: 'icon', readOnly: true }, { f: 'vaadin:star' })
        expect(icon.root.querySelector('vaadin-icon')!.getAttribute('icon')).toBe('vaadin:star')
        expect(icon.root.querySelector('vaadin-text-field')).toBeNull()
        document.body.innerHTML = ''
        const color = await mount({ stereotype: 'color', readOnly: true }, { f: '#ff0000' })
        const swatch = color.root.querySelector('span[role="img"]')!
        expect(swatch.getAttribute('aria-label')).toBe('#ff0000')
        expect(swatch.getAttribute('style')).toContain('background-color: #ff0000')
        expect(color.root.querySelector('input[type="color"]')).toBeNull()
    })

    it('read-only markdown and html show the rendered content, not the source editor', async () => {
        const md = await mount({ stereotype: 'markdown', readOnly: true }, { f: '# Title' })
        expect((md.root.querySelector('mateu-markdown') as any).content).toBe('# Title')
        expect(md.root.querySelector('mateu-markup-editor')).toBeNull()
        document.body.innerHTML = ''
        const h = await mount({ stereotype: 'html', readOnly: true }, { f: '<i>it</i><script>x()</script>' })
        expect(h.root.querySelector('mateu-markup-editor')).toBeNull()
        expect(h.root.querySelector('i')!.textContent).toBe('it')
        expect(h.root.querySelector('script')).toBeNull()
    })

    it('a read-only boolean is a check or a minus with a spoken yes/no', async () => {
        const yes = await mount({ readOnly: true, dataType: 'bool' }, { f: true })
        expect(yes.root.querySelector('vaadin-icon')!.getAttribute('aria-label')).toBe('Yes')
        document.body.innerHTML = ''
        const no = await mount({ readOnly: true, dataType: 'bool' }, { f: false })
        const icon = no.root.querySelector('vaadin-icon')!
        expect(icon.getAttribute('icon')).toBe('vaadin:minus')
        expect(icon.getAttribute('aria-label')).toBe('No')
    })

    it('read-only capture/image fields show the picture, a read-only file its non-editable uploader', async () => {
        for (const stereotype of ['image', 'uploadableImage', 'signature', 'camera']) {
            const { root } = await mount({ readOnly: true, stereotype }, { f: 'data:image/png;base64,AA' })
            expect(root.querySelector('img')!.getAttribute('src'), stereotype).toBe('data:image/png;base64,AA')
            document.body.innerHTML = ''
        }
        const file = await mount({ readOnly: true, stereotype: 'fileUpload' }, { f: 'data:application/pdf;base64,AA' })
        expect((file.root.querySelector('mateu-file-upload') as any).editable).toBe(false)
    })

    it('a read-only searchable list shows the fallback label when there are no chips, and no buttons', async () => {
        const { root } = await mount({ readOnly: true, stereotype: 'searchable', dataType: 'array' }, { f: [] }, { 'f-label': 'None picked' })
        expect(root.textContent).toContain('None picked')
        expect(root.querySelector('vaadin-button')).toBeNull()
    })

    it('an editable searchable list: Add opens the selector', async () => {
        const { root, actions } = await mount({ stereotype: 'searchable', dataType: 'array' }, { f: ['1'] }, { 'f-labels': { '1': 'Ada' } })
        ;(root.querySelector('.searchable-add') as HTMLElement).click()
        expect(actions).toEqual([{ actionId: 'codesearch-f', parameters: {} }])
    })
})

describe('mateu-field: plain text, badges, bulleted lists and property rows', () => {
    it('multiline plain text keeps its line breaks; a boolean plain text is an icon', async () => {
        const ml = await mount({ stereotype: 'plainText', multiline: true }, { f: 'a\nb' })
        expect((ml.root.querySelector('vaadin-custom-field span') as HTMLElement).getAttribute('style')).toContain('pre-wrap')
        document.body.innerHTML = ''
        const b = await mount({ stereotype: 'plainText', dataType: 'bool' }, { f: true })
        expect(b.root.querySelector('vaadin-icon')!.getAttribute('icon')).toBe('vaadin:check')
    })

    it('a bulleted list of a single value is a one-item list; no value, an empty list', async () => {
        const one = await mount({ stereotype: 'bulletedList' }, { f: 'Only' })
        expect((one.root.querySelector('mateu-bulleted-list') as any).items).toEqual(['Only'])
        document.body.innerHTML = ''
        const none = await mount({ stereotype: 'bulletedList' }, { f: null })
        expect((none.root.querySelector('mateu-bulleted-list') as any).items).toEqual([])
    })

    it('a property row shows a lookup by its label and a boolean as an icon', async () => {
        const lookup = await mount({ propertyRow: true, readOnly: true, label: 'Country' }, { f: 'ES' }, { 'f-label': 'Spain' })
        expect(lookup.root.textContent).toContain('Spain')
        expect(lookup.root.textContent).not.toContain('ES')
        document.body.innerHTML = ''
        const bool = await mount({ propertyRow: true, readOnly: true, dataType: 'bool' }, { f: true })
        expect(bool.root.querySelector('vaadin-icon')!.getAttribute('aria-label')).toBe('Yes')
    })

    it('an off badge is dimmed, an on badge themed success', async () => {
        const off = await mount({ stereotype: 'badge', label: 'VIP' }, { f: false })
        expect(off.root.querySelector('span')!.getAttribute('style')).toContain('opacity')
        document.body.innerHTML = ''
        const on = await mount({ stereotype: 'badge', label: 'VIP' }, { f: 'true' })
        expect(on.root.querySelector('span')!.getAttribute('theme')).toContain('success')
    })
})

describe('mateu-field: the navigation link beside a field (@LinkTo)', () => {
    it('follows the value: href and title interpolated against the state, external icon for http', async () => {
        const { root } = await mount({ link: { href: 'https://crm/${state.f}', title: 'Open ${state.f}', target: '_blank' } }, { f: 'C1' })
        const a = root.querySelector('a[data-navlink]')!
        expect(a.getAttribute('href')).toBe('https://crm/C1')
        expect(a.getAttribute('title')).toBe('Open C1')
        expect(a.getAttribute('target')).toBe('_blank')
        expect(a.querySelector('vaadin-icon')!.getAttribute('icon')).toBe('vaadin:external-link')
    })

    it('an in-app link gets the link icon and its href as title; a javascript: href is dropped', async () => {
        const inApp = await mount({ link: { href: '/customers/${state.f}' } }, { f: 'C1' })
        const a = inApp.root.querySelector('a[data-navlink]')!
        expect(a.getAttribute('title')).toBe('/customers/C1')
        expect(a.querySelector('vaadin-icon')!.getAttribute('icon')).toBe('vaadin:link')
        document.body.innerHTML = ''
        const js = await mount({ link: { href: 'javascript:alert(1)' } }, {})
        expect(js.root.querySelector('a[data-navlink]')!.hasAttribute('href')).toBe(false)
    })
})

describe('mateu-field: accessible name and help', () => {
    it('a control whose label is hidden is still named, from its humanized id', async () => {
        const { root } = await mount({ fieldId: 'recordSwitcher', label: '' }, { recordSwitcher: 'x' }, {}, 'recordSwitcher')
        expect((root.querySelector('vaadin-text-field') as any).accessibleName).toBe('Record switcher')
    })

    it('a description is the control helper text and is not repeated below it', async () => {
        const { root } = await mount({ description: 'Hint for ${state.f}' }, { f: 'x' })
        expect((root.querySelector('vaadin-text-field') as any).helperText).toBe('Hint for x')
        // no second copy in the fallback help div under the control
        expect(Array.from(root.querySelectorAll('div:not([slot])')).some(d => d.textContent?.trim() === 'Hint for x')).toBe(false)
    })

    it('a branch with no helper slot shows the description below the control', async () => {
        const { root } = await mount({ stereotype: 'plainText', description: 'Below' }, { f: 'x' })
        expect(root.textContent).toContain('Below')
    })
})
