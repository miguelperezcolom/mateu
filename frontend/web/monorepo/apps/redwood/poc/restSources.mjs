// REST SOURCES on the Redwood renderer — the twin of libs/mateu's restSourceCatalogue.ts +
// externalOptions.ts + restRowFilters.ts, and of the surfaces that consume them there
// (mateu-table-crud `_fetchRowsFromRest`, mateu-field's options, mateu-component `handleRestAction`).
// Nothing of that core is shared with this renderer, so every guarantee is restated here.
//
// A surface may read or write somebody else's endpoint instead of a Mateu action:
//   - a listing's `rowsSource` (its rows),
//   - a field's `optionsSource` (its options),
//   - an action's `restAction` (a write, or the route's `data:` load: the synthetic `__restdata__`).
// Each names its endpoint INLINE or BY REF to the app's catalogue (`sources.yaml`, travelling as
// AppDto.restSources or the bundle manifest's `sources`), and the surface's own declared values win
// over the entry's. The call goes either DIRECT (fetch in the browser) or PROXIED (the reserved
// `__restfetch__` server action, so no CORS and the server injects `${secret.X}`), and the choice
// is read off the RESOLVED source — a by-ref surface carries nothing but the name.
//
// SAMPLE MODE (the opt-in rule is the same everywhere): a source carrying `sample:` answers with it
// INSTEAD of calling the endpoint — only when the app metadata or a manifest says `mockSources: true`,
// or in the visual editor's canvas (editorPreview.mjs). Then a read gets a copy of the sample, a write
// succeeds with nothing persisted (null), nothing is proxied, and a listing searches, filters, sorts
// and pages the sample in memory whatever totalPath it declares.
//
// The hook into the transport is `restAnswerOf` (called by runMateuAction before anything goes to
// the server): it answers `search` on a listing with a rowsSource and any action declaring a
// restAction with an increment built here, shaped like the server's — so the reducer and the chains
// do not know the rows came from elsewhere. Field options load in `loadRestOptions` (from
// loadLookups). Pure except the default fetch, which every function takes as an argument.

import { findFirst } from './core/listing.mjs'
import { collectFields } from './core/tree.mjs'
import { declaredActionOf, LOOKUP_LOADED } from './core/rowEditor.mjs'

// ── the catalogue ─────────────────────────────────────────────────────────────────────────────

let restCatalogue = []
let restSampleMode = false

/** Replaces the catalogue (app metadata, a bundle manifest, the editor's render message). A replace,
 *  not a merge: a stale entry surviving a deployment change is the failure the indirection removes. */
export function setRestSourceCatalogue(incoming) {
  restCatalogue = Array.isArray(incoming) ? incoming.filter((e) => e && typeof e.name === 'string') : []
}

/** The entry with this name, or undefined. */
export const getRestSource = (name) => (name ? restCatalogue.find((e) => e.name === name) : undefined)

/** Everything in the catalogue — diagnostics and tests. */
export const restSourceCatalogue = () => restCatalogue

const restBlank = (v) => v === undefined || v === null || v === ''

/** A descriptor with its reference filled in from the catalogue; what the surface declares wins.
 *  An inline descriptor (or an unknown ref, warned about) comes back as declared. */
export function resolveRestSource(source) {
  if (!source || !source.ref) return source
  const entry = getRestSource(source.ref)
  if (!entry || !entry.source) {
    try { console.warn('mateu: no REST source named "' + source.ref + '" in the app\'s catalogue') } catch (e) { /* no console */ }
    return source
  }
  const from = entry.source
  return {
    ...source,
    url: restBlank(source.url) ? from.url : source.url,
    method: restBlank(source.method) ? from.method : source.method,
    headers: source.headers && Object.keys(source.headers).length > 0 ? source.headers : from.headers,
    body: restBlank(source.body) ? from.body : source.body,
    itemsPath: restBlank(source.itemsPath) ? from.itemsPath : source.itemsPath,
    valuePath: restBlank(source.valuePath) ? from.valuePath : source.valuePath,
    labelPath: restBlank(source.labelPath) ? from.labelPath : source.labelPath,
    proxy: !!(source.proxy || from.proxy),
    sample: source.sample !== undefined && source.sample !== null
      ? source.sample
      : (entry.sample !== undefined && entry.sample !== null ? entry.sample : from.sample),
  }
}

