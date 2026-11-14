import { interpolate } from '@infra/ui/interpolation.ts'

/**
 * What the user sees in this tab, as compact JSON for an agent — the answer to a live UI push
 * `describe-screen` query (`mateu_get_session_screen`, conformance/mcp/README.md "Reading and
 * operating the screen the user has open"). Pure: built from the WIRE model the tab rendered (each
 * on-screen component's tree, the state its widgets show, the listings' pages) and nothing else. It
 * never adds what the wire did not send: a field the server stripped for this user is simply not
 * there; a field a client rule hid is left out; a password shows as dots. Long text and lists are
 * capped and say so (`truncated`).
 *
 * The shape is the desktop app's `mateu_get_screen` (intellij-plugin `mcp/ScreenSummary.kt`), key
 * for key, so an agent reads a browser tab and the desktop app the same way.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

export const MAX_TEXT = 500
export const MAX_LIST = 50
export const MAX_OPTIONS = 50
export const MAX_ROWS = 50
export const MAX_FIELDS = 200
export const MAX_ACTIONS = 200
export const MAX_MESSAGES = 10

/** The row action that opens a listing's row, as a click on it does. */
export const OPEN_ROW_ACTION = 'open-row'

/** What one listing on screen holds besides its wire metadata: its own state and the page it painted. */
export interface ListingView {
    state?: Record<string, unknown>
    /** `{content, totalElements, pageNumber, pageSize}` */
    page?: any
}

/** One rendered view: its tree, the state its widgets show, and what came with it. */
export interface SummaryView {
    content: any
    state?: Record<string, unknown>
    /** fieldId → the first error message shown under it */
    fieldErrors?: Record<string, string>
    /** fieldId → attributes a client rule set on it (`hidden`, `disabled`) */
    fieldAttributes?: Record<string, Record<string, unknown>>
    /** listing id → its state and page */
    listings?: Record<string, ListingView>
    /**
     * A nested ServerSide component is described by its OWN view (with its live state), not as
     * part of this one: the browser renders each as an element of its own.
     */
    ownViewsForNested?: boolean
}

export interface SummaryMessage { variant: string, title?: string, text: string }

export interface SummaryInput {
    route: string
    windowTitle?: string
    /** the page: one or more views (the screen and its embedded islands), in DOM order */
    views: SummaryView[]
    /** an open Drawer/Dialog in front of the page: its wire component and the views it renders */
    overlay?: { component: any, views: SummaryView[] }
    /** the app shell's metadata (`App`): context selectors, header actions, the user */
    app?: any
    appState?: Record<string, unknown>
    messages?: SummaryMessage[]
}

/** Keys never walked as part of what is drawn (data, plumbing, or summarised on their own). */
const SKIP = new Set([
    'initialData', 'state', 'data', 'menu', 'options', 'columns', 'filters', 'triggers', 'rules',
    'validations', 'actions', 'restSources', 'actionCatalogue', 'contextSelectors', 'contextActions',
    'shortcuts', 'headerValues', 'editorOptions', 'valueLabels', 'tones', 'optionsSource', 'rowsSource',
    'restAction', 'attributes', 'remoteCoordinates', 'resolved', 'server',
])

/** Actions the renderer runs on its own (a search box, a pager): not options of their own. */
const INTERNAL_ACTIONS = new Set(['search', '__restdata__', '__restfetch__', 'nextPage', 'prevPage', 'update-row'])

const SECRET_KEYS = ['token', 'secret', 'password', 'credential']

class Notes {
    private readonly set = new Set<string>()
    add(path: string) { this.set.add(path) }
    get notes(): string[] { return [...this.set].sort() }
}

const text = (o: any, key: string, fallback = ''): string => {
    const v = o?.[key]
    if (v === null || v === undefined) return fallback
    if (typeof v === 'object') return fallback
    return String(v)
}
const bool = (o: any, key: string): boolean => o?.[key] === true
const isObject = (v: unknown): v is Record<string, any> => !!v && typeof v === 'object' && !Array.isArray(v)

const interp = (s: string, state: Record<string, unknown>, appState: Record<string, unknown>): string =>
    s.includes('${') ? (interpolate(s, state as any, {} as any, { appState }) ?? s) : s

