// The pure logic behind the routes wizards (Mateu: New File… › Routes File, Mateu: Add Route…, and
// the page flow's "add a route") — a line-for-line port of the IntelliJ plugin's MateuRoutes.kt.
// Classify specs/ui files, generate an EMPTY routes file, and edit a mount's `routes:` list or a
// routes file's entries with MINIMAL text edits (the user's formatting/comments are never rewritten).
// No `vscode` import, so it is unit-tested with vitest.
import { existsSync, readFileSync, readdirSync, type Dirent } from 'node:fs'
import { parse } from 'yaml'
import { yamlScalar } from './newFiles'

export type SpecKind = 'mount' | 'routes' | 'sources' | 'actions' | 'appShell' | 'page'

/** A discovered specs/ui file; `path` is relative to the specs/ui root, `/`-separated. */
export interface SpecFile {
    path: string
    kind: SpecKind
}

/** One entry to append. `layout` is relative to the specs/ui root; absent = the view model's own tree. */
export interface NewRoute {
    route: string
    layout?: string | null
    viewModel?: string | null
    parent?: string | null
}

export const DOCS_URL = 'https://mateu.io/java-ui-definition/route-registry/'

function tryParse(text: string): unknown {
    try {
        return parse(text)
    } catch {
        return undefined
    }
}

function isMap(v: unknown): v is Record<string, unknown> {
    return v != null && typeof v === 'object' && !Array.isArray(v)
}

/**
 * The kind of a specs/ui file from its top-level `type:` — `UI` (mount), `Routes`, `Sources`,
 * `AppShell`, anything else a page/definition. Null when it does not parse or is not a mapping.
 */
export function classify(text: string): SpecKind | null {
    const root = tryParse(text)
    if (!isMap(root)) return null
    switch (root.type == null ? undefined : String(root.type)) {
        case 'UI': return 'mount'
        case 'Routes': return 'routes'
        case 'Sources': return 'sources'
        case 'Actions': return 'actions'
        case 'AppShell': return 'appShell'
        default: return 'page'
    }
}

/** The specs/ui root containing `dir` (`…/specs/ui`), or `dir` itself when it is not under one. */
export function specsRoot(dir: string): string {
    const path = dir.replace(/\/+$/, '')
    const marker = '/specs/ui'
    const i = path.indexOf(`${marker}/`)
    return i >= 0 ? path.substring(0, i + marker.length) : path
}

/** `customerOrders.yaml` → `customer-orders`; a subfolder is kept (`sales/Orders.yaml` → `sales/orders`). */
export function routeNameOf(path: string): string {
    return path.replace(/\.ya?ml$/, '').split('/')
        .map((seg) => seg.replace(/(?<=[a-z0-9])(?=[A-Z])/g, '-').replace(/[\s_]+/g, '-').toLowerCase())
        .join('/')
}

/** The path of `toFile` relative to the directory `fromDir` (both `/`-separated, same root). */
export function relativePath(fromDir: string, toFile: string): string {
    const split = (p: string) => p.split('/').filter((s) => s !== '' && s !== '.')
    const from = split(fromDir)
    const to = split(toFile)
    let common = 0
    while (common < from.length && common < to.length - 1 && from[common] === to[common]) common++
    return [...Array(from.length - common).fill('..'), ...to.slice(common)].join('/')
}

/**
 * A new routes file: a short header, `type: Routes` and an EMPTY list — routes are added one at a time
 * (Add Route…). Identical to the bundled `Mateu Routes` file template (pinned by a test).
 */
export function routesFileText(basePath?: string | null): string {
    return withBasePath(
        '# Route registry of a mount. Each entry binds a route (relative to the mount; "" is its root)\n' +
            '# to a layout under specs/ui, an optional viewModel, and parameters it pins (fixedParams) or\n' +
            "# seeds (defaultParams); `children` nest sub-routes in a parent's slot. Add entries with\n" +
            `# Add Route…, see ${DOCS_URL}\n` +
            'type: Routes\n' +
            'routes: []\n',
        basePath,
    )
}

/**
 * Insert the optional `basePath:` header (only for a class-declared @UI mount) right before the
 * top-level `type:` line; a blank basePath leaves the text unchanged.
 */
export function withBasePath(text: string, basePath?: string | null): string {
    const bp = basePath?.trim()
    if (!bp) return text
    const lines = text.split('\n')
    const i = lines.findIndex((l) => /^type\s*:.*$/.test(l))
    lines.splice(i >= 0 ? i : 0, 0, `basePath: ${yamlScalar(bp)}`)
    return lines.join('\n')
}

