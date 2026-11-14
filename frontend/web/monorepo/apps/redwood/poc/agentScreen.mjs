import { interpolate } from './reduceContexts.mjs'

// LIVE UI PUSH — reading and operating the screen the user has open (conformance/mcp/README.md,
// "Reading and operating the screen the user has open"): an MCP agent asks THIS tab what it shows
// (`describe-screen`), to type into its fields (`set-fields`) or to press one of its actions
// (`run-action`). The tab answers with a SUMMARY built from its OWN rendered wire state — the
// registry's contexts (the host, the top overlay), the drafts of what was typed, the listing page —
// and nothing else: a field the server did not send is not there, a password is dots, no token.
//
// The shape is the desktop app's `mateu_get_screen` (intellij-plugin mcp/ScreenSummary.kt) so an
// agent reads both the same way; this module is its Redwood port, PURE (tested in Node,
// test-agent-screen.mjs). The imperative half — applying an edit or a click through the same chains
// a user's takes, waiting for the screen to settle, answering `_agent-screen` — is agentPush.mjs's.
//
// Every top-level name starts with `ss`/`screen`/`agentScreen`: make-amd puts all the poc modules in
// ONE scope, where a repeated name breaks the bridge build.

export const SCREEN_MAX_TEXT = 500
export const SCREEN_MAX_LIST = 50
export const SCREEN_MAX_OPTIONS = 50
export const SCREEN_MAX_ROWS = 50
export const SCREEN_MAX_FIELDS = 200
export const SCREEN_MAX_ACTIONS = 200
export const SCREEN_MAX_MESSAGES = 10
/** The row action that opens a listing row (as a click on it does). */
export const SCREEN_OPEN_ROW = 'open-row'
export const SCREEN_QUERY_EVENTS = ['describe-screen', 'set-fields', 'run-action']

// keys never walked as part of what is drawn (data, plumbing, or summarised on their own)
const SS_SKIP = new Set([
  'initialData', 'state', 'data', 'menu', 'options', 'columns', 'filters', 'triggers', 'rules',
  'validations', 'actions', 'restSources', 'actionCatalogue', 'contextSelectors', 'contextActions',
  'shortcuts', 'headerValues', 'editorOptions', 'valueLabels', 'tones', 'optionsSource', 'rowsSource',
  'restAction', 'attributes', 'remoteCoordinates', 'resolved', 'server',
])
// actions the renderer runs on its own (a search box, a pager): not options of their own
const SS_INTERNAL_ACTIONS = new Set(['search', '__restdata__', '__restfetch__', 'nextPage', 'prevPage', 'update-row'])
const SS_SECRET_WORDS = ['token', 'secret', 'password', 'credential']

const ssText = (node, key, fallback = '') => {
  const v = node && typeof node === 'object' ? node[key] : undefined
  return v == null || typeof v === 'object' ? fallback : String(v)
}
const ssNonBlank = (s) => typeof s === 'string' && s.trim() !== ''
const ssIsObject = (v) => !!v && typeof v === 'object' && !Array.isArray(v)

/** The sorted, unique paths whose content was cut. */
function ssNotes() {
  const set = new Set()
  return { add: (p) => set.add(p), list: () => [...set].sort() }
}

function ssCapText(text, path, notes) {
  const s = String(text)
  if (s.startsWith('data:')) {
    notes.add(path)
    return '[' + s.split(',')[0].split(';')[0] + ' data, ' + s.length + ' characters]'
  }
  if (s.length <= SCREEN_MAX_TEXT) return s
  notes.add(path)
  return s.slice(0, SCREEN_MAX_TEXT) + '…'
}

/** A value as the summary carries it: texts capped, lists and objects capped, nested 4 deep. */
export function screenCap(value, path, notes, depth = 0) {
  if (value === undefined || value === null) return null
  if (typeof value === 'string') return ssCapText(value, path, notes)
  if (Array.isArray(value)) {
    if (value.length > SCREEN_MAX_LIST) notes.add(path)
    return value.slice(0, SCREEN_MAX_LIST).map((v) => screenCap(v, path, notes, depth + 1))
  }
  if (typeof value === 'object') {
    if (depth >= 4) { notes.add(path); return '{…}' }
    const keys = Object.keys(value)
    if (keys.length > SCREEN_MAX_LIST) notes.add(path)
    const out = {}
    for (const k of keys.slice(0, SCREEN_MAX_LIST)) out[k] = screenCap(value[k], path, notes, depth + 1)
    return out
  }
  return typeof value === 'number' || typeof value === 'boolean' ? value : String(value)
}

