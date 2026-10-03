import { Document, isMap, isScalar, isSeq, parseDocument, Scalar, stringify, type Node, type Pair } from 'yaml'

/**
 * Write `value` back over the YAML text it came from, keeping everything the author wrote that the
 * edit did not touch: comments, key order, flow `{…}` / block style, quoting, folded strings.
 *
 * The editor models a file as plain data and used to re-`stringify` it on every edit — which threw
 * away every comment and every formatting choice in the file, even for a one-label change. On a
 * hand-written spec (the demos explain themselves in comments) that turned a tiny edit into a
 * whole-file rewrite nobody wants to review. Instead, the new value is MERGED into the original
 * document's node tree: unchanged subtrees keep their nodes (and the comments attached to them),
 * changed scalars change in place, and only genuinely new content is created.
 *
 * Falls back to a plain `stringify` when there is no original or it does not parse.
 */
export function writePreserving(original: string | undefined, value: unknown): string {
    if (!original || !original.trim()) return stringify(value)
    const doc = parseDocument(original)
    if (doc.errors.length || doc.contents == null) return stringify(value)
    const track: Track = { structural: false, scalars: [] }
    doc.contents = merge(doc.contents as Node, value, doc, track, false) as typeof doc.contents
    // The common edit — a label, a flag, an id — changes scalars only. Then the original TEXT is
    // patched at those scalars' source ranges, so nothing else in the file can move at all (the
    // serializer would otherwise re-space trailing comments and re-fold long folded strings).
    if (!track.structural) {
        let out = original
        for (const c of [...track.scalars].sort((a, b) => b.start - a.start)) {
            out = out.slice(0, c.start) + c.text + out.slice(c.end)
        }
        return out
    }
    return doc.toString(styleOf(original))
}

type Track = { structural: boolean; scalars: { start: number; end: number; text: string }[] }

/**
 * The author's layout conventions, read off the original text so new/re-emitted nodes follow them:
 * whether a list under a key is indented (`key:\n  - x`) or flush (`key:\n- x`), and whether a flow map
 * is padded (`{ a: 1 }`) or tight (`{a: 1}`). Long strings are never re-folded (`lineWidth: 0`).
 */
