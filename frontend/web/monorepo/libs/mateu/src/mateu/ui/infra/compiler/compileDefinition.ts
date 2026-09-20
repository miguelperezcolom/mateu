// Phase 8 (coherence-plan #11) — compile a UI WITHOUT a renderer. Where the Phase-6 expander
// INTERPRETS the declarative model (spec → wire, painted by a runtime renderer), this COMPILES it:
// spec → final static HTML+CSS, with NO Mateu runtime. Zero overhead, minimal bundle, runs anywhere
// you can serve a file (a CDN, an email, an embed) — see design/phase8-seeds.md.
//
// It reuses the expander's MODEL UNDERSTANDING (container lifting, Card content-in-metadata, …) and
// swaps only the OUTPUT STAGE: instead of a wire tree for a renderer, it walks that tree and emits
// semantic HTML. This is increment 1: the declarative/no-backend STATIC subset the expander covers
// today (layouts, Card, Text). A component with no compiler emits a visible, honest placeholder
// comment rather than being dropped — the compile-time twin of <mateu-unsupported>. Backend-driven
// screens (a viewModel, RunAction, proxy/secret) are intentionally out of scope: they need a
// backend, so they are not half-compiled.

import { expandComponent, type FluentNode } from '@infra/expander/expandComponent'
import { isClientExpandable, type DefinitionSpec } from '@infra/expander/expandDefinition'

/** A wire ClientSide component (loose, like the expander's own view of the tree). */
interface WireComponent {
    type?: string
    metadata?: { type?: string; [field: string]: unknown }
    children?: WireComponent[]
    style?: string
    cssClasses?: string
}

/** Minimal HTML text escaping for interpolated content and attribute values. */
export function escapeHtml(value: unknown): string {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
}

// The container metadata types the expander lifts to wire children — compiled to a fl[ex] <div>.
const FLEX_COLUMN = new Set(['VerticalLayout', 'Div', 'FlexLayout'])
const FLEX_ROW = new Set(['HorizontalLayout'])

const styleAttr = (style: string | undefined): string =>
    style && style.trim() ? ` style="${escapeHtml(style)}"` : ''

const classAttr = (cssClasses: string | undefined, extra: string): string => {
    const cls = [extra, cssClasses].filter((c) => c && String(c).trim()).join(' ')
    return cls ? ` class="${escapeHtml(cls)}"` : ''
}

/** The HTML tag a Text renders as: an hN container maps to that heading, anything else to a <p>. */
const textTag = (container: unknown): string =>
    typeof container === 'string' && /^h[1-6]$/.test(container) ? container : 'p'

/**
 * Compile ONE wire component to HTML. Recurses into container children and a Card's
 * metadata.content. An unrecognised type emits an HTML comment placeholder (honest gap, not a silent
 * drop) — the compile-time counterpart of the renderer's <mateu-unsupported>.
 */
export function compileComponent(component: WireComponent | undefined): string {
    if (!component?.metadata?.type) return ''
    const meta = component.metadata
    const type = meta.type as string
    const kids = (component.children ?? []).map(compileComponent).join('')

    if (FLEX_COLUMN.has(type)) {
        return `<div${classAttr(component.cssClasses, 'mateu-c mateu-col')}${styleAttr(component.style)}>${kids}</div>`
    }
    if (FLEX_ROW.has(type)) {
        return `<div${classAttr(component.cssClasses, 'mateu-c mateu-row')}${styleAttr(component.style)}>${kids}</div>`
    }
    if (type === 'Card') {
        // A Card holds its single child under metadata.content (expanded), not in wire children.
        const content = compileComponent(meta.content as WireComponent | undefined)
        return `<article${classAttr(component.cssClasses, 'mateu-card')}${styleAttr(component.style)}>${content}${kids}</article>`
    }
    if (type === 'Text') {
        const tag = textTag(meta.container)
        return `<${tag} class="mateu-text">${escapeHtml(meta.text)}</${tag}>`
    }
    // No compiler for this type in increment 1 — show the gap, do not drop it silently.
    return `<!-- mateu: no static compiler for "${escapeHtml(type)}" (needs a renderer or a backend) -->${kids}`
}

/** The critical stylesheet the compiled HTML relies on. Tiny, inlined, design-system-neutral. */
export const COMPILED_CSS = [
    '.mateu-c{display:flex;gap:1rem}',
    '.mateu-col{flex-direction:column}',
    '.mateu-row{flex-direction:row;flex-wrap:wrap}',
    '.mateu-card{border:1px solid #d5d5d5;border-radius:8px;padding:1rem}',
    '.mateu-text{margin:0}',
].join('')

export interface CompiledDefinition {
    html: string
    css: string
}

/**
 * Compile a declarative definition to static HTML + CSS, with no Mateu runtime. Throws for a
 * definition that is NOT client-expandable (a viewModel route runs server logic that cannot be
 * compiled to a static file — the same honest boundary the expander draws).
 */
export function compileDefinition(spec: DefinitionSpec, route: string): CompiledDefinition {
    if (!isClientExpandable(spec)) {
        throw new Error(
            `Definition for route "${route}" is not statically compilable (it has a viewModel — it needs a backend)`
        )
    }
    // Reuse the expander's model understanding, then compile the resulting tree instead of rendering it.
    const layout = (spec.layout && typeof spec.layout === 'object'
        ? spec.layout
        : spec) as unknown as FluentNode
    const wire = expandComponent(layout) as unknown as WireComponent
    return { html: compileComponent(wire), css: COMPILED_CSS }
}

/** Wrap a compiled definition in a complete, self-contained HTML document — ready to write to a file. */
export function compileToDocument(spec: DefinitionSpec, route: string, title?: string): string {
    const { html, css } = compileDefinition(spec, route)
    const docTitle = escapeHtml(title ?? route)
    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${docTitle}</title>
<style>${css}</style>
</head>
<body>${html}</body>
</html>`
}