const ssInterpolate = (text, ctx) => {
  const s = text == null ? '' : String(text)
  if (!s.includes('${')) return s
  try { return interpolate(s, ctx.state, { data: {}, appState: ctx.appState }) } catch (e) { return s }
}

function ssWalkChildren(n, acc, initial, skipAlso) {
  for (const [k, v] of Object.entries(n)) {
    if (SS_SKIP.has(k) || skipAlso.has(k)) continue
    if (v && typeof v === 'object') ssWalk(v, acc, initial)
  }
}

function ssWalk(n, acc, inherited) {
  if (!n || typeof n !== 'object' || acc.seen.has(n)) return
  acc.seen.add(n)
  if (Array.isArray(n)) { for (const x of n) ssWalk(x, acc, inherited); return }
  let initial = inherited
  const type = ssText(n, 'type')
  if (type === 'ServerSide') {
    if (ssIsObject(n.initialData)) initial = n.initialData
    for (const a of Array.isArray(n.actions) ? n.actions : []) if (a && ssNonBlank(a.id)) acc.declared.add(a.id)
  }
  if (type === 'FormField') {
    const id = ssText(n, 'fieldId')
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
    for (const a of Array.isArray(n.actions) ? n.actions : []) if (a && ssNonBlank(a.id)) acc.declared.add(a.id)
  }
  const meta = n.metadata
  if (ssIsObject(meta)) {
    if (ssText(meta, 'type') === 'Crud') {
      acc.crudNodes.push([n, meta])
      // its toolbar is the listing's: summarised with it
      ssWalkChildren(meta, acc, initial, new Set(['toolbar']))
    } else {
      ssWalk(meta, acc, initial)
    }
  }
  ssWalkChildren(n, acc, initial, new Set(['metadata']))
}

const ssIsSecret = (meta) => {
  const s = ssText(meta, 'stereotype').toLowerCase()
  return s === 'password' || ssText(meta, 'dataType').toLowerCase() === 'password'
}

function ssField(id, meta, view, acc, ctx, notes, path) {
  const out = { id }
  const label = ssText(meta, 'label')
  if (ssNonBlank(label)) out.label = ssInterpolate(label, ctx)
  out.type = ssText(meta, 'dataType')
  const stereotype = ssText(meta, 'stereotype')
  if (ssNonBlank(stereotype) && stereotype !== 'regular') out.stereotype = stereotype
  if (meta.required === true) out.required = true
  if (meta.readOnly === true || (view.disabledFields && view.disabledFields.has(id))) out.readOnly = true
  const help = ssText(meta, 'description')
  if (ssNonBlank(help)) out.help = ssCapText(help, path, notes)
  const state = view.state || {}
  const raw = Object.prototype.hasOwnProperty.call(state, id) ? state[id] : acc.initialData.get(id)
  if (ssIsSecret(meta)) out.value = raw == null || String(raw) === '' ? '' : '••••••'
  else out.value = screenCap(raw, path, notes)
  const options = Array.isArray(meta.options) ? meta.options : []
  if (options.length) {
    out.options = options.slice(0, SCREEN_MAX_OPTIONS).map((o) => ({ value: ssText(o, 'value'), label: ssText(o, 'label', ssText(o, 'value')) }))
    if (options.length > SCREEN_MAX_OPTIONS) notes.add(path + '.options')
  } else if (meta.optionsSource != null) {
    out.optionsFrom = 'a source the renderer fetches'
  }
  const error = view.fieldErrors && view.fieldErrors[id]
  if (error) out.error = error
  return out
}

