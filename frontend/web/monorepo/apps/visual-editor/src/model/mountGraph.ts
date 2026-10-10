import { parse } from 'yaml'
import type { ProjectFile } from './projectIndex'
import { isRoutesYaml, parseRoutes, flattenRoutes } from './routesModel'
import { isMountYaml } from './mountModel'

/**
 * The mount as a MAP of screens: one node per route, and an arrow wherever a screen can take you to
 * another — the board view (an idea taken from m3e-canvas: every screen in sight, with the flow
 * between them drawn). Derived, never authored: the arrows are read off what the files already say.
 *
 *  - an app shell's menu (`RouteLink`s, nested `Menu`s included) → each target, from the shell;
 *  - a `RouteLink` anywhere in a page (a button's `actionable`, a link) → its route;
 *  - a listing's `rowRoute` (`people/${row.id}`) → the record route it opens;
 *  - a REST action's `successRoute` → where a save lands;
 *  - a flow's `Navigate` step → its route;
 *  - a route's `children` → each child (they render in the parent's slot).
 *
 * A target is matched against the route TABLE the way the router matches a URL: `${…}` stands for
 * any segment, `:param` takes any segment, and a static route beats a parameterised one — so
 * `people/${row.id}` lands on `people/:id`, not on `people/new`. What matches nothing is kept as
 * `unresolved`: a link to a screen that does not exist is worth seeing.
 */

export type ScreenKind = 'shell' | 'page' | 'viewModel' | 'missing' | 'unrouted'

export interface Screen {
    /** The node key: the absolute route (`''` is the root), or `file:<path>` for a page no route serves. */
    id: string
    route?: string
    /** The definition file (relative to specs/ui), when the route has one and it exists. */
    file?: string
    viewModel?: string
    kind: ScreenKind
    /** The page's own title (template placeholders stripped), else undefined. */
    title?: string
    /** The definition's root type (`Form`, `Listing`, `AppShell`…). */
    type?: string
    /** The route's parent, for a nested child route. */
    parent?: string
}

export type EdgeVia = 'menu' | 'link' | 'row' | 'save' | 'flow' | 'child'

export interface NavEdge {
    from: string
    to: string
    via: EdgeVia
    /** What the user clicks: the button / menu label, `row`, `after save`… */
    label: string
}

export interface UnresolvedLink {
    from: string
    target: string
    via: EdgeVia
    label: string
}

export interface MountGraph {
    screens: Screen[]
    edges: NavEdge[]
    unresolved: UnresolvedLink[]
    /** The screen play mode and the layout start from: the root route, else the first one. */
    start?: string
}

/** The screen key of a route. */
export const screenId = (route: string): string => normalizeRoute(route)

export function buildMountGraph(files: ProjectFile[]): MountGraph {
    const { byPath, routeRows } = readMount(files)
    const screens = screensOf(routeRows, byPath)
    const { edges, unresolved } = edgesOf(screens, byPath)
    const root = screens.find((s) => s.route === '')
    return { screens, edges, unresolved, start: root?.id ?? screens.find((s) => s.route !== undefined)?.id }
}

type RouteRows = ReturnType<typeof flattenRoutes>

/** The mount's route table (flattened) and its other files parsed, by path — sources, the action catalogue and the mount descriptor left out. */
function readMount(files: ProjectFile[]): { byPath: Map<string, unknown>; routeRows: RouteRows } {
    const byPath = new Map<string, unknown>()
    const routeRows: RouteRows = []
    for (const f of files ?? []) {
        const path = normalizePath(f.path)
        if (!path || isMountYaml(f.content)) continue
        if (isRoutesYaml(f.content)) { routeRows.push(...flattenRoutes(parseRoutes(f.content).routes)); continue }
        const parsed = parseObject(f.content)
        if (parsed && !isSourcesDoc(parsed) && parsed.type !== 'Actions') byPath.set(path, parsed)
    }
    return { byPath, routeRows }
}

function parseObject(text: string): Record<string, unknown> | undefined {
    try {
        const parsed = parse(text)
        return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed as Record<string, unknown> : undefined
    } catch {
        return undefined
    }
}

