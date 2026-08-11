import { parse, stringify } from 'yaml'

/**
 * A single node of a Mateu page layout: a `type` plus arbitrary scalar props and an
 * optional `content` list of children (the wire convention — see the YAML page specs).
 */
export interface PageNode {
    type: string
    content?: PageNode[]
    // scalar props: label, text, actionId, id, dataType, stereotype, spacing, padding…
    [key: string]: unknown
}

/**
 * A parsed page: the `layout` tree plus the optional `modelView` FQN (envelope form). `bare`
 * records whether the source file was a bare component tree (legacy, no envelope) so we can
 * serialize it back in the same shape.
 */
export interface PageDoc {
    modelView?: string
    layout: PageNode
    bare: boolean
}

/** A path is a list of child indices into successive `content` arrays. `[]` = the root. */
export type NodePath = number[]

const RESERVED = new Set(['type', 'content'])

/** Parse YAML page text into a PageDoc (envelope-aware, like YamlUidlLoader). */
export function parsePage(yaml: string): PageDoc {
    let root: unknown
    try { root = parse(yaml) } catch { root = null }
    if (root && typeof root === 'object' && 'layout' in (root as object)) {
        return {
            modelView: (root as any).modelView ?? undefined,
            layout: normalize((root as any).layout),
            bare: false,
        }
    }
    // An empty/blank/whitespace file is an EMPTY editable page (a droppable VerticalLayout), not a
    // text node — sending empty YAML to __preview__ makes the backend answer "Invalid or empty YAML".
    if (root == null || (typeof root === 'object' && Object.keys(root as object).length === 0)) {
        return { layout: { type: 'VerticalLayout', content: [] }, bare: true }
    }
    return { layout: normalize(root), bare: true }
}

/** Serialize a PageDoc back to YAML in the shape it was parsed from. */
export function serializePage(doc: PageDoc): string {
    if (doc.bare && !doc.modelView) {
        return stringify(doc.layout)
    }
    const envelope: Record<string, unknown> = {}
    if (doc.modelView) envelope.modelView = doc.modelView
    envelope.layout = doc.layout
    return stringify(envelope)
}

function normalize(node: any): PageNode {
    if (!node || typeof node !== 'object') return { type: 'Text', text: String(node ?? '') }
    if (!node.type) node.type = 'VerticalLayout'
    return node as PageNode
}

/** The node at `path`, or undefined if the path does not resolve. */
export function nodeAt(doc: PageDoc, path: NodePath): PageNode | undefined {
    let node: PageNode | undefined = doc.layout
    for (const i of path) {
        node = node?.content?.[i]
        if (!node) return undefined
    }
    return node
}

/** The scalar (non-structural) property keys of a node, for the properties panel. */
export function scalarProps(node: PageNode): string[] {
    return Object.keys(node).filter((k) => !RESERVED.has(k))
}

/** Whether a node type is a container that accepts children under `content`. */
export function isContainer(node: PageNode): boolean {
    return node.type.endsWith('Layout') || node.type === 'Card' || Array.isArray(node.content)
}

// --- structural edits (return the mutated doc; the model is small, in-place is fine) ---

export function updateProp(node: PageNode, key: string, value: unknown): void {
    if (value === undefined || value === '') delete node[key]
    else node[key] = value
}

export function insertChild(parent: PageNode, index: number, child: PageNode): void {
    if (!parent.content) parent.content = []
    parent.content.splice(Math.max(0, Math.min(index, parent.content.length)), 0, child)
}

/** Insert `node` as a sibling right after `path` (or into the root when `path` is `[]`). */
export function insertAfter(doc: PageDoc, path: NodePath, node: PageNode): NodePath {
    if (path.length === 0) {
        insertChild(doc.layout, doc.layout.content?.length ?? 0, node)
        return [(doc.layout.content!.length - 1)]
    }
    const parentPath = path.slice(0, -1)
    const parent = nodeAt(doc, parentPath) ?? doc.layout
    const index = path[path.length - 1] + 1
    insertChild(parent, index, node)
    return [...parentPath, index]
}

export function removeAt(doc: PageDoc, path: NodePath): void {
    if (path.length === 0) return
    const parent = nodeAt(doc, path.slice(0, -1))
    parent?.content?.splice(path[path.length - 1], 1)
}