function capText(s: string, path: string, notes: Notes): string {
    if (s.startsWith('data:')) {
        notes.add(path)
        return `[${s.split(',')[0].split(';')[0]} data, ${s.length} characters]`
    }
    if (s.length <= MAX_TEXT) return s
    notes.add(path)
    return s.substring(0, MAX_TEXT) + '…'
}

function cap(value: unknown, path: string, notes: Notes, depth = 0): unknown {
    if (value === null || value === undefined) return null
    if (typeof value === 'string') return capText(value, path, notes)
    if (Array.isArray(value)) {
        if (value.length > MAX_LIST) notes.add(path)
        return value.slice(0, MAX_LIST).map(v => cap(v, path, notes, depth + 1))
    }
    if (typeof value === 'object') {
        if (depth >= 4) { notes.add(path); return '{…}' }
        const entries = Object.entries(value as object)
        if (entries.length > MAX_LIST) notes.add(path)
        const out: Record<string, unknown> = {}
        for (const [k, v] of entries.slice(0, MAX_LIST)) out[k] = cap(v, path, notes, depth + 1)
        return out
    }
    if (typeof value === 'function') return null
    return value
}

interface Acc {
    root?: any
    stopAtNested?: boolean
    header?: any
    fields: Map<string, any>
    buttons: any[]
    crudNodes: { node: any, meta: any }[]
    declared: Set<string>
    initialData: Map<string, unknown>
}

function walk(n: any, acc: Acc, inherited: any, seen: Set<any>): void {
    if (!n || typeof n !== 'object' || seen.has(n)) return
    seen.add(n)
    if (Array.isArray(n)) { n.forEach(c => walk(c, acc, inherited, seen)); return }
    let initial = inherited
    const type = text(n, 'type')
    if (type === 'ServerSide') {
        if (acc.stopAtNested && n !== acc.root) return
        if (isObject(n.initialData)) initial = n.initialData
        for (const a of Array.isArray(n.actions) ? n.actions : []) if (text(a, 'id')) acc.declared.add(text(a, 'id'))
    }
    if (type === 'FormField') {
        const id = text(n, 'fieldId')
        if (id && !acc.fields.has(id)) {
            acc.fields.set(id, n)
            if (initial && id in initial && !acc.initialData.has(id)) acc.initialData.set(id, initial[id])
        }
    } else if (type === 'Button') {
        // a button group's children are listed under it, not again on their own
        acc.buttons.push(n)
        return
    } else if (type === 'Page' || type === 'Form') {
        if (!acc.header) acc.header = n
        for (const a of Array.isArray(n.actions) ? n.actions : []) if (text(a, 'id')) acc.declared.add(text(a, 'id'))
    }
    const meta = n.metadata
    if (isObject(meta)) {
        if (text(meta, 'type') === 'Crud') {
            acc.crudNodes.push({ node: n, meta })
            // its toolbar is the listing's: summarised with it
            walkChildren(meta, acc, initial, seen, new Set(['toolbar']))
        } else {
            walk(meta, acc, initial, seen)
        }
    }
    walkChildren(n, acc, initial, seen, new Set(['metadata']))
}

function walkChildren(n: any, acc: Acc, initial: any, seen: Set<any>, skipAlso: Set<string>): void {
    for (const [k, v] of Object.entries(n)) {
        if (SKIP.has(k) || skipAlso.has(k)) continue
        if (v && typeof v === 'object') walk(v, acc, initial, seen)
    }
}

function action(b: any, state: Record<string, unknown>, appState: Record<string, unknown>): Record<string, unknown> | undefined {
    const id = text(b, 'actionId')
    const route = text(b, 'route')
    const label = interp(text(b, 'label'), state, appState)
    const children = Array.isArray(b?.children) && b.children.length ? b.children : undefined
    if (!id && !route && !children) return undefined
    const out: Record<string, unknown> = { id: id || route || label }
    if (label) out.label = label
    out.enabled = !bool(b, 'disabled')
    if (route) out.navigatesTo = route
    if (bool(b, 'rowsSelectedRequired')) out.needsSelectedRows = true
    if (children) {
        out.children = children
            .map((c: any) => action(c?.metadata && text(c, 'type') !== 'Button' ? c.metadata : c, state, appState))
            .filter(Boolean)
    }
    return out
}

function isSecret(meta: any): boolean {
    return text(meta, 'stereotype').toLowerCase() === 'password' || text(meta, 'dataType').toLowerCase() === 'password'
}

