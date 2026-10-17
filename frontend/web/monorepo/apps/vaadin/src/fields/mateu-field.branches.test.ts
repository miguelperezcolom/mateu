// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import * as announcer from '@infra/a11y/announcer.ts'
import './mateu-field'
import type { MateuField } from './mateu-field'

/**
 * mateu-field, the branches a business form leans on: the control each data type / stereotype
 * picks, what an edit emits, and — the accessibility contract — validation errors put ON the
 * control (found by property probing) and announced, with the fallback `role="alert"` list only
 * when the control has no validity state of its own (or a screen reader reads it twice).
 */
const field = (over: Record<string, unknown>) => ({
    fieldId: 'f', dataType: 'string', stereotype: 'regular', label: 'Field', required: false,
    disabled: false, readOnly: false, ...over,
})

const mount = async (f: Record<string, unknown>, state: Record<string, unknown> = {}, data: Record<string, unknown> = {}) => {
    const el = document.createElement('mateu-field') as MateuField
    el.field = field(f) as never
    el.state = state
    el.data = data
    const changes: { value: unknown, fieldId?: string }[] = []
    el.addEventListener('value-changed', (e) => changes.push((e as CustomEvent).detail))
    document.body.appendChild(el)
    await el.updateComplete
    await el.updateComplete
    return { el, root: el.shadowRoot!, changes }
}

afterEach(() => {
    document.body.innerHTML = ''
    document.documentElement.lang = 'en'
    vi.restoreAllMocks()
})

describe('mateu-field validation state', () => {
    type Validatable = HTMLElement & { invalid?: boolean, errorMessage?: string }

    it('puts the errors ON the control and does not repeat them in a list', async () => {
        const announce = vi.spyOn(announcer, 'announce')
        const { root } = await mount({ dataType: 'string', label: 'Name' }, { f: '' }, { errors: { f: ['Required', 'Too short'] } })
        const control = root.querySelector('vaadin-text-field') as Validatable
        expect(control.invalid).toBe(true)
        expect(control.errorMessage).toBe('Required. Too short')
        expect(root.querySelector('[role="alert"]')).toBeNull()
        expect(announce).toHaveBeenCalledWith('Name: Required. Too short', { politeness: 'assertive' })
    })

    it('a repeat render does not announce the same error again; clearing it resets the control', async () => {
        const announce = vi.spyOn(announcer, 'announce')
        const { el, root } = await mount({ dataType: 'string', label: 'Name' }, { f: '' }, { errors: { f: ['Required'] } })
        el.requestUpdate()
        await el.updateComplete
        expect(announce).toHaveBeenCalledTimes(1)
        el.data = { errors: {} }
        await el.updateComplete
        await el.updateComplete
        const control = root.querySelector('vaadin-text-field') as Validatable
        expect(control.invalid).toBe(false)
        expect(control.errorMessage).toBe('')
    })

    it('blank error entries are ignored', async () => {
        const { root } = await mount({ dataType: 'string' }, { f: '' }, { errors: { f: ['', null] } })
        expect((root.querySelector('vaadin-text-field') as Validatable).invalid).toBe(false)
    })

    it('a control without validity state gets the role=alert list instead', async () => {
        const { root } = await mount({ dataType: 'string', stereotype: 'plainText', readOnly: true }, { f: 'x' }, { errors: { f: ['Bad'] } })
        const alert = root.querySelector('[role="alert"]')!
        expect(alert.textContent).toContain('Bad')
    })
})

