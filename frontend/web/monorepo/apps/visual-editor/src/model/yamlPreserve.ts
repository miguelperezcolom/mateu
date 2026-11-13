import { Document, isAlias, isMap, isScalar, isSeq, parseDocument, Scalar, stringify, type Node, type Pair } from 'yaml'
import { parseSpec } from './specYaml'

/**
 * Thrown when the file being written over does not parse (invalid YAML, or a recursive alias). The
 * editor cannot know what such a file means, so it must never "save" by replacing it with its own
 * idea of the content — that turned one mis-indented line into a file holding only the last edit.
 */
export class UnparseableYamlError extends Error {
    constructor(reason: string) {
        super(reason)
        this.name = 'UnparseableYamlError'
    }
}

/** What {@link writePreservingReport} wrote, and whether it had to give up on the author's text. */
export interface PreservedWrite {
    text: string
    /**
     * True when the edit could not be merged into the original text and the file was written from
     * the data alone: comments, anchors/aliases and merge keys are not kept. The caller must SAY so.
     */
    rewritten: boolean
}

/**
 * Write `value` back over the YAML text it came from, keeping everything the author wrote that the
 * edit did not touch: comments, key order, flow `{…}` / block style, quoting, folded strings,
 * anchors/aliases (`&x` / `*x`) and merge keys (`<<: *base`).
 *
 * The editor models a file as plain data and used to re-`stringify` it on every edit — which threw
 * away every comment and every formatting choice in the file, even for a one-label change. On a
 * hand-written spec (the demos explain themselves in comments) that turned a tiny edit into a
 * whole-file rewrite nobody wants to review. Instead, the new value is MERGED into the original
 * document's node tree: unchanged subtrees keep their nodes (and the comments attached to them),
 * changed scalars change in place, and only genuinely new content is created.
 *
 * Every result is READ BACK and compared with `value` before it is returned (a plain scalar such as
 * `Name:` or `.inf` would otherwise patch into text that does not parse, or parses as other data);
 * when neither the text patch nor the node tree reproduces the data, the file is written from the
 * data and the result says so ({@link PreservedWrite.rewritten}).
 *
 * Throws {@link UnparseableYamlError} when the original is not blank and does not parse.
 */
export function writePreserving(original: string | undefined, value: unknown): string {
    return writePreservingReport(original, value).text
}

/** {@link writePreserving}, telling the caller whether the author's text could be kept. */
export function writePreservingReport(original: string | undefined, value: unknown): PreservedWrite {
    if (!original || !original.trim()) return { text: stringify(value), rewritten: false }
    try { parseSpec(original) } catch (e) {
        throw new UnparseableYamlError(e instanceof Error ? e.message : String(e))
    }
    // merge keys applied, as everywhere the editor reads a spec (parseSpec), so the node tree's data
    // and `value` are the same kind of thing
    const doc = parseDocument(original, { merge: true })
    if (doc.errors.length) throw new UnparseableYamlError(doc.errors[0].message)
    if (doc.contents == null) return { text: stringify(value), rewritten: false }
    const track: Track = { structural: false, scalars: [] }
    try {
        doc.contents = merge(doc.contents as Node, value, doc, track, false) as typeof doc.contents
    } catch {
        return { text: stringify(value), rewritten: true }
    }
    // The common edit — a label, a flag, an id — changes scalars only. Then the original TEXT is
    // patched at those scalars' source ranges, so nothing else in the file can move at all (the
    // serializer would otherwise re-space trailing comments and re-fold long folded strings).
    if (!track.structural) {
        let out = original
        for (const c of [...track.scalars].sort((a, b) => b.start - a.start)) {
            out = out.slice(0, c.start) + c.text + out.slice(c.end)
        }
        if (reads(out, value)) return { text: out, rewritten: false }
    }
    let out: string | undefined
    try { out = doc.toString(styleOf(original)) } catch { out = undefined }
    if (out !== undefined && reads(out, value)) return { text: out, rewritten: false }
    return { text: stringify(value), rewritten: true }
}