function field(id: string, meta: any, view: SummaryView, acc: Acc, attrs: Record<string, unknown>,
               state: Record<string, unknown>, appState: Record<string, unknown>, notes: Notes, path: string): Record<string, unknown> {
    const out: Record<string, unknown> = { id }
    const label = text(meta, 'label')
    if (label) out.label = interp(label, state, appState)
    out.type = text(meta, 'dataType')
    const stereotype = text(meta, 'stereotype')
    if (stereotype && stereotype !== 'regular') out.stereotype = stereotype
    if (bool(meta, 'required')) out.required = true
    if (bool(meta, 'readOnly') || attrs.disabled === true) out.readOnly = true
    const help = text(meta, 'description')
    if (help) out.help = capText(help, path, notes)
    const raw = view.state && id in view.state ? view.state[id] : acc.initialData.get(id)
    if (isSecret(meta)) {
        out.value = raw === null || raw === undefined || String(raw) === '' ? '' : '••••••'
    } else {
        out.value = cap(raw, path, notes)
    }
    const options = Array.isArray(meta?.options) ? meta.options : []
    if (options.length) {
        out.options = options.slice(0, MAX_OPTIONS).map((o: any) => ({ value: text(o, 'value'), label: text(o, 'label', text(o, 'value')) }))
        if (options.length > MAX_OPTIONS) notes.add(`${path}.options`)
    } else if (meta?.optionsSource) {
        out.optionsFrom = 'a source the renderer fetches'
    }
    const error = view.fieldErrors?.[id]
    if (error) out.error = error
    return out
}

function cellValue(cell: any, col: any, path: string, notes: Notes): unknown {
    // a status / link cell is an object: what it shows is its text
    if (isObject(cell)) {
        for (const k of ['message', 'text', 'label', 'value']) {
            const v = cell[k]
            if (v !== null && v !== undefined && typeof v !== 'object') return capText(String(v), path, notes)
        }
    }
    if (cell !== null && typeof cell !== 'object' && col && isObject(col.valueLabels)) {
        const l = col.valueLabels[String(cell)]
        if (typeof l === 'string') return l
    }
    return cap(cell, path, notes)
}

function rowActionsOf(cell: any, dataType: string): any[] {
    if (cell === null || cell === undefined) return []
    if (dataType === 'action') return isObject(cell) && 'methodNameInCrud' in cell ? [cell] : []
    return Array.isArray(cell?.actions) ? cell.actions : []
}