function ssAction(b, ctx) {
  const id = ssText(b, 'actionId')
  const route = ssText(b, 'route')
  const label = ssInterpolate(ssText(b, 'label'), ctx)
  const children = Array.isArray(b.children) && b.children.length ? b.children : null
  if (!id && !route && !children) return null
  const out = { id: id || route || label }
  if (label) out.label = label
  out.enabled = b.disabled !== true
  if (route) out.navigatesTo = route
  if (b.rowsSelectedRequired === true) out.needsSelectedRows = true
  if (children) out.children = children.map((c) => ssAction(c, ctx)).filter(Boolean)
  return out
}

function ssRowActionsOf(cell, dataType) {
  if (cell == null || typeof cell !== 'object') return []
  if (dataType === 'action') return cell.methodNameInCrud ? [cell] : []
  return Array.isArray(cell.actions) ? cell.actions : []
}

function ssCellValue(cell, col, path, notes) {
  // a status / link cell is an object: what it shows is its text
  if (ssIsObject(cell)) {
    for (const k of ['message', 'text', 'label', 'value']) {
      const v = cell[k]
      if (v != null && typeof v !== 'object') return ssCapText(String(v), path, notes)
    }
  }
  if (cell != null && typeof cell !== 'object' && col && ssIsObject(col.valueLabels)) {
    const label = col.valueLabels[String(cell)]
    if (typeof label === 'string') return label
  }
  return screenCap(cell, path, notes)
}

function ssListing(node, meta, view, ctx, notes, prefix) {
  const id = ssText(node, 'id') || ssText(meta, 'id') || 'crud'
  const path = prefix + 'listings.' + id
  const out = { id }
  const title = ssText(meta, 'title')
  if (ssNonBlank(title)) out.title = ssInterpolate(title, ctx)
  const columns = (Array.isArray(meta.columns) ? meta.columns : []).map((c) => (ssIsObject(c && c.metadata) ? c.metadata : c) || {})
  out.columns = columns.map((c) => ({ id: ssText(c, 'id'), label: ssText(c, 'label') }))
  out.actions = (Array.isArray(meta.toolbar) ? meta.toolbar : []).map((b) => ssAction(b, ctx)).filter(Boolean)
  const state = view.state || {}
  if (meta.searchable === true) out.searchText = state.searchText == null ? '' : String(state.searchText)
  const filters = Array.isArray(meta.filters) ? meta.filters : []
  if (filters.length) {
    out.filters = filters.map((raw) => {
      const f = ssIsObject(raw && raw.metadata) ? raw.metadata : raw || {}
      const fid = ssText(f, 'fieldId')
      const one = { id: fid, label: ssText(f, 'label', fid), type: ssText(f, 'dataType') }
      if (state[fid] != null) one.value = screenCap(state[fid], path + '.filters.' + fid, notes)
      if (state[fid + '_from'] != null) one.from = screenCap(state[fid + '_from'], path, notes)
      if (state[fid + '_to'] != null) one.to = screenCap(state[fid + '_to'], path, notes)
      if (Array.isArray(f.options) && f.options.length) {
        one.options = f.options.slice(0, SCREEN_MAX_OPTIONS).map((o) => ({ value: ssText(o, 'value'), label: ssText(o, 'label') }))
      }
      return one
    })
  }
  if (Array.isArray(state.sort) && state.sort.length) out.sort = state.sort
  // the page it painted
  const listings = view.listings || {}
  const envelope = listings[id] || listings.crud
  const page = envelope ? (ssIsObject(envelope.crud && envelope.crud.page) ? envelope.crud.page : ssIsObject(envelope.page) ? envelope.page : envelope) : null
  const rows = page && Array.isArray(page.content) ? page.content : []
  if (page) {
    out.page = Number(page.pageNumber) || 0
    out.pageSize = page.pageSize != null ? Number(page.pageSize) : rows.length
    if (typeof page.totalElements === 'number') out.totalElements = page.totalElements
  }
  const colIds = columns.map((c) => ssText(c, 'id')).filter(Boolean)
  out.rows = rows.slice(0, SCREEN_MAX_ROWS).map((row) => {
    const r = {}
    const keys = colIds.length ? colIds : Object.keys(row || {}).filter((k) => !k.startsWith('_'))
    for (const k of keys) {
      if (!row || !(k in row)) continue
      r[k] = ssCellValue(row[k], columns.find((c) => ssText(c, 'id') === k), path, notes)
    }
    return r
  })
  if (rows.length > SCREEN_MAX_ROWS) notes.add(path + '.rows')
  // what a row offers: opening it, its link columns, its own actions
  const rowActions = []
  const rowOpens = ssNonBlank(ssText(meta, 'rowRoute')) || columns.some((c) => ssText(c, 'actionId') === 'view')
  if (rowOpens) rowActions.push({ id: SCREEN_OPEN_ROW, label: 'Open' })
  for (const c of columns) {
    const a = ssText(c, 'actionId')
    if (a && a !== 'view') rowActions.push({ id: a, label: ssText(c, 'label') })
  }
  const seen = new Set()
  for (const c of columns.filter((c) => ['action', 'actionGroup', 'menu'].includes(ssText(c, 'dataType')))) {
    for (const row of rows) {
      for (const a of ssRowActionsOf(row && row[ssText(c, 'id')], ssText(c, 'dataType'))) {
        const method = ssText(a, 'methodNameInCrud')
        if (method && !seen.has(method)) {
          seen.add(method)
          rowActions.push({ id: 'action-on-row-' + method, label: ssText(a, 'label', method) })
        }
      }
    }
  }
  out.rowActions = rowActions
  if (meta.rowsSelectionEnabled === true) out.rowsSelectable = true
  if (ssIsObject(meta.rowsSource)) {
    // fetched by the renderer from a REST source: its search box and pager are the user's
    out.rowsFrom = 'a REST source the app fetches; search and paging are not offered to agents'
  } else {
    out.builtInActions = page ? ['search', 'nextPage', 'prevPage'] : ['search']
  }
  return out
}