function isSourcesDoc(o: Record<string, unknown>): boolean {
    return o.type === 'Sources' || (!o.type && Array.isArray(o.sources))
}

/** A screen per route (the first entry wins for a route listed twice), then the pages no route serves. */
function screensOf(routeRows: RouteRows, byPath: Map<string, unknown>): Screen[] {
    const screens: Screen[] = []
    const seen = new Set<string>()
    const routed = new Set<string>()
    for (const r of routeRows) {
        const id = screenId(r.absolute)
        if (seen.has(id)) continue
        seen.add(id)
        const file = r.definition ? normalizePath(r.definition) : undefined
        const def = file ? byPath.get(file) : undefined
        if (file && def) routed.add(file)
        const type = typeOf(def)
        const parentRoute = r.absolute.includes('/') && r.absolute !== r.route ? r.absolute.slice(0, r.absolute.length - r.route.length - 1) : undefined
        screens.push({
            id, route: id, file, viewModel: r.viewModel, kind: kindOf(def, type, file, r.viewModel),
            title: titleOf(def), type, parent: parentRoute === undefined ? undefined : screenId(parentRoute),
        })
    }
    // A page no route serves is still a screen of the mount — just not one anybody can reach yet.
    for (const [path, def] of byPath) {
        if (routed.has(path) || isPartialPath(path)) continue
        const type = typeOf(def)
        if (type === 'AppShell' || type === 'UI' || type === 'Routes') continue
        screens.push({ id: 'file:' + path, file: path, kind: 'unrouted', title: titleOf(def), type })
    }
    return screens
}

function kindOf(def: unknown, type: string | undefined, file: string | undefined, viewModel: string | undefined): ScreenKind {
    if (def) return type === 'AppShell' ? 'shell' : 'page'
    if (!file && viewModel) return 'viewModel'
    return 'missing'
}

/** Every navigation the screens' files declare, matched against the route table. */
function edgesOf(screens: Screen[], byPath: Map<string, unknown>): { edges: NavEdge[]; unresolved: UnresolvedLink[] } {
    const patterns = screens.filter((s) => s.route !== undefined).map((s) => s.route!)
    const edges: NavEdge[] = []
    const unresolved: UnresolvedLink[] = []
    const edgeKeys = new Set<string>()
    const add = (from: string, target: string, via: EdgeVia, label: string) => {
        const to = matchRoute(target, patterns)
        if (to === undefined) { unresolved.push({ from, target, via, label }); return }
        if (to === from && via !== 'child') return // a link to the screen you are on is not a flow
        const key = `${from}→${to}|${label}`
        if (edgeKeys.has(key)) return
        edgeKeys.add(key)
        edges.push({ from, to, via, label })
    }
    for (const s of screens) {
        if (s.parent !== undefined) add(s.parent, s.route!, 'child', 'tab')
        const def = s.file ? byPath.get(s.file) : undefined
        if (def) walk(def, s.kind === 'shell', undefined, (target, via, label) => add(s.id, target, via, label))
    }
    return { edges, unresolved }
}

type Visit = (target: string, via: EdgeVia, label: string) => void

/** Walk a definition for every navigation it declares, labelling each with what the user clicks. */
function walk(node: unknown, inMenu: boolean, label: string | undefined, visit: Visit, actionId?: string): void {
    if (Array.isArray(node)) { for (const n of node) walk(n, inMenu, label, visit, actionId); return }
    if (!node || typeof node !== 'object') return
    const o = node as Record<string, unknown>
    const own = typeof o.label === 'string' && o.label.trim() ? o.label.trim() : undefined
    visitOwn(o, inMenu, own ?? label, visit, actionId)
    // A menu's items sit under `menu`/`submenu`; a page's under any other key.
    for (const [k, v] of Object.entries(o)) {
        if (!v || typeof v !== 'object') continue
        const id = typeof o.id === 'string' && (k === 'restAction' || k === 'steps') ? o.id : actionId
        walk(v, inMenu || k === 'menu', own ?? label, visit, id)
    }
}

