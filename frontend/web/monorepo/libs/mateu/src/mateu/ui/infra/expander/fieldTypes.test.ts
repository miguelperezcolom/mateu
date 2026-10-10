// Field types (`fieldType:` + types.yaml), resolved in the BROWSER exactly as the server resolves them.
// The goldens were captured from the JAVA backend (FieldTypesSyncTest renders the definition-only
// routes of backend/.../test/resources/field-types/specs/ui and writes __fixtures__/ft-*.golden.json
// with -Dexpander.golden.write=true); the authored input here is THAT SAME YAML (and types.yaml), so
// the two sides cannot drift apart.

import { afterEach, describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { parse } from 'yaml'
import { expandDefinition, type DefinitionSpec } from '@infra/expander/expandDefinition'
import { resolveFieldTypes, setFieldTypeCatalogue, typesOf } from '@infra/expander/fieldTypes'
import { expectSubset } from '@infra/expander/__fixtures__/structuralSubset'
import customerGolden from '@infra/expander/__fixtures__/ft-customer.golden.json'
import ordersGolden from '@infra/expander/__fixtures__/ft-orders.golden.json'

const SPECS = resolve(__dirname, '../../../../../../../../../../backend/shared/core/src/test/resources/field-types/specs/ui')
const yaml = (file: string): any => parse(readFileSync(resolve(SPECS, file), 'utf-8'))
const component = (inc: any) => inc.fragments[0].component

describe('field types — client-side resolution, against the Java goldens', () => {
    afterEach(() => setFieldTypeCatalogue([]))

    it('a form field takes its type as defaults and its own attributes win', () => {
        setFieldTypeCatalogue(typesOf(yaml('types.yaml')))
        const wire = component(expandDefinition(yaml('customer.yaml') as DefinitionSpec, 'ft-customer')) as any
        const golden = component(customerGolden) as any
        // email and backup (phone's type is supplied by a Java bean in the server test, not here)
        for (const i of [0, 1]) expectSubset(wire.children[i], golden.children[i])
        expect(wire.children[0].metadata).toMatchObject({ stereotype: 'email', label: 'E-mail', required: true })
        expect(wire.children[1].metadata).toMatchObject({ label: 'Backup e-mail', required: false, stereotype: 'email' })
        expect(JSON.stringify(wire)).not.toContain('fieldType')
    })

    it('a listing column gets its data type and badge tones; a filter its options', () => {
        setFieldTypeCatalogue(typesOf(yaml('types.yaml')))
        const wire = component(expandDefinition(yaml('orders.yaml') as DefinitionSpec, 'ft-orders')) as any
        const golden = component(ordersGolden) as any
        const goldenCols = golden.metadata.columns
        wire.metadata.columns.forEach((col: any, i: number) => expectSubset(col.metadata, goldenCols[i].metadata))
        expect(wire.metadata.columns[1].metadata).toMatchObject({ dataType: 'status', tones: { OPEN: 'warning', SHIPPED: 'success' } })
        expect(wire.metadata.columns[2].metadata).toMatchObject({ dataType: 'money', label: 'Amount', align: 'end' })
        expect(golden.metadata.filters[0].options).toHaveLength(2)
        expect(wire.metadata.filters[0].metadata?.options ?? wire.metadata.filters[0].options).toHaveLength(2)
    })

    it('an unknown type warns and the field renders as declared', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
        const out = resolveFieldTypes({ type: 'FormField', id: 'nickname', fieldType: 'Nope', label: 'Nickname' }, [])
        expect(out).toEqual({ type: 'FormField', id: 'nickname', label: 'Nickname' })
        expect(warn).toHaveBeenCalledWith(expect.stringContaining("'Nope'"))
        warn.mockRestore()
    })

    it('a tree with no reference is returned untouched (same object)', () => {
        const tree = { type: 'VerticalLayout', content: [{ type: 'FormField', id: 'a' }] }
        expect(resolveFieldTypes(tree, [])).toBe(tree)
    })

    it('only FieldTypeEntry attributes are supplied, and empty ones supply nothing', () => {
        const out = resolveFieldTypes({ id: 'x', fieldType: 'T' },
            [{ id: 'T', label: '', foo: 'bar', dataType: 'money', options: [] }])
        expect(out).toEqual({ id: 'x', dataType: 'money' })
    })

    it('typesOf reads a `types:` envelope or a bare list', () => {
        expect(typesOf({ type: 'Types', types: [{ id: 'A' }, { nope: 1 }] }).map(t => t.id)).toEqual(['A'])
        expect(typesOf([{ id: 'B' }]).map(t => t.id)).toEqual(['B'])
        expect(typesOf('garbage')).toEqual([])
    })
})