/** The routes a routes file already answers, flattened to absolute routes (children joined to their parent). */
export function existingRoutes(routesText: string): string[] {
    const root = tryParse(routesText)
    const list = isMap(root) ? root.routes : root
    if (!Array.isArray(list)) return []
    const out: string[] = []
    const walk = (entries: unknown[], prefix: string | null) => {
        for (const e of entries) {
            if (!isMap(e) || e.route == null) continue
            const r = String(e.route)
            const abs = !prefix ? r : r === '' ? prefix : `${prefix}/${r}`
            out.push(abs)
            if (Array.isArray(e.children)) walk(e.children, abs)
        }
    }
    walk(list, null)
    return out
}

const trimSlashes = (s: string) => s.trim().replace(/^\/+|\/+$/g, '')

/** Append one entry to a routes file's `routes:` list. Throws when the route is already there. */
export function appendRoute(routesText: string, route: NewRoute): string {
    const r = trimSlashes(route.route)
    if (existingRoutes(routesText).includes(r)) throw new Error(`Route "${r}" is already declared in this file`)
    const entries: [string, string][] = [['route', r]]
    const layout = route.layout?.trim()
    if (layout) entries.push(['layout', layout])
    const vm = route.viewModel?.trim()
    if (vm) entries.push(['viewModel', vm])
    const parent = route.parent != null ? trimSlashes(route.parent) : ''
    if (parent) entries.push(['parent', parent])
    return appendListItem(routesText, 'routes', { entries })
}

/**
 * Register a routes file in a mount's `routes:` list (`entry` relative to the mount file's directory).
 * Returns the text unchanged when it is already listed. Throws when the mount is not valid YAML.
 */
