// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import './mateu-field'
import type { MateuField } from './mateu-field'
import { asSelectItems, optionValueOf, pickedOptionsOf } from './string/select'

/**
 * Fields fed by a REST source (`optionsSource`), rendered for real (jsdom + the Vaadin web
 * components): every stereotype that offers options reads the source — not only `select` — and an
 * option whose value is a NUMBER (an id) is shown and written back as that number.
 */
const field = (over: Record<string, unknown>) => ({
    fieldId: 'f', dataType: 'string', stereotype: 'regular', label: 'Field', required: false,
    disabled: false, readOnly: false, ...over,
})

// the demo's shape: GET /missions/options → [{id, name}]
const MISSIONS = [{ id: 7, name: 'Apollo 11' }, { id: 25, name: 'Artemis III' }]
const source = { url: 'https://api.example.test/missions/options', valuePath: 'id', labelPath: 'name' }

const mount = async (f: Record<string, unknown>, state: Record<string, unknown>) => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(MISSIONS), {
        status: 200, headers: { 'Content-Type': 'application/json' },
    })))
    const el = document.createElement('mateu-field') as MateuField
    el.id = 'f'
    el.field = field(f) as never
    el.state = state
    el.data = {}
    const changes: { value: unknown }[] = []
    el.addEventListener('value-changed', (e) => changes.push((e as CustomEvent).detail))
    document.body.appendChild(el)
    await el.updateComplete
    // the fetch resolves, the field re-renders with the options
    await vi.waitFor(() => expect((el.data as any).f?.content?.length).toBe(2))
    await el.updateComplete
    return { el, root: el.shadowRoot!, changes }
}

const fire = (target: Element, type: string, detail?: unknown) =>
    target.dispatchEvent(new CustomEvent(type, { detail }))

afterEach(() => {
    document.body.innerHTML = ''
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
})

describe('a select whose source gives numeric values', () => {
    it('shows the current value (vaadin-select matches values as strings)', async () => {
        const { root } = await mount({ stereotype: 'select', optionsSource: source }, { f: 25 })
        const select = root.querySelector('vaadin-select') as any
        expect(select.value).toBe('25')
        expect(select.items.find((o: any) => o.value === select.value)?.label).toBe('Artemis III')
    })

    it('writes the pick back as the number, not as its string', async () => {
        const { root, changes } = await mount({ stereotype: 'select', optionsSource: source }, { f: 25 })
        fire(root.querySelector('vaadin-select')!, 'value-changed', { value: '7' })
        expect(changes.at(-1)?.value).toBe(7)
    })

    it('inline numeric options behave the same', async () => {
        const options = [{ value: 1, label: 'One' }, { value: 2, label: 'Two' }]
        const el = document.createElement('mateu-field') as MateuField
        el.field = field({ stereotype: 'select', options }) as never
        el.state = { f: 2 }
        el.data = {}
        document.body.appendChild(el)
        await el.updateComplete
        expect((el.shadowRoot!.querySelector('vaadin-select') as any).value).toBe('2')
    })
})

describe('a combobox reads its optionsSource', () => {
    it('single-valued: lists the source and shows the current value', async () => {
        const { root, changes } = await mount({ stereotype: 'combobox', optionsSource: source }, { f: 25 })
        const combo = root.querySelector('vaadin-combo-box') as any
        expect(combo.items.map((o: any) => o.label)).toEqual(['Apollo 11', 'Artemis III'])
        expect(combo.value).toBe('25')
        fire(combo, 'value-changed', { value: '7' })
        expect(changes.at(-1)?.value).toBe(7)
    })

    it('multi-valued (array): lists the source and selects the current ids', async () => {
        const { root } = await mount({ dataType: 'array', stereotype: 'combobox', optionsSource: source }, { f: [25] })
        const combo = root.querySelector('vaadin-multi-select-combo-box') as any
        expect(combo.items.map((o: any) => o.label)).toEqual(['Apollo 11', 'Artemis III'])
        expect(combo.selectedItems.map((o: any) => o.label)).toEqual(['Artemis III'])
    })
})

describe('a multiSelect reads its optionsSource', () => {
    it('one checkbox per option, the current ids checked, a change written back as ids', async () => {
        const { root, changes } = await mount({ dataType: 'array', stereotype: 'multiSelect', optionsSource: source }, { f: [25] })
        const group = root.querySelector('vaadin-checkbox-group') as any
        const boxes = Array.from(root.querySelectorAll('vaadin-checkbox')) as any[]
        expect(boxes.map(b => b.getAttribute('label'))).toEqual(['Apollo 11', 'Artemis III'])
        expect(group.value).toEqual(['25'])
        fire(group, 'value-changed', { value: ['25', '7'] })
        expect(changes.at(-1)?.value).toEqual([25, 7])
    })
})

describe('the string-keyed helpers', () => {
    it('leave string options untouched (same array) and keep one copy per numeric list', () => {
        const strings = [{ value: 'a', label: 'A' }]
        expect(asSelectItems(strings)).toBe(strings)
        const numbers = [{ value: 1, label: 'One' }]
        expect(asSelectItems(numbers)).toEqual([{ value: '1', label: 'One' }])
        expect(asSelectItems(numbers)).toBe(asSelectItems(numbers))
    })

    it('map a pick back to the option value, and match a value list as strings', () => {
        const options = [{ value: 1, label: 'One' }, { value: 'x', label: 'X' }]
        expect(optionValueOf(options, '1')).toBe(1)
        expect(optionValueOf(options, 'x')).toBe('x')
        expect(optionValueOf(options, 'unknown')).toBe('unknown')
        expect(optionValueOf(options, '')).toBe('')
        expect(pickedOptionsOf(options, ['1'])).toEqual([options[0]])
        expect(pickedOptionsOf(options, null)).toEqual([])
    })
})
