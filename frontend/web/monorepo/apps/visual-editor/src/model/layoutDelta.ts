/**
 * The editor's half of `layoutDelta:` — the TypeScript mirror of Java's
 * `io.mateu.uidl.data.LayoutDelta`.
 *
 * The whole point of the shape: a `layout:` is a **snapshot**, and an explicit layout takes a screen
 * out of the inference regime for good. The moment someone drags one field, that screen stops
 * re-deriving — add a field to the model afterwards and it never appears. A delta records the
 * DECISIONS instead, anchored to stable field ids, so inference keeps running and the decisions are
 * re-applied on top.
 *
 * These functions must agree with the server exactly, or the editor would show one arrangement and
 * the running page another. `applyDelta` and `deltaBetween` are ports of `applyTo` and `between`,
 * assertion for assertion.
 */

/** Per-field tweaks a human made. Every member is optional; absent means "leave as inferred". */
export interface FieldOverride {
    label?: string
    colspan?: number
    section?: string
}

export interface LayoutDelta {
    order: string[]
    hidden: string[]
    overrides: Record<string, FieldOverride>
}

/** A field as inference produced it — what the server's `__contract__` reports. */
export interface InferredField {
    id: string
    label?: string
    dataType?: string
    stereotype?: string
    required?: boolean
    readOnly?: boolean
}

export function emptyDelta(): LayoutDelta {
    return { order: [], hidden: [], overrides: {} }
}

export function isEmptyDelta(delta: LayoutDelta): boolean {
    return delta.order.length === 0
        && delta.hidden.length === 0
        && Object.keys(delta.overrides).length === 0
}

/**
 * The field ids to render, in order, given what inference produced.
 *
 * The rule that makes this a delta and not a snapshot: **fields the delta does not mention keep
 * their inferred position**. So a field added to the model later appears — precisely what a stored
 * snapshot cannot do.
 */
export function applyDelta(inferred: string[], delta: LayoutDelta): string[] {
    const result: string[] = []
    for (const id of delta.order) {
        // A delta entry for a field the model no longer has is stale, not fatal: ignore it.
        if (inferred.includes(id) && !delta.hidden.includes(id) && !result.includes(id)) {
            result.push(id)
        }
    }
    for (const id of inferred) {
        if (!delta.hidden.includes(id) && !result.includes(id)) result.push(id)
    }
    return result
}

/**
 * The delta that turns `inferred` into `desired` — what the editor saves after a human rearranges a
 * screen, instead of the whole tree.
 *
 * It records only what differs: a screen dragged into exactly its inferred order produces an empty
 * delta and therefore keeps re-deriving. Using the editor at all must not, by itself, freeze a
 * screen.
 */
export function deltaBetween(
    inferred: string[],
    desired: string[],
    overrides: Record<string, FieldOverride> = {},
): LayoutDelta {
    const hidden = inferred.filter((id) => !desired.includes(id))
    const visibleInferred = inferred.filter((id) => !hidden.includes(id))
    const sameOrder = visibleInferred.length === desired.length
        && visibleInferred.every((id, i) => id === desired[i])
    return {
        order: sameOrder ? [] : [...desired],
        hidden,
        overrides: prune(overrides),
    }
}

/** Drop overrides that say nothing, so an untouched field never lands in the file. */
function prune(overrides: Record<string, FieldOverride>): Record<string, FieldOverride> {
    const kept: Record<string, FieldOverride> = {}
    for (const [id, o] of Object.entries(overrides)) {
        const trimmed: FieldOverride = {}
        if (o.label !== undefined && o.label !== '') trimmed.label = o.label
        if (o.colspan !== undefined && o.colspan !== 0) trimmed.colspan = o.colspan
        if (o.section !== undefined && o.section !== '') trimmed.section = o.section
        if (Object.keys(trimmed).length) kept[id] = trimmed
    }
    return kept
}

/** Read a `layoutDelta:` node as parsed from YAML, tolerating a partial or malformed one. */
export function readDelta(node: unknown): LayoutDelta {
    if (!node || typeof node !== 'object') return emptyDelta()
    const raw = node as Record<string, unknown>
    const overrides: Record<string, FieldOverride> = {}
    if (raw.overrides && typeof raw.overrides === 'object') {
        for (const [id, value] of Object.entries(raw.overrides as Record<string, unknown>)) {
            if (value && typeof value === 'object') {
                const o = value as Record<string, unknown>
                overrides[id] = {
                    label: typeof o.label === 'string' ? o.label : undefined,
                    colspan: typeof o.colspan === 'number' ? o.colspan : undefined,
                    section: typeof o.section === 'string' ? o.section : undefined,
                }
            }
        }
    }
    return {
        order: Array.isArray(raw.order) ? raw.order.filter((s) => typeof s === 'string') : [],
        hidden: Array.isArray(raw.hidden) ? raw.hidden.filter((s) => typeof s === 'string') : [],
        overrides: prune(overrides),
    }
}

/** The delta as a plain object for YAML, omitting the parts that carry no decision. */
export function writeDelta(delta: LayoutDelta): Record<string, unknown> {
    const out: Record<string, unknown> = {}
    if (delta.order.length) out.order = delta.order
    if (delta.hidden.length) out.hidden = delta.hidden
    if (Object.keys(delta.overrides).length) out.overrides = delta.overrides
    return out
}
