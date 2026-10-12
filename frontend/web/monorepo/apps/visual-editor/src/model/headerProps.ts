/**
 * The header extras authorable as data (PR #794): the page header keys of a `type: Form` node and
 * the header keys of a `type: AppShell`. Pure helpers the Properties panel and the app-shell editor
 * edit them with — every function returns a NEW value (never mutates), and an edit that leaves a
 * list or a group empty returns `''`, which the editors' write path reads as "remove the key" (a
 * file never keeps an empty `badges: []` or `peerNav: {}` behind). Keys the editor does not model
 * (a hand-written `description` on a badge, a future attribute) are carried over untouched.
 *
 * The YAML itself is written by the editor's minimal-edit path (yamlPreserve), never re-formatted.
 */

export type Obj = Record<string, unknown>

/** The keys of a `type: Form` page header the Properties panel edits in its "Page header" section. */
export const PAGE_HEADER_KEYS = ['overline', 'titlePlaceholder', 'timestamp', 'badges', 'kpis', 'peerNav',
    'recordSwitcher', 'banners', 'fabs'] as const

/** The header keys of a `type: AppShell` the app-shell editor edits in "Header extras". */
export const APP_HEADER_KEYS = ['contextSelectors', 'headerActions', 'notifications', 'globalSearch'] as const

/** Banner themes, upper case (the wire enum; NONE is not offered — a banner without a theme is INFO). */
export const BANNER_THEMES = ['INFO', 'SUCCESS', 'WARNING', 'DANGER'] as const

/** Header badge colours: the Lumo badge themes `@BadgeInHeader(color)` takes. */
export const BADGE_COLORS = ['normal', 'success', 'error', 'warning', 'contrast'] as const

/** FAB / button styles (`buttonStyle`; a FAB without one is `primary`). */
export const BUTTON_STYLES = ['primary', 'secondary', 'tertiary', 'error', 'success', 'contrast'] as const

/** A blank field value — removed from the YAML instead of written as `""` / `false`. */
export function isBlank(v: unknown): boolean {
    return v === undefined || v === null || v === '' || v === false || (Array.isArray(v) && v.length === 0)
}

export function asObj(v: unknown): Obj {
    return v && typeof v === 'object' && !Array.isArray(v) ? (v as Obj) : {}
}

export function asList(v: unknown): Obj[] {
    return Array.isArray(v) ? v.map(asObj) : []
}

/** `obj` with `patch` applied: blank values remove their key. `''` when nothing is left. */
export function objectWith(obj: unknown, patch: Obj): Obj | '' {
    const out: Obj = { ...asObj(obj) }
    for (const [k, v] of Object.entries(patch)) {
        if (isBlank(v)) delete out[k]
        else out[k] = v
    }
    return Object.keys(out).length ? out : ''
}

/** The list with item `i` patched (blank values remove keys; an item left empty stays — `{}` is
 *  a fresh row the author is still filling, removed only by its ✕). */
export function listWith(list: unknown, i: number, patch: Obj): Obj[] {
    return asList(list).map((item, j) => (j === i ? (objectWith(item, patch) || {}) : item))
}

/** The list with item `i` replaced by `item` outright (a mode switch drops keys a patch would keep). */
export function listSet(list: unknown, i: number, item: Obj | ''): Obj[] {
    return asList(list).map((x, j) => (j === i ? (item || {}) : x))
}

export function listAdd(list: unknown, seed: Obj): Obj[] {
    return [...asList(list), { ...seed }]
}

/** The list without item `i`; `''` when that was the last one (the key goes away). */
export function listRemove(list: unknown, i: number): Obj[] | '' {
    const out = asList(list).filter((_, j) => j !== i)
    return out.length ? out : ''
}

export function listMove(list: unknown, i: number, delta: number): Obj[] {
    const out = asList(list)
    const j = i + delta
    if (j < 0 || j >= out.length) return out
    ;[out[i], out[j]] = [out[j], out[i]]
    return out
}

// --- options: `value=Label, …` (the one-line options editor the Properties panel already uses) ---

/** `a=Alpha, b` → [{value:'a', label:'Alpha'}, {value:'b', label:'b'}]; '' clears. */
export function parseOptions(text: string): Obj[] | '' {
    const out = text.split(',').map((s) => s.trim()).filter(Boolean).map((pair) => {
        const eq = pair.indexOf('=')
        const value = eq >= 0 ? pair.slice(0, eq).trim() : pair
        const label = eq >= 0 ? pair.slice(eq + 1).trim() : pair
        return { value, label }
    })
    return out.length ? out : ''
}

