/**
 * The pure half of canvas ⇄ Layers selection: which definition node a click landed on, which Layers
 * rows have to open to show a node, and what survives a re-render. No DOM types beyond the few
 * attributes read, so it runs under plain node in the tests.
 */
import { NodePath, PageDoc, idToPath, nodeAt, pathToId, splitSeg } from '../model/pageModel'

/** What the mapping reads of an element: its attributes. */
export interface Tagged {
    getAttribute?(name: string): string | null
    id?: string
}

/**
 * The editor node id an element carries: `data-node-id` (stamped by the canvas's renderers and the
 * Redwood frame on every painted component) or, failing that, a `ve-…` DOM id (what renderers that
 * write `id="${component.id}"` leave).
 */
export function nodeIdOf(el: unknown): string | null {
    if (!el || typeof el !== 'object') return null
    const t = el as Tagged
    const stamped = typeof t.getAttribute === 'function' ? t.getAttribute('data-node-id') : null
    if (stamped && idToPath(stamped)) return stamped
    const id = typeof t.id === 'string' ? t.id : ''
    return id.startsWith('ve-') && idToPath(id) ? id : null
}

/**
 * The INNERMOST definition node under a click: the first element of the composed event path (target
 * first, so it walks out through shadow roots and slots) that maps to a node.
 */
export function nodeIdOfEventPath(path: readonly unknown[]): string | null {
    for (const t of path) {
        const id = nodeIdOf(t)
        if (id) return id
    }
    return null
}

/** The node path under a click, or null when the click hit nothing that maps to a node. */
export function nodePathOfEventPath(path: readonly unknown[]): NodePath | null {
    return idToPath(nodeIdOfEventPath(path))
}

/**
 * The Layers rows (their collapse keys, as editor-outline names them) that must be OPEN for the row
 * of `path` to be visible: every ancestor node, plus the slot group (`<parent>:<key>`) each slot step
 * passes through.
 */
export function ancestorRowKeys(path: NodePath): string[] {
    const keys: string[] = []
    for (let i = 0; i < path.length; i++) {
        const parent = path.slice(0, i)
        keys.push(pathToId(parent))
        const seg = path[i]
        if (typeof seg === 'string') keys.push(pathToId(parent) + ':' + splitSeg(seg).key)
    }
    return keys
}

/** `collapsed` minus whatever hides `path` — the set to show after selecting it. */
export function expandedFor(collapsed: ReadonlySet<string>, path: NodePath | null): Set<string> {
    const next = new Set(collapsed)
    if (path) for (const k of ancestorRowKeys(path)) next.delete(k)
    return next
}

/** The selection to keep after the document changed: the same node if it still exists, else none. */
export function surviving(doc: PageDoc | undefined, path: NodePath | null): NodePath | null {
    if (!doc || !path) return null
    return nodeAt(doc, path) ? path : null
}

/** Esc: the parent of the selection; Esc on the root clears the selection. */
export function parentSelection(path: NodePath | null): NodePath | null {
    return path && path.length ? path.slice(0, -1) : null
}
