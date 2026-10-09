import { PageDoc, PageNode, NodePath, presentSlots, slotSeg } from './pageModel'

/**
 * Tidy: rule-based clean-ups of a page's structure — no model behind it (m3e-canvas's `lib/tidy.ts`
 * has the same stance: fixed rules, predictable output). Mateu screens are trees that lay themselves
 * out, so there is nothing to align or snap; what drifts while you build one is the STRUCTURE: fields
 * dropped loose instead of in a form layout, buttons stacked one per line, a wrapper left around a
 * single child after a move, an empty layout nobody filled.
 *
 * Each rule is conservative: it only touches a PLAIN layout (one with nothing but its children —
 * no spacing, padding, style, id…), because a layout that says something about how it looks is the
 * author's decision, not litter. The page's root is never removed. Findings are listed first; the
 * author picks which rules to apply, and each application is one undoable edit.
 */
export type TidyRule = 'groupFields' | 'buttonRow' | 'unwrapSingle' | 'flattenSame' | 'dropEmpty' | 'labelFields' | 'duplicateIds'

export const TIDY_RULES: { id: TidyRule; label: string; fixable: boolean }[] = [
    { id: 'groupFields', label: 'Put loose fields in a form layout', fixable: true },
    { id: 'buttonRow', label: 'Put stacked buttons in a row', fixable: true },
    { id: 'unwrapSingle', label: 'Remove wrappers around a single component', fixable: true },
    { id: 'flattenSame', label: 'Merge a layout into its same-direction parent', fixable: true },
    { id: 'dropEmpty', label: 'Remove empty layouts', fixable: true },
    { id: 'labelFields', label: 'Label fields that have none, from their id', fixable: true },
    { id: 'duplicateIds', label: 'Fields sharing an id (they bind to the same value)', fixable: false },
]

export interface TidyFinding {
    rule: TidyRule
    /** The component the finding is about (for a run of siblings, the first one). */
    path: NodePath
    message: string
}

const LAYOUTS = new Set(['VerticalLayout', 'HorizontalLayout'])
/** Where loose fields already are where they belong. */
const FIELD_HOMES = new Set(['FormLayout', 'FormRow', 'FormItem'])
/** Where several buttons side by side already are. */
const BUTTON_HOMES = new Set(['HorizontalLayout', 'ButtonGroup'])

/** A layout that carries nothing but its children — removing or merging it changes no declared look. */
function isPlainLayout(n: PageNode): boolean {
    return LAYOUTS.has(n.type) && Object.keys(n).every((k) => k === 'type' || k === 'content')
}

function kids(n: PageNode): PageNode[] {
    return Array.isArray(n.content) ? n.content : []
}

/** Every finding on the page, in reading order. */
export function tidyFindings(doc: PageDoc | undefined): TidyFinding[] {
    if (!doc) return []
    const out: TidyFinding[] = []
    const visit = (node: PageNode, path: NodePath) => {
        out.push(...contentFindings(node, path))
        if (node.type === 'FormField' && typeof node.id === 'string' && node.id && !node.label) {
            out.push({ rule: 'labelFields', path, message: `Field “${node.id}” has no label — it would read “${humanize(node.id)}”.` })
        }
        for (const key of presentSlots(node)) (node[key] as PageNode[]).forEach((c, i) => visit(c, [...path, slotSeg(key, i)]))
        kids(node).forEach((c, i) => visit(c, [...path, i]))
    }
    visit(doc.layout, [])
    out.push(...duplicateIds(doc.layout))
    return out
}

/** The findings about one node's own children (runs of siblings, wrappers among them). */
function contentFindings(parent: PageNode, path: NodePath): TidyFinding[] {
    const out: TidyFinding[] = []
    const items = kids(parent)
    for (const run of runsOf(items, 'FormField')) {
        if (!FIELD_HOMES.has(parent.type)) out.push({ rule: 'groupFields', path: [...path, run.start], message: `${run.length} fields sit loose in a ${parent.type}.` })
    }
    for (const run of runsOf(items, 'Button')) {
        if (!BUTTON_HOMES.has(parent.type)) out.push({ rule: 'buttonRow', path: [...path, run.start], message: `${run.length} buttons are stacked one per line.` })
    }
    items.forEach((c, i) => {
        if (!isPlainLayout(c)) return
        const n = kids(c).length
        if (n === 0) out.push({ rule: 'dropEmpty', path: [...path, i], message: `An empty ${c.type}.` })
        else if (n === 1) out.push({ rule: 'unwrapSingle', path: [...path, i], message: `A ${c.type} around a single ${kids(c)[0].type}.` })
        else if (c.type === parent.type) out.push({ rule: 'flattenSame', path: [...path, i], message: `A ${c.type} inside a ${parent.type} adds nothing.` })
    })
    return out
}