export function registerInMount(mountText: string, entry: string): string {
    const root = parse(mountText)
    const listed = isMap(root) && Array.isArray(root.routes) ? root.routes.map((x) => String(x).replace(/^\.\//, '')) : []
    if (listed.includes(entry.replace(/^\.\//, ''))) return mountText
    return appendListItem(mountText, 'routes', { value: entry })
}

/** The mount's `home:` route, or null. */
export function homeOf(mountText: string): string | null {
    const root = tryParse(mountText)
    return isMap(root) && root.home != null ? String(root.home) : null
}

function splitLines(text: string): { lines: string[]; nl: string; trailing: boolean } {
    const nl = text.includes('\r\n') ? '\r\n' : '\n'
    const trailing = text.endsWith('\n')
    const lines = text.split(/\r?\n/)
    if (trailing) lines.pop()
    return { lines, nl, trailing }
}

/**
 * Set the mount's home page route: replace the top-level `home:` line, else insert one after
 * `basePath:`, else after `type: UI`, else at the top. Nothing else in the file moves.
 */
export function setHome(mountText: string, route: string): string {
    const { lines, nl, trailing } = splitLines(mountText)
    const line = `home: ${scalar(trimSlashes(route))}`
    const home = lines.findIndex((l) => /^home\s*:.*$/.test(l))
    if (home >= 0) {
        let end = home + 1
        while (end < lines.length && (lines[end].startsWith(' ') || lines[end].startsWith('\t'))) end++
        lines.splice(home, end - home, line)
    } else {
        let after = lines.findIndex((l) => /^basePath\s*:.*$/.test(l))
        if (after < 0) after = lines.findIndex((l) => /^type\s*:\s*["']?UI["']?\s*(#.*)?$/.test(l))
        lines.splice(after + 1, 0, line)
    }
    return lines.join(nl) + (trailing ? nl : '')
}

function normalize(path: string): string {
    const out: string[] = []
    for (const seg of path.replace(/^\/+/, '').split('/')) {
        if (seg === '' || seg === '.') continue
        if (seg === '..') out.pop()
        else out.push(seg)
    }
    return out.join('/')
}

/**
 * The mount (among `mounts`, path relative to the specs root → text) whose `routes:` list names
 * `routesFile` (relative to the specs root), or null. Entries are resolved against the mount's directory.
 */
export function mountListing(mounts: Record<string, string>, routesFile: string): string | null {
    for (const [path, text] of Object.entries(mounts)) {
        const dir = path.includes('/') ? path.substring(0, path.lastIndexOf('/')) : ''
        const root = tryParse(text)
        const listed = isMap(root) && Array.isArray(root.routes) ? root.routes : []
        if (listed.some((x) => normalize(dir === '' ? String(x) : `${dir}/${x}`) === normalize(routesFile))) return path
    }
    return null
}

/** The classified specs/ui files of one root, with their text (what the routes wizards offer). */
export interface SpecsWorkspace {
    root: string
    files: SpecFile[]
    texts: Record<string, string>
}

/**
 * Scan `root` (absolute) recursively for *.yaml/*.yml and classify each; files that do not parse are
 * left out. `override(abs)` may supply unsaved editor content for a file.
 */
export function scanSpecs(root: string, override?: (abs: string) => string | undefined): SpecsWorkspace {
    const base = root.replace(/\/+$/, '')
    const files: SpecFile[] = []
    const texts: Record<string, string> = {}
    const walk = (dir: string, rel: string) => {
        let entries: Dirent[]
        try {
            entries = readdirSync(dir, { withFileTypes: true })
        } catch {
            return
        }
        for (const e of entries) {
            const abs = `${dir}/${e.name}`
            const r = rel === '' ? e.name : `${rel}/${e.name}`
            if (e.isDirectory()) {
                walk(abs, r)
            } else if (/\.ya?ml$/.test(e.name)) {
                let text = override?.(abs)
                if (text === undefined) {
                    try {
                        text = readFileSync(abs, 'utf8')
                    } catch {
                        continue
                    }
                }
                const kind = classify(text)
                if (kind != null) {
                    files.push({ path: r, kind })
                    texts[r] = text
                }
            }
        }
    }
    if (existsSync(base)) walk(base, '')
    files.sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0))
    return { root: base, files, texts }
}

export function ofKind(ws: SpecsWorkspace, ...kinds: SpecKind[]): SpecFile[] {
    return ws.files.filter((f) => kinds.includes(f.kind))
}

/** The mount (relative path) whose `routes:` lists `routesRel`, or null. */
export function mountOf(ws: SpecsWorkspace, routesRel: string): string | null {
    const mounts: Record<string, string> = {}
    for (const f of ofKind(ws, 'mount')) mounts[f.path] = ws.texts[f.path]
    return mountListing(mounts, routesRel)
}

/** A list item to append: a scalar, or a mapping of string entries. */
export type Item = { value: string } | { entries: [string, string][] }

function scalar(s: string): string {
    return s === '' ? '""' : yamlScalar(s)
}

function blockLines(item: Item, indent: string): string[] {
    if ('value' in item) return [`${indent}- ${scalar(item.value)}`]
    return item.entries.map(([k, v], i) => `${i === 0 ? `${indent}- ` : `${indent}  `}${k}: ${scalar(v)}`)
}

function flow(item: Item): string {
    if ('value' in item) return scalar(item.value)
    return '{' + item.entries.map(([k, v]) => `${k}: ${scalar(v)}`).join(', ') + '}'
}

/** The part of a line before a ` #` comment (quotes are respected). */
function stripComment(s: string): string {
    let quote: string | null = null
    for (let i = 0; i < s.length; i++) {
        const c = s[i]
        if (quote != null) {
            if (c === quote) quote = null
        } else if (c === '"' || c === "'") {
            quote = c
        } else if (c === '#' && (i === 0 || /\s/.test(s[i - 1]))) {
            return s.substring(0, i)
        }
    }
    return s
}

function escapeRegex(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Append `item` to the top-level list `key` with a minimal edit: after the last item of a block list
 * (at its indentation), inside a one-line flow list (`[]` becomes a block list), or as a new `key:`
 * block at the end of the file when the key is absent.
 */
export function appendListItem(text: string, key: string, item: Item): string {
    const { lines, nl, trailing } = splitLines(text)
    const keyRe = new RegExp(`^${escapeRegex(key)}\\s*:(.*)$`)
    const idx = lines.findIndex((l) => keyRe.test(l))
    if (idx < 0) {
        while (lines.length > 0 && lines[lines.length - 1].trim() === '') lines.pop()
        lines.push(`${key}:`, ...blockLines(item, '  '))
        return lines.join(nl) + nl
    }
    const rest = keyRe.exec(lines[idx])![1]
    const value = stripComment(rest).trim()
    if (value === '') {
        let last = idx
        let itemIndent: string | null = null
        for (let j = idx + 1; j < lines.length; j++) {
            const l = lines[j]
            if (l.trim() === '' || l.trimStart().startsWith('#')) continue
            const belongs = l.startsWith(' ') || l.startsWith('\t') || l.startsWith('- ') || l === '-'
            if (!belongs) break
            if (itemIndent == null && l.trimStart().startsWith('-')) itemIndent = l.substring(0, l.length - l.trimStart().length)
            last = j
        }
        lines.splice(last + 1, 0, ...blockLines(item, itemIndent ?? '  '))
    } else if (value.startsWith('[') && value.endsWith(']')) {
        const inner = value.substring(1, value.length - 1).trim()
        const c = rest.substring(stripComment(rest).length).trim()
        const comment = c === '' ? '' : ` ${c}`
        if (inner === '') {
            lines[idx] = `${key}:${comment}`
            lines.splice(idx + 1, 0, ...blockLines(item, '  '))
        } else {
            lines[idx] = `${key}: [${inner}, ${flow(item)}]${comment}`
        }
    } else {
        throw new Error(`\`${key}:\` is not a list this tool can edit (${value.substring(0, 30)})`)
    }
    return lines.join(nl) + (trailing ? nl : '')
}
