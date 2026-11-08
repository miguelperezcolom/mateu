import type OrgNode from '@mateu/shared/apiClients/dtos/componentmetadata/OrgNode'

/**
 * The pure part of the org chart's `focus` presentation (tested without a DOM): which node a
 * focused chart opens on, the chain of ancestors above the node in focus, its children below, and
 * how a long chain collapses. Nodes are tracked by identity (ids are optional on the wire and not
 * guaranteed unique), ids only matter for the initial `focus`.
 */

/** `display` on the wire: "focus" picks the focused presentation; anything else (null) is the tree. */
export const isFocusDisplay = (display?: string | null): boolean =>
    (display ?? '').trim().toLowerCase() === 'focus'

/** The first node (pre-order) whose id equals `id` as a string, or undefined. */
export const findNodeById = (root: OrgNode | undefined, id?: string | number | null): OrgNode | undefined => {
    if (!root || id === undefined || id === null) return undefined
    const wanted = String(id)
    const stack: OrgNode[] = [root]
    while (stack.length) {
        const node = stack.pop()!
        if (node.id !== undefined && node.id !== null && String(node.id) === wanted) return node
        const children = node.children ?? []
        for (let i = children.length - 1; i >= 0; i--) stack.push(children[i])
    }
    return undefined
}

/** The node a focused chart opens on: the one whose id is `focus`, else the root. */
export const initialFocus = (root: OrgNode | undefined, focus?: string | null): OrgNode | undefined =>
    findNodeById(root, focus) ?? root

/** root..target (both included), by identity; undefined when target is not in the tree. */
export const pathTo = (root: OrgNode | undefined, target: OrgNode | undefined): OrgNode[] | undefined => {
    if (!root || !target) return undefined
    if (root === target) return [root]
    for (const child of root.children ?? []) {
        const rest = pathTo(child, target)
        if (rest) return [root, ...rest]
    }
    return undefined
}

export interface FocusView {
    /** Root first, the direct parent last; empty when the node in focus is the root. */
    ancestors: OrgNode[]
    node: OrgNode
    children: OrgNode[]
}

/** What the focused chart shows for `node` (falls back to the root when node is not in the tree). */
export const focusView = (root: OrgNode | undefined, node: OrgNode | undefined): FocusView | undefined => {
    if (!root) return undefined
    const path = pathTo(root, node) ?? [root]
    const focused = path[path.length - 1]
    return { ancestors: path.slice(0, -1), node: focused, children: focused.children ?? [] }
}

/** Longer chains than this collapse behind a "N more levels" toggle. */
export const MAX_VISIBLE_ANCESTORS = 2

/**
 * The ancestors drawn: all of them when expanded or when the chain is short, else only the direct
 * parent, with the rest counted in `hidden`.
 */
export const visibleAncestors = (ancestors: OrgNode[], expanded: boolean): { hidden: number, visible: OrgNode[] } => {
    if (expanded || ancestors.length <= MAX_VISIBLE_ANCESTORS) return { hidden: 0, visible: ancestors }
    return { hidden: ancestors.length - 1, visible: ancestors.slice(-1) }
}

/**
 * The connector lines of a node in the TREE display, for the child at `index` of `count`
 * siblings: the line up to the sibling bar, and the bar's halves — left of a child that has a
 * sibling before it, right of one with a sibling after it — so the bar runs exactly from the first
 * child's centre to the last's. A root has none. (Pseudo-element rules used to draw it: no line ran
 * down from a parent and the bar covered only the last siblings.)
 */
export const treeConnectors = (index: number, count: number, isRoot = false): { up: boolean, left: boolean, right: boolean } =>
    isRoot ? { up: false, left: false, right: false } : { up: true, left: index > 0, right: index < count - 1 }

/** Initials for a node without an avatar: first letters of its first two words. */
export const initialsOf = (title?: string): string =>
    (title ?? '').trim().split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join('')
