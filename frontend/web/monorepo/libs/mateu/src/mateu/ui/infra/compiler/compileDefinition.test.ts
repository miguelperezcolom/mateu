// Phase 8 (coherence-plan #11) — the static compiler emits final HTML+CSS for the declarative
// subset, with no Mateu runtime. It reuses the Phase-6 expander's model understanding, so these
// tests pin the OUTPUT STAGE: the compiled HTML carries the same content the expander's wire does.
import { describe, expect, it } from 'vitest'
import {
    compileComponent,
    compileDefinition,
    compileToDocument,
    escapeHtml,
    COMPILED_CSS,
} from '@infra/compiler/compileDefinition'
import { expandComponent, type FluentNode } from '@infra/expander/expandComponent'

describe('static compiler — compileComponent (Phase 8, #11)', () => {
    it('compiles a VerticalLayout of a Text (the about-page shape) to a flex column + <p>', () => {
        const layout: FluentNode = {
            type: 'VerticalLayout',
            content: [{ type: 'Text', text: 'About this app' }],
        }
        const html = compileComponent(expandComponent(layout) as never)
        expect(html).toBe('<div class="mateu-c mateu-col"><p class="mateu-text">About this app</p></div>')
    })

    it('maps an hN Text container to that heading tag', () => {
        const html = compileComponent(
            expandComponent({ type: 'Text', text: 'Title', container: 'h1' } as FluentNode) as never
        )
        expect(html).toBe('<h1 class="mateu-text">Title</h1>')
    })

    it('nests a Card\'s metadata.content (not wire children)', () => {
        const layout: FluentNode = {
            type: 'Card',
            variants: ['outlined'],
            content: { type: 'VerticalLayout', content: [{ type: 'Text', text: 'Inside a card' }] },
        }
        const html = compileComponent(expandComponent(layout) as never)
        expect(html).toBe(
            '<article class="mateu-card"><div class="mateu-c mateu-col"><p class="mateu-text">Inside a card</p></div></article>'
        )
    })

    it('lifts a HorizontalLayout to a flex row', () => {
        const html = compileComponent(
            expandComponent({ type: 'HorizontalLayout', content: [{ type: 'Text', text: 'a' }] } as FluentNode) as never
        )
        expect(html).toContain('class="mateu-c mateu-row"')
    })

    it('emits an honest placeholder comment for a type with no static compiler (not a silent drop)', () => {
        const html = compileComponent(expandComponent({ type: 'Chart' } as FluentNode) as never)
        expect(html).toContain('<!-- mateu: no static compiler for "Chart"')
    })

    it('escapes interpolated text', () => {
        expect(escapeHtml('<b>&"x"</b>')).toBe('&lt;b&gt;&amp;&quot;x&quot;&lt;/b&gt;')
        const html = compileComponent(
            expandComponent({ type: 'Text', text: '<script>alert(1)</script>' } as FluentNode) as never
        )
        expect(html).not.toContain('<script>')
        expect(html).toContain('&lt;script&gt;')
    })
})

describe('static compiler — compileDefinition / compileToDocument (Phase 8, #11)', () => {
    const about = { layout: { type: 'VerticalLayout', content: [{ type: 'Text', text: 'About this app' }] } }

    it('returns html + the critical css', () => {
        const { html, css } = compileDefinition(about, 'about')
        expect(html).toContain('About this app')
        expect(css).toBe(COMPILED_CSS)
    })

    it('wraps a self-contained document with the title, inlined css, and NO script tag (zero runtime)', () => {
        const doc = compileToDocument(about, 'about', 'About')
        expect(doc).toContain('<!doctype html>')
        expect(doc).toContain('<title>About</title>')
        expect(doc).toContain(COMPILED_CSS)
        expect(doc).toContain('About this app')
        // the whole point of #11: no Mateu runtime, no script at all
        expect(doc).not.toContain('<script')
    })

    it('refuses a viewModel route — it needs a backend, not a static file', () => {
        expect(() =>
            compileDefinition({ viewModel: 'com.acme.Foo', layout: { type: 'Text', text: 'x' } }, 'foo')
        ).toThrow(/not statically compilable/)
    })
})
