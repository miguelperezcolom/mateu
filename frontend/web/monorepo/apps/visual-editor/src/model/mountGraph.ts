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
    const byPath = new Map<string, unknown>()
    const routeRows: ReturnType<typeof flattenRoutes> = []
    for (const f of files ?? []) {
        const path = normalizePath(f.path)
        if (!path || isMountYaml(f.content)) continue
        if (isRoutesYaml(f.content)) { routeRows.push(...flattenRoutes(parseRoutes(f.content).routes)); continue }
        let parsed: unknown
        try { parsed = parse(f.content) } catch { continue }
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            const type = (parsed as Record<string, unknown>).type
            if (type === 'Sources' || (!type && Array.isArray((parsed as Record<string, unknown>).sources))) continue
            byPath.set(path, parsed)
        }
    }

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
        const kind: ScreenKind = def
            ? (type === 'AppShell' ? 'shell' : 'page')
            : file ? 'missing' : r.viewModel ? 'viewModel' : 'missing'
        const parentRoute = r.absolute.includes('/') && r.absolute !== r.route ? r.absolute.slice(0, r.absolute.length - r.route.length - 1) : undefined
        screens.push({
            id, route: id, file: file && def ? file : file, viewModel: r.viewModel, kind,
            title: titleOf(def), type, parent: parentRoute !== undefined ? screenId(parentRoute) : undefined,
        })
    }
    // A page no route serves is still a screen of the mount — just not one anybody can reach yet.
    for (const [path, def] of byPath) {
        if (routed.has(path) || isPartialPath(path)) continue
        const type = typeOf(def)
        if (type === 'AppShell' || type === 'UI' || type === 'Routes') continue
        screens.push({ id: 'file:' + path, file: path, kind: 'unrouted', title: titleOf(def), type })
    }

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

    const root = screens.find((s) => s.route === '')
    return { screens, edges, unresolved, start: root?.id ?? screens.find((s) => s.route !== undefined)?.id }
}

type Visit = (target: string, via: EdgeVia, label: string) => void

/** Walk a definition for every navigation it declares, labelling each with what the user clicks. */
function walk(node: unknown, inMenu: boolean, label: string | undefined, visit: Visit, actionId?: string): void {
    if (Array.isArray(node)) { for (const n of node) walk(n, inMenu, label, visit, actionId); return }
    if (!node || typeof node !== 'object') return
    const o = node as Record<string, unknown>
    const own = typeof o.label === 'string' && o.label.trim() ? o.label.trim() : undefined
    if (o.type === 'RouteLink' && typeof o.route === 'string') {
        visit(o.route, inMenu ? 'menu' : 'link', own ?? label ?? o.route)
    }
    if (o.type === 'Navigate' && typeof o.route === 'string') {
        visit(o.route, 'flow', actionId ? `${actionId} flow` : 'flow')
    }
    if (typeof o.rowRoute === 'string') visit(o.rowRoute, 'row', 'row click')
    if (typeof o.successRoute === 'string') visit(o.successRoute, 'save', `after ${actionId ?? 'save'}`)
    // A menu's items sit under `menu`/`submenu`; a page's under any other key.
    for (const [k, v] of Object.entries(o)) {
        if (v && typeof v === 'object') {
            const childMenu = inMenu || k === 'menu'
            const id = typeof o.id === 'string' && (k === 'restAction' || k === 'steps') ? o.id : actionId
            walk(v, childMenu, own ?? label, visit, id)
        }
    }
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
        let score = 0
        let ok = true
        for (let i = 0; i < segs.length && ok; i++) {
            const ps = segs[i]
            const ts = t[i]
            if (ps.startsWith(':')) score += 2
            else if (ts === '*') score += 0
            else if (ps === ts) score += 3
            else ok = false
        }
        if (ok && score > bestScore) { best = p; bestScore = score }
    }
    return best
}

function splitRoute(r: string): string[] {
    const clean = normalizeRoute(r).replace(/\$\{[^}]*\}/g, '*')
    return clean ? clean.split('/') : []
}

function normalizeRoute(r: string): string {
    return (r ?? '').split('?')[0].replace(/^\/+/, '').replace(/\/+$/, '')
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

    // One band per screen the start leads to: the screens reached through it, breadth first.
    type Band = { cells: { id: string; col: number; row: number }[]; cols: number; rows: number }
    const bands: Band[] = []
    const grow = (roots: string[]): Band => {
        const cells: Band['cells'] = []
        const nextFree: number[] = []
        const rowOf = new Map<string, number>()
        const queue = roots.map((id) => ({ id, col: 0, parentRow: -1 }))
        for (const r of roots) placed.add(r)
        while (queue.length) {
            const { id, col, parentRow } = queue.shift()!
            const row = Math.max(parentRow < 0 ? 0 : parentRow, nextFree[col] ?? 0)
            nextFree[col] = row + 1
            rowOf.set(id, row)
            cells.push({ id, col, row })
            for (const to of next.get(id) ?? []) {
                if (placed.has(to) || !ids.has(to)) continue
                placed.add(to)
                queue.push({ id: to, col: col + 1, parentRow: row })
            }
        }
        return { cells, cols: Math.max(...cells.map((c) => c.col)) + 1, rows: Math.max(...cells.map((c) => c.row)) + 1 }
    }
    if (start !== undefined) placed.add(start)
    for (const to of start !== undefined ? next.get(start) ?? [] : []) {
        if (!placed.has(to) && ids.has(to)) bands.push(grow([to]))
    }
    // What the start does not reach: whatever still has a way in starts its own band; the rest, last.
    const rest = graph.screens.map((s) => s.id).filter((id) => !placed.has(id))
    const linkedTo = new Set(graph.edges.map((e) => e.to))
    for (const id of rest) if (!placed.has(id) && !linkedTo.has(id)) {
        if (next.get(id)?.some((to) => !placed.has(to))) bands.push(grow([id]))
    }
    const orphans = graph.screens.map((s) => s.id).filter((id) => !placed.has(id))
    for (const id of orphans) placed.add(id)
    if (orphans.length) bands.push({ cells: orphans.map((id, i) => ({ id, col: i % 3, row: Math.floor(i / 3) })), cols: Math.min(3, orphans.length), rows: Math.ceil(orphans.length / 3) })

    const colW = CARD_W + GAP_X
    const rowH = CARD_H + GAP_Y
    const left = start !== undefined ? colW : 0
    // Pack the bands into k columns (each band below the previous one in its column), and keep the k
    // whose overall shape is closest to the target aspect.
    let best: { k: number; offsets: { x: number; y: number }[]; score: number } | undefined
    for (let k = 1; k <= Math.max(1, bands.length); k++) {
        const offsets: { x: number; y: number }[] = []
        const per = Math.ceil(bands.length / k)
        let x = left
        let height = 0
        for (let c = 0; c < k; c++) {
            const group = bands.slice(c * per, (c + 1) * per)
            if (!group.length) break
            let y = 0
            for (const b of group) { offsets.push({ x, y }); y += b.rows * rowH + GAP_Y }
            height = Math.max(height, y)
            x += Math.max(...group.map((b) => b.cols)) * colW + GAP_X
        }
        const score = Math.abs(Math.log((x || 1) / (height || 1) / aspect))
        if (!best || score < best.score) best = { k, offsets, score }
    }

    const out: Record<string, BoardBox> = {}
    if (start !== undefined) out[start] = { x: 0, y: 0 }
    bands.forEach((b, i) => {
        const o = best!.offsets[i]
        for (const c of b.cells) out[c.id] = { x: o.x + c.col * colW, y: o.y + c.row * rowH }
    })
    return out
}