function ssDescribeView(into, tree, view, appState, notes, prefix) {
  const acc = { header: null, fields: new Map(), buttons: [], crudNodes: [], declared: new Set(), initialData: new Map(), seen: new Set() }
  if (tree) ssWalk(tree, acc, null)
  const ctx = { state: view.state || {}, appState: appState || {} }
  if (acc.header) {
    // the Page / Form metadata (the walk reaches it as its own node)
    const h = acc.header
    const header = {}
    for (const k of ['title', 'subtitle', 'overline']) {
      const v = k === 'title' ? (ssText(h, 'title') || ssText(h, 'pageTitle')) : ssText(h, k)
      if (ssNonBlank(v)) header[k] = ssInterpolate(v, ctx)
    }
    if (ssNonBlank(ssText(h, 'timestamp'))) header.timestamp = ssText(h, 'timestamp')
    if (Array.isArray(h.badges) && h.badges.length) header.badges = h.badges.map((b) => ssInterpolate(ssText(b, 'text', ssText(b, 'label')), ctx))
    if (Array.isArray(h.kpis) && h.kpis.length) header.kpis = h.kpis.map((k) => ({ title: ssInterpolate(ssText(k, 'title'), ctx), value: ssInterpolate(ssText(k, 'text'), ctx) }))
    if (Object.keys(header).length) into.header = header
    if (Array.isArray(h.breadcrumbs) && h.breadcrumbs.length) {
      into.breadcrumbs = h.breadcrumbs.map((b) => {
        const one = { label: ssText(b, 'text') }
        if (ssNonBlank(ssText(b, 'link'))) one.route = ssText(b, 'link')
        return one
      })
    }
  }
  // fields
  const fields = []
  let count = 0
  for (const [id, meta] of acc.fields) {
    if (view.hiddenFields && view.hiddenFields.has(id)) continue
    if (count++ >= SCREEN_MAX_FIELDS) { notes.add(prefix + 'fields'); break }
    fields.push(ssField(id, meta, view, acc, ctx, notes, prefix + 'fields.' + id))
  }
  into.fields = fields
  if (view.fieldErrors && Object.keys(view.fieldErrors).length) into.errors = { ...view.fieldErrors }
  // actions: the buttons drawn on it
  const actions = []
  const seenActions = new Set()
  for (const b of acc.buttons) {
    if (actions.length >= SCREEN_MAX_ACTIONS) { notes.add(prefix + 'actions'); break }
    const a = ssAction(b, ctx)
    if (a && !seenActions.has(a.id + '|' + (a.label || ''))) { seenActions.add(a.id + '|' + (a.label || '')); actions.push(a) }
  }
  into.actions = actions
  const buttonIds = new Set(actions.map((a) => a.id))
  const others = [...acc.declared].filter((id) => !buttonIds.has(id) && !SS_INTERNAL_ACTIONS.has(id))
  if (others.length) into.otherActionIds = others.slice(0, SCREEN_MAX_ACTIONS)
  if (acc.crudNodes.length) into.listings = acc.crudNodes.map(([node, meta]) => ssListing(node, meta, view, ctx, notes, prefix))
}

