import { describe, expect, it } from 'vitest'
import { parseComponentCatalogue } from './componentCatalogue'
import { buildIndex } from './projectIndex'

const CATALOGUE = `components:
  - name: AgencySelector
    component: {type: FormField, id: agency, stereotype: select}
  - name: Notice
    component: {type: Notice, text: Hi}
`

describe('the business component catalogue (components.yaml)', () => {
    it('is recognised and summarised', () => {
        expect(parseComponentCatalogue(CATALOGUE)).toEqual([
            { name: 'AgencySelector', rootType: 'FormField' },
            { name: 'Notice', rootType: 'Notice' },
        ])
        expect(parseComponentCatalogue('type: Components\n' + CATALOGUE)).toHaveLength(2)
    })

    it('a page is not a catalogue', () => {
        expect(parseComponentCatalogue('type: VerticalLayout\ncontent: []')).toBeUndefined()
        expect(parseComponentCatalogue('layout: {type: Text, text: x}')).toBeUndefined()
        expect(parseComponentCatalogue(':::')).toBeUndefined()
    })

    it('is never offered as a page a route can render', () => {
        const index = buildIndex([
            { path: 'components.yaml', content: CATALOGUE },
            { path: 'home.yaml', content: 'type: Text\ntext: hi' },
        ])
        expect(index.pages).toEqual(['home.yaml'])
    })
})
