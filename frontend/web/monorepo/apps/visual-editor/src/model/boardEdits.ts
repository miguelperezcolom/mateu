import { isMap, isSeq, isScalar, type Node } from 'yaml'
import type { ProjectFile } from './projectIndex'
import { isRoutesYaml, parseRoutes, flattenRoutes } from './routesModel'
import { isMountYaml } from './mountModel'
import { buildMountGraph, matchRoute, type EdgeVia, type MountGraph, type NavEdge, type Screen } from './mountGraph'
import {
    appendToList, docOf, nodeAtPath, removeKey, removeListItem, replaceScalar, setKey, stringAt, walkNodes, type Path,
} from './yamlEdit'

/**
 * The board as an EDITING surface for the mount's navigation. Every operation here turns one intent
 * ("create the missing screen", "add a menu entry to it", "delete this arrow") into the file writes
 * that say it — minimal text edits of the files that declare it (yamlEdit.ts), plus whole new files
 * for a new screen — and nothing else: the board is re-derived from the files afterwards
 * (mountGraph.ts), so it never becomes a second source of truth.
 *
 * Pure: files in, writes out. The editor applies the writes through its host (the IDE's documents,
 * or the browser's in-memory project) and keeps the inverse writes for undo.
 */

/** A file the board writes: `content: null` deletes it (only ever a file the board created). */
export interface FileWrite { path: string; content: string | null }

/** The writes, plus the inverse writes that undo them (computed against the files as they were). */
export interface BoardChange { label: string; writes: FileWrite[]; undo: FileWrite[] }

/** A page template the board can create a screen from (the gallery's, see templates.ts). */
export interface ScreenTemplate { id: string; label: string; yaml: string }

const norm = (p: string) => (p ?? '').replace(/\\/g, '/').replace(/^\/+/, '').replace(/^specs\/ui\//, '')

function textOf(files: ProjectFile[], path: string): string | undefined {
    return files.find((f) => norm(f.path) === norm(path))?.content
}

/** Package writes with their inverse, against `files` as they are now. */
export function change(files: ProjectFile[], label: string, writes: FileWrite[]): BoardChange {
    const seen = new Set<string>()
    const undo: FileWrite[] = []
    for (const w of writes) {
        if (seen.has(norm(w.path))) continue
        seen.add(norm(w.path))
        undo.push({ path: w.path, content: textOf(files, w.path) ?? null })
    }
    return { label, writes, undo: undo.reverse() }
}

/** The files after the writes (the board's own view until the host pushes the files again). */
export function applyWrites(files: ProjectFile[], writes: FileWrite[]): ProjectFile[] {
    let out = [...files]
    for (const w of writes) {
        const i = out.findIndex((f) => norm(f.path) === norm(w.path))
        if (w.content === null) { if (i >= 0) out = out.filter((_, j) => j !== i); continue }
        if (i >= 0) out[i] = { ...out[i], content: w.content }
        else out.push({ path: w.path, content: w.content })
    }
    return out
}

// --- routes ---

/** The routes file new routes go to: `routes.yaml` if there is one, else the first routes file. */
export function routesFileOf(files: ProjectFile[]): string | undefined {
    const routes = files.filter((f) => isRoutesYaml(f.content))
    return (routes.find((f) => /(^|\/)routes\.ya?ml$/.test(norm(f.path))) ?? routes[0])?.path
}

/** Every absolute route the mount declares. */
export function declaredRoutes(files: ProjectFile[]): string[] {
    return files.filter((f) => isRoutesYaml(f.content)).flatMap((f) => flattenRoutes(parseRoutes(f.content).routes).map((r) => r.absolute))
}

/**
 * The route a navigation target asks for: `people/${row.id}` → `people/:id` (the placeholder's last
 * name becomes the parameter), a leading slash and the query dropped.
 */
export function routeOfTarget(target: string): string {
    const clean = target.split('?')[0].replace(/^\/+|\/+$/g, '')
    return clean.replace(/\$\{([^}]{0,200})\}/g, (_m, expr: string) => ':' + (String(expr).split('.').pop()!.replace(/[^\w]/g, '') || 'id'))
}

/** What a link to `route` is written as from a `row` (`${row.id}`) or anywhere else (`${state.id}`). */
export function targetOfRoute(route: string, via: 'row' | 'other'): string {
    return route.replace(/:(\w+)/g, (_m, p: string) => (via === 'row' ? '${row.' : '${state.') + p + '}')
}

