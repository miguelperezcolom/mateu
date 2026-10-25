import { describe, expect, it } from 'vitest'
import { declaresSizing, defaultSizingOf, isCompactColumn, withDefaultColumnSizing } from './columnSizing'

const col = (metadata: any) => ({ id: metadata.id, metadata: { type: 'GridColumn', ...metadata } })

describe('columnSizing', () => {
    it('compact columns: identifiers, numbers, amounts, dates, booleans, statuses, enums, actions', () => {
        for (const c of [{ identifier: true, dataType: 'string' }, { dataType: 'integer' }, { dataType: 'number' },
            { dataType: 'money' }, { dataType: 'string', stereotype: 'money' }, { dataType: 'bool' }, { dataType: 'status' },
            { dataType: 'date' }, { dataType: 'dateTime' }, { dataType: 'time' }, { dataType: 'actionGroup' },
            { stereotype: 'button' }, { dataType: 'string', valueLabels: { IN_HOUSE: 'In house' } }]) {
            expect(isCompactColumn(c as any), JSON.stringify(c)).toBe(true)
        }
        for (const c of [{ dataType: 'string' }, { dataType: 'string', stereotype: 'primary' }, { stereotype: 'link' },
            { dataType: 'component' }, {}, { dataType: 'string', valueLabels: {} }]) {
            expect(isCompactColumn(c as any), JSON.stringify(c)).toBe(false)
        }
        expect(isCompactColumn(null)).toBe(false)
    })

    it('a column that declares nothing: compact fits (auto-width, flex-grow 0), text grows by its weight', () => {
        // the wire marks every width-less column autoWidth: it is not a declaration
        expect(defaultSizingOf({ id: 'price', stereotype: 'money', autoWidth: true } as any))
            .toEqual({ id: 'price', stereotype: 'money', autoWidth: true, flexGrow: '0' })
        expect(defaultSizingOf({ id: 'name', dataType: 'string', autoWidth: true } as any))
            .toEqual({ id: 'name', dataType: 'string', autoWidth: true, flexGrow: '1' })
        // a YAML column comes with autoWidth false: a text column still starts from its content
        expect(defaultSizingOf({ id: 'email', dataType: 'string', autoWidth: false } as any))
            .toEqual({ id: 'email', dataType: 'string', autoWidth: true, flexGrow: '1' })
        expect(defaultSizingOf({ id: 'notes', dataType: 'string', weight: 2 } as any).flexGrow).toBe('2')
        expect(defaultSizingOf({ id: 'notes', dataType: 'string', weight: 0.5 } as any).flexGrow).toBe('0.5')
    })

    it('a declared width or flexGrow wins, exactly as before', () => {
        expect(declaresSizing({ width: '120px' })).toBe(true)
        expect(declaresSizing({ flexGrow: '0' })).toBe(true)
        expect(declaresSizing({ width: 'auto' })).toBe(false)
        expect(declaresSizing({ width: '', flexGrow: '' } as any)).toBe(false)
        expect(declaresSizing(null)).toBe(false)
        const fixed = { id: 'id', identifier: true, width: '120px', flexGrow: '0' }
        expect(defaultSizingOf(fixed as any)).toBe(fixed)
        const grows = { id: 'qty', dataType: 'integer', flexGrow: '3', autoWidth: true }
        expect(defaultSizingOf(grows as any)).toBe(grows)
    })

    it('the products listing of a YAML project: Id/Price/Status fit, Name takes the rest', () => {
        const sized = withDefaultColumnSizing([
            col({ id: 'id', identifier: true, dataType: 'string', autoWidth: true }),
            col({ id: 'name', dataType: 'string', autoWidth: true }),
            col({ id: 'price', stereotype: 'money', dataType: 'string', autoWidth: true }),
            col({ id: 'status', dataType: 'status', autoWidth: true }),
        ])
        expect(sized.map(n => [n.metadata.id, n.metadata.autoWidth, n.metadata.flexGrow]))
            .toEqual([['id', true, '0'], ['name', true, '1'], ['price', true, '0'], ['status', true, '0']])
    })

    it('inside column groups too, and the wire nodes are not mutated', () => {
        const wire = [
            col({ id: 'id', identifier: true }),
            { id: 'g', metadata: { type: 'GridGroupColumn', label: 'Stay', columns: [col({ id: 'nights', dataType: 'integer' }), col({ id: 'room', dataType: 'string' })] } },
        ]
        const copy = JSON.parse(JSON.stringify(wire))
        const sized = withDefaultColumnSizing(wire) as any[]
        expect(sized[1].metadata.columns.map((n: any) => n.metadata.flexGrow)).toEqual(['0', '1'])
        expect(wire).toEqual(copy)
    })

    it('when no column grows, the compact defaults share the width; declared ones keep theirs', () => {
        const sized = withDefaultColumnSizing([
            col({ id: 'id', identifier: true }),
            col({ id: 'qty', dataType: 'integer' }),
            col({ id: 'code', dataType: 'string', width: '90px', flexGrow: '0' }),
        ])
        expect(sized.map(n => n.metadata.flexGrow)).toEqual(['1', '1', '0'])
        expect(sized[0].metadata.autoWidth).toBe(true)
    })

    it('the same wire columns give the same sized nodes (vaadin-grid keeps its column renderers)', () => {
        const wire = [col({ id: 'id', identifier: true }), col({ id: 'name', dataType: 'string' })]
        const a = withDefaultColumnSizing(wire)
        const b = withDefaultColumnSizing([...wire])
        expect(b[0]).toBe(a[0])
        expect(b[1]).toBe(a[1])
    })

    it('empty or missing columns', () => {
        expect(withDefaultColumnSizing([])).toEqual([])
        expect(withDefaultColumnSizing(undefined as any)).toEqual([])
    })
})
