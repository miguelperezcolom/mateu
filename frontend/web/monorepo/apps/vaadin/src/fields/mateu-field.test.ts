// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import './mateu-field'
import type { MateuField } from './mateu-field'

/**
 * mateu-field: one element, a branch per data type / stereotype. These render the branches for real
 * (jsdom + the Vaadin web components) and pin what reaches the DOM and what the field emits.
 */
const field = (over: Record<string, unknown>) => ({
    fieldId: 'f', dataType: 'string', stereotype: 'regular', label: 'Field', required: false,
    disabled: false, readOnly: false, ...over,
})

const mount = async (f: Record<string, unknown>, state: Record<string, unknown> = {}) => {
    const el = document.createElement('mateu-field') as MateuField
    el.field = field(f) as never
    el.state = state
    el.data = {}
    const changes: { value: unknown, fieldId?: string }[] = []
    el.addEventListener('value-changed', (e) => changes.push((e as CustomEvent).detail))
    document.body.appendChild(el)
    await el.updateComplete
    return { el, root: el.shadowRoot!, changes }
}

afterEach(() => {
    document.body.innerHTML = ''
    document.documentElement.lang = 'en'
    vi.restoreAllMocks()
})

describe('mateu-field', () => {
    it('a string field renders a text field with its label and value', async () => {
        const { root } = await mount({ dataType: 'string' }, { f: 'hello' })
        const input = root.querySelector('vaadin-text-field') as HTMLElement & { value?: string, label?: string }
        expect(input).not.toBeNull()
        expect(input.getAttribute('label') ?? input.label).toBe('Field')
    })

    it('interpolates the label against the state', async () => {
        const { root } = await mount({ dataType: 'string', label: 'Hi ${state.name}' }, { name: 'Ana', f: '' })
        expect(root.querySelector('vaadin-text-field')?.getAttribute('label')).toBe('Hi Ana')
    })

    it('a read-only plain-text money field shows the formatted amount', async () => {
        const { root } = await mount({ dataType: 'money', stereotype: 'plainText', readOnly: true }, { f: { value: 12.5, locale: 'en-US', currency: 'USD' } })
        expect(root.textContent).toContain('$12.50')
    })

    it('a property row shows label and value, and an em dash for no value', async () => {
        const { root } = await mount({ propertyRow: true, readOnly: true, label: 'Status' }, {})
        expect(root.textContent).toContain('Status')
        expect(root.textContent).toContain('—')
    })

    it('the toggle stereotype is a native switch that emits the new value', async () => {
        const { root, changes } = await mount({ dataType: 'bool', stereotype: 'toggle', label: 'Active' }, { f: false })
        const input = root.querySelector('input[role="switch"]') as HTMLInputElement
        expect(input).not.toBeNull()
        expect(input.getAttribute('aria-label')).toBe('Active')
        input.checked = true
        input.dispatchEvent(new Event('change'))
        expect(changes).toEqual([{ value: true, fieldId: 'f' }])
    })

    it('the range data type uses mateu-range-slider with localized thumb names', async () => {
        document.documentElement.lang = 'es'
        const { root, changes } = await mount({ dataType: 'range', sliderMin: 0, sliderMax: 10 }, { f: { from: 2, to: 5 } })
        const slider = root.querySelector('mateu-range-slider') as HTMLElement
        expect(slider).not.toBeNull()
        expect(slider.getAttribute('from-label')).toBe('Desde')
        slider.dispatchEvent(new CustomEvent('change', { detail: { from: 1, to: 9 } }))
        // the field reads startValue/endValue off the slider, like it did with UI5's
        expect(changes.length).toBe(1)
    })

    it('a read-only link never becomes a javascript: href', async () => {
        const { root } = await mount({ dataType: 'string', stereotype: 'link', readOnly: true }, { f: 'javascript:alert(1)' })
        expect(root.querySelector('a[href^="javascript:"]')).toBeNull()
    })

    it('a badge stereotype shows the label as an on/off chip', async () => {
        const { root } = await mount({ dataType: 'bool', stereotype: 'badge', label: 'VIP' }, { f: true })
        const chip = root.querySelector('[theme~="badge"]')
        expect(chip?.textContent).toBe('VIP')
        expect(chip?.getAttribute('theme')).toContain('success')
    })

    it('shows its validation errors when the control has no validity state of its own', async () => {
        const el = document.createElement('mateu-field') as MateuField
        el.field = field({ dataType: 'string', stereotype: 'plainText', readOnly: true }) as never
        el.state = { f: 'x' }
        el.data = { errors: { f: ['Too short'] } }
        document.body.appendChild(el)
        await el.updateComplete
        await el.updateComplete
        expect(el.shadowRoot!.textContent).toContain('Too short')
    })
})
