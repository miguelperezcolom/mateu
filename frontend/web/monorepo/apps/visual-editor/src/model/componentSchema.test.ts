import { describe, it, expect } from 'vitest'
import { parseSchema, createNode } from './componentSchema'

const FIXTURE = {
    $defs: {
        ButtonColor: { type: 'string', enum: ['normal', 'success', 'error'] },
        Button: {
            required: ['label'],
            properties: {
                type: { type: 'string', const: 'Button' },
                label: { type: 'string' },
                color: { $ref: '#/$defs/ButtonColor' },
                disabled: { type: 'boolean' },
                order: { type: 'integer' },
            },
        },
        VerticalLayout: {
            properties: {
                type: { type: 'string', const: 'VerticalLayout' },
                spacing: { type: 'boolean' },
                content: { type: 'array', items: { $ref: '#/$defs/Component' } },
            },
        },
        // A hidden wire type — must not surface in the catalog.
        PageView: { properties: { type: { type: 'string', const: 'PageView' } } },
        // An enum/record with no `type` const is not a component.
        Component: { oneOf: [{ $ref: '#/$defs/Button' }] },
    },
}

describe('parseSchema', () => {
    const schema = parseSchema(FIXTURE)

    it('lists only components (a `type` const), skipping enums, unions and hidden wire types', () => {
        expect([...schema.components.keys()].sort()).toEqual(['Button', 'VerticalLayout'])
    })

    it('resolves a $ref to an enum into selectable values', () => {
        const color = schema.components.get('Button')!.props.find((p) => p.name === 'color')!
        expect(color.kind).toBe('enum')
        expect(color.values).toEqual(['normal', 'success', 'error'])
    })

    it('maps scalar kinds and marks required props', () => {
        const button = schema.components.get('Button')!
        const byName = Object.fromEntries(button.props.map((p) => [p.name, p]))
        expect(byName.label.kind).toBe('string')
        expect(byName.label.required).toBe(true)
        expect(byName.disabled.kind).toBe('boolean')
        expect(byName.order.kind).toBe('number')
        expect(byName.color.required).toBe(false)
    })

    it('treats a list of children as structural', () => {
        const content = schema.components.get('VerticalLayout')!.props.find((p) => p.name === 'content')!
        expect(content.kind).toBe('children')
    })

    it('collects named enums for select fields', () => {
        expect(schema.enums.get('ButtonColor')).toEqual(['normal', 'success', 'error'])
    })

    it('creates a container node with an empty content list and friendly starters', () => {
        const layout = createNode(schema.components.get('VerticalLayout')!)
        expect(layout).toEqual({ type: 'VerticalLayout', content: [] })
        const button = createNode(schema.components.get('Button')!)
        expect(button.type).toBe('Button')
        expect(button.label).toBe('Button')
    })
})
