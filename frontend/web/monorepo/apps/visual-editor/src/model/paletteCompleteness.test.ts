import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { parseSchema, createNode, GROUPS } from './componentSchema'

/**
 * Palette completeness guard (visual-editor Phase 0).
 *
 * The palette is derived — with no hand-kept list — from the generated `uidl-schema.json` (the public
 * authoring contract, ~130 component types). This test pins that the palette therefore exposes the
 * WHOLE authorable catalog and can't silently drop a component or over-hide one, and that every
 * insertable type yields a structurally valid default node. It runs against the REAL schema, so adding
 * a component to Mateu (regenerating the schema) either flows through to the palette or fails here.
 */

// Locate the canonical generated schema by walking up from this test file (robust to the cwd vitest uses).
function loadSchema(): any {
    let dir = dirname(fileURLToPath(import.meta.url))
    const rel = 'backend/shared/uidl/uidl-schema.json'
    while (dir !== '/' && !existsSync(resolve(dir, rel))) dir = dirname(dir)
    const path = resolve(dir, rel)
    if (!existsSync(path)) throw new Error(`could not locate ${rel} above ${dirname(fileURLToPath(import.meta.url))}`)
    return JSON.parse(readFileSync(path, 'utf-8'))
}

/**
 * The sanctioned exclusions: wire plumbing that is a component in the schema but must never be authored
 * by hand. MUST mirror the `HIDDEN` set in componentSchema.ts — the equality assertion below fails if
 * the two drift, so hiding a component stays a reviewed decision.
 */
const PLUMBING = [
    'ServerSideComponent',
    'ClientSideComponent',
    'ModelViewComponent',
    'PageView',
    'AppData',
    'AppState',
    'State',
    'Data',
    'FutureComponent',
]

// A handful of components that must always be authorable — anchors so "the catalog is complete" can't
// pass on an empty/garbage schema.
const ANCHORS = ['FormField', 'Button', 'VerticalLayout', 'HorizontalLayout', 'Card', 'Text', 'Badge', 'Dialog', 'Drawer', 'Listing']

const rawSchema = loadSchema()
const catalog = parseSchema(rawSchema)

/** Every `$def` that is a component (carries a `type` const). */
function allComponentTypes(schema: any): string[] {
    const defs = schema?.$defs ?? {}
    const out: string[] = []
    for (const k of Object.keys(defs)) {
        const c = defs[k]?.properties?.type?.const
        if (typeof c === 'string') out.push(c)
    }
    return out
}

describe('palette completeness', () => {
    it('exposes exactly the full authorable catalog = every component type minus the sanctioned plumbing', () => {
        const expected = allComponentTypes(rawSchema)
            .filter((t) => !PLUMBING.includes(t))
            .sort()
        const actual = [...catalog.components.keys()].sort()
        expect(actual).toEqual(expected)
    })

    it('is substantial and includes the anchor components', () => {
        expect(catalog.components.size).toBeGreaterThanOrEqual(100)
        for (const a of ANCHORS) expect(catalog.components.has(a), `missing anchor ${a}`).toBe(true)
    })

    it('never exposes wire plumbing in the palette', () => {
        for (const p of PLUMBING) expect(catalog.components.has(p), `plumbing ${p} leaked into the palette`).toBe(false)
    })

    it('groups every component into a known bucket', () => {
        for (const spec of catalog.components.values()) {
            expect(GROUPS, `${spec.name} → unknown group ${spec.group}`).toContain(spec.group as (typeof GROUPS)[number])
        }
    })
})

describe('createNode yields a valid default node for every insertable type', () => {
    it('sets type, gives containers a content array, and seeds every required scalar prop', () => {
        for (const spec of catalog.components.values()) {
            const node = createNode(spec) as Record<string, unknown>

            // The discriminator is always the component's own type.
            expect(node.type, `${spec.name}: wrong type`).toBe(spec.name)

            // A container (a content/children list prop) must be insertable — it gets an empty child list.
            const isContainer = spec.props.some((p) => p.kind === 'children' && (p.name === 'content' || p.name === 'children'))
            if (isContainer) expect(node.content, `${spec.name}: container without content[]`).toEqual([])

            // Every required scalar prop is seeded, so a freshly dropped component is not born invalid.
            for (const p of spec.props) {
                if (!p.required) continue
                if (!['string', 'number', 'boolean', 'enum'].includes(p.kind)) continue
                expect(p.name in node, `${spec.name}: required prop '${p.name}' not seeded by createNode`).toBe(true)
            }
        }
    })
})