/** Turns sample mode on (or off: only the tests do). The app and a manifest only ever switch it ON. */
export function setSampleMode(on) { restSampleMode = !!on }

/** Whether sources carrying sample data answer with it. */
export const isSampleMode = () => restSampleMode

/** The sample a source answers with in sample mode; undefined when it is not answered from one. */
export function sampleOf(source) {
  if (!restSampleMode || !source) return undefined
  const resolved = resolveRestSource(source)
  return resolved && resolved.sample !== null ? resolved.sample : undefined
}

/** True when this source is answered from its sample (neither fetched nor proxied). */
export const isSampled = (source) => sampleOf(source) !== undefined

/** Whether the call goes through the Mateu server: the RESOLVED `proxy`, unless sampled. */
export const viaProxy = (source) => !!source && !!(resolveRestSource(source) || {}).proxy && !isSampled(source)

/** The dot path a column/field is read by, honouring the referenced entry's field map. */
export function pathOfField(source, fieldName) {
  const entry = getRestSource(source && source.ref)
  const mapped = entry && entry.fields ? entry.fields[fieldName] : undefined
  return mapped ? mapped : fieldName
}

/** The referenced entry's total path (the source pages server-side), or undefined. */
export const totalPathOf = (source) => {
  const entry = getRestSource(source && source.ref)
  return (entry && entry.totalPath) || undefined
}

/** The App metadata of an increment (bootstrap: a root App, or the App child of a ServerSide). */
function appMetadataOf(increment) {
  for (const f of (increment && increment.fragments) || []) {
    const c = f && f.component
    if (!c) continue
    if (c.metadata && c.metadata.type === 'App') return c.metadata
    for (const child of c.children || []) {
      if (child && child.metadata && child.metadata.type === 'App') return child.metadata
    }
  }
  return null
}

/** Adopts the catalogue an App carries (AppDto.restSources) and its sample-mode opt-in
 *  (AppDto.mockSources — only ever switches sample mode ON). Returns the increment. */
export function adoptAppSources(increment) {
  const app = appMetadataOf(increment)
  if (!app) return increment
  if (Array.isArray(app.restSources)) setRestSourceCatalogue(app.restSources)
  if (app.mockSources) setSampleMode(true)
  return increment
}

/** Adopts a static bundle's manifest: its `sources` table and its `mockSources` flag. */
export function adoptManifestSources(manifest) {
  if (!manifest) return
  const sources = manifest.sources && Array.isArray(manifest.sources.sources) ? manifest.sources.sources
    : (Array.isArray(manifest.sources) ? manifest.sources : null)
  if (sources) setRestSourceCatalogue(sources)
  if (manifest.mockSources) setSampleMode(true)
}

// ── shaping a response ────────────────────────────────────────────────────────────────────────

/** Navigates a dot path (`data.items`) into a JSON value; an empty path is identity. */
export function getByPath(obj, path) {
  if (!path) return obj
  return String(path).split('.').reduce((acc, key) => (acc != null && typeof acc === 'object' ? acc[key] : undefined), obj)
}

/** A response as options: `itemsPath` to the array, `valuePath`/`labelPath` of each item; a primitive
 *  element is its own value and label, a half-specified mapping falls back to the other half. */
export function mapItemsToOptions(json, itemsPath, valuePath, labelPath) {
  const arr = getByPath(json, itemsPath)
  if (!Array.isArray(arr)) return []
  const vp = valuePath || 'value'
  const lp = labelPath || 'label'
  return arr.map((item) => {
    if (item != null && typeof item === 'object') {
      const value = getByPath(item, vp)
      const label = getByPath(item, lp)
      return { value: value != null ? value : label, label: String(label != null ? label : (value != null ? value : '')) }
    }
    return { value: item, label: String(item) }
  })
}

/** A response as listing rows keyed by column id; `pathOf` maps a column to the path it reads. */
export function mapItemsToRows(json, itemsPath, columnIds, pathOf = (id) => id) {
  const arr = getByPath(json, itemsPath)
  if (!Array.isArray(arr)) return []
  return arr.map((item) => {
    const row = {}
    for (const id of columnIds) row[id] = getByPath(item, pathOf(id))
    return row
  })
}