function ssAppContext(app, appState, notes) {
  const selectors = app && Array.isArray(app.contextSelectors) ? app.contextSelectors : []
  if (!selectors.length) return null
  return selectors.map((s) => {
    const field = ssText(s, 'fieldName')
    const value = appState && appState[field] != null ? String(appState[field]) : ''
    const options = Array.isArray(s.options) ? s.options : []
    const out = { field, label: ssText(s, 'label', field), value }
    const picked = options.find((o) => ssText(o, 'value') === value)
    if (picked) out.valueLabel = ssText(picked, 'label')
    out.options = options.slice(0, SCREEN_MAX_OPTIONS).map((o) => ({ value: ssText(o, 'value'), label: ssText(o, 'label') }))
    if (options.length > SCREEN_MAX_OPTIONS) notes.add('appContext.' + field + '.options')
    return out
  })
}

function ssAppAction(a) {
  const out = { id: ssText(a, 'actionId'), label: ssText(a, 'label', ssText(a, 'actionId')) }
  if (ssNonBlank(ssText(a, 'route'))) out.navigatesTo = ssText(a, 'route')
  if (Array.isArray(a.children) && a.children.length) out.children = a.children.map(ssAppAction)
  return out
}

function ssUser(app) {
  const u = app && app.user
  if (typeof u === 'string') return u
  if (!ssIsObject(u)) return null
  const out = {}
  for (const [k, v] of Object.entries(u)) {
    const lower = k.toLowerCase()
    if (v != null && typeof v !== 'object' && !SS_SECRET_WORDS.some((w) => lower.includes(w))) out[k] = v
  }
  return out
}

/**
 * THE SUMMARY of what the user sees. `input`:
 *   { uiName?, baseUrl?, route, windowTitle?, app? (the App metadata: contextSelectors,
 *     contextActions, title, user), appState?, messages?: [{variant, title?, text}],
 *     view?: {content, state, fieldErrors?, listings?, hiddenFields?, disabledFields?},
 *     overlay?: {component, view} }
 */
export function buildScreenSummary(input) {
  const i = input || {}
  const notes = ssNotes()
  const out = {}
  const ui = {}
  if (ssNonBlank(i.uiName)) ui.name = i.uiName
  if (ssNonBlank(i.baseUrl)) ui.baseUrl = i.baseUrl
  if (i.app && ssNonBlank(ssText(i.app, 'title'))) ui.appTitle = ssText(i.app, 'title')
  out.ui = ui
  const user = ssUser(i.app)
  if (user) out.user = user
  out.route = i.route || ''
  if (ssNonBlank(i.windowTitle)) out.windowTitle = i.windowTitle
  out.focus = i.overlay ? 'overlay' : 'page'
  const appContext = ssAppContext(i.app, i.appState, notes)
  if (appContext) out.appContext = appContext
  if (i.app && Array.isArray(i.app.contextActions) && i.app.contextActions.length) out.appActions = i.app.contextActions.map(ssAppAction)
  if (i.overlay) {
    const component = i.overlay.component || {}
    const meta = component.metadata || {}
    const view = i.overlay.view || {}
    const ctx = { state: view.state || {}, appState: i.appState || {} }
    const o = { kind: (i.overlay.kind || ssText(meta, 'type') || 'overlay').toLowerCase() }
    const title = i.overlay.title || ssText(meta, 'headerTitle', ssText(meta, 'title'))
    if (ssNonBlank(title)) o.title = ssInterpolate(title, ctx)
    const subtitle = i.overlay.subtitle || ssText(meta, 'subtitle')
    if (ssNonBlank(subtitle)) o.subtitle = ssInterpolate(subtitle, ctx)
    if (ssNonBlank(i.overlay.message)) o.message = ssCapText(i.overlay.message, 'overlay.message', notes)
    const parts = []
    for (const k of ['header', 'content', 'footer']) if (ssIsObject(meta[k])) parts.push(meta[k])
    for (const c of Array.isArray(component.children) ? component.children : []) parts.push(c)
    ssDescribeView(o, parts, view, i.appState, notes, 'overlay.')
    if (Array.isArray(i.overlay.actions)) o.actions = o.actions.concat(i.overlay.actions)
    out.overlay = o
  }
  if (i.view) {
    const page = i.overlay ? (out.page = {}) : out
    ssDescribeView(page, i.view.content, i.view, i.appState, notes, '')
  }
  const messages = Array.isArray(i.messages) ? i.messages : []
  if (messages.length) {
    out.messages = messages.slice(-SCREEN_MAX_MESSAGES).map((m) => {
      const one = { variant: ssText(m, 'variant', 'info') }
      if (ssNonBlank(ssText(m, 'title'))) one.title = ssText(m, 'title')
      one.text = ssCapText(ssText(m, 'text'), 'messages', notes)
      return one
    })
  }
  const cut = notes.list()
  if (cut.length) out.truncated = cut
  return out
}