/** A file name for a new screen: `orders/:id` → `orders-id.yaml`, unique among `files`. */
export function fileForRoute(route: string, files: ProjectFile[]): string {
    const base = (route.replace(/:(\w+)/g, '$1').replace(/[^\w/-]+/g, '-').replace(/\//g, '-').replace(/^-+|-+$/g, '') || 'home').toLowerCase()
    const taken = new Set(files.map((f) => norm(f.path)))
    let name = `${base}.yaml`
    for (let n = 2; taken.has(name); n++) name = `${base}-${n}.yaml`
    return name
}

const ROUTES_HEADER = '# Route registry of a mount. Each entry binds a route (relative to the mount) to a layout under specs/ui.\n'

/** Append `route → layout` to the mount's routes file (creating one, registered in the mount, if there is none). */
export function addRouteWrites(files: ProjectFile[], route: string, layout: string): FileWrite[] {
    const r = route.trim().replace(/^\/+|\/+$/g, '')
    if (declaredRoutes(files).includes(r)) throw new Error(`The route "${r || '/'}" already exists`)
    const routesPath = routesFileOf(files)
    if (routesPath) {
        return [{ path: routesPath, content: appendToList(textOf(files, routesPath)!, [], 'routes', { route: r, layout }) }]
    }
    const writes: FileWrite[] = [{ path: 'routes.yaml', content: `${ROUTES_HEADER}type: Routes\nroutes:\n  - route: ${JSON.stringify(r)}\n    layout: ${layout}\n` }]
    const mount = files.find((f) => isMountYaml(f.content))
    if (mount) writes.push({ path: mount.path, content: appendToList(mount.content, [], 'routes', 'routes.yaml') })
    return writes
}

/** "Add route…" on a page no route serves. */
export function giveRoute(files: ProjectFile[], file: string, route: string): BoardChange {
    return change(files, `Add route /${route}`, addRouteWrites(files, route, norm(file)))
}

/**
 * Create a screen: its definition from a template and, unless the route is already declared (a route
 * whose definition file is missing), its route entry — in one step.
 */
export function createScreen(files: ProjectFile[], route: string, template: ScreenTemplate, file?: string): BoardChange {
    const r = route.trim().replace(/^\/+|\/+$/g, '')
    const declared = flattenAll(files).find((x) => x.absolute === r)
    const path = norm(file ?? declared?.definition ?? fileForRoute(r, files))
    if (textOf(files, path) !== undefined) throw new Error(`${path} already exists`)
    const writes: FileWrite[] = [{ path, content: template.yaml }]
    if (!declared) writes.push(...addRouteWrites(files, r, path))
    else if (!declared.definition) throw new Error(`The route "${r}" is served by a view model`)
    return change(files, `Create /${r}`, writes)
}

function flattenAll(files: ProjectFile[]) {
    return files.filter((f) => isRoutesYaml(f.content)).flatMap((f) => flattenRoutes(parseRoutes(f.content).routes))
}

// --- the navigation a file declares, located for editing ---

/** One navigation a file declares: where its target is written, and what removing it removes. */
export interface Decl {
    via: EdgeVia
    target: string
    label: string
    /** The scalar holding the target (`…route`, `…rowRoute`, `…restAction.successRoute`). */
    targetPath: Path
    /** What deleting the arrow removes: a list item (the menu entry, the button, the flow step) or a key. */
    remove: { item: Path } | { key: Path }
}

/** Every navigation `text` declares, in document order — the same reading as mountGraph's. */
export function declarationsIn(text: string, isShell: boolean): Decl[] {
    let doc
    try { doc = docOf(text) } catch { return [] }
    const out: Decl[] = []
    const ownLabel = (n: Node | undefined) => (n ? stringAt(n, 'label')?.trim() || undefined : undefined)
    walkNodes(doc, (node, path) => {
        if (!isMap(node)) return
        // what the user clicks: the nearest label on the way down (the node's own first)
        let label: string | undefined
        for (let i = path.length; i >= 0 && !label; i--) label = ownLabel(nodeAtPath(doc, path.slice(0, i)))
        // as mountGraph reads it: everything in a shell is its menu, and so is anything under a `menu` key
        const inMenu = isShell || path.includes('menu')
        let actionId: string | undefined
        for (let i = path.length - 1; i >= 0; i--) {
            if (path[i] === 'restAction' || path[i] === 'steps') { actionId = stringAt(nodeAtPath(doc, path.slice(0, i))!, 'id'); break }
        }
        const type = stringAt(node, 'type')
        const route = stringAt(node, 'route')
        if (type === 'RouteLink' && route !== undefined) {
            out.push({ via: inMenu ? 'menu' : 'link', target: route, label: label ?? route, targetPath: [...path, 'route'], remove: { item: enclosingItem(path) } })
        }
        if (type === 'Navigate' && route !== undefined) {
            out.push({ via: 'flow', target: route, label: actionId ? `${actionId} flow` : 'flow', targetPath: [...path, 'route'], remove: { item: enclosingItem(path) } })
        }
        const row = stringAt(node, 'rowRoute')
        if (row !== undefined) out.push({ via: 'row', target: row, label: 'row click', targetPath: [...path, 'rowRoute'], remove: { key: [...path, 'rowRoute'] } })
        const save = stringAt(node, 'successRoute')
        if (save !== undefined) {
            out.push({ via: 'save', target: save, label: `after ${actionId ?? 'save'}`, targetPath: [...path, 'successRoute'], remove: { key: [...path, 'successRoute'] } })
        }
    })
    return out
}

/** The list item a node belongs to: itself when it is one, else its nearest ancestor that is (the button of an `actionable`). */
function enclosingItem(path: Path): Path {
    for (let i = path.length; i > 0; i--) if (typeof path[i - 1] === 'number') return path.slice(0, i)
    return path
}

/** The declarations behind a board arrow (same file, kind, label, landing on the same screen). */
export function declsOfEdge(files: ProjectFile[], graph: MountGraph, edge: NavEdge): { file: string; decl: Decl }[] {
    const from = graph.screens.find((s) => s.id === edge.from)
    if (!from?.file) return []
    const text = textOf(files, from.file)
    if (text === undefined) return []
    const patterns = graph.screens.filter((s) => s.route !== undefined).map((s) => s.route!)
    return declarationsIn(text, from.kind === 'shell')
        .filter((d) => d.via === edge.via && d.label === edge.label && matchRoute(d.target, patterns) === edge.to)
        .map((decl) => ({ file: from.file!, decl }))
}

/** Delete an arrow: the menu entry, the button, the flow step, or the `rowRoute` / `successRoute`. */
export function deleteEdge(files: ProjectFile[], graph: MountGraph, edge: NavEdge): BoardChange {
    const found = declsOfEdge(files, graph, edge)
    if (!found.length) throw new Error('This arrow is not declared by a file the board can edit (a nested route is edited in its routes file)')
    let text = textOf(files, found[0].file)!
    // from the last to the first, so the earlier ones keep their place
    for (const { decl } of [...found].reverse()) {
        text = 'item' in decl.remove ? removeListItem(text, decl.remove.item.slice(0, -1), decl.remove.item[decl.remove.item.length - 1] as number)
            : removeKey(text, decl.remove.key.slice(0, -1), String(decl.remove.key[decl.remove.key.length - 1]))
    }
    return change(files, `Delete ${edge.label} arrow`, [{ path: found[0].file, content: text }])
}

/** Point an arrow at another screen: only the target text changes. */
export function retargetEdge(files: ProjectFile[], graph: MountGraph, edge: NavEdge, to: Screen): BoardChange {
    if (to.route === undefined) throw new Error('That screen has no route to point at — give it one first')
    const found = declsOfEdge(files, graph, edge)
    if (!found.length) throw new Error('This arrow is not declared by a file the board can edit')
    let text = textOf(files, found[0].file)!
    for (const { decl } of found) text = replaceScalar(text, decl.targetPath, targetOfRoute(to.route, decl.via === 'row' ? 'row' : 'other'))
    return change(files, `Point ${edge.label} at /${to.route}`, [{ path: found[0].file, content: text }])
}

// --- drawing a new arrow ---

export type ArrowKind = 'menu' | 'button' | 'row' | 'save'

/** Where a new arrow of a kind can go: menu groups, button slots, REST actions. */
export interface ArrowPlace { id: string; label: string }

const LISTINGS = new Set(['Listing', 'Crud', 'Crudl'])

/** The root component of a page and the path to it (`[]`, or `['layout']` for an envelope). */
function rootOf(text: string): { path: Path; type?: string } {
    const doc = docOf(text)
    const layout = nodeAtPath(doc, ['layout'])
    if (layout && isMap(layout)) return { path: ['layout'], type: stringAt(layout, 'type') }
    return { path: [], type: doc.contents ? stringAt(doc.contents as Node, 'type') : undefined }
}

/** The arrows a screen can start, by what it is: a shell has a menu, a listing rows, a form a save… */
export function arrowKindsFor(files: ProjectFile[], screen: Screen): ArrowKind[] {
    if (!screen.file) return []
    const text = textOf(files, screen.file)
    if (text === undefined) return []
    if (screen.kind === 'shell') return ['menu']
    const kinds: ArrowKind[] = []
    if (buttonPlaces(text).length) kinds.push('button')
    let type: string | undefined
    try { type = rootOf(text).type } catch { return kinds }
    if (type && LISTINGS.has(type)) kinds.push('row')
    if (restActions(text).length) kinds.push('save')
    return kinds
}

/** The places an arrow of `kind` from `screen` can be written. */
export function arrowPlaces(files: ProjectFile[], screen: Screen, kind: ArrowKind): ArrowPlace[] {
    const text = screen.file ? textOf(files, screen.file) : undefined
    if (text === undefined) return []
    if (kind === 'menu') return menuGroups(text)
    if (kind === 'button') return buttonPlaces(text)
    if (kind === 'save') return restActions(text).map((id) => ({ id, label: `after ${id}` }))
    return [{ id: 'rowRoute', label: 'row click' }]
}

/** The shell's menu: its top level and every `Menu` group (path ids, labels with their nesting). */
export function menuGroups(text: string): ArrowPlace[] {
    let doc
    try { doc = docOf(text) } catch { return [] }
    const out: ArrowPlace[] = [{ id: 'menu', label: 'Menu (top level)' }]
    walkNodes(doc, (node, path) => {
        if (!isMap(node) || stringAt(node, 'type') !== 'Menu' || !path.includes('menu')) return
        const names: string[] = []
        for (let i = 1; i <= path.length; i++) {
            const n = nodeAtPath(doc, path.slice(0, i))
            if (n && isMap(n) && stringAt(n, 'type') === 'Menu') names.push(stringAt(n, 'label') ?? '(group)')
        }
        out.push({ id: JSON.stringify([...path, 'submenu']), label: 'Menu › ' + names.join(' › ') })
    })
    return out
}

/** Where a button can go on a page: a Form's buttons/toolbar, a listing's toolbar, a layout's content. */
export function buttonPlaces(text: string): ArrowPlace[] {
    let root
    try { root = rootOf(text) } catch { return [] }
    if (root.type === 'Form') return [{ id: 'buttons', label: 'Form buttons' }, { id: 'toolbar', label: 'Toolbar' }]
    if (root.type && LISTINGS.has(root.type)) return [{ id: 'toolbar', label: 'Toolbar' }]
    const doc = docOf(text)
    const node = nodeAtPath(doc, root.path) ?? (doc.contents as Node | null)
    const content = node && isMap(node) ? node.get('content', true) : undefined
    if (root.type && (/Layout$/.test(root.type) || root.type === 'Div' || isSeq(content))) return [{ id: 'content', label: 'Page content (end)' }]
    return []
}

/** The ids of the page's REST actions (what an "after save" arrow hangs on). */
export function restActions(text: string): string[] {
    let doc
    try { doc = docOf(text) } catch { return [] }
    const actions = nodeAtPath(doc, ['actions'])
    if (!isSeq(actions)) return []
    return actions.items.filter((a) => isMap(a) && a.get('restAction', true) && stringAt(a as Node, 'id')).map((a) => stringAt(a as Node, 'id')!)
}

/**
 * Draw an arrow from `from` to `to`: a menu entry in the shell (in the chosen group), a button with a
 * RouteLink on the page (in the chosen slot), the listing's `rowRoute`, or a REST action's
 * `successRoute`.
 */
export function addArrow(files: ProjectFile[], from: Screen, to: Screen, kind: ArrowKind, place: string, label: string): BoardChange {
    if (!from.file) throw new Error('That screen has no file of its own')
    if (to.route === undefined) throw new Error('The target screen has no route — give it one first')
    const text = textOf(files, from.file)
    if (text === undefined) throw new Error(`${from.file} is not in the mount`)
    const name = label.trim() || to.title || to.route || 'Home'
    let out: string
    if (kind === 'menu') {
        const groupPath: Path = place === 'menu' ? [] : (JSON.parse(place) as Path)
        const key = place === 'menu' ? 'menu' : String(groupPath[groupPath.length - 1])
        out = appendToList(text, place === 'menu' ? [] : groupPath.slice(0, -1), key, { type: 'RouteLink', label: name, route: targetOfRoute(to.route, 'other') })
    } else if (kind === 'button') {
        const root = rootOf(text)
        out = appendToList(text, root.path, place, { type: 'Button', label: name, actionable: { type: 'RouteLink', route: targetOfRoute(to.route, 'other') } })
    } else if (kind === 'row') {
        out = setKey(text, rootOf(text).path, 'rowRoute', targetOfRoute(to.route, 'row'))
    } else {
        const doc = docOf(text)
        const actions = nodeAtPath(doc, ['actions'])
        const index = isSeq(actions) ? actions.items.findIndex((a) => isMap(a) && stringAt(a as Node, 'id') === place) : -1
        if (index < 0) throw new Error(`No REST action "${place}" on this page`)
        out = setKey(text, ['actions', index, 'restAction'], 'successRoute', targetOfRoute(to.route, 'other'))
    }
    const what = kind === 'menu' ? 'menu entry' : kind === 'button' ? 'button' : kind === 'row' ? 'row click' : 'save landing'
    return change(files, `Add ${what} → /${to.route}`, [{ path: from.file, content: out }])
}

/** The board re-derived from the files after a change (what the tests and the board both read). */
export function graphAfter(files: ProjectFile[], c: BoardChange): MountGraph {
    return buildMountGraph(applyWrites(files, c.writes))
}

export { isScalar }