/** Whether `text` parses (as the editor reads a spec) to exactly `value`. */
function reads(text: string, value: unknown): boolean {
    try { return deepEqual(parseSpec(text), value) } catch { return false }
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
    if (isAlias(node)) {
        // `*x` where the data is still what `&x` holds: keep the reference. A use that was edited no
        // longer means the anchor (the editor unshares aliases, so editing one use edits that use
        // only): it becomes its own copy, and the anchor and its other uses stay as they were.
        if (deepEqual(toJs(node, doc), value)) return node
        track.structural = true
        return doc.createNode(value) as Node
    }
    if (isPlainObject(value) && isMap(node)) {
        const wanted = Object.entries(value).filter(([, v]) => v !== undefined)
        const keys = new Set(wanted.map(([k]) => k))
        // `<<: *base` — the data has the merge applied, so the inherited keys show up as the item's
        // own. They are left to the merge while they still hold what it gives them; an inherited key
        // the data overrides is written on the item (its own key wins, as YAML 1.1 says); one the
        // data REMOVED cannot be said next to the merge, which then goes (flattened, this item only).
        const mergePairs = node.items.filter(isMergePair)
        const own = new Set(node.items.filter((p) => !isMergePair(p)).map(keyOf))
        const inherited = inheritedKeys(mergePairs, doc)
        const keepMerges = mergePairs.length > 0
            && Object.keys(inherited).every((k) => own.has(k) || (value as Plain)[k] !== undefined)
        const fromMerge = (k: string, v: unknown) =>
            keepMerges && !own.has(k) && k in inherited && deepEqual(inherited[k], v)
        const kept = node.items.filter((p) => (isMergePair(p) ? keepMerges : keys.has(keyOf(p))))
        if (kept.length !== node.items.length) track.structural = true
        node.items = kept
        for (const [k, v] of wanted) {
            if (fromMerge(k, v)) continue
            const pair = node.items.find((p) => !isMergePair(p) && keyOf(p) === k)
            if (pair) pair.value = merge(pair.value as Node, v, doc, track, inFlow || !!node.flow)
            else { node.items.push(doc.createPair(k, v) as Pair); track.structural = true }
        }
        return node
    }
    if (Array.isArray(value) && isSeq(node)) {
        const old = node.items as Node[]
        const oldJson = old.map((n) => toJs(n, doc))
        const used = new Set<number>()
        const newIds = new Set<string | undefined>(value.map(identity).filter((id) => id !== undefined))
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
            // 3. the same kind of thing at the same position, edited: an anonymous container, or an item
            //    whose name itself changed (a relabelled button) — when the old item's name is nowhere
            //    in the new list, it did not move elsewhere
            if (j < 0 && isPlainObject(v) && i < old.length && !used.has(i) && (isMap(old[i]) || isAlias(old[i]))
                && (oldJson[i] as Plain)?.type === v.type
                && (identity(oldJson[i]) === identity(v) || !newIds.has(identity(oldJson[i])))) j = i
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
        if (!sameScalar(node.value, value)) {
            const text = node.range ? scalarText(value, node, inFlow) : undefined
            if (text === undefined) track.structural = true
            else track.scalars.push({ start: node.range![0], end: node.range![1], text })
            node.value = value
        }
        return node
    }
    if (node && deepEqual(toJs(node, doc), value)) return node
    track.structural = true
    return doc.createNode(value) as Node
}

/** A `<<` key (the merge key — a Symbol once merges are enabled — or its plain spelling). */
function isMergePair(p: Pair): boolean {
    const k = p.key as unknown
    if (!isScalar(k)) return false
    return k.value === '<<' || (typeof k.value === 'symbol' && k.source === '<<')
}

/**
 * The keys the `<<` pairs of a mapping give it, with YAML 1.1's precedence among several bases (the
 * EARLIER one wins) — the mapping's own keys are applied by the caller.
 */
function inheritedKeys(pairs: Pair[], doc: Document): Plain {
    const out: Plain = {}
    for (const p of pairs) {
        const v = toJs(p.value as Node, doc)
        for (const base of Array.isArray(v) ? v : [v]) {
            if (!isPlainObject(base)) continue
            for (const [k, x] of Object.entries(base)) if (!(k in out)) out[k] = x
        }
    }
    return out
}

function sameScalar(a: unknown, b: unknown): boolean {
    return a === b || (Number.isNaN(a) && Number.isNaN(b))
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
    const unsafe = value === '' || /^[\s'"&*!|>%@`#?:,\[\]{}-]|[\s]$|: | #|:$/.test(value)
        || /^(true|false|yes|no|on|off|null|~|[-+]?(\d|\.\d))/i.test(value)
        || /^[-+]?\.(inf|nan)$/i.test(value)
        || (inFlow && /[,:\[\]{}]/.test(value))
    return unsafe ? JSON.stringify(value) : value
}

function sameIndexIf(i: number, len: number, used: Set<number>, ok: (k: number) => boolean): number {
    return i < len && !used.has(i) && ok(i) ? i : -1
}

function keyOf(p: Pair): string {
    if (isMergePair(p)) return '<<'
    const k = p.key as unknown
    return isScalar(k) ? String(k.value) : String(k)
}

/** A node's data as the editor reads it: aliases resolved, merge keys applied. */
function toJs(n: Node, doc: Document): unknown {
    return n && typeof (n as any).toJS === 'function' ? (n as any).toJS(doc) : n
}

/** What makes two list items "the same item": its type plus whichever name it carries. */
function identity(v: unknown): string | undefined {
    if (!isPlainObject(v)) return undefined
    const name = v.id ?? v.name ?? v.route ?? v.actionId ?? v.label ?? v.ref
    if (name == null) return undefined
    return `${String(v.type ?? '')}|${String(name)}`
}

function deepEqual(a: unknown, b: unknown): boolean {
    if (sameScalar(a, b)) return true
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
