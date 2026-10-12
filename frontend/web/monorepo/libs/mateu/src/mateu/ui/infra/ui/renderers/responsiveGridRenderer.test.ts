// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { LitElement, render } from 'lit'
import type ClientSideComponent from '@mateu/shared/apiClients/dtos/ClientSideComponent'
import { renderResponsiveGrid } from './responsiveGridRenderer'

/** A stacking grid sits in a container-query wrapper, and an inline-size container takes no width
 *  from its content: in a start-aligned column it shrank to nothing (the ports' CollectionDetail
 *  rendered as a sliver). The wrapper takes the width it is given. */
describe('a responsive grid that stacks', () => {
    it('fills the width of its parent', () => {
        const host = document.createElement('div')
        const component = {
            type: 'ClientSide', id: 'collection-detail', children: [],
            metadata: { type: 'ResponsiveGrid', gridTemplateColumns: '24rem 1fr', stackBelow: '48rem', gridTemplateAreas: '"list detail"' },
        } as unknown as ClientSideComponent
        render(renderResponsiveGrid({} as LitElement, component, undefined, {}, {}, {}, {}), host)
        const wrapper = host.querySelector('.mateu-responsive-grid-container') as HTMLElement
        expect(wrapper.getAttribute('style')).toContain('container-type: inline-size')
        expect(wrapper.getAttribute('style')).toContain('width: 100%')
    })
})