/** The navigation a single node declares itself. */
function visitOwn(o: Record<string, unknown>, inMenu: boolean, label: string | undefined, visit: Visit, actionId?: string) {
    if (o.type === 'RouteLink' && typeof o.route === 'string') visit(o.route, inMenu ? 'menu' : 'link', label ?? o.route)
    if (o.type === 'Navigate' && typeof o.route === 'string') visit(o.route, 'flow', actionId ? `${actionId} flow` : 'flow')
    if (typeof o.rowRoute === 'string') visit(o.rowRoute, 'row', 'row click')
    if (typeof o.successRoute === 'string') visit(o.successRoute, 'save', `after ${actionId ?? 'save'}`)
}

/**
 * The route of `patterns` a navigation target lands on, or undefined. `${…}` in the target stands for
 * any value; `:x` in a pattern takes any segment. Ranked like the router: a literal match beats a
 * parameter, which beats a placeholder landing on a literal.
 */
export function matchRoute(target: string, patterns: string[]): string | undefined {
    const t = splitRoute(target)
    let best: string | undefined
    let bestScore = -1
    for (const p of patterns) {
        const segs = splitRoute(p)
        if (segs.length !== t.length) continue
        const score = matchScore(segs, t)
        if (score > bestScore) { best = p; bestScore = score }
    }
    return best
}

/** How well a pattern's segments take a target's: a literal 3, a parameter 2, a placeholder on a literal 0; -1 = no match. */
function matchScore(pattern: string[], target: string[]): number {
    let score = 0
    for (let i = 0; i < pattern.length; i++) {
        if (pattern[i].startsWith(':')) score += 2
        else if (pattern[i] === target[i]) score += 3
        else if (target[i] !== '*') return -1
    }
    return score
}

function splitRoute(r: string): string[] {
    const clean = normalizeRoute(r).replace(/\$\{[^}]{0,200}\}/g, '*')
    return clean ? clean.split('/') : []
}

function normalizeRoute(r: string): string {
    return trimSlashes((r ?? '').split('?')[0])
}

function trimSlashes(s: string): string {
    let a = 0
    let b = s.length
    while (a < b && s[a] === '/') a++
    while (b > a && s[b - 1] === '/') b--
    return s.slice(a, b)
}

function normalizePath(p: string): string {
    return (p ?? '').replace(/^\/+/, '').replace(/^specs\/ui\//, '')
}

function isPartialPath(p: string): boolean {
    return p.startsWith('partials/') || p.includes('/partials/')
}

function typeOf(def: unknown): string | undefined {
    const o = def as Record<string, unknown> | undefined
    if (!o) return undefined
    if (typeof o.type === 'string') return o.type
    const layout = o.layout as Record<string, unknown> | undefined
    return typeof layout?.type === 'string' ? layout.type : undefined
}

function titleOf(def: unknown): string | undefined {
    const o = def as Record<string, unknown> | undefined
    const raw = o?.title ?? (o?.layout as Record<string, unknown> | undefined)?.title
    if (typeof raw !== 'string') return undefined
    const t = raw.replace(/\$\{[^}]*\}/g, '…').trim()
    return t && t !== '…' ? t : undefined
}

// --- the board's automatic layout ---

export interface BoardBox { x: number; y: number }

export const CARD_W = 260
export const CARD_H = 210
const GAP_X = 120
const GAP_Y = 48

/**
 * The board's automatic layout. The start screen (the app shell, usually) sits on the left; each
 * screen it leads to opens a BAND — that screen and everything reached through it, laid out left to
 * right by distance (a listing, then its record and its create form, then the record's edit form), so
 * a resource's screens read as a row. A screen goes in the band that reaches it first; a child sits
 * on its parent's row or the first free one below it. Screens nothing links to form a band of their
 * own, last — they are the ones to look at.
 *
 * The bands are then packed into as many columns as make the whole board closest to a screen's
 * proportions: a mount with six resources is two columns of three bands, not one very tall strip.
 */
