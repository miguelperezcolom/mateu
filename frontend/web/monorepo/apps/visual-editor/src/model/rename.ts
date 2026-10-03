import { PageDoc, PageNode, presentSlots } from './pageModel'

/**
 * Rename a data binding — a field's `id` — and carry every reference to it along, so renaming
 * `name` to `fullName` does not silently break the page.
 *
 * What moves together, within the page: every FormField / GridColumn bound to the id (a listing
 * binds the same id as a filter AND a column), every `${state.<id>}` / `${row.<id>}` / `${data.<id>}`
 * expression in any string (titles, routes, urls, messages), the page triggers watching it
 * (`propertyName`), and the same inside the page's declared `actions:`. Other FILES that read it
 * (a source url building `&name=${state.name}`) are reported by {@link mentionsIn}, not edited — the
 * editor only writes the file it has open.
 */
export interface RenameResult {
    doc: PageDoc
    /** How many places changed (bindings + expressions + triggers). */
    changes: number
}

const BOUND = new Set(['FormField', 'GridColumn', 'GridGroupColumn'])

export function renameBinding(doc: PageDoc, from: string, to: string): RenameResult {
    if (!from || !to || from === to) return { doc, changes: 0 }
    let changes = 0
    const expr = exprPattern(from)
    const rewrite = (s: string) => s.replace(expr, (_m, scope: string) => { changes++; return `${scope}.${to}` })

    const walkValue = (v: unknown): unknown => {
        if (typeof v === 'string') return rewrite(v)
        if (Array.isArray(v)) return v.map(walkValue)
        if (v && typeof v === 'object') return walkNode(v as Record<string, unknown>)
        return v
    }
    const walkNode = (n: Record<string, unknown>): Record<string, unknown> => {
        const out: Record<string, unknown> = {}
        for (const [k, v] of Object.entries(n)) out[k] = walkValue(v)
        if (BOUND.has(String(n.type)) && n.id === from) { out.id = to; changes++ }
        return out
    }

    const layout = walkNode(doc.layout) as PageNode
    const triggers = doc.triggers?.map((t) => {
        const next = { ...t, extra: walkValue(t.extra) as Record<string, unknown> }
        if (t.propertyName === from) { next.propertyName = to; changes++ }
        return next
    })
    const rest = doc.rest ? (walkValue(doc.rest) as Record<string, unknown>) : undefined
    return { doc: { ...doc, layout, triggers, rest }, changes }
}

/** `${…state.<id>…}`-style references to `id`, in `state.`, `row.` or `data.` scope, as whole words. */
function exprPattern(id: string): RegExp {
    const esc = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return new RegExp(`\\b(state|row|data)\\.${esc}(?![\\w$])`, 'g')
}

/** How many references to `id` a file's text carries (to tell the author which other files to update). */
export function mentionsIn(text: string, id: string): number {
    return (text.match(exprPattern(id)) ?? []).length
}

/** The ids bound on a page — what a rename can target. */
export function boundIds(node: PageNode, out = new Set<string>()): Set<string> {
    if (BOUND.has(node.type) && typeof node.id === 'string') out.add(node.id)
    for (const c of node.content ?? []) boundIds(c, out)
    for (const key of presentSlots(node)) for (const c of node[key] as PageNode[]) boundIds(c, out)
    return out
}
