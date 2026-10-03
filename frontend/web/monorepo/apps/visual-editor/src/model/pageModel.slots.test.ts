import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { parse } from 'yaml'
import {
    parsePage, serializePage, nodeAt, removeAt, reorder, insertAfter, insertIntoSlot, presentSlots,
    decorateForPreview, idToPath, pathToId, slotSeg, splitSeg, SINGLE_CONTENT,
} from './pageModel'

const LISTING = `type: Listing
title: People
toolbar:
  - {type: Button, label: New, actionId: create}
  - {type: Button, label: Delete, actionId: delete}
filters:
  - {type: FormField, id: name, label: Name}
columns:
  - {type: GridColumn, id: name, label: Name}
  - {type: GridColumn, id: gender, label: Gender}
rowsSource: {ref: people}
`

describe('slot paths — lists other than content', () => {
    it('addresses a Listing column, filter and toolbar button by slot step', () => {
        const doc = parsePage(LISTING)
        expect(nodeAt(doc, [slotSeg('columns', 1)])?.id).toBe('gender')
        expect(nodeAt(doc, [slotSeg('filters', 0)])?.label).toBe('Name')
        expect(nodeAt(doc, ['toolbar.1'])?.label).toBe('Delete')
        expect(presentSlots(doc.layout)).toEqual(['toolbar', 'filters', 'columns'])
    })

    it('reorders, removes and inserts inside a slot without touching the others', () => {
        const doc = parsePage(LISTING)
        expect(reorder(doc, ['columns.1'], -1)).toEqual(['columns.0'])
        expect(nodeAt(doc, ['columns.0'])?.id).toBe('gender')
        removeAt(doc, ['toolbar.0'])
        expect((doc.layout.toolbar as unknown[]).length).toBe(1)
        expect(insertAfter(doc, ['filters.0'], { type: 'FormField', id: 'gender' })).toEqual(['filters.1'])
        expect(insertIntoSlot(doc, [], 'columns', { type: 'GridColumn', id: 'mass' })).toEqual(['columns.2'])
        const out = parse(serializePage(doc))
        expect(out.columns.map((c: any) => c.id)).toEqual(['gender', 'name', 'mass'])
        expect(out.filters.map((c: any) => c.id)).toEqual(['name', 'gender'])
        expect(out.rowsSource).toEqual({ ref: 'people' })
    })

    it('creates a slot list on first insert (a Form gains its buttons)', () => {
        const doc = parsePage('type: Form\ntitle: X\ncontent: []\n')
        expect(insertIntoSlot(doc, [], 'buttons', { type: 'Button', label: 'Save', actionId: 'save' })).toEqual(['buttons.0'])
        expect(parse(serializePage(doc)).buttons[0].actionId).toBe('save')
    })

    it('stamps slot items for click-to-select but keeps a column/filter id (it is the binding)', () => {
        const preview = parse(decorateForPreview(parsePage(LISTING)))
        expect(preview.id).toBe('ve-root')
        expect(preview.toolbar[0].id).toBe('ve-toolbar.0')
        expect(preview.columns.map((c: any) => c.id)).toEqual(['name', 'gender'])
        expect(preview.filters[0].id).toBe('name')
    })

    it('round-trips a slot step through the DOM id', () => {
        const path = [0, 'tabs.2', 0]
        expect(idToPath(pathToId(path))).toEqual(path)
        expect(splitSeg('groupActions.3')).toEqual({ key: 'groupActions', index: 3 })
        expect(idToPath('ve-0-bad-step')).toBeNull()
    })

    it('a TabLayout\'s tabs are reachable, and a Tab\'s single content is edited as a list and written back as one', () => {
        const doc = parsePage(`type: TabLayout
tabs:
  - type: Tab
    label: One
    content: {type: Text, text: hello}
`)
        expect(nodeAt(doc, ['tabs.0', 0])?.text).toBe('hello')
        const out = parse(serializePage(doc))
        expect(out.tabs[0].content).toEqual({ type: 'Text', text: 'hello' })
        // and the preview sends the single-object shape the backend deserializes
        expect(parse(decorateForPreview(doc)).tabs[0].content.type).toBe('Text')
    })
})

describe('SINGLE_CONTENT is pinned to the generated schema', () => {
    it('lists exactly the components whose content is one component', () => {
        const schemaPath = resolve(__dirname, '../../../../../../../backend/shared/uidl/uidl-schema.json')
        const schema = JSON.parse(readFileSync(schemaPath, 'utf-8'))
        const single: string[] = []
        for (const def of Object.values<any>(schema.$defs)) {
            const type = def?.properties?.type?.const
            if (type && def.properties.content?.$ref === '#/$defs/Component') single.push(type)
        }
        expect([...SINGLE_CONTENT].sort()).toEqual(single.sort())
    })
})