/** True when `prefix` is `path` or an ancestor of it (used to forbid dropping a node into itself). */
export function isPrefix(prefix: NodePath, path: NodePath): boolean {
    return prefix.length <= path.length && prefix.every((v, i) => path[i] === v)
}

/** Insert `node` as child `index` of the node at `parentPath` (`[]` = the root layout). */
export function insertAt(doc: PageDoc, parentPath: NodePath, index: number, node: PageNode): NodePath {
    const parent = parentPath.length ? nodeAt(doc, parentPath) : doc.layout
    if (!parent) return parentPath
    insertChild(parent, index, node)
    return [...parentPath, index]
}

/**
 * Move the node at `from` to child `index` of `toParentPath`. Guards against dropping a node into
 * itself/its own subtree. Removing the source shifts the siblings after it down by one, so the
 * target path is adjusted for that shift — both a step of `toParentPath` that passes through the
 * source's parent AFTER it, and the final `index` when they share a parent. Returns the node's new
 * path, or null when the move is illegal.
 */
export function moveNode(doc: PageDoc, from: NodePath, toParentPath: NodePath, index: number): NodePath | null {
    if (from.length === 0) return null
    if (isPrefix(from, toParentPath)) return null // can't drop into self/descendant
    const node = nodeAt(doc, from)
    if (!node) return null
    const fromParent = from.slice(0, -1)
    const fromIndex = from[from.length - 1]
    removeAt(doc, from)
    // The source's removal shifts everything after it in fromParent down by one. If toParentPath
    // descends through fromParent at a later position, that step is now off by one.
    const toParent = [...toParentPath]
    if (isPrefix(fromParent, toParent) && toParent.length > fromParent.length && toParent[fromParent.length] > fromIndex) {
        toParent[fromParent.length] -= 1
    }
    const sameParent = fromParent.length === toParent.length && fromParent.every((v, i) => toParent[i] === v)
    let target = index
    if (sameParent && fromIndex < target) target -= 1
    return insertAt(doc, toParent, target, node)
}

/** Move the child at `path` by `delta` (+1 down / -1 up) within its parent. */
export function reorder(doc: PageDoc, path: NodePath, delta: number): NodePath {
    if (path.length === 0) return path
    const parent = nodeAt(doc, path.slice(0, -1))
    const list = parent?.content
    if (!list) return path
    const from = path[path.length - 1]
    const to = from + delta
    if (to < 0 || to >= list.length) return path
    const [item] = list.splice(from, 1)
    list.splice(to, 0, item)
    return [...path.slice(0, -1), to]
}

// --- DOM tagging: encode a path into a synthetic wire id and back ---

/** The synthetic `id` we stamp on each node before preview so the rendered DOM is path-addressable. */
export function pathToId(path: NodePath): string {
    return 've-' + (path.length ? path.join('-') : 'root')
}

export function idToPath(id: string | null | undefined): NodePath | null {
    if (!id || !id.startsWith('ve-')) return null
    const body = id.slice(3)
    if (body === 'root') return []
    const parts = body.split('-')
    const path = parts.map((p) => Number(p))
    return path.every((n) => Number.isInteger(n)) ? path : null
}

/**
 * A deep clone of the layout with a synthetic path-based `id` stamped on every node, ready to
 * send to `__preview__`. The renderer stamps `id="${component.id}"` on each DOM element, so a
 * click can be mapped straight back to a node path — no structural alignment guesswork.
 */
export function decorateForPreview(doc: PageDoc): string {
    const clone = structuredClone(doc.layout)
    stamp(clone, [])
    return stringify(clone)
}

function stamp(node: PageNode, path: NodePath): void {
    node.id = pathToId(path)
    if (Array.isArray(node.content)) {
        // An empty `content: []` breaks the backend's polymorphic Component deserializer
        // ("END_ARRAY, expected … type id") — notably a Card whose content is a single Component,
        // not a list. Omit empty content so an empty container is valid and renders blank.
        if (node.content.length === 0) delete node.content
        else node.content.forEach((child, i) => stamp(child, [...path, i]))
    }
}
