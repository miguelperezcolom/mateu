// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Sortable drives the drag-to-reorder; the test plays its onEnd callback
const sortables: { el: HTMLElement, options: { onEnd: (e: { oldIndex?: number, newIndex?: number }) => void, handle: string }, destroy: ReturnType<typeof vi.fn> }[] = []
vi.mock('sortablejs', () => ({
    default: {
        create: (el: HTMLElement, options: never) => {
            const s = { el, options, destroy: vi.fn() }
            sortables.push(s)
            return s
        },
    },
}))

import './mateu-form-editor'
import type { MateuFormEditor } from './mateu-form-editor'

/**
 * The form-definition editor field: a list of fields (drag handle, type badge, label, id,
 * required/stereotype badges, duplicate/delete), a properties panel for the selected one, form
 * settings, and every edit emitted as the new definition JSON through value-changed.
 */
describe('mateu-form-editor (DOM)', () => {
    const FORM = {
        name: 'Guest Form',
        fields: [
            { id: 'name', label: 'Name', dataType: 'string', required: true },
            { id: 'age', label: 'Age', dataType: 'integer', stereotype: 'slider' },
            { id: 'vip', label: 'VIP', dataType: 'bool', stereotype: 'regular' },
        ],
    }
    let emitted: { name: string, description?: string, fields: Record<string, unknown>[] }[]
    const listener = (e: Event) => emitted.push(JSON.parse((e as CustomEvent).detail.value))

    const mount = async (value: unknown = FORM) => {
        const el = document.createElement('mateu-form-editor') as MateuFormEditor
        el.value = typeof value === 'string' ? value : JSON.stringify(value)
        document.body.appendChild(el)
        await el.updateComplete
        await el.updateComplete
        return el
    }
    const $ = (el: MateuFormEditor, sel: string) => el.shadowRoot!.querySelector(sel) as HTMLElement
    const $$ = (el: MateuFormEditor, sel: string) => Array.from(el.shadowRoot!.querySelectorAll(sel)) as HTMLElement[]
    const button = (el: MateuFormEditor, text: string) => $$(el, '.toolbar button').find(b => b.textContent!.includes(text))!
    const row = (el: MateuFormEditor, id: string) => $(el, `.field-row[data-id="${id}"]`)
    const prop = (el: MateuFormEditor, label: string) =>
        $$(el, '.prop-field').find(f => f.querySelector('.prop-label')!.textContent === label)!.querySelector('input, select, textarea') as HTMLInputElement
    const change = async (el: MateuFormEditor, input: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement, value: string | boolean) => {
        if (typeof value === 'boolean') (input as HTMLInputElement).checked = value
        else input.value = value
        input.dispatchEvent(new Event('change'))
        await el.updateComplete
    }

    beforeEach(() => { emitted = []; sortables.length = 0; document.addEventListener('value-changed', listener) })
    afterEach(() => { document.removeEventListener('value-changed', listener); document.body.innerHTML = ''; vi.restoreAllMocks() })

    it('lists the fields with their type, label, id and badges', async () => {
        const el = await mount()
        expect($(el, '.form-name').textContent).toBe('Guest Form')
        const rows = $$(el, '.field-row')
        expect(rows.map(r => r.dataset.id)).toEqual(['name', 'age', 'vip'])
        expect(rows[0].querySelector('.type-badge')!.textContent).toBe('string')
        expect(rows[0].querySelector('.field-label-text')!.textContent).toBe('Name')
        expect(rows[0].querySelector('.required-badge')).not.toBeNull()
        expect(rows[1].querySelector('.stereo-badge')!.textContent).toBe('slider')
        // "regular" is the default: no badge
        expect(rows[2].querySelector('.stereo-badge')).toBeNull()
        expect($(el, '.empty')).toBeNull()
    })

    it('an empty form invites to add a field; invalid JSON keeps the previous definition', async () => {
        const el = await mount({ name: 'Empty', fields: [] })
        expect($(el, '.empty').textContent).toContain('Add Field')
        el.value = 'not json'
        await el.updateComplete
        expect($(el, '.form-name').textContent).toBe('Empty')
    })

    it('a click (or Enter) on a row toggles its properties panel', async () => {
        const el = await mount()
        row(el, 'age').click()
        await el.updateComplete
        expect(row(el, 'age').classList.contains('selected')).toBe(true)
        expect(prop(el, 'ID').value).toBe('age')
        expect(prop(el, 'Label').value).toBe('Age')
        expect(prop(el, 'Stereotype').value).toBe('slider')
        row(el, 'age').click()
        await el.updateComplete
        expect($(el, '.properties')).toBeNull()
        row(el, 'name').dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
        await el.updateComplete
        expect(prop(el, 'ID').value).toBe('name')
        $(el, '.close-btn').click()
        await el.updateComplete
        expect($(el, '.properties')).toBeNull()
    })

    it('editing the selected field emits the whole definition with the change', async () => {
        const el = await mount()
        row(el, 'vip').click()
        await el.updateComplete
        await change(el, prop(el, 'Label'), 'Is VIP')
        await change(el, prop(el, 'Data type'), 'status')
        await change(el, prop(el, 'Stereotype'), 'toggle')
        await change(el, $(el, '.prop-field.row input') as HTMLInputElement, true)
        await change(el, prop(el, 'Description / hint'), 'A hint')
        expect(emitted.at(-1)!.fields[2]).toEqual({ id: 'vip', label: 'Is VIP', dataType: 'status', stereotype: 'toggle', required: true, description: 'A hint' })
        await change(el, prop(el, 'Description / hint'), '')
        expect(emitted.at(-1)!.fields[2].description).toBeUndefined()
        expect(row(el, 'vip').querySelector('.field-label-text')!.textContent).toBe('Is VIP')
    })

    it('Add Field appends a string field and selects it', async () => {
        const el = await mount()
        button(el, 'Add Field').click()
        await el.updateComplete
        const fields = emitted.at(-1)!.fields
        expect(fields).toHaveLength(4)
        expect(fields[3]).toMatchObject({ label: 'New Field', dataType: 'string' })
        expect(prop(el, 'ID').value).toBe(fields[3].id)
    })

    it('duplicate inserts a copy right after the source and selects it; delete removes a field', async () => {
        const el = await mount()
        row(el, 'name').querySelector<HTMLElement>('.row-btn[title="Duplicate"]')!.click()
        await el.updateComplete
        let fields = emitted.at(-1)!.fields
        expect(fields.map(f => f.label)).toEqual(['Name', 'Name (copy)', 'Age', 'VIP'])
        expect(fields[1]).toMatchObject({ dataType: 'string', required: true })
        expect(fields[1].id).not.toBe('name')
        expect(prop(el, 'ID').value).toBe(fields[1].id)

        // deleting the selected field closes the panel; the click does not also select the row
        row(el, fields[1].id as string).querySelector<HTMLElement>('.row-btn.danger')!.click()
        await el.updateComplete
        fields = emitted.at(-1)!.fields
        expect(fields.map(f => f.id)).toEqual(['name', 'age', 'vip'])
        expect($(el, '.properties')).toBeNull()
        row(el, 'age').querySelector<HTMLElement>('.row-btn.danger')!.click()
        await el.updateComplete
        expect($(el, '.properties')).toBeNull()
        expect(emitted.at(-1)!.fields.map(f => f.id)).toEqual(['name', 'vip'])
    })

    it('reordering by the drag handle moves the field and emits; a drop in place does nothing', async () => {
        const el = await mount()
        expect(sortables).toHaveLength(1)
        const sortable = sortables[0]
        expect(sortable.el).toBe($(el, '.field-list'))
        expect(sortable.options.handle).toBe('.drag-handle')
        sortable.options.onEnd({ oldIndex: 0, newIndex: 2 })
        await el.updateComplete
        expect(emitted.at(-1)!.fields.map(f => f.id)).toEqual(['age', 'vip', 'name'])
        const before = emitted.length
        sortable.options.onEnd({ oldIndex: 1, newIndex: 1 })
        sortable.options.onEnd({})
        expect(emitted).toHaveLength(before)
        el.remove()
        expect(sortable.destroy).toHaveBeenCalled()
    })

    it('Settings edits the form name and description', async () => {
        const el = await mount()
        button(el, 'Settings').click()
        await el.updateComplete
        await change(el, $(el, '.meta-panel input') as HTMLInputElement, 'Renamed')
        await change(el, $(el, '.meta-panel textarea') as HTMLTextAreaElement, 'About')
        expect(emitted.at(-1)).toMatchObject({ name: 'Renamed', description: 'About' })
        expect($(el, '.form-name').textContent).toBe('Renamed')
        button(el, 'Settings').click()
        await el.updateComplete
        expect($(el, '.meta-panel')).toBeNull()
    })

    it('Export downloads the definition as a JSON file named after it', async () => {
        const el = await mount()
        const orig = { createObjectURL: URL.createObjectURL, revokeObjectURL: URL.revokeObjectURL }
        const revokeObjectURL = vi.fn()
        Object.assign(URL, { createObjectURL: () => 'blob:f', revokeObjectURL })
        let downloaded: HTMLAnchorElement | undefined
        vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) { downloaded = this })
        button(el, 'Export').click()
        Object.assign(URL, orig)
        expect(downloaded!.download).toBe('guest-form.json')
        expect(revokeObjectURL).toHaveBeenCalledWith('blob:f')
    })
})