describe('mateu-field branches', () => {
    const cases: [string, Record<string, unknown>, string][] = [
        ['a textarea', { stereotype: 'textarea' }, 'vaadin-text-area'],
        ['an email', { stereotype: 'email' }, 'vaadin-email-field'],
        ['a password', { stereotype: 'password' }, 'vaadin-password-field'],
        ['a number', { dataType: 'number' }, 'vaadin-number-field'],
        ['an integer', { dataType: 'integer' }, 'vaadin-integer-field'],
        ['a select', { stereotype: 'select', options: [{ value: 'a', label: 'A' }] }, 'vaadin-select'],
        ['a radio group', { stereotype: 'radio', options: [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }] }, 'vaadin-radio-group'],
        ['a tree select', { stereotype: 'treeSelect', options: [{ value: 'a', label: 'A' }] }, 'mateu-vaadin-tree-select'],
        ['a signature', { stereotype: 'signature' }, 'mateu-signature-pad'],
        ['a camera capture', { stereotype: 'camera' }, 'mateu-camera-capture'],
        ['a bulleted list', { stereotype: 'bulletedList', dataType: 'array' }, 'mateu-bulleted-list'],
    ]
    for (const [name, over, tag] of cases) {
        it(`${name} renders ${tag}`, async () => {
            const { root } = await mount(over, {})
            expect(root.querySelector(tag), root.innerHTML.slice(0, 300)).not.toBeNull()
        })
    }

    it('an edit emits value-changed with the field id', async () => {
        const { root, changes } = await mount({ stereotype: 'textarea' }, { f: 'old' })
        root.querySelector('vaadin-text-area')!.dispatchEvent(new CustomEvent('value-changed', { detail: { value: 'new' } }))
        expect(changes).toEqual([{ value: 'new', fieldId: 'f' }])
    })

    it('a no-op commit (same value, or an untouched empty control) emits nothing', async () => {
        const { root, changes } = await mount({ stereotype: 'textarea' }, { f: 'same' })
        const area = root.querySelector('vaadin-text-area')!
        area.dispatchEvent(new CustomEvent('value-changed', { detail: { value: 'same' } }))
        area.dispatchEvent(new CustomEvent('value-changed', { detail: { value: undefined } }))
        expect(changes).toEqual([])
    })

    it('an integer field commits a number', async () => {
        const { root, changes } = await mount({ dataType: 'integer' }, { f: 1 })
        root.querySelector('vaadin-integer-field')!.dispatchEvent(new CustomEvent('value-changed', { detail: { value: '42' } }))
        expect(changes[0]).toEqual({ value: 42, fieldId: 'f' })
    })

    it('a number field commits a number, never the control\'s string', async () => {
        // the walkthrough found "19.95" (a string) in the browser state of a number field
        const { root, changes } = await mount({ dataType: 'number' }, { f: 1 })
        const control = root.querySelector('vaadin-number-field')!
        control.dispatchEvent(new CustomEvent('value-changed', { detail: { value: '19.95' } }))
        control.dispatchEvent(new CustomEvent('value-changed', { detail: { value: '' } }))
        expect(changes).toEqual([{ value: 19.95, fieldId: 'f' }, { value: null, fieldId: 'f' }])
    })

    it('a required field carries required on its control', async () => {
        const { root } = await mount({ stereotype: 'email', required: true }, {})
        expect(root.querySelector('vaadin-email-field')!.hasAttribute('required')).toBe(true)
    })

    it('a read-only editable link never renders a javascript: href', async () => {
        const { root } = await mount({ stereotype: 'link', readOnly: true }, { f: 'javascript:alert(1)' })
        const a = root.querySelector('a')
        expect(a?.getAttribute('href') ?? null).toBeNull()
    })

    it('a multi-valued @Searchable: one chip per id, each removable (named in the page language)', async () => {
        document.documentElement.lang = 'es'
        const { root, changes } = await mount({ stereotype: 'searchable', dataType: 'array' }, { f: ['1', '2'] },
            { 'f-labels': { '1': 'Ada', '2': 'Alan' } })
        const removes = Array.from(root.querySelectorAll('.searchable-chip vaadin-button')) as HTMLElement[]
        expect(removes.map(b => b.getAttribute('aria-label'))).toEqual(['Quitar Ada', 'Quitar Alan'])
        removes[0].click()
        expect(changes[0].fieldId).toBe('f')
        expect(changes[0].value).toEqual(['2'])
    })

    it('a read-only money field in a property row is formatted', async () => {
        const { root } = await mount({ dataType: 'money', propertyRow: true, readOnly: true, label: 'Balance' },
            { f: { value: 1234.5, locale: 'en-US', currency: 'USD' } })
        expect(root.textContent).toContain('Balance')
        expect(root.textContent).toContain('$1,234.50')
    })
})

describe('mateu-field: a plain string field with options', () => {
    it('is a select of them, not a text field showing the raw value (the GeneralOverview switcher)', async () => {
        const options = [{ value: 'r1', label: 'Requisition 204' }, { value: 'r2', label: 'Requisition 205' }]
        const { root } = await mount({ fieldId: 'record', options }, { record: 'r1' })
        expect(root.querySelector('vaadin-text-field')).toBeNull()
        expect((root.querySelector('vaadin-select') as unknown as { items: unknown[] }).items).toEqual(options)
    })

    it('without options it stays a text field', async () => {
        const { root } = await mount({ fieldId: 'name', options: [] }, { name: 'Ada' })
        expect(root.querySelector('vaadin-text-field')).not.toBeNull()
    })
})