/** Rows + total of an already fetched response (shared by the direct and the proxied legs). */
export function restPageOf(json, source, columnIds) {
  const resolved = resolveRestSource(source) || {}
  const rows = mapItemsToRows(json, resolved.itemsPath, columnIds, (id) => pathOfField(source, id))
  const raw = getByPath(json, totalPathOf(source))
  const total = typeof raw === 'number' ? raw : Number(raw)
  return { rows, total: raw != null && Number.isFinite(total) ? total : null }
}

// ── interpolation: `${state.x}`, `${data.x}`, `${row.x}`, `${appState.x}` ──────────────────────

const REST_EXPRESSION = /\$\{([^}]*)\}/g

/** The value an expression names in the scope ({state, data, row, appState, appData}). */
function restScopeValue(expr, scope) {
  const path = String(expr).trim().replace(/\[\s*['"]([^'"\]]+)['"]\s*\]/g, '.$1')
  const parts = path.split('.').filter((p) => p !== '')
  if (!parts.length) return undefined
  let value = scope && Object.prototype.hasOwnProperty.call(scope, parts[0]) ? scope[parts[0]] : undefined
  for (const part of parts.slice(1)) value = value != null && typeof value === 'object' ? value[part] : undefined
  return value
}

const restText = (v) => (v == null ? '' : typeof v === 'object' ? JSON.stringify(v) : String(v))

/** Interpolates a header or a body; `escape` maps each value (the JSON escaping of a JSON body). */
export function interpolateRest(text, scope, escape = (s) => s) {
  if (text == null || String(text).indexOf('${') < 0) return text
  return String(text).replace(REST_EXPRESSION, (all, expr) => escape(restText(restScopeValue(expr, scope))))
}

/**
 * Interpolates a url with each value encoded BY POSITION — the server's TemplateInterpolator
 * .interpolateUrl, so the direct and the proxied legs reach the same url: raw in the origin (and a
 * `${state…}` there is refused: the client state must not choose the host), a path segment in the
 * path (a dot segment refused), a query component after a literal `?`/`#`. Throws when refused.
 */
