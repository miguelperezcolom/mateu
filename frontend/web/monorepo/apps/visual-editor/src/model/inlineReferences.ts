import { parse } from 'yaml'
import type { ProjectFile } from './projectIndex'
import { parseComponentCatalogue } from './componentCatalogue'

/**
 * The two references a definition may carry that the browser's expander cannot resolve on its own:
 * `type: Partial` (a file under `partials/`) and `type: ComponentRef` (an entry of `components.yaml`).
 * Inlined from the project's files before Play / the client-side canvas expands the definition — the
 * twin of the server exporter's DefinitionInliner, same rules: a multi-component partial is SPLICED
 * into the list holding it (a single slot gets them stacked in a VerticalLayout), partials compose, a
 * cycle or a missing file is left as it was (the expander then shows its placeholder).
 */
type Node = Record<string, unknown>
const MAX_DEPTH = 20

export interface InlineOptions {
    /**
     * Stamp each inlined root that names no `id` of its own with the REFERENCE node's `id`. The
     * offline canvas stamps every node of the edited document with a `ve-<path>` id and maps a click
     * back through it; inlined content is not in the document, so the reference's id on its roots
     * is what makes a partial one selectable node there (editing happens on the reference). Off for
     * Play / Export, whose output is a page, not a canvas.
     */
    keepReferenceId?: boolean
}

export function inlineReferences(definition: unknown, files: ProjectFile[], options: InlineOptions = {}): unknown {
    const partials = new Map<string, unknown>()
    const components = new Map<string, unknown>()
    for (const f of files ?? []) {
        const path = (f.path ?? '').replace(/^\/+/, '').replace(/^specs\/ui\//, '')
        const m = /^partials\/(.+)\.ya?ml$/.exec(path)
        if (m) {
            try { partials.set(m[1], parse(f.content)) } catch { /* unreadable: left as a reference */ }
            continue
        }
        if (parseComponentCatalogue(f.content ?? '')) {
            const doc = parse(f.content) as { components?: { name?: string, component?: unknown }[] }
            for (const e of doc.components ?? []) if (e?.name && e.component) components.set(e.name, e.component)
        }
    }
    if (!partials.size && !components.size) return definition

    const stamped = (node: Node, roots: unknown[] | undefined): unknown[] | undefined => {
        if (!roots || !options.keepReferenceId || typeof node.id !== 'string' || !node.id) return roots
        return roots.map((r) => (r && typeof r === 'object' && !Array.isArray(r) && (r as Node).id === undefined ? { ...(r as Node), id: node.id } : r))
    }
    const expand = (node: unknown, chain: string[]): unknown[] | undefined => {
        if (!node || typeof node !== 'object' || Array.isArray(node)) return undefined
        const { type, ref } = node as Node
        if (typeof ref !== 'string' || !ref) return undefined
        if (type === 'ComponentRef') {
            return stamped(node as Node, components.has(ref) ? [rewrite(components.get(ref), chain)] : undefined)
        }
        if (type !== 'Partial' || chain.includes(ref) || chain.length >= MAX_DEPTH) return undefined
        const root = partials.get(ref) as Node | undefined
        if (!root || typeof root !== 'object') return undefined
        const next = [...chain, ref]
        if (Array.isArray(root.content) && root.type === undefined) {
            return stamped(node as Node, root.content.flatMap((child) => expand(child, next) ?? [rewrite(child, next)]))
        }
        return stamped(node as Node, [rewrite(root, next)])
    }
    const asSlot = (items: unknown[]): unknown => (items.length === 1 ? items[0] : { type: 'VerticalLayout', content: items })
    const rewrite = (node: unknown, chain: string[]): unknown => {
        if (Array.isArray(node)) return node.flatMap((el) => expand(el, chain) ?? [rewrite(el, chain)])
        if (!node || typeof node !== 'object') return node
        const own = expand(node, chain)
        if (own) return asSlot(own)
        const out: Node = {}
        for (const [k, v] of Object.entries(node as Node)) {
            const slot = !Array.isArray(v) ? expand(v, chain) : undefined
            out[k] = slot ? asSlot(slot) : rewrite(v, chain)
        }
        return out
    }
    return rewrite(definition, [])
}
