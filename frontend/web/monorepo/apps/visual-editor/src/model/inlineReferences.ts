import { parse } from 'yaml'
import type { ProjectFile } from './projectIndex'
import { parseComponentCatalogue } from './componentCatalogue'

/**
 * The two references a definition may carry that the browser's expander cannot resolve on its own:
 * `type: Partial` (a file under `partials/`) and `type: ComponentRef` (an entry of `components.yaml`).
 * Inlined from the project's files before Play / the client-side canvas expands the definition — the
 * twin of the server exporter's DefinitionInliner, same rules: a multi-component partial is SPLICED
 * into the list holding it (a single slot gets them stacked in a VerticalLayout), partials compose, a
 * cycle (direct, indirect, or mixed partial ↔ business component) or a missing file is left as it
 * was (the expander then shows its placeholder). A partial is named by its short name or by an explicit
 * `.yaml`/`.yml` path, like PartialRegistry.java.
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

/** A path as the files and the refs spell it, comparable: no leading slash, no `specs/ui/` prefix. */
const normalizePath = (p: string): string => (p ?? '').replace(/^\/+/, '').replace(/^specs\/ui\//, '')
const isYamlPath = (p: string): boolean => /\.ya?ml$/i.test(p)

/** Whether the tree holds a `type: Partial` named by an explicit path (one that may live outside `partials/`). */
const namesAPartialByPath = (node: unknown): boolean => {
    if (Array.isArray(node)) return node.some(namesAPartialByPath)
    if (!node || typeof node !== 'object') return false
    const { type, ref } = node as Node
    if (type === 'Partial' && typeof ref === 'string' && isYamlPath(ref)) return true
    return Object.values(node as Node).some(namesAPartialByPath)
}

export function inlineReferences(definition: unknown, files: ProjectFile[], options: InlineOptions = {}): unknown {
    // Every YAML file by its path relative to specs/ui: a partial may be named by its short name
    // (`partials/<ref>.yaml`) or — as PartialRegistry.java honours — by an explicit `.yaml`/`.yml`
    // path, the classpath one (`specs/ui/partials/x.yaml`) or the specs-relative one, even outside
    // `partials/`. Parsed on demand, once.
    const yamlFiles = new Map<string, string>()
    const parsed = new Map<string, unknown>()
    let hasPartials = false
    const components = new Map<string, unknown>()
    for (const f of files ?? []) {
        const path = normalizePath(f.path ?? '')
        if (!isYamlPath(path)) continue
        yamlFiles.set(path, f.content ?? '')
        if (/^partials\/.+\.ya?ml$/i.test(path)) {
            hasPartials = true
            continue
        }
        if (parseComponentCatalogue(f.content ?? '')) {
            const doc = parse(f.content) as { components?: { name?: string, component?: unknown }[] }
            for (const e of doc.components ?? []) if (e?.name && e.component) components.set(e.name, e.component)
        }
    }
    const partialPathOf = (ref: string): string | undefined => {
        const candidates = isYamlPath(ref) ? [normalizePath(ref)] : [`partials/${ref}.yaml`, `partials/${ref}.yml`]
        return candidates.find((c) => yamlFiles.has(c))
    }
    const partial = (path: string): unknown => {
        if (!parsed.has(path)) {
            let root: unknown
            try { root = parse(yamlFiles.get(path) ?? '') } catch { root = undefined /* unreadable: left as a reference */ }
            parsed.set(path, root)
        }
        return parsed.get(path)
    }
    if (!hasPartials && !components.size && !namesAPartialByPath(definition)) return definition

    const stamped = (node: Node, roots: unknown[] | undefined): unknown[] | undefined => {
        if (!roots || !options.keepReferenceId || typeof node.id !== 'string' || !node.id) return roots
        return roots.map((r) => (r && typeof r === 'object' && !Array.isArray(r) && (r as Node).id === undefined ? { ...(r as Node), id: node.id } : r))
    }
    // `chain` holds every reference being expanded on the way down — partials (by file path, so two
    // spellings of one file are one link) AND business components — so a direct, indirect or mixed
    // cycle is broken where it closes: that reference is left as it was (the expander shows its
    // placeholder) and the rest of the definition still inlines.
    const expand = (node: unknown, chain: string[]): unknown[] | undefined => {
        if (!node || typeof node !== 'object' || Array.isArray(node)) return undefined
        const { type, ref } = node as Node
        if (typeof ref !== 'string' || !ref) return undefined
        if (chain.length >= MAX_DEPTH) return undefined
        if (type === 'ComponentRef') {
            const key = `component:${ref}`
            if (chain.includes(key) || !components.has(ref)) return undefined
            return stamped(node as Node, [rewrite(components.get(ref), [...chain, key])])
        }
        if (type !== 'Partial') return undefined
        const path = partialPathOf(ref)
        if (!path) return undefined
        const key = `partial:${path}`
        if (chain.includes(key)) return undefined
        const root = partial(path) as Node | undefined
        if (!root || typeof root !== 'object') return undefined
        const next = [...chain, key]
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
