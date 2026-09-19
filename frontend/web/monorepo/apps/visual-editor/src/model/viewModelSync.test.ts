import { describe, it, expect } from 'vitest'
import { diffAgainstContract, isInSync } from './viewModelSync'
import { parsePage } from './pageModel'

describe('viewModelSync', () => {
    const doc = parsePage(`modelView: com.acme.PersonView
layout:
  type: VerticalLayout
  content:
    - type: FormField
      id: name
    - type: FormField
      id: email
    - type: Button
      label: Save
      actionId: save
triggers:
  - type: OnLoadTrigger
    actionId: preload
`)

    it('reports dangling page refs and undeployed model members, both directions', () => {
        const diff = diffAgainstContract(doc, { fields: ['name', 'phone'], actions: ['save', 'delete'] })
        expect(diff.boundViewModel).toBe('com.acme.PersonView')
        // on the page, absent from the model → create in the ViewModel (IDE)
        expect(diff.missingFields).toEqual(['email'])
        expect(diff.missingActions).toEqual(['preload']) // the trigger's action isn't declared
        // in the model, not on the page → add to the layout
        expect(diff.unusedFields).toEqual(['phone'])
        expect(diff.unusedActions).toEqual(['delete'])
        expect(isInSync(diff)).toBe(false)
    })

    it('is in sync when the page and the model match exactly', () => {
        const diff = diffAgainstContract(doc, { fields: ['name', 'email'], actions: ['save', 'preload'] })
        expect(diff).toMatchObject({ missingFields: [], missingActions: [], unusedFields: [], unusedActions: [] })
        expect(isInSync(diff)).toBe(true)
    })

    it('with no contract, every page ref is "missing" and nothing is unused', () => {
        const diff = diffAgainstContract(doc, undefined)
        expect(diff.missingFields).toEqual(['name', 'email'])
        expect(diff.unusedFields).toEqual([])
    })
})
