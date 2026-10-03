import { describe, it, expect } from 'vitest'
import { parse } from 'yaml'
import { parsePage, serializePage } from './pageModel'
import { renameBinding, mentionsIn, boundIds } from './rename'

const PAGE = `type: Listing
title: \${state.name} and \${state.names}
rowRoute: people/\${row.name}
filters:
  - {type: FormField, id: name, label: Name}
columns:
  - {type: GridColumn, id: name, label: Name}
  - {type: GridColumn, id: gender, label: Gender}
`

describe('renameBinding', () => {
    it('renames the filter, the column and every whole-word expression — and nothing else', () => {
        const { doc, changes } = renameBinding(parsePage(PAGE), 'name', 'fullName')
        const out = parse(serializePage(doc))
        expect(out.filters[0].id).toBe('fullName')
        expect(out.columns.map((c: any) => c.id)).toEqual(['fullName', 'gender'])
        expect(out.title).toBe('${state.fullName} and ${state.names}') // `names` is another binding
        expect(out.rowRoute).toBe('people/${row.fullName}')
        expect(changes).toBe(4)
    })

    it('moves triggers and declared actions along', () => {
        const page = parsePage(`layout:
  type: FormLayout
  content:
    - {type: FormField, id: email}
triggers:
  - {type: OnValueChangeTrigger, propertyName: email, actionId: check}
actions:
  - id: check
    restAction: {source: {url: "/api/check?e=\${state.email}"}}
`)
        const { doc } = renameBinding(page, 'email', 'mail')
        const out = parse(serializePage(doc))
        expect(out.layout.content[0].id).toBe('mail')
        expect(out.triggers[0].propertyName).toBe('mail')
        expect(out.actions[0].restAction.source.url).toBe('/api/check?e=${state.mail}')
    })

    it('counts mentions in another file, and lists the bound ids', () => {
        expect(mentionsIn('url: x?name=${state.name}&n=${state.names}', 'name')).toBe(1)
        expect([...boundIds(parsePage(PAGE).layout)]).toEqual(['name', 'gender'])
    })
})
