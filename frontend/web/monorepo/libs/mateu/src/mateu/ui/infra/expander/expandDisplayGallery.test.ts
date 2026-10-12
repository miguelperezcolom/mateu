// Every display component of the authoring catalogue, expanded in the BROWSER (a specsOnly static
// bundle has no server to map them) the way the Java server maps them. The authored input is the very
// file the server rendered (backend/shared/core/src/test/resources/specs/ui/display-gallery.yaml) and
// the golden its rendering (YamlDisplayGallerySyncTest, -Dexpander.golden.write=true), so the two sides
// cannot drift: a component the expander leaves raw, or nests where the server does not, fails here.

import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { parse } from 'yaml'
import { expandDefinition, type DefinitionSpec } from '@infra/expander/expandDefinition'
import { expectSubset } from '@infra/expander/__fixtures__/structuralSubset'
import golden from '@infra/expander/__fixtures__/display-gallery.golden.json'

const SPECS = resolve(__dirname, '../../../../../../../../../../backend/shared/core/src/test/resources/specs/ui')
const spec: DefinitionSpec = parse(readFileSync(resolve(SPECS, 'display-gallery.yaml'), 'utf-8'))

const types = (node: any, out: string[] = []): string[] => {
    if (Array.isArray(node)) node.forEach((n) => types(n, out))
    else if (node && typeof node === 'object') {
        if (node.metadata && typeof node.metadata.type === 'string') out.push(node.metadata.type)
        Object.values(node).forEach((v) => types(v, out))
    }
    return out
}

describe('client-side expander — every display component, against the Java golden', () => {
    const wire = expandDefinition(spec, 'display-gallery') as any
    const component = wire.fragments[0].component
    const goldenComponent = (golden as any).fragments[0].component

    it('emits the same component types, in the same order, as the server', () => {
        expect(types(component.children)).toEqual(types(goldenComponent.children))
    })

    it('each component is a structural subset of the server\'s', () => {
        const expanded = component.children[0].children
        const served = goldenComponent.children[0].children
        expect(expanded).toHaveLength(served.length)
        expanded.forEach((child: any, i: number) => {
            try {
                expectSubset(child, served[i])
            } catch (e) {
                throw new Error(`${child?.metadata?.type} (#${i}): ${(e as Error).message}`)
            }
        })
    })

    it('a Notice keeps its content as children, as NoticeMapper lifts it', () => {
        const notice = component.children[0].children.find((c: any) => c.metadata.type === 'Notice')
        expect(notice.metadata.content).toBeUndefined()
        expect(notice.children.map((c: any) => c.metadata.text)).toEqual(['Inside the notice'])
    })

    it('a MatrixGrid is normalised like MatrixGridMapper: section ids, one cell per column', () => {
        const matrix = component.children[0].children.find((c: any) => c.metadata.type === 'MatrixGrid')
        const served = goldenComponent.children[0].children.find((c: any) => c.metadata.type === 'MatrixGrid')
        expect(matrix.metadata.sections[0].id).toBe(served.metadata.sections[0].id)
        const short = expandDefinition({
            layout: {
                type: 'MatrixGrid',
                columns: [{ id: 'a' }, { id: 'b' }, { id: 'c' }],
                sections: [{ title: 'One', rows: [{ id: 'r', cells: [{ value: '1' }] }] }, { title: 'Two', rows: [] }],
            },
        } as DefinitionSpec, 'm') as any
        const sections = short.fragments[0].component.metadata.sections
        expect(sections.map((s: any) => s.id)).toEqual(['section0', 'section1'])
        expect(sections[0].rows[0].cells.map((c: any) => c.value)).toEqual(['1', '', ''])
    })

    it('advertises every action the components name', () => {
        const ids = (component.actions ?? []).map((a: any) => a.id)
        for (const id of ['pickTask', 'moveBlock', 'editCell', 'cancelBooking', 'openMarker', 'drillRevenue', 'openDay']) {
            expect(ids).toContain(id)
        }
    })
})