/** Runs of 2+ consecutive children of one type. */
function runsOf(items: PageNode[], type: string): { start: number; length: number }[] {
    const out: { start: number; length: number }[] = []
    let i = 0
    while (i < items.length) {
        if (items[i]?.type !== type) { i++; continue }
        let j = i
        while (j < items.length && items[j]?.type === type) j++
        if (j - i >= 2) out.push({ start: i, length: j - i })
        i = j
    }
    return out
}

function duplicateIds(root: PageNode): TidyFinding[] {
    const seen = new Map<string, NodePath[]>()
    const visit = (node: PageNode, path: NodePath) => {
        if (node.type === 'FormField' && typeof node.id === 'string' && node.id) seen.set(node.id, [...(seen.get(node.id) ?? []), path])
        kids(node).forEach((c, i) => visit(c, [...path, i]))
    }
    visit(root, [])
    return [...seen].filter(([, paths]) => paths.length > 1)
        .map(([id, paths]) => ({ rule: 'duplicateIds' as const, path: paths[1], message: `${paths.length} fields share the id “${id}”: they edit the same value.` }))
}

/**
 * The page with the chosen rules applied, repeatedly, until nothing more changes (unwrapping one
 * wrapper can leave its parent with a single child, which is then unwrapped too). Pure: a new doc.
 */
export function applyTidy(doc: PageDoc, rules: TidyRule[]): PageDoc {
    const on = new Set(rules)
    const layout = structuredClone(doc.layout) as PageNode
    for (let pass = 0; pass < 20; pass++) {
        if (!tidyNode(layout, on)) break
    }
    return { ...doc, layout }
}

/** One pass over the tree; true when it changed something. */
function tidyNode(node: PageNode, on: Set<TidyRule>): boolean {
    let changed = false
    if (on.has('labelFields') && node.type === 'FormField' && typeof node.id === 'string' && node.id && !node.label) {
        node.label = humanize(node.id)
        changed = true
    }
    for (const key of presentSlots(node)) for (const c of node[key] as PageNode[]) changed = tidyNode(c, on) || changed
    if (Array.isArray(node.content)) {
        const before = JSON.stringify(node.content)
        node.content = tidyContent(node, node.content, on)
        changed = changed || JSON.stringify(node.content) !== before
        for (const c of node.content) changed = tidyNode(c, on) || changed
    }
    return changed
}

function tidyContent(parent: PageNode, items: PageNode[], on: Set<TidyRule>): PageNode[] {
    let out: PageNode[] = []
    for (const c of items) {
        if (!isPlainLayout(c)) { out.push(c); continue }
        const n = kids(c).length
        if (n === 0 && on.has('dropEmpty')) continue
        if (n === 1 && on.has('unwrapSingle')) { out.push(kids(c)[0]); continue }
        if (n > 1 && c.type === parent.type && on.has('flattenSame')) { out.push(...kids(c)); continue }
        out.push(c)
    }
    if (on.has('groupFields') && !FIELD_HOMES.has(parent.type)) out = wrapRuns(out, 'FormField', 'FormLayout')
    if (on.has('buttonRow') && !BUTTON_HOMES.has(parent.type)) out = wrapRuns(out, 'Button', 'HorizontalLayout')
    return out
}

function wrapRuns(items: PageNode[], type: string, wrapper: string): PageNode[] {
    const runs = runsOf(items, type)
    if (!runs.length) return items
    const out: PageNode[] = []
    let i = 0
    for (const r of runs) {
        out.push(...items.slice(i, r.start))
        out.push({ type: wrapper, content: items.slice(r.start, r.start + r.length) })
        i = r.start + r.length
    }
    out.push(...items.slice(i))
    return out
}

/** `birthYear` / `birth_year` / `birth-year` → `Birth year`. */
export function humanize(id: string): string {
    const words = id
        .replace(/([a-z\d])([A-Z])/g, '$1 $2')
        .replace(/[_\-.]+/g, ' ')
        .trim()
        .toLowerCase()
    return words.charAt(0).toUpperCase() + words.slice(1)
}