/** The part of the summary in front of the user: the overlay when one is open, else the page. */
export function screenFocusOf(summary) {
  if (summary && summary.overlay) return summary.overlay
  return summary || {}
}

/** The action ids one part of the summary (the page, or the overlay) offers. */
export function screenOfferedIn(part) {
  const ids = new Set()
  const walk = (a) => { if (a && ssNonBlank(a.id)) ids.add(a.id); for (const c of (a && a.children) || []) walk(c) }
  for (const a of (part && part.actions) || []) walk(a)
  for (const id of (part && part.otherActionIds) || []) ids.add(id)
  for (const l of (part && part.listings) || []) {
    for (const a of l.actions || []) walk(a)
    for (const a of l.rowActions || []) walk(a)
    for (const id of l.builtInActions || []) ids.add(id)
  }
  return ids
}

/** Every action id the summary offers: the focused part's and the app header's. */
export function screenOfferedActionIds(summary) {
  const ids = screenOfferedIn(screenFocusOf(summary))
  const walk = (a) => { if (a && ssNonBlank(a.id)) ids.add(a.id); for (const c of (a && a.children) || []) walk(c) }
  for (const a of (summary && summary.appActions) || []) walk(a)
  return ids
}

/** The action of the summary with that id (the first found), or null. */
function ssFindAction(summary, id) {
  const lists = []
  const focus = screenFocusOf(summary)
  lists.push(focus.actions || [])
  for (const l of focus.listings || []) lists.push(l.actions || [], l.rowActions || [])
  lists.push(summary.appActions || [])
  const find = (list) => {
    for (const a of list) {
      if (a.id === id) return a
      const inner = find(a.children || [])
      if (inner) return inner
    }
    return null
  }
  for (const list of lists) { const a = find(list); if (a) return a }
  return null
}

/** The query a pushed message carries ({event, requestId, …}), or null when it is not one. */
export function screenQueryOf(push) {
  if (!push || push.kind !== 'query' || !SCREEN_QUERY_EVENTS.includes(push.event)) return null
  const d = ssIsObject(push.detail) ? push.detail : {}
  if (!ssNonBlank(d.requestId)) return null
  const q = { event: push.event, requestId: d.requestId }
  if (push.event === 'set-fields') q.values = ssIsObject(d.values) ? d.values : {}
  if (push.event === 'run-action') {
    q.actionId = typeof d.actionId === 'string' ? d.actionId : ''
    if (ssIsObject(d.parameters)) q.parameters = d.parameters
    if (Number.isInteger(d.row) && d.row >= 0) q.row = d.row
    if (typeof d.listing === 'string') q.listing = d.listing
  }
  return q
}

/**
 * Whether `values` may be typed into the screen: every id a field of the focused part that is not
 * readOnly, or a listing's `searchText` / filter id. → {ok: true, edits: [{fieldId, value, kind}]} |
 * {ok: false, error: {code: 'unknownField', id}} — the first other id refuses the WHOLE call.
 */
