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
 * The ModelView FQNs to offer in the bind-data picker: the ones already referenced by the mount's
 * routes (from {@link ProjectIndex}) plus the page's CURRENT binding (so a hand-typed FQN not yet in
 * any route stays selectable), sorted + de-duplicated. Pure so the shell can render a `<select>` and
 * a test can pin the merge/sort. An empty result means "no known models — fall back to free text".
 */
export function modelViewOptions(known: string[] | undefined, current: string | undefined): string[] {
    const set = new Set<string>()
    for (const vm of known ?? []) { const t = vm?.trim(); if (t) set.add(t) }
    const cur = current?.trim()
    if (cur) set.add(cur)
    return [...set].sort((a, b) => a.localeCompare(b))
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

/**
 * Wire an action: add a `Button` bound to `actionId`, and give the action a home —
 *   - a **bound** page (has `modelView`): the id references an `@Action`; nothing else is scaffolded
 *     (create the method with the IDE "Create in ViewModel" quick-fix / the Sync panel),
 *   - a **classless** page: also declare a page-level `actions:` entry with a `restAction` stub (a
 *     placeholder URL to edit), so the button actually does something with no backend class.
 */
export function wireAction(doc: PageDoc, label: string, actionId: string): PageDoc {
    const root = asContainer(clone(doc.layout))
    root.content = [...(root.content ?? []), { type: 'Button', label: label || actionId, actionId }]
    let next: PageDoc = { ...doc, layout: root }
    if (!next.modelView) {
        const rest = { ...(next.rest ?? {}) } as Record<string, unknown>
        const actions = Array.isArray(rest.actions) ? [...(rest.actions as unknown[])] : []
        const has = actions.some((a) => (a as Record<string, unknown>)?.id === actionId)
        if (!has) {
            actions.push({
                id: actionId,
                restAction: { source: { url: 'https://api.example.com/resource', method: 'POST' }, successMessage: 'Done' },
            })
            rest.actions = actions
            next = { ...next, rest }
        }
    }
    return next
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