function listing(node: any, meta: any, view: SummaryView, appState: Record<string, unknown>,
                 notes: Notes, prefix: string): Record<string, unknown> {
    const id = text(node, 'id') || text(meta, 'id') || 'crud'
    const path = `${prefix}listings.${id}`
    const own = view.listings?.[id] ?? view.listings?.crud
    const state = (own?.state ?? view.state ?? {}) as Record<string, unknown>
    const out: Record<string, unknown> = { id }
    const title = text(meta, 'title')
    if (title) out.title = interp(title, state, appState)
    const columns: any[] = (Array.isArray(meta.columns) ? meta.columns : []).map((c: any) => isObject(c?.metadata) ? c.metadata : c)
    out.columns = columns.map(c => ({ id: text(c, 'id'), label: text(c, 'label') }))
    out.actions = (Array.isArray(meta.toolbar) ? meta.toolbar : [])
        .map((b: any) => action(isObject(b?.metadata) && text(b, 'type') !== 'Button' ? b.metadata : b, state, appState))
        .filter(Boolean)
    if (bool(meta, 'searchable')) out.searchText = state.searchText === undefined || state.searchText === null ? '' : String(state.searchText)
    const filters = Array.isArray(meta.filters) ? meta.filters : []
    if (filters.length) {
        out.filters = filters.map((f0: any) => {
            const f = isObject(f0?.metadata) ? f0.metadata : f0
            const fid = text(f, 'fieldId')
            const o: Record<string, unknown> = { id: fid, label: text(f, 'label', fid), type: text(f, 'dataType') }
            if (state[fid] !== undefined && state[fid] !== null) o.value = cap(state[fid], `${path}.filters.${fid}`, notes)
            if (state[`${fid}_from`] !== undefined) o.from = state[`${fid}_from`]
            if (state[`${fid}_to`] !== undefined) o.to = state[`${fid}_to`]
            const options = Array.isArray(f.options) ? f.options : []
            if (options.length) o.options = options.slice(0, MAX_OPTIONS).map((x: any) => ({ value: text(x, 'value'), label: text(x, 'label') }))
            return o
        })
    }
    if (Array.isArray(state.sort) && state.sort.length) out.sort = state.sort

    // the page it painted
    const page = own?.page
    const rows: any[] = Array.isArray(page?.content) ? page.content : []
    if (page) {
        out.page = Number(page.pageNumber ?? state.page ?? 0) || 0
        out.pageSize = Number(page.pageSize ?? rows.length) || rows.length
        if (typeof page.totalElements === 'number') out.totalElements = page.totalElements
    }
    const colIds = columns.map(c => text(c, 'id')).filter(Boolean)
    out.rows = rows.slice(0, MAX_ROWS).map(row => {
        const r: Record<string, unknown> = {}
        const keys = colIds.length ? colIds : Object.keys(row ?? {}).filter(k => !k.startsWith('_'))
        for (const k of keys) {
            if (!row || !(k in row)) continue
            r[k] = cellValue(row[k], columns.find(c => text(c, 'id') === k), path, notes)
        }
        return r
    })
    if (rows.length > MAX_ROWS) notes.add(`${path}.rows`)

    // what a row offers: opening it, its link columns, its own actions
    const rowActions: Record<string, unknown>[] = []
    const rowOpens = !!text(meta, 'rowRoute') || columns.some(c => text(c, 'actionId') === 'view')
    if (rowOpens) rowActions.push({ id: OPEN_ROW_ACTION, label: 'Open' })
    for (const c of columns) {
        const a = text(c, 'actionId')
        if (a && a !== 'view') rowActions.push({ id: a, label: text(c, 'label') })
    }
    const seen = new Set<string>()
    for (const c of columns.filter(c => ['action', 'actionGroup', 'menu'].includes(text(c, 'dataType')))) {
        for (const row of rows) {
            for (const a of rowActionsOf(row?.[text(c, 'id')], text(c, 'dataType'))) {
                const method = text(a, 'methodNameInCrud')
                if (method && !seen.has(method)) {
                    seen.add(method)
                    rowActions.push({ id: `action-on-row-${method}`, label: text(a, 'label', method) })
                }
            }
        }
    }
    out.rowActions = rowActions
    if (bool(meta, 'rowsSelectionEnabled')) out.rowsSelectable = true
    if (isObject(meta.rowsSource)) {
        // fetched by the renderer from a REST source: its search box and pager are the user's
        out.rowsFrom = 'a REST source the app fetches; search and paging are not offered to agents'
    } else {
        out.builtInActions = page ? ['search', 'nextPage', 'prevPage'] : ['search']
    }
    return out
}

