import { PageDoc, PageNode } from './pageModel'
import { InferredField } from './layoutDelta'

/**
 * Contextual Quick Starts (visual-editor Phase 6): higher-altitude scaffolds that rewrite the page in
 * one click, the VB "Quick Starts" analog — data-first ("bind a source, lay its fields out") and
 * structural ("turn this into a listing"). Pure functions over {@link PageDoc} so they are unit-testable
 * and host-agnostic; the shell supplies the picks (a model view, the contract) and applies the result.
 *
 * They stay renderer-neutral and classless-friendly: binding sets `modelView`, scaffolding and the
 * listing transform emit plain layout the backend renders.
 */

/** Bind the page to a data source (a ModelView FQN) so inference + the binding pickers light up. */
export function bindDataSource(doc: PageDoc, modelView: string): PageDoc {
    const mv = modelView.trim()
    return { ...doc, modelView: mv || undefined }
}

/**
 * Lay a data source's fields out as a form: append a `FormField` per contract field into the page's
 * root container (wrapping a non-container root in a VerticalLayout first). Skips fields already bound.
 */
export function scaffoldFieldsFromContract(doc: PageDoc, fields: InferredField[]): PageDoc {
    const root = asContainer(clone(doc.layout))
    const existing = new Set(collectFieldIds(root))
    const toAdd = fields.filter((f) => f.id && !existing.has(f.id))
    const content = [...(root.content ?? [])]
    for (const f of toAdd) {
        const node: PageNode = { type: 'FormField', id: f.id }
        if (f.label) (node as Record<string, unknown>).label = f.label
        if (f.dataType) (node as Record<string, unknown>).dataType = f.dataType
        content.push(node)
    }
    return { ...doc, layout: { ...root, content } }
}

/**
 * Turn the page into a table listing: a `Listing` whose columns come from the `FormField`s already on
 * the page (id + label), or a single default column when there are none. Replaces the layout.
 */
export function turnIntoListing(doc: PageDoc): PageDoc {
    if (doc.layout.type === 'Listing') return doc
    const fields = collectFields(doc.layout)
    const cols = fields.length ? fields : [{ id: 'name', label: 'Name' }]
    const columns = cols.map((f) => {
        const id = (f as Record<string, unknown>).id as string | undefined
        const label = (f as Record<string, unknown>).label as string | undefined
        return { type: 'GridColumn', id: id ?? 'column', label: label ?? id ?? 'Column' }
    })
    const layout: PageNode = { type: 'Listing', title: 'Items', columns } as unknown as PageNode
    // A listing is a snapshot-free static layout; drop any pending delta (it described a form).
    return { ...doc, layout, delta: undefined }
}

// --- helpers ---

function clone<T>(v: T): T {
    return structuredClone(v)
}

/** Ensure a node is a container with a `content` array — wrap a leaf in a VerticalLayout. */
function asContainer(node: PageNode): PageNode {
    if (Array.isArray(node.content)) return node
    return { type: 'VerticalLayout', content: [node] }
}

function collectFields(node: PageNode): PageNode[] {
    const out: PageNode[] = []
    walk(node, (n) => { if (n.type === 'FormField') out.push(n) })
    return out
}

function collectFieldIds(node: PageNode): string[] {
    return collectFields(node)
        .map((n) => (n as Record<string, unknown>).id as string | undefined)
        .filter((id): id is string => !!id)
}

function walk(node: PageNode, visit: (n: PageNode) => void) {
    visit(node)
    if (Array.isArray(node.content)) for (const c of node.content) walk(c, visit)
}
