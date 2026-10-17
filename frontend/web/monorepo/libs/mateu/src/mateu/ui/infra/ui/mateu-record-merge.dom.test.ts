// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import './mateu-record-merge'
import type { MateuRecordMerge } from './mateu-record-merge'

/**
 * Compare and merge: one column per record, one radio group per field, an optional typed value for
 * editable fields, the resulting record + summary, and the merge action with `_merged`/`_choices`.
 */
describe('mateu-record-merge (DOM)', () => {
    const MERGE = {
        title: 'Merge profiles',
        records: [
            { id: 'p1', label: 'Profile 1021', caption: 'Created 2024' },
            { id: 'p2', label: 'Profile 1088' },
        ],
        fields: [
            { fieldId: 'name', label: 'Name', values: ['Ann Smith', 'Ann Smith'], differs: false },
            { fieldId: 'email', label: 'Email', values: ['ann@a.com', 'ann@b.com'], differs: true, chosen: 'p2', editable: true },
            { fieldId: 'phone', label: 'Phone', values: [null, '555'], differs: true },
        ],
        mergeActionId: 'doMerge',
        parameters: { guestId: 7 },
    }
    let events: { actionId: string, parameters: Record<string, unknown> }[]
    const listener = (e: Event) => events.push((e as CustomEvent).detail)
    const mount = async (merge: unknown = MERGE) => {
        const el = document.createElement('mateu-record-merge') as MateuRecordMerge
        el.merge = merge as never
        document.body.appendChild(el)
        await el.updateComplete
        return el
    }
    const $ = (el: MateuRecordMerge, sel: string) => el.shadowRoot!.querySelector(sel) as HTMLElement
    const $$ = (el: MateuRecordMerge, sel: string) => Array.from(el.shadowRoot!.querySelectorAll(sel)) as HTMLElement[]
    const rowOf = (el: MateuRecordMerge, label: string) => $$(el, 'tbody tr').find(r => r.querySelector('th')!.textContent!.includes(label))!
    const radios = (row: HTMLElement) => Array.from(row.querySelectorAll('input[type=radio]')) as HTMLInputElement[]
    const result = (el: MateuRecordMerge) => $$(el, '.result .entry').map(e => [e.querySelector('dt')!.textContent, e.querySelector('dd')!.textContent!.replace(/\s+/g, ' ').trim()])

    beforeEach(() => { events = []; document.addEventListener('action-requested', listener) })
    afterEach(() => { document.removeEventListener('action-requested', listener); document.body.innerHTML = '' })

    it('renders nothing without a merge', async () => {
        const el = await mount(null)
        expect($(el, 'table')).toBeNull()
    })

    it('shows the records side by side, flags differing rows and starts from the server picks', async () => {
        const el = await mount()
        expect($(el, '#title').textContent).toBe('Merge profiles')
        expect($$(el, 'thead th').map(t => t.textContent!.replace(/\s+/g, ' ').trim())).toEqual(['Field', 'Profile 1021 Created 2024', 'Profile 1088', 'Custom'])
        expect(rowOf(el, 'Name').classList.contains('differs')).toBe(false)
        expect(rowOf(el, 'Email').querySelector('.badge')!.textContent).toBe('differs')
        // chosen p2 for email; the first non-blank (p2) for phone; p1 for name
        expect(radios(rowOf(el, 'Email')).map(r => r.checked)).toEqual([false, true, false])
        expect(radios(rowOf(el, 'Phone')).map(r => r.checked)).toEqual([false, true])
        expect(rowOf(el, 'Phone').querySelector('td span.empty')!.textContent).toBe('(empty)')
        expect(radios(rowOf(el, 'Email'))[0].getAttribute('aria-label')).toBe('Use value from Profile 1021 for Email')
        // only the editable field has a typed value
        expect(rowOf(el, 'Name').querySelector('input[type=text]')).toBeNull()
        expect(result(el)).toEqual([
            ['Name', 'Ann Smith from Profile 1021'],
            ['Email', 'ann@b.com from Profile 1088'],
            ['Phone', '555 from Profile 1088'],
        ])
        expect($(el, '.summary').textContent).toBe('3 fields: 2 differ; 0 typed by hand')
        expect($(el, 'button.merge').textContent).toBe('Merge')
    })

    it('picking another value or typing one changes the result, and Merge sends it', async () => {
        const el = await mount()
        radios(rowOf(el, 'Phone'))[0].click()
        await el.updateComplete
        expect(rowOf(el, 'Phone').querySelectorAll('td')[0].classList.contains('picked')).toBe(true)
        const typed = rowOf(el, 'Email').querySelector('input[type=text]') as HTMLInputElement
        typed.value = 'ann@c.com'
        typed.dispatchEvent(new Event('input'))
        await el.updateComplete
        expect(radios(rowOf(el, 'Email'))[2].checked).toBe(true)
        expect(result(el)).toEqual([
            ['Name', 'Ann Smith from Profile 1021'],
            ['Email', 'ann@c.com from Custom'],
            ['Phone', '(empty) from Profile 1021'],
        ])
        expect($(el, '.summary').textContent).toBe('3 fields: 2 differ; 1 typed by hand')
        $(el, 'button.merge').click()
        expect(events).toEqual([{
            actionId: 'doMerge',
            parameters: {
                guestId: 7,
                _merged: { name: 'Ann Smith', email: 'ann@c.com', phone: null },
                _choices: { name: 'p1', email: 'custom', phone: 'p1' },
            },
        }])
        // the custom radio alone selects the (empty) typed value
        radios(rowOf(el, 'Email'))[0].click()
        await el.updateComplete
        radios(rowOf(el, 'Email'))[2].click()
        await el.updateComplete
        expect(result(el)[1]).toEqual(['Email', 'ann@c.com from Custom'])
    })

    it('"show only differences" hides the equal rows; a merge declaring it starts filtered', async () => {
        const el = await mount()
        const toggle = $(el, 'input[role=switch]') as HTMLInputElement
        toggle.checked = true
        toggle.dispatchEvent(new Event('change'))
        await el.updateComplete
        expect($$(el, 'tbody tr')).toHaveLength(2)
        // the result still lists every field
        expect($$(el, '.result .entry')).toHaveLength(3)
        const filtered = await mount({ ...MERGE, differencesOnly: true })
        expect(filtered.shadowRoot!.querySelectorAll('tbody tr')).toHaveLength(2)
    })

    it('a new merge from the server starts over; without an action there is no button', async () => {
        const el = await mount()
        radios(rowOf(el, 'Phone'))[0].click()
        await el.updateComplete
        el.merge = { ...MERGE, mergeActionId: undefined, mergeLabel: undefined, title: undefined, fields: MERGE.fields.map(f => ({ ...f, editable: false })) } as never
        await el.updateComplete
        expect(radios(rowOf(el, 'Phone')).map(r => r.checked)).toEqual([false, true])
        expect($(el, 'button.merge')).toBeNull()
        expect($(el, '#title')).toBeNull()
        expect($$(el, 'thead th')).toHaveLength(3)
    })

    it('honours a custom merge label', async () => {
        const el = await mount({ ...MERGE, mergeLabel: 'Combine' })
        expect($(el, 'button.merge').textContent).toBe('Combine')
    })
})