export function planScreenEdits(summary, values) {
  const focus = screenFocusOf(summary)
  const editable = new Set((focus.fields || []).filter((f) => !f.readOnly).map((f) => f.id))
  const searchable = new Set()
  const filterIds = new Set()
  for (const l of focus.listings || []) {
    if ('searchText' in l) searchable.add('searchText')
    for (const f of l.filters || []) if (f.id) filterIds.add(f.id)
  }
  const edits = []
  for (const [fieldId, value] of Object.entries(values || {})) {
    if (editable.has(fieldId)) edits.push({ fieldId, value, kind: 'field' })
    else if (searchable.has(fieldId)) edits.push({ fieldId, value, kind: 'search' })
    else if (filterIds.has(fieldId)) edits.push({ fieldId, value, kind: 'filter' })
    else return { ok: false, error: { code: 'unknownField', id: fieldId } }
  }
  return { ok: true, edits }
}

/**
 * What pressing `actionId` (with `row` / `listing`) means on this screen →
 *   {ok: false, error: {code, id?}}
 * | {ok: true, kind: 'open-row' | 'row-action' | 'search' | 'page' | 'app' | 'action', actionId,
 *    parameters?, rowIndex?, listingId?, which? ('next'|'prev')}
 */
export function planScreenAction(summary, { actionId, parameters, row, listing } = {}) {
  const id = String(actionId || '')
  if (!id || !screenOfferedActionIds(summary).has(id)) return { ok: false, error: { code: 'unknownAction', id } }
  const found = ssFindAction(summary, id)
  if (found && found.enabled === false) return { ok: false, error: { code: 'disabledAction', id } }
  const focus = screenFocusOf(summary)
  const listings = focus.listings || []
  const named = listing != null ? listings.find((l) => l.id === listing) : listings[0]
  const base = { ok: true, actionId: id, ...(parameters ? { parameters } : {}) }
  if (row != null) {
    if (!named || !(row >= 0 && row < (named.rows || []).length)) return { ok: false, error: { code: 'unknownRow', id: String(row) } }
    base.rowIndex = row
    base.listingId = named.id
  }
  if (id === SCREEN_OPEN_ROW) {
    if (row == null) return { ok: false, error: { code: 'unknownRow', id: '' } }
    return { ...base, kind: 'open-row' }
  }
  if (id.startsWith('action-on-row-') && row != null) return { ...base, kind: 'row-action', method: id.slice('action-on-row-'.length) }
  if (id === 'search') return { ...base, kind: 'search', listingId: named ? named.id : undefined }
  if (id === 'nextPage' || id === 'prevPage') return { ...base, kind: 'page', which: id === 'nextPage' ? 'next' : 'prev', listingId: named ? named.id : undefined }
  const app = (summary.appActions || [])
  const inApp = (list) => list.some((a) => a.id === id || inApp(a.children || []))
  if (!screenOfferedIn(focus).has(id) && inApp(app)) return { ...base, kind: 'app' }
  return { ...base, kind: 'action' }
}

/** For a refusal answer: `_agent-screen`'s `error` ({code, id?}, id only when there is one). */
export function screenRefusalOf(code, id) {
  return id == null || id === '' ? { code } : { code, id: String(id) }
}

/** The recent messages a tab keeps for the summary: the last SCREEN_MAX_MESSAGES of an increment
 *  stream (each increment's `messages`, variant/title/text). */
export function screenMessagesAfter(kept, increment) {
  const next = (kept || []).slice()
  for (const m of (increment && Array.isArray(increment.messages) ? increment.messages : [])) {
    if (!m || (m.text == null && m.title == null)) continue
    next.push({ variant: String(m.variant || 'info').toLowerCase(), ...(m.title ? { title: String(m.title) } : {}), text: String(m.text != null ? m.text : '') })
  }
  return next.slice(-SCREEN_MAX_MESSAGES)
}

/** How long the "an agent is operating this screen" notice stays after the last query. */
export const AGENT_OPERATING_MS = 120000

/** Whether the notice shows: a query in the last two minutes, and the user did not press Stop. */
export function agentOperatingOf({ lastQueryAt, stopped } = {}, now = Date.now()) {
  return !stopped && typeof lastQueryAt === 'number' && now - lastQueryAt < AGENT_OPERATING_MS
}
