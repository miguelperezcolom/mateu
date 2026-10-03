import { describe, it, expect } from 'vitest'
import { parse } from 'yaml'
import { parsePage, serializePage } from './pageModel'
import { pageActions, upsertAction, newRestAction, setActionField, withPageActions } from './pageActions'
import { pageActionIds } from './flowEditor'

describe('page actions live where the file keeps them', () => {
    it('reads and writes a bare definition\'s actions on its root — the file keeps its shape', () => {
        const doc = parsePage(`type: Form
title: Edit
actions:
  - id: save
    restAction: {source: {ref: person-update}, successMessage: Saved}
`)
        expect(pageActions(doc).map((a) => a.id)).toEqual(['save'])
        expect(pageActionIds(doc)).toEqual(['save']) // the Flows panel sees it too
        const next = upsertAction(doc, newRestAction('delete', 'person-delete'))
        const out = parse(serializePage(next))
        expect(out.type).toBe('Form') // still a bare Form, not wrapped in a layout: envelope
        expect(out.actions.map((a: any) => a.id)).toEqual(['save', 'delete'])
        expect(out.actions[1].restAction).toEqual({ source: { ref: 'person-delete' }, successMessage: 'Done' })
    })

    it('an envelope page keeps them beside the layout', () => {
        const doc = upsertAction(parsePage('layout:\n  type: VerticalLayout\n  content: []\n'), newRestAction('go'))
        expect(parse(serializePage(doc)).actions[0].id).toBe('go')
        expect(pageActions(withPageActions(doc, []))).toEqual([])
    })

    it('sets and clears dotted fields, dropping emptied parents', () => {
        let a = newRestAction('save', 'x')
        a = setActionField(a, 'restAction.successRoute', 'people')
        a = setActionField(a, 'confirmationTexts.message', 'Sure?')
        expect(a.restAction?.successRoute).toBe('people')
        a = setActionField(a, 'confirmationTexts.message', '')
        expect(a.confirmationTexts).toBeUndefined()
    })
})
