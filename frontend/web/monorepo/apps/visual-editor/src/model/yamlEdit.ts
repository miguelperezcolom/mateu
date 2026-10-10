import { isMap, isPair, isScalar, isSeq, parseDocument, stringify, type Document, type Node, type Pair, type YAMLMap, type YAMLSeq } from 'yaml'

/**
 * Minimal TEXT edits of a YAML file — the board's edits (a route, a menu entry, a button, a rowRoute)
 * touch the lines they are about and nothing else: comments, quoting, flow `{…}` style and the
 * author's indentation stay as written (the same promise the routes wizards make). The document is
 * parsed only to FIND where to edit (node source ranges); the edit itself is a splice of the
 * original text. New content follows the indentation of its siblings.
 *
 * Every function returns the new text, or throws an Error saying what it could not edit.
 */

export type Path = (string | number)[]

/** Parse for editing; refuses a file that does not parse (an edit would only make it worse). */
export function docOf(text: string): Document {
    const doc = parseDocument(text, { keepSourceTokens: false })
    if (doc.errors.length) throw new Error('The file is not valid YAML: ' + doc.errors[0].message)
    return doc
}

/** The node at `path` (map keys / seq indexes), or undefined. */
export function nodeAtPath(doc: Document, path: Path): Node | undefined {
    let node: unknown = doc.contents
    for (const step of path) {
        if (typeof step === 'number') node = isSeq(node) ? node.items[step] : undefined
        else node = isMap(node) ? node.get(step, true) : undefined
        if (node === undefined) return undefined
    }
    return node as Node
}

const lineStart = (text: string, at: number) => text.lastIndexOf('\n', at - 1) + 1
const lineEnd = (text: string, at: number) => {
    const i = text.indexOf('\n', at)
    return i < 0 ? text.length : i + 1
}
const columnOf = (text: string, at: number) => at - lineStart(text, at)
/** Where a node's own text ends: its value end, without trailing blank lines or a closing comment. */
function nodeEnd(node: Node): number {
    const r = node.range
    if (!r) throw new Error('The node has no position in the file')
    return r[1]
}

/** A scalar as YAML text: plain when that reads back as the same string, else double-quoted. */
export function scalarText(value: string | number | boolean): string {
    if (typeof value !== 'string') return String(value)
    if (value === '') return '""'
    const plain = /^[A-Za-z0-9_./][A-Za-z0-9_./ -]*$/.test(value) && !/ $/.test(value)
        && !/^(true|false|null|yes|no|on|off|~|-?\d+(\.\d+)?)$/i.test(value)
    return plain ? value : JSON.stringify(value)
}

/** A value as one-line flow YAML (`{type: Button, label: Go}`), for a flow list or map. */
export function flowText(value: unknown): string {
    if (Array.isArray(value)) return '[' + value.map(flowText).join(', ') + ']'
    if (value && typeof value === 'object') {
        return '{' + Object.entries(value as Record<string, unknown>).filter(([, v]) => v !== undefined)
            .map(([k, v]) => `${k}: ${flowText(v)}`).join(', ') + '}'
    }
    return scalarText(value as string)
}

/** A value as block lines (no trailing newline) — a `- ` item when `asItem`. Flat values only nest maps in flow. */
function blockLines(value: unknown, indent: string, asItem: boolean): string[] {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
        const entries = Object.entries(value as Record<string, unknown>).filter(([, v]) => v !== undefined)
        return entries.map(([k, v], i) => {
            const lead = asItem ? (i === 0 ? '- ' : '  ') : ''
            const val = v && typeof v === 'object' ? flowText(v) : scalarText(v as string)
            return `${indent}${lead}${k}: ${val}`
        })
    }
    return [`${indent}${asItem ? '- ' : ''}${typeof value === 'object' ? flowText(value) : scalarText(value as string)}`]
}

/** Replace a scalar's value (keeping the key and everything around it). */
export function replaceScalar(text: string, path: Path, value: string): string {
    const doc = docOf(text)
    const node = nodeAtPath(doc, path)
    if (!node || !isScalar(node) || !node.range) throw new Error(`No value at ${path.join('.')}`)
    return text.slice(0, node.range[0]) + scalarText(value) + text.slice(node.range[1])
}