function describeView(into: Record<string, unknown>, views: SummaryView[], extraTrees: any[],
                      appState: Record<string, unknown>, notes: Notes, prefix: string): void {
    const fields: Record<string, unknown>[] = []
    const actions: Record<string, unknown>[] = []
    const errors: Record<string, string> = {}
    const listings: Record<string, unknown>[] = []
    const declared = new Set<string>()
    const seenActions = new Set<string>()
    const seenFields = new Set<string>()
    let headerSet = false
    let fieldsCut = false
    let actionsCut = false
    const all: SummaryView[] = [...extraTrees.map(t => ({ content: t, state: views[0]?.state ?? {} })), ...views]
    for (const view of all) {
        const acc: Acc = { root: view.content, stopAtNested: view.ownViewsForNested, fields: new Map(), buttons: [], crudNodes: [], declared: new Set(), initialData: new Map() }
        if (view.content) walk(view.content, acc, undefined, new Set())
        const state = (view.state ?? {}) as Record<string, unknown>
        if (acc.header && !headerSet) {
            headerSet = true
            const h = acc.header
            const header: Record<string, unknown> = {}
            if (text(h, 'title')) header.title = interp(text(h, 'title'), state, appState)
            if (text(h, 'subtitle')) header.subtitle = interp(text(h, 'subtitle'), state, appState)
            if (text(h, 'overline')) header.overline = interp(text(h, 'overline'), state, appState)
            if (text(h, 'timestamp')) header.timestamp = text(h, 'timestamp')
            if (Array.isArray(h.badges) && h.badges.length) header.badges = h.badges.map((b: any) => interp(text(b, 'text', text(b, 'label')), state, appState))
            if (Array.isArray(h.kpis) && h.kpis.length) header.kpis = h.kpis.map((k: any) => ({ title: interp(text(k, 'title'), state, appState), value: interp(text(k, 'text'), state, appState) }))
            if (Object.keys(header).length) into.header = header
            if (Array.isArray(h.breadcrumbs) && h.breadcrumbs.length) {
                into.breadcrumbs = h.breadcrumbs.map((b: any) => {
                    const o: Record<string, unknown> = { label: text(b, 'text') }
                    if (text(b, 'link')) o.route = text(b, 'link')
                    return o
                })
            }
        }
        for (const [id, meta] of acc.fields) {
            if (seenFields.has(id)) continue
            const attrs = view.fieldAttributes?.[id] ?? {}
            if (attrs.hidden === true) continue
            if (fields.length >= MAX_FIELDS) { fieldsCut = true; break }
            seenFields.add(id)
            fields.push(field(id, meta, view, acc, attrs, state, appState, notes, `${prefix}fields.${id}`))
        }
        for (const [k, v] of Object.entries(view.fieldErrors ?? {})) if (!(k in errors)) errors[k] = v
        for (const b of acc.buttons) {
            if (actions.length >= MAX_ACTIONS) { actionsCut = true; break }
            const a = action(b, state, appState)
            if (!a) continue
            const key = `${a.id}|${a.label ?? ''}`
            if (seenActions.has(key)) continue
            seenActions.add(key)
            actions.push(a)
        }
        acc.declared.forEach(d => declared.add(d))
        for (const { node, meta } of acc.crudNodes) listings.push(listing(node, meta, view, appState, notes, prefix))
    }
    if (fieldsCut) notes.add(`${prefix}fields`)
    if (actionsCut) notes.add(`${prefix}actions`)
    into.fields = fields
    if (Object.keys(errors).length) into.errors = errors
    into.actions = actions
    const buttonIds = new Set(actions.map(a => String(a.id)))
    const others = [...declared].filter(d => !buttonIds.has(d) && !INTERNAL_ACTIONS.has(d) && !d.endsWith('*'))
    if (others.length) into.otherActionIds = others.slice(0, MAX_ACTIONS)
    if (listings.length) into.listings = listings
}

function appContext(app: any, appState: Record<string, unknown>, notes: Notes): unknown[] | undefined {
    const selectors = Array.isArray(app?.contextSelectors) ? app.contextSelectors : []
    if (!selectors.length) return undefined
    return selectors.map((s: any) => {
        const fieldName = text(s, 'fieldName')
        const raw = appState[fieldName]
        const value = raw === undefined || raw === null ? '' : String(raw)
        const options = Array.isArray(s.options) ? s.options : []
        const out: Record<string, unknown> = { field: fieldName, label: text(s, 'label', fieldName), value }
        const picked = options.find((o: any) => text(o, 'value') === value)
        if (picked) out.valueLabel = text(picked, 'label')
        out.options = options.slice(0, MAX_OPTIONS).map((o: any) => ({ value: text(o, 'value'), label: text(o, 'label') }))
        if (options.length > MAX_OPTIONS) notes.add(`appContext.${fieldName}.options`)
        return out
    })
}

function appActions(app: any): unknown[] | undefined {
    const list = Array.isArray(app?.contextActions) ? app.contextActions : []
    if (!list.length) return undefined
    const one = (a: any): Record<string, unknown> => {
        const o: Record<string, unknown> = { id: text(a, 'actionId'), label: text(a, 'label', text(a, 'actionId')) }
        if (text(a, 'route')) o.navigatesTo = text(a, 'route')
        if (Array.isArray(a.children) && a.children.length) o.children = a.children.map(one)
        return o
    }
    return list.map(one)
}

/** The signed-in user, when the shell carries one (`App.user`): never a token or a secret. */
function user(app: any): unknown {
    const u = app?.user
    if (typeof u === 'string') return u
    if (!isObject(u)) return undefined
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(u)) {
        const lower = k.toLowerCase()
        if ((v === null || typeof v !== 'object') && !SECRET_KEYS.some(s => lower.includes(s))) out[k] = v
    }
    return out
}

