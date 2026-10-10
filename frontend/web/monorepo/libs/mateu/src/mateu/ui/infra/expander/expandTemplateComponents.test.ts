// The component shapes the IDE page templates use, expanded the way the SERVER maps them. Each golden
// was captured from the JAVA backend (TemplateComponentsDefinitionSyncTest renders the definition-only
// routes specs/ui/template-*.yaml and writes __fixtures__/<route>.golden.json with
// -Dexpander.golden.write=true), and the authored input here is THAT SAME YAML file, so the two sides
// cannot drift apart. Render-parity: the expander's output must be a structural subset of the golden
// (the golden also carries the server's per-type defaults and random ids, which the renderer does not
// need).

import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { parse } from 'yaml'
import { expandComponent, type FluentNode } from '@infra/expander/expandComponent'
import { expectSubset } from '@infra/expander/__fixtures__/structuralSubset'
import scoreboard from '@infra/expander/__fixtures__/template-scoreboard.golden.json'
import tabs from '@infra/expander/__fixtures__/template-tabs.golden.json'
import foldout from '@infra/expander/__fixtures__/template-foldout.golden.json'
import cardTitle from '@infra/expander/__fixtures__/template-card-title.golden.json'
import formHeader from '@infra/expander/__fixtures__/template-form-header.golden.json'

const SPECS = resolve(__dirname, '../../../../../../../../../../backend/shared/core/src/test/resources/specs/ui')
const authored = (route: string): FluentNode => parse(readFileSync(resolve(SPECS, route + '.yaml'), 'utf-8'))
const goldenComponent = (golden: unknown) => (golden as any).fragments[0].component

describe('client-side expander — the IDE page templates\' component shapes, against the Java goldens', () => {
    it('Scoreboard: metrics are lifted to children', () => {
        const wire = expandComponent(authored('template-scoreboard')) as any
        expectSubset(wire, goldenComponent(scoreboard))
        expect(wire.metadata.metrics).toBeUndefined()
        expect(wire.children.map((c: any) => c.metadata.type)).toEqual(['MetricCard', 'MetricCard'])
    })

    it('TabLayout: tabs are lifted to children, and each tab\'s content to its own children', () => {
        const wire = expandComponent(authored('template-tabs')) as any
        expectSubset(wire, goldenComponent(tabs))
        expect(wire.metadata.tabs).toBeUndefined()
        expect(wire.children[0].metadata).toMatchObject({ type: 'Tab', label: 'Details', active: true })
        expect(wire.children[0].children[0].metadata.text).toBe('Details go here')
    })

    it('FoldoutLayout: overview and panel contents become slotted children, panel headers stay in metadata', () => {
        const wire = expandComponent(authored('template-foldout')) as any
        expectSubset(wire, goldenComponent(foldout))
        expect(wire.metadata.overview).toBeUndefined()
        expect(wire.metadata.panels).toEqual([
            { title: 'Operations', open: true, width: '30rem' },
            { title: 'Notes', open: false },
            { title: 'Profile', open: false },
        ])
        expect(wire.metadata.badges).toEqual(['Confirmed'])
        // the content-less Notes panel leaves a gap: panel-1 does not exist
        expect(wire.children.map((c: any) => c.slot)).toEqual(['overview', 'panel-0', 'panel-2'])
    })

    it('Card: a component title is expanded in place', () => {
        const wire = expandComponent(authored('template-card-title')) as any
        expectSubset(wire, goldenComponent(cardTitle))
        expect(wire.metadata.title).toMatchObject({ type: 'ClientSide', metadata: { type: 'Text', text: 'Contact' } })
        expect(wire.children).toEqual([])
    })

    it('Form: header components (and the sized avatar) are expanded in place', () => {
        const wire = expandComponent(authored('template-form-header')) as any
        expectSubset(wire, goldenComponent(formHeader))
        expect(wire.metadata.header.map((c: any) => c.metadata.type)).toEqual(['Text', 'ProgressBar'])
        expect(wire.metadata.avatar.style).toBe(';width: 4rem;height: 4rem;')
    })
})