/**
 * Set `key: value` in the map at `mapPath`: the value replaced when the key is there, else a new
 * line after the map's last entry (block) or a new entry before its `}` (flow).
 */
export function setKey(text: string, mapPath: Path, key: string, value: string): string {
    const doc = docOf(text)
    const map = mapPath.length ? nodeAtPath(doc, mapPath) : doc.contents
    if (!isMap(map)) throw new Error(`No map at ${mapPath.join('.') || 'the root'}`)
    const existing = map.get(key, true)
    if (existing && isScalar(existing) && existing.range) return text.slice(0, existing.range[0]) + scalarText(value) + text.slice(existing.range[1])
    if (existing) throw new Error(`\`${key}\` is not a plain value here`)
    return insertPair(text, map, `${key}: ${scalarText(value)}`)
}

function insertPair(text: string, map: YAMLMap, pairText: string): string {
    if (map.flow) {
        const close = text.lastIndexOf('}', nodeEnd(map as unknown as Node))
        const empty = map.items.length === 0
        return text.slice(0, close) + (empty ? pairText : `, ${pairText}`) + text.slice(close)
    }
    const last = map.items[map.items.length - 1] as Pair<Node, Node> | undefined
    if (!last) throw new Error('An empty block map cannot take a key here')
    const keyNode = last.key as Node
    const indent = ' '.repeat(columnOf(text, keyNode.range![0]))
    const end = lineEnd(text, pairEnd(last))
    const nl = end > 0 && text[end - 1] === '\n' ? '' : '\n'
    return text.slice(0, end) + nl + indent + pairText + '\n' + text.slice(end)
}

/** Where a pair's text ends (its value's end, or the key's for a bare `key:`). */
function pairEnd(pair: Pair<Node, Node | null>): number {
    const v = pair.value as Node | null
    if (v?.range) return v.range[1] > 0 ? Math.max(v.range[1] - 1, v.range[0]) : v.range[0]
    return (pair.key as Node).range![1]
}

/**
 * Append `item` to the list under `key` of the map at `mapPath`, creating the list when the key is
 * absent: after the last item at its indentation (block), inside the brackets (flow — an empty `[]`
 * becomes a block list), or as a new `key:` block after the map's last entry.
 */
export function appendToList(text: string, mapPath: Path, key: string, item: unknown): string {
    const doc = docOf(text)
    const map = mapPath.length ? nodeAtPath(doc, mapPath) : doc.contents
    if (!isMap(map)) throw new Error(`No map at ${mapPath.join('.') || 'the root'}`)
    const pair = map.items.find((p) => isScalar(p.key) && p.key.value === key) as Pair<Node, Node | null> | undefined
    if (!pair) {
        if (map.flow) return insertPair(text, map, `${key}: [${flowText(item)}]`)
        const keyCol = columnOf(text, (map.items[0].key as Node).range![0])
        const indent = ' '.repeat(keyCol)
        const block = [`${indent}${key}:`, ...blockLines(item, indent + '  ', true)].join('\n')
        return insertPair(text, map, block.slice(indent.length))
    }
    const seq = pair.value
    if (seq === null || (isScalar(seq) && (seq.value === null || seq.value === ''))) {
        // `key:` with nothing (or `~`) after it
        const keyNode = pair.key as Node
        const indent = ' '.repeat(columnOf(text, keyNode.range![0]))
        const at = seq && isScalar(seq) && seq.range ? seq.range[0] : keyNode.range![1] + 1
        const end = seq && isScalar(seq) && seq.range ? seq.range[1] : at
        return text.slice(0, at) + '\n' + blockLines(item, indent + '  ', true).join('\n') + text.slice(end)
    }
    if (!isSeq(seq) || !seq.range) throw new Error(`\`${key}\` is not a list`)
    if (seq.flow) {
        const close = text.lastIndexOf(']', seq.range[1])
        if (seq.items.length === 0) {
            const keyNode = pair.key as Node
            const indent = ' '.repeat(columnOf(text, keyNode.range![0]))
            const open = text.lastIndexOf('[', close)
            return text.slice(0, open).replace(/[ \t]*$/, '') + '\n' + blockLines(item, indent + '  ', true).join('\n') + text.slice(close + 1)
        }
        return text.slice(0, close) + ', ' + flowText(item) + text.slice(close)
    }
    const first = seq.items[0] as Node
    const last = seq.items[seq.items.length - 1] as Node
    const dash = text.lastIndexOf('-', first.range![0])
    const indent = ' '.repeat(columnOf(text, dash))
    const end = lineEnd(text, Math.max(last.range![1] - 1, last.range![0]))
    const nl = text[end - 1] === '\n' ? '' : '\n'
    return text.slice(0, end) + nl + blockLines(item, indent, true).join('\n') + '\n' + text.slice(end)
}