export function interpolateRestUrl(text, scope) {
  if (text == null || String(text).indexOf('${') < 0) return text
  const src = String(text)
  let out = ''
  let literal = ''
  let last = 0
  let originOpen = false
  let first = true
  REST_EXPRESSION.lastIndex = 0
  let m
  while ((m = REST_EXPRESSION.exec(src)) !== null) {
    const lit = src.slice(last, m.index)
    if (first && lit.indexOf('://') >= 0) originOpen = true
    if (originOpen) {
      const from = literal === '' ? lit.indexOf('://') + 3 : 0
      if (/[/?#]/.test(lit.substring(from))) originOpen = false
    }
    literal += lit
    out += lit
    const value = restText(restScopeValue(m[1], scope))
    if (originOpen || (first && lit === '')) {
      if (/^\s*state\b/.test(m[1])) throw new Error('A client state value cannot choose the origin of a URL: ' + src)
      out += value
    } else if (/[?#]/.test(literal)) {
      out += encodeURIComponent(value)
    } else {
      if (value === '.' || value === '..') throw new Error('A dot segment is not a valid path value: ' + value)
      out += encodeURIComponent(value)
    }
    first = false
    last = REST_EXPRESSION.lastIndex
  }
  return out + src.slice(last)
}

/** Escapes a value for the inside of a JSON string (no surrounding quotes: the template wrote them). */
export function jsonEscape(value) {
  let out = ''
  for (const ch of String(value)) {
    switch (ch) {
      case '"': out += '\\"'; break
      case '\\': out += '\\\\'; break
      case '\n': out += '\\n'; break
      case '\r': out += '\\r'; break
      case '\t': out += '\\t'; break
      case '\b': out += '\\b'; break
      case '\f': out += '\\f'; break
      default: out += ch < ' ' ? '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0') : ch
    }
  }
  return out
}

/** Whether a request declares a JSON body (its values then need escaping). */
export function declaresJson(headers) {
  return !!headers && Object.keys(headers).some((name) => name.toLowerCase() === 'content-type'
    && String(headers[name] || '').toLowerCase().indexOf('json') >= 0)
}

// ── the direct leg ────────────────────────────────────────────────────────────────────────────

const restClone = (v) => (v === undefined ? v : JSON.parse(JSON.stringify(v)))

const defaultRestFetch = (url, init) => fetch(url, init)

/**
 * Fetches a source in the browser — the single choke point of every surface (= fetchExternalJson).
 * In sample mode a sampled read answers a copy of its sample and a write null, with no network.
 * Throws on a non-2xx (the error carries `status`); a 204/205 or an empty body is null.
 */
export async function fetchRestJson(declared, scope = {}, fetchImpl = defaultRestFetch) {
  const source = resolveRestSource(declared) || {}
  const method = String(source.method || 'GET').toUpperCase()
  if (isSampled(declared)) {
    if (method !== 'GET' && method !== 'HEAD') return null
    return restClone(sampleOf(declared))
  }
  if (!source.url) throw new Error('External REST fetch has no url' + (declared && declared.ref ? ' (unknown source "' + declared.ref + '")' : ''))
  const url = interpolateRestUrl(source.url, scope)
  const headers = {}
  for (const k of Object.keys(source.headers || {})) headers[k] = interpolateRest(source.headers[k], scope)
  const init = { method, headers }
  if (method !== 'GET' && method !== 'HEAD' && source.body) {
    init.body = interpolateRest(source.body, scope, declaresJson(headers) ? jsonEscape : undefined)
  }
  const res = await fetchImpl(url, init)
  if (!res.ok) {
    const err = new Error('External REST fetch failed: ' + res.status)
    err.status = res.status
    throw err
  }
  if (res.status === 204 || res.status === 205) return null
  if (typeof res.text !== 'function') return res.json()
  const text = await res.text()
  return text.trim() === '' ? null : JSON.parse(text)
}

// ── in-memory search, filters and sort (an unpaged endpoint, or a sample) ─────────────────────

const restFilterBlank = (v) => v === undefined || v === null || v === '' || (typeof v === 'number' && Number.isNaN(v))

const restMultiValues = (raw) => {
  if (Array.isArray(raw)) return raw.map(String)
  if (typeof raw === 'string' && raw !== '') return raw.split(',').map((v) => v.trim()).filter((v) => v)
  return []
}

const restWithinRange = (cell, from, to, numeric) => {
  if (numeric) {
    const value = Number(cell)
    if (cell === '' || cell == null || Number.isNaN(value)) return false
    if (!restFilterBlank(from) && value < Number(from)) return false
    if (!restFilterBlank(to) && value > Number(to)) return false
    return true
  }
  const text = cell == null ? '' : String(cell)
  if (text === '') return false
  if (!restFilterBlank(from) && text < String(from)) return false
  if (!restFilterBlank(to) && text > String(to)) return false
  return true
}

function restMatchesFilter(row, field, state) {
  const id = field.fieldId
  if (!id) return true
  const cell = row[id]
  if (field.stereotype === 'dateRange' || field.stereotype === 'numberRange') {
    const from = state[id + '_from']
    const to = state[id + '_to']
    if (restFilterBlank(from) && restFilterBlank(to)) return true
    return restWithinRange(cell, from, to, field.stereotype === 'numberRange')
  }
  if (field.stereotype === 'multiSelect') {
    const wanted = restMultiValues(state[id])
    if (!wanted.length) return true
    return wanted.indexOf(String(cell == null ? '' : cell)) >= 0
  }
  const value = state[id]
  if (restFilterBlank(value)) return true
  if (field.dataType === 'boolean' || field.dataType === 'bool' || field.stereotype === 'checkbox' || field.stereotype === 'toggle') {
    const wanted = typeof value === 'boolean' ? value : String(value).toLowerCase() === 'true'
    const actual = typeof cell === 'boolean' ? cell : String(cell == null ? '' : cell).toLowerCase() === 'true'
    return wanted === actual
  }
  // an option list is a pick, not a prefix: "male" must not also match "female"
  if (((field.options || []).length) > 0) return String(cell == null ? '' : cell) === String(value)
  return String(cell == null ? '' : cell).toLowerCase().indexOf(String(value).toLowerCase()) >= 0
}

/** Rows reduced by the free-text search (over `columnIds`) and every declared filter (= filterExternalRows). */
export function filterRestRows(rows, columnIds, filters, state) {
  const st = state || {}
  const searchText = String(st.searchText == null ? '' : st.searchText).trim().toLowerCase()
  const declared = (filters || []).map((f) => (f && f.metadata) || f).filter((f) => f && f.fieldId)
  if (searchText === '' && !declared.length) return rows
  return rows.filter((row) => {
    if (searchText !== '' && !columnIds.some((id) => String(row[id] == null ? '' : row[id]).toLowerCase().indexOf(searchText) >= 0)) return false
    return declared.every((field) => restMatchesFilter(row, field, st))
  })
}

/** Rows sorted by `[{field|fieldId, direction}]` in order (= sortExternalRows); blanks last. */
export function sortRestRows(rows, sort) {
  const keys = (Array.isArray(sort) ? sort : [])
    .map((s) => ({ id: (s && (s.fieldId || s.field)) || '', desc: !!s && (s.direction === 'descending' || s.direction === 'desc') }))
    .filter((k) => k.id !== '')
  if (!keys.length) return rows
  const compare = (a, b) => {
    const ab = restFilterBlank(a)
    const bb = restFilterBlank(b)
    if (ab || bb) return ab === bb ? 0 : ab ? 1 : -1
    if (typeof a === 'number' && typeof b === 'number') return a - b
    return String(a).localeCompare(String(b), undefined, { sensitivity: 'base', numeric: true })
  }
  return rows.slice().sort((x, y) => {
    for (const k of keys) {
      const c = compare(x[k.id], y[k.id])
      if (c !== 0) return k.desc ? -c : c
    }
    return 0
  })
}

// ── the listing ───────────────────────────────────────────────────────────────────────────────

/** The listing (Crud metadata) of a context's surface that reads its rows from a REST source. */
export function restListingOf(ctx) {
  const node = ctx && ctx.tree ? findFirst(ctx.tree, (n) => n && n.metadata && n.metadata.type === 'Crud') : null
  return node && node.metadata && node.metadata.rowsSource ? node : null
}

/** The fields a `rowRoute` template reads off the row (`people/${row.id}` → ['id']). */
export function rowRouteFieldsOf(template) {
  const out = []
  String(template || '').replace(/\$\{\s*row\.([A-Za-z0-9_$.]+)\s*\}/g, (all, path) => { out.push(path.split('.')[0]); return all })
  return out
}

/** What a REST row carries: the columns, plus what the rowRoute needs to address the record. */
export function restColumnIdsOf(md) {
  const ids = (md.columns || []).map((c) => (c && c.metadata ? c.metadata.id || c.id : c && c.id)).filter(Boolean)
  for (const id of rowRouteFieldsOf(md.rowRoute)) if (ids.indexOf(id) < 0) ids.push(id)
  return ids
}

/** The identifier column (stable `_rowNumber` across pages), if the listing declares one. */
const restIdentifierOf = (md) => {
  const col = (md.columns || []).map((c) => (c && c.metadata) || c).find((c) => c && c.identifier)
  return col ? col.id : undefined
}

const restIncrement = (fragments, messages = [], commands = []) => ({ commands, messages, fragments })

/** The page of a listing, as the server's `search` answers it (a data-only fragment, data.crud.page). */
export function restListingPage(md, fetched, total, state, serverPaged) {
  const columnIds = restColumnIdsOf(md)
  const identifier = restIdentifierOf(md)
  const rows = fetched.map((row, index) => ({
    ...row,
    _rowNumber: identifier != null && row[identifier] != null ? String(row[identifier]) : '_row:' + index,
  }))
  const st = state || {}
  const page = Number(st.page || 0)
  const serverAnswered = serverPaged && total != null
  const filtered = serverAnswered ? rows : sortRestRows(filterRestRows(rows, columnIds, md.filters, st), st.sort)
  const declaredSize = Number(md.pageSize) > 0 ? Number(md.pageSize) : Number(st.size) > 0 ? Number(st.size) : 0
  const size = declaredSize > 0 ? declaredSize : (filtered.length || 1)
  const content = serverAnswered ? filtered : filtered.slice(page * size, page * size + size)
  return { totalElements: serverAnswered ? total : filtered.length, pageSize: size, pageNumber: page, content }
}

/**
 * Answers the listing's `search`: the rows of its rowsSource — proxied through `__restfetch__`
 * (`_sourceKind: rows`) when the resolved source says so, direct otherwise; searched, filtered,
 * sorted and paged in memory unless the source pages server-side (declares a totalPath and is not
 * sampled). Resolves to the increment the reducer merges.
 */
export async function restRowsIncrement(ctx, node, componentState, opts = {}) {
  const md = node.metadata || node
  const src = md.rowsSource
  const columnIds = restColumnIdsOf(md)
  const sampled = isSampled(src)
  const serverPaged = totalPathOf(src) != null && !sampled
  let fetched = []
  let total = null
  try {
    if (viaProxy(src) && opts.server) {
      const inc = await opts.server({ _sourceKind: 'rows', _sourceId: node.id || 'crud' }, true)
      const appData = (inc && inc.appData) || {}
      if (appData._restfetchError) throw new Error('proxied rows failed')
      ;({ rows: fetched, total } = restPageOf(appData._restfetch, src, columnIds))
    } else {
      const json = await fetchRestJson(src, { state: componentState || {}, data: (ctx && ctx.data) || {}, appState: opts.appState || {} }, opts.fetchImpl)
      ;({ rows: fetched, total } = restPageOf(json, src, columnIds))
    }
  } catch (e) {
    try { console.warn('mateu: external rows fetch failed', e) } catch (ignored) { /* no console */ }
    fetched = []
    total = null
  }
  const page = restListingPage(md, fetched, total, componentState, serverPaged)
  return restIncrement([{ targetComponentId: (ctx && ((ctx.tree && ctx.tree.id) || ctx.id)) || '', data: { crud: { page } } }])
}

// ── field options ─────────────────────────────────────────────────────────────────────────────

/** The fields of a context with an optionsSource whose options are not loaded for the current url. */
export function restOptionFieldsOf(ctx, scope) {
  if (!ctx || !ctx.tree) return []
  const data = ctx.data || {}
  const out = []
  const seen = {}
  for (const f of collectFields(ctx.tree)) {
    if (!f.optionsSource || seen[f.fieldId]) continue
    seen[f.fieldId] = true
    const resolved = resolveRestSource(f.optionsSource) || {}
    let signature
    try { signature = (isSampled(f.optionsSource) ? 'sample:' : '') + String(interpolateRestUrl(resolved.url || resolved.ref || f.optionsSource.ref || '', scope)) } catch (e) { signature = 'refused' }
    const held = data[f.fieldId]
    if (held && held[LOOKUP_LOADED] && held.sourceSignature === signature) continue
    out.push({ field: f, signature })
  }
  return out
}

/**
 * Loads the options of every field of the context backed by an optionsSource (direct, or proxied
 * through `__restfetch__` with `_sourceKind: options`) into ctx.data[fieldId].content — where
 * optionsOf reads a select's options. Refetched only when the interpolated url changes. A source
 * that fails leaves the field with no options (and is not retried until its url changes).
 */
export async function loadRestOptions(reg, ctxId, opts = {}) {
  const ctx = reg && reg.contexts && reg.contexts[ctxId]
  if (!ctx) return reg
  const state = { ...(ctx.state || {}), ...(opts.draft || {}) }
  const scope = { state, data: ctx.data || {}, appState: opts.appState || {} }
  const pending = restOptionFieldsOf(ctx, scope)
  if (!pending.length) return reg
  const loaded = await Promise.all(pending.map(async ({ field, signature }) => {
    const src = field.optionsSource
    const resolved = resolveRestSource(src) || {}
    let content = []
    try {
      let json
      if (viaProxy(src) && opts.server) {
        const inc = await opts.server({ _sourceKind: 'options', _sourceId: field.fieldId }, true)
        const appData = (inc && inc.appData) || {}
        if (appData._restfetchError) throw new Error('proxied options failed')
        json = appData._restfetch
      } else {
        json = await fetchRestJson(src, scope, opts.fetchImpl)
      }
      content = mapItemsToOptions(json, resolved.itemsPath, resolved.valuePath, resolved.labelPath)
    } catch (e) {
      try { console.warn('mateu: external options fetch failed', e) } catch (ignored) { /* no console */ }
    }
    return { fieldId: field.fieldId, value: { content, totalElements: content.length, sourceSignature: signature, [LOOKUP_LOADED]: true } }
  }))
  const now = reg.contexts[ctxId]
  const data = { ...(now.data || {}) }
  for (const { fieldId, value } of loaded) data[fieldId] = value
  return { ...reg, contexts: { ...reg.contexts, [ctxId]: { ...now, data } } }
}

// ── REST actions (and the route's `data:` load, `__restdata__`) ──────────────────────────────

/** The restAction a context declares for this action id, or null. */
export function restActionOf(ctx, actionId) {
  const action = declaredActionOf(ctx, actionId)
  return action && action.restAction && action.restAction.source ? action.restAction : null
}

const restRouteOf = (r) => String(r || '').replace(/^\/+/, '').replace(/\/+$/, '').split('?')[0]

/**
 * Runs a restAction (= mateu-component handleRestAction) and answers with the increment the
 * reducer applies: on success the object at `resultPath` merged into the surface's state, the
 * interpolated `successMessage` as a toast and `successRoute` as a navigation (back to the route
 * already on screen: a re-run of the listing's search instead, or nothing would refresh); on
 * failure an error toast and nothing else. `forEachSelectedRow` runs once per checked row
 * (crud_selected_items) — in the browser for a direct source, as ONE proxied call otherwise.
 */
export async function runRestAction(ctx, actionId, rest, componentState, opts = {}) {
  const state = componentState || (ctx && ctx.state) || {}
  const data = (ctx && ctx.data) || {}
  const target = (ctx && ((ctx.tree && ctx.tree.id) || ctx.id)) || ''
  const kind = actionId === '__restdata__' ? 'data' : 'action'
  const isProxy = viaProxy(rest.source) && !!opts.server
  const failure = (status) => restIncrement([], [{ variant: 'error', text: 'Request failed' + (status > 0 ? ' (HTTP ' + status + ')' : '') }])
  const success = (json, mergeResult) => {
    const fragments = []
    let merged = state
    if (mergeResult && rest.resultPath != null) {
      const value = getByPath(json, rest.resultPath)
      if (value && typeof value === 'object') {
        merged = { ...state, ...value }
        fragments.push({ targetComponentId: target, state: value })
      }
    }
    const scope = { state: merged, data, appState: opts.appState || {} }
    const messages = []
    const commands = []
    const msg = interpolateRest(rest.successMessage, scope)
    if (msg) messages.push({ variant: 'success', text: msg })
    const route = interpolateRest(rest.successRoute, scope)
    if (route && route.indexOf('${') < 0) {
      if (opts.route != null && restRouteOf(route) === restRouteOf(opts.route)) {
        commands.push({ targetComponentId: target, type: 'RunAction', data: { actionId: 'search' } })
      } else {
        commands.push({ targetComponentId: target, type: 'NavigateTo', data: route })
      }
    }
    return restIncrement(fragments, messages, commands)
  }
  const fromProxy = (inc, mergeResult) => {
    const appData = (inc && inc.appData) || {}
    const err = appData._restfetchError
    if (err) return failure(typeof err.status === 'number' ? err.status : 0)
    return success(appData._restfetch, mergeResult)
  }

  if (rest.forEachSelectedRow) {
    const rows = state.crud_selected_items || []
    if (!rows.length) return restIncrement([], [{ variant: 'warning', text: 'Select rows first' }])
    try {
      if (isProxy) return fromProxy(await opts.server({ _sourceKind: kind, _sourceId: actionId, _forEachSelectedRow: true }, false), false)
      await Promise.all(rows.map((row) => fetchRestJson(rest.source, { state: { ...state, ...row }, row, data, appState: opts.appState || {} }, opts.fetchImpl)))
      return success(null, false)
    } catch (e) {
      return failure(e && e.status)
    }
  }
  try {
    if (isProxy) return fromProxy(await opts.server({ _sourceKind: kind, _sourceId: actionId }, kind === 'data'), true)
    const json = await fetchRestJson(rest.source, { state, data, appState: opts.appState || {} }, opts.fetchImpl)
    return success(json, true)
  } catch (e) {
    try { console.warn('mateu: rest action failed', e) } catch (ignored) { /* no console */ }
    return failure(e && e.status)
  }
}

// ── the transport hook ────────────────────────────────────────────────────────────────────────

/**
 * Whether an action of this context is answered from a REST source — and then the promise of its
 * increment; null when it is an ordinary Mateu action (it goes to the server as always).
 *
 * @param opts.server (parameters, idempotent) → Promise<increment>: the `__restfetch__` round trip
 * @param opts.route the route on screen (a successRoute back to it refreshes instead of navigating)
 */
export function restAnswerOf(ctx, actionId, componentState, opts = {}) {
  if (!ctx || !actionId) return null
  const rest = restActionOf(ctx, actionId)
  if (rest) return runRestAction(ctx, actionId, rest, componentState, opts)
  if (actionId === 'search') {
    const node = restListingOf(ctx)
    if (node) return restRowsIncrement(ctx, node, componentState || ctx.state || {}, opts)
  }
  return null
}
