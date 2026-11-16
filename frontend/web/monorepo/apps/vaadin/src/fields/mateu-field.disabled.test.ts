// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import './mateu-field'
import type { MateuField } from './mateu-field'

/**
 * A field `@Disabled("expr")` / `@DisabledUnless` disables (the rule sets `field.disabled`, see
 * updateMedata) is disabled whatever its kind. Only the plain text field and the switch read the
 * flag: a checkbox, a number, an integer, a date, a select… stayed editable while the rule held.
 */
const field = (over: Record<string, unknown>) => ({
    fieldId: 'f', dataType: 'string', stereotype: 'regular', label: 'Field', required: false,
    disabled: false, readOnly: false, ...over,
})

const mount = async (f: Record<string, unknown>, state: Record<string, unknown> = {}) => {
    const el = document.createElement('mateu-field') as MateuField
    el.id = 'f'
    el.field = field(f) as never
    el.state = state
    el.data = {}
    document.body.appendChild(el)
    await el.updateComplete
    await el.updateComplete
    return el.shadowRoot!
}

afterEach(() => {
    document.body.innerHTML = ''
})

const kinds: [string, Record<string, unknown>, string][] = [
    ['a checkbox', { dataType: 'bool' }, 'vaadin-checkbox'],
    ['a boolean checkbox', { dataType: 'boolean' }, 'vaadin-checkbox'],
    ['a number', { dataType: 'number' }, 'vaadin-number-field'],
    ['an integer', { dataType: 'integer' }, 'vaadin-integer-field'],
    ['a slider', { dataType: 'integer', stereotype: 'slider' }, 'input[type=range]'],
    ['a date', { dataType: 'date' }, 'vaadin-date-picker'],
    ['a date and time', { dataType: 'dateTime' }, 'vaadin-date-time-picker'],
    ['a time', { dataType: 'time' }, 'vaadin-time-picker'],
    ['a text area', { stereotype: 'textarea' }, 'vaadin-text-area'],
    ['an email', { stereotype: 'email' }, 'vaadin-email-field'],
    ['a password', { stereotype: 'password' }, 'vaadin-password-field'],
    ['a select', { stereotype: 'select', options: [{ value: 'a', label: 'A' }] }, 'vaadin-select'],
    ['a combo box', { stereotype: 'combobox', options: [{ value: 'a', label: 'A' }] }, 'vaadin-combo-box'],
    ['a radio group', { stereotype: 'radio', options: [{ value: 'a', label: 'A' }] }, 'vaadin-radio-group'],
    ['a multi-select', { dataType: 'array', stereotype: 'multiSelect', options: [{ value: 'a', label: 'A' }] }, 'vaadin-checkbox-group'],
    ['a color', { stereotype: 'color' }, 'input[type=color]'],
]

describe('mateu-field: a disabled field is disabled whatever its kind', () => {
    for (const [name, over, selector] of kinds) {
        it(name, async () => {
            const enabled = await mount(over)
            const control = enabled.querySelector(selector) as HTMLElement | null
            expect(control, selector).not.toBeNull()
            expect(control!.hasAttribute('disabled')).toBe(false)
            document.body.innerHTML = ''

            const disabled = await mount({ ...over, disabled: true })
            expect(disabled.querySelector(selector)!.hasAttribute('disabled')).toBe(true)
        })
    }

    it('a disabled star rating takes no click', async () => {
        const root = await mount({ dataType: 'integer', stereotype: 'stars', disabled: true }, { f: 2 })
        const changes: unknown[] = []
        root.host.addEventListener('value-changed', e => changes.push((e as CustomEvent).detail))
        ;(root.querySelectorAll('vaadin-icon')[4] as HTMLElement).click()
        expect(changes).toEqual([])
    })
})
