import { describe, it, expect } from 'vitest'
import { parse } from 'yaml'
import { pageActionIds, actionSteps, setActionSteps, addFlowAction, removeAction, stepParam } from './flowEditor'
import { parsePage, serializePage } from './pageModel'

const page = (yaml: string) => parsePage(yaml)

describe('flowEditor', () => {
    const src = `layout:
  type: VerticalLayout
  content:
    - type: Button
      label: Save and close
      actionId: saveAndClose
actions:
  - id: saveAndClose
    steps:
      - type: MarkClean
      - type: Navigate
        route: /orders
  - id: ping
    restAction:
      source:
        url: https://x/api
        method: POST
`

    it('reads page action ids and an action flow', () => {
        const doc = page(src)
        expect(pageActionIds(doc)).toEqual(['saveAndClose', 'ping'])
        expect(actionSteps(doc, 'saveAndClose')).toEqual([
            { type: 'MarkClean', route: undefined, event: undefined, actionId: undefined, extra: {} },
            { type: 'Navigate', route: '/orders', event: undefined, actionId: undefined, extra: {} },
        ])
        expect(actionSteps(doc, 'ping')).toEqual([]) // restAction action carries no flow
    })

    it('sets steps (round-trips) and keeps a restAction sibling intact', () => {
        let doc = page(src)
        doc = setActionSteps(doc, 'saveAndClose', [
            { type: 'RunAction', actionId: 'persist', extra: {} },
            { type: 'CloseOverlay', event: 'saved', extra: {} },
        ])
        const out = parse(serializePage(doc))
        expect(out.actions[0]).toEqual({ id: 'saveAndClose', steps: [{ type: 'RunAction', actionId: 'persist' }, { type: 'CloseOverlay', event: 'saved' }] })
        // the RunAction stub action is untouched
        expect(out.actions[1].restAction.source.method).toBe('POST')
    })

    it('adds a new flow action, and emptying a flow drops the steps key', () => {
        let doc = page('type: VerticalLayout\ncontent: []\n')
        doc = addFlowAction(doc, 'go')
        expect(pageActionIds(doc)).toEqual(['go'])
        doc = setActionSteps(doc, 'go', [{ type: 'MarkDirty', extra: {} }])
        expect((doc.rest!.actions as any)[0].steps).toHaveLength(1)
        doc = setActionSteps(doc, 'go', [])
        expect((doc.rest!.actions as any)[0].steps).toBeUndefined()
    })

    it('removes an action (clearing the actions key when last)', () => {
        let doc = addFlowAction(page('type: VerticalLayout\ncontent: []\n'), 'only')
        doc = removeAction(doc, 'only')
        expect(doc.rest?.actions).toBeUndefined()
    })

    it('maps each verb to its param field', () => {
        expect(stepParam('Navigate')).toEqual({ key: 'route', label: 'route' })
        expect(stepParam('RunAction')?.key).toBe('actionId')
        expect(stepParam('Emit')?.key).toBe('event')
        expect(stepParam('MarkClean')).toBeNull()
    })
})