/** The summary of what the user sees (see the module comment). */
export function buildScreenSummary(input: SummaryInput): Record<string, unknown> {
    const notes = new Notes()
    const appState = input.appState ?? {}
    const out: Record<string, unknown> = {}
    const ui: Record<string, unknown> = {}
    if (text(input.app, 'title')) ui.appTitle = text(input.app, 'title')
    if (Object.keys(ui).length) out.ui = ui
    const u = user(input.app)
    if (u !== undefined) out.user = u
    out.route = input.route
    if (input.windowTitle) out.windowTitle = input.windowTitle
    out.focus = input.overlay ? 'overlay' : 'page'
    const ctx = appContext(input.app, appState, notes)
    if (ctx) out.appContext = ctx
    const actions = appActions(input.app)
    if (actions) out.appActions = actions

    if (input.overlay) {
        const component = input.overlay.component ?? {}
        const meta = component.metadata ?? {}
        const o: Record<string, unknown> = { kind: (text(meta, 'type') || 'overlay').toLowerCase() }
        const state = (input.overlay.views[0]?.state ?? {}) as Record<string, unknown>
        const title = text(meta, 'headerTitle', text(meta, 'title'))
        if (title) o.title = interp(title, state, appState)
        if (text(meta, 'subtitle')) o.subtitle = interp(text(meta, 'subtitle'), state, appState)
        const parts: any[] = []
        // the overlay's own header/footer (its content is rendered by the views below)
        for (const key of ['header', 'footer']) if (isObject(meta[key])) parts.push(meta[key])
        describeView(o, input.overlay.views, parts, appState, notes, 'overlay.')
        out.overlay = o
    }
    const page: Record<string, unknown> = input.overlay ? {} : out
    describeView(page, input.views, [], appState, notes, '')
    if (input.overlay) out.page = page

    const messages = (input.messages ?? []).slice(-MAX_MESSAGES)
    if (messages.length) {
        out.messages = messages.map(m => {
            const o: Record<string, unknown> = { variant: m.variant }
            if (m.title) o.title = m.title
            o.text = capText(m.text ?? '', 'messages', notes)
            return o
        })
    }
    const cut = notes.notes
    if (cut.length) out.truncated = cut
    return out
}

/** The action ids a part of the summary (the page, or the overlay) offers. */
export function offeredIn(part: any): Set<string> {
    const ids = new Set<string>()
    const walkA = (a: any) => { if (text(a, 'id')) ids.add(text(a, 'id')); (a?.children ?? []).forEach(walkA) }
    ;(part?.actions ?? []).forEach(walkA)
    ;(part?.otherActionIds ?? []).forEach((id: string) => ids.add(id))
    for (const l of part?.listings ?? []) {
        ;(l.actions ?? []).forEach(walkA)
        ;(l.rowActions ?? []).forEach(walkA)
        ;(l.builtInActions ?? []).forEach((id: string) => ids.add(id))
    }
    return ids
}

/** The part of the summary in front: the overlay when one is open, else the page. */
export function focusOf(summary: any): any {
    return summary?.overlay ?? summary
}

/** Finds an action of the summary by id (the focused part, then the app header's), or undefined. */
export function offeredAction(summary: any, id: string): Record<string, any> | undefined {
    const find = (list: any[] | undefined): any => {
        for (const a of list ?? []) {
            if (text(a, 'id') === id) return a
            const inner = find(a?.children)
            if (inner) return inner
        }
        return undefined
    }
    const part = focusOf(summary)
    return find(part?.actions) ?? (part?.listings ?? []).map((l: any) => find(l.actions) ?? find(l.rowActions)).find(Boolean)
        ?? find(summary?.appActions)
}

/** Whether the summary offers this action id at all (any part a user can press). */
export function offers(summary: any, id: string): boolean {
    if (offeredIn(focusOf(summary)).has(id)) return true
    const ids = new Set<string>()
    const walkA = (a: any) => { if (text(a, 'id')) ids.add(text(a, 'id')); (a?.children ?? []).forEach(walkA) }
    ;(summary?.appActions ?? []).forEach(walkA)
    return ids.has(id)
}

/**
 * The field ids `set-fields` may write: the focused part's fields that are not read only, plus
 * each listing's search text (when it has a search box) and filters.
 */
export function editableIds(summary: any): Set<string> {
    const part = focusOf(summary)
    const ids = new Set<string>()
    for (const f of part?.fields ?? []) if (!f.readOnly) ids.add(String(f.id))
    for (const l of part?.listings ?? []) {
        if ('searchText' in l) ids.add('searchText')
        for (const f of l.filters ?? []) ids.add(String(f.id))
    }
    return ids
}