export function layoutBoard(graph: MountGraph, aspect = 1.6): Record<string, BoardBox> {
    const next = new Map<string, string[]>()
    for (const e of graph.edges) next.set(e.from, [...(next.get(e.from) ?? []), e.to])
    const ids = new Set(graph.screens.map((s) => s.id))
    const placed = new Set<string>()
    const start = graph.start !== undefined && ids.has(graph.start) ? graph.start : undefined
    if (start !== undefined) placed.add(start)

    // One band per screen the start leads to: the screens reached through it, breadth first.
    const bands: Band[] = []
    const reach = { next, ids, placed }
    for (const to of start === undefined ? [] : next.get(start) ?? []) {
        if (!placed.has(to) && ids.has(to)) bands.push(growBand(to, reach))
    }
    // What the start does not reach: whatever leads somewhere new starts its own band; the rest, last.
    const linkedTo = new Set(graph.edges.map((e) => e.to))
    for (const s of graph.screens) {
        if (placed.has(s.id) || linkedTo.has(s.id)) continue
        if (next.get(s.id)?.some((to) => !placed.has(to))) bands.push(growBand(s.id, reach))
    }
    const orphans = graph.screens.map((s) => s.id).filter((id) => !placed.has(id))
    if (orphans.length) bands.push(gridBand(orphans))

    const colW = CARD_W + GAP_X
    const rowH = CARD_H + GAP_Y
    const offsets = packBands(bands, start === undefined ? 0 : colW, aspect)
    const out: Record<string, BoardBox> = {}
    if (start !== undefined) out[start] = { x: 0, y: 0 }
    bands.forEach((b, i) => {
        for (const c of b.cells) out[c.id] = { x: offsets[i].x + c.col * colW, y: offsets[i].y + c.row * rowH }
    })
    return out
}

type Band = { cells: { id: string; col: number; row: number }[]; cols: number; rows: number }
type Reach = { next: Map<string, string[]>; ids: Set<string>; placed: Set<string> }

/** A band grown from `root`: breadth first, a column per step, each screen on its parent's row or the first free one below. */
function growBand(root: string, { next, ids, placed }: Reach): Band {
    const cells: Band['cells'] = []
    const nextFree: number[] = []
    const queue = [{ id: root, col: 0, parentRow: 0 }]
    placed.add(root)
    while (queue.length) {
        const { id, col, parentRow } = queue.shift()!
        const row = Math.max(parentRow, nextFree[col] ?? 0)
        nextFree[col] = row + 1
        cells.push({ id, col, row })
        for (const to of next.get(id) ?? []) {
            if (placed.has(to) || !ids.has(to)) continue
            placed.add(to)
            queue.push({ id: to, col: col + 1, parentRow: row })
        }
    }
    return { cells, cols: Math.max(...cells.map((c) => c.col)) + 1, rows: Math.max(...cells.map((c) => c.row)) + 1 }
}

/** Screens with no arrows at all, three to a row. */
function gridBand(ids: string[]): Band {
    return { cells: ids.map((id, i) => ({ id, col: i % 3, row: Math.floor(i / 3) })), cols: Math.min(3, ids.length), rows: Math.ceil(ids.length / 3) }
}

/** Where each band goes: packed into the number of columns that brings the whole board closest to `aspect`. */
function packBands(bands: Band[], left: number, aspect: number): { x: number; y: number }[] {
    let best: { offsets: { x: number; y: number }[]; score: number } | undefined
    for (let k = 1; k <= Math.max(1, bands.length); k++) {
        const { offsets, width, height } = packInto(bands, k, left)
        const score = Math.abs(Math.log((width || 1) / (height || 1) / aspect))
        if (!best || score < best.score) best = { offsets, score }
    }
    return best!.offsets
}

function packInto(bands: Band[], k: number, left: number) {
    const offsets: { x: number; y: number }[] = []
    const per = Math.ceil(bands.length / k)
    let x = left
    let height = 0
    for (let c = 0; c * per < bands.length; c++) {
        const group = bands.slice(c * per, (c + 1) * per)
        let y = 0
        for (const b of group) { offsets.push({ x, y }); y += b.rows * (CARD_H + GAP_Y) + GAP_Y }
        height = Math.max(height, y)
        x += Math.max(...group.map((b) => b.cols)) * (CARD_W + GAP_X) + GAP_X
    }
    return { offsets, width: x, height }
}