function styleOf(text: string) {
    const flush = /^( *)[^\s#-][^\n]*:[ \t]*\n\1- /m.test(text)
    const indented = /^( *)[^\s#-][^\n]*:[ \t]*\n\1 +- /m.test(text)
    const tight = /\{[^ }\n]/.test(text)
    const padded = /\{ [^}\n]/.test(text)
    return {
        lineWidth: 0,
        indentSeq: !(flush && !indented),
        flowCollectionPadding: !(tight && !padded),
    }
}

type Plain = Record<string, unknown>

function isPlainObject(v: unknown): v is Plain {
    return !!v && typeof v === 'object' && !Array.isArray(v)
}

function merge(node: Node | null | undefined, value: unknown, doc: Document, track: Track, inFlow: boolean): Node {
    if (isPlainObject(value) && isMap(node)) {
        const wanted = Object.entries(value).filter(([, v]) => v !== undefined)
        const keys = new Set(wanted.map(([k]) => k))
        const kept = node.items.filter((p) => keys.has(keyOf(p)))
        if (kept.length !== node.items.length) track.structural = true
        node.items = kept
        for (const [k, v] of wanted) {
            const pair = node.items.find((p) => keyOf(p) === k)
            if (pair) pair.value = merge(pair.value as Node, v, doc, track, inFlow || !!node.flow)
            else { node.items.push(doc.createPair(k, v) as Pair); track.structural = true }
        }
        return node
    }
    if (Array.isArray(value) && isSeq(node)) {
        const old = node.items as Node[]
        const oldJson = old.map((n) => toJs(n))
        const used = new Set<number>()
        const flowItems = old.length > 0 && old.every((n) => isMap(n) && n.flow)
        if (value.length !== old.length) track.structural = true
        node.items = value.map((v, i) => {
            // 1. the same value, preferably at the same position — reuse the node untouched
            let j = sameIndexIf(i, old.length, used, (k) => deepEqual(oldJson[k], v))
            if (j < 0) j = oldJson.findIndex((o, k) => !used.has(k) && deepEqual(o, v))
            // 2. the same item (same type + identity), edited — merge into it
            if (j < 0 && isPlainObject(v)) {
                const id = identity(v)
                if (id) {
                    j = sameIndexIf(i, old.length, used, (k) => identity(oldJson[k]) === id)
                    if (j < 0) j = oldJson.findIndex((o, k) => !used.has(k) && identity(o) === id)
                }
            }
            // 3. the same kind of thing at the same position (an anonymous container, edited)
            if (j < 0 && isPlainObject(v) && i < old.length && !used.has(i) && isMap(old[i])
                && (oldJson[i] as Plain)?.type === v.type && identity(oldJson[i]) === identity(v)) j = i
            // 4. a scalar list edited in place
            if (j < 0 && i < old.length && !used.has(i) && isScalar(old[i]) && !isPlainObject(v) && !Array.isArray(v)) j = i
            if (j >= 0) {
                used.add(j)
                if (j !== i) track.structural = true
                return merge(old[j], v, doc, track, inFlow || !!node.flow)
            }
            track.structural = true
            const created = doc.createNode(v) as Node
            if (flowItems && isMap(created)) created.flow = true
            return created
        })
        return node
    }
    if (isScalar(node) && !isPlainObject(value) && !Array.isArray(value)) {
        if (node.value !== value) {
            const text = node.range ? scalarText(value, node, inFlow) : undefined
            if (text === undefined) track.structural = true
            else track.scalars.push({ start: node.range![0], end: node.range![1], text })
            node.value = value
        }
        return node
    }
    if (node && deepEqual(toJs(node), value)) return node
    track.structural = true
    return doc.createNode(value) as Node
}

/**
 * The source text for a changed scalar, in the original's quoting style — or undefined when it
 * cannot be written inline safely (a block scalar, a multi-line value), which falls back to the
 * serializer.
 */
function scalarText(value: unknown, node: Scalar, inFlow: boolean): string | undefined {
    if (node.type === Scalar.BLOCK_FOLDED || node.type === Scalar.BLOCK_LITERAL) return undefined
    if (value === null || value === undefined) return 'null'
    if (typeof value === 'number' || typeof value === 'boolean') return String(value)
    if (typeof value !== 'string' || /[\n\r]/.test(value)) return undefined
    if (node.type === Scalar.QUOTE_SINGLE) return `'${value.replace(/'/g, "''")}'`
    if (node.type === Scalar.QUOTE_DOUBLE) return JSON.stringify(value)
    const unsafe = value === '' || /^[\s'"&*!|>%@`#?:,\[\]{}-]|[\s]$|: | #/.test(value)
        || /^(true|false|yes|no|on|off|null|~|[-+]?(\d|\.\d))/i.test(value)
        || (inFlow && /[,\[\]{}]/.test(value))
    return unsafe ? JSON.stringify(value) : value
}

function sameIndexIf(i: number, len: number, used: Set<number>, ok: (k: number) => boolean): number {
    return i < len && !used.has(i) && ok(i) ? i : -1
}

function keyOf(p: Pair): string {
    const k = p.key as unknown
    return isScalar(k) ? String(k.value) : String(k)
}

function toJs(n: Node): unknown {
    return n && typeof (n as any).toJSON === 'function' ? (n as any).toJSON() : n
}

/** What makes two list items "the same item": its type plus whichever name it carries. */
function identity(v: unknown): string | undefined {
    if (!isPlainObject(v)) return undefined
    const name = v.id ?? v.name ?? v.route ?? v.actionId ?? v.label ?? v.ref
    if (name == null) return undefined
    return `${String(v.type ?? '')}|${String(name)}`
}

function deepEqual(a: unknown, b: unknown): boolean {
    if (a === b) return true
    if (typeof a !== typeof b || a == null || b == null) return false
    if (Array.isArray(a)) return Array.isArray(b) && a.length === b.length && a.every((x, i) => deepEqual(x, b[i]))
    if (typeof a === 'object') {
        if (Array.isArray(b)) return false
        const ka = Object.keys(a as Plain).filter((k) => (a as Plain)[k] !== undefined)
        const kb = Object.keys(b as Plain).filter((k) => (b as Plain)[k] !== undefined)
        return ka.length === kb.length && ka.every((k) => deepEqual((a as Plain)[k], (b as Plain)[k]))
    }
    return false
}
