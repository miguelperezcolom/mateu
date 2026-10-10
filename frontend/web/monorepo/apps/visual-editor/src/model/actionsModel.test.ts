import { describe, it, expect } from 'vitest'
import { parse } from 'yaml'
import {
    isActionsYaml, parseActionsDoc, serializeActionsDoc, parseActionCatalogue, catalogueIds, catalogueSteps,
    setCatalogueSteps, addCatalogueFlow, removeCatalogueAction, renameCatalogueAction, setCatalogueDescription,
} from './actionsModel'
import { buildIndex, catalogueActionOptions } from './projectIndex'

const CATALOGUE = `type: Actions
actions:
  - id: newOrder
    description: Start a new order
    steps:
      - type: MarkClean
      - type: Navigate
        route: orders/new
  - id: refreshCustomers
    restAction:
      source:
        url: https://example.test/api/customers
        method: POST
      successMessage: Refreshed
    confirmationRequired: true
  - id: serverOnly
`

describe('action catalogue model', () => {
    it('recognises a type: Actions file and nothing else', () => {
        expect(isActionsYaml(CATALOGUE)).toBe(true)
        expect(isActionsYaml('type: Actions\nactions: []\n')).toBe(true)
        expect(isActionsYaml('type: Sources\nsources: []\n')).toBe(false)
        // a page declaring its own actions is a page, not a catalogue
        expect(isActionsYaml('type: VerticalLayout\nactions:\n  - id: a\n')).toBe(false)
        expect(isActionsYaml('layout:\n  type: Text\nactions: []\n')).toBe(false)
        expect(isActionsYaml(': not yaml')).toBe(false)
    })

    it('round-trips losslessly (restAction and unknown keys kept)', () => {
        const doc = parseActionsDoc(CATALOGUE)
        expect(parse(serializeActionsDoc(doc))).toEqual(parse(CATALOGUE))
    })

    it('an empty skeleton starts with no actions and keeps its type', () => {
        const doc = parseActionsDoc('type: Actions\nactions: []\n')
        expect(doc.actions).toEqual([])
        expect(parse(serializeActionsDoc(addCatalogueFlow(doc, 'go')))).toEqual({ type: 'Actions', actions: [{ id: 'go', steps: [] }] })
    })

    it('adds, edits steps of, renames, describes and removes entries', () => {
        let doc = parseActionsDoc(CATALOGUE)
        expect(catalogueIds(doc)).toEqual(['newOrder', 'refreshCustomers', 'serverOnly'])
        expect(catalogueSteps(doc, 'newOrder').map((s) => s.type)).toEqual(['MarkClean', 'Navigate'])

        doc = addCatalogueFlow(doc, 'announce')
        doc = setCatalogueSteps(doc, 'announce', [{ type: 'Emit', event: 'hello', extra: {} }])
        expect(catalogueSteps(doc, 'announce')[0]).toMatchObject({ type: 'Emit', event: 'hello' })

        doc = renameCatalogueAction(doc, 'newOrder', 'startOrder')
        expect(catalogueIds(doc)).toContain('startOrder')
        expect(catalogueSteps(doc, 'startOrder')).toHaveLength(2)
        // a taken or blank id is refused
        expect(renameCatalogueAction(doc, 'startOrder', 'announce')).toBe(doc)
        expect(renameCatalogueAction(doc, 'startOrder', '  ')).toBe(doc)

        doc = setCatalogueDescription(doc, 'announce', 'Say hello')
        expect(doc.actions.find((a) => a.id === 'announce')?.description).toBe('Say hello')
        doc = setCatalogueDescription(doc, 'announce', '')
        expect(doc.actions.find((a) => a.id === 'announce')).not.toHaveProperty('description')

        doc = removeCatalogueAction(doc, 'serverOnly')
        expect(catalogueIds(doc)).toEqual(['startOrder', 'refreshCustomers', 'announce'])
        // the REST action is untouched by all of the above
        expect(doc.actions.find((a) => a.id === 'refreshCustomers')).toEqual(parse(CATALOGUE).actions[1])
    })

    it('reads each entry with its kind', () => {
        expect(parseActionCatalogue(CATALOGUE)).toEqual([
            { id: 'newOrder', description: 'Start a new order', kind: 'flow' },
            { id: 'refreshCustomers', description: undefined, kind: 'rest' },
            { id: 'serverOnly', description: undefined, kind: 'other' },
        ])
    })
})

describe('the project index collects the catalogue', () => {
    const idx = buildIndex([
        { path: 'actions.yaml', content: CATALOGUE },
        { path: 'catalogs/more.yaml', content: 'type: Actions\nactions:\n  - id: fromOtherFile\n    steps:\n      - {type: Navigate, route: home}\n' },
        { path: 'orders.yaml', content: 'type: VerticalLayout\ncontent: []\n' },
    ])

    it('from every type: Actions file, and does not list them as pages', () => {
        expect(idx.actions.map((a) => a.id)).toEqual(['newOrder', 'refreshCustomers', 'serverOnly', 'fromOtherFile'])
        expect(idx.pages).toEqual(['orders.yaml'])
    })

    it('offers the runnable ids with hint "catalog", minus what the owner declares itself', () => {
        expect(catalogueActionOptions(idx)).toEqual([
            { value: 'newOrder', hint: 'catalog' },
            { value: 'refreshCustomers', hint: 'catalog' },
            { value: 'fromOtherFile', hint: 'catalog' },
        ])
        expect(catalogueActionOptions(idx, ['newOrder', undefined]).map((o) => o.value)).toEqual(['refreshCustomers', 'fromOtherFile'])
        expect(catalogueActionOptions(undefined)).toEqual([])
    })
})