/** The inverse of {@link parseOptions}: `value=Label` (just `value` when the label repeats it). */
export function formatOptions(options: unknown): string {
    return asList(options).map((o) => (o.label != null && o.label !== o.value ? `${o.value}=${o.label}` : String(o.value ?? ''))).join(', ')
}

// --- "options OR a source": the record switcher and the app context selectors ---

export type OptionsMode = 'options' | 'source'

/** Where the entries come from: a REST source when `optionsSource` is set, else the listed options. */
export function optionsModeOf(v: unknown): OptionsMode {
    return asObj(v).optionsSource ? 'source' : 'options'
}

/**
 * Switch between listed options and a source: the other one is dropped (they are exclusive). The
 * new source starts as `seed` — the panel passes the project's first named source, so the file never
 * holds a `ref` naming nothing.
 */
export function withOptionsMode(v: unknown, mode: OptionsMode, seed: Obj = {}): Obj | '' {
    const o = asObj(v)
    if (mode === optionsModeOf(o)) return Object.keys(o).length ? o : ''
    return mode === 'source' ? objectWith(o, { options: undefined, optionsSource: { ...seed } })
        : objectWith(o, { optionsSource: undefined })
}

// --- record switcher: a pick navigates to `route`, or (without one) dispatches `actionId` ---

export type SwitcherNav = 'route' | 'action'

export function switcherNavOf(v: unknown): SwitcherNav {
    return asObj(v).actionId && !asObj(v).route ? 'action' : 'route'
}

/** Switch what a pick does. Running an action starts from the runtime's default id, `_switchRecord`
 *  (without an id the switcher would read as navigating again). */
export function withSwitcherNav(v: unknown, nav: SwitcherNav): Obj | '' {
    return objectWith(v, nav === 'route' ? { actionId: undefined }
        : { route: undefined, actionId: asObj(v).actionId || '_switchRecord' })
}

// --- header actions: a tree (children = a dropdown, only the leaves dispatch) ---

export type ActionPath = number[]
export type HeaderActionKind = 'route' | 'action' | 'menu'

/** What a header action does: a dropdown (has children), navigates (route), or runs an action. */
export function headerActionKind(a: unknown): HeaderActionKind {
    const o = asObj(a)
    if (Array.isArray(o.children) && o.children.length) return 'menu'
    return o.actionId && !o.route ? 'action' : 'route'
}

/** Apply `fn` to the action at `path` of a header-action tree; returns the new tree. */
function mapAt(list: unknown, path: ActionPath, fn: (a: Obj) => Obj | null): Obj[] {
    const [i, ...rest] = path
    const out: Obj[] = []
    asList(list).forEach((a, j) => {
        if (j !== i) { out.push(a); return }
        if (!rest.length) {
            const r = fn(a)
            if (r) out.push(r)
            return
        }
        const children = mapAt(a.children, rest, fn)
        out.push(objectWith(a, { children }) || {})
    })
    return out
}

export function headerActionWith(list: unknown, path: ActionPath, patch: Obj): Obj[] {
    return mapAt(list, path, (a) => objectWith(a, patch) || {})
}

/** Switch what an action does: route and actionId are exclusive; a menu keeps its children only.
 *  An action starts as `seedAction` (the panel passes the first one it offers). */
export function headerActionKindWith(list: unknown, path: ActionPath, kind: HeaderActionKind, seedAction = 'action'): Obj[] {
    return mapAt(list, path, (a) => {
        if (kind === 'menu') {
            const children = asList(a.children)
            return objectWith(a, { route: undefined, actionId: undefined,
                children: children.length ? children : [{ label: 'Item' }] }) || {}
        }
        const patch: Obj = { children: undefined }
        if (kind === 'route') patch.actionId = undefined
        else { patch.route = undefined; patch.actionId = a.actionId || seedAction }
        return objectWith(a, patch) || {}
    })
}

/** Add an action at the top level (`parent = []`) or as a child of the action at `parent`. */
export function headerActionAdd(list: unknown, parent: ActionPath, seed: Obj = { label: 'Action' }): Obj[] {
    if (!parent.length) return listAdd(list, seed)
    return mapAt(list, parent, (a) => ({ ...a, children: listAdd(a.children, seed) }))
}

/** Remove the action at `path`; a dropdown left without children loses the key. `''` when empty. */
export function headerActionRemove(list: unknown, path: ActionPath): Obj[] | '' {
    if (path.length === 1) return listRemove(list, path[0])
    const parent = path.slice(0, -1)
    const idx = path[path.length - 1]
    const out = mapAt(list, parent, (a) => objectWith(a, { children: listRemove(a.children, idx) }) || {})
    return out.length ? out : ''
}