/** Remove item `index` of the list at `seqPath` (its lines, or its `, item` in a flow list). */
export function removeListItem(text: string, seqPath: Path, index: number): string {
    const doc = docOf(text)
    const seq = nodeAtPath(doc, seqPath)
    if (!isSeq(seq) || !seq.range) throw new Error(`No list at ${seqPath.join('.')}`)
    const item = seq.items[index] as Node | undefined
    if (!item?.range) throw new Error(`No item ${index} at ${seqPath.join('.')}`)
    if (seq.flow) return removeFlowEntry(text, seq.items as Node[], index, seq.range)
    if (seq.items.length === 1) {
        // the list's only item: `key: []` keeps the key a list
        const start = lineStart(text, text.lastIndexOf('-', item.range[0]))
        const end = lineEnd(text, Math.max(item.range[1] - 1, item.range[0]))
        const before = text.slice(0, start).replace(/[ \t]*\n$/, '')
        return before + ' []\n' + text.slice(end)
    }
    const start = lineStart(text, text.lastIndexOf('-', item.range[0]))
    const end = lineEnd(text, Math.max(item.range[1] - 1, item.range[0]))
    return text.slice(0, start) + text.slice(end)
}

/** Remove `key` from the map at `mapPath` (its lines, or its `, key: value` in a flow map). */
export function removeKey(text: string, mapPath: Path, key: string): string {
    const doc = docOf(text)
    const map = mapPath.length ? nodeAtPath(doc, mapPath) : doc.contents
    if (!isMap(map) || !map.range) throw new Error(`No map at ${mapPath.join('.') || 'the root'}`)
    const index = map.items.findIndex((p) => isScalar(p.key) && p.key.value === key)
    if (index < 0) return text
    if (map.flow) {
        const pairs = map.items.map((p) => ({ range: [(p.key as Node).range![0], ((p.value as Node | null)?.range ?? (p.key as Node).range!)[1], 0] })) as unknown as Node[]
        return removeFlowEntry(text, pairs, index, map.range)
    }
    const pair = map.items[index] as Pair<Node, Node | null>
    const start = lineStart(text, (pair.key as Node).range![0])
    const end = lineEnd(text, pairEnd(pair))
    return text.slice(0, start) + text.slice(end)
}

function removeFlowEntry(text: string, entries: Node[], index: number, _outer: [number, number, number]): string {
    const at = entries[index].range!
    if (entries.length === 1) return text.slice(0, at[0]) + text.slice(at[1])
    if (index < entries.length - 1) {
        const next = entries[index + 1].range!
        return text.slice(0, at[0]) + text.slice(next[0])
    }
    const prev = entries[index - 1].range!
    return text.slice(0, prev[1]) + text.slice(at[1])
}

/** Walk every node with its path (map keys and seq indexes), document order. */
export function walkNodes(doc: Document, visit: (node: Node, path: Path) => void): void {
    const go = (node: unknown, path: Path) => {
        if (!node || typeof node !== 'object') return
        visit(node as Node, path)
        if (isMap(node)) {
            for (const p of node.items) if (isPair(p) && isScalar(p.key)) go(p.value, [...path, String(p.key.value)])
        } else if (isSeq(node)) {
            node.items.forEach((x, i) => go(x, [...path, i]))
        }
    }
    go(doc.contents, [])
}

/** A plain value of a map node's key (`type`, `route`…), or undefined. */
export function stringAt(map: Node, key: string): string | undefined {
    if (!isMap(map)) return undefined
    const v = map.get(key)
    return typeof v === 'string' ? v : typeof v === 'number' ? String(v) : undefined
}

/** A whole new file's text from a value (only for files the board creates). */
export function newFileText(value: unknown, header?: string): string {
    return (header ? header.replace(/\n?$/, '\n') : '') + stringify(value)
}

export { isMap, isSeq, isScalar }
export type { YAMLSeq }
