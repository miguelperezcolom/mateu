// Phase 6 — the expander maps a Card the way the SERVER does: content nests inside metadata.content
// (a single EXPANDED child), NOT lifted to wire children; variants ride in metadata. The golden
// (card.golden.json) was captured from the JAVA backend (CardDefinitionSyncTest on the definition-only
// "card-def" route) — Python cannot render a bare Card, so Java is the golden source (see
// design/phase6-client-side-expander.md). Render-parity: the assertion is a structural SUBSET —
// everything the expander emits must be present and equal in the golden, which also carries the
// server's per-type default fields (media/header/title/… null) that the renderer defaults.

import { describe, expect, it } from 'vitest'
import { expandComponent, type FluentNode } from '@infra/expander/expandComponent'
import { expectSubset } from '@infra/expander/__fixtures__/structuralSubset'
import golden from '@infra/expander/__fixtures__/card.golden.json'

// The parsed card.yaml layout.
const cardLayout: FluentNode = {
    type: 'Card',
    variants: ['outlined'],
    content: {
        type: 'VerticalLayout',
        content: [{ type: 'Text', text: 'Inside a card' }],
    },
}

describe('client-side expander — Card (Phase 6, display components)', () => {
    // The golden increment carries a null target (captured from sync with no initiator) and a
    // server-assigned card id, so compare the COMPONENT subtree — that is what the mapping produces.
    const goldenComponent = (golden as any).fragments[0].component

    it('reproduces the server Card wire (structural subset of the Java golden)', () => {
        expectSubset(expandComponent(cardLayout), goldenComponent)
    })

    it('nests the expanded content under metadata.content, not wire children', () => {
        const wire = expandComponent(cardLayout) as any
        expect(wire.metadata.type).toBe('Card')
        expect(wire.metadata.variants).toEqual(['outlined'])
        expect(wire.children).toEqual([]) // NOT lifted
        expect(wire.metadata.content.metadata.type).toBe('VerticalLayout')
        expect(wire.metadata.content.children[0].metadata).toMatchObject({
            type: 'Text',
            text: 'Inside a card',
        })
    })

    it('lifts a HorizontalLayout container the same as a VerticalLayout', () => {
        const row = expandComponent({
            type: 'HorizontalLayout',
            content: [{ type: 'Text', text: 'a' }, { type: 'Text', text: 'b' }],
        }) as any
        expect(row.metadata.type).toBe('HorizontalLayout')
        expect(row.children).toHaveLength(2)
        expect(row.children.every((c: any) => c.metadata.type === 'Text')).toBe(true)
    })
})
